import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { TramFront, X } from "lucide-react"
import { Trans } from "react-i18next"

export function NoDeparturesCard() {
  return (
    <div className="m-5 flex h-1/2 items-center justify-center">
      <Card className="h-1/2 w-full">
        <CardHeader className="flex flex-col items-center justify-center">
          <CardTitle className="flex flex-col items-center justify-center text-center text-4xl">
            <div className="relative inline-block">
              <TramFront size={50} className="text-center text-gray-200" />
              <X
                strokeWidth={0.7}
                size={100}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-red-200"
              />
            </div>
            <Trans>PITA.NoDepartures.Title</Trans>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center">
          <p className="w-1/2 text-center text-muted-foreground">
            <Trans>PITA.NoDepartures.Description</Trans>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
