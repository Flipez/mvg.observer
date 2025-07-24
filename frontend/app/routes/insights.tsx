import { useCallback, useEffect, useState } from "react"
import { SubwayLabel } from "~/components/subway-label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import { DatePicker } from "~/components/ui/date-picker"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { getStationStatsUrl } from "~/lib/api"
import { getStationDisplayData } from "~/utils/station-lines"
import { format } from "date-fns"
import { AlertCircle, CalendarDays, Clock, TrendingUp } from "lucide-react"
import { useTranslation } from "react-i18next"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

const friendlyNames = {
  "de:09162:1": "Karlsplatz (Stachus)",
  "de:09162:2": "Marienplatz",
  "de:09162:5": "München, Ostbahnhof",
  "de:09162:6": "Hauptbahnhof Bahnhofsplatz",
  "de:09162:30": "Poccistraße",
  "de:09162:40": "Goetheplatz",
  "de:09162:50": "Sendlinger Tor",
  "de:09162:60": "Odeonsplatz",
  "de:09162:70": "Universität",
  "de:09162:80": "Giselastraße",
  "de:09162:110": "Königsplatz",
  "de:09162:120": "Theresienstraße",
  "de:09162:130": "Josephsplatz",
  "de:09162:140": "Hohenzollernplatz",
  "de:09162:150": "Fraunhoferstraße",
  "de:09162:160": "Kolumbusplatz",
  "de:09162:170": "Stiglmaierplatz",
  "de:09162:180": "Maillingerstraße",
  "de:09162:190": "Rotkreuzplatz",
  "de:09162:200": "Westfriedhof",
}

interface LineStats {
  avgDelay: number
  departures: number
}

interface StationStats {
  avgDelay: number
  totalDepartures: number
  delayPercentage: number
  monthlyStats: Array<{
    month: string
    avgDelay: number
    departures: number
    lineStats: Record<string, LineStats>
  }>
  hourlyStats: Array<{
    hour: number
    avgDelay: number
    departures: number
    lineStats: Record<string, LineStats>
  }>
  delayDistribution: Array<{
    range: string
    count: number
  }>
}

export default function Insights() {
  const { t } = useTranslation()
  const [selectedStation, setSelectedStation] = useState<string>("de:09162:6")
  const [stationStats, setStationStats] = useState<StationStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [hiddenLines, setHiddenLines] = useState<Set<string>>(new Set())

  // Date range state - default to last year
  const now = new Date()
  const [startDate, setStartDate] = useState<Date>(
    new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
  )
  const [endDate, setEndDate] = useState<Date>(now)

  const fetchStationStats = useCallback(
    async (stationId: string) => {
      setLoading(true)
      try {
        const startDateStr = format(startDate, "yyyy-MM-dd")
        const endDateStr = format(endDate, "yyyy-MM-dd")
        const response = await fetch(
          getStationStatsUrl(stationId, startDateStr, endDateStr)
        )
        if (response.ok) {
          const data = await response.json()
          console.log("Station stats response:", data)
          setStationStats(data)
          setIsInitialLoad(false)
        } else {
          console.error(
            "Failed to fetch station stats:",
            response.status,
            response.statusText
          )
        }
      } catch (error) {
        console.error("Error fetching station stats:", error)
      } finally {
        setLoading(false)
      }
    },
    [startDate, endDate]
  )

  useEffect(() => {
    if (selectedStation) {
      fetchStationStats(selectedStation)
    }
  }, [selectedStation, fetchStationStats])

  const delayColors = ["#22c55e", "#facc15", "#f97316", "#ef4444", "#991b1b"]

  // Subway line colors matching the existing system
  const subwayLineColors: Record<string, string> = {
    U1: "#3C7333",
    U2: "#C3022D",
    U3: "#ED6720",
    U4: "#00AB85",
    U5: "#BD7B00",
    U6: "#0065B0",
    U7: "#C3022D", // U7 uses U2 color as primary
    U8: "#ED6720", // U8 uses U3 color as primary
  }

  const handleLegendClick = (data: { value: string }) => {
    const line = data.value
    setHiddenLines((prev) => {
      const newHidden = new Set(prev)
      if (newHidden.has(line)) {
        newHidden.delete(line)
      } else {
        newHidden.add(line)
      }
      return newHidden
    })
  }

  // Create legend payload that includes all lines regardless of visibility
  const legendPayload = Object.entries(subwayLineColors).map(
    ([line, color]) => ({
      value: line,
      type: "line",
      color: hiddenLines.has(line) ? "#cccccc" : color,
      inactive: hiddenLines.has(line),
    })
  )

  return (
    <div className="container mx-auto space-y-6 p-6">
      <div className="flex flex-col space-y-4">
        <h1 className="text-3xl font-bold">{t("Insights.Title")}</h1>
        <p className="text-muted-foreground">{t("Insights.Description")}</p>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium">
              {t("Insights.Station.Label")}
            </label>
            <Select value={selectedStation} onValueChange={setSelectedStation}>
              <SelectTrigger className="w-80">
                <SelectValue placeholder={t("Insights.Station.Placeholder")} />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(friendlyNames).map(([id, name]) => (
                  <SelectItem key={id} value={id}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium">
              {t("Insights.DateRange.StartDate")}
            </label>
            <DatePicker
              date={startDate}
              onSelect={(date) => date && setStartDate(date)}
              placeholder={t("Insights.DateRange.StartDatePlaceholder")}
            />
          </div>

          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium">
              {t("Insights.DateRange.EndDate")}
            </label>
            <DatePicker
              date={endDate}
              onSelect={(date) => date && setEndDate(date)}
              placeholder={t("Insights.DateRange.EndDatePlaceholder")}
            />
          </div>
        </div>
      </div>

      {loading && isInitialLoad && (
        <div className="flex h-64 items-center justify-center">
          <div className="size-8 animate-spin rounded-full border-b-2 border-primary"></div>
        </div>
      )}

      {stationStats && selectedStation && (
        <div className="relative space-y-6">
          {loading && !isInitialLoad && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 backdrop-blur-sm">
              <div className="flex items-center gap-2 rounded-lg bg-card p-4 shadow-lg">
                <div className="size-4 animate-spin rounded-full border-b-2 border-primary"></div>
                <span className="text-sm text-muted-foreground">
                  Loading...
                </span>
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("Insights.Cards.AverageDelay")}
                </CardTitle>
                <Clock className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stationStats.avgDelay.toFixed(1)}min
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("Insights.Cards.TotalDepartures")}
                </CardTitle>
                <CalendarDays className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stationStats.totalDepartures.toLocaleString()}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("Insights.Cards.DelayRate")}
                </CardTitle>
                <TrendingUp className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stationStats.delayPercentage.toFixed(1)}%
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("Insights.Cards.Station")}
                </CardTitle>
                <AlertCircle className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-lg font-medium">
                  {(() => {
                    const stationName =
                      friendlyNames[
                        selectedStation as keyof typeof friendlyNames
                      ]
                    const displayData = getStationDisplayData(
                      selectedStation,
                      stationName
                    )
                    return (
                      <div className="flex flex-wrap items-center gap-2">
                        {displayData.lines.map((line) => (
                          <SubwayLabel key={line} label={line} />
                        ))}
                        <span>{displayData.stationName}</span>
                      </div>
                    )
                  })()}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>
                  {t("Insights.Charts.MonthlyDelayTrends.Title")}
                </CardTitle>
                <CardDescription>
                  {t("Insights.Charts.MonthlyDelayTrends.Description")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {stationStats.monthlyStats &&
                stationStats.monthlyStats.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={stationStats.monthlyStats}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis
                        label={{
                          value: "Minutes",
                          angle: -90,
                          position: "insideLeft",
                        }}
                      />
                      <Tooltip
                        formatter={(value: number, name: string) => [
                          `${Number(value).toFixed(2)} min`,
                          name,
                        ]}
                      />
                      <Legend
                        onClick={handleLegendClick}
                        payload={legendPayload}
                      />
                      {/* Individual subway line trends */}
                      {Object.entries(subwayLineColors).map(([line, color]) => (
                        <Line
                          key={line}
                          type="monotone"
                          dataKey={`lineStats.${line}.avgDelay`}
                          stroke={color}
                          strokeWidth={2}
                          name={line}
                          connectNulls={false}
                          hide={hiddenLines.has(line)}
                          dot={false}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                    {t("Insights.Charts.MonthlyDelayTrends.NoData")}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  {t("Insights.Charts.HourlyDelayPatterns.Title")}
                </CardTitle>
                <CardDescription>
                  {t("Insights.Charts.HourlyDelayPatterns.Description")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {stationStats.hourlyStats &&
                stationStats.hourlyStats.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={stationStats.hourlyStats}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" />
                      <YAxis
                        label={{
                          value: "Minutes",
                          angle: -90,
                          position: "insideLeft",
                        }}
                      />
                      <Tooltip
                        formatter={(value: number, name: string) => [
                          `${Number(value).toFixed(2)} min`,
                          name,
                        ]}
                      />
                      <Legend
                        onClick={handleLegendClick}
                        payload={legendPayload}
                      />
                      {/* Individual lines for each subway line */}
                      {Object.entries(subwayLineColors).map(([line, color]) => (
                        <Line
                          key={line}
                          type="monotone"
                          dataKey={`lineStats.${line}.avgDelay`}
                          stroke={color}
                          strokeWidth={2}
                          name={line}
                          connectNulls={false}
                          hide={hiddenLines.has(line)}
                          dot={false}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                    {t("Insights.Charts.HourlyDelayPatterns.NoData")}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  {t("Insights.Charts.DepartureVolume.Title")}
                </CardTitle>
                <CardDescription>
                  {t("Insights.Charts.DepartureVolume.Description")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {stationStats.monthlyStats &&
                stationStats.monthlyStats.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={stationStats.monthlyStats}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip
                        formatter={(value: number, name: string) => [
                          `${Number(value).toLocaleString()} departures`,
                          name,
                        ]}
                      />
                      <Legend
                        onClick={handleLegendClick}
                        payload={legendPayload}
                      />
                      {/* Stacked bars for each subway line */}
                      {Object.entries(subwayLineColors).map(([line, color]) => (
                        <Bar
                          key={line}
                          dataKey={`lineStats.${line}.departures`}
                          stackId="departures"
                          fill={color}
                          name={line}
                          hide={hiddenLines.has(line)}
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                    {t("Insights.Charts.DepartureVolume.NoData")}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  {t("Insights.Charts.DelayDistribution.Title")}
                </CardTitle>
                <CardDescription>
                  {t("Insights.Charts.DelayDistribution.Description")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {stationStats.delayDistribution &&
                stationStats.delayDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={stationStats.delayDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="count"
                        nameKey="range"
                      >
                        {stationStats.delayDistribution.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={delayColors[index % delayColors.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number, name: string) => [
                          `${Number(value).toLocaleString()} departures`,
                          name,
                        ]}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                    {t("Insights.Charts.DelayDistribution.NoData")}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {!stationStats && !loading && (
        <Card>
          <CardContent className="flex h-64 items-center justify-center">
            <div className="space-y-2 text-center">
              <AlertCircle className="mx-auto size-12 text-muted-foreground" />
              <p className="text-lg font-medium">
                {t("Insights.SelectStation.Title")}
              </p>
              <p className="text-sm text-muted-foreground">
                {t("Insights.SelectStation.Description")}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
