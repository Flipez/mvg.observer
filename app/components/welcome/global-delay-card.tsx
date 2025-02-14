import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import { formatDelay } from "~/departures/helper"

export function GlobalDelayCard({globalDelay}: {globalDelay: number}) {
  const delayColor =
    globalDelay <= .5
      ? "text-green-500"
      : globalDelay <= 2.5
        ? "text-yellow-500"
        : "text-red-500"
  const delayText =
    globalDelay <= .5
      ? "sehr gut"
      : globalDelay <= 2.5
        ? "ganz ok"
        : "nicht so gut"
  return(
    <Card>
    <CardHeader>
      <CardTitle>Zustand</CardTitle>
      <CardDescription>Stationsübergreifende Informationen</CardDescription>
    </CardHeader>
    <CardContent>
      Aktuell haben die U-Bahnen im Durchschnitt <span className={delayColor}>{formatDelay(globalDelay)}</span> Verspätung, das ist <span className={delayColor}>{delayText}</span>.
    </CardContent>
  </Card>
  )
}