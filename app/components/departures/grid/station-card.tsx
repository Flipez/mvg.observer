import { Popover, PopoverTrigger } from "@radix-ui/react-popover"
import { Button } from "~/components/ui/button"
import { cn } from "~/lib/utils"
import { Station } from "~/types/departures"

import { departureWithMostDelay } from "../helper"
import { DeparturesPopoverContent } from "../popover-content"

type StationCardProps = {
  station: Station
  isUpdated: boolean
}

export function StationCard({ station, isUpdated }: StationCardProps) {
  const maxDelayDeparture = departureWithMostDelay(station)

  const delay = maxDelayDeparture?.delayInMinutes
  const delayColor =
    delay === undefined
      ? "bg-white"
      : delay <= 0
        ? "bg-green-100"
        : delay <= 5
          ? "bg-yellow-100"
          : "bg-red-100"

  return (
    <div
      className={cn(
        "box-border transform overflow-hidden rounded-lg border-2 border-solid transition-all",
        delayColor,
        isUpdated && "animate-flash-grow"
      )}
    >
      <Popover>
        <PopoverTrigger asChild className="w-full">
          <Button
            variant="ghost"
            className="w-full whitespace-normal break-words text-xs"
          >
            {station.friendlyName}
          </Button>
        </PopoverTrigger>
        <DeparturesPopoverContent station={station} />
      </Popover>
    </div>
  )
}
