# GitHub Actions CI/CD

This repository includes automated CI/CD workflows for building, testing, and publishing the MVG Observer application.

## Workflows

### 1. PR Check (`pr-check.yml`)
**Trigger**: Pull requests to `main` branch

**Actions**:
- ✅ Build frontend with pnpm
- ✅ Build backend with Go
- ✅ Run Go tests
- ✅ Test Docker container build
- ✅ Verify container health and static file serving
- 💬 Comment on PR with build status

### 2. Build and Publish (`build-and-publish.yml`)
**Trigger**: Push to `main` branch (merged PRs)

**Actions**:
- 🐳 Build multi-platform Docker image (linux/amd64, linux/arm64)
- 📦 Push to GitHub Container Registry (`ghcr.io`)
- 🏷️ Tag with multiple formats:
  - `latest` for main branch
  - `main-<sha>` for commit tracking
  - `main` for branch reference

## Container Registry

Images are published to GitHub Container Registry:
```
ghcr.io/flipez/mvg-observer:latest
ghcr.io/flipez/mvg-observer:main
ghcr.io/flipez/mvg-observer:main-<commit-sha>
```

## Deployment

### Using Repository Files

The repository includes a `docker-compose.yml` file ready for deployment.

### Simple Deployment

1. Clone the repository or copy `docker-compose.yml`
2. Configure environment variables in the compose file
3. Deploy:

```bash
# Pull latest image and start services
docker-compose pull mvg-observer
docker-compose up -d

# Or in one command
docker-compose up -d --pull always
```

### Environment Variables

Required environment variables for deployment:

```bash
CLICKHOUSE_HOST=your-clickhouse-host
CLICKHOUSE_PORT=443
CLICKHOUSE_DATABASE=mvg
CLICKHOUSE_USERNAME=mvgobserver
CLICKHOUSE_PASSWORD=your-secure-password
```

## Usage Examples

### Pull and Run Latest Image

```bash
# Pull latest image
docker pull ghcr.io/flipez/mvg-observer:latest

# Run with docker-compose
docker-compose up -d

# Or run standalone
docker run -d \
  -p 8080:8080 \
  -e CLICKHOUSE_HOST=your-host \
  -e CLICKHOUSE_PASSWORD=your-password \
  ghcr.io/flipez/mvg-observer:latest
```

### Update to Latest Version

```bash
# Pull latest image and restart
docker-compose pull mvg-observer
docker-compose up -d --force-recreate mvg-observer
```

## Security Notes

- 🔐 Images are public on GitHub Container Registry
- 🔒 Container images are built with minimal attack surface
- 🛡️ Health checks ensure container is responding before marking as ready
- 🔑 Configure sensitive environment variables securely

## Monitoring

The container includes:
- Health check endpoint: `/api/health`
- Structured logging for debugging  
- Graceful shutdown handling
- Multi-platform support (AMD64/ARM64)