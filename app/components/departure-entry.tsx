import { FormatTime, RelativeTime } from "~/departures/helper"
import { Departure } from "~/types/departures"

import { Label } from "./label"

export function DepartureEntry({ departure }: { departure: Departure }) {
  return (
    <span>
      <Label label={departure.label} /> {departure.destination}
      <span className="text-xs"> in </span>
      <b>
        <RelativeTime timestamp={departure.realtimeDepartureTime} />
      </b>
      &nbsp;
      <span className="text-xs">
        (<FormatTime timestamp={departure.plannedDepartureTime} />+
        {departure.delayInMinutes})
      </span>
    </span>
  )
}
