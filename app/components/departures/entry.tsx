import { formatTime, RelativeTime } from "~/components/departures/helper"
import { cn } from "~/lib/utils"
import { Departure } from "~/types/departures"

import { Label } from "../label"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip"

export function DepartureEntry({
  departure,
  tableMode,
}: {
  departure: Departure
  tableMode: boolean
}) {
  const delayColor = tableMode
    ? departure.delayInMinutes <= 0
      ? "text-black"
      : departure.delayInMinutes <= 5
        ? "text-yellow-500"
        : "text-red-500"
    : departure.delayInMinutes <= 0
      ? "text-white"
      : departure.delayInMinutes <= 5
        ? "text-yellow-300"
        : "text-red-300"

  return (
    <TooltipProvider delayDuration={100}>
      <div className="flex items-center">
        <Label label={departure.label} />
        <div className="flex w-full justify-between">
          <span className="mx-1 mr-4">{departure.destination}</span>
          <Tooltip>
            <TooltipTrigger
              className={cn("text-right", "font-semibold", delayColor)}
            >
              {RelativeTime(departure.realtimeDepartureTime)}
            </TooltipTrigger>
            <TooltipContent className="text-xs">
              {formatTime(departure.plannedDepartureTime)}+
              <span
                className={`font-semibold ${departure.delayInMinutes > 0 ? "text-red-500" : "text-green-500"}`}
              >
                {departure.delayInMinutes}
              </span>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  )
}
