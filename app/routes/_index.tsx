import type { MetaFunction } from "@remix-run/node"
import { DepartureGrid } from "~/components/departures/grid"
import { SubwayMap } from "~/components/departures/map"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { WelcomeBlock } from "~/components/welcome"
import { useDepartures } from "~/hooks/use-departures"

import { columns } from "../components/departures/table/columns"
import { DataTable } from "../components/departures/table/data-table"

export const meta: MetaFunction = () => [
  { title: "MVG Live" },
  { name: "description", content: "Live view of MVG Subway metrics" },
]

export default function Index() {
  const { stationList, updatedStation, globalDelay } = useDepartures()

  return (
    <div className="container mx-auto">
      <div className="m-5">
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
          Geht die MVG oder gehst du zu Fuß?
        </h1>
        <p className="text-xl text-muted-foreground">
          Ein inoffizieller Abfahrtsmonitor für die U-Bahnen in München
        </p>
      </div>
      <Tabs defaultValue="grid">
        <TabsList className="mx-5 grid grid-cols-3">
          <TabsTrigger value="grid">Matrix</TabsTrigger>
          <TabsTrigger value="table">Tabelle</TabsTrigger>
          <TabsTrigger value="map">Karte</TabsTrigger>
        </TabsList>
        <TabsContent value="grid">
          <WelcomeBlock stations={stationList} globalDelay={globalDelay} />
          <DepartureGrid
            stations={stationList}
            updatedStation={updatedStation}
          />
        </TabsContent>
        <TabsContent value="table">
          <DataTable columns={columns} data={Object.values(stationList)} />
        </TabsContent>
        <TabsContent value="map">
          <SubwayMap stations={stationList} updatedStation={updatedStation} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
