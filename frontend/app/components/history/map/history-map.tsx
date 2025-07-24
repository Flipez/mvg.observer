import { useEffect, useState } from "react"
import { SubwayMap } from "~/components/departures/map"
import { Slider } from "~/components/ui/slider"
import { All } from "~/data/subway-lines"
import { StationList } from "~/types/departures"
import { Bucket, ChartSettings, StationBucketList } from "~/types/history"
import { addMinutes, format, startOfDay } from "date-fns"

function getBucketForStation(buckets: Bucket[], selectedBucketDate: Date) {
  const selectedTime = selectedBucketDate.getTime()
  return buckets.find(
    (b) => new Date(b.bucket.replace(" ", "T")).getTime() === selectedTime
  )
}

function buildStationList(
  stations: StationBucketList[],
  selectedBucketDate: Date,
  friendlyNames: Record<string, string>,
  settings: ChartSettings
): StationList {
  const stationList: StationList = {}
  stations.forEach((stationData: StationBucketList) => {
    const bucket = getBucketForStation(stationData.buckets, selectedBucketDate)
    if (!bucket) return

    const avgDelay = parseFloat(bucket.avgDelay)

    stationList[stationData.station] = {
      departures: [], // No departures in history mode
      avgDelay,
      friendlyName:
        friendlyNames[stationData.station] ||
        stationData.name ||
        "Unknown Station",
      coordinates: stationData.coordinates,
      lastUpdated: settings.chartDate,
    }
  })

  return stationList
}

export const BucketSelector = ({
  stations,
  settings,
  setSettings,
}: {
  stations: StationBucketList[]
  settings: ChartSettings
  setSettings: React.Dispatch<React.SetStateAction<ChartSettings>>
}) => {
  const { chartDate, interval, selectedBucketDate } = settings
  const dayStart = startOfDay(chartDate)
  const totalMinutes = 1440
  const totalSteps = Math.floor(totalMinutes / interval)

  // When the chart date changes, preserve the time-of-day offset.
  useEffect(() => {
    setSettings((prev) => {
      // Calculate the offset (in minutes) from the previous bucket time to its day start.
      const oldBucket = prev.selectedBucketDate
      const offsetMinutes =
        (oldBucket.getTime() - startOfDay(oldBucket).getTime()) / 60000
      // Apply that same offset to the new chart date.
      return {
        ...prev,
        selectedBucketDate: addMinutes(
          startOfDay(prev.chartDate),
          offsetMinutes
        ),
      }
    })
  }, [chartDate, setSettings])

  // Compute the initial slider step from the selectedBucketDate.
  const initialStep = Math.floor(
    (selectedBucketDate.getTime() - dayStart.getTime()) / (interval * 60000)
  )
  const [selectedStep, setSelectedStep] = useState(initialStep)

  // Sync slider state when selectedBucketDate changes.
  useEffect(() => {
    const newStep = Math.floor(
      (selectedBucketDate.getTime() - dayStart.getTime()) / (interval * 60000)
    )
    setSelectedStep(newStep)
  }, [selectedBucketDate, dayStart, interval])

  const handleSliderChange = (value: number[]) => {
    const step = value[0]
    setSelectedStep(step)
    const bucketTime = addMinutes(dayStart, step * interval)
    setSettings((prev) => ({
      ...prev,
      selectedBucketDate: bucketTime,
    }))
  }

  const stationList = buildStationList(
    stations,
    selectedBucketDate,
    All,
    settings
  )

  return (
    <div className="space-y-2">
      <div className="mx-5">
        <p className="my-2 font-semibold">
          Selected Time:{" "}
          {format(addMinutes(dayStart, selectedStep * interval), "HH:mm")}
        </p>
        <Slider
          value={[selectedStep]}
          min={0}
          max={totalSteps - 1}
          step={1}
          onValueChange={handleSliderChange}
        />
      </div>
      <div className="mt-4">
        <SubwayMap stations={stationList} historyMode={true} />
      </div>
    </div>
  )
}

export default BucketSelector
