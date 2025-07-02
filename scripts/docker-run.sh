#!/bin/bash

# Docker Run Script for VoiceFlow AI
# This script runs the Docker container with proper configuration

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
IMAGE_NAME="voiceflow-ai"
CONTAINER_NAME="voiceflow-ai-app"
PORT=${PORT:-3000}
ENV_FILE=${ENV_FILE:-.env.local}

echo -e "${BLUE}🚀 Running VoiceFlow AI Container${NC}"
echo -e "${BLUE}================================${NC}"

# Check if image exists
if ! docker image inspect ${IMAGE_NAME}:latest > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker image ${IMAGE_NAME}:latest not found${NC}"
    echo -e "${YELLOW}Build the image first: ./scripts/docker-build.sh${NC}"
    exit 1
fi

# Check if env file exists
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}❌ Environment file $ENV_FILE not found${NC}"
    echo -e "${YELLOW}Create $ENV_FILE with your configuration${NC}"
    exit 1
fi

# Stop existing container if running
if docker ps -q -f name=${CONTAINER_NAME} | grep -q .; then
    echo -e "${YELLOW}⏹️  Stopping existing container...${NC}"
    docker stop ${CONTAINER_NAME}
    docker rm ${CONTAINER_NAME}
fi

# Run the container
echo -e "${BLUE}🐳 Starting container...${NC}"
docker run \
    --name ${CONTAINER_NAME} \
    --env-file ${ENV_FILE} \
    -p ${PORT}:3000 \
    --restart unless-stopped \
    --detach \
    ${IMAGE_NAME}:latest

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Container started successfully!${NC}"
    echo -e "${GREEN}   Container: ${CONTAINER_NAME}${NC}"
    echo -e "${GREEN}   Port: ${PORT}${NC}"
    echo -e "${GREEN}   URL: http://localhost:${PORT}${NC}"
    
    # Show container status
    echo -e "${BLUE}📊 Container Status:${NC}"
    docker ps --filter name=${CONTAINER_NAME} --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    
    # Show logs
    echo -e "${BLUE}📝 Recent Logs:${NC}"
    docker logs --tail 10 ${CONTAINER_NAME}
    
    echo -e "${BLUE}💡 Useful Commands:${NC}"
    echo -e "  View logs: ${YELLOW}docker logs -f ${CONTAINER_NAME}${NC}"
    echo -e "  Stop container: ${YELLOW}docker stop ${CONTAINER_NAME}${NC}"
    echo -e "  Restart container: ${YELLOW}docker restart ${CONTAINER_NAME}${NC}"
    echo -e "  Remove container: ${YELLOW}docker rm -f ${CONTAINER_NAME}${NC}"
else
    echo -e "${RED}❌ Failed to start container${NC}"
    exit 1
fi