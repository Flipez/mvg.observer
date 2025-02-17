import { ChartSettings } from "~/types/history"

export async function fetchLineDelay(
  debouncedChartDate: string,
  settings: ChartSettings,
  south: number
) {
  const response = await fetch(
    `http://localhost:8080/line_delay?
        south=${south}
        &date=${encodeURIComponent(debouncedChartDate)}
        &interval=${settings.interval}
        &realtime=${settings.realtime ? 1 : 0}`.replace(/\s+/g, "")
  )

  const data = await response.json()
  return data
}
