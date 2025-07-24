# Development Setup

This document explains how to set up the development environment to connect the frontend to a local backend.

## Backend Setup

1. **Start the Go backend server:**
   ```bash
   cd backend
   go run ./
   ```
   The backend will start on `http://127.0.0.1:8080`

2. **Verify backend is running:**
   ```bash
   curl http://127.0.0.1:8080/health
   # Should return: OK
   ```

## Frontend Setup

1. **Start the frontend development server:**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```
   The frontend will start on `http://localhost:5173`

2. **API Proxy Configuration:**
   - The Vite dev server is configured with a proxy in `vite.config.ts`
   - All requests to `/api/*` are proxied to `http://127.0.0.1:8080`
   - The frontend automatically detects when running on localhost and uses the proxy

## How It Works

### Environment Detection
The application automatically detects the environment:
- **Development (localhost)**: Uses `/api` prefix which gets proxied to `127.0.0.1:8080`
- **Production**: Uses `https://api.mvgeht.de` directly

### API Configuration
All API calls use utilities from `app/lib/api.ts`:
- `getApiBaseUrl()`: Returns the appropriate base URL
- `getSSEUrl()`: Server-Sent Events endpoint
- `getStationStatsUrl(stationId)`: Station statistics endpoint  
- `getGlobalDelayUrl(params)`: Global delay analysis endpoint
- `getLineDelayUrl(params)`: Line-specific delay analysis endpoint

### Available Endpoints
When running locally, these endpoints are available:
- `GET /api/health` - Health check
- `GET /api/events` - Server-Sent Events for real-time data
- `GET /api/station_stats?station={id}` - Station statistics (new)
- `GET /api/global_delay?date={date}&interval={mins}&realtime={0|1}&threshold={mins}` - Global delay analysis
- `GET /api/line_delay?date={date}&south={0|1}&interval={mins}&realtime={0|1}&label={line}&threshold={mins}` - Line delay analysis

## Testing the Connection

1. **Check real-time data:**
   - Visit `http://localhost:5173`
   - The main page should show live departure data

2. **Check insights page:**
   - Visit `http://localhost:5173/insights`
   - Select a station from the dropdown
   - Charts should load with historical data

3. **Check PITA analysis:**
   - Visit `http://localhost:5173/pita`
   - Configure analysis settings
   - Charts should load with historical delay data

## Troubleshooting

### Backend Not Connecting
- Ensure Go backend is running on `127.0.0.1:8080`
- Check if ClickHouse and Redis are accessible from the backend
- Verify `CLICKHOUSE_PASSWORD` environment variable is set

### Frontend Proxy Issues
- **Test backend directly:** `curl http://127.0.0.1:8080/health` (should return "OK")
- **Test frontend proxy:** `curl http://localhost:5173/api/health` (should also return "OK")
- Restart the Vite dev server after changing proxy configuration
- Check browser developer tools Network tab for failed requests
- Ensure you're accessing the frontend via `localhost` (not `127.0.0.1`)

### Debugging Steps
1. **Check if backend is running:**
   ```bash
   curl http://127.0.0.1:8080/health
   ```

2. **Check if frontend dev server is running:**
   ```bash
   curl http://localhost:5173
   ```

3. **Test proxy connection:**
   ```bash
   curl http://localhost:5173/api/health
   ```

4. **Check Network tab in browser:**
   - Open browser developer tools
   - Go to Network tab
   - Refresh the page
   - Look for requests to `/api/events` - they should show up, not fail with CORS

### CORS Issues
- The backend includes CORS headers for development
- If you see CORS errors, verify the backend is returning proper headers
- Check that requests are going through the Vite proxy (should show as `/api/...` in Network tab)

### Common Issues
- **"Connection refused" on localhost:5173**: Frontend dev server not running - run `npm run dev`
- **500 error on /api/events**: Backend can't connect to Redis/ClickHouse - check backend logs
- **Requests go to production API**: You're not accessing via `localhost` - use `http://localhost:5173`, not `127.0.0.1:5173`
- **"converting UInt64 to *int64 is unsupported"**: Fixed in latest version - ClickHouse returns unsigned integers
- **"can't access property map, delayDistribution is null"**: Fixed with null safety checks in frontend