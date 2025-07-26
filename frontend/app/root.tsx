import { useEffect, useState } from "react"
import type { LinksFunction, MetaFunction } from "@remix-run/node"
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react"
import { I18nextProvider } from "react-i18next"

import "./tailwind.css"

import { Footer } from "./components/footer"
import { Header } from "./components/header"
import i18n from "./translations"

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

function I18nWrapper({ children }: { children: React.ReactNode }) {
  const [i18nReady, setI18nReady] = useState(false)

  useEffect(() => {
    const checkI18nReady = () => {
      if (i18n.isInitialized) {
        setI18nReady(true)
      } else {
        // Wait for i18n to be initialized
        i18n.on("initialized", () => {
          setI18nReady(true)
        })
      }
    }

    checkI18nReady()
  }, [])

  if (!i18nReady) {
    return <div>Loading...</div>
  }

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        {process.env.NODE_ENV === "production" && (
          <script
            defer
            src="https://stats.auch.cool/script.js"
            data-website-id="f86708ed-aa40-44b3-9dc3-cbbc71a4d1e2"
          ></script>
        )}
      </head>
      <body>
        <I18nWrapper>
          <div className="flex min-h-screen flex-col">
            <Header />
            <div className="container mx-auto grow">{children}</div>
            <Footer />
          </div>
        </I18nWrapper>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function App() {
  return <Outlet />
}
