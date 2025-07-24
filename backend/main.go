package main

import (
	"compress/gzip"
	"context"
	"embed"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"io/fs"
	"log"
	"net/http"
	"path/filepath"
	"slices"
	"strings"
	"sync"
	"time"

	"github.com/google/uuid"
	"github.com/redis/go-redis/v9"
)

const redisStreamName = "mvg-events"

//go:embed build
var staticFiles embed.FS

var clickhouseService *ClickHouseService

type Departure struct {
	PlannedDepartureTime  int      `json:"plannedDepartureTime"`
	RealtimeDepartureTime int      `json:"realtimeDepartureTime"`
	Label                 string   `json:"label"`
	DelayInMinutes        int      `json:"delayInMinutes"`
	Destination           string   `json:"destination"`
	Occupancy             string   `json:"occupancy"`
	Messages              []string `json:"messages"`
	Realtime              bool     `json:"realtime"`
}

func main() {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	eb := &EventBroadcaster{
		mu:      new(sync.Mutex),
		writers: make(map[string]http.ResponseWriter),
		redisClient: redis.NewClient(&redis.Options{
			Addr: "127.0.0.1:6379",
		}),
	}
	go eb.redisEventProcessor(ctx)

	// Initialize ClickHouse service (will be nil if connection fails)
	defer func() {
		if r := recover(); r != nil {
			log.Printf("Warning: ClickHouse connection failed: %v", r)
			log.Printf("Running in static-only mode")
		}
	}()
	clickhouseService = NewClickHouseService()

	// Setup static file serving
	setupStaticFileServer()

	// API routes with /api prefix
	http.HandleFunc("/api/line_delay", lineDelayHandler)
	http.HandleFunc("/api/global_delay", globalDelayGHandler)
	http.HandleFunc("/api/station_stats", stationStatsHandler)
	http.HandleFunc("/api/events", eb.sseHandler)
	http.HandleFunc("/api/health", healthHandler)
	log.Println("Server started on 127.0.0.1:8080")
	log.Fatal(http.ListenAndServe("127.0.0.1:8080", nil))

}

func extractRequiredParams(r *http.Request, keys []string) (map[string]string, error) {
	params := make(map[string]string, len(keys))
	q := r.URL.Query()
	for _, key := range keys {
		value := q.Get(key)
		if value == "" {
			return nil, fmt.Errorf("missing parameter: %s", key)
		}
		params[key] = value
	}
	return params, nil
}

func writeGzippedJSON(w http.ResponseWriter, v interface{}) error {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Content-Encoding", "gzip")
	gz := gzip.NewWriter(w)
	defer gz.Close()
	return json.NewEncoder(gz).Encode(v)
}

func globalDelayGHandler(w http.ResponseWriter, r *http.Request) {
	keys := []string{"date", "interval", "realtime", "threshold"}
	params, err := extractRequiredParams(r, keys)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if clickhouseService == nil {
		http.Error(w, "Database service unavailable", http.StatusServiceUnavailable)
		return
	}

	results, err := clickhouseService.LineQueries().GetGlobalDelay(params["date"], params["interval"], params["threshold"], params["realtime"])
	if err != nil {
		http.Error(w, "Error getting global delay: "+err.Error(), http.StatusInternalServerError)
		return
	}
	if err := writeGzippedJSON(w, results); err != nil {
		http.Error(w, "Error encoding JSON: "+err.Error(), http.StatusInternalServerError)
		return
	}
}
func healthHandler(w http.ResponseWriter, _ *http.Request) {
	w.WriteHeader(http.StatusOK)
	fmt.Fprintln(w, "OK")
}

func stationStatsHandler(w http.ResponseWriter, r *http.Request) {
	if clickhouseService == nil {
		http.Error(w, "Database service unavailable", http.StatusServiceUnavailable)
		return
	}
	
	keys := []string{"station"}
	params, err := extractRequiredParams(r, keys)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Get optional date parameters, default to last year if not provided
	q := r.URL.Query()
	startDate := q.Get("startDate")
	endDate := q.Get("endDate")
	
	// If no dates provided, default to last year
	if startDate == "" || endDate == "" {
		now := time.Now()
		endDate = now.Format("2006-01-02")
		startDate = now.AddDate(-1, 0, 0).Format("2006-01-02")
	}

	results, err := clickhouseService.StationStats().GetStationStats(params["station"], startDate, endDate)
	if err != nil {
		http.Error(w, "Error getting station stats: "+err.Error(), http.StatusInternalServerError)
		return
	}
	if err := writeGzippedJSON(w, results); err != nil {
		http.Error(w, "Error encoding JSON: "+err.Error(), http.StatusInternalServerError)
		return
	}
}

func lineDelayHandler(w http.ResponseWriter, r *http.Request) {
	keys := []string{"date", "south", "interval", "realtime", "label", "threshold"}
	params, err := extractRequiredParams(r, keys)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if clickhouseService == nil {
		http.Error(w, "Database service unavailable", http.StatusServiceUnavailable)
		return
	}

	results, err := clickhouseService.LineQueries().GetDelayForLine(
		params["date"],
		params["interval"],
		params["threshold"],
		params["label"],
		params["south"],
		params["realtime"],
	)
	if err != nil {
		http.Error(w, "Error getting line delay: "+err.Error(), http.StatusInternalServerError)
		return
	}
	if err := writeGzippedJSON(w, results); err != nil {
		http.Error(w, "Error encoding JSON: "+err.Error(), http.StatusInternalServerError)
		return
	}
}

func filterAndDedup(departures []Departure) []Departure {
	subwayDepartures := slices.DeleteFunc(departures, func(d Departure) bool {
		return !strings.HasPrefix(d.Label, "U")
	})
	if len(subwayDepartures) < 8 {
		return subwayDepartures
	}
	return subwayDepartures[:8]
}

type EventBroadcaster struct {
	mu          *sync.Mutex
	writers     map[string]http.ResponseWriter
	redisClient RedisClientInterface
}

func (eb *EventBroadcaster) redisEventProcessor(ctx context.Context) {
	sub := eb.redisClient.PSubscribe(ctx, "__keyevent*__:set")
	defer sub.Close()

	for {
		select {
		case <-ctx.Done():
			return
		case msg := <-sub.Channel():
			log.Printf("received redis keyevent %v\n", msg)
			stationID := strings.Split(msg.Payload, "_")[1]
			value, err := eb.redisClient.Get(ctx, msg.Payload).Result()
			if err != nil {
				log.Printf("failed to fetch redis key: %s\n", err)
				continue
			}

			var departures []Departure
			if err := json.Unmarshal([]byte(value), &departures); err != nil {
				log.Printf("failed to unmarshal departures: %s\n", err)
				continue
			}

			departures = filterAndDedup(departures)
			data := struct {
				Station      string      `json:"station"`
				FriendlyName string      `json:"friendlyName"`
				Coordinates  Coordinates `json:"coordinates"`
				Departures   []Departure `json:"departures"`
			}{
				Station:      stationID,
				FriendlyName: friendlyNames[stationID],
				Coordinates:  coordinates[stationID],
				Departures:   departures,
			}

			raw, err := json.Marshal(data)
			if err != nil {
				log.Printf("error marshal json (Call markus): %q\n", err)
				return
			}

			err = eb.redisClient.XAdd(ctx, &redis.XAddArgs{
				Stream: redisStreamName,
				Values: map[string]string{"json": string(raw)},
				ID:     "*",
				MaxLen: 200,
			}).Err()

			if err != nil {
				log.Printf("error sending to redis: %q", err)
				continue
			}
		}
	}
}

func (eb *EventBroadcaster) sseHandler(w http.ResponseWriter, r *http.Request) {
	// Set http headers required for SSE
	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")

	// You may need this locally for CORS requests
	w.Header().Set("Access-Control-Allow-Origin", "*")

	groupId := uuid.New().String()
	err := eb.redisClient.XGroupCreate(r.Context(), redisStreamName, groupId, "0").Err()
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("500"))
		return
	}
	log.Printf("added a new connection\n")
	for {
		res, err := eb.redisClient.XReadGroup(r.Context(), &redis.XReadGroupArgs{
			Streams:  []string{redisStreamName, ">"},
			Group:    groupId,
			Consumer: groupId,
			Count:    10,
			Block:    1 * time.Second,
			NoAck:    true,
		}).Result()

		if err != nil {
			if errors.Is(err, context.Canceled) {
				log.Printf("removed connection\n")
				return
			}

			if !errors.Is(err, redis.Nil) {
				log.Printf("error reading redis stream: %q\n", err)
			}
			continue
		}

		for _, message := range res[0].Messages {
			payload := message.Values["json"]

			_, err = fmt.Fprintf(w, "data: %s\n\n", payload)
			if err != nil {
				log.Printf("failed to write json to response-writer: %s\n", err)
			}
			w.(http.Flusher).Flush()
		}
	}
}

// setupStaticFileServer configures the static file serving for the SPA
func setupStaticFileServer() {
	// Get the embedded filesystem without the leading path
	frontendFS, err := fs.Sub(staticFiles, "build/client")
	if err != nil {
		log.Printf("Warning: Could not setup static files: %v", err)
		return
	}

	// Create a custom mux to handle static files with correct MIME types
	mux := http.NewServeMux()
	
	// Handle static assets with proper MIME types
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		
		// Skip API routes
		if strings.HasPrefix(r.URL.Path, "/api/") {
			http.NotFound(w, r)
			return
		}

		path := strings.TrimPrefix(r.URL.Path, "/")
		
		// Default to index.html for root
		if path == "" {
			path = "index.html"
		}
		
		
		// Check if file exists in embedded filesystem
		if fileInfo, err := fs.Stat(frontendFS, path); err == nil && !fileInfo.IsDir() {
			// File exists, serve it with correct MIME type
			file, err := frontendFS.Open(path)
			if err != nil {
				log.Printf("Error opening file %s: %v", path, err)
				http.NotFound(w, r)
				return
			}
			defer file.Close()
			
			// Determine MIME type
			ext := filepath.Ext(path)
			var contentType string
			
			switch ext {
			case ".js":
				contentType = "application/javascript; charset=utf-8"
			case ".mjs":
				contentType = "application/javascript; charset=utf-8"  
			case ".css":
				contentType = "text/css; charset=utf-8"
			case ".json":
				contentType = "application/json; charset=utf-8"
			case ".html":
				contentType = "text/html; charset=utf-8"
			case ".png":
				contentType = "image/png"
			case ".jpg", ".jpeg":
				contentType = "image/jpeg"
			case ".gif":
				contentType = "image/gif"
			case ".svg":
				contentType = "image/svg+xml"
			case ".woff":
				contentType = "font/woff"
			case ".woff2":
				contentType = "font/woff2"
			case ".ttf":
				contentType = "font/ttf"
			case ".wasm":
				contentType = "application/wasm"
			default:
				contentType = "application/octet-stream"
			}
			
			// Set headers before writing response
			w.Header().Set("Content-Type", contentType)
			
			// Set caching headers for assets
			if strings.HasPrefix(path, "assets/") {
				w.Header().Set("Cache-Control", "public, max-age=31536000, immutable")
			} else {
				w.Header().Set("Cache-Control", "public, max-age=0, must-revalidate")
			}
			
			
			// Copy file content
			_, err = io.Copy(w, file)
			if err != nil {
				log.Printf("Error copying file %s: %v", path, err)
			}
			return
		}
		
		// For SPA routing, serve index.html for non-existent routes
		// (except for obvious asset files that should return 404)
		ext := filepath.Ext(path)
		if ext == "" || ext == ".html" {
			// Serve index.html for SPA routes
			if indexFile, err := frontendFS.Open("index.html"); err == nil {
				defer indexFile.Close()
				w.Header().Set("Content-Type", "text/html; charset=utf-8")
				w.Header().Set("Cache-Control", "public, max-age=0, must-revalidate")
				
				io.Copy(w, indexFile)
				return
			}
		}
		
		// For other file extensions, return 404
		http.NotFound(w, r)
	})
	
	// This replaces the default handler
	http.Handle("/", mux)
}
