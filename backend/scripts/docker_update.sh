#!/bin/bash

# Docker Hub Build and Push Script
# Usage: ./docker_update.sh [tag]
# Example: ./docker_update.sh latest
#          ./docker_update.sh v1.0.0

set -e  # Exit on any error

DOCKER_USERNAME="ayroid"
IMAGE_NAME="validuct_backend"

# Get tag
if [ -z "$1" ]; then
    echo ""
    read -p "🏷️  Enter Docker image tag (required): " TAG

    if [ -z "$TAG" ]; then
        echo "❌ Error: Docker image tag is required."
        exit 1
    fi
else
    TAG="$1"
fi

FULL_IMAGE_NAME="${DOCKER_USERNAME}/${IMAGE_NAME}:${TAG}"

echo "============================================"
echo "🐳 Docker Build & Push Script"
echo "============================================"
echo "Image: ${FULL_IMAGE_NAME}"
echo "============================================"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(dirname "$SCRIPT_DIR")"
cd "$BACKEND_DIR"

echo ""
echo "📁 Working directory: $(pwd)"
echo ""

if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running."
    exit 1
fi

if ! docker info 2>/dev/null | grep -q "Username"; then
    echo "🔐 Not logged in to Docker Hub. Attempting login..."
    docker login
fi

echo ""
echo "🔨 Building Docker image..."
echo ""
docker build -t "${FULL_IMAGE_NAME}" .

echo ""
echo "🚀 Pushing image to Docker Hub..."
echo ""
docker push "${FULL_IMAGE_NAME}"

echo ""
echo "============================================"
echo "✅ Successfully built and pushed!"
echo "   Image: ${FULL_IMAGE_NAME}"
echo "============================================"
echo ""
echo "📌 To pull this image:"
echo "   docker pull ${FULL_IMAGE_NAME}"
echo ""
