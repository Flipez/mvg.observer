package main

import (
	"testing"

	"github.com/ClickHouse/clickhouse-go/v2/lib/driver"
)

// TestHelper provides common test utilities
type TestHelper struct {
	t *testing.T
}

func NewTestHelper(t *testing.T) *TestHelper {
	return &TestHelper{t: t}
}

// CreateSampleDepartures creates test departure data
func (h *TestHelper) CreateSampleDepartures() []Departure {
	return []Departure{
		{
			PlannedDepartureTime:  1640178000,
			RealtimeDepartureTime: 1640178120,
			Label:                 "U1",
			DelayInMinutes:        2,
			Destination:           "Olympia-Einkaufszentrum",
			Occupancy:             "medium",
			Messages:              []string{},
			Realtime:              true,
		},
		{
			PlannedDepartureTime:  1640178300,
			RealtimeDepartureTime: 1640178300,
			Label:                 "16", // Bus line - should be filtered
			DelayInMinutes:        0,
			Destination:           "Sendlinger Tor",
			Occupancy:             "low",
			Messages:              []string{},
			Realtime:              true,
		},
		{
			PlannedDepartureTime:  1640178600,
			RealtimeDepartureTime: 1640178600,
			Label:                 "U2",
			DelayInMinutes:        0,
			Destination:           "Messestadt Ost",
			Occupancy:             "high",
			Messages:              []string{},
			Realtime:              true,
		},
	}
}

// CreateSampleLineDelayData creates test data for line delay queries
func (h *TestHelper) CreateSampleLineDelayData() []LineDelayDay {
	return []LineDelayDay{
		{
			Station: "de:09162:1",
			Name:    "Karlsplatz (Stachus)",
			Stop:    1,
			Coordinates: Coordinates{
				Longitude: "11.56613",
				Latitude:  "48.13951",
			},
			Buckets: []map[string]string{
				{
					"bucket":              "2023-12-25 10:00:00",
					"avgDelay":            "2.5",
					"numDepartures":       "10",
					"percentageThreshold": "20.0",
				},
				{
					"bucket":              "2023-12-25 11:00:00",
					"avgDelay":            "3.2",
					"numDepartures":       "15",
					"percentageThreshold": "33.3",
				},
			},
		},
		{
			Station: "de:09162:2",
			Name:    "Marienplatz",
			Stop:    2,
			Coordinates: Coordinates{
				Longitude: "11.57542",
				Latitude:  "48.13725",
			},
			Buckets: []map[string]string{
				{
					"bucket":              "2023-12-25 10:00:00",
					"avgDelay":            "1.8",
					"numDepartures":       "8",
					"percentageThreshold": "12.5",
				},
			},
		},
	}
}


// DatabaseQuery represents expected database query parameters for testing
type DatabaseQuery struct {
	Args []interface{}
}

// TestConfig holds test configuration
type TestConfig struct {
	RedisAddr      string
	ClickHouseAddr string
	TestTimeout    int // seconds
}

func DefaultTestConfig() *TestConfig {
	return &TestConfig{
		RedisAddr:      "127.0.0.1:6379",
		ClickHouseAddr: "127.0.0.1:9000", 
		TestTimeout:    30,
	}
}

// Integration test helpers for future use
type IntegrationTestHelper struct {
	Config *TestConfig
}

func NewIntegrationTestHelper() *IntegrationTestHelper {
	return &IntegrationTestHelper{
		Config: DefaultTestConfig(),
	}
}

// SetupTestDatabase would set up a test database (for integration tests)
func (h *IntegrationTestHelper) SetupTestDatabase() driver.Conn {
	// This would be implemented for integration tests
	// For now, return nil as we're focusing on unit tests
	return nil
}

// CleanupTestDatabase would clean up test database
func (h *IntegrationTestHelper) CleanupTestDatabase(conn driver.Conn) {
	// Implementation for cleaning up test data
}

// IsIntegrationTest checks if integration tests should run
func IsIntegrationTest() bool {
	// Check for environment variable or build tag
	// For now, always return false for unit tests only
	return false
}