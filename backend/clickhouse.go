package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/ClickHouse/clickhouse-go/v2"
	"github.com/ClickHouse/clickhouse-go/v2/lib/driver"
)

func connectClickhouse() driver.Conn {
	conn, err := clickhouse.Open(&clickhouse.Options{
		Addr: []string{"clickhouse.auch.cool:9000"},
		Auth: clickhouse.Auth{
			Database: "mvg",
			Username: "default",
			Password: os.Getenv("CLICKHOUSE_PASSWORD"),
		},
	})
	if err != nil {
		panic(err)
	}
	v, err := conn.ServerVersion()
	if err != nil {
		panic(err)
	}
	fmt.Println(v)

	return conn
}

type LineDelayDay struct {
	Station     string              `json:"station"`
	Name        string              `json:"name"`
	Stop        int32               `json:"stop"`
	Coordinates Coordinates         `json:"coordinates"`
	Buckets     []map[string]string `json:"buckets"`
}

func getDayRange(dateStr string) (startOfDay, endOfDay string, err error) {
	// Define the layout for parsing the date (assuming the input is in "YYYY-MM-DD" format).
	const layout = "2006-01-02"
	// Parse the date.
	t, err := time.Parse(layout, dateStr)
	if err != nil {
		return "", "", err
	}

	// Use the year, month, and day from t to create a new time at midnight.
	year, month, day := t.Date()
	loc := t.Location() // Use the same location as t
	startTime := time.Date(year, month, day, 0, 0, 0, 0, loc)
	// The end time is the start time plus 24 hours.
	endTime := startTime.Add(24 * time.Hour)

	// Format the timestamps as strings in the desired format.
	// For example, using the ISO 8601 layout:
	const outputLayout = "2006-01-02"
	startOfDay = startTime.Format(outputLayout)
	endOfDay = endTime.Format(outputLayout)
	return
}

func getGlobalDelay(day string, interval string, threshold string, realtime string, conn driver.Conn) []LineDelayDay {
	start, end, err := getDayRange(day)
	if err != nil {
		fmt.Println("Error:", err)
		return nil
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
        arrayMap(x -> map('bucket', toString(x.1), 'avgDelay', toString(x.2), 'numDepartures', toString(x.3), 'percentageThreshold', toString(x.4)), groupArray((bucket, avgDelay, numDepartures, percentageThreshold))) AS buckets
    FROM
    (
        SELECT
            responses_dedup.station AS station,
            toStartOfInterval(plannedDepartureTime, toIntervalMinute(intervalMin)) AS bucket,
            avg(delayInMinutes) AS avgDelay,
            count() AS numDepartures,
            (100. * countIf(delayInMinutes > thresholdMin)) / count() AS percentageThreshold
        FROM mvg.responses_dedup
        WHERE (plannedDepartureTime >= startDate) AND (plannedDepartureTime < endDate) AND ((isRealtime = 0) OR (realtime = 1))
        GROUP BY
            responses_dedup.station,
            bucket
        ORDER BY bucket ASC
    )
    GROUP BY station	
	`

	rows, err := conn.Query(context.Background(), query, start, end, interval, threshold, realtime)
	if err != nil {
		log.Fatal("error running query: ", err)
	}
	defer rows.Close()

	var results []LineDelayDay

	for rows.Next() {
		var station string
		var buckets []map[string]string

		if err := rows.Scan(&station, &buckets); err != nil {
			log.Fatal("Error scanning row:", err)
		}

		results = append(results, LineDelayDay{
			Station:     station,
			Buckets:     buckets,
			Coordinates: coordinates[station],
		})
	}

	if err := rows.Err(); err != nil {
		log.Fatal(err)
	}

	return results

}

func getDelayForLine(day string, interval string, threshold string, label string, isSouth string, realtime string, conn driver.Conn) []LineDelayDay {
	start, end, err := getDayRange(day)
	if err != nil {
		fmt.Println("Error:", err)
		return nil
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

	FROM
	(
		SELECT
			responses_dedup.station AS station,
			thisStation.name AS name,
			thisStation.stop AS stop,
			toStartOfInterval(plannedDepartureTime, INTERVAL intervalMin minute) AS bucket,
			avg(delayInMinutes) AS avgDelay,
			count() AS numDepartures,
			100.0 * countIf(delayInMinutes > thresholdMin) / count() AS percentageThreshold
		FROM mvg.responses_dedup
		INNER JOIN mvg.lines as thisStation ON (responses_dedup.station = thisStation.station AND responses_dedup.label = thisStation.label)
		LEFT JOIN mvg.lines as destStation ON (responses_dedup.destination = destStation.name AND responses_dedup.label = thisStation.label)
		WHERE plannedDepartureTime >= startDate AND plannedDepartureTime < endDate
			AND responses_dedup.label = filterLabel
			AND (
				(destStation.stop IS NOT NULL AND (thisStation.stop < destStation.stop) = isSouth)
				OR (destStation.stop IS NULL AND isSouth = 0 AND thisStation.stop = (SELECT max(stop) FROM mvg.lines WHERE label = filterLabel))
				OR (destStation.stop IS NULL AND isSouth = 1 AND thisStation.stop = (SELECT min(stop) FROM mvg.lines WHERE label = filterLabel))
			)
			AND (isRealtime = 0 OR realtime = 1)
			GROUP BY responses_dedup.station, bucket, thisStation.name, thisStation.stop
			ORDER BY bucket
	)
	GROUP BY station, name, stop
	ORDER BY stop
`

	rows, err := conn.Query(context.Background(), query, start, end, interval, threshold, label, isSouth, realtime)
	if err != nil {
		log.Fatal("error running query: ", err)
	}
	defer rows.Close()

	var results []LineDelayDay

	for rows.Next() {
		var station, name string
		var stop int32
		var buckets []map[string]string

		if err := rows.Scan(&station, &name, &stop, &buckets); err != nil {
			log.Fatal("Error scanning row:", err)
		}

		results = append(results, LineDelayDay{
			Station: station,
			Name:    name,
			Stop:    stop,
			Buckets: buckets,
		})
	}

	if err := rows.Err(); err != nil {
		log.Fatal(err)
	}

	return results
}
