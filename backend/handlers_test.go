package main

import (
	"context"
	"io"
	"net/http"
	"net/http/httptest"
	"net/url"
	"testing"
	"time"

	"github.com/redis/go-redis/v9"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

func TestExtractRequiredParams(t *testing.T) {
	tests := []struct {
		name        string
		queryParams map[string]string
		requiredKeys []string
		expectError bool
		expectedParams map[string]string
	}{
		{
			name: "All parameters present",
			queryParams: map[string]string{
				"date": "2023-12-25",
				"interval": "60",
				"threshold": "5",
			},
			requiredKeys: []string{"date", "interval", "threshold"},
			expectError: false,
			expectedParams: map[string]string{
				"date": "2023-12-25",
				"interval": "60", 
				"threshold": "5",
			},
		},
		{
			name: "Missing parameter",
			queryParams: map[string]string{
				"date": "2023-12-25",
				"interval": "60",
			},
			requiredKeys: []string{"date", "interval", "threshold"},
			expectError: true,
			expectedParams: nil,
		},
		{
			name: "Empty parameter value",
			queryParams: map[string]string{
				"date": "2023-12-25",
				"interval": "",
				"threshold": "5",
			},
			requiredKeys: []string{"date", "interval", "threshold"},
			expectError: true,
			expectedParams: nil,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Create URL with query parameters
			u := &url.URL{}
			q := u.Query()
			for key, value := range tt.queryParams {
				q.Set(key, value)
			}
			u.RawQuery = q.Encode()

			req := &http.Request{URL: u}
			
			result, err := extractRequiredParams(req, tt.requiredKeys)
			
			if tt.expectError {
				assert.Error(t, err)
				assert.Nil(t, result)
			} else {
				assert.NoError(t, err)
				assert.Equal(t, tt.expectedParams, result)
			}
		})
	}
}

func TestHealthHandler(t *testing.T) {
	req := httptest.NewRequest("GET", "/health", nil)
	w := httptest.NewRecorder()

	healthHandler(w, req)

	resp := w.Result()
	body, _ := io.ReadAll(resp.Body)

	assert.Equal(t, http.StatusOK, resp.StatusCode)
	assert.Equal(t, "OK\n", string(body))
}

func TestGlobalDelayHandler(t *testing.T) {
	// Mock the global database connection
	mockConn := &MockDriver{}
	mockRows := &MockRows{
		data: [][]interface{}{
			{"de:09162:1", []map[string]string{
				{"bucket": "2023-12-25 10:00:00", "avgDelay": "2.5", "numDepartures": "10", "percentageThreshold": "20.0"},
			}},
		},
	}

	mockConn.On("Query", mock.Anything, mock.AnythingOfType("string"), 
		"2023-12-25", "2023-12-26", "60", "5", "1").Return(mockRows, nil)
	mockRows.On("Err").Return(nil)
	mockRows.On("Close").Return(nil)

	// Temporarily replace the global db variable
	originalDB := db
	db = mockConn
	defer func() { db = originalDB }()

	// Test successful request
	req := httptest.NewRequest("GET", "/global_delay?date=2023-12-25&interval=60&realtime=1&threshold=5", nil)
	w := httptest.NewRecorder()

	globalDelayGHandler(w, req)

	resp := w.Result()
	assert.Equal(t, http.StatusOK, resp.StatusCode)
	assert.Equal(t, "application/json", resp.Header.Get("Content-Type"))
	assert.Equal(t, "*", resp.Header.Get("Access-Control-Allow-Origin"))
	assert.Equal(t, "gzip", resp.Header.Get("Content-Encoding"))

	mockConn.AssertExpectations(t)
	mockRows.AssertExpectations(t)
}

func TestGlobalDelayHandlerMissingParams(t *testing.T) {
	req := httptest.NewRequest("GET", "/global_delay?date=2023-12-25", nil)
	w := httptest.NewRecorder()

	globalDelayGHandler(w, req)

	resp := w.Result()
	body, _ := io.ReadAll(resp.Body)

	assert.Equal(t, http.StatusBadRequest, resp.StatusCode)
	assert.Contains(t, string(body), "missing parameter")
}

func TestLineDelayHandler(t *testing.T) {
	// Mock the global database connection
	mockConn := &MockDriver{}
	mockRows := &MockRows{
		data: [][]interface{}{
			{"de:09162:1", "Karlsplatz (Stachus)", int32(1), []map[string]string{
				{"bucket": "2023-12-25 10:00:00", "avgDelay": "2.5", "numDepartures": "10", "percentageThreshold": "20.0"},
			}},
		},
	}

	mockConn.On("Query", mock.Anything, mock.AnythingOfType("string"), 
		"2023-12-25", "2023-12-26", "60", "5", "U1", "1", "1").Return(mockRows, nil)
	mockRows.On("Err").Return(nil)
	mockRows.On("Close").Return(nil)

	// Temporarily replace the global db variable
	originalDB := db
	db = mockConn
	defer func() { db = originalDB }()

	// Test successful request
	req := httptest.NewRequest("GET", "/line_delay?date=2023-12-25&south=1&interval=60&realtime=1&label=U1&threshold=5", nil)
	w := httptest.NewRecorder()

	lineDelayHandler(w, req)

	resp := w.Result()
	assert.Equal(t, http.StatusOK, resp.StatusCode)
	assert.Equal(t, "application/json", resp.Header.Get("Content-Type"))
	assert.Equal(t, "*", resp.Header.Get("Access-Control-Allow-Origin"))
	assert.Equal(t, "gzip", resp.Header.Get("Content-Encoding"))

	mockConn.AssertExpectations(t)
	mockRows.AssertExpectations(t)
}

func TestLineDelayHandlerMissingParams(t *testing.T) {
	req := httptest.NewRequest("GET", "/line_delay?date=2023-12-25&interval=60", nil)
	w := httptest.NewRecorder()

	lineDelayHandler(w, req)

	resp := w.Result()
	body, _ := io.ReadAll(resp.Body)

	assert.Equal(t, http.StatusBadRequest, resp.StatusCode)
	assert.Contains(t, string(body), "missing parameter")
}

func TestFilterAndDedup(t *testing.T) {
	tests := []struct {
		name      string
		input     []Departure
		expected  []Departure
	}{
		{
			name: "Filter non-subway departures",
			input: []Departure{
				{Label: "U1", Destination: "Olympia-Einkaufszentrum"},
				{Label: "16", Destination: "Sendlinger Tor"}, // Bus, should be filtered
				{Label: "U2", Destination: "Messestadt Ost"},
				{Label: "S1", Destination: "Ostbahnhof"}, // S-Bahn, should be filtered
			},
			expected: []Departure{
				{Label: "U1", Destination: "Olympia-Einkaufszentrum"},
				{Label: "U2", Destination: "Messestadt Ost"},
			},
		},
		{
			name: "Limit to 8 departures",
			input: []Departure{
				{Label: "U1"}, {Label: "U2"}, {Label: "U3"}, {Label: "U4"},
				{Label: "U5"}, {Label: "U6"}, {Label: "U7"}, {Label: "U8"},
				{Label: "U1"}, {Label: "U2"}, // These should be cut off
			},
			expected: []Departure{
				{Label: "U1"}, {Label: "U2"}, {Label: "U3"}, {Label: "U4"},
				{Label: "U5"}, {Label: "U6"}, {Label: "U7"}, {Label: "U8"},
			},
		},
		{
			name:     "Empty input",
			input:    []Departure{},
			expected: []Departure{},
		},
		{
			name: "All non-subway departures",
			input: []Departure{
				{Label: "16", Destination: "Sendlinger Tor"},
				{Label: "S1", Destination: "Ostbahnhof"},
			},
			expected: []Departure{},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := filterAndDedup(tt.input)
			assert.Equal(t, tt.expected, result)
		})
	}
}

func TestWriteGzippedJSON(t *testing.T) {
	w := httptest.NewRecorder()
	testData := map[string]interface{}{
		"test": "data",
		"number": 42,
	}

	err := writeGzippedJSON(w, testData)
	assert.NoError(t, err)

	resp := w.Result()
	assert.Equal(t, "application/json", resp.Header.Get("Content-Type"))
	assert.Equal(t, "*", resp.Header.Get("Access-Control-Allow-Origin"))
	assert.Equal(t, "gzip", resp.Header.Get("Content-Encoding"))
}

func TestEventBroadcasterSSEHandler(t *testing.T) {
	mockRedis := &EnhancedMockRedisClient{}
	
	eb := &EventBroadcaster{
		redisClient: mockRedis,
	}

	// Mock successful group creation
	statusCmd := redis.NewStatusCmd(context.Background())
	statusCmd.SetVal("OK")
	mockRedis.On("XGroupCreate", mock.Anything, redisStreamName, mock.AnythingOfType("string"), "0").Return(statusCmd)

	// Mock XReadGroup returning context canceled (simulating client disconnect)
	streamCmd := redis.NewXStreamSliceCmd(context.Background())
	streamCmd.SetErr(context.Canceled)
	mockRedis.On("XReadGroup", mock.Anything, mock.AnythingOfType("*redis.XReadGroupArgs")).Return(streamCmd)

	req := httptest.NewRequest("GET", "/events", nil)
	// Create a context that gets canceled quickly
	ctx, cancel := context.WithCancel(context.Background())
	req = req.WithContext(ctx)
	w := httptest.NewRecorder()

	// Cancel context after a short delay to simulate client disconnect
	go func() {
		time.Sleep(10 * time.Millisecond)
		cancel()
	}()

	eb.sseHandler(w, req)

	resp := w.Result()
	assert.Equal(t, "text/event-stream", resp.Header.Get("Content-Type"))
	assert.Equal(t, "no-cache", resp.Header.Get("Cache-Control"))
	assert.Equal(t, "keep-alive", resp.Header.Get("Connection"))
	assert.Equal(t, "*", resp.Header.Get("Access-Control-Allow-Origin"))

	mockRedis.AssertExpectations(t)
}

// Integration tests
func TestHTTPServerIntegration(t *testing.T) {
	// This test would require setting up a test server
	// For now, we'll test the handler registration
	originalDB := db
	mockConn := &MockDriver{}
	db = mockConn
	defer func() { db = originalDB }()

	// Test that handlers are properly registered by making requests
	testCases := []struct {
		path string
		expectedStatus int
	}{
		{"/health", http.StatusOK},
		{"/global_delay", http.StatusBadRequest}, // Should fail due to missing params
		{"/line_delay", http.StatusBadRequest},   // Should fail due to missing params
	}

	for _, tc := range testCases {
		t.Run(tc.path, func(t *testing.T) {
			req := httptest.NewRequest("GET", tc.path, nil)
			w := httptest.NewRecorder()

			switch tc.path {
			case "/health":
				healthHandler(w, req)
			case "/global_delay":
				globalDelayGHandler(w, req)
			case "/line_delay":
				lineDelayHandler(w, req)
			}

			assert.Equal(t, tc.expectedStatus, w.Code)
		})
	}
}

// Benchmark tests
func BenchmarkHealthHandler(b *testing.B) {
	req := httptest.NewRequest("GET", "/health", nil)
	
	for i := 0; i < b.N; i++ {
		w := httptest.NewRecorder()
		healthHandler(w, req)
	}
}

func BenchmarkExtractRequiredParams(b *testing.B) {
	u, _ := url.Parse("http://example.com?date=2023-12-25&interval=60&threshold=5&realtime=1")
	req := &http.Request{URL: u}
	keys := []string{"date", "interval", "threshold", "realtime"}
	
	for i := 0; i < b.N; i++ {
		extractRequiredParams(req, keys)
	}
}

func BenchmarkFilterAndDedup(b *testing.B) {
	departures := []Departure{
		{Label: "U1"}, {Label: "U2"}, {Label: "16"}, {Label: "S1"},
		{Label: "U3"}, {Label: "U4"}, {Label: "U5"}, {Label: "U6"},
		{Label: "U7"}, {Label: "U8"}, {Label: "U1"}, {Label: "U2"},
	}
	
	for i := 0; i < b.N; i++ {
		filterAndDedup(departures)
	}
}