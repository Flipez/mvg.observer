import {
  formatDelay,
  stationWithMostDelay,
} from "~/components/departures/helper"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import { StationList } from "~/types/departures"

export function HighscoreCard({ stations }: { stations: StationList }) {
  const mostDelayStation = stationWithMostDelay(stations)
  return (
    <Card>
      <CardHeader>
        <CardTitle>Highscore</CardTitle>
        <CardDescription>Top Stationen</CardDescription>
      </CardHeader>
      <CardContent>
        {mostDelayStation && (
          <div>
            Die größte durchschnittliche Verspätung hat im Moment die Station
            <b> {mostDelayStation.friendlyName}</b> mit{" "}
            {formatDelay(mostDelayStation.avgDelay)}.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
