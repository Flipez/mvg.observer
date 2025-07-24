package main

// Data types for ClickHouse queries and responses

// LineDelayDay represents delay data for a specific line and day
type LineDelayDay struct {
	Station     string              `json:"station"`
	Name        string              `json:"name"`
	Stop        int32               `json:"stop"`
	Coordinates Coordinates         `json:"coordinates"`
	Buckets     []map[string]string `json:"buckets"`
}

// StationStats contains comprehensive statistics for a station
type StationStats struct {
	AvgDelay          float64       `json:"avgDelay"`
	TotalDepartures   uint64        `json:"totalDepartures"`
	DelayPercentage   float64       `json:"delayPercentage"`
	MonthlyStats      []MonthlyData `json:"monthlyStats"`
	HourlyStats       []HourlyData  `json:"hourlyStats"`
	DelayDistribution []DelayBucket `json:"delayDistribution"`
}

// MonthlyData represents aggregated monthly statistics
type MonthlyData struct {
	Month      string               `json:"month"`
	AvgDelay   float64              `json:"avgDelay"`
	Departures uint64               `json:"departures"`
	LineStats  map[string]LineStats `json:"lineStats"`
}

// HourlyData represents aggregated hourly statistics
type HourlyData struct {
	Hour       uint8                `json:"hour"`
	AvgDelay   float64              `json:"avgDelay"`
	Departures uint64               `json:"departures"`
	LineStats  map[string]LineStats `json:"lineStats"`
}

// LineStats contains statistics for a specific subway line
type LineStats struct {
	AvgDelay   float64 `json:"avgDelay"`
	Departures uint64  `json:"departures"`
}

// DelayBucket represents a delay distribution bucket
type DelayBucket struct {
	Range string `json:"range"`
	Count uint64 `json:"count"`
}