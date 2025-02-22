import { DepartureGrid } from "~/components/departures/grid"
import { SubwayMap } from "~/components/departures/map"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { WelcomeBlock } from "~/components/welcome"
import { useDepartures } from "~/hooks/use-departures"

import { columns } from "../components/departures/table/columns"
import { DataTable } from "../components/departures/table/data-table"

import "../translations"

import { Trans } from "react-i18next"

export default function Index() {
  const { stationList, updatedStation, globalDelay } = useDepartures()

  return (
    <div className="mt-5">
      <Tabs defaultValue="grid">
        <TabsList className="mx-5 grid grid-cols-3">
          <TabsTrigger value="grid">
            <Trans>Tabs.Matrix</Trans>
          </TabsTrigger>
          <TabsTrigger value="table">
            <Trans>Tabs.Table</Trans>
          </TabsTrigger>
          <TabsTrigger value="map">
            <Trans>Tabs.Map</Trans>
          </TabsTrigger>
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
