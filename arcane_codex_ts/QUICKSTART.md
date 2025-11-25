# 🚀 Arcane Codex - Quick Start Guide (Windows)

**Get up and running in 5 minutes!**

---

## ✅ Prerequisites Checklist

Before starting, make sure you have:

- [ ] **Node.js 20.x or higher** - [Download](https://nodejs.org/)
- [ ] **Docker Desktop** - [Download](https://www.docker.com/products/docker-desktop/)
- [ ] **Anthropic API Key** - [Get one](https://console.anthropic.com/)
- [ ] **Git** (optional, for cloning) - [Download](https://git-scm.com/)

---

## 🎯 Quick Setup (3 Steps)

### Step 1: Install Docker Desktop

1. Download and install Docker Desktop from https://www.docker.com/products/docker-desktop/
2. **Start Docker Desktop** (very important!)
3. Wait for Docker Desktop to fully start (whale icon in system tray should be steady)

### Step 2: Configure Environment

Open the project folder in your terminal:

```bash
cd C:\Users\ilmiv\ProjectArgent\arcane_codex_ts
```

Open the `.env` file and add your Anthropic API key:

```bash
ANTHROPIC_API_KEY=sk-ant-your-actual-api-key-here
```

### Step 3: Start the Server

**Double-click `start.bat`** or run from terminal:

```bash
start.bat
```

The script will:
1. ✅ Check Docker Desktop is running
2. ✅ Start PostgreSQL and Redis containers
3. ✅ Wait for database to be ready
4. ✅ Run database migrations
5. ✅ Start the development server

**Server will be available at:** http://localhost:3000

---

## 🎮 Using the Helper Scripts

### Start Server
```bash
start.bat
```
**What it does:** Starts all services and the development server

### Stop Server
```bash
stop.bat
```
**What it does:** Stops Docker containers cleanly

### View Logs
```bash
logs.bat          # View all container logs
logs.bat db       # View database logs only
logs.bat redis    # View Redis logs only
```

### Run Tests
```bash
test.bat              # Run all tests
test.bat database     # Run database tests only
test.bat api          # Run API tests only
test.bat e2e          # Run end-to-end tests
test.bat ui           # Run UI tests
```

### Database Migrations
```bash
migrate.bat
```
**What it does:** Runs any pending database migrations

### Reset Database (⚠️ Danger Zone)
```bash
reset-db.bat
```
**What it does:** Deletes ALL data and recreates database from scratch

---

## 📝 Common Commands

### Development
```bash
npm run dev          # Start development server (manual)
npm run build        # Build for production
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
```

### Testing
```bash
npm test                # Run all tests
npm run test:database   # Database tests only
npm run test:api        # API tests only
npm run test:e2e        # End-to-end tests
npm run test:ui-tests   # UI component tests
npm run test:report     # View test coverage report
```

### Database
```bash
npm run migrate         # Run database migrations
npm run db:seed         # Seed database with sample data
```

### Docker
```bash
npm run docker:build    # Build Docker images
npm run docker:up       # Start all containers
npm run docker:down     # Stop all containers
npm run docker:logs     # View container logs
```

---

## 🔍 Verifying Installation

After running `start.bat`, verify everything is working:

### 1. Check Server Response
Open browser to: http://localhost:3000

You should see the Arcane Codex main menu.

### 2. Check Database Connection
```bash
docker-compose exec db psql -U postgres -d arcane_codex -c "SELECT 1;"
```

Should output:
```
 ?column?
----------
        1
(1 row)
```

### 3. Run Quick Test
```bash
test.bat database
```

Should show all tests passing (60+ tests).

---

## 🛠️ Troubleshooting

### "Docker Desktop is not running"

**Problem:** You see this error when running `start.bat`

**Solution:**
1. Open Docker Desktop application
2. Wait for it to fully start (whale icon steady in system tray)
3. Run `start.bat` again

---

### "Port 3000 already in use"

**Problem:** `Error: listen EADDRINUSE: address already in use :::3000`

**Solution:**
```bash
# Find what's using port 3000
netstat -ano | findstr :3000

# Kill that process (replace PID with actual process ID)
taskkill /PID <PID> /F

# Or change the port in .env
PORT=3001
```

---

### "Database connection failed"

**Problem:** Server can't connect to PostgreSQL

**Solution:**
```bash
# Check if database container is running
docker-compose ps

# If not running, start it
docker-compose up -d db

# Wait 10 seconds and try again
timeout /t 10
```

---

### "Migration failed"

**Problem:** Database migrations won't run

**Solution:**
```bash
# Reset the database completely
reset-db.bat

# This will:
# 1. Stop containers
# 2. Delete database volume
# 3. Recreate everything fresh
```

---

### "npm install fails"

**Problem:** Dependencies won't install

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules
rmdir /s /q node_modules

# Reinstall
npm install
```

---

## 📖 Next Steps

Once your server is running:

1. **Create an Account** - Visit http://localhost:3000/register
2. **Create a Party** - Start a new game session
3. **Invite Friends** - Share the party code
4. **Start Playing** - Build characters and begin your adventure!

---

## 📚 Additional Resources

- **[Full Deployment Guide](DEPLOYMENT_GUIDE.md)** - Detailed deployment instructions
- **[Development History](PHASES_1_TO_15_COMPLETE.md)** - Complete development journey
- **[Database Schema](docs/PHASE8_DATABASE_SCHEMA.md)** - Database design documentation
- **[API Documentation](docs/)** - API endpoints reference

---

## 🐛 Getting Help

**Something not working?**

1. Check the [Troubleshooting](#troubleshooting) section above
2. View logs: `logs.bat`
3. Check Docker Desktop is running
4. Try resetting: `reset-db.bat`
5. Open an issue: [GitHub Issues](https://github.com/Koukkukasi/the-arcane-codex/issues)

---

## 🎉 You're Ready!

**Your Arcane Codex server is now running!**

Open http://localhost:3000 and start your adventure!

**Happy Gaming! 🎲**
