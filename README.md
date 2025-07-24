# MVG Observer

Real-time departure monitoring for Munich's subway system (MVG).

## Project Structure

- `frontend/` - React/Remix frontend application
- `backend/` - Go HTTP server with ClickHouse integration  
- `.github/` - CI/CD workflows

## Development

### Frontend
```bash
cd frontend
pnpm install
pnpm dev
```

### Backend  
```bash
cd backend
go run .
```

### Docker
```bash
docker-compose up
```

## Build & Deploy

The project uses multi-stage Docker builds. GitHub Actions automatically builds and publishes container images on push to main.
