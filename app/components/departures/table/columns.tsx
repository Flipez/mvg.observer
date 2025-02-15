"use client"

import { ColumnDef } from "@tanstack/react-table"
import { formatDelay } from "~/components/departures/helper"
import { DepartureList } from "~/components/departures/list"
import { Button } from "~/components/ui/button"
import { Station } from "~/types/departures"
import { t } from "i18next"
import { ArrowUpDown } from "lucide-react"
import { Trans } from "react-i18next"

export const columns: ColumnDef<Station>[] = [
  {
    accessorKey: "friendlyName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <Trans>Table.Columns.Station</Trans>
          <ArrowUpDown className="ml-2 size-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return (
        <div>
          {row.original.friendlyName}
          <div className="text-xs text-muted-foreground">
            Ø {formatDelay(row.original.avgDelay)} <Trans>Misc.Delay</Trans>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "departures",
    header: t("Table.Columns.Departures"),
    cell: ({ row }) => (
      <DepartureList departures={row.original.departures} tableMode={true} />
    ),
  },
]
