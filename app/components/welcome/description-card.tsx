import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import { Trans } from "react-i18next"

export function DescriptionCard() {
  return (
    <Card className="sm:col-span-1 md:col-span-2">
      <CardHeader>
        <CardTitle>
          <Trans>Welcome.Card.About.Title</Trans>
        </CardTitle>
        <CardDescription>
          <Trans>Welcome.Card.About.Description</Trans>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Trans
          i18nKey="Welcome.Card.About.Content"
          components={{
            green: <span className="text-green-500" />,
            yellow: <span className="text-yellow-500" />,
            red: <span className="text-red-500" />,
          }}
        />
      </CardContent>
    </Card>
  )
}
