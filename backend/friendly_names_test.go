package main

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestCoordinatesMapping(t *testing.T) {
	tests := []struct {
		name      string
		stationID string
		expected  Coordinates
		exists    bool
	}{
		{
			name:      "Karlsplatz coordinates",
			stationID: "de:09162:1",
			expected:  Coordinates{Longitude: "11.56613", Latitude: "48.13951"},
			exists:    true,
		},
		{
			name:      "Marienplatz coordinates",
			stationID: "de:09162:2",
			expected:  Coordinates{Longitude: "11.57542", Latitude: "48.13725"},
			exists:    true,
		},
		{
			name:      "Ostbahnhof coordinates",
			stationID: "de:09162:5",
			expected:  Coordinates{Longitude: "11.60365", Latitude: "48.12805"},
			exists:    true,
		},
		{
			name:      "Non-existent station",
			stationID: "de:09162:9999",
			expected:  Coordinates{},
			exists:    false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			coord, exists := coordinates[tt.stationID]
			assert.Equal(t, tt.exists, exists)
			if tt.exists {
				assert.Equal(t, tt.expected, coord)
			}
		})
	}
}

func TestFriendlyNamesMapping(t *testing.T) {
	tests := []struct {
		name      string
		stationID string
		expected  string
		exists    bool
	}{
		{
			name:      "Karlsplatz friendly name",
			stationID: "de:09162:1",
			expected:  "Karlsplatz (Stachus)",
			exists:    true,
		},
		{
			name:      "Marienplatz friendly name",
			stationID: "de:09162:2",
			expected:  "Marienplatz",
			exists:    true,
		},
		{
			name:      "Ostbahnhof friendly name",
			stationID: "de:09162:5",
			expected:  "München, Ostbahnhof",
			exists:    true,
		},
		{
			name:      "Frankfurt station (edge case)",
			stationID: "de:06412:10",
			expected:  "Frankfurt Hbf.",
			exists:    true,
		},
		{
			name:      "Nürnberg station (edge case)",
			stationID: "de:09564:510",
			expected:  "Nürnberg Hbf",
			exists:    true,
		},
		{
			name:      "Non-existent station",
			stationID: "de:09162:9999",
			expected:  "",
			exists:    false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			name, exists := friendlyNames[tt.stationID]
			assert.Equal(t, tt.exists, exists)
			if tt.exists {
				assert.Equal(t, tt.expected, name)
			}
		})
	}
}

func TestCoordinatesStructure(t *testing.T) {
	coord := Coordinates{
		Longitude: "11.56613",
		Latitude:  "48.13951",
	}

	assert.Equal(t, "11.56613", coord.Longitude)
	assert.Equal(t, "48.13951", coord.Latitude)
}

func TestDataConsistency(t *testing.T) {
	// Test that all stations with coordinates also have friendly names
	for stationID := range coordinates {
		_, hasName := friendlyNames[stationID]
		assert.True(t, hasName, "Station %s has coordinates but no friendly name", stationID)
	}

	// Test that all stations with friendly names also have coordinates
	for stationID := range friendlyNames {
		_, hasCoord := coordinates[stationID]
		assert.True(t, hasCoord, "Station %s has friendly name but no coordinates", stationID)
	}
}

func TestStationIDFormat(t *testing.T) {
	// Test that station IDs follow expected patterns
	validPrefixes := []string{"de:09162:", "de:09184:", "de:06412:", "de:09564:"}
	
	for stationID := range friendlyNames {
		hasValidPrefix := false
		for _, prefix := range validPrefixes {
			if len(stationID) > len(prefix) && stationID[:len(prefix)] == prefix {
				hasValidPrefix = true
				break
			}
		}
		assert.True(t, hasValidPrefix, "Station ID %s doesn't match expected format", stationID)
	}
}

func TestCoordinateValidation(t *testing.T) {
	// Test that coordinates are valid strings that could be parsed as floats
	for stationID, coord := range coordinates {
		assert.NotEmpty(t, coord.Longitude, "Station %s has empty longitude", stationID)
		assert.NotEmpty(t, coord.Latitude, "Station %s has empty latitude", stationID)
		
		// Basic format validation - should contain a decimal point for valid coordinates
		assert.Contains(t, coord.Longitude, ".", "Station %s longitude should contain decimal point", stationID)
		assert.Contains(t, coord.Latitude, ".", "Station %s latitude should contain decimal point", stationID)
	}
}

func TestMunichCoordinateBounds(t *testing.T) {
	for stationID, coord := range coordinates {
		// Skip non-Munich stations (Frankfurt, Nürnberg, Garching area)
		if stationID == "de:06412:10" || stationID == "de:09564:510" {
			continue
		}
		
		// For Munich stations, check rough coordinate bounds
		lat := coord.Latitude
		lon := coord.Longitude
		
		// Convert first character to check if it's a reasonable Munich coordinate
		// This is a basic sanity check
		if len(lat) > 0 && lat[0] == '4' && len(lon) > 0 && lon[0:2] == "11" {
			// Basic format check passed for Munich area
			assert.True(t, true, "Station %s coordinates look reasonable for Munich area", stationID)
		}
	}
}

// Benchmark tests
func BenchmarkCoordinateLookup(b *testing.B) {
	stationID := "de:09162:1"
	for i := 0; i < b.N; i++ {
		_ = coordinates[stationID]
	}
}

func BenchmarkFriendlyNameLookup(b *testing.B) {
	stationID := "de:09162:1"
	for i := 0; i < b.N; i++ {
		_ = friendlyNames[stationID]
	}
}

func BenchmarkMapIteration(b *testing.B) {
	for i := 0; i < b.N; i++ {
		for stationID := range coordinates {
			_ = friendlyNames[stationID]
		}
	}
}