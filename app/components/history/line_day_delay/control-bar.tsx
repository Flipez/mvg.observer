import { Dispatch, SetStateAction } from "react"
import { Checkbox } from "~/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import { Slider } from "~/components/ui/slider"
import { ChartSettings } from "~/types/history"
import { addDays, format } from "date-fns"

export function RealtimeCheckbox({
  settings,
  setSettings,
}: {
  settings: ChartSettings
  setSettings: Dispatch<SetStateAction<ChartSettings>>
}) {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox
        checked={settings.realtime}
        onCheckedChange={(checked) =>
          setSettings((prev: ChartSettings) => ({
            ...prev,
            realtime: checked as boolean,
          }))
        }
      />
      <span>Realtime</span>
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
    { value: 15, label: "15 Minutes" },
    { value: 30, label: "30 Minutes" },
    { value: 60, label: "60 Minutes" },
  ]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        Interval: {settings.interval} Minutes
      </DropdownMenuTrigger>
      <DropdownMenuContent>
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
  )
}

function LineDropdown({
  settings,
  setSettings,
}: {
  settings: ChartSettings
  setSettings: Dispatch<SetStateAction<ChartSettings>>
}) {
  // Define your interval options.
  const options = [
    { value: "U1", label: "U1" },
    { value: "U2", label: "U2" },
    { value: "U3", label: "U3" },
    { value: "U4", label: "U4" },
    { value: "U5", label: "U5" },
    { value: "U6", label: "U6" },
    { value: "U7", label: "U7" },
    { value: "U8", label: "U8" },
  ]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        Line: {settings.line}
      </DropdownMenuTrigger>
      <DropdownMenuContent>
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
  )
}

export function DateSlider({
  settings,
  setSettings,
}: {
  settings: ChartSettings
  setSettings: Dispatch<SetStateAction<ChartSettings>>
}) {
  const year = 2024
  const startDate = new Date(year, 1, 16) // January 1, 2024
  const daysInYear = year % 4 === 0 ? 366 : 365 // 2024 is a leap year

  // Calculate the selected date by adding the dayIndex to the start of the year.
  const selectedDate = addDays(startDate, settings.chartDate)
  const formattedDate = format(selectedDate, "yyyy-MM-dd")

  return (
    <div className="space-y-4">
      <p>Selected Date: {formattedDate}</p>
      <Slider
        value={[settings.chartDate]}
        min={0}
        max={daysInYear - 1}
        step={1}
        onValueChange={(value) =>
          setSettings((prev: ChartSettings) => ({
            ...prev,
            chartDate: value[0],
          }))
        }
      />
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
    <div className="flex items-center justify-between">
      <DateSlider settings={settings} setSettings={setSettings} />
      <RealtimeCheckbox settings={settings} setSettings={setSettings} />
      <LineDropdown settings={settings} setSettings={setSettings} />
      <IntervalDropdown settings={settings} setSettings={setSettings} />
    </div>
  )
}
