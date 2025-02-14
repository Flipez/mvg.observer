import { PopoverContent } from "~/components/ui/popover"
import { DepartureList } from "./grid"
import { formatDelay } from "./helper"
import { Station } from "~/types/departures"

export function DeparturesPopoverContent({station}: {station: Station}){
  return(
        <PopoverContent
          className="w-auto bg-mvg text-white"
          onOpenAutoFocus={(event) => {
            event.preventDefault()
          }}
        >
          <h2 className="mb-2 text-xl font-semibold">{station.friendlyName}</h2>
          <DepartureList
            departures={station.departures}
            className="font-light"
          />
          <div className="mt-4 flex text-xs">
            Ø {formatDelay(station.avgDelay)} Verspätung
          </div>
        </PopoverContent>
  )
}