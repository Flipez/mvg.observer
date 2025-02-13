import { useEffect, useState } from "react"
import type { MetaFunction } from "@remix-run/node"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { DepartureGrid } from "~/departures/grid"
import { SubwayMap } from "~/departures/map"
import type { Departure, StationState } from "~/types/departures"
import { EventSource } from "eventsource"

import { columns } from "../departures/table/columns"
import { DataTable } from "../departures/table/data-table"

export const meta: MetaFunction = () => [
  { title: "MVG Live" },
  { name: "description", content: "Live view of MVG Subway metrics" },
]

export default function Index() {
  const [departures, setDepartures] = useState<StationState>({})

  useEffect(() => {
    const sse = new EventSource("https://live.mvg.auch.cool/events")

    sse.onmessage = (event) => {
      const payload = JSON.parse(event.data)
      const { departures, station } = payload

      // Calculate average delay across all departures for this station (in minutes)
      const avgDelay =
        departures.length > 0
          ? departures.reduce(
              (sum: number, dep: Departure) => sum + dep.delayInMinutes,
              0
            ) / departures.length
          : 0

      setDepartures((prev) => ({
        ...prev,
        [station]: { ...payload, avgDelay },
      }))

      const grid = document.getElementById(station)
      if (grid) {
        grid.classList.add("animate-ping")
        setTimeout(() => grid.classList.remove("animate-ping"), 25)
      }
    }

    return () => sse.close()
  }, [])

  return (
    <div className="container mx-auto">
      <Tabs defaultValue="grid">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="grid">Grid</TabsTrigger>
          <TabsTrigger value="table">Table</TabsTrigger>
          <TabsTrigger value="map">Map</TabsTrigger>
        </TabsList>
        <TabsContent value="grid">
          <DepartureGrid departures={departures} />
        </TabsContent>
        <TabsContent value="table">
          <DataTable columns={columns} data={Object.values(departures)} />
        </TabsContent>
        <TabsContent value="map">
          <SubwayMap />
        </TabsContent>
      </Tabs>
    </div>
  )
}
