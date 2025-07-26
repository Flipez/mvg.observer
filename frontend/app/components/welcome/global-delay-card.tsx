import {
  formatDelay,
  stationWithMostDelay,
} from "~/components/departures/helper"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { cn } from "~/lib/utils"
import { StationList } from "~/types/departures"
import { Trans, useTranslation } from "react-i18next"

import { HelpPopover } from "../help-popover"

export function GlobalDelayCard({
  globalDelay,
  stations,
}: {
  globalDelay: number
  stations: StationList
}) {
  useTranslation() // Ensure re-render on language change
  const mostDelayStation = stationWithMostDelay(stations)
  const delayColor =
    globalDelay <= 0.5
      ? "text-green-500"
      : globalDelay <= 2.5
        ? "text-yellow-500"
        : "text-red-500"

  // Use translated delay text
  const getDelayText = () => {
    if (globalDelay <= 0.5) return "sehr gut" // This could be moved to translations too
    if (globalDelay <= 2.5) return "ganz ok"
    return "nicht so gut"
  }

  const delayText = getDelayText()
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
