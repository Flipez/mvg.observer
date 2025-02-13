import type { MetaFunction } from "@remix-run/node"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { DepartureGrid } from "~/departures/grid"
import { SubwayMap } from "~/departures/map"
import { useDepartures } from "~/hooks/use-departures"

import { columns } from "../departures/table/columns"
import { DataTable } from "../departures/table/data-table"
import { WelcomeBlock } from "~/components/welcome"

export const meta: MetaFunction = () => [
  { title: "MVG Live" },
  { name: "description", content: "Live view of MVG Subway metrics" },
]

export default function Index() {
  const { departures, updatedStation, globalDelay } = useDepartures()

  return (
    <div className="container mx-auto">
      <WelcomeBlock stations={departures} globalDelay={globalDelay} />
      <Tabs defaultValue="grid">
        <TabsList className="grid w-full grid-cols-3 mx-5">
          <TabsTrigger value="grid">Grid</TabsTrigger>
          <TabsTrigger value="table">Table</TabsTrigger>
          <TabsTrigger value="map">Map</TabsTrigger>
        </TabsList>
        <TabsContent value="grid">
          <DepartureGrid
            departures={departures}
            updatedStation={updatedStation}
          />
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
