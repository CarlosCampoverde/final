#!/bin/bash
# deploy.sh - Script de despliegue automatizado

set -e

echo "🚀 Starting deployment process..."

# Variables
PROJECT_NAME="proyectop2preubas"
DOCKER_IMAGE="ghcr.io/$GITHUB_REPOSITORY_OWNER/$PROJECT_NAME"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

# Build and tag Docker image
echo "📦 Building Docker image..."
docker build -t $DOCKER_IMAGE:latest -t $DOCKER_IMAGE:$TIMESTAMP .

# Push to registry
echo "📤 Pushing to container registry..."
docker push $DOCKER_IMAGE:latest
docker push $DOCKER_IMAGE:$TIMESTAMP

# Deploy script for different platforms
deploy_to_platform() {
    case $1 in
        "railway")
            echo "🚂 Deploying to Railway..."
            if command -v railway &> /dev/null; then
                railway deploy --service backend
            else
                echo "Railway CLI not found. Install: npm install -g @railway/cli"
            fi
            ;;
        "render")
            echo "🎨 Deploying to Render..."
            curl -X POST \
                -H "Authorization: Bearer $RENDER_API_KEY" \
                -H "Content-Type: application/json" \
                "https://api.render.com/v1/services/$RENDER_SERVICE_ID/deploys"
            ;;
        "fly")
            echo "🪰 Deploying to Fly.io..."
            if command -v flyctl &> /dev/null; then
                flyctl deploy
            else
                echo "Fly CLI not found. Install: curl -L https://fly.io/install.sh | sh"
            fi
            ;;
        *)
            echo "✨ Deployment completed to container registry"
            echo "Image: $DOCKER_IMAGE:latest"
            ;;
    esac
}

# Determine platform and deploy
if [ -n "$RAILWAY_TOKEN" ]; then
    deploy_to_platform "railway"
elif [ -n "$RENDER_API_KEY" ]; then
    deploy_to_platform "render"
elif [ -n "$FLY_API_TOKEN" ]; then
    deploy_to_platform "fly"
else
    deploy_to_platform "docker"
fi

echo "✅ Deployment process completed!"
