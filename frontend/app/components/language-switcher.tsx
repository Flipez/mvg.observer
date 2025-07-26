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
  const [selectedLanguage, setSelectedLanguage] = useState(
    i18n.language || "de"
  )

  useEffect(() => {
    // Initialize with current i18n language
    setSelectedLanguage(i18n.language || "de")

    // Listen for language changes from i18n
    const handleLanguageChange = (lng: string) => {
      setSelectedLanguage(lng)
    }

    i18n.on("languageChanged", handleLanguageChange)

    return () => {
      i18n.off("languageChanged", handleLanguageChange)
    }
  }, [])

  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language)
    i18n.changeLanguage(language)
  }

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="flex items-center gap-2"
            data-testid="language-switcher"
          >
            <GlobeIcon />
            <span className="font-medium">{selectedLanguage}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="bottom">
          <DropdownMenuLabel>Select Language</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => handleLanguageChange("en")}>
              <span>English</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleLanguageChange("de")}>
              <span>Deutsch</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
