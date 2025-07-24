import { ReactNode } from "react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover"
import { CircleHelp } from "lucide-react"

interface HelpPopoverProps {
  children: ReactNode
  iconColor?: string
  size?: number
}
export function HelpPopover({
  children,
  iconColor = "text-gray-500",
  size = 20,
}: HelpPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger>
        <CircleHelp size={size} className={iconColor} />
      </PopoverTrigger>
      <PopoverContent>{children}</PopoverContent>
    </Popover>
  )
}
