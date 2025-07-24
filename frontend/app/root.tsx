import type { LinksFunction, MetaFunction } from "@remix-run/node"
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react"

import "./tailwind.css"

import { useTranslation } from "react-i18next"

import { Header } from "./components/header"

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
]

export const meta: MetaFunction = () => [
  { title: "MVG Observer" },
  {
    name: "description",
    content: "An unofficial departure monitor for Munich's subways",
  },
]

export function Layout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation()

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <div className="flex min-h-screen flex-col">
          <Header />
          <div className="container mx-auto grow">{children}</div>
          <div>
            <footer className="border-t p-4 text-center">
              <p className="text-sm text-muted-foreground">
                {t("Description")}
              </p>
            </footer>
          </div>
        </div>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function App() {
  return <Outlet />
}
