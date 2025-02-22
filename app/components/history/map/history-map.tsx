import { useState } from "react"
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
  friendlyNames: Record<string, string>
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
    }
  })

  return stationList
}

export const BucketSelector = ({
  stations,
  settings,
}: {
  stations: StationBucketList[]
  settings: ChartSettings
}) => {
  const { chartDate, interval } = settings
  const dayStart = startOfDay(chartDate)
  const totalMinutes = 1440
  const totalSteps = Math.floor(totalMinutes / interval)
  const [selectedStep, setSelectedStep] = useState(0)
  const [selectedBucketDate, setSelectedBucketDate] = useState<Date>(chartDate)

  const handleSliderChange = (value: number[]) => {
    const step = value[0]
    setSelectedStep(step)
    const bucketTime = addMinutes(dayStart, step * interval)
    setSelectedBucketDate(bucketTime)
  }

  const stationList = buildStationList(stations, selectedBucketDate, All)

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
        <SubwayMap
          stations={stationList}
          updatedStation={null}
          historyMode={true}
        />
      </div>
    </div>
  )
}

export default BucketSelector
