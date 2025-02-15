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
import { Trans } from "react-i18next"

export function HighscoreCard({ stations }: { stations: StationList }) {
  const mostDelayStation = stationWithMostDelay(stations)
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Trans>Welcome.Card.Highscore.Title</Trans>
        </CardTitle>
        <CardDescription>
          <Trans>Welcome.Card.Highscore.Description</Trans>
        </CardDescription>
      </CardHeader>
      <CardContent>
        {mostDelayStation && (
          <div>
            <Trans
              i18nKey="Welcome.Card.Highscore.Content"
              values={{
                station: mostDelayStation.friendlyName,
                delay: formatDelay(mostDelayStation.avgDelay),
              }}
              components={{ station: <b></b> }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
