import {
  formatTime,
  IconByOccupancy,
  relativeTime,
} from "~/components/departures/helper"
import { cn } from "~/lib/utils"
import { Departure } from "~/types/departures"
import { MessageSquareWarning, WifiOff } from "lucide-react"
import { Trans } from "react-i18next"

import { SubwayLabel } from "../subway-label"
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
      <div
        className={cn(
          "flex",
          "items-center",
          departure.realtime ? "" : "opacity-70"
        )}
      >
        <SubwayLabel label={departure.label} />
        <div className="flex w-full justify-between">
          <span className="mx-1 mr-12 flex">
            {departure.destination}
            {departure.messages.length !== 0 && (
              <span className="ml-1">
                <Tooltip>
                  <TooltipTrigger>
                    <MessageSquareWarning color="orange" size={18} />
                  </TooltipTrigger>
                  <TooltipContent className="text-xs">
                    {departure.messages.map((message, index) => (
                      <div key={index}>{message}</div>
                    ))}
                  </TooltipContent>
                </Tooltip>
              </span>
            )}
            <span className="mx-1">
              {departure.realtime && (
                <Tooltip>
                  <TooltipTrigger>
                    <WifiOff size={18} color="#F05252" />
                  </TooltipTrigger>
                  <TooltipContent className="text-xs">
                    <Trans>Misc.NoRealtimeData</Trans>
                  </TooltipContent>
                </Tooltip>
              )}
            </span>
          </span>
          <Tooltip>
            <TooltipTrigger
              className={cn("text-right", "font-semibold", delayColor)}
            >
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
        <Tooltip>
          <TooltipTrigger>
            <div className="relative -top-1 mx-2 min-w-5">
              <IconByOccupancy occupancy={departure.occupancy} />
            </div>
          </TooltipTrigger>
          <TooltipContent className="text-xs">
            <Trans>Occupancy.Occupancy</Trans>:&nbsp;
            <Trans>Occupancy.{departure.occupancy}</Trans>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  )
}
