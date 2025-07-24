package main

import (
	"context"
	"testing"

	"github.com/ClickHouse/clickhouse-go/v2/lib/driver"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

// MockDriver implements the driver.Conn interface for testing
type MockDriver struct {
	mock.Mock
}

func (m *MockDriver) Query(ctx context.Context, query string, args ...interface{}) (driver.Rows, error) {
	mockArgs := []interface{}{ctx, query}
	mockArgs = append(mockArgs, args...)
	results := m.Called(mockArgs...)
	return results.Get(0).(driver.Rows), results.Error(1)
}

func (m *MockDriver) QueryRow(ctx context.Context, query string, args ...interface{}) driver.Row {
	mockArgs := []interface{}{ctx, query}
	mockArgs = append(mockArgs, args...)
	results := m.Called(mockArgs...)
	return results.Get(0).(driver.Row)
}

func (m *MockDriver) Exec(ctx context.Context, query string, args ...interface{}) error {
	mockArgs := []interface{}{ctx, query}
	mockArgs = append(mockArgs, args...)
	results := m.Called(mockArgs...)
	return results.Error(0)
}

func (m *MockDriver) AsyncInsert(ctx context.Context, query string, wait bool, args ...interface{}) error {
	mockArgs := []interface{}{ctx, query, wait}
	mockArgs = append(mockArgs, args...)
	results := m.Called(mockArgs...)
	return results.Error(0)
}

func (m *MockDriver) PrepareBatch(ctx context.Context, query string, opts ...driver.PrepareBatchOption) (driver.Batch, error) {
	results := m.Called(ctx, query, opts)
	return results.Get(0).(driver.Batch), results.Error(1)
}

func (m *MockDriver) Select(ctx context.Context, dest interface{}, query string, args ...interface{}) error {
	mockArgs := []interface{}{ctx, dest, query}
	mockArgs = append(mockArgs, args...)
	results := m.Called(mockArgs...)
	return results.Error(0)
}

func (m *MockDriver) Ping(ctx context.Context) error {
	results := m.Called(ctx)
	return results.Error(0)
}

func (m *MockDriver) Stats() driver.Stats {
	results := m.Called()
	return results.Get(0).(driver.Stats)
}

func (m *MockDriver) Close() error {
	results := m.Called()
	return results.Error(0)
}

func (m *MockDriver) ServerVersion() (*driver.ServerVersion, error) {
	results := m.Called()
	return results.Get(0).(*driver.ServerVersion), results.Error(1)
}

func (m *MockDriver) Contributors() []string {
	results := m.Called()
	return results.Get(0).([]string)
}

// MockRows implements the driver.Rows interface for testing
type MockRows struct {
	mock.Mock
	data [][]interface{}
	pos  int
}

func (m *MockRows) Next() bool {
	if m.pos < len(m.data) {
		m.pos++
		return true
	}
	return false
}

func (m *MockRows) Scan(dest ...interface{}) error {
	if m.pos == 0 || m.pos > len(m.data) {
		return assert.AnError
	}
	row := m.data[m.pos-1]
	for i, val := range row {
		if i < len(dest) {
			switch d := dest[i].(type) {
			case *string:
				*d = val.(string)
			case *[]map[string]string:
				*d = val.([]map[string]string)
			case *int32:
				*d = val.(int32)
			}
		}
	}
	return nil
}

func (m *MockRows) ScanStruct(dest interface{}) error {
	results := m.Called(dest)
	return results.Error(0)
}

func (m *MockRows) ColumnTypes() []driver.ColumnType {
	results := m.Called()
	return results.Get(0).([]driver.ColumnType)
}

func (m *MockRows) Totals(dest ...interface{}) error {
	results := m.Called(dest)
	return results.Error(0)
}

func (m *MockRows) Columns() []string {
	results := m.Called()
	return results.Get(0).([]string)
}

func (m *MockRows) Close() error {
	results := m.Called()
	return results.Error(0)
}

func (m *MockRows) Err() error {
	results := m.Called()
	return results.Error(0)
}

func TestGetDayRange(t *testing.T) {
	tests := []struct {
		name        string
		input       string
		expectStart string
		expectEnd   string
		expectError bool
	}{
		{
			name:        "Valid date",
			input:       "2023-12-25",
			expectStart: "2023-12-25",
			expectEnd:   "2023-12-26",
			expectError: false,
		},
		{
			name:        "Invalid date format",
			input:       "2023/12/25",
			expectStart: "",
			expectEnd:   "",
			expectError: true,
		},
		{
			name:        "Empty string",
			input:       "",
			expectStart: "",
			expectEnd:   "",
			expectError: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			start, end, err := getDayRange(tt.input)
			
			if tt.expectError {
				if err == nil {
				t.Errorf("Expected error but got none")
			}
				assert.Empty(t, start)
				assert.Empty(t, end)
			} else {
				assert.NoError(t, err)
				assert.Equal(t, tt.expectStart, start)
				assert.Equal(t, tt.expectEnd, end)
			}
		})
	}
}

func TestGetGlobalDelay(t *testing.T) {
	mockConn := &MockDriver{}
	mockRows := &MockRows{
		data: [][]interface{}{
			{"de:09162:1", []map[string]string{
				{"bucket": "2023-12-25 10:00:00", "avgDelay": "2.5", "numDepartures": "10", "percentageThreshold": "20.0"},
				{"bucket": "2023-12-25 11:00:00", "avgDelay": "3.2", "numDepartures": "15", "percentageThreshold": "33.3"},
			}},
			{"de:09162:2", []map[string]string{
				{"bucket": "2023-12-25 10:00:00", "avgDelay": "1.8", "numDepartures": "8", "percentageThreshold": "12.5"},
			}},
		},
	}

	mockConn.On("Query", mock.Anything, mock.AnythingOfType("string"), 
		"2023-12-25", "2023-12-26", "60", "5", "1").Return(mockRows, nil)
	mockRows.On("Err").Return(nil)
	mockRows.On("Close").Return(nil)

	service := &ClickHouseService{
		conn: mockConn,
		lineQueries: NewLineQueryService(mockConn),
	}
	results, err := service.LineQueries().GetGlobalDelay("2023-12-25", "60", "5", "1")
	assert.NoError(t, err)

	assert.Len(t, results, 2)
	assert.Equal(t, "de:09162:1", results[0].Station)
	assert.Len(t, results[0].Buckets, 2)
	assert.Equal(t, "de:09162:2", results[1].Station)
	assert.Len(t, results[1].Buckets, 1)

	mockConn.AssertExpectations(t)
	mockRows.AssertExpectations(t)
}

func TestGetDelayForLine(t *testing.T) {
	mockConn := &MockDriver{}
	mockRows := &MockRows{
		data: [][]interface{}{
			{"de:09162:1", "Karlsplatz (Stachus)", int32(1), []map[string]string{
				{"bucket": "2023-12-25 10:00:00", "avgDelay": "2.5", "numDepartures": "10", "percentageThreshold": "20.0"},
			}},
			{"de:09162:2", "Marienplatz", int32(2), []map[string]string{
				{"bucket": "2023-12-25 10:00:00", "avgDelay": "1.8", "numDepartures": "8", "percentageThreshold": "12.5"},
			}},
		},
	}

	mockConn.On("Query", mock.Anything, mock.AnythingOfType("string"), 
		"2023-12-25", "2023-12-26", "60", "5", "U1", "1", "1").Return(mockRows, nil)
	mockRows.On("Err").Return(nil)
	mockRows.On("Close").Return(nil)

	service := &ClickHouseService{
		conn: mockConn,
		lineQueries: NewLineQueryService(mockConn),
	}
	results, err := service.LineQueries().GetDelayForLine("2023-12-25", "60", "5", "U1", "1", "1")
	assert.NoError(t, err)

	assert.Len(t, results, 2)
	assert.Equal(t, "de:09162:1", results[0].Station)
	assert.Equal(t, "Karlsplatz (Stachus)", results[0].Name)
	assert.Equal(t, int32(1), results[0].Stop)
	assert.Equal(t, "de:09162:2", results[1].Station)
	assert.Equal(t, "Marienplatz", results[1].Name)
	assert.Equal(t, int32(2), results[1].Stop)

	mockConn.AssertExpectations(t)
	mockRows.AssertExpectations(t)
}

// Benchmark tests for performance
func BenchmarkGetDayRange(b *testing.B) {
	for i := 0; i < b.N; i++ {
		getDayRange("2023-12-25")
	}
}

func BenchmarkGetGlobalDelayParsing(b *testing.B) {
	mockConn := &MockDriver{}
	mockRows := &MockRows{
		data: make([][]interface{}, 100), // Simulate 100 stations
	}
	
	// Fill with test data
	for i := 0; i < 100; i++ {
		mockRows.data[i] = []interface{}{
			"de:09162:" + string(rune(i)),
			[]map[string]string{
				{"bucket": "2023-12-25 10:00:00", "avgDelay": "2.5", "numDepartures": "10", "percentageThreshold": "20.0"},
			},
		}
	}

	mockConn.On("Query", mock.Anything, mock.AnythingOfType("string"), 
		mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything).Return(mockRows, nil)
	mockRows.On("Err").Return(nil)
	mockRows.On("Close").Return(nil)

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		service := &ClickHouseService{
			conn: mockConn,
			lineQueries: NewLineQueryService(mockConn),
		}
		_, err := service.LineQueries().GetGlobalDelay("2023-12-25", "60", "5", "1")
		if err == nil {
			b.Errorf("Expected error but got none")
		}
	}
}