import { useEffect, useState } from "react"
import { Station, StationList } from "~/types/departures"
import { Map, Marker } from "react-map-gl/maplibre"

import "maplibre-gl/dist/maplibre-gl.css"

import { Popover, PopoverTrigger } from "~/components/ui/popover"
import useWindowDimensions from "~/hooks/use-window-dimensions"
import { cn } from "~/lib/utils"

import { departureWithMostDelay } from "./helper"
import { DeparturesPopoverContent } from "./popover-content"

const ICON = `M20.2,15.7L20.2,15.7c1.1-1.6,1.8-3.6,1.8-5.7c0-5.6-4.5-10-10-10S2,4.5,2,10c0,2,0.6,3.9,1.6,5.4c0,0.1,0.1,0.2,0.2,0.3
  c0,0,0.1,0.1,0.1,0.2c0.2,0.3,0.4,0.6,0.7,0.9c2.6,3.1,7.4,7.6,7.4,7.6s4.8-4.5,7.4-7.5c0.2-0.3,0.5-0.6,0.7-0.9
  C20.1,15.8,20.2,15.8,20.2,15.7z`

function Pin({ size = 12, color = "#fff" }: { size?: number; color?: string }) {
  const pinStyle = {
    cursor: "pointer",
    fill: color,
    stroke: "none",
  }

  return (
    <svg height={size} viewBox="0 0 24 24" style={pinStyle}>
      <path d={ICON} />
    </svg>
  )
}

function pinColor(station: Station, historyMode: boolean) {
  let delay
  if (historyMode) {
    delay = station.avgDelay
  } else {
    const maxDelayDeparture = departureWithMostDelay(station)
    delay = maxDelayDeparture?.delayInMinutes
  }

  const delayColor =
    delay === undefined
      ? "#ffffff"
      : delay <= 0
        ? "#31C48D"
        : delay <= 5
          ? "#FACA15"
          : "#F05252"

  return delayColor
}

function StationPin({
  station,
  historyMode,
}: {
  station: Station
  historyMode: boolean
}) {
  const [shouldAnimate, setShouldAnimate] = useState(false)
  const nextDeparture = station.departures[0]

  useEffect(() => {
    if (nextDeparture) {
      if (Date.now() > nextDeparture.realtimeDepartureTime) {
        setShouldAnimate(true)
        const timer = setTimeout(() => setShouldAnimate(false), 1000)
        return () => clearTimeout(timer)
      }
    }
  }, [nextDeparture])

  return (
    <Popover>
      <PopoverTrigger>
        <span
          className={cn(
            "h-10 transform transition-all",
            shouldAnimate && "animate-flash-grow"
          )}
        >
          <Pin color={pinColor(station, historyMode)} />
        </span>
      </PopoverTrigger>
      <DeparturesPopoverContent station={station} />
    </Popover>
  )
}

export function SubwayMap({
  stations,
  historyMode = false,
}: {
  stations: StationList
  historyMode?: boolean
}) {
  const settings = {
    scrollZoom: false,
    boxZoom: false,
    dragRotate: false,
    dragPan: false,
    keyboard: false,
    doubleClickZoom: false,
    touchZoomRotate: false,
    touchPitch: false,
    cursor: "auto",
  }

  const pins = Object.entries(stations).map(([, station], index) => (
    <Marker
      key={`marker-${index}`}
      longitude={parseFloat(station.coordinates.longitude)}
      latitude={parseFloat(station.coordinates.latitude)}
      anchor="bottom"
    >
      <StationPin station={station} historyMode={historyMode} />
    </Marker>
  ))

  const { width } = useWindowDimensions()
  const mapZoom = width >= 1024 ? 11.35 : 10
  return (
    <div className="mx-5 h-[500px] md:h-[1100px]">
      <Map
        initialViewState={{
          latitude: 48.18,
          longitude: 11.579,
          zoom: mapZoom,
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
