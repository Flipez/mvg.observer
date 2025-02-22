import { useEffect, useState } from "react"
import { StationDelayHourChart } from "~/components/charts/station-delay-hour"
import { ControlBar } from "~/components/history/line_day_delay/control-bar"
import { fetchLineDelay } from "~/components/history/line_day_delay/fetch"
import { NoDeparturesCard } from "~/components/history/line_day_delay/no-departures-card"
import { StationsByLine } from "~/data/subway-lines"
import { ChartSettings, StationBucketList } from "~/types/history"
import { format } from "date-fns"

interface StationDelayRowProps {
  stationId: string
  chartDateFormatted: string
  settings: ChartSettings
  southChartData: StationBucketList[]
  northChartData: StationBucketList[]
}

export function StationDelayRow({
  stationId,
  chartDateFormatted,
  settings,
  southChartData,
  northChartData,
}: StationDelayRowProps) {
  const stationDataSouth = southChartData.find(
    (stationBucketList) => stationBucketList.station === stationId
  )
  const stationDataNorth = northChartData.find(
    (stationBucketList) => stationBucketList.station === stationId
  )

  if (!stationDataSouth || !stationDataNorth) return null

  return (
    <tr key={stationId}>
      <td className="border-y">
        <StationDelayHourChart
          stationData={stationDataSouth}
          day={chartDateFormatted}
          interval={settings.interval}
          yAxisOrientation="left"
          showPercentage={settings.showPercentage}
        />
      </td>
      <td className="border text-center">
        <div className="mx-5">
          {StationsByLine[settings.line][stationId] ?? "Unknown Station"}
        </div>
      </td>
      <td className="border-y">
        <StationDelayHourChart
          stationData={stationDataNorth}
          day={chartDateFormatted}
          interval={settings.interval}
          yAxisOrientation="right"
          showPercentage={settings.showPercentage}
        />
      </td>
    </tr>
  )
}

export default function Pita() {
  const [southChartData, setSouthChartData] = useState<StationBucketList[]>([])
  const [northChartData, setNorthChartData] = useState<StationBucketList[]>([])
  const [settings, setSettings] = useState<ChartSettings>({
    chartDate: new Date(2024, 1, 17), // parameters are (year, monthINDEX, day)
    interval: 15,
    realtime: true,
    line: "U6",
    threshold: 0,
    threshold_label: "> 0 Minutes",
    showPercentage: false,
  })

  const chartDateFormatted = format(settings.chartDate, "yyyy-MM-dd")

  useEffect(() => {
    async function fetchData() {
      try {
        const [southData, northData] = await Promise.all([
          fetchLineDelay(chartDateFormatted, settings, 1),
          fetchLineDelay(chartDateFormatted, settings, 0),
        ])
        setSouthChartData(southData)
        setNorthChartData(northData)
      } catch (error) {
        console.error("Error fetching chart data:", error)
      }
    }
    fetchData()
  }, [
    chartDateFormatted,
    settings.chartDate,
    settings.interval,
    settings.realtime,
    settings.line,
    settings.threshold,
  ])

  let validStationIds = []
  if (southChartData && northChartData) {
    // Pre-filter station IDs where both south and north data exist.
    validStationIds = Object.keys(StationsByLine[settings.line]).filter(
      (stationId) => {
        const stationDataSouth = southChartData.find(
          (data) => data.station === stationId
        )
        const stationDataNorth = northChartData.find(
          (data) => data.station === stationId
        )
        return stationDataSouth && stationDataNorth
      }
    )
  }

  return (
    <div className="container mx-auto">
      <ControlBar settings={settings} setSettings={setSettings} />
      {validStationIds.length > 0 ? (
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr>
              <th className="w-1/2">South</th>
              <th className="w-auto whitespace-nowrap">Station</th>
              <th className="w-1/2">North</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(StationsByLine[settings.line]).map((stationId) => (
              <StationDelayRow
                key={stationId}
                stationId={stationId}
                chartDateFormatted={chartDateFormatted}
                settings={settings}
                southChartData={southChartData}
                northChartData={northChartData}
              />
            ))}
          </tbody>
        </table>
      ) : (
        <NoDeparturesCard />
      )}
    </div>
  )
}
