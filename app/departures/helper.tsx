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
 * Returns a relative time string (e.g., "a few seconds ago", "in 2 minutes").
 * @param {number} timestamp - The timestamp in milliseconds.
 * @returns {string} The relative time string.
 */
export function relativeTime(timestamp: number): string {
  const date = moment.unix(timestamp / 1000)
  return date.fromNow()
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
