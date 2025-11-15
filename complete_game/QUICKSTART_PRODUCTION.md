# The Arcane Codex - Production Quick Start Guide

## 5-Minute Production Deployment

### Prerequisites
- Docker and Docker Compose installed
- Domain name (optional but recommended)
- SSL certificates (or use Let's Encrypt)

---

## Step 1: Clone and Configure (1 minute)

```bash
# Clone repository
git clone <your-repo-url>
cd complete_game

# Copy environment template
cp .env.example .env

# Generate secrets
export SECRET_KEY=$(python -c "import secrets; print(secrets.token_hex(32))")
export REDIS_PASSWORD=$(python -c "import secrets; print(secrets.token_hex(16))")

# Add to .env
echo "SECRET_KEY=$SECRET_KEY" >> .env
echo "REDIS_PASSWORD=$REDIS_PASSWORD" >> .env
```

---

## Step 2: SSL Certificates (1 minute)

### Option A: Self-Signed (Testing)
```bash
mkdir -p nginx/ssl
openssl req -x509 -newkey rsa:4096 -nodes \
  -keyout nginx/ssl/key.pem \
  -out nginx/ssl/cert.pem \
  -days 365 \
  -subj "/CN=localhost"
```

### Option B: Let's Encrypt (Production)
```bash
# Install certbot
apt-get install certbot

# Get certificate
certbot certonly --standalone -d your-domain.com

# Copy to nginx directory
cp /etc/letsencrypt/live/your-domain.com/fullchain.pem nginx/ssl/cert.pem
cp /etc/letsencrypt/live/your-domain.com/privkey.pem nginx/ssl/key.pem
```

---

## Step 3: Deploy (2 minutes)

### Development (Single Instance)
```bash
docker-compose up -d
```

### Production (3 Instances + Load Balancing)
```bash
docker-compose -f docker-compose.prod.yml up -d --scale app=3
```

---

## Step 4: Verify (1 minute)

```bash
# Check containers are running
docker-compose ps

# Health check
curl http://localhost/health

# Or with SSL
curl -k https://localhost/health

# View logs
docker-compose logs -f app
```

Expected response:
```json
{
  "status": "healthy",
  "checks": {
    "database": {"healthy": true},
    "cache": {"healthy": true},
    "uptime": {"uptime_seconds": 30}
  }
}
```

---

## Step 5: Access Application

Open browser:
- HTTP: `http://localhost` or `http://your-domain.com`
- HTTPS: `https://localhost` or `https://your-domain.com`

---

## Common Commands

### Start Services
```bash
docker-compose up -d
```

### Stop Services
```bash
docker-compose down
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app
docker-compose logs -f nginx
docker-compose logs -f redis
```

### Restart Services
```bash
# All
docker-compose restart

# Specific
docker-compose restart app
```

### Scale Application
```bash
# Scale to 5 instances
docker-compose -f docker-compose.prod.yml up -d --scale app=5
```

### Update Application
```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose build app
docker-compose up -d
```

---

## Monitoring

### Health Endpoints
```bash
# Comprehensive health
curl http://localhost/health

# Readiness (for load balancers)
curl http://localhost/health/ready

# Liveness (for orchestration)
curl http://localhost/health/live

# Metrics
curl http://localhost/metrics
```

### Container Stats
```bash
# Real-time stats
docker stats

# Disk usage
docker system df
```

---

## Environment Variables (Critical)

Required in `.env`:
```bash
SECRET_KEY=<generate-with-python>
REDIS_PASSWORD=<generate-with-python>
ANTHROPIC_API_KEY=<your-api-key>
```

Optional but recommended:
```bash
CORS_ORIGINS=https://your-domain.com
MAX_CONCURRENT_GAMES=100
RATE_LIMIT_ENABLED=true
CACHE_ENABLED=true
```

---

## Security Checklist

Before going live:
- [ ] Changed SECRET_KEY from default
- [ ] Set REDIS_PASSWORD
- [ ] Configured SSL certificates
- [ ] Updated CORS_ORIGINS to your domain
- [ ] Enabled rate limiting
- [ ] Set up firewall rules
- [ ] Configured backups
- [ ] Set up monitoring/alerting

---

## Backup

### Database Backup
```bash
# Create backup directory
mkdir -p backups

# Backup database
docker exec arcane_app sqlite3 /app/data/arcane_codex.db \
  ".backup /app/backups/backup_$(date +%Y%m%d).db"

# Copy to host
docker cp arcane_app:/app/backups ./backups/
```

### Automated Backup (Cron)
```bash
# Add to crontab
crontab -e

# Run daily at 2 AM
0 2 * * * cd /path/to/complete_game && docker exec arcane_app sqlite3 /app/data/arcane_codex.db ".backup /app/backups/backup_$(date +\%Y\%m\%d).db"
```

---

## Troubleshooting

### Containers Won't Start
```bash
# Check logs
docker-compose logs

# Check Docker
docker ps -a
systemctl status docker
```

### Database Connection Errors
```bash
# Check database file permissions
ls -la data/

# Restart app
docker-compose restart app
```

### Redis Connection Errors
```bash
# Check Redis
docker-compose logs redis

# Test connection
docker exec arcane_redis redis-cli ping
```

### NGINX Errors
```bash
# Test configuration
docker exec arcane_nginx nginx -t

# Check SSL certificates
ls -la nginx/ssl/
```

### Performance Issues
```bash
# Check resource usage
docker stats

# Increase instances
docker-compose -f docker-compose.prod.yml up -d --scale app=5

# Check metrics
curl http://localhost/metrics
```

---

## Updating to Latest Version

```bash
# Pull latest code
git pull

# Stop services
docker-compose down

# Rebuild
docker-compose build

# Start with new version
docker-compose up -d

# Verify
curl http://localhost/health
```

---

## Rolling Back

```bash
# Stop current version
docker-compose down

# Checkout previous version
git checkout <previous-commit>

# Rebuild and start
docker-compose build
docker-compose up -d
```

---

## Production Tips

1. **Use Production Compose File**:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

2. **Enable Auto-Restart**:
   Already configured in production compose file

3. **Monitor Resource Usage**:
   ```bash
   docker stats --no-stream >> logs/stats.log
   ```

4. **Set Up Log Rotation**:
   Docker handles this automatically with max-size/max-file

5. **Regular Backups**:
   Automate with cron jobs

---

## Support

- Documentation: See `DEPLOYMENT.md` for full guide
- Logs: `docker-compose logs -f`
- Health: `curl http://localhost/health`
- Metrics: `curl http://localhost/metrics`

---

## Next Steps

After deployment:
1. Test all functionality
2. Set up monitoring
3. Configure domain and SSL
4. Set up automated backups
5. Configure CI/CD pipeline
6. Load testing
7. Security audit

---

**Congratulations!** Your Arcane Codex server is now running in production mode.

Access your game at: `https://your-domain.com`
