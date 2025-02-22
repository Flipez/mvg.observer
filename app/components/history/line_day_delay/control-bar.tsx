import { Dispatch, SetStateAction } from "react"
import { DropdownMenuArrow } from "@radix-ui/react-dropdown-menu"
import { SubwayLabel } from "~/components/subway-label"
import { Button } from "~/components/ui/button"
import { Calendar } from "~/components/ui/calendar"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import { Label } from "~/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover"
import { Switch } from "~/components/ui/switch"
import { StationsByLine } from "~/data/subway-lines"
import { cn } from "~/lib/utils"
import { SubwayLine } from "~/types/departures"
import { ChartSettings } from "~/types/history"
import { addDays, format } from "date-fns"
import { CalendarIcon, MinusIcon, PlusIcon } from "lucide-react"

export function DatePicker({
  settings,
  setSettings,
}: {
  settings: ChartSettings
  setSettings: Dispatch<SetStateAction<ChartSettings>>
}) {
  const incrementDate = () => {
    setSettings((prev) => ({
      ...prev,
      chartDate: addDays(prev.chartDate, 1),
    }))
  }

  const decrementDate = () => {
    setSettings((prev) => ({
      ...prev,
      chartDate: addDays(prev.chartDate, -1),
    }))
  }

  return (
    <div className="flex flex-col space-y-2">
      <Label htmlFor="datepicker" className="text-sm font-medium">
        Date
      </Label>

      <div className="flex items-center">
        <Button
          className="mr-2 hidden xl:inline-flex"
          variant="outline"
          onClick={decrementDate}
        >
          <MinusIcon className="" />
        </Button>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="datepicker"
              variant={"outline"}
              className={cn("w-full justify-start text-left font-normal")}
            >
              <CalendarIcon />
              {format(settings.chartDate, "EEEE, MMM do yyyy")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              hidden={[
                {
                  before: new Date(2024, 1, 17),
                  after: new Date(2025, 1, 17),
                },
              ]}
              selected={settings.chartDate}
              onSelect={(selected) =>
                setSettings((prev: ChartSettings) => ({
                  ...prev,
                  chartDate: selected as Date,
                }))
              }
            />
          </PopoverContent>
        </Popover>
        <Button
          className="ml-2 hidden xl:inline-flex"
          variant="outline"
          onClick={incrementDate}
        >
          <PlusIcon className="h-4" />
        </Button>
      </div>
    </div>
  )
}

export function ShowRealtime({
  settings,
  setSettings,
}: {
  settings: ChartSettings
  setSettings: Dispatch<SetStateAction<ChartSettings>>
}) {
  return (
    <div>
      <div className="flex items-center space-x-2">
        <Switch
          checked={settings.realtime}
          onCheckedChange={(checked: boolean) =>
            setSettings((prev: ChartSettings) => ({
              ...prev,
              realtime: checked as boolean,
            }))
          }
        />
        <span>Only realtime data</span>
      </div>
    </div>
  )
}

export function ShowPercentage({
  settings,
  setSettings,
}: {
  settings: ChartSettings
  setSettings: Dispatch<SetStateAction<ChartSettings>>
}) {
  return (
    <div className="flex items-center space-x-2">
      <Switch
        checked={settings.showPercentage}
        onCheckedChange={(checked: boolean) =>
          setSettings((prev: ChartSettings) => ({
            ...prev,
            showPercentage: checked as boolean,
          }))
        }
      />
      <span>Enabled</span>
    </div>
  )
}

export function IntervalDropdown({
  settings,
  setSettings,
}: {
  settings: ChartSettings
  setSettings: Dispatch<SetStateAction<ChartSettings>>
}) {
  // Define your interval options.
  const options = [
    { value: 5, label: "5 Minutes" },
    { value: 10, label: "10 Minutes" },
    { value: 20, label: "20 Minutes" },
    { value: 60, label: "60 Minutes" },
  ]

  return (
    <div className="flex flex-col space-y-2">
      <Label htmlFor="intervalpicker" className="text-sm font-medium">
        Interval
      </Label>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button id="intervalpicker" variant="outline">
            {settings.interval} Minutes
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuArrow />
          {options.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onSelect={() =>
                setSettings((prev: ChartSettings) => ({
                  ...prev,
                  interval: option.value,
                }))
              }
            >
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export function ThresholdDropdown({
  settings,
  setSettings,
}: {
  settings: ChartSettings
  setSettings: Dispatch<SetStateAction<ChartSettings>>
}) {
  // Define your interval options.
  const options = [
    { value: 0, label: "0 Minutes" },
    { value: 1, label: "1 Minute" },
    { value: 2, label: "2 Minutes" },
    { value: 3, label: "3 Minutes" },
    { value: 4, label: "4 Minutes" },
    { value: 5, label: "5 Minutes" },
    { value: 10, label: "10 Minutes" },
    { value: 15, label: "15 Minutes" },
  ]

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger disabled={!settings.showPercentage}>
          <Button
            className="w-full"
            variant="outline"
            id="thresholdpicker"
            disabled={!settings.showPercentage}
          >
            {settings.threshold_label}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuArrow />
          {options.map((option) => (
            <DropdownMenuItem
              key={option.value}
              disabled={!settings.showPercentage}
              onSelect={() =>
                setSettings((prev: ChartSettings) => ({
                  ...prev,
                  threshold: option.value,
                  threshold_label: option.label,
                }))
              }
            >
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

function LineDropdown({
  settings,
  setSettings,
}: {
  settings: ChartSettings
  setSettings: Dispatch<SetStateAction<ChartSettings>>
}) {
  const options = (Object.keys(StationsByLine) as SubwayLine[]).map((line) => ({
    value: line,
    label: <SubwayLabel label={line} />,
  }))

  return (
    <div className="flex flex-col space-y-2">
      <Label htmlFor="linepicker" className="text-sm font-medium">
        Subway line
      </Label>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button id="linepicker" variant="outline">
            <SubwayLabel label={settings.line} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuArrow />
          <DropdownMenuLabel>Line</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {options.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onSelect={() =>
                setSettings((prev: ChartSettings) => ({
                  ...prev,
                  line: option.value,
                }))
              }
            >
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export function ControlBar({
  settings,
  setSettings,
}: {
  settings: ChartSettings
  setSettings: Dispatch<SetStateAction<ChartSettings>>
}) {
  return (
    <div className="m-5 grid gap-4 md:grid-cols-1 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Subject Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <DatePicker settings={settings} setSettings={setSettings} />
          <div className="flex w-full justify-between">
            <div className="">
              <LineDropdown settings={settings} setSettings={setSettings} />
            </div>
            <div className="">
              <IntervalDropdown settings={settings} setSettings={setSettings} />
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Realtime Data</CardTitle>
          <CardDescription>
            The MVG data carries a realtime attribute. If set, the departure
            time is really a live timestamp. If this attribute is not set, the
            departure time might not reflect the real departure time.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ShowRealtime settings={settings} setSettings={setSettings} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Analytics by Percentage</CardTitle>
          <CardDescription>
            Instead of showing the average delay in a given interval, the
            percentage of delayed subways can be displayed. The threshold at
            which a subway counts as delayed can be configured.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex w-full justify-between">
          <ShowPercentage settings={settings} setSettings={setSettings} />
          <ThresholdDropdown settings={settings} setSettings={setSettings} />
        </CardContent>
      </Card>
    </div>
  )
}
