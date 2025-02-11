package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"

	"github.com/go-redis/redis/v8"
	"github.com/gorilla/mux"
)

type Departure struct {
	PlannedDepartureTime  int    `json:"plannedDepartureTime"`
	RealtimeDepartureTime int    `json:"realtimeDepartureTime"`
	Station               string `json:"station"`
	Label                 string `json:"label"`
	DelayInMinutes        int    `json:"delayInMinutes"`
	Destination           string `json:"destination"`
}

func sseHandler(w http.ResponseWriter, r *http.Request) {
	// Set http headers required for SSE
	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")

	// You may need this locally for CORS requests
	w.Header().Set("Access-Control-Allow-Origin", "*")

	sub := rdb.PSubscribe(ctx, "__keyevent*__:*")
	defer sub.Close()
	ch := sub.Channel()

	for msg := range ch {
		stationId := strings.Split(msg.Payload, "_")[1]
		value, _ := rdb.Get(ctx, msg.Payload).Result()

		var departures []Departure
		if err := json.Unmarshal([]byte(value), &departures); err != nil {
			panic(err)
		}

		enhancedDepartures := []Departure{}
		for _, departure := range departures {
			departure.Station = stationId

			enhancedDepartures = append(enhancedDepartures, departure)
		}

		b, err := json.Marshal(dedup(enhancedDepartures))
		if err != nil {
			log.Println(err)
		}

		log.Println(stationId)
		fmt.Fprintf(w, "data: %s\n\n", b)
		w.(http.Flusher).Flush()
	}

	// Simulate closing the connection
	closeNotify := w.(http.CloseNotifier).CloseNotify()
	<-closeNotify
}

var (
	ctx = context.Background()
	rdb = redis.NewClient(&redis.Options{
		Addr: "localhost:6379",
	})
)

func main() {
	r := mux.NewRouter()
	r.HandleFunc("/events", sseHandler)

	fs := http.FileServer(http.Dir("./web"))
	r.PathPrefix("/").Handler(fs)

	log.Println("Server started on :8080")
	log.Fatal(http.ListenAndServe(":8080", r))
}

func dedup(input []Departure) []Departure {
	lookup := make(map[string]bool)
	output := []Departure{}

	for _, departure := range input {
		lookupKey := departure.Label + departure.Destination

		if strings.HasPrefix(departure.Label, "U") {
			if _, ok := lookup[lookupKey]; !ok {
				lookup[lookupKey] = true
				output = append(output, departure)
			}
		}
	}

	return output
}
