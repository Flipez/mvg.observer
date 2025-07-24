package main

import (
	"context"
	"fmt"

	"github.com/ClickHouse/clickhouse-go/v2/lib/driver"
)

// LineQueryService handles queries related to subway line delays
type LineQueryService struct {
	conn driver.Conn
}

// NewLineQueryService creates a new line query service
func NewLineQueryService(conn driver.Conn) *LineQueryService {
	return &LineQueryService{conn: conn}
}

// GetGlobalDelay retrieves global delay data for all stations
func (s *LineQueryService) GetGlobalDelay(day, interval, threshold, realtime string) ([]LineDelayDay, error) {
	start, end, err := getDayRange(day)
	if err != nil {
		return nil, fmt.Errorf("invalid day format: %w", err)
	}

	query := `
		WITH
			? AS startDate,
			? AS endDate,
			? AS intervalMin,
			? AS thresholdMin,
			? AS isRealtime
		SELECT
			station,
			arrayMap(x -> map(
				'bucket', toString(x.1), 
				'avgDelay', toString(x.2), 
				'numDepartures', toString(x.3), 
				'percentageThreshold', toString(x.4)
			), groupArray((bucket, avgDelay, numDepartures, percentageThreshold))) AS buckets
		FROM (
			SELECT
				responses_dedup.station AS station,
				toStartOfInterval(plannedDepartureTime, toIntervalMinute(intervalMin)) AS bucket,
				avg(delayInMinutes) AS avgDelay,
				count() AS numDepartures,
				(100.0 * countIf(delayInMinutes > thresholdMin)) / count() AS percentageThreshold
			FROM mvg.responses_dedup
			WHERE (plannedDepartureTime >= startDate) 
			AND (plannedDepartureTime < endDate) 
			AND ((isRealtime = 0) OR (realtime = 1))
			GROUP BY responses_dedup.station, bucket
			ORDER BY bucket ASC
		)
		GROUP BY station
	`

	rows, err := s.conn.Query(context.Background(), query, start, end, interval, threshold, realtime)
	if err != nil {
		return nil, fmt.Errorf("global delay query failed: %w", err)
	}
	defer rows.Close()

	var results []LineDelayDay
	for rows.Next() {
		var station string
		var buckets []map[string]string

		if err := rows.Scan(&station, &buckets); err != nil {
			continue
		}

		results = append(results, LineDelayDay{
			Station:     station,
			Buckets:     buckets,
			Coordinates: coordinates[station],
		})
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating global delay results: %w", err)
	}

	return results, nil
}

// GetDelayForLine retrieves delay data for a specific subway line
func (s *LineQueryService) GetDelayForLine(day, interval, threshold, label, isSouth, realtime string) ([]LineDelayDay, error) {
	start, end, err := getDayRange(day)
	if err != nil {
		return nil, fmt.Errorf("invalid day format: %w", err)
	}

	query := `
		WITH
			? AS startDate,
			? AS endDate,
			? AS intervalMin,
			? AS thresholdMin,
			? AS filterLabel,
			? AS isSouth,
			? AS isRealtime
		SELECT
			station,
			name,
			stop,
			arrayMap(
				x -> map(
					'bucket', toString(x.1),
					'avgDelay', toString(x.2),
					'numDepartures', toString(x.3),
					'percentageThreshold', toString(x.4)
				),
				groupArray((bucket, avgDelay, numDepartures, percentageThreshold))
			) AS buckets
		FROM (
			SELECT
				responses_dedup.station AS station,
				thisStation.name AS name,
				thisStation.stop AS stop,
				toStartOfInterval(plannedDepartureTime, toIntervalMinute(intervalMin)) AS bucket,
				avg(delayInMinutes) AS avgDelay,
				count() AS numDepartures,
				(100.0 * countIf(delayInMinutes > thresholdMin)) / count() AS percentageThreshold
			FROM mvg.responses_dedup
			INNER JOIN mvg.lines as thisStation ON (
				responses_dedup.station = thisStation.station 
				AND responses_dedup.label = thisStation.label
			)
			LEFT JOIN mvg.lines as destStation ON (
				responses_dedup.destination = destStation.name 
				AND responses_dedup.label = thisStation.label
			)
			WHERE plannedDepartureTime >= startDate 
			AND plannedDepartureTime < endDate
			AND responses_dedup.label = filterLabel
			AND (
				(destStation.stop IS NOT NULL AND (thisStation.stop < destStation.stop) = isSouth)
				OR (destStation.stop IS NULL AND isSouth = 0 AND thisStation.stop = (
					SELECT max(stop) FROM mvg.lines WHERE label = filterLabel
				))
				OR (destStation.stop IS NULL AND isSouth = 1 AND thisStation.stop = (
					SELECT min(stop) FROM mvg.lines WHERE label = filterLabel
				))
			)
			AND (isRealtime = 0 OR realtime = 1)
			GROUP BY responses_dedup.station, bucket, thisStation.name, thisStation.stop
			ORDER BY bucket
		)
		GROUP BY station, name, stop
		ORDER BY stop
	`

	rows, err := s.conn.Query(context.Background(), query, start, end, interval, threshold, label, isSouth, realtime)
	if err != nil {
		return nil, fmt.Errorf("line delay query failed: %w", err)
	}
	defer rows.Close()

	var results []LineDelayDay
	for rows.Next() {
		var station, name string
		var stop int32
		var buckets []map[string]string

		if err := rows.Scan(&station, &name, &stop, &buckets); err != nil {
			continue
		}

		results = append(results, LineDelayDay{
			Station: station,
			Name:    name,
			Stop:    stop,
			Buckets: buckets,
		})
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating line delay results: %w", err)
	}

	return results, nil
}


