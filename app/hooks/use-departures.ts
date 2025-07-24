import { useCallback, useEffect, useState } from "react"
import type { Departure, StationList } from "~/types/departures"
import { EventSource } from "eventsource"
import { getSSEUrl } from "~/lib/api"

function calculateAverageDelay(departures: Departure[]): number {
  if (!departures.length) return 0

  const totalDelay = departures.reduce(
    (sum, dep) => sum + dep.delayInMinutes,
    0
  )
  return totalDelay / departures.length
}

function calculateGlobalAverageDelay(stationList: StationList) {
  const allDepartures = Object.values(stationList)
    .map((station) => station.departures)
    .flat()
  return calculateAverageDelay(allDepartures)
}

function createDepartureId(departure: Omit<Departure, "id">): string {
  return `${departure.label}-${departure.plannedDepartureTime}-${departure.destination}`
    .toLowerCase()
    .replace(/\s+/g, "-")
}

export function useDepartures() {
  const [stationList, setStationList] = useState<StationList>({})
  const [globalDelay, setGlobalDelay] = useState<number>(0)

  const handleStationUpdate = useCallback((event: MessageEvent) => {
    const payload = JSON.parse(event.data)
    const {
      departures: stationDepartures,
      station: stationId,
      friendlyName,
      coordinates,
    } = payload

    // Create deterministic IDs from departure data
    const departuresWithId = stationDepartures.map(
      (dep: Omit<Departure, "id">) => ({
        ...dep,
        id: createDepartureId(dep),
      })
    )

    const avgDelay = calculateAverageDelay(departuresWithId)
    const lastUpdated = new Date()

    setStationList((prev) => ({
      ...prev,
      [stationId]: {
        departures: departuresWithId,
        avgDelay,
        friendlyName,
        coordinates,
        lastUpdated: lastUpdated,
      },
    }))
  }, [])

  useEffect(() => {
    setGlobalDelay(calculateGlobalAverageDelay(stationList))
  }, [stationList])

  useEffect(() => {
    const sse = new EventSource(getSSEUrl())
    sse.onmessage = handleStationUpdate

    return () => {
      sse.removeEventListener("message", handleStationUpdate)
      sse.close()
    }
  }, [handleStationUpdate])

  return { stationList, globalDelay }
}
