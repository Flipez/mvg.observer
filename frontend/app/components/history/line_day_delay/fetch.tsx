import { getGlobalDelayUrl, getLineDelayUrl } from "~/lib/api"
import { ChartSettings } from "~/types/history"
import { format } from "date-fns"

export async function fetchLineDelay(
  chartDateFormatted: string,
  settings: ChartSettings,
  south: number
) {
  const url = getLineDelayUrl({
    date: chartDateFormatted,
    south: south.toString(),
    interval: settings.interval.toString(),
    realtime: settings.realtime ? "1" : "0",
    label: settings.line,
    threshold: settings.threshold.toString(),
  })

  const response = await fetch(url)
  const data = await response.json()
  return data
}

export async function fetchGlobalDelay(settings: ChartSettings) {
  const chartDateFormatted = format(settings.chartDate, "yyyy-MM-dd")
  const url = getGlobalDelayUrl({
    date: chartDateFormatted,
    interval: settings.interval.toString(),
    realtime: settings.realtime ? "1" : "0",
    threshold: settings.threshold.toString(),
  })

  const response = await fetch(url)
  const data = await response.json()
  return data
}
