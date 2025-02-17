import { useEffect, useState } from "react"
import { StationDelayHourChart } from "~/components/charts/station-delay-hour"
import { ControlBar } from "~/components/history/line_day_delay/control-bar"
import { fetchLineDelay } from "~/components/history/line_day_delay/fetch"
import { StationsByLine } from "~/data/subway-lines"
import { ChartSettings, StationBucketList } from "~/types/history"
import { addDays, format } from "date-fns"

function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}

export default function History() {
  const [southChartData, setSouthChartData] = useState<StationBucketList[]>([])
  const [northChartData, setNorthChartData] = useState<StationBucketList[]>([])
  const [settings, setSettings] = useState<ChartSettings>({
    chartDate: 0,
    interval: 30,
    realtime: false,
    line: "U6"
  })

  const year = 2024
  const startDate = new Date(year, 1, 16)
  const chartDateFormatted = format(
    addDays(startDate, settings.chartDate),
    "yyyy-MM-dd"
  )
  const debouncedChartDate = useDebounce(chartDateFormatted, 300)

  useEffect(() => {
    async function fetchData() {
      try {
        const [southData, northData] = await Promise.all([
          fetchLineDelay(debouncedChartDate, settings, 1),
          fetchLineDelay(debouncedChartDate, settings, 0),
        ])
        setSouthChartData(southData)
        setNorthChartData(northData)
      } catch (error) {
        console.error("Error fetching chart data:", error)
      }
    }
    fetchData()
  }, [debouncedChartDate, settings.chartDate, settings.interval, settings.realtime])

  return (
    <div>
      <ControlBar settings={settings} setSettings={setSettings} />
      <table className="table-auto border-collapse">
        <thead>
          <tr>
            <th>South</th>
            <th>Station</th>
            <th>North</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(StationsByLine[settings.line]).map((stationId: string) => {
            const stationDataSouth: StationBucketList | undefined =
              southChartData.find(
                (stationBucketList: StationBucketList) =>
                  stationBucketList.station === stationId
              )
            const stationDataNorth: StationBucketList | undefined =
              northChartData.find(
                (stationBucketList: StationBucketList) =>
                  stationBucketList.station === stationId
              )
            if (
              typeof stationDataSouth === "undefined" ||
              typeof stationDataNorth === "undefined"
            )
              return null
            return (
              <tr key={stationDataSouth.station}>
                <td className="border">
                  <StationDelayHourChart
                    stationData={stationDataSouth}
                    day={debouncedChartDate}
                    interval={settings.interval}
                  />
                </td>
                <td className="border text-center">
                  {StationsByLine[settings.line][stationId] ?? "Unknown Station"}
                </td>
                <td className="border">
                  <StationDelayHourChart
                    stationData={stationDataNorth}
                    day={debouncedChartDate}
                    interval={settings.interval}
                  />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
