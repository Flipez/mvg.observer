#!/bin/bash

# Build script for MVG Observer

set -e

echo "Building frontend..."
cd frontend
pnpm build

echo "Copying frontend build to backend directory..."
cd ..
rm -rf backend/build/client
cp -r frontend/build backend/

echo "Building Go binary..."
cd backend
go build -o mvg-observer .

echo "Build complete! Binary is at backend/mvg-observer"