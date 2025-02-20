"use client"

import { useEffect, useState } from "react"
import { Button } from "~/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import i18n from "~/translations"
import { GlobeIcon } from "lucide-react"

export default function LanguageSwitcher() {
  const [selectedLanguage, setSelectedLanguage] = useState("de")

  useEffect(() => {
    i18n.changeLanguage(selectedLanguage)
  }, [selectedLanguage])

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <GlobeIcon />
            <span className="font-medium">{selectedLanguage}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="bottom">
          <DropdownMenuLabel>Select Language</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => setSelectedLanguage("en")}>
              <span>English</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSelectedLanguage("de")}>
              <span>Deutsch</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
