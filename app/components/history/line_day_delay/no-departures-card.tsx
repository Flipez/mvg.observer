import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Frown, Home, TramFront, X } from "lucide-react"

export function NoDeparturesCard() {
  return (
    <div className="m-5 flex h-1/2 items-center justify-center">
      <Card className="h-1/2 w-full">
        <CardHeader className="flex flex-col items-center justify-center">
          <CardTitle className="flex flex-col items-center justify-center text-center text-4xl">
            <div className="relative inline-block">
              <TramFront size={50} className="text-center text-gray-200" />
              <X strokeWidth={0.7} size={100} className="absolute top-1/2 left-1/2 text-red-200 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
            No Departures found
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center">
          <p className="w-1/2 text-center text-muted-foreground">
            This can have multiple reason. If you have selected the U7 or U8,
            please note that they only operate on specific times and days. If
            you only include Realtime Date, you might get unlucky and hit a day
            in which no such data is available.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
