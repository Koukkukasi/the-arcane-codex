# The Arcane Codex - Production Deployment Guide

Complete step-by-step guide for deploying The Arcane Codex to production.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Deployment Options](#deployment-options)
- [Method 1: Traditional Server Deployment](#method-1-traditional-server-deployment)
- [Method 2: Docker Deployment](#method-2-docker-deployment)
- [Post-Deployment](#post-deployment)
- [Maintenance](#maintenance)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

### System Requirements

- **OS**: Ubuntu 20.04+ / Debian 11+ / CentOS 8+ (or compatible Linux distribution)
- **CPU**: 2+ cores recommended
- **RAM**: 2GB minimum, 4GB recommended
- **Disk**: 10GB minimum free space
- **Python**: 3.8 or higher
- **Network**: Public IP address or domain name

### Required Software

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y \
    python3 \
    python3-pip \
    python3-venv \
    git \
    nginx \
    sqlite3 \
    curl \
    supervisor \
    certbot \
    python3-certbot-nginx
```

### Optional but Recommended

- Redis (for caching)
- PostgreSQL (for production database instead of SQLite)
- Docker & Docker Compose (for containerized deployment)

---

## Deployment Options

Choose the deployment method that best fits your infrastructure:

1. **Traditional Server Deployment** - Direct deployment on a Linux server
2. **Docker Deployment** - Containerized deployment with Docker Compose

---

## Method 1: Traditional Server Deployment

### Step 1: Create Application User

```bash
# Create dedicated user for the application
sudo useradd -m -s /bin/bash arcane
sudo usermod -aG www-data arcane
```

### Step 2: Setup Application Directory

```bash
# Create application directory
sudo mkdir -p /opt/arcane-codex
sudo chown -R arcane:www-data /opt/arcane-codex

# Create data and log directories
sudo mkdir -p /var/lib/arcane-codex
sudo mkdir -p /var/log/arcane-codex
sudo mkdir -p /var/backups/arcane-codex
sudo mkdir -p /var/run/arcane-codex

# Set permissions
sudo chown -R arcane:www-data /var/lib/arcane-codex
sudo chown -R arcane:www-data /var/log/arcane-codex
sudo chown -R arcane:www-data /var/backups/arcane-codex
sudo chown -R arcane:www-data /var/run/arcane-codex
```

### Step 3: Clone Repository

```bash
# Switch to application user
sudo su - arcane

# Clone the repository
cd /opt/arcane-codex
git clone https://github.com/your-org/arcane-codex.git .

# Or upload files via SCP/SFTP
```

### Step 4: Setup Python Virtual Environment

```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Upgrade pip
pip install --upgrade pip

# Install dependencies
pip install -r requirements.txt
pip install -r requirements-production.txt
pip install gunicorn
```

### Step 5: Configure Environment Variables

```bash
# Copy example configuration
cp production.env.example .env.production

# Edit configuration
nano .env.production
```

**Required Configuration:**

```bash
# Generate a secure secret key
python3 -c "import secrets; print(secrets.token_hex(32))"

# Update .env.production with:
SECRET_KEY=<generated-secret-key>
ANTHROPIC_API_KEY=<your-api-key>
CORS_ORIGINS=https://your-domain.com

# Configure paths
DB_PATH=/var/lib/arcane-codex/arcane_codex.db
LOG_FILE=/var/log/arcane-codex/app.log
```

### Step 6: Initialize Database

```bash
# Run database initialization
python init_production_db.py
```

### Step 7: Test Application

```bash
# Test with Gunicorn
gunicorn --config gunicorn.conf.py web_game:app

# In another terminal, test health endpoint
curl http://localhost:5000/health
```

### Step 8: Setup Systemd Service

```bash
# Exit from arcane user
exit

# Copy service file
sudo cp /opt/arcane-codex/arcane-codex.service /etc/systemd/system/

# Reload systemd
sudo systemctl daemon-reload

# Enable service
sudo systemctl enable arcane-codex.service

# Start service
sudo systemctl start arcane-codex.service

# Check status
sudo systemctl status arcane-codex.service
```

### Step 9: Configure Nginx

```bash
# Copy nginx configuration
sudo cp /opt/arcane-codex/nginx.conf.example /etc/nginx/sites-available/arcane-codex

# Update domain name in config
sudo nano /etc/nginx/sites-available/arcane-codex
# Replace 'your-domain.com' with your actual domain

# Create symbolic link
sudo ln -s /etc/nginx/sites-available/arcane-codex /etc/nginx/sites-enabled/

# Test nginx configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

### Step 10: Setup SSL with Let's Encrypt

```bash
# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Test automatic renewal
sudo certbot renew --dry-run
```

### Step 11: Setup Automated Backups

```bash
# Make backup script executable
sudo chmod +x /opt/arcane-codex/backup_db.sh

# Add to crontab for daily backups at 2 AM
sudo crontab -e

# Add this line:
0 2 * * * /opt/arcane-codex/backup_db.sh >> /var/log/arcane-codex/backup.log 2>&1
```

### Step 12: Setup Monitoring

```bash
# Make monitoring script executable
sudo chmod +x /opt/arcane-codex/monitor.py

# Create systemd service for monitoring
sudo nano /etc/systemd/system/arcane-codex-monitor.service
```

**Monitor Service File:**

```ini
[Unit]
Description=The Arcane Codex Monitoring Service
After=network.target arcane-codex.service

[Service]
Type=simple
User=arcane
WorkingDirectory=/opt/arcane-codex
Environment="PATH=/opt/arcane-codex/venv/bin"
ExecStart=/opt/arcane-codex/venv/bin/python monitor.py
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
# Enable and start monitoring
sudo systemctl enable arcane-codex-monitor.service
sudo systemctl start arcane-codex-monitor.service
```

---

## Method 2: Docker Deployment

### Step 1: Install Docker and Docker Compose

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

### Step 2: Prepare Application

```bash
# Clone repository
git clone https://github.com/your-org/arcane-codex.git
cd arcane-codex

# Create required directories
mkdir -p data logs backups ssl

# Copy and configure environment
cp production.env.example .env.production
nano .env.production
```

### Step 3: Build and Start Containers

```bash
# Build the image
docker-compose -f docker-compose.production.yml build

# Start services
docker-compose -f docker-compose.production.yml up -d

# Check status
docker-compose -f docker-compose.production.yml ps

# View logs
docker-compose -f docker-compose.production.yml logs -f
```

### Step 4: Initialize Database

```bash
# Run database initialization inside container
docker-compose -f docker-compose.production.yml exec arcane-codex python init_production_db.py
```

### Step 5: Setup SSL (if using nginx container)

```bash
# Use certbot with nginx
docker-compose -f docker-compose.production.yml run --rm certbot certonly --webroot --webroot-path=/var/www/certbot -d your-domain.com
```

---

## Post-Deployment

### Verify Deployment

```bash
# Check application health
curl https://your-domain.com/health

# Check metrics
curl https://your-domain.com/metrics

# Test WebSocket connection
# Open browser to: https://your-domain.com
```

### Security Checklist

- [ ] Changed all default passwords and secrets
- [ ] SSL/TLS certificates installed and working
- [ ] Firewall configured (only ports 80, 443, 22 open)
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] Database backups scheduled
- [ ] Monitoring and alerts configured
- [ ] Application logs being written and rotated
- [ ] Security headers configured in nginx

### Performance Optimization

```bash
# Adjust worker count based on CPU cores
# Edit gunicorn.conf.py or .env.production
WORKERS=4  # Recommended: (2 * CPU_CORES) + 1

# Enable Redis caching
REDIS_ENABLED=true
REDIS_URL=redis://localhost:6379/0

# Tune database settings
# Edit init_production_db.py for SQLite optimizations
```

---

## Maintenance

### Updating the Application

```bash
# Use the automated deployment script
sudo /opt/arcane-codex/deploy.sh

# Or manually:
cd /opt/arcane-codex
sudo -u arcane git pull origin main
sudo systemctl reload arcane-codex.service
```

### Emergency Rollback

```bash
# Use the rollback script
sudo /opt/arcane-codex/rollback.sh

# Follow prompts to select backup
```

### Database Backup and Restore

```bash
# Manual backup
sudo /opt/arcane-codex/backup_db.sh

# List backups
ls -lh /var/backups/arcane-codex/

# Restore from backup
sudo systemctl stop arcane-codex.service
sudo cp /var/backups/arcane-codex/backup_YYYYMMDD_HHMMSS.db.gz /tmp/
gunzip /tmp/backup_YYYYMMDD_HHMMSS.db.gz
sudo cp /tmp/backup_YYYYMMDD_HHMMSS.db /var/lib/arcane-codex/arcane_codex.db
sudo systemctl start arcane-codex.service
```

### Log Management

```bash
# View application logs
sudo journalctl -u arcane-codex.service -f

# View access logs
sudo tail -f /var/log/nginx/arcane-codex-access.log

# View error logs
sudo tail -f /var/log/nginx/arcane-codex-error.log
sudo tail -f /var/log/arcane-codex/app.log
```

### Monitoring

```bash
# Check application status
sudo systemctl status arcane-codex.service

# Check resource usage
htop
df -h
free -h

# Check monitoring results
cat /var/log/arcane-codex/monitor_results.json
```

---

## Troubleshooting

### Application Won't Start

```bash
# Check service status
sudo systemctl status arcane-codex.service

# Check logs
sudo journalctl -u arcane-codex.service -n 100 --no-pager

# Test configuration
cd /opt/arcane-codex
source venv/bin/activate
gunicorn --check-config gunicorn.conf.py

# Verify Python dependencies
pip list
```

### Database Errors

```bash
# Check database integrity
sqlite3 /var/lib/arcane-codex/arcane_codex.db "PRAGMA integrity_check;"

# Check permissions
ls -la /var/lib/arcane-codex/

# Re-initialize if corrupted
python init_production_db.py
```

### High CPU/Memory Usage

```bash
# Check resource usage
top -u arcane

# Adjust worker count
# Edit .env.production or gunicorn.conf.py
WORKERS=2  # Reduce if high memory usage

# Restart application
sudo systemctl restart arcane-codex.service
```

### SSL Certificate Issues

```bash
# Test SSL certificate
sudo certbot certificates

# Renew certificate
sudo certbot renew

# Test nginx configuration
sudo nginx -t
```

### WebSocket Connection Issues

```bash
# Check nginx WebSocket configuration
# Ensure these headers are set in nginx config:
# proxy_set_header Upgrade $http_upgrade;
# proxy_set_header Connection "upgrade";

# Check firewall
sudo ufw status
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Test WebSocket endpoint
curl -i -N -H "Connection: Upgrade" -H "Upgrade: websocket" http://localhost:5000/socket.io/
```

### Performance Issues

```bash
# Enable query logging
# Add to .env.production
LOG_LEVEL=DEBUG

# Monitor slow requests
tail -f /var/log/arcane-codex/app.log | grep "execution_time"

# Check database indexes
sqlite3 /var/lib/arcane-codex/arcane_codex.db "SELECT * FROM sqlite_master WHERE type='index';"

# Optimize database
sqlite3 /var/lib/arcane-codex/arcane_codex.db "VACUUM; ANALYZE;"
```

---

## Getting Help

- Documentation: [README.md](README.md)
- Issues: Create a GitHub issue
- Logs: Always check `/var/log/arcane-codex/` first

---

## Production Checklist

Before going live, ensure:

- [ ] All configuration files updated with production values
- [ ] Environment variables properly set
- [ ] Database initialized and tested
- [ ] SSL certificates installed
- [ ] Backups configured and tested
- [ ] Monitoring running
- [ ] Health checks passing
- [ ] Load testing completed
- [ ] Security audit performed
- [ ] Documentation reviewed
- [ ] Rollback procedure tested
- [ ] Team trained on deployment process

---

**Deployment Complete!** Your Arcane Codex instance should now be running in production.

For additional support, refer to the other documentation files:
- `QUICK_START.md` - Quick start guide
- `README.md` - Main documentation
- `DEPLOYMENT_CHECKLIST.md` - Detailed checklist
