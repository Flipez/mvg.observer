import type { MetaFunction } from "@remix-run/node";
import {EventSource} from 'eventsource'
import { useEffect, useState } from "react";

let departures = {}

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  const [departures, setDepartures] = useState({});

  useEffect(() => {
    const sse = new EventSource("http://localhost:8080/events")

    sse.onmessage = function(event) {
      var payload = JSON.parse(event.data);

      setDepartures((prevDepartures) => ({
        ...prevDepartures,  // Copy previous state
        [payload[0]["station"]]: payload // Update specific station
      }));
    };

    return () => {
      sse.close();
    };

  }, []);

  return <DepartureTable departures={departures} />;

}

export function DepartureTable({departures}: {departures: any}) {
  return (
    <div className="relative flex flex-col w-full h-full overflow-scroll text-gray-700 bg-white shadow-md rounded-xl bg-clip-border">
    <table className="w-full text-left table-auto min-w-max">
      <thead>
        <tr>
          <th className="p-4 border-b border-blue-gray-100 bg-blue-gray-50">Station</th>
          <th className="p-4 border-b border-blue-gray-100 bg-blue-gray-50">Departures</th>
        </tr>
      </thead>
      <tbody>
        {
          Object.entries(departures)
          .map( ([key, value]) => <tr key={key}><td className="p-4 border-b border-blue-gray-50">{key}</td><td className="p-4 border-b border-blue-gray-5">{JSON.stringify(value)}</td></tr>)
        }
      </tbody>
    </table>
    </div>
  );
}