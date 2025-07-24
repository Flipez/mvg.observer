import { PopoverContent } from "~/components/ui/popover"
import { Station } from "~/types/departures"
import { format } from "date-fns"
import { Trans } from "react-i18next"

import { HelpPopover } from "../help-popover"
import { formatDelay } from "./helper"
import { DepartureList } from "./list"

export function DeparturesPopoverContent({ station }: { station: Station }) {
  return (
    <PopoverContent
      className="w-auto bg-mvg text-white"
      onOpenAutoFocus={(event) => {
        event.preventDefault()
      }}
    >
      <div className="flex justify-between">
        <h2 className="mb-2 text-xl font-semibold">{station.friendlyName}</h2>
        <div className="mt-1">
          <HelpPopover size={18} iconColor="text-white">
            <Trans>Misc.DeparturePopoverHelp</Trans>
          </HelpPopover>
        </div>
      </div>
      <DepartureList departures={station.departures} tableMode={false} />
      <div className="mt-4 flex justify-between text-xs">
        <div>
          Ø {formatDelay(station.avgDelay)} <Trans>Misc.Delay</Trans>
        </div>
        <div>
          <Trans>Misc.LastRefresh</Trans>{" "}
          {format(station.lastUpdated, "HH:mm:ss")}
        </div>
      </div>
    </PopoverContent>
  )
}
