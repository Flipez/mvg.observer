import { SubwayLine } from "./departures"

export type StationBucketList = {
  station: string
  name: string
  stop: number
  buckets: Bucket[]
}

export type Bucket = {
  avgDelay: string
  bucket: string
  numDepartures: string
  percentageThreshold: string
}

export interface ChartSettings {
  chartDate: number
  interval: number
  realtime: boolean
  line: SubwayLine
  threshold: number
  showPercentage: boolean
}
