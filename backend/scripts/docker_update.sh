#!/bin/bash

# Docker Hub Build and Push Script
# Usage: ./docker_update.sh [tag]
# Example: ./docker_update.sh latest
#          ./docker_update.sh v1.0.0

set -e  # Exit on any error

# Configuration
DOCKER_USERNAME="ayroid"
IMAGE_NAME="validuct_backend"
TAG="${1:-latest}"  # Default to 'latest' if no tag provided

FULL_IMAGE_NAME="${DOCKER_USERNAME}/${IMAGE_NAME}:${TAG}"

echo "============================================"
echo "🐳 Docker Build & Push Script"
echo "============================================"
echo "Image: ${FULL_IMAGE_NAME}"
echo "============================================"

# Navigate to backend directory (where Dockerfile is located)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(dirname "$SCRIPT_DIR")"
cd "$BACKEND_DIR"

echo ""
echo "📁 Working directory: $(pwd)"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if logged in to Docker Hub
if ! docker info 2>/dev/null | grep -q "Username"; then
    echo "🔐 Not logged in to Docker Hub. Attempting login..."
    docker login
fi

# Build the Docker image
echo ""
echo "🔨 Building Docker image..."
echo ""
docker build -t "${FULL_IMAGE_NAME}" .

# Also tag as latest if a specific version was provided
if [ "$TAG" != "latest" ]; then
    echo ""
    echo "🏷️  Also tagging as latest..."
    docker tag "${FULL_IMAGE_NAME}" "${DOCKER_USERNAME}/${IMAGE_NAME}:latest"
fi

# Push the Docker image
echo ""
echo "🚀 Pushing image to Docker Hub..."
echo ""
docker push "${FULL_IMAGE_NAME}"

# Push latest tag if we created it
if [ "$TAG" != "latest" ]; then
    echo ""
    echo "🚀 Pushing latest tag..."
    docker push "${DOCKER_USERNAME}/${IMAGE_NAME}:latest"
fi

echo ""
echo "============================================"
echo "✅ Successfully built and pushed!"
echo "   Image: ${FULL_IMAGE_NAME}"
echo "============================================"
echo ""
echo "📌 To pull this image:"
echo "   docker pull ${FULL_IMAGE_NAME}"
echo ""
