import { PopoverContent } from "~/components/ui/popover"
import { Station } from "~/types/departures"
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
      <h2 className="mb-2 text-xl font-semibold">{station.friendlyName}</h2>
      <DepartureList departures={station.departures} tableMode={false} />
      <div className="flex justify-between">
        <div className="mt-4 flex text-xs">
          Ø {formatDelay(station.avgDelay)} <Trans>Misc.Delay</Trans>
        </div>
        <div className="mt-3">
          <HelpPopover size={18} iconColor="text-white">
            <Trans>Misc.DeparturePopoverHelp</Trans>
          </HelpPopover>
        </div>
      </div>
    </PopoverContent>
  )
}
