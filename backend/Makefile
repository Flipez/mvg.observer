# MVG Observer Backend Makefile

.PHONY: test test-verbose test-coverage test-race build clean run lint

# Go parameters
GOCMD=go
GOBUILD=$(GOCMD) build
GOCLEAN=$(GOCMD) clean
GOTEST=$(GOCMD) test
GOGET=$(GOCMD) get
GOMOD=$(GOCMD) mod
BINARY_NAME=mvg-observer

# Build the application
build:
	$(GOBUILD) -o $(BINARY_NAME) -v ./

# Run the application
run:
	$(GOCMD) run ./

# Clean build artifacts
clean:
	$(GOCLEAN)
	rm -f $(BINARY_NAME)

# Download dependencies
deps:
	$(GOMOD) download
	$(GOMOD) tidy

# Run tests
test:
	$(GOTEST) -v ./...

# Run tests with verbose output
test-verbose:
	$(GOTEST) -v -count=1 ./...

# Run tests with coverage
test-coverage:
	$(GOTEST) -v -cover ./...
	$(GOTEST) -coverprofile=coverage.out ./...
	$(GOCMD) tool cover -html=coverage.out -o coverage.html

# Run tests with race detection
test-race:
	$(GOTEST) -v -race ./...

# Run benchmarks
benchmark:
	$(GOTEST) -v -bench=. -benchmem ./...

# Run specific test
test-clickhouse:
	$(GOTEST) -v -run TestClickhouse ./...

test-handlers:
	$(GOTEST) -v -run TestHandler ./...

test-redis:
	$(GOTEST) -v -run TestRedis ./...

test-friendly-names:
	$(GOTEST) -v -run TestFriendly ./...

# Lint code (requires golangci-lint)
lint:
	@which golangci-lint > /dev/null || (echo "golangci-lint not installed, run: curl -sSfL https://raw.githubusercontent.com/golangci/golangci-lint/master/install.sh | sh -s -- -b \$$(go env GOPATH)/bin v1.54.2"; exit 1)
	golangci-lint run

# Format code
fmt:
	$(GOCMD) fmt ./...

# Update dependencies
update-deps:
	$(GOGET) -u ./...
	$(GOMOD) tidy

# Security check (requires gosec)
security:
	@which gosec > /dev/null || (echo "gosec not installed, run: go install github.com/securecodewarrior/gosec/v2/cmd/gosec@latest"; exit 1)
	gosec ./...

# Full test suite
test-all: fmt lint test-race test-coverage benchmark

# Docker commands
docker-build:
	docker build -t mvg-observer:latest .

docker-run:
	docker run -p 8080:8080 mvg-observer:latest

# Development commands
dev-setup: deps
	@echo "Setting up development environment..."
	@which golangci-lint > /dev/null || echo "Consider installing golangci-lint for linting"
	@which gosec > /dev/null || echo "Consider installing gosec for security checks"

# Check test coverage and fail if below threshold
test-coverage-check:
	$(GOTEST) -coverprofile=coverage.out ./...
	@echo "Coverage report:"
	@$(GOCMD) tool cover -func=coverage.out
	@COVERAGE=$$($(GOCMD) tool cover -func=coverage.out | tail -n 1 | awk '{print $$3}' | sed 's/%//'); \
	if [ "$$(echo "$$COVERAGE < 80" | bc -l)" -eq 1 ]; then \
		echo "Coverage $$COVERAGE% is below 80% threshold"; \
		exit 1; \
	else \
		echo "Coverage $$COVERAGE% meets threshold"; \
	fi

# Help
help:
	@echo "Available targets:"
	@echo "  build              - Build the application"
	@echo "  run                - Run the application" 
	@echo "  clean              - Clean build artifacts"
	@echo "  deps               - Download dependencies"
	@echo "  test               - Run tests"
	@echo "  test-verbose       - Run tests with verbose output"
	@echo "  test-coverage      - Run tests with coverage report"
	@echo "  test-race          - Run tests with race detection"
	@echo "  benchmark          - Run benchmarks"
	@echo "  lint               - Lint code"
	@echo "  fmt                - Format code"
	@echo "  security           - Run security checks"
	@echo "  test-all           - Run full test suite"
	@echo "  dev-setup          - Setup development environment"
	@echo "  help               - Show this help"