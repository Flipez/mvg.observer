import { useEffect, useState } from "react"
import { Popover, PopoverTrigger } from "@radix-ui/react-popover"
import { Button } from "~/components/ui/button"
import { cn } from "~/lib/utils"
import { Station } from "~/types/departures"

import { departureWithMostDelay } from "../helper"
import { DeparturesPopoverContent } from "../popover-content"

type StationCardProps = {
  station: Station
}

export function StationCard({ station }: StationCardProps) {
  const maxDelayDeparture = departureWithMostDelay(station)
  const nextDeparture = station.departures[0]

  const delay = maxDelayDeparture?.delayInMinutes
  const delayColor =
    delay === undefined
      ? "bg-white"
      : delay <= 0
        ? "bg-green-100"
        : delay <= 5
          ? "bg-yellow-100"
          : "bg-red-100"

  const [shouldAnimate, setShouldAnimate] = useState(false)

  useEffect(() => {
    if (nextDeparture) {
      if (Date.now() > nextDeparture.realtimeDepartureTime) {
        setShouldAnimate(true)
        const timer = setTimeout(() => setShouldAnimate(false), 1000)
        return () => clearTimeout(timer)
      }
    }
  }, [nextDeparture])

  return (
    <div
      className={cn(
        "box-border transform overflow-hidden rounded-lg border-2 border-solid transition-all",
        delayColor,
        shouldAnimate && "animate-flash-grow"
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
