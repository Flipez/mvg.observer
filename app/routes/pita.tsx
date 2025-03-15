import { useEffect, useState } from "react"
import { useSearchParams } from "@remix-run/react"
import { StationDelayHourChart } from "~/components/charts/station-delay-hour"
import { ControlBar } from "~/components/history/line_day_delay/control-bar"
import {
  fetchGlobalDelay,
  fetchLineDelay,
} from "~/components/history/line_day_delay/fetch"
import { NoDeparturesCard } from "~/components/history/line_day_delay/no-departures-card"
import { BucketSelector } from "~/components/history/map/history-map"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { StationsByLine } from "~/data/subway-lines"
import { SubwayLine } from "~/types/departures"
import { ChartSettings, StationBucketList } from "~/types/history"
import { format } from "date-fns"
import { ArrowDownFromLine, ArrowUpFromLine } from "lucide-react"
import { Trans, useTranslation } from "react-i18next"

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

  if (!stationDataSouth && !stationDataNorth) return null

  return (
    <tr key={stationId}>
      <td className="border-y">
        {stationDataSouth ? (
          <StationDelayHourChart
            stationData={stationDataSouth}
            day={chartDateFormatted}
            interval={settings.interval}
            yAxisOrientation="left"
            showPercentage={settings.showPercentage}
            threshold={settings.threshold}
          />
        ) : (
          <div className="text-center text-sm">No data</div>
        )}
      </td>
      <td className="border text-center">
        <div className="mx-5">
          {StationsByLine[settings.line][stationId] ?? "Unknown Station"}
        </div>
      </td>
      <td className="border-y">
        {stationDataNorth ? (
          <StationDelayHourChart
            stationData={stationDataNorth}
            day={chartDateFormatted}
            interval={settings.interval}
            yAxisOrientation="right"
            showPercentage={settings.showPercentage}
            threshold={settings.threshold}
          />
        ) : (
          <div className="text-center text-sm">No data</div>
        )}
      </td>
    </tr>
  )
}

export default function Pita() {
  const [southChartData, setSouthChartData] = useState<StationBucketList[]>([])
  const [northChartData, setNorthChartData] = useState<StationBucketList[]>([])
  const [globalData, setGlobalData] = useState<StationBucketList[]>([])
  const [searchParams, setSearchParams] = useSearchParams()

  const getInitialSettings = (): ChartSettings => {
    return {
      chartDate: searchParams.get("d")
        ? new Date(searchParams.get("d")!)
        : new Date(2024, 1, 17),
      interval: searchParams.get("i") ? Number(searchParams.get("i")) : 20,
      realtime: searchParams.get("r") ? searchParams.get("r") === "1" : true,
      line: (searchParams.get("l") as SubwayLine | null) ?? "U6",
      threshold: searchParams.get("t") ? Number(searchParams.get("t")) : 0,
      showPercentage: searchParams.get("p")
        ? searchParams.get("p") === "1"
        : false,
      selectedTab: searchParams.get("s") || "table",
      selectedBucketDate: searchParams.get("b")
        ? new Date(`${searchParams.get("d")}T${searchParams.get("b")}`)
        : new Date(2024, 1, 17),
    }
  }

  const [settings, setSettings] = useState<ChartSettings>(getInitialSettings())

  useEffect(() => {
    setSearchParams({
      d: format(settings.chartDate, "yyyy-MM-dd"),
      i: settings.interval.toString(),
      r: settings.realtime ? "1" : "0",
      l: settings.line,
      t: settings.threshold.toString(),
      p: settings.showPercentage ? "1" : "0",
      s: settings.selectedTab,
      b: format(settings.selectedBucketDate, "HH:mm"),
    })
  }, [settings, setSearchParams])

  useTranslation()

  const chartDateFormatted = format(settings.chartDate, "yyyy-MM-dd")

  useEffect(() => {
    async function fetchData() {
      try {
        const promises = []

        if (settings.selectedTab === "table") {
          promises.push(fetchLineDelay(chartDateFormatted, settings, 1))
          promises.push(fetchLineDelay(chartDateFormatted, settings, 0))
        } else if (settings.selectedTab === "map") {
          promises.push(fetchGlobalDelay(settings))
        }

        const results = await Promise.all(promises)
        if (settings.selectedTab === "table") {
          setSouthChartData(results[0])
          setNorthChartData(results[1])
        } else if (settings.selectedTab === "map") {
          setGlobalData(results[0])
        }
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
    settings.selectedTab,
  ])

  let validStationIds = []
  if (southChartData && northChartData) {
    // Pre-filter station IDs where either south and north data exist.
    validStationIds = Object.keys(StationsByLine[settings.line]).filter(
      (stationId) => {
        const hasSouth = southChartData.some(
          (data) => data.station === stationId
        )
        const hasNorth = northChartData.some(
          (data) => data.station === stationId
        )
        return hasSouth || hasNorth
      }
    )
  }

  return (
    <div className="container mx-auto">
      <ControlBar settings={settings} setSettings={setSettings} />
      <div className="mt-5">
        <Tabs
          defaultValue="table"
          value={settings.selectedTab}
          onValueChange={(value) =>
            setSettings((prev: ChartSettings) => ({
              ...prev,
              selectedTab: value,
            }))
          }
        >
          <TabsList className="mx-5 grid grid-cols-2">
            <TabsTrigger value="table">
              <Trans>Tabs.Table</Trans>
            </TabsTrigger>
            <TabsTrigger value="map">
              <Trans>Tabs.Map</Trans>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="table">
            {validStationIds.length > 0 ? (
              <table className="w-full table-auto border-collapse">
                <thead>
                  <tr>
                    <th className="w-1/2">
                      <div className="flex items-center justify-center gap-4">
                        <ArrowDownFromLine />
                        <Trans>Table.Columns.Southbound</Trans>
                        <ArrowDownFromLine />
                      </div>
                    </th>
                    <th className="w-auto whitespace-nowrap">Station</th>
                    <th className="w-1/2">
                      <div className="flex items-center justify-center gap-4">
                        <ArrowUpFromLine />
                        <Trans>Table.Columns.Northbound</Trans>
                        <ArrowUpFromLine />
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(StationsByLine[settings.line]).map(
                    (stationId) => (
                      <StationDelayRow
                        key={stationId}
                        stationId={stationId}
                        chartDateFormatted={chartDateFormatted}
                        settings={settings}
                        southChartData={southChartData}
                        northChartData={northChartData}
                      />
                    )
                  )}
                </tbody>
              </table>
            ) : (
              <NoDeparturesCard />
            )}
          </TabsContent>
          <TabsContent value="map">
            <BucketSelector
              stations={globalData}
              settings={settings}
              setSettings={setSettings}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
