package main

import (
	"compress/gzip"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"slices"
	"strings"
	"sync"
	"time"

	"github.com/ClickHouse/clickhouse-go/v2/lib/driver"
	"github.com/google/uuid"
	"github.com/redis/go-redis/v9"
)

const redisStreamName = "mvg-events"

var db driver.Conn

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

	db = connectClickhouse()

	http.HandleFunc("/line_delay", lineDelayHandler)
	http.HandleFunc("/global_delay", globalDelayGHandler)
	http.HandleFunc("/events", eb.sseHandler)
	http.HandleFunc("/health", healthHandler)
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

	results := getGlobalDelay(params["date"], params["interval"], params["threshold"], params["realtime"], db)
	if err := writeGzippedJSON(w, results); err != nil {
		http.Error(w, "Error encoding JSON: "+err.Error(), http.StatusInternalServerError)
		return
	}
}
func healthHandler(w http.ResponseWriter, _ *http.Request) {
	w.WriteHeader(http.StatusOK)
	fmt.Fprintln(w, "OK")
}

func lineDelayHandler(w http.ResponseWriter, r *http.Request) {
	keys := []string{"date", "south", "interval", "realtime", "label", "threshold"}
	params, err := extractRequiredParams(r, keys)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	results := getDelayForLine(
		params["date"],
		params["interval"],
		params["threshold"],
		params["label"],
		params["south"],
		params["realtime"],
		db,
	)
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
	redisClient *redis.Client
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
