import { StationState } from "~/types/departures"

import { DescriptionCard } from "./welcome/description-card"
import { GlobalDelayCard } from "./welcome/global-delay-card"
import { HighscoreCard } from "./welcome/highscore-card"

export function WelcomeBlock({
  globalDelay,
  stations,
}: {
  globalDelay: number
  stations: StationState
}) {
  return (
    <div className="mx-5">
      <div className="my-5 grid grid-cols-4 gap-4">
        <GlobalDelayCard globalDelay={globalDelay} />
        <HighscoreCard stations={stations} />
        <DescriptionCard />
      </div>
    </div>
  )
}
