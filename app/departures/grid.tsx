import { DepartureEntry } from "~/components/departure-entry"
import { Button } from "~/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover"
import { formatDelay } from "~/departures/helper"
import { Departure, Station, StationState } from "~/types/departures"

export function DepartureGrid({ departures }: { departures: StationState }) {
  return (
    <div className="grid grid-cols-6 gap-3">
      {Object.entries(departures)
        .sort(
          ([, stationA]: [string, Station], [, stationB]: [string, Station]) =>
            stationA.friendlyName > stationB.friendlyName ? 1 : -1
        )
        .map(([stationId, station]: [string, Station]) => (
          <div
            key={stationId}
            id={stationId}
            className={`h-10 ${
              station.avgDelay <= 0
                ? "bg-green-100"
                : station.avgDelay <= 5
                  ? "bg-yellow-100"
                  : "bg-red-100"
            }`}
          >
            <DepartureGridCard station={station} />
          </div>
        ))}
    </div>
  )
}

function DepartureGridCard({ station }: { station: Station }) {
  return (
    <Popover>
      <PopoverTrigger asChild className="w-full">
        <Button
          variant="ghost"
          className="h-10 w-full border-2 border-solid text-sm"
        >
          {station.friendlyName}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-100">
        <DepartureGridList departures={station.departures} />
        <div className="flex items-center pt-2">
          <span className="text-xs text-muted-foreground">
            Ø {formatDelay(station.avgDelay)} Verspätung
          </span>
        </div>
      </PopoverContent>
    </Popover>
  )
}

function DepartureGridList({ departures }: { departures: Departure[] }) {
  return (
    <div>
      {departures.map((departure: Departure) => (
        <div key={departure.plannedDepartureTime}>
          <DepartureEntry departure={departure} />
        </div>
      ))}
    </div>
  )
}
