# 🔧 Arcane Codex - Troubleshooting Guide

**Solutions to common issues and errors**

---

## 📋 Table of Contents

1. [Docker Issues](#docker-issues)
2. [Database Issues](#database-issues)
3. [Server Issues](#server-issues)
4. [Build & Installation Issues](#build--installation-issues)
5. [Authentication Issues](#authentication-issues)
6. [Testing Issues](#testing-issues)
7. [Performance Issues](#performance-issues)
8. [Logs & Debugging](#logs--debugging)

---

## 🐳 Docker Issues

### Docker Desktop Not Running

**Error:**
```
unable to get image 'postgres:15-alpine': error during connect: open //./pipe/dockerDesktopLinuxEngine
```

**Solution:**
1. Open Docker Desktop application from Start Menu
2. Wait for Docker to fully initialize (whale icon should be steady, not animating)
3. Test with: `docker ps`
4. If still not working, restart Docker Desktop

---

### Docker Containers Won't Start

**Error:**
```
Error response from daemon: driver failed programming external connectivity
```

**Solution:**
```bash
# Check if ports are already in use
netstat -ano | findstr :5432
netstat -ano | findstr :6379

# Kill process using the port (replace PID)
taskkill /PID <PID> /F

# Or restart Docker Desktop
# Right-click Docker Desktop tray icon → Quit Docker Desktop
# Start Docker Desktop again
```

---

### Cannot Connect to Database Container

**Error:**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solution:**
```bash
# Check container status
docker-compose ps

# If containers are not running, start them
docker-compose up -d

# Check container logs
docker-compose logs db

# Wait for database to be ready
timeout /t 10

# Verify database is accepting connections
docker-compose exec db pg_isready -U postgres
```

---

### Docker Volume Permission Issues

**Error:**
```
permission denied while trying to connect to the Docker daemon socket
```

**Solution (Windows):**
1. Restart Docker Desktop as Administrator
2. Or add your user to the `docker-users` group:
   - Open Computer Management (Win+X → Computer Management)
   - Local Users and Groups → Groups → docker-users
   - Add your Windows user account
   - Log out and log back in

---

## 💾 Database Issues

### Database Connection Failed

**Error:**
```
Error: Failed to connect to database
```

**Solution:**
```bash
# 1. Check if container is running
docker-compose ps db

# 2. Check DATABASE_URL in .env
# Should be: postgresql://postgres:arcane_codex_secure_password_2024@localhost:5432/arcane_codex

# 3. Test connection manually
docker-compose exec db psql -U postgres -d arcane_codex -c "SELECT 1;"

# 4. Restart database container
docker-compose restart db
```

---

### Migration Failed

**Error:**
```
Error: relation "players" already exists
```

**Solution:**
```bash
# Option 1: Skip if tables already exist (safe)
# This error means migrations already ran successfully

# Option 2: Force reset (⚠️ DELETES ALL DATA)
reset-db.bat

# Option 3: Manual fix
docker-compose exec db psql -U postgres -d arcane_codex
# In psql shell:
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
\q

# Then run migrations again
migrate.bat
```

---

### Database Access Denied

**Error:**
```
FATAL: password authentication failed for user "postgres"
```

**Solution:**
```bash
# 1. Check password in .env matches docker-compose.yml
# .env should have:
POSTGRES_PASSWORD=arcane_codex_secure_password_2024

# 2. Restart containers to apply new password
docker-compose down
docker-compose up -d

# 3. If still failing, reset database completely
reset-db.bat
```

---

### Database Out of Storage

**Error:**
```
ERROR: could not extend file: No space left on device
```

**Solution:**
```bash
# Check Docker disk usage
docker system df

# Clean up unused volumes and images
docker system prune -a --volumes

# Or increase Docker Desktop disk space:
# Settings → Resources → Disk image size → Increase
```

---

## 🚀 Server Issues

### Port Already in Use

**Error:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution:**
```bash
# Option 1: Find and kill process using port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Option 2: Change port in .env
PORT=3001

# Option 3: Kill all Node processes
taskkill /F /IM node.exe
```

---

### Module Not Found Errors

**Error:**
```
Error: Cannot find module 'express'
```

**Solution:**
```bash
# Reinstall dependencies
npm install

# If still failing, clean install
rmdir /s /q node_modules
del package-lock.json
npm install
```

---

### TypeScript Compilation Errors

**Error:**
```
error TS2307: Cannot find module '@/types/player' or its corresponding type declarations
```

**Solution:**
```bash
# Clean build directory
rmdir /s /q dist

# Rebuild
npm run build

# Check tsconfig.json paths are correct
# Verify all @/ imports resolve to src/
```

---

### Socket.IO Connection Failed

**Error:**
```
WebSocket connection to 'ws://localhost:3000/socket.io/' failed
```

**Solution:**
```bash
# 1. Check server is running
# Visit: http://localhost:3000

# 2. Check CORS settings in src/server.ts
# Should allow your frontend origin

# 3. Check browser console for detailed error

# 4. Restart server
# Ctrl+C in terminal, then: npm run dev
```

---

## 🏗️ Build & Installation Issues

### npm install Fails

**Error:**
```
npm ERR! code EINTEGRITY
```

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Delete lock file
del package-lock.json

# Reinstall
npm install
```

---

### Node Version Mismatch

**Error:**
```
The engine "node" is incompatible with this module
```

**Solution:**
```bash
# Check Node version
node --version

# Should be 20.x or higher
# If not, download from: https://nodejs.org/

# Or use nvm (Node Version Manager)
nvm install 20
nvm use 20
```

---

### Build Out of Memory

**Error:**
```
FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory
```

**Solution:**
```bash
# Increase Node memory limit
set NODE_OPTIONS=--max-old-space-size=4096
npm run build

# Or add to package.json scripts:
"build": "NODE_OPTIONS=--max-old-space-size=4096 tsc"
```

---

## 🔐 Authentication Issues

### JWT Secret Too Short

**Error:**
```
Error: JWT secret must be at least 32 characters
```

**Solution:**
```bash
# Generate new secret (32+ characters)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Update .env with generated secret
JWT_SECRET=<generated_secret_here>

# Restart server
```

---

### Invalid Token Error

**Error:**
```
JsonWebTokenError: invalid token
```

**Solution:**
```bash
# 1. Clear browser cookies/localStorage
# Open browser DevTools → Application → Clear site data

# 2. Check JWT_SECRET hasn't changed
# If you changed it, all existing tokens are invalid

# 3. Check token expiration in src/services/auth/jwt.service.ts
# Default is 24 hours for access tokens
```

---

### Session Not Persisting

**Problem:** User gets logged out on page refresh

**Solution:**
```bash
# 1. Check SESSION_SECRET is set in .env
SESSION_SECRET=<your_session_secret>

# 2. Check Redis is running
docker-compose ps redis

# 3. If Redis is down, sessions use memory (don't persist)
docker-compose up -d redis

# 4. Check browser allows cookies
# DevTools → Application → Cookies → Check for session cookie
```

---

## 🧪 Testing Issues

### Tests Can't Connect to Database

**Error:**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solution:**
```bash
# Start test database
docker-compose up -d db

# Wait for database to be ready
timeout /t 10

# Run tests again
test.bat
```

---

### Tests Timeout

**Error:**
```
Error: Timeout of 5000ms exceeded
```

**Solution:**
```bash
# Increase test timeout in vitest.config.ts or test files
# Add at top of test file:
# vi.setConfig({ testTimeout: 30000 })

# Or run tests with more time
npm test -- --testTimeout=30000
```

---

### Test Database Has Stale Data

**Problem:** Tests fail due to data from previous runs

**Solution:**
```bash
# Tests should use transactions (already implemented)
# Check test files have proper beforeEach cleanup

# If still failing, reset test database
docker-compose down
docker volume rm arcane_codex_ts_postgres-data
docker-compose up -d db
timeout /t 10
npm run migrate
```

---

## 🚀 Performance Issues

### Slow Database Queries

**Problem:** API responses are slow

**Solution:**
```bash
# 1. Check database indexes
docker-compose exec db psql -U postgres -d arcane_codex

# In psql:
SELECT schemaname, tablename, indexname
FROM pg_indexes
WHERE schemaname = 'public';

# 2. Enable query logging to find slow queries
# Add to docker-compose.yml under db environment:
- POSTGRES_INITDB_ARGS=--log-statement=all

# 3. Use EXPLAIN to analyze query performance
EXPLAIN ANALYZE SELECT * FROM players WHERE player_id = 'test';

# 4. Check connection pool isn't exhausted
# src/database/connection.ts - max pool size is 20
```

---

### High Memory Usage

**Problem:** Server uses too much RAM

**Solution:**
```bash
# 1. Check for memory leaks
# Use Node.js --inspect flag
node --inspect dist/server.js

# Open chrome://inspect to profile memory

# 2. Reduce connection pool size
# Edit src/database/connection.ts:
max: 10, # Instead of 20

# 3. Restart server periodically (PM2 auto-restart)
pm2 start dist/server.js --max-memory-restart 500M
```

---

### Redis Memory Full

**Error:**
```
OOM command not allowed when used memory > 'maxmemory'
```

**Solution:**
```bash
# 1. Check Redis memory usage
docker-compose exec redis redis-cli INFO memory

# 2. Clear Redis cache
docker-compose exec redis redis-cli FLUSHALL

# 3. Increase Redis memory limit in docker-compose.yml
redis:
  command: redis-server --maxmemory 512mb --maxmemory-policy allkeys-lru
```

---

## 📊 Logs & Debugging

### Enable Debug Logging

```bash
# Set environment variable
set DEBUG=*
npm run dev

# Or in .env:
LOG_LEVEL=debug
```

---

### View Container Logs

```bash
# All containers
logs.bat

# Specific container
logs.bat db
logs.bat redis
logs.bat app

# Or with docker-compose
docker-compose logs -f db
docker-compose logs -f redis --tail=100
```

---

### Check Application Logs

```bash
# View server logs (if using file logging)
type logs\app.log

# Or tail logs in real-time (Git Bash)
tail -f logs/app.log

# PM2 logs (production)
pm2 logs arcane-codex
```

---

### Database Query Logging

```bash
# Connect to database
docker-compose exec db psql -U postgres -d arcane_codex

# Enable query logging for session
SET log_statement = 'all';

# Run your queries
SELECT * FROM players LIMIT 5;

# Check logs
docker-compose logs db | findstr "LOG:"
```

---

### Network Debugging

```bash
# Test database connection
docker-compose exec db psql -U postgres -d arcane_codex -c "SELECT version();"

# Test Redis connection
docker-compose exec redis redis-cli PING

# Check port accessibility
Test-NetConnection localhost -Port 3000
Test-NetConnection localhost -Port 5432
Test-NetConnection localhost -Port 6379

# Or use telnet
telnet localhost 3000
```

---

## 🆘 Still Having Issues?

### Gather Debug Information

Before reporting an issue, collect:

```bash
# 1. Version information
node --version
npm --version
docker --version

# 2. Container status
docker-compose ps

# 3. Recent logs
docker-compose logs --tail=50 db > db-logs.txt
docker-compose logs --tail=50 redis > redis-logs.txt

# 4. Environment check
echo %NODE_ENV%
type .env

# 5. Port availability
netstat -ano | findstr :3000
netstat -ano | findstr :5432
netstat -ano | findstr :6379
```

### Nuclear Option: Complete Reset

⚠️ **This will delete all data!**

```bash
# 1. Stop everything
stop.bat
taskkill /F /IM node.exe

# 2. Remove all Docker data
docker-compose down -v
docker volume prune -f
docker network prune -f

# 3. Clean project
rmdir /s /q node_modules
rmdir /s /q dist
del package-lock.json

# 4. Fresh install
npm install
npm run build

# 5. Start fresh
start.bat
```

---

## 📞 Getting Help

**Still stuck? Try these resources:**

1. **Check Documentation**
   - [QUICKSTART.md](../QUICKSTART.md)
   - [DEPLOYMENT_GUIDE.md](../DEPLOYMENT_GUIDE.md)
   - [README.md](../README.md)

2. **Search Existing Issues**
   - [GitHub Issues](https://github.com/Koukkukasi/the-arcane-codex/issues)

3. **Create New Issue**
   - Include debug information from above
   - Describe what you tried
   - Include error messages and logs

4. **Community Support**
   - Discord: [Your Discord Link]
   - Forum: [Your Forum Link]

---

**Most issues can be resolved by restarting Docker Desktop and running `start.bat` again!**
