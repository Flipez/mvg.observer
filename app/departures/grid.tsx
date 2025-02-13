import { DepartureEntry } from "~/components/departure-entry"
import { Button } from "~/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover"
import { formatDelay } from "~/departures/helper"
import { cn } from "~/lib/utils"
import { Departure, Station, StationState } from "~/types/departures"

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
            className="h-10 w-full border-2 border-solid text-sm"
          >
            {station.friendlyName}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto">
          <DepartureList departures={station.departures} />
          <div className="flex items-center pt-2">
            <span className="text-xs text-muted-foreground">
              Ø {formatDelay(station.avgDelay)} Verspätung
            </span>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

function DepartureList({ departures }: { departures: Departure[] }) {
  return (
    <>
      {departures.map((departure) => (
        <DepartureEntry key={departure.id} departure={departure} />
      ))}
    </>
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
    <div className="grid grid-cols-6 gap-3">
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
