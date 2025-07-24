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
  if (departures.length === 0) {
    return (
      <div className="m-5 border p-4 text-center">No departures available.</div>
    )
  }

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
