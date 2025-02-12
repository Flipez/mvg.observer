import type { MetaFunction } from "@remix-run/node";
import { Form } from "@remix-run/react";
import {EventSource} from 'eventsource'
import { useEffect, useState } from "react";
import moment from 'moment';
import { Button } from "~/components/ui/button"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "~/components/ui/hover-card"

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

function colorByDelay(delay: {delay: number}) {
  if (delay <= 0) {
    return "bg-green-100"
  }
  if (delay <= 5) {
    return "bg-yellow-100"
  }
  return "bg-red-100"
}

export default function Index() {
  const [departures, setDepartures] = useState({});

  useEffect(() => {
    const sse = new EventSource("http://localhost:8080/events")

    sse.onmessage = function(event) {
      var payload = JSON.parse(event.data);

      var avgDelay = payload["departures"].reduce(
        (accumulator, currentValue) => accumulator + currentValue.delayInMinutes, 0,
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
    <div className="containe mx-auto">
      <DepartureGrid departures={departures} />
      <DepartureTable departures={departures} />
      </div>
  )
}

function DepartureGrid({departures}: {departures: any}) {
  return(
    <div className="grid grid-cols-6 gap-3">
        {
          Object.entries(departures)
          .sort(([keyA, valueA], [keyB, valueB]) => valueA["friendlyName"] > valueB["friendlyName"] ? 1 : -1)
          .map( ([key, value]) =>
            <div key={key} id={key} className={`h-10 ${colorByDelay(value["avgDelay"])}`}>
              <DepartureCard station={value} />
            </div>)
        }
    </div>
  )
}

export function DepartureTable({departures}: {departures: any}) {
  return (
    <div className="relative flex flex-col w-full h-full overflow-scroll text-gray-700 bg-white shadow-md rounded-xl bg-clip-border">
    <table className="w-full text-left min-w-max">
      <thead>
        <tr>
          <th className="p-4 border-b border-blue-gray-100 bg-blue-gray-50">Station</th>
          <th className="p-4 border-b border-blue-gray-100 bg-blue-gray-50">Departures</th>
        </tr>
      </thead>
      <tbody>
        {
          Object.entries(departures)
          .sort(([keyA, valueA], [keyB, valueB]) => valueA["friendlyName"] > valueB["friendlyName"] ? 1 : -1)
          .map( ([key, value]) =>
            <tr key={key} className="max-h-1 h-1">
              <td className="p-4 border-b border-blue-gray-50">
                {value["friendlyName"]}
                <div className="text-xs text-muted-foreground">Average delay is {value["avgDelay"]} minutes.</div>
              </td>
              <td className="p-4 border-b border-blue-gray-5">
                <div>
                  {
                  value["departures"].map(
                    (v) =>
                      <span>
                        <Label label={v["label"]} /> {v["destination"]}
                        <span className="text-xs"> in </span>
                        <b><RelativeTime timestamp={v["realtimeDepartureTime"]} /></b>
                        &nbsp;
                        <span className="text-xs">(<FormatTime timestamp={v["plannedDepartureTime"]} />+{v["delayInMinutes"]})</span>
                        &nbsp;
                        &nbsp;
                      </span>
                  )
                }
                </div>
              </td>
            </tr>)
        }
      </tbody>
    </table>
    </div>
  );
}

function DepartureCard({station}: {station: any}) {

  return(
    <HoverCard openDelay={50} closeDelay={0}>
      <HoverCardTrigger asChild>
        <Button variant="ghost" className="border-solid border-2 h-10 w-full text-sm">
          {station["friendlyName"]}
        </Button>
      </HoverCardTrigger>
      <HoverCardContent className="w-100">
        <DepartureValue value={station["departures"]} />
        <div className="flex items-center pt-2">
          <span className="text-xs text-muted-foreground">
            Average Delay is {station["avgDelay"]} minutes.
          </span>
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}

export function DepartureValue({value}: {value: any}) {
  return (
    <div>
      {
      value.map(
        (v) => <div>
          <Label label={v["label"]} /> {v["destination"]}
          <span className="text-xs"> in </span>
          <b><RelativeTime timestamp={v["realtimeDepartureTime"]} /></b>
          &nbsp;
          <span className="text-xs">(<FormatTime timestamp={v["plannedDepartureTime"]} />+{v["delayInMinutes"]})</span>
        </div>
      )
    }
    </div>
  )
}

export function RelativeTime({timestamp} : {timestamp: any}) {
  const now = moment();
  const date = moment.unix(timestamp/1000);
  return(
    <span>
      {date.diff(now, 'minutes')}m
    </span>
  )
}

function FormatTime({timestamp}: {timestamp: any}) {
  const date = moment.unix(timestamp/1000)
  return date.format("HH:mm")
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