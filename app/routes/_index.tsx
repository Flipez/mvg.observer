import type { MetaFunction } from "@remix-run/node";
import {EventSource} from 'eventsource'
import { useEffect, useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "~/components/ui/tabs"
import { columns } from "../departures/table/columns"
import { DataTable } from "../departures/table/data-table"
import { DepartureGrid } from "~/departures/grid";

export const meta: MetaFunction = () => {
  return [
    { title: "MVG Live" },
    { name: "description", content: "Live view of MVG Subway metrics" },
  ];
};


export default function Index() {
  const [departures, setDepartures] = useState({});

  useEffect(() => {
    const sse = new EventSource("http://localhost:8080/events")

    sse.onmessage = function(event) {
      var payload = JSON.parse(event.data);

      var avgDelay = payload["departures"].reduce(
        (accumulator: number, currentValue: { delayInMinutes: number; }) => accumulator + currentValue.delayInMinutes, 0,
      ) / payload["departures"].length
      payload["avgDelay"] = Math.round(avgDelay * 100) / 100

      setDepartures((prevDepartures) => ({
        ...prevDepartures,  // Copy previous state
        [payload["station"]]: payload // Update specific station
      }));

    const grid = document.getElementById(payload["station"]);
    grid?.classList.add("animate-ping")
    setTimeout(() => grid?.classList.remove("animate-ping"), 25)

    };

    return () => {
      sse.close();
    };

  }, []);


  return(
    <div className="container mx-auto">
      <Tabs defaultValue="grid" className="">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="grid">Grid</TabsTrigger>
          <TabsTrigger value="table">Table</TabsTrigger>
        </TabsList>
        <TabsContent value="grid">
          <DepartureGrid departures={departures} />
        </TabsContent>
        <TabsContent value="table">
          <DataTable columns={columns} data={Object.values(departures)} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
