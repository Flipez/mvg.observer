import { useCallback, useEffect, useState } from "react"
import type { Departure, Station, StationState } from "~/types/departures"
import { EventSource } from "eventsource"

const SSE_URL = "https://live.mvg.auch.cool/events"

function calculateAverageDelay(departures: Departure[]): number {
  if (!departures.length) return 0

  const totalDelay = departures.reduce(
    (sum, dep) => sum + dep.delayInMinutes,
    0
  )
  return totalDelay / departures.length
}

function calculateGlobalAverageDelay(departures: StationState) {
  const allDepartures = Object.values(departures).map((station) => station.departures).flat()
  return calculateAverageDelay(allDepartures)
}

function createDepartureId(departure: Omit<Departure, "id">): string {
  return `${departure.label}-${departure.plannedDepartureTime}-${departure.destination}`
    .toLowerCase()
    .replace(/\s+/g, "-")
}

export function useDepartures() {
  const [departures, setDepartures] = useState<StationState>({})
  const [updatedStation, setUpdatedStation] = useState<string | null>(null)
  const [globalDelay, setGlobalDelay] = useState<number>(0)

  const handleStationUpdate = useCallback((event: MessageEvent) => {
    const payload = JSON.parse(event.data)
    const { departures: stationDepartures, station, friendlyName } = payload

    // Create deterministic IDs from departure data
    const departuresWithId = stationDepartures.map(
      (dep: Omit<Departure, "id">) => ({
        ...dep,
        id: createDepartureId(dep),
      })
    )

    const avgDelay = calculateAverageDelay(departuresWithId)

    setDepartures((prev) => {
      const updatedGlobalDepartures = {
        ...prev,
        [station]: {
          departures: departuresWithId,
          avgDelay,
          friendlyName,
        },
      }

    setGlobalDelay(calculateGlobalAverageDelay(updatedGlobalDepartures))

    return updatedGlobalDepartures
    })

    setUpdatedStation(station)
  }, [])

  useEffect(() => {
    const sse = new EventSource(SSE_URL)
    sse.onmessage = handleStationUpdate

    return () => {
      sse.removeEventListener("message", handleStationUpdate)
      sse.close()
    }
  }, [handleStationUpdate])

  return { departures, updatedStation, globalDelay }
}
