# VoiceFlow AI - Production Deployment Guide

This guide provides comprehensive instructions for deploying VoiceFlow AI in production using Docker.

## 📋 Prerequisites

- Docker 20.10+ and Docker Compose 2.0+
- Node.js 18+ (for local development)
- Supabase project with configured database and storage
- OpenAI API key with sufficient credits

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Load Balancer │    │   Docker Host   │    │   External APIs │
│   (nginx/ALB)   │────│  VoiceFlow AI   │────│ Supabase/OpenAI│
│                 │    │   Container     │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### 1. Clone and Setup

```bash
# Clone the repository
git clone <repository-url>
cd voiceflow-ai

# Make scripts executable
chmod +x scripts/*.sh

# Create environment file
cp .env.example .env.local
# Edit .env.local with your actual credentials
```

### 2. Build and Run

```bash
# Build the Docker image
./scripts/docker-build.sh

# Run the container
./scripts/docker-run.sh

# Or use Docker Compose
docker-compose up -d
```

### 3. Verify Deployment

```bash
# Check health
curl http://localhost:3000/api/health

# View logs
docker logs -f voiceflow-ai-app
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | ✅ | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | ✅ | `eyJhbGciOiJIUzI1NiIs...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | ✅ | `eyJhbGciOiJIUzI1NiIs...` |
| `OPENAI_API_KEY` | OpenAI API key | ✅ | `sk-...` |
| `NEXT_PUBLIC_APP_URL` | Application URL | ❌ | `https://voiceflow.example.com` |
| `NODE_ENV` | Environment mode | ❌ | `production` |

### Docker Configuration

#### Resource Limits
```yaml
deploy:
  resources:
    limits:
      memory: 1G
      cpus: '0.5'
    reservations:
      memory: 512M
      cpus: '0.25'
```

#### Health Checks
```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

## 🏭 Production Deployment Options

### Option 1: Docker Compose (Recommended for single server)

```bash
# Production docker-compose
docker-compose -f docker-compose.prod.yml up -d

# With custom environment
docker-compose --env-file .env.production up -d

# Scale if needed
docker-compose up -d --scale voiceflow-ai=3
```

### Option 2: Docker Swarm (Multi-server)

```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml voiceflow

# Scale service
docker service scale voiceflow_voiceflow-ai=3
```

### Option 3: Kubernetes

```yaml
# k8s-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: voiceflow-ai
spec:
  replicas: 3
  selector:
    matchLabels:
      app: voiceflow-ai
  template:
    metadata:
      labels:
        app: voiceflow-ai
    spec:
      containers:
      - name: voiceflow-ai
        image: voiceflow-ai:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        envFrom:
        - secretRef:
            name: voiceflow-secrets
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
```

## 🔒 Security Best Practices

### 1. Environment Security
- Use Docker secrets for sensitive data
- Never commit `.env` files to version control
- Rotate API keys regularly
- Use least-privilege access for service accounts

### 2. Container Security
```dockerfile
# Use non-root user
USER nextjs

# Set security options
LABEL security.non-root=true
LABEL security.no-new-privileges=true
```

### 3. Network Security
```yaml
# Restrict network access
networks:
  voiceflow-network:
    driver: bridge
    internal: true  # No external access
```

## 📊 Monitoring and Logging

### Health Monitoring
```bash
# Check application health
curl -f http://localhost:3000/api/health

# Monitor container health
docker inspect --format='{{.State.Health.Status}}' voiceflow-ai-app
```

### Log Management
```bash
# View real-time logs
docker logs -f voiceflow-ai-app

# Export logs
docker logs voiceflow-ai-app > app.log 2>&1

# Log rotation (add to docker-compose.yml)
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

### Performance Monitoring
```bash
# Container stats
docker stats voiceflow-ai-app

# Resource usage
docker exec voiceflow-ai-app top
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Container Won't Start
```bash
# Check logs
docker logs voiceflow-ai-app

# Common causes:
# - Missing environment variables
# - Port conflicts
# - Insufficient resources
```

#### 2. Database Connection Issues
```bash
# Test database connectivity
docker exec voiceflow-ai-app npm run test:backend

# Check Supabase status
curl -I https://your-project.supabase.co
```

#### 3. OpenAI API Errors
```bash
# Verify API key
curl -H "Authorization: Bearer $OPENAI_API_KEY" \
     https://api.openai.com/v1/models

# Check usage limits
# Visit: https://platform.openai.com/usage
```

#### 4. Memory Issues
```bash
# Increase memory limit
docker run --memory=2g voiceflow-ai:latest

# Monitor memory usage
docker stats --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"
```

### Debug Mode
```bash
# Run with debug output
docker run -e DEBUG=* voiceflow-ai:latest

# Interactive debugging
docker run -it --entrypoint /bin/sh voiceflow-ai:latest
```

## 🔄 Updates and Maintenance

### Rolling Updates
```bash
# Build new version
./scripts/docker-build.sh v2.0.0

# Update with zero downtime
docker-compose up -d --no-deps voiceflow-ai

# Verify update
curl http://localhost:3000/api/health
```

### Backup Strategy
```bash
# Backup environment config
cp .env.local .env.backup.$(date +%Y%m%d)

# Database backup (handled by Supabase)
# Storage backup (handled by Supabase)
```

### Cleanup
```bash
# Remove old images
docker image prune -f

# Remove unused containers
docker container prune -f

# Full cleanup
docker system prune -a -f
```

## 📈 Scaling Considerations

### Horizontal Scaling
- Use load balancer (nginx, HAProxy, AWS ALB)
- Implement session affinity if needed
- Consider Redis for shared state

### Vertical Scaling
- Monitor CPU/memory usage
- Adjust container resource limits
- Optimize Next.js build configuration

### Database Scaling
- Supabase handles database scaling
- Monitor connection pool usage
- Consider read replicas for heavy read workloads

## 🌐 Cloud Deployment

### AWS ECS
```json
{
  "family": "voiceflow-ai",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "containerDefinitions": [
    {
      "name": "voiceflow-ai",
      "image": "your-registry/voiceflow-ai:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "secrets": [
        {
          "name": "OPENAI_API_KEY",
          "valueFrom": "arn:aws:secretsmanager:region:account:secret:openai-key"
        }
      ]
    }
  ]
}
```

### Google Cloud Run
```yaml
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: voiceflow-ai
spec:
  template:
    metadata:
      annotations:
        autoscaling.knative.dev/maxScale: "10"
    spec:
      containers:
      - image: gcr.io/project/voiceflow-ai:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: production
        resources:
          limits:
            cpu: 1000m
            memory: 1Gi
```

## 📞 Support

For deployment issues:
1. Check the troubleshooting section above
2. Review container logs: `docker logs voiceflow-ai-app`
3. Test individual components: `npm run test:backend`
4. Verify environment configuration: `npm run setup:env`

Remember to never share sensitive credentials in support requests!