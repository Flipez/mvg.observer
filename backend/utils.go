package main

import (
	"fmt"
	"time"
)

// getDayRange converts a date string to start and end of day timestamps
// Input format: "2006-01-02"
// Returns: start and end of day in "2006-01-02" format
func getDayRange(dateStr string) (startOfDay, endOfDay string, err error) {
	const layout = "2006-01-02"
	
	// Parse the input date
	t, err := time.Parse(layout, dateStr)
	if err != nil {
		return "", "", fmt.Errorf("invalid date format '%s', expected YYYY-MM-DD: %w", dateStr, err)
	}

	// Create start of day (midnight)
	year, month, day := t.Date()
	location := t.Location()
	startTime := time.Date(year, month, day, 0, 0, 0, 0, location)
	
	// End of day (start of next day)
	endTime := startTime.Add(24 * time.Hour)

	// Format as strings
	startOfDay = startTime.Format(layout)
	endOfDay = endTime.Format(layout)
	
	return startOfDay, endOfDay, nil
}

// validateDateRange checks if start and end dates are valid
func validateDateRange(startDate, endDate string) error {
	const layout = "2006-01-02"
	
	start, err := time.Parse(layout, startDate)
	if err != nil {
		return fmt.Errorf("invalid start date format: %w", err)
	}
	
	end, err := time.Parse(layout, endDate)
	if err != nil {
		return fmt.Errorf("invalid end date format: %w", err)
	}
	
	if start.After(end) {
		return fmt.Errorf("start date %s is after end date %s", startDate, endDate)
	}
	
	// Warn if date range is too large (more than 1 year)
	if end.Sub(start) > 365*24*time.Hour {
		return fmt.Errorf("date range too large: %v days (max 365)", int(end.Sub(start).Hours()/24))
	}
	
	return nil
}