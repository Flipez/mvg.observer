import moment from 'moment';
import { Departure } from './types';

export function colorByDelay(delay: number) {
  if (delay <= 0) {
    return "bg-green-100"
  }
  if (delay <= 5) {
    return "bg-yellow-100"
  }
  return "bg-red-100"
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

export function FormatTime({timestamp}: {timestamp: any}) {
  const date = moment.unix(timestamp/1000)
  return date.format("HH:mm")
}

export function Label({ label }: {label: string}) {
  const isDualColored = (label === "U7" || label === "U8")

  const colors: {
    primary: Record<string, string>
    secondary: Record<string, string>
  } = {
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

export function DepartureEntry({departure}: {departure: Departure}) {
  return(
    <span>
      <Label label={departure.label} /> {departure.destination}
      <span className="text-xs"> in </span>
      <b><RelativeTime timestamp={departure.realtimeDepartureTime} /></b>
      &nbsp;
      <span className="text-xs">(<FormatTime timestamp={departure.plannedDepartureTime} />+{departure.delayInMinutes})</span>
    </span>
  )
}