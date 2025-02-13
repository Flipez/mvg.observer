export type SubwayLine = "U1" | "U2" | "U3" | "U4" | "U5" | "U6" | "U7" | "U8"

export type Station = {
  departures: Departure[]
  avgDelay: number
  friendlyName: string
  coordinates: Coordinates
}

export type Coordinates = {
  longitude: string
  latitude: string
}

export type Departure = {
  id: string
  plannedDepartureTime: number
  realtimeDepartureTime: number
  label: SubwayLine
  delayInMinutes: number
  destination: string
}

export type StationState = Record<string, Station>
