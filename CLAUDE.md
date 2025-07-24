# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MVG Observer is a real-time departure monitoring application for Munich's subway system (MVG). It consists of:

- **Frontend**: Remix React application with TypeScript, Tailwind CSS, and Radix UI components
- **Backend**: Go HTTP server that interfaces with ClickHouse database and Redis for real-time data streaming

## Development Commands

### Frontend (Node.js)
- **Development server**: `npm run dev` (or `pnpm dev`)
- **Build for production**: `npm run build`
- **Production server**: `npm start`  
- **Linting**: `npm run lint`
- **Type checking**: `npm run typecheck`
- **Code formatting**: `npm run pretty`

**IMPORTANT**: Always run `pnpm lint` and `pnpm pretty` after making code changes to ensure code quality and consistent formatting.

### Backend (Go)
- **Run Go server**: `go run ./backend/`
- **Build Go binary**: `go build -o mvg-observer ./backend/`

## Architecture

### Frontend Structure
- **Routes**: Primary route is `app/routes/_index.tsx` with tab-based interface (grid/table/map views)
- **Components**: Organized by feature in `app/components/` 
  - `departures/` - Station departure displays and tables
  - `history/` - Historical data visualization
  - `ui/` - Reusable UI components (Radix-based)
- **Data Management**: 
  - Real-time data via Server-Sent Events from Go backend
  - Custom hook `useDepartures` for managing station data
  - i18n support with react-i18next

### Backend Structure  
- **main.go**: HTTP server with SSE endpoint `/events`, REST APIs for delay data
- **clickhouse.go**: Database queries for historical delay analysis
- **friendly_names.go**: Station ID to human-readable name mappings
- **Data Flow**: Redis keyspace notifications → filtered departures → SSE broadcast to clients

### Key Technologies
- **Frontend**: Remix, React, TypeScript, Tailwind CSS, Radix UI, MapLibre GL
- **Backend**: Go, ClickHouse, Redis
- **Real-time**: Server-Sent Events (SSE) with Redis streams
- **Deployment**: Frontend and backend can be deployed separately

## Data Types
- Departures include delay information, occupancy, realtime status
- Station data combines departures with coordinates and friendly names
- Historical data supports line-specific and global delay analysis

## Development Notes
- Backend runs on `127.0.0.1:8080` by default
- Frontend expects backend API for real-time departure data
- Subway lines are filtered (U-Bahn only, max 8 departures per station)
- Uses pnpm for package management (lock file present)