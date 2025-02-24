import { useState } from "react"
import { Link, NavLink } from "@remix-run/react"
import { Button } from "~/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "~/components/ui/sheet"
import { Menu as MenuIcon } from "lucide-react"
import { useTranslation } from "react-i18next"

import LanguageSwitcher from "./language-switcher"

function useNavItems() {
  const { t } = useTranslation()
  return [
    { label: t("Links.Overview"), link: "/", blank: false },
    { label: t("Links.PITA"), link: "/pita", blank: false },
    { label: t("Links.Metrics"), link: "/grafana", blank: false },
    {
      label: "Status",
      link: "https://status.auch.cool/status/mvg",
      blank: true,
    },
  ]
}

export default function MobileNav() {
  const [open, setOpen] = useState(false)
  const navItems = useNavItems()

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {/* This button will trigger open the mobile sheet menu */}
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <MenuIcon />
        </Button>
      </SheetTrigger>

      <SheetContent side="left">
        <div className="flex flex-col items-start">
          {navItems.map((item, index) => (
            <Button
              asChild
              key={index}
              variant="link"
              onClick={() => {
                setOpen(false)
              }}
            >
              <Link
                to={item.link}
                target={item.blank ? "_blank" : ""}
                rel={item.blank ? "noopener noreferrer" : ""}
              >
                {item.label}
              </Link>
            </Button>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  )
}

function MainNav() {
  const navItems = useNavItems()
  return (
    <div className="mt-2 hidden gap-2 md:flex">
      {navItems.map((item, index) => (
        <NavLink
          key={index}
          to={item.link}
          target={item.blank ? "_blank" : ""}
          rel={item.blank ? "noopener noreferrer" : ""}
          className={({ isActive }) =>
            `mx-4 underline decoration-2 hover:decoration-solid ${isActive ? "decoration-solid" : "decoration-dotted"}`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </div>
  )
}

export function Header() {
  const { t } = useTranslation()

  return (
    <div>
      <header className="w-full border-b">
        <div className="px-4">
          <div className="flex h-14 items-center">
            <div className="text-3xl font-extrabold">
              <a href="/">{t("Title")}</a>
            </div>
            <MainNav />
            <MobileNav />
            <div className="ml-auto">
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </header>
    </div>
  )
}
