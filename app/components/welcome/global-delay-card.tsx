import { formatDelay } from "~/components/departures/helper"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import { Trans } from "react-i18next"

export function GlobalDelayCard({ globalDelay }: { globalDelay: number }) {
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
        <CardTitle>
          <Trans>Welcome.Card.Status.Title</Trans>
        </CardTitle>
        <CardDescription>
          <Trans>Welcome.Card.Status.Description</Trans>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Trans
          i18nKey="Welcome.Card.Status.Content"
          values={{ delay: formatDelay(globalDelay), delayText: delayText }}
          components={{
            delay: <span className={delayColor} />,
            delayText: <span className={delayColor} />,
          }}
        />
      </CardContent>
    </Card>
  )
}
