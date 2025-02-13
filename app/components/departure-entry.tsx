import { formatTime, relativeTime } from "~/departures/helper"
import { Departure } from "~/types/departures"

import { Label } from "./label"

export function DepartureEntry({ departure }: { departure: Departure }) {
  return (
    <div className="flex items-center">
      <Label label={departure.label} />
      <span className="mx-1">{departure.destination}</span>
      <span className="font-semibold">
        {relativeTime(departure.realtimeDepartureTime)}
      </span>
      <span className="ml-1 text-xs">
        ({formatTime(departure.plannedDepartureTime)}+{departure.delayInMinutes}
        )
      </span>
    </div>
  )
}
