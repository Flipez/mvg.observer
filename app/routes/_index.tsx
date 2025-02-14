import type { MetaFunction } from "@remix-run/node"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { WelcomeBlock } from "~/components/welcome"
import { DepartureGrid } from "~/departures/grid"
import { SubwayMap } from "~/departures/map"
import { useDepartures } from "~/hooks/use-departures"

import { columns } from "../departures/table/columns"
import { DataTable } from "../departures/table/data-table"

export const meta: MetaFunction = () => [
  { title: "MVG Live" },
  { name: "description", content: "Live view of MVG Subway metrics" },
]

export default function Index() {
  const { departures, updatedStation, globalDelay } = useDepartures()

  return (
    <div className="container mx-auto">
      <div className="mx-5 my-5">
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
          Geht die MVG oder gehst du zu Fuß?
        </h1>
        <p className="text-xl text-muted-foreground">
          Ein inoffizieller Abfahrtsmonitor für die U-Bahnen in München
        </p>
      </div>
      <Tabs defaultValue="grid">
        <TabsList className="mx-5 grid grid-cols-3">
          <TabsTrigger value="grid">Stationenmatrix</TabsTrigger>
          <TabsTrigger value="table">Tabellarische Übersicht</TabsTrigger>
          <TabsTrigger value="map">Karte</TabsTrigger>
        </TabsList>
        <TabsContent value="grid">
          <WelcomeBlock stations={departures} globalDelay={globalDelay} />
          <DepartureGrid
            departures={departures}
            updatedStation={updatedStation}
          />
        </TabsContent>
        <TabsContent value="table">
          <DataTable columns={columns} data={Object.values(departures)} />
        </TabsContent>
        <TabsContent value="map">
          <SubwayMap stations={departures} updatedStation={updatedStation} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
