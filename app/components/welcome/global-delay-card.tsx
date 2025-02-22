import {
  formatDelay,
  stationWithMostDelay,
} from "~/components/departures/helper"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { cn } from "~/lib/utils"
import { StationList } from "~/types/departures"
import { Trans } from "react-i18next"

import { HelpPopover } from "../help-popover"

export function GlobalDelayCard({
  globalDelay,
  stations,
}: {
  globalDelay: number
  stations: StationList
}) {
  const mostDelayStation = stationWithMostDelay(stations)
  const delayColor =
    globalDelay <= 0.5
      ? "text-green-500"
      : globalDelay <= 2.5
        ? "text-yellow-500"
        : "text-red-500"
  const delayText =
    globalDelay <= 0.5
      ? "sehr gut"
      : globalDelay <= 2.5
        ? "ganz ok"
        : "nicht so gut"
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between">
          <CardTitle>
            <Trans>Welcome.Card.Status.Title</Trans>
          </CardTitle>
          <HelpPopover>
            <Trans
              i18nKey="Welcome.Card.About.Content"
              components={{
                green: <span className="text-green-500" />,
                yellow: <span className="text-yellow-500" />,
                red: <span className="text-red-500" />,
              }}
            />
          </HelpPopover>
        </div>
      </CardHeader>
      <CardContent>
        <Trans
          i18nKey="Welcome.Card.Status.Content"
          values={{ delay: formatDelay(globalDelay), delayText: delayText }}
          components={{
            delay: <span className={cn(delayColor, "font-bold")} />,
            delayText: <span className={cn(delayColor, "font-bold")} />,
          }}
        />
        &nbsp;
        {mostDelayStation && (
          <Trans
            i18nKey="Welcome.Card.Highscore.Content"
            values={{
              station: mostDelayStation.friendlyName,
              delay: formatDelay(mostDelayStation.avgDelay),
            }}
            components={{ station: <b></b>, delay: <b></b> }}
          />
        )}
      </CardContent>
    </Card>
  )
}
