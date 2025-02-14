import { Station, StationState } from "~/types/departures"
import moment from "moment"

/**
 * Formats a delay in minutes into a human-readable string.
 * @param {number} minutes - The delay in minutes.
 * @returns {string} The formatted delay string (e.g., "5m 30s").
 */
export function formatDelay(minutes: number) {
  const mins = Math.floor(minutes)
  const secs = Math.round((minutes - mins) * 60)

  if (mins === 0) {
    return `${secs}s`
  }
  if (secs === 0) {
    return `${mins}m`
  }
  return `${mins}m ${secs}s`
}

/**
 * Converts a timestamp to a human-readable relative time string.
 *
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Formatted relative time string (e.g., "2 minutes ago", "30 seconds", "5 Min")
 *
 * @example
 * relativeTime(1634567890000) // "2 hours ago"
 * relativeTime(Date.now() + 30000) // "30 seconds"
 * relativeTime(Date.now() - 45000) // "45 seconds ago"
 */
export function relativeTime(timestamp: number): string {
  const date = moment.unix(timestamp / 1000)
  const diffInSeconds = date.diff(moment(), "seconds")

  // Future time more than a minute
  if (diffInSeconds >= 60) {
    return `${Math.round(diffInSeconds / 60)} Min`
  }

  // Past time more than a minute
  if (diffInSeconds < -60) {
    return date.fromNow()
  }

  // Within a minute (past or future)
  const absDiff = Math.abs(diffInSeconds)
  const suffix = diffInSeconds < 0 ? " ago" : ""
  const plural = absDiff === 1 ? "" : "s"

  return `${absDiff} second${plural}${suffix}`
}

/**
 * Formats a timestamp into a time string (e.g., "14:30").
 * @param {number} timestamp - The timestamp in milliseconds.
 * @returns {string} The formatted time string.
 */
export function formatTime(timestamp: number): string {
  const date = moment.unix(timestamp / 1000)
  return date.format("HH:mm")
}

export function stationWithMostDelay(stations: StationState): Station | null {
  if (Object.values(stations).length == 0) {
    return null
  }
  const max = Object.values(stations).reduce((prev, current) =>
    prev && prev.avgDelay > current.avgDelay ? prev : current
  )
  return max
}
