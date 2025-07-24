package main

import (
	"context"
	"encoding/json"
	"testing"

	"github.com/redis/go-redis/v9"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

// MockPubSub implements redis.PubSub for testing
type MockPubSub struct {
	mock.Mock
	ch chan *redis.Message
}

func (m *MockPubSub) Channel() <-chan *redis.Message {
	return m.ch
}

func (m *MockPubSub) Close() error {
	args := m.Called()
	return args.Error(0)
}

// MockStringCmd implements redis.StringCmd for testing
type MockStringCmd struct {
	*redis.StringCmd
	val string
	err error
}

func NewMockStringCmd(val string, err error) *MockStringCmd {
	cmd := &MockStringCmd{
		StringCmd: redis.NewStringCmd(context.Background()),
		val:       val,
		err:       err,
	}
	if err != nil {
		cmd.StringCmd.SetErr(err)
	} else {
		cmd.StringCmd.SetVal(val)
	}
	return cmd
}

// MockStatusCmd implements redis.StatusCmd for testing
type MockStatusCmd struct {
	val string
	err error
}

func (m *MockStatusCmd) Result() (string, error) {
	return m.val, m.err
}

func (m *MockStatusCmd) Val() string {
	return m.val
}

func (m *MockStatusCmd) Err() error {
	return m.err
}

func (m *MockStatusCmd) SetVal(val string) {
	m.val = val
}

func (m *MockStatusCmd) SetErr(err error) {
	m.err = err
}

// MockXStreamSliceCmd implements redis.XStreamSliceCmd for testing
type MockXStreamSliceCmd struct {
	val []redis.XStream
	err error
}

func (m *MockXStreamSliceCmd) Result() ([]redis.XStream, error) {
	return m.val, m.err
}

func (m *MockXStreamSliceCmd) Val() []redis.XStream {
	return m.val
}

func (m *MockXStreamSliceCmd) Err() error {
	return m.err
}

func (m *MockXStreamSliceCmd) SetVal(val []redis.XStream) {
	m.val = val
}

func (m *MockXStreamSliceCmd) SetErr(err error) {
	m.err = err
}

// Enhanced MockRedisClient with all necessary methods
type EnhancedMockRedisClient struct {
	mock.Mock
}

func (m *EnhancedMockRedisClient) PSubscribe(ctx context.Context, channels ...string) *redis.PubSub {
	m.Called(ctx, channels)
	// Return a real PubSub instance, but this test will be skipped for simplicity
	pubsub := &redis.PubSub{}
	return pubsub
}

func (m *EnhancedMockRedisClient) Get(ctx context.Context, key string) *redis.StringCmd {
	args := m.Called(ctx, key)
	mockCmd := args.Get(0).(*MockStringCmd)
	return mockCmd.StringCmd
}

func (m *EnhancedMockRedisClient) XGroupCreate(ctx context.Context, stream, group, start string) *redis.StatusCmd {
	args := m.Called(ctx, stream, group, start)
	return args.Get(0).(*redis.StatusCmd)
}

func (m *EnhancedMockRedisClient) XReadGroup(ctx context.Context, a *redis.XReadGroupArgs) *redis.XStreamSliceCmd {
	args := m.Called(ctx, a)
	return args.Get(0).(*redis.XStreamSliceCmd)
}

func (m *EnhancedMockRedisClient) XAdd(ctx context.Context, a *redis.XAddArgs) *redis.StringCmd {
	args := m.Called(ctx, a)
	mockCmd := args.Get(0).(*MockStringCmd)
	return mockCmd.StringCmd
}

func TestEventBroadcasterRedisEventProcessor(t *testing.T) {
	// Skip this complex integration test for now
	// This would require extensive Redis PubSub mocking
	t.Skip("Skipping complex Redis PubSub test - would need real Redis instance for full integration test")
}

func TestEventBroadcasterWithFilteredData(t *testing.T) {
	// Test data with mixed departures (U-Bahn and others)
	testDepartures := []Departure{
		{Label: "U1", Destination: "Olympia-Einkaufszentrum"},
		{Label: "16", Destination: "Sendlinger Tor"}, // Bus - should be filtered
		{Label: "U2", Destination: "Messestadt Ost"},
		{Label: "S1", Destination: "Ostbahnhof"}, // S-Bahn - should be filtered
		{Label: "U3", Destination: "Fürstenried West"},
	}

	// Apply filtering directly
	filteredDepartures := filterAndDedup(testDepartures)
	
	// Verify only U-Bahn departures remain
	assert.Len(t, filteredDepartures, 3)
	for _, dep := range filteredDepartures {
		assert.True(t, dep.Label[0] == 'U', "Only U-Bahn departures should remain")
	}

	// Test the data structure that would be sent to Redis
	stationID := "de:09162:1"
	data := struct {
		Station      string      `json:"station"`
		FriendlyName string      `json:"friendlyName"`
		Coordinates  Coordinates `json:"coordinates"`
		Departures   []Departure `json:"departures"`
	}{
		Station:      stationID,
		FriendlyName: friendlyNames[stationID],
		Coordinates:  coordinates[stationID],
		Departures:   filteredDepartures,
	}

	raw, err := json.Marshal(data)
	assert.NoError(t, err)

	// Verify the JSON structure
	var resultData struct {
		Station      string      `json:"station"`
		FriendlyName string      `json:"friendlyName"`
		Coordinates  Coordinates `json:"coordinates"`
		Departures   []Departure `json:"departures"`
	}
	
	err = json.Unmarshal(raw, &resultData)
	assert.NoError(t, err)
	assert.Equal(t, "de:09162:1", resultData.Station)
	assert.Equal(t, "Karlsplatz (Stachus)", resultData.FriendlyName)
	assert.Len(t, resultData.Departures, 3)
}

func TestEventBroadcasterSSEStreamReading(t *testing.T) {
	t.Skip("Skipping complex Redis stream test - would need detailed Redis stream mocking")
}

func TestDepartureStructure(t *testing.T) {
	departure := Departure{
		PlannedDepartureTime:  1640178000,
		RealtimeDepartureTime: 1640178120,
		Label:                 "U1",
		DelayInMinutes:        2,
		Destination:           "Olympia-Einkaufszentrum",
		Occupancy:             "medium",
		Messages:              []string{"Verzögerung"},
		Realtime:              true,
	}

	// Test JSON marshaling/unmarshaling
	data, err := json.Marshal(departure)
	assert.NoError(t, err)

	var unmarshaled Departure
	err = json.Unmarshal(data, &unmarshaled)
	assert.NoError(t, err)

	assert.Equal(t, departure, unmarshaled)
}

func TestRedisStreamConfiguration(t *testing.T) {
	assert.Equal(t, "mvg-events", redisStreamName)
}

// Benchmark tests
func BenchmarkDepartureJSONMarshal(b *testing.B) {
	departures := []Departure{
		{Label: "U1", Destination: "Test", DelayInMinutes: 2},
		{Label: "U2", Destination: "Test", DelayInMinutes: 0},
	}

	for i := 0; i < b.N; i++ {
		json.Marshal(departures)
	}
}

func BenchmarkDepartureJSONUnmarshal(b *testing.B) {
	data := `[{"plannedDepartureTime":1640178000,"realtimeDepartureTime":1640178120,"label":"U1","delayInMinutes":2,"destination":"Test","occupancy":"medium","messages":[],"realtime":true}]`
	
	for i := 0; i < b.N; i++ {
		var departures []Departure
		json.Unmarshal([]byte(data), &departures)
	}
}

func BenchmarkFilterAndDedupLarge(b *testing.B) {
	// Create a large slice with mixed departures
	departures := make([]Departure, 100)
	for i := 0; i < 100; i++ {
		if i%3 == 0 {
			departures[i] = Departure{Label: "U" + string(rune(49+i%8))} // U1-U8
		} else if i%3 == 1 {
			departures[i] = Departure{Label: "S" + string(rune(49+i%8))} // S1-S8
		} else {
			departures[i] = Departure{Label: string(rune(49+i%10))} // Bus lines
		}
	}

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		filterAndDedup(departures)
	}
}