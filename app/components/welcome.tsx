import { StationList } from "~/types/departures"

import { GlobalDelayCard } from "./welcome/global-delay-card"

export function WelcomeBlock({
  globalDelay,
  stations,
}: {
  globalDelay: number
  stations: StationList
}) {
  return (
    <div className="mx-5">
      <div className="my-5 grid grid-cols-1 gap-4">
        <GlobalDelayCard globalDelay={globalDelay} stations={stations} />
      </div>
    </div>
  )
}
