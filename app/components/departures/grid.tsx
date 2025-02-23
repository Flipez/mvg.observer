import { StationList } from "~/types/departures"

import { StationCard } from "./grid/station-card"

export function DepartureGrid({ stations }: { stations: StationList }) {
  const stationEntries = Object.entries(stations)

  const sortedStations = stationEntries.sort(([, a], [, b]) =>
    a.friendlyName.localeCompare(b.friendlyName)
  )

  return (
    <div className="m-5 grid gap-3 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-6">
      {sortedStations.map(([stationId, station]) => (
        <StationCard key={stationId} station={station} />
      ))}
    </div>
  )
}
