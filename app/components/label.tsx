import type { SubwayLine } from "~/types/departures"

type ColorConfig = Record<SubwayLine, string>

const DUAL_COLORED_LINES: SubwayLine[] = ["U7", "U8"]

const LINE_COLORS: {
  primary: ColorConfig
  secondary: Partial<ColorConfig>
} = {
  primary: {
    U1: "bg-u1",
    U2: "bg-u2",
    U3: "bg-u3",
    U4: "bg-u4",
    U5: "bg-u5",
    U6: "bg-u6",
    U7: "bg-u2",
    U8: "bg-u3",
  },
  secondary: {
    U7: "bg-u1",
    U8: "bg-u2",
  },
}

export function Label({ label }: { label: SubwayLine }) {
  const isDualColored = DUAL_COLORED_LINES.includes(label)

  return (
    <div className={`relative inline-flex ${LINE_COLORS.primary[label]}`}>
      {isDualColored && (
        <span
          className={`absolute left-0 top-0 z-10 size-full ${LINE_COLORS.secondary[label]} [clip-path:polygon(0%_0%,0%_100%,100%_0%)]`}
        />
      )}
      <span className="z-20 inline-flex w-7 justify-center px-1 py-0.5 text-xs font-medium text-white">
        {label}
      </span>
    </div>
  )
}
