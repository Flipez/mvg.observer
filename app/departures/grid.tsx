import { DepartureEntry } from "~/components/departure-entry"
import { Button } from "~/components/ui/button"
import {
  Popover,
  PopoverTrigger,
} from "~/components/ui/popover"
import { cn } from "~/lib/utils"
import { Departure, Station, StationState } from "~/types/departures"
import { DeparturesPopoverContent } from "./popover-content"

type StationCardProps = {
  station: Station
  isUpdated: boolean
}

function StationCard({ station, isUpdated }: StationCardProps) {
  const delayColor =
    station.avgDelay <= 0
      ? "bg-green-100"
      : station.avgDelay <= 5
        ? "bg-yellow-100"
        : "bg-red-100"

  return (
    <div
      className={cn(
        "h-10 transform transition-all",
        delayColor,
        isUpdated && "animate-flash-grow"
      )}
    >
      <Popover>
        <PopoverTrigger asChild className="w-full">
          <Button
            variant="ghost"
            className="h-10 w-full border-2 border-solid text-xs"
          >
            {station.friendlyName}
          </Button>
        </PopoverTrigger>
        <DeparturesPopoverContent station={station} />
      </Popover>
    </div>
  )
}

export function DepartureList({
  departures,
  className,
}: {
  departures: Departure[]
  className?: string
}) {
  return (
    <div className={`${className} flex flex-col gap-1`}>
      {departures.map((departure) => (
        <DepartureEntry key={departure.id} departure={departure} />
      ))}
    </div>
  )
}

export function DepartureGrid({
  departures,
  updatedStation,
}: {
  departures: StationState
  updatedStation: string | null
}) {
  const stationEntries = Object.entries(departures)

  const sortedStations = stationEntries.sort(([, a], [, b]) =>
    a.friendlyName.localeCompare(b.friendlyName)
  )

  return (
    <div className="grid grid-cols-6 gap-3 m-5">
      {sortedStations.map(([stationId, station]) => (
        <StationCard
          key={stationId}
          station={station}
          isUpdated={stationId === updatedStation}
        />
      ))}
    </div>
  )
}
