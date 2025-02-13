import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"

export function DescriptionCard() {
 return(
    <Card className="col-span-2">
    <CardHeader>
      <CardTitle>MVGeht</CardTitle>
      <CardDescription>Was sehen meine Augen hier?</CardDescription>
    </CardHeader>
    <CardContent>
      Wenn die nächsten U-Bahen an einer Station im Schnitt mehr als 0 Minuten Verspätung haben, also alle pünktlich sind, dann wird die Station <span className="text-green-500">grün</span> angezeigt.
      Sind es mehr als 0 aber weniger als 5 Minuten Verspätung, dann ist die Station <span className="text-yellow-500">gelb</span>.
      Bei mehr als 5 Minuten Verspätung wird die Station dann <span className="text-red-500">rot</span> dargestellt.
    </CardContent>
  </Card>
 )
}