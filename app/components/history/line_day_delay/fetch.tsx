import { ChartSettings } from "~/types/history"
import { format } from "date-fns"

export async function fetchLineDelay(
  chartDateFormatted: string,
  settings: ChartSettings,
  south: number
) {
  let url: string
  if (!process.env.NODE_ENV || process.env.NODE_ENV === "development") {
    url = "http://localhost:8080/line_delay"
  } else {
    url = "https://api.mvgeht.de/line_delay"
  }
  const response = await fetch(
    `${url}?
        south=${south}
        &date=${encodeURIComponent(chartDateFormatted)}
        &interval=${settings.interval}
        &label=${settings.line}
        &realtime=${settings.realtime ? 1 : 0}
        &threshold=${settings.threshold}
    `.replace(/\s+/g, "")
  )

  const data = await response.json()
  return data
}

export async function fetchGlobalDelay(settings: ChartSettings) {
  let url: string
  if (!process.env.NODE_ENV || process.env.NODE_ENV === "development") {
    url = "http://localhost:8080/global_delay"
  } else {
    url = "https://api.mvgeht.de/global_delay"
  }
  const chartDateFormatted = format(settings.chartDate, "yyyy-MM-dd")
  const response = await fetch(
    `${url}?
        &date=${encodeURIComponent(chartDateFormatted)}
        &interval=${settings.interval}
        &realtime=${settings.realtime ? 1 : 0}
        &threshold=${settings.threshold}
    `.replace(/\s+/g, "")
  )

  const data = await response.json()
  return data
}
