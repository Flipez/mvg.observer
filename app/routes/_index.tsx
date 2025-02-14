import type { MetaFunction } from "@remix-run/node"
import { Analytics } from "@vercel/analytics/remix"
import { DepartureGrid } from "~/components/departures/grid"
import { SubwayMap } from "~/components/departures/map"
import LanguageSwitcher from "~/components/language-switcher"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { WelcomeBlock } from "~/components/welcome"
import { useDepartures } from "~/hooks/use-departures"

import { columns } from "../components/departures/table/columns"
import { DataTable } from "../components/departures/table/data-table"

import "../translations"

import { Trans } from "react-i18next"

export const meta: MetaFunction = () => [
  { title: "MVGeht" },
  { name: "description", content: "Geht's noch oder eher nicht mehr?" },
]

export default function Index() {
  const { stationList, updatedStation, globalDelay } = useDepartures()

  return (
    <div className="container mx-auto">
      <div className="m-5">
        <LanguageSwitcher />
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
          <Trans>Title</Trans>
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
      <Analytics />
    </div>
  )
}
