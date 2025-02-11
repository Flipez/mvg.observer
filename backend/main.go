package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"slices"
	"strings"
	"sync"

	"github.com/google/uuid"
	"github.com/redis/go-redis/v9"
)

type Departure struct {
	PlannedDepartureTime  int    `json:"plannedDepartureTime"`
	RealtimeDepartureTime int    `json:"realtimeDepartureTime"`
	Label                 string `json:"label"`
	DelayInMinutes        int    `json:"delayInMinutes"`
	Destination           string `json:"destination"`
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

	http.HandleFunc("/events", eb.sseHandler)
	log.Println("Server started on :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}

func filterAndDedup(departures []Departure) []Departure {
	seen := make(map[string]bool)
	return slices.DeleteFunc(
		departures,
		func(d Departure) bool {
			if !strings.HasPrefix(d.Label, "U") {
				return true
			}

			lookupKey := d.Label + d.Destination
			if _, ok := seen[lookupKey]; ok {
				return true
			}
			seen[lookupKey] = true
			return false
		},
	)
}

type EventBroadcaster struct {
	mu          *sync.Mutex
	writers     map[string]http.ResponseWriter
	redisClient *redis.Client
}

func (eb *EventBroadcaster) redisEventProcessor(ctx context.Context) {
	sub := eb.redisClient.PSubscribe(ctx, "__keyevent*__:*")
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
				Departures   []Departure `json:"departures"`
			}{
				Station:      stationID,
				FriendlyName: friendlyNames[stationID],
				Departures:   departures,
			}
			raw, err := json.Marshal(data)
			if err != nil {
				log.Printf("failed to marshal departures: %s\n", err)
				continue
			}

			eb.mu.Lock()
			for connID, rw := range eb.writers {
				log.Printf("send event to %q\n", connID)
				_, err := fmt.Fprintf(rw, "data: %s\n\n", raw)
				if err != nil {
					log.Printf("failed to write json to response-writer: %s\n", err)
				}
				rw.(http.Flusher).Flush()
			}
			eb.mu.Unlock()
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

	connID := uuid.New().String()
	eb.mu.Lock()
	eb.writers[connID] = w
	eb.mu.Unlock()
	log.Printf("added a new connection %q\n", connID)

	<-r.Context().Done()
	eb.mu.Lock()
	delete(eb.writers, connID)
	eb.mu.Unlock()
	log.Printf("removed connection %q\n", connID)
}
