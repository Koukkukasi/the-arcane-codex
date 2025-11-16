# The Arcane Codex - Deployment Quick Reference

Quick reference guide for production deployment operations.

---

## Quick Start

### First Time Deployment

```bash
# 1. Configure environment
cp production.env.example .env.production
nano .env.production  # Edit configuration

# 2. Initialize database
python init_production_db.py

# 3. Deploy
sudo ./deploy.sh
```

### Docker Deployment

```bash
# Build and start
docker-compose -f docker-compose.production.yml up -d

# View logs
docker-compose -f docker-compose.production.yml logs -f

# Stop
docker-compose -f docker-compose.production.yml down
```

---

## Common Commands

### Service Management

```bash
# Start service
sudo systemctl start arcane-codex.service

# Stop service
sudo systemctl stop arcane-codex.service

# Restart service
sudo systemctl restart arcane-codex.service

# Reload (graceful, zero downtime)
sudo systemctl reload arcane-codex.service

# Check status
sudo systemctl status arcane-codex.service

# View logs
sudo journalctl -u arcane-codex.service -f
```

### Health Checks

```bash
# Basic health
curl http://localhost:5000/health

# Readiness probe
curl http://localhost:5000/health/ready

# Liveness probe
curl http://localhost:5000/health/live

# Metrics (JSON)
curl http://localhost:5000/metrics

# Metrics (Prometheus)
curl http://localhost:5000/metrics/prometheus
```

### Database Operations

```bash
# Manual backup
sudo ./backup_db.sh

# List backups
ls -lh /var/backups/arcane-codex/

# Restore from backup (replace TIMESTAMP)
gunzip /var/backups/arcane-codex/arcane_codex_TIMESTAMP.db.gz
sudo cp arcane_codex_TIMESTAMP.db /var/lib/arcane-codex/arcane_codex.db

# Check database integrity
sqlite3 /var/lib/arcane-codex/arcane_codex.db "PRAGMA integrity_check;"

# Run migrations
python run_migrations.py migrate

# Check migration status
python run_migrations.py status

# Create new migration
python run_migrations.py create add_new_feature

# Rollback last migration
python run_migrations.py rollback
```

### Deployment

```bash
# Deploy new version (automated)
sudo ./deploy.sh

# Emergency rollback
sudo ./rollback.sh

# Manual deployment steps
cd /opt/arcane-codex
sudo -u arcane git pull origin main
sudo systemctl reload arcane-codex.service
```

### Monitoring

```bash
# Run monitoring check once
python monitor.py --once

# Run continuous monitoring
python monitor.py

# Check monitoring results
cat /var/log/arcane-codex/monitor_results.json

# View monitoring logs
tail -f /var/log/arcane-codex/monitor.log
```

### Log Management

```bash
# Application logs
tail -f /var/log/arcane-codex/app.log

# Access logs
tail -f /var/log/nginx/arcane-codex-access.log

# Error logs
tail -f /var/log/nginx/arcane-codex-error.log

# System logs
sudo journalctl -u arcane-codex.service -n 100 --no-pager

# Follow system logs
sudo journalctl -u arcane-codex.service -f
```

---

## Docker Commands

### Service Management

```bash
# Start all services
docker-compose -f docker-compose.production.yml up -d

# Stop all services
docker-compose -f docker-compose.production.yml down

# Restart specific service
docker-compose -f docker-compose.production.yml restart arcane-codex

# View service status
docker-compose -f docker-compose.production.yml ps
```

### Logs

```bash
# View all logs
docker-compose -f docker-compose.production.yml logs

# Follow logs
docker-compose -f docker-compose.production.yml logs -f

# Logs for specific service
docker-compose -f docker-compose.production.yml logs arcane-codex

# Last 100 lines
docker-compose -f docker-compose.production.yml logs --tail=100
```

### Maintenance

```bash
# Execute command in container
docker-compose -f docker-compose.production.yml exec arcane-codex bash

# Run database backup
docker-compose -f docker-compose.production.yml exec arcane-codex ./backup_db.sh

# View container resource usage
docker stats

# Clean up unused resources
docker system prune -a
```

---

## Configuration Files

| File | Purpose | Location |
|------|---------|----------|
| `production.env.example` | Environment variables template | Project root |
| `.env.production` | Production environment config | Project root (create from template) |
| `gunicorn.conf.py` | Gunicorn server config | Project root |
| `arcane-codex.service` | Systemd service file | `/etc/systemd/system/` |
| `nginx.conf.example` | Nginx configuration | `/etc/nginx/sites-available/` |

---

## Important Paths

### Traditional Deployment

| Path | Purpose |
|------|---------|
| `/opt/arcane-codex/` | Application directory |
| `/var/lib/arcane-codex/` | Database directory |
| `/var/log/arcane-codex/` | Log directory |
| `/var/backups/arcane-codex/` | Backup directory |
| `/var/run/arcane-codex/` | Runtime files |

### Docker Deployment

| Path | Purpose |
|------|---------|
| `./data/` | Database volume |
| `./logs/` | Log volume |
| `./backups/` | Backup volume |
| `./ssl/` | SSL certificates |

---

## Troubleshooting

### Service Won't Start

```bash
# Check service status
sudo systemctl status arcane-codex.service

# View recent logs
sudo journalctl -u arcane-codex.service -n 50

# Test configuration
cd /opt/arcane-codex
source venv/bin/activate
gunicorn --check-config gunicorn.conf.py
```

### Database Issues

```bash
# Check database file
ls -lh /var/lib/arcane-codex/arcane_codex.db

# Check permissions
sudo chown arcane:www-data /var/lib/arcane-codex/arcane_codex.db

# Verify integrity
sqlite3 /var/lib/arcane-codex/arcane_codex.db "PRAGMA integrity_check;"
```

### High Resource Usage

```bash
# Check CPU/Memory
htop
top -u arcane

# Check disk space
df -h

# Reduce workers if needed
# Edit .env.production
WORKERS=2  # Lower number
sudo systemctl restart arcane-codex.service
```

### Network Issues

```bash
# Check if service is listening
sudo netstat -tlnp | grep 5000

# Test local connection
curl http://localhost:5000/health

# Check nginx
sudo nginx -t
sudo systemctl status nginx

# Check firewall
sudo ufw status
```

---

## Performance Tuning

### Gunicorn Workers

```python
# In gunicorn.conf.py or .env.production
workers = (2 * CPU_CORES) + 1  # Recommended formula

# Examples:
# 2 CPUs = 5 workers
# 4 CPUs = 9 workers
# 8 CPUs = 17 workers
```

### Database Optimization

```bash
# Run VACUUM and ANALYZE
sqlite3 /var/lib/arcane-codex/arcane_codex.db "VACUUM; ANALYZE;"

# Check query performance
# Enable query logging in .env.production
LOG_LEVEL=DEBUG
```

### Nginx Caching

```nginx
# Add to nginx.conf.example
location /static/ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

---

## Security Checklist

- [ ] Changed default SECRET_KEY
- [ ] Changed default database passwords
- [ ] SSL/TLS certificates installed
- [ ] Firewall configured (only 80, 443, 22 open)
- [ ] CORS origins properly configured
- [ ] Rate limiting enabled
- [ ] Security headers configured
- [ ] Regular backups scheduled
- [ ] Monitoring and alerts working

---

## Maintenance Schedule

### Daily
- Monitor application logs
- Check health endpoints
- Review error logs

### Weekly
- Check disk space
- Review backup status
- Check resource usage trends

### Monthly
- Review and rotate logs
- Update dependencies
- Security audit
- Test backup restoration

### Quarterly
- Performance review
- Capacity planning
- Security updates
- Documentation updates

---

## Emergency Procedures

### Application Crashed

```bash
# Check status
sudo systemctl status arcane-codex.service

# View crash logs
sudo journalctl -u arcane-codex.service -n 100

# Restart service
sudo systemctl restart arcane-codex.service

# If still failing, rollback
sudo ./rollback.sh
```

### Database Corrupted

```bash
# Stop service
sudo systemctl stop arcane-codex.service

# Check integrity
sqlite3 /var/lib/arcane-codex/arcane_codex.db "PRAGMA integrity_check;"

# Restore from backup
ls -lh /var/backups/arcane-codex/
gunzip -c /var/backups/arcane-codex/latest.db.gz > /var/lib/arcane-codex/arcane_codex.db

# Start service
sudo systemctl start arcane-codex.service
```

### High Load

```bash
# Check what's using resources
htop
sudo iotop

# Check active connections
sudo netstat -an | grep :5000 | wc -l

# Scale workers up temporarily
# Edit .env.production
WORKERS=12  # Increase
sudo systemctl reload arcane-codex.service

# Or add more application servers behind nginx
```

### Disk Full

```bash
# Check disk usage
df -h
du -sh /var/log/* | sort -h

# Clean old logs
sudo find /var/log -type f -name "*.log.*" -mtime +30 -delete

# Clean old backups
sudo find /var/backups/arcane-codex -type f -mtime +30 -delete

# Vacuum database
sqlite3 /var/lib/arcane-codex/arcane_codex.db "VACUUM;"
```

---

## Useful One-Liners

```bash
# Check application version
curl -s http://localhost:5000/health | jq .version

# Count active sessions
sqlite3 /var/lib/arcane-codex/arcane_codex.db "SELECT COUNT(*) FROM game_sessions WHERE status='active';"

# Monitor response times
tail -f /var/log/arcane-codex/app.log | grep execution_time

# Watch CPU usage
watch -n 1 'ps aux | grep gunicorn | grep -v grep'

# Find errors in logs
sudo journalctl -u arcane-codex.service | grep ERROR

# Test WebSocket connection
curl -i -N -H "Connection: Upgrade" -H "Upgrade: websocket" http://localhost:5000/socket.io/
```

---

## Support Resources

- Full Documentation: `README_DEPLOYMENT.md`
- Configuration Reference: `production.env.example`
- Completion Summary: `PHASE_N_DEPLOYMENT_COMPLETE.md`
- Health Endpoints: `http://your-domain.com/health`
- Metrics: `http://your-domain.com/metrics`

---

**Quick Reference Version 1.0**
*Last Updated: 2025-11-16*
