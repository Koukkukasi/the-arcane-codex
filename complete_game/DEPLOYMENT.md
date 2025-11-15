# The Arcane Codex - Production Deployment Guide

## Table of Contents
1. [Quick Start](#quick-start)
2. [Architecture Overview](#architecture-overview)
3. [Deployment Options](#deployment-options)
4. [Configuration](#configuration)
5. [Monitoring](#monitoring)
6. [Scaling](#scaling)
7. [Security](#security)
8. [Troubleshooting](#troubleshooting)

---

## Quick Start

### Local Development with Docker

```bash
# 1. Clone the repository
git clone <repository-url>
cd complete_game

# 2. Copy environment file
cp .env.example .env

# 3. Edit .env with your configuration
nano .env

# 4. Start services
docker-compose up -d

# 5. Check health
curl http://localhost/health
```

### Production Deployment with Docker Compose

```bash
# 1. Set environment variables
export SECRET_KEY=$(python -c "import secrets; print(secrets.token_hex(32))")
export REDIS_PASSWORD=$(python -c "import secrets; print(secrets.token_hex(16))")

# 2. Deploy with production compose file
docker-compose -f docker-compose.prod.yml up -d --scale app=3

# 3. Verify deployment
docker-compose -f docker-compose.prod.yml ps
curl https://your-domain.com/health
```

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    NGINX Load Balancer                   │
│         (SSL Termination, Rate Limiting, Caching)        │
└────────────┬──────────────┬──────────────┬──────────────┘
             │              │              │
    ┌────────▼──────┐ ┌─────▼──────┐ ┌─────▼──────┐
    │  App Instance │ │App Instance│ │App Instance│
    │   (Flask +    │ │  (Flask +  │ │  (Flask +  │
    │   SocketIO)   │ │  SocketIO) │ │  SocketIO) │
    └────────┬──────┘ └─────┬──────┘ └─────┬──────┘
             │              │              │
             └──────────────┴──────────────┘
                            │
                ┌───────────┴───────────┐
                │                       │
        ┌───────▼────────┐     ┌────────▼────────┐
        │ Redis Cache    │     │ SQLite Database │
        │ (Session Store)│     │ (Game State)    │
        └────────────────┘     └─────────────────┘
```

### Components

1. **NGINX**: Reverse proxy, load balancer, SSL termination
2. **Flask Application**: Python web server with SocketIO
3. **Redis**: Distributed cache and session store
4. **SQLite**: Persistent game state storage
5. **Health Checks**: Kubernetes-ready endpoints

---

## Deployment Options

### Option 1: Docker Compose (Recommended)

**Best for**: Small to medium deployments, single server

```bash
# Development
docker-compose up -d

# Production (3 instances)
docker-compose -f docker-compose.prod.yml up -d --scale app=3
```

### Option 2: Kubernetes

**Best for**: Large scale, high availability

```bash
# Apply Kubernetes manifests
kubectl apply -f k8s/

# Scale deployment
kubectl scale deployment arcane-app --replicas=5
```

### Option 3: Cloud Platforms

#### Heroku
```bash
heroku create arcane-codex
heroku addons:create heroku-redis:hobby-dev
git push heroku main
```

#### AWS ECS
```bash
# Build and push image
docker build -t arcane-codex .
aws ecr get-login-password | docker login --username AWS --password-stdin <ecr-url>
docker tag arcane-codex:latest <ecr-url>/arcane-codex:latest
docker push <ecr-url>/arcane-codex:latest

# Deploy to ECS
aws ecs update-service --cluster arcane --service arcane-app --force-new-deployment
```

#### Google Cloud Run
```bash
gcloud run deploy arcane-codex \
  --image gcr.io/PROJECT-ID/arcane-codex \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

---

## Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `SECRET_KEY` | Flask secret key | - | Yes |
| `DB_PATH` | SQLite database path | arcane_codex.db | No |
| `REDIS_URL` | Redis connection URL | - | Yes (prod) |
| `CACHE_ENABLED` | Enable Redis caching | true | No |
| `RATE_LIMIT_ENABLED` | Enable rate limiting | true | No |
| `MAX_CONCURRENT_GAMES` | Max simultaneous games | 100 | No |
| `CORS_ORIGINS` | Allowed CORS origins | * | No |

### Security Configuration

1. **Generate Secret Key**:
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

2. **SSL Certificates**:
```bash
# Self-signed for testing
openssl req -x509 -newkey rsa:4096 -nodes \
  -keyout nginx/ssl/key.pem \
  -out nginx/ssl/cert.pem \
  -days 365

# Production: Use Let's Encrypt
certbot certonly --webroot -w /var/www/html -d your-domain.com
```

3. **CORS Setup**:
```bash
# Restrict to specific domain
export CORS_ORIGINS="https://yourdomain.com,https://www.yourdomain.com"
```

---

## Monitoring

### Health Endpoints

- `/health` - Comprehensive health check
- `/health/ready` - Readiness probe (for load balancers)
- `/health/live` - Liveness probe (for orchestration)
- `/metrics` - Performance metrics

### Prometheus Metrics

```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'arcane-codex'
    static_configs:
      - targets: ['localhost:5000']
    metrics_path: '/metrics'
```

### Logging

```bash
# View logs
docker-compose logs -f app

# Filter errors
docker-compose logs app | grep ERROR

# Export to file
docker-compose logs --no-color app > app.log
```

### Performance Monitoring

```bash
# Get current metrics
curl http://localhost/metrics

# Example response:
{
  "active_games": 15,
  "active_connections": 42,
  "cache_hit_rate": 0.85,
  "database": {
    "pool_size": 20,
    "active": 5,
    "available": 15
  }
}
```

---

## Scaling

### Horizontal Scaling (Multiple Instances)

```bash
# Docker Compose
docker-compose -f docker-compose.prod.yml up -d --scale app=5

# Kubernetes
kubectl scale deployment arcane-app --replicas=10
```

### Vertical Scaling (Resource Limits)

```yaml
# docker-compose.prod.yml
deploy:
  resources:
    limits:
      cpus: '4.0'
      memory: 4G
    reservations:
      cpus: '2.0'
      memory: 2G
```

### Database Optimization

```python
# Increase connection pool
DB_POOL_SIZE=50

# Optimize SQLite
PRAGMA cache_size = -128000;  # 128MB cache
PRAGMA journal_mode = WAL;     # Write-Ahead Logging
```

### Redis Scaling

```bash
# Redis Cluster
docker run -d --name redis-cluster \
  redis:7-alpine redis-server --cluster-enabled yes

# Redis Sentinel (HA)
docker run -d --name redis-sentinel \
  redis:7-alpine redis-sentinel /etc/redis/sentinel.conf
```

---

## Security

### Security Checklist

- [ ] Change default SECRET_KEY
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS properly
- [ ] Enable rate limiting
- [ ] Set up firewall rules
- [ ] Use Redis password
- [ ] Restrict /metrics endpoint
- [ ] Set up WAF (Web Application Firewall)
- [ ] Enable security headers
- [ ] Regular security updates

### Rate Limiting

```python
# Configure in .env
RATE_LIMIT_ENABLED=true
MAX_REQUESTS_PER_MINUTE=60

# Custom limits per endpoint
@rate_limit(max_requests=10)
def sensitive_endpoint():
    pass
```

### Input Validation

All user inputs are validated and sanitized:
- XSS protection
- SQL injection prevention
- Input length limits
- Character whitelisting

### Network Security

```bash
# Firewall rules
ufw allow 80/tcp
ufw allow 443/tcp
ufw deny 5000/tcp  # Block direct app access
ufw enable
```

---

## Troubleshooting

### Common Issues

#### 1. Connection Pool Exhausted

**Symptoms**: `Connection pool exhausted` errors

**Solution**:
```bash
# Increase pool size
export DB_POOL_SIZE=50
docker-compose restart app
```

#### 2. Redis Connection Failures

**Symptoms**: `Failed to connect to Redis` warnings

**Solution**:
```bash
# Check Redis
docker-compose logs redis

# Restart Redis
docker-compose restart redis

# Verify connection
redis-cli ping
```

#### 3. WebSocket Disconnections

**Symptoms**: Frequent player disconnections

**Solution**:
```nginx
# Increase NGINX timeouts in nginx.conf
proxy_read_timeout 7d;
proxy_send_timeout 7d;
```

#### 4. High Memory Usage

**Symptoms**: Out of memory errors

**Solution**:
```bash
# Check memory usage
docker stats

# Increase container limits
# or reduce cache size
export CACHE_DEFAULT_TTL=60
```

#### 5. Slow Database Queries

**Symptoms**: Long response times

**Solution**:
```python
# Enable query logging
import logging
logging.getLogger('database').setLevel(logging.DEBUG)

# Analyze slow queries in logs
# Add indexes as needed
```

### Debug Mode

```bash
# Enable debug logging
export DEBUG=true
export LOG_LEVEL=DEBUG

# Restart application
docker-compose restart app

# View detailed logs
docker-compose logs -f app
```

### Health Check Failures

```bash
# Manual health check
curl -v http://localhost/health

# Check specific components
curl http://localhost/health/ready
curl http://localhost/health/live

# View health metrics
curl http://localhost/metrics
```

---

## Performance Tuning

### Recommended Settings

**Small Deployment** (< 50 concurrent users):
```bash
DB_POOL_SIZE=10
MAX_CONCURRENT_GAMES=25
# 1 app instance
# 256MB Redis
```

**Medium Deployment** (50-200 concurrent users):
```bash
DB_POOL_SIZE=20
MAX_CONCURRENT_GAMES=100
# 3 app instances
# 512MB Redis
```

**Large Deployment** (200+ concurrent users):
```bash
DB_POOL_SIZE=50
MAX_CONCURRENT_GAMES=500
# 5+ app instances
# 1GB Redis
# Consider PostgreSQL instead of SQLite
```

---

## Backup and Recovery

### Database Backup

```bash
# Automated backup script
#!/bin/bash
BACKUP_DIR=/backups
DATE=$(date +%Y%m%d_%H%M%S)

# Backup SQLite database
sqlite3 arcane_codex.db ".backup $BACKUP_DIR/arcane_$DATE.db"

# Compress
gzip $BACKUP_DIR/arcane_$DATE.db

# Keep only last 30 days
find $BACKUP_DIR -name "arcane_*.db.gz" -mtime +30 -delete
```

### Redis Backup

```bash
# Manual backup
docker exec arcane_redis redis-cli BGSAVE

# Copy RDB file
docker cp arcane_redis:/data/dump.rdb ./backup/
```

### Restore

```bash
# Restore database
gunzip arcane_20240115.db.gz
mv arcane_20240115.db arcane_codex.db

# Restart application
docker-compose restart app
```

---

## Support

For issues and questions:
- GitHub Issues: [repository-url]/issues
- Documentation: [repository-url]/docs
- Discord: [discord-link]

---

## License

[Your License Here]
