"use client"

import { ColumnDef } from "@tanstack/react-table"
import {FormatTime, RelativeTime, Label, DepartureEntry} from "~/departures/helper"
import { ArrowUpDown } from "lucide-react"
import { Button } from "~/components/ui/button"
import {Departure, Station} from "../types"

const DepartureList = ({departures}: {departures: Departure[]}) => {
  return(departures.map((departure: Departure) => <span key={departure.label+departure.destination}><DepartureEntry departure={departure} />&nbsp;&nbsp;</span>))
}

export const columns: ColumnDef<Station>[] = [
  {
    accessorKey: "friendlyName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Station
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({row}) => {
      return (
        <div>
          {row.original.friendlyName}
          <div className="text-xs text-muted-foreground">
            Ø {row.original.avgDelay}m Verspätung.
          </div>
        </div>
    )
  },
  },
  {
    accessorKey: "departures",
    header: "Abfahrten",
    cell: ({row}) => <DepartureList key={row.original.friendlyName} departures={row.original.departures} />
  }
]