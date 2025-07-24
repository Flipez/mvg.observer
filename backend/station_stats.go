package main

import (
	"context"
	"fmt"
	"sort"

	"github.com/ClickHouse/clickhouse-go/v2/lib/driver"
)

// StationStatsService handles all station statistics operations
type StationStatsService struct {
	conn driver.Conn
}

// NewStationStatsService creates a new station statistics service
func NewStationStatsService(conn driver.Conn) *StationStatsService {
	return &StationStatsService{conn: conn}
}

// GetStationStats retrieves comprehensive statistics for a station within a date range
func (s *StationStatsService) GetStationStats(stationID, startDate, endDate string) (StationStats, error) {
	ctx := context.Background()
	
	// Validate inputs
	if err := validateDateRange(startDate, endDate); err != nil {
		return StationStats{}, fmt.Errorf("invalid date range: %w", err)
	}
	
	// Check if station has any data
	if err := s.validateStationExists(ctx, stationID); err != nil {
		return StationStats{}, fmt.Errorf("station validation failed: %w", err)
	}
	
	// Get basic statistics
	basicStats, err := s.getBasicStats(ctx, stationID, startDate, endDate)
	if err != nil {
		return StationStats{}, fmt.Errorf("failed to get basic stats: %w", err)
	}
	
	// Get monthly statistics
	monthlyStats, err := s.getMonthlyStats(ctx, stationID, startDate, endDate)
	if err != nil {
		return StationStats{}, fmt.Errorf("failed to get monthly stats: %w", err)
	}
	
	// Get hourly statistics
	hourlyStats, err := s.getHourlyStats(ctx, stationID, startDate, endDate)
	if err != nil {
		return StationStats{}, fmt.Errorf("failed to get hourly stats: %w", err)
	}
	
	// Get delay distribution
	delayDistribution, err := s.getDelayDistribution(ctx, stationID, startDate, endDate)
	if err != nil {
		return StationStats{}, fmt.Errorf("failed to get delay distribution: %w", err)
	}
	
	return StationStats{
		AvgDelay:          basicStats.AvgDelay,
		TotalDepartures:   basicStats.TotalDepartures,
		DelayPercentage:   basicStats.DelayPercentage,
		MonthlyStats:      monthlyStats,
		HourlyStats:       hourlyStats,
		DelayDistribution: delayDistribution,
	}, nil
}

// basicStatsResult holds basic station statistics
type basicStatsResult struct {
	AvgDelay        float64
	TotalDepartures uint64
	DelayPercentage float64
}

// validateStationExists checks if a station has any data in the database
func (s *StationStatsService) validateStationExists(ctx context.Context, stationID string) error {
	var totalCount uint64
	query := `SELECT count() FROM mvg.responses_dedup WHERE station = ?`
	
	err := s.conn.QueryRow(ctx, query, stationID).Scan(&totalCount)
	if err != nil {
		return fmt.Errorf("failed to check station existence: %w", err)
	}
	
	if totalCount == 0 {
		return fmt.Errorf("no data found for station %s", stationID)
	}
	
	return nil
}

// getBasicStats retrieves basic statistics for a station
func (s *StationStatsService) getBasicStats(ctx context.Context, stationID, startDate, endDate string) (basicStatsResult, error) {
	query := `
		SELECT 
			avg(delayInMinutes) as avgDelay,
			count() as totalDepartures,
			CASE 
				WHEN count() = 0 THEN 0.0
				ELSE (100.0 * countIf(delayInMinutes > 2)) / count()
			END as delayPercentage
		FROM mvg.responses_dedup 
		WHERE station = ? 
		AND plannedDepartureTime >= ? 
		AND plannedDepartureTime < ?
	`
	
	var result basicStatsResult
	err := s.conn.QueryRow(ctx, query, stationID, startDate, endDate).Scan(
		&result.AvgDelay, &result.TotalDepartures, &result.DelayPercentage)
	
	if err != nil {
		return basicStatsResult{}, fmt.Errorf("basic stats query failed: %w", err)
	}
	
	// Handle NaN values that might still occur from avg() with no data
	if result.TotalDepartures == 0 {
		result.AvgDelay = 0.0
		result.DelayPercentage = 0.0
	}
	
	return result, nil
}

// getMonthlyStats retrieves monthly statistics with line breakdown
func (s *StationStatsService) getMonthlyStats(ctx context.Context, stationID, startDate, endDate string) ([]MonthlyData, error) {
	// Get overall monthly stats
	monthlyQuery := `
		SELECT 
			formatDateTime(toStartOfMonth(plannedDepartureTime), '%Y-%m') as month,
			avg(delayInMinutes) as avgDelay,
			count() as departures
		FROM mvg.responses_dedup 
		WHERE station = ? 
		AND plannedDepartureTime >= ? 
		AND plannedDepartureTime < ?
		GROUP BY month
		ORDER BY month
	`
	
	monthlyRows, err := s.conn.Query(ctx, monthlyQuery, stationID, startDate, endDate)
	if err != nil {
		return nil, fmt.Errorf("monthly stats query failed: %w", err)
	}
	defer monthlyRows.Close()
	
	monthlyMap := make(map[string]*MonthlyData)
	for monthlyRows.Next() {
		var month string
		var avgDelay float64
		var departures uint64
		
		if err := monthlyRows.Scan(&month, &avgDelay, &departures); err != nil {
			continue
		}
		
		monthlyMap[month] = &MonthlyData{
			Month:      month,
			AvgDelay:   avgDelay,
			Departures: departures,
			LineStats:  make(map[string]LineStats),
		}
	}
	
	// Get line-specific monthly data
	if err := s.addMonthlyLineStats(ctx, stationID, startDate, endDate, monthlyMap); err != nil {
		return nil, fmt.Errorf("failed to add monthly line stats: %w", err)
	}
	
	// Convert map to sorted slice
	monthlyStats := make([]MonthlyData, 0, len(monthlyMap))
	for _, data := range monthlyMap {
		monthlyStats = append(monthlyStats, *data)
	}
	
	sort.Slice(monthlyStats, func(i, j int) bool {
		return monthlyStats[i].Month < monthlyStats[j].Month
	})
	
	return monthlyStats, nil
}

// addMonthlyLineStats adds line-specific statistics to monthly data
func (s *StationStatsService) addMonthlyLineStats(ctx context.Context, stationID, startDate, endDate string, monthlyMap map[string]*MonthlyData) error {
	monthlyLineQuery := `
		SELECT 
			formatDateTime(toStartOfMonth(plannedDepartureTime), '%Y-%m') as month,
			label,
			avg(delayInMinutes) as avgDelay,
			count() as departures
		FROM mvg.responses_dedup 
		WHERE station = ? 
		AND plannedDepartureTime >= ? 
		AND plannedDepartureTime < ?
		GROUP BY month, label
		ORDER BY month, label
	`
	
	monthlyLineRows, err := s.conn.Query(ctx, monthlyLineQuery, stationID, startDate, endDate)
	if err != nil {
		return fmt.Errorf("monthly line stats query failed: %w", err)
	}
	defer monthlyLineRows.Close()
	
	for monthlyLineRows.Next() {
		var month, label string
		var avgDelay float64
		var departures uint64
		
		if err := monthlyLineRows.Scan(&month, &label, &avgDelay, &departures); err != nil {
			continue
		}
		
		if monthlyData, exists := monthlyMap[month]; exists {
			monthlyData.LineStats[label] = LineStats{
				AvgDelay:   avgDelay,
				Departures: departures,
			}
		}
	}
	
	return nil
}

// getHourlyStats retrieves hourly statistics with line breakdown
func (s *StationStatsService) getHourlyStats(ctx context.Context, stationID, startDate, endDate string) ([]HourlyData, error) {
	// Get overall hourly stats
	hourlyQuery := `
		SELECT 
			toHour(plannedDepartureTime) as hour,
			avg(delayInMinutes) as avgDelay,
			count() as departures
		FROM mvg.responses_dedup 
		WHERE station = ? 
		AND plannedDepartureTime >= ? 
		AND plannedDepartureTime < ?
		GROUP BY hour
		ORDER BY hour
	`
	
	hourlyRows, err := s.conn.Query(ctx, hourlyQuery, stationID, startDate, endDate)
	if err != nil {
		return nil, fmt.Errorf("hourly stats query failed: %w", err)
	}
	defer hourlyRows.Close()
	
	hourlyMap := make(map[uint8]*HourlyData)
	for hourlyRows.Next() {
		var hour uint8
		var avgDelay float64
		var departures uint64
		
		if err := hourlyRows.Scan(&hour, &avgDelay, &departures); err != nil {
			continue
		}
		
		hourlyMap[hour] = &HourlyData{
			Hour:       hour,
			AvgDelay:   avgDelay,
			Departures: departures,
			LineStats:  make(map[string]LineStats),
		}
	}
	
	// Get line-specific hourly data
	if err := s.addHourlyLineStats(ctx, stationID, startDate, endDate, hourlyMap); err != nil {
		return nil, fmt.Errorf("failed to add hourly line stats: %w", err)
	}
	
	// Convert map to sorted slice
	hourlyStats := make([]HourlyData, 0, len(hourlyMap))
	for _, data := range hourlyMap {
		hourlyStats = append(hourlyStats, *data)
	}
	
	sort.Slice(hourlyStats, func(i, j int) bool {
		return hourlyStats[i].Hour < hourlyStats[j].Hour
	})
	
	return hourlyStats, nil
}

// addHourlyLineStats adds line-specific statistics to hourly data
func (s *StationStatsService) addHourlyLineStats(ctx context.Context, stationID, startDate, endDate string, hourlyMap map[uint8]*HourlyData) error {
	hourlyLineQuery := `
		SELECT 
			toHour(plannedDepartureTime) as hour,
			label,
			avg(delayInMinutes) as avgDelay,
			count() as departures
		FROM mvg.responses_dedup 
		WHERE station = ? 
		AND plannedDepartureTime >= ? 
		AND plannedDepartureTime < ?
		GROUP BY hour, label
		ORDER BY hour, label
	`
	
	hourlyLineRows, err := s.conn.Query(ctx, hourlyLineQuery, stationID, startDate, endDate)
	if err != nil {
		return fmt.Errorf("hourly line stats query failed: %w", err)
	}
	defer hourlyLineRows.Close()
	
	for hourlyLineRows.Next() {
		var hour uint8
		var label string
		var avgDelay float64
		var departures uint64
		
		if err := hourlyLineRows.Scan(&hour, &label, &avgDelay, &departures); err != nil {
			continue
		}
		
		if hourlyData, exists := hourlyMap[hour]; exists {
			hourlyData.LineStats[label] = LineStats{
				AvgDelay:   avgDelay,
				Departures: departures,
			}
		}
	}
	
	return nil
}

// getDelayDistribution retrieves delay distribution statistics
func (s *StationStatsService) getDelayDistribution(ctx context.Context, stationID, startDate, endDate string) ([]DelayBucket, error) {
	distributionQuery := `
		SELECT 
			CASE 
				WHEN delayInMinutes <= 0 THEN 'On Time'
				WHEN delayInMinutes <= 2 THEN '1-2 min'
				WHEN delayInMinutes <= 5 THEN '3-5 min'
				WHEN delayInMinutes <= 10 THEN '6-10 min'
				ELSE '10+ min'
			END as delayRange,
			count() as count
		FROM mvg.responses_dedup 
		WHERE station = ? 
		AND plannedDepartureTime >= ? 
		AND plannedDepartureTime < ?
		GROUP BY delayRange
		ORDER BY 
			CASE delayRange
				WHEN 'On Time' THEN 1
				WHEN '1-2 min' THEN 2
				WHEN '3-5 min' THEN 3
				WHEN '6-10 min' THEN 4
				WHEN '10+ min' THEN 5
			END
	`
	
	distributionRows, err := s.conn.Query(ctx, distributionQuery, stationID, startDate, endDate)
	if err != nil {
		return nil, fmt.Errorf("delay distribution query failed: %w", err)
	}
	defer distributionRows.Close()
	
	var delayDistribution []DelayBucket
	for distributionRows.Next() {
		var delayRange string
		var count uint64
		
		if err := distributionRows.Scan(&delayRange, &count); err != nil {
			continue
		}
		
		delayDistribution = append(delayDistribution, DelayBucket{
			Range: delayRange,
			Count: count,
		})
	}
	
	// Initialize empty slice if nil to prevent frontend null errors
	if delayDistribution == nil {
		delayDistribution = []DelayBucket{}
	}
	
	return delayDistribution, nil
}

