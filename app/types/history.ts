import { Coordinates, SubwayLine } from "./departures"

export type StationBucketList = {
  station: string
  name: string
  stop: number
  buckets: Bucket[]
  coordinates: Coordinates
}

export type Bucket = {
  avgDelay: string
  bucket: string
  numDepartures: string
  percentageThreshold: string
}

export interface ChartSettings {
  chartDate: Date
  interval: number
  realtime: boolean
  line: SubwayLine
  threshold: number
  threshold_label: string
  showPercentage: boolean
}
