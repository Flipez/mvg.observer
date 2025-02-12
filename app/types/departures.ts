export type Station = {
  departures: Departure[]
  avgDelay: number
  friendlyName: string
}

export type Departure = {
  plannedDepartureTime: number
  realtimeDepartureTime: number
  label: "U1" | "U2" | "U3" | "U4" | "U5" | "U6" | "U7" | "U8"
  delayInMinutes: number
  destination: string
}

export type StationState = Record<string, Station>
