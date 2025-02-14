import { formatDelay, stationWithMostDelay } from "~/departures/helper";
import { StationState } from "~/types/departures";
import { GlobalDelayCard } from "./welcome/global-delay-card";
import { DescriptionCard } from "./welcome/description-card";
import { HighscoreCard } from "./welcome/highscore-card";

export function WelcomeBlock({globalDelay, stations}: {globalDelay: number, stations: StationState}) {


  return(
    <div className="mx-5">
     <div className="grid grid-cols-4 my-5 gap-4">
      <GlobalDelayCard globalDelay={globalDelay} />
      <HighscoreCard stations={stations} />
      <DescriptionCard />
    </div>
    </div>
  )
}