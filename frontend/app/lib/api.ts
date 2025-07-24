// API configuration utilities

export function getApiBaseUrl(): string {
  // In development (when running vite dev), use the proxy
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname
    
    // Check if we're running on localhost with a dev server (typically port 5173 or 3000)
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return "/api"
    }
  }
  
  // Server-side or production environment
  if (typeof process !== "undefined" && process.env.NODE_ENV === "development") {
    return "http://127.0.0.1:8080/api"
  }
  
  // In production, the Go server serves both static files and API at /api
  return "/api"
}

export function getSSEUrl(): string {
  return `${getApiBaseUrl()}/events`
}

export function getStationStatsUrl(stationId: string, startDate?: string, endDate?: string): string {
  const params = new URLSearchParams({
    station: stationId,
  })
  
  if (startDate) {
    params.set('startDate', startDate)
  }
  if (endDate) {
    params.set('endDate', endDate)
  }
  
  return `${getApiBaseUrl()}/station_stats?${params.toString()}`
}

export function getGlobalDelayUrl(params: {
  date: string
  interval: string
  realtime: string
  threshold: string
}): string {
  const searchParams = new URLSearchParams(params)
  return `${getApiBaseUrl()}/global_delay?${searchParams.toString()}`
}

export function getLineDelayUrl(params: {
  date: string
  south: string
  interval: string
  realtime: string
  label: string
  threshold: string
}): string {
  const searchParams = new URLSearchParams(params)
  return `${getApiBaseUrl()}/line_delay?${searchParams.toString()}`
}