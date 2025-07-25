import type { MetaFunction } from "@remix-run/node"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Database, ExternalLink } from "lucide-react"

export const meta: MetaFunction = () => [
  { title: "About - MVG Observatory" },
  {
    name: "description",
    content:
      "Learn about the MVG Observatory project, data sources, and technical documentation",
  },
]

export default function About() {
  return (
    <div className="container mx-auto max-w-4xl space-y-8 py-8">
      {/* Data Source Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="size-5" />
            Data Source
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            The data is available at{" "}
            <a
              href="https://data.mvg.auch.cool"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-blue-600 hover:underline"
            >
              data.mvg.auch.cool
              <ExternalLink className="size-3" />
            </a>{" "}
            is sourced from MVG&apos;s official API endpoint. It contains
            real-time departure information from all Munich subway stations.
          </p>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-semibold">Collection Process</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Stations scraped every five minutes</li>
                <li>• All available departures stored</li>
                <li>• No retries on failed requests</li>
                <li>• Rate-limited to prevent API overload</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold">Data Quality</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Real-time departure updates</li>
                <li>• Delay information included</li>
                <li>• Historical data preserved</li>
                <li>• Raw API responses stored</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Structure Section */}
      <Card>
        <CardHeader>
          <CardTitle>Archive Structure</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            Daily archives are created at 4:00 AM CE(S)T containing all request
            and response data from the previous day. Archives use{" "}
            <code className="rounded bg-muted px-1">tar</code> compression with{" "}
            <a
              href="https://github.com/facebook/zstd"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              zstandard
            </a>
            .
          </p>

          {/* Directory Structure */}
          <div className="space-y-3">
            <h4 className="font-semibold">Directory Structure</h4>
            <div className="overflow-x-auto rounded-lg bg-slate-100 p-4 dark:bg-slate-900">
              <pre className="text-sm">
                {`20240615/
├── de:09162:1
│   ├── 1718409659_body.json
│   ├── 1718409659_meta.json
│   └── ...`}
              </pre>
            </div>
            <p className="text-sm text-muted-foreground">
              Each archive contains a root folder in{" "}
              <code className="rounded bg-muted px-1">YYYYMMDD</code> format
              with subfolders for each station ID containing timestamped request
              data.
            </p>
          </div>

          {/* Metadata Example */}
          <div className="space-y-3">
            <h4 className="font-semibold">Metadata Format</h4>
            <p className="text-sm text-muted-foreground">
              <code className="rounded bg-muted px-1">*_meta.json</code> files
              contain request metadata:
            </p>
            <div className="overflow-x-auto rounded-lg bg-slate-100 p-4 dark:bg-slate-900">
              <pre className="text-xs">
                {`{
  "response_code": 200,
  "total_time": 0.91127,
  "request_params": {
    "globalId": "de:09162:1"
  },
  "headers": {
    "content-type": "application/json;charset=UTF-8",
    "server": "SWM Webserver"
  },
  "size_download": 10905.0
}`}
              </pre>
            </div>
          </div>

          {/* Response Body Example */}
          <div className="space-y-3">
            <h4 className="font-semibold">Response Format</h4>
            <p className="text-sm text-muted-foreground">
              <code className="rounded bg-muted px-1">*_body.json</code> files
              contain raw API responses:
            </p>
            <div className="overflow-x-auto rounded-lg bg-slate-100 p-4 dark:bg-slate-900">
              <pre className="text-xs">
                {`[
  {
    "plannedDepartureTime": 1718409600000,
    "realtime": true,
    "realtimeDepartureTime": 1718409660000,
    "delayInMinutes": 1,
    "transportType": "BUS",
    "label": "N40",
    "destination": "Klinikum Großhadern",
    "occupancy": "LOW",
    "cancelled": false
  }
]`}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer Note */}
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <p className="text-center text-sm text-muted-foreground">
            This documentation is continuously updated as the project evolves.
            <br />
            <span className="mt-2 inline-flex items-center gap-1">
              For questions or contributions, visit our{" "}
              <a
                href="https://github.com/flipez/mvg.observer"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-blue-600 hover:underline"
              >
                GitHub repository
                <ExternalLink className="size-3" />
              </a>
            </span>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
