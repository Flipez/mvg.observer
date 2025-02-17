import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "~/components/ui/chart"
import { Bucket, StationBucketList } from "~/types/history"
import { Area, AreaChart } from "recharts"

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
      : { bucket: time, avgDelay: null }
  })
}

export function StationDelayHourChart({
  stationData,
  day,
  interval,
}: {
  stationData: StationBucketList
  day: string
  interval: number
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
    <ChartContainer className="h-[30px] w-[400px]" config={chartConfig}>
      <AreaChart
        accessibilityLayer
        data={processedData}
        margin={{
          left: 0,
          right: 0,
          top: 2,
          bottom: 2,
        }}
      >
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="line" />}
        />
        <Area
          isAnimationActive={false}
          dataKey="avgDelay"
          type="step"
          fill="var(--color-desktop)"
          fillOpacity={0.4}
          stroke="var(--color-desktop)"
        />
      </AreaChart>
    </ChartContainer>
  )
}
