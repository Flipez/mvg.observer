import type { MetaFunction } from "@remix-run/node";
import { Form } from "@remix-run/react";
import {EventSource} from 'eventsource'
import { useEffect, useState } from "react";
import moment from 'moment';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip"

let departures = {}
const sleep = ms => new Promise(r => setTimeout(r, ms));

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
      console.log(payload)

      setDepartures((prevDepartures) => ({
        ...prevDepartures,  // Copy previous state
        [payload["station"]]: payload // Update specific station
      }));

    const grid = document.getElementById(payload["station"]);
    grid?.classList.add("bg-red-400")
    setTimeout(() => grid?.classList.remove("bg-red-400"), 100)

    };

    return () => {
      sse.close();
    };

  }, []);

  return(
    <div>
      <DepartureGrid departures={departures} />
      {/* <DepartureTable departures={departures} /> */}
      </div>
  )
}

function DepartureGrid({departures}: {departures: any}) {
  return(
    <div className="grid grid-cols-6 gap-4">
        {
          Object.entries(departures)
          .sort(([keyA, valueA], [keyB, valueB]) => valueA["friendlyName"] > valueB["friendlyName"] ? 1 : -1)
          .map( ([key, value]) =>
            <div key={key} id={key} className="h-10">
              <TooltipProvider delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger>{value["friendlyName"]}</TooltipTrigger>
                  <TooltipContent>
                    <DepartureValue value={value["departures"]} />
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>)
        }
    </div>
  )
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
          .map( ([key, value]) => <tr key={key}><td className="p-4 border-b border-blue-gray-50">{value["friendlyName"]}</td><td className="p-4 border-b border-blue-gray-5"><DepartureValue value={value["departures"]}/></td></tr>)
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
        (v) => <div><Label label={v["label"]} /> {v["destination"]}: in <FormatTime timestamp={v["realtimeDepartureTime"]} /></div>
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
  }
  return(<span className={colors[label] + ' inline-flex text-white py-0.5 px-1 w-8 justify-center text-xs font-medium'}>{label}</span>)
}

function Label({ label }: {label: string}) {
  const isDualColored = (label === "U7" || label === "U8")
  
  const colors = {
    primary: {
      "U1": "bg-u1",
      "U2": "bg-u2",
      "U3": "bg-u3",
      "U4": "bg-u4",
      "U5": "bg-u5",
      "U6": "bg-u6",
      "U7": "bg-u2",
      "U8": "bg-u3",
    },
    secondary: {
      "U7": 'bg-u1',
      "U8": 'bg-u2'
  }
 }

  return (
    <div className={`relative inline-flex ${colors.primary[label]}`}>
      {isDualColored && (
        <span className={`absolute z-10 top-0 left-0 w-full h-full ${colors.secondary[label]} [clip-path:polygon(0%_0%,0%_100%,100%_0%)]`} />
      )}
      <span className="inline-flex z-20 px-1 py-0.5 text-white text-xs font-medium w-7 justify-center">
        {label}
      </span>
    </div>
  );
}