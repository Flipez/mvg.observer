import {
  Map,
  Marker,
  Popup,
} from 'react-map-gl/maplibre';
import {useState, useMemo} from 'react';
import { StationState } from '~/types/departures';
import 'maplibre-gl/dist/maplibre-gl.css';
import { StationCard } from './grid';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover"
import { DepartureList } from './grid';
import { formatDelay } from './helper';

const ICON = `M20.2,15.7L20.2,15.7c1.1-1.6,1.8-3.6,1.8-5.7c0-5.6-4.5-10-10-10S2,4.5,2,10c0,2,0.6,3.9,1.6,5.4c0,0.1,0.1,0.2,0.2,0.3
  c0,0,0.1,0.1,0.1,0.2c0.2,0.3,0.4,0.6,0.7,0.9c2.6,3.1,7.4,7.6,7.4,7.6s4.8-4.5,7.4-7.5c0.2-0.3,0.5-0.6,0.7-0.9
  C20.1,15.8,20.2,15.8,20.2,15.7z`;


function Pin({size = 12, color = '#fff'}) {
  const pinStyle = {
    cursor: 'pointer',
    fill: color,
    stroke: 'none'
  };
  return (
    <svg height={size} viewBox="0 0 24 24" style={pinStyle}>
      <path d={ICON} />
    </svg>
  );
}

function pinColor(isUpdated: boolean, avgDelay: number) {
  if (isUpdated) {
    return '#5063DF'
  }
  return avgDelay <= 0
      ? "#31C48D"
      : avgDelay <= 5
        ? "#FACA15"
        : "#F8B4B4"
}

export function SubwayMap({stations, updatedStation}: {stations: StationState, updatedStation: string|null}) {
  const [settings, setSettings] = useState({
    scrollZoom: false,
    boxZoom: false,
    dragRotate: false,
    dragPan: false,
    keyboard: false,
    doubleClickZoom: false,
    touchZoomRotate: false,
    touchPitch: false,
    cursor: 'auto'
  });

  const pins = useMemo(
    () =>
      Object.entries(stations).map(([stationId, station], index) => (
        <Marker
          key={`marker-${index}`}
          longitude={parseFloat(station.coordinates.longitude)}
          latitude={parseFloat(station.coordinates.latitude)}
          anchor='bottom'
          onClick={e => {
            e.originalEvent.stopPropagation()
          }}
        >
      <Popover>
        <PopoverTrigger className="w-full">
            <Pin color={pinColor(stationId === updatedStation, station.avgDelay)}/>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto bg-mvg text-white"
          onOpenAutoFocus={(event) => {
            event.preventDefault()
          }}
        >
          <h2 className="mb-2 text-xl font-semibold">{station.friendlyName}</h2>
          <DepartureList
            departures={station.departures}
            className="font-light"
          />
          <div className="mt-4 flex text-xs">
            Ø {formatDelay(station.avgDelay)} Verspätung
          </div>
        </PopoverContent>
      </Popover>
        </Marker>
      )),
    [stations]
  );

  return(
    <div className="h-[1100px] mx-5">
      <Map
        initialViewState={{
          latitude: 48.18,
          longitude: 11.579,
          zoom: 11.35,
        }}
        mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
        attributionControl={false}
        {...settings}
      >

        {pins}


      </Map>
    </div>
  )
}