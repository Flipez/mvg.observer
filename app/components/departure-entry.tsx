import { formatTime, relativeTime } from "~/departures/helper"
import { Departure } from "~/types/departures"

import { Label } from "./label"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip"

export function DepartureEntry({ departure }: { departure: Departure }) {
  return (
    <TooltipProvider delayDuration={100}>
      <div className="flex items-center">
        <Label label={departure.label} />
        <div className="flex w-full justify-between">
          <span className="mx-1 mr-4">{departure.destination}</span>
          <Tooltip>
            <TooltipTrigger className="text-right font-semibold">
              {relativeTime(departure.realtimeDepartureTime)}
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
