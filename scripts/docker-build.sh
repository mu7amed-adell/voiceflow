#!/bin/bash

# Docker Build Script for VoiceFlow AI
# This script builds and tags the Docker image for different environments

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
IMAGE_NAME="voiceflow-ai"
VERSION=${1:-latest}
REGISTRY=${DOCKER_REGISTRY:-""}

echo -e "${BLUE}🐳 Building VoiceFlow AI Docker Image${NC}"
echo -e "${BLUE}=================================${NC}"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker and try again.${NC}"
    exit 1
fi

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo -e "${YELLOW}⚠️  .env.local not found. Creating template...${NC}"
    cat > .env.local << EOF
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
EOF
    echo -e "${YELLOW}Please update .env.local with your actual credentials${NC}"
fi

# Build the image
echo -e "${BLUE}📦 Building Docker image...${NC}"
docker build \
    --tag ${IMAGE_NAME}:${VERSION} \
    --tag ${IMAGE_NAME}:latest \
    --build-arg NODE_ENV=production \
    --build-arg NEXT_TELEMETRY_DISABLED=1 \
    .

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Docker image built successfully!${NC}"
    echo -e "${GREEN}   Image: ${IMAGE_NAME}:${VERSION}${NC}"
else
    echo -e "${RED}❌ Docker build failed${NC}"
    exit 1
fi

# Show image size
echo -e "${BLUE}📊 Image Information:${NC}"
docker images ${IMAGE_NAME}:${VERSION} --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}\t{{.CreatedAt}}"

# Tag for registry if specified
if [ ! -z "$REGISTRY" ]; then
    echo -e "${BLUE}🏷️  Tagging for registry: ${REGISTRY}${NC}"
    docker tag ${IMAGE_NAME}:${VERSION} ${REGISTRY}/${IMAGE_NAME}:${VERSION}
    docker tag ${IMAGE_NAME}:${VERSION} ${REGISTRY}/${IMAGE_NAME}:latest
    echo -e "${GREEN}✅ Tagged for registry${NC}"
fi

echo -e "${GREEN}🎉 Build complete!${NC}"
echo -e "${BLUE}Next steps:${NC}"
echo -e "  1. Test locally: ${YELLOW}docker run -p 3000:3000 --env-file .env.local ${IMAGE_NAME}:${VERSION}${NC}"
echo -e "  2. Or use docker-compose: ${YELLOW}docker-compose up${NC}"
if [ ! -z "$REGISTRY" ]; then
    echo -e "  3. Push to registry: ${YELLOW}docker push ${REGISTRY}/${IMAGE_NAME}:${VERSION}${NC}"
fi