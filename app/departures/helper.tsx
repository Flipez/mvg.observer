import moment from "moment"

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

export function RelativeTime({ timestamp }: { timestamp: number }) {
  const now = moment()
  const date = moment.unix(timestamp / 1000)
  return <span>{date.diff(now, "minutes")}m</span>
}

export function FormatTime({ timestamp }: { timestamp: number }) {
  const date = moment.unix(timestamp / 1000)
  return date.format("HH:mm")
}
