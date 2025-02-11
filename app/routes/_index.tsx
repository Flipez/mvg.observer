import type { MetaFunction } from "@remix-run/node";
import { Form } from "@remix-run/react";
import {EventSource} from 'eventsource'
import { useEffect, useState } from "react";
import moment from 'moment';

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
        [payload["station"]]: payload // Update specific station
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
          .map( ([key, value]) => <tr key={key}><td className="p-4 border-b border-blue-gray-50">{key}</td><td className="p-4 border-b border-blue-gray-5"><DepartureValue value={value["departures"]}/></td></tr>)
        }
      </tbody>
    </table>
    </div>
  );
}

export function DepartureValue({value}: {value: any}) {
  return (
    <div>
      {
      value.map(
        (v) => <div><FormatLabel label={v["label"]} /> - {v["destination"]}: in <FormatTime timestamp={v["realtimeDepartureTime"]} /></div>
      )
    }
    </div>
  )
}

export function FormatTime({timestamp} : {timestamp: any}) {
  const now = moment();
  const date = moment.unix(timestamp/1000);
  return(
    <span>
      <b>{date.diff(now, 'minutes')}m</b> ({date.format("HH:mm")})
    </span>
  )
}

export function FormatLabel({label} : {label: string}) {
  const colors = {
    "U1": "bg-u1",
    "U2": "bg-u2",
    "U3": "bg-u3",
    "U4": "bg-u4",
    "U5": "bg-u5",
    "U6": "bg-u6",
    "U7": "bg-u7",
    "U8": "bg-u8",
  }
  return(<span className={colors[label] + ' inline-flex text-white py-0.5 px-1 w-8 justify-center text-xs font-medium'}>{label}</span>)
}