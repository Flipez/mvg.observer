import React from "react"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
} from "~/components/ui/chart"
import { Bucket, StationBucketList } from "~/types/history"
import { format } from "date-fns"
import i18next, { t } from "i18next"
import { Bar, BarChart, YAxis } from "recharts"

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

// Helper to generate time buckets between two timestamps (inclusive)
function generateTimeBuckets(
  startTime: number,
  endTime: number,
  intervalMinutes: number
) {
  const buckets = []
  const interval = intervalMinutes * 60 * 1000 // in ms
  for (let t = startTime; t <= endTime; t += interval) {
    buckets.push(t)
  }
  return buckets
}

function fillMissingBuckets(
  bucketsData: Bucket[],
  startTime: number,
  endTime: number,
  intervalMinutes: number
) {
  const completeBuckets = generateTimeBuckets(
    startTime,
    endTime,
    intervalMinutes
  )
  // Create a lookup from timestamp to data
  const lookup: { [key: number]: Bucket } = {}
  bucketsData.forEach((item: Bucket) => {
    // Convert bucket string to timestamp
    const time = new Date(item.bucket.replace(" ", "T")).getTime()
    lookup[time] = item
  })

  // Create a new array with every bucket; if missing, avgDelay is null
  return completeBuckets.map((time) => {
    return lookup[time]
      ? { ...lookup[time], bucket: time }
      : { bucket: time, avgDelay: null, numDepartures: null }
  })
}

interface ChartElement {
  payload?: DataPayload | undefined
  value?: number | string | undefined | (string | number)[]
}

interface DataPayload {
  avgDelay: number
  numDepartures: number
  bucket: string
}

interface CustomTooltipProps {
  active?: boolean
  elements?: ChartElement[]
  showPercentage: boolean
  threshold: number
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({
  active,
  elements,
  showPercentage,
  threshold,
}) => {
  if (!active || !elements?.length || !elements[0].payload) {
    return null
  }

  const { bucket, numDepartures } = elements[0].payload
  const value = Number(elements[0].value).toFixed(2)
  const measureLabel = showPercentage
    ? t("Table.Tooltip.PercDelay")
    : t("Table.Tooltip.AvgDelay")
  const measureUnit = showPercentage ? `% (> ${threshold} min)` : "min"
  const timeFormatted =
    i18next.language === "de"
      ? format(bucket, "HH:mm") + " Uhr"
      : format(bucket, "hh:mm aaa")

  return (
    <div
      style={{ position: "relative", zIndex: 9999 }}
      className="rounded border bg-white p-2 shadow"
    >
      <p className="text-sm">{`${t("Table.Tooltip.Time")}: ${timeFormatted}`}</p>
      <p className="text-sm">{`${t("Table.Tooltip.Departures")}: ${numDepartures}`}</p>
      <p className="text-sm">{`${measureLabel}: ${value} ${measureUnit}`}</p>
    </div>
  )
}

export function StationDelayHourChart({
  stationData,
  day,
  interval,
  yAxisOrientation,
  showPercentage,
  threshold,
}: {
  stationData: StationBucketList
  day: string
  interval: number
  yAxisOrientation: "left" | "right"
  showPercentage: boolean
  threshold: number
}) {
  const startOfDay = new Date(`${day}T00:00:00`).getTime()
  const endOfDay = new Date(`${day}T00:00:00`)
  endOfDay.setDate(endOfDay.getDate() + 1) // Move to the next day
  const endOfDayMs = endOfDay.getTime()

  const intervalMinutes = interval

  const processedData = fillMissingBuckets(
    stationData.buckets,
    startOfDay,
    endOfDayMs,
    intervalMinutes
  )

  return (
    <ChartContainer className="h-[35px] w-full" config={chartConfig}>
      <BarChart
        accessibilityLayer
        data={processedData}
        barGap={0}
        barCategoryGap={0.5}
        margin={{
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <YAxis
          domain={[0, showPercentage ? 100 : 10]}
          orientation={yAxisOrientation}
        />
        <ChartTooltip
          cursor={false}
          /* eslint-disable react/prop-types */
          content={(props) => (
            <CustomTooltip
              active={props.active}
              elements={props.payload}
              showPercentage={showPercentage}
              threshold={threshold}
            />
          )}
          wrapperStyle={{ zIndex: 9999 }}
        />
        <Bar
          isAnimationActive={false}
          dataKey={showPercentage ? "percentageThreshold" : "avgDelay"}
          type="step"
          fill="#5063DF"
          fillOpacity={0.9}
          shape={(props) => <CustomBarShape {...props} chartHeight={35} />}
        />
      </BarChart>
    </ChartContainer>
  )
}

interface CustomBarShapeProps {
  x: number
  y: number
  width: number
  height: number
  value: number | string | null
  chartHeight: number
}

const CustomBarShape: React.FC<CustomBarShapeProps> = ({
  x,
  y,
  width,
  height,
  value,
  chartHeight,
}) => {
  // If value is null/undefined, render nothing.
  if (value === null || value === undefined) return null

  // If computed height is 0, force a minimal height for the foreground bar.
  const minHeight = 0.0
  const forcedHeight = height === 0 ? minHeight : height
  // Adjust y so that the foreground bar remains anchored to the baseline.
  const adjustedY = height === 0 ? y - minHeight : y

  return (
    <>
      {/* Background spanning the full chart height */}
      <rect x={x} y={0} width={width} height={chartHeight} fill="#eee" />
      {/* Foreground bar rendered over the background */}
      <rect
        x={x}
        y={adjustedY}
        width={width}
        height={forcedHeight}
        fill="#5063DF"
      />
    </>
  )
}
