import { StationsByLine } from "~/data/subway-lines"
import { SubwayLine } from "~/types/departures"

// Create a reverse mapping from station ID to subway lines
export function getStationLines(stationId: string): SubwayLine[] {
  const lines: SubwayLine[] = []
  
  // Check each subway line to see if it contains this station
  for (const [line, stations] of Object.entries(StationsByLine)) {
    if (stations[stationId]) {
      lines.push(line as SubwayLine)
    }
  }
  
  return lines.sort() // Sort alphabetically (U1, U2, etc.)
}

// Get formatted line labels for display
export function getFormattedStationLines(stationId: string): string {
  const lines = getStationLines(stationId)
  return lines.join(", ")
}

// Get station name with line prefixes
export function getStationNameWithLines(stationId: string, stationName: string): string {
  const lines = getStationLines(stationId)
  if (lines.length > 0) {
    return `${lines.join(", ")} ${stationName}`
  }
  return stationName
}

// Get display data for a station with its subway lines
export function getStationDisplayData(stationId: string, stationName: string) {
  const lines = getStationLines(stationId)
  return {
    lines,
    stationName,
    hasLines: lines.length > 0
  }
}