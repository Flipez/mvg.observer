import { formatDelay, stationWithMostDelay } from "~/departures/helper";
import { StationState } from "~/types/departures";
import { GlobalDelayCard } from "./welcome/global-delay-card";
import { DescriptionCard } from "./welcome/description-card";
import { HighscoreCard } from "./welcome/highscore-card";

export function WelcomeBlock({globalDelay, stations}: {globalDelay: number, stations: StationState}) {


  return(
    <div className="mx-5 mt-5">
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
        Geht die MVG oder gehst du zu Fuß?
      </h1>
      <p className="text-xl text-muted-foreground">
      Ein inoffizieller Abfahrtsmonitor für die U-Bahnen in München
    </p>
    <div className="grid grid-cols-4 my-5 gap-4">
      <GlobalDelayCard globalDelay={globalDelay} />
      <HighscoreCard stations={stations} />
      <DescriptionCard />
    </div>
    </div>
  )
}