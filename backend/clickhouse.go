package main

import (
	"github.com/ClickHouse/clickhouse-go/v2/lib/driver"
)

// ClickHouseService provides unified access to all ClickHouse operations
type ClickHouseService struct {
	conn        driver.Conn
	stationStats *StationStatsService
	lineQueries  *LineQueryService
}

// NewClickHouseService creates a new service with database connection
func NewClickHouseService() *ClickHouseService {
	conn := connectClickhouse()
	return &ClickHouseService{
		conn:         conn,
		stationStats: NewStationStatsService(conn),
		lineQueries:  NewLineQueryService(conn),
	}
}

// StationStats returns the station statistics service
func (s *ClickHouseService) StationStats() *StationStatsService {
	return s.stationStats
}

// LineQueries returns the line queries service
func (s *ClickHouseService) LineQueries() *LineQueryService {
	return s.lineQueries
}

// Close closes the database connection
func (s *ClickHouseService) Close() error {
	if s.conn != nil {
		return s.conn.Close()
	}
	return nil
}