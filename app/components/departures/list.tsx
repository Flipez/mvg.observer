import { cn } from "~/lib/utils"
import { Departure } from "~/types/departures"

import { DepartureEntry } from "./entry"

export function DepartureList({
  departures,
  tableMode,
}: {
  departures: Departure[]
  tableMode: boolean
}) {
  return (
    <div
      className={cn("flex", "flex-col", "gap-1", tableMode ? "" : "font-light")}
    >
      {departures.map((departure) => (
        <DepartureEntry
          key={departure.id}
          departure={departure}
          tableMode={tableMode}
        />
      ))}
    </div>
  )
}
