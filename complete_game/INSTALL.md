# The Arcane Codex - Installation Guide

Complete installation guide for setting up The Arcane Codex game.

## Table of Contents

- [System Requirements](#system-requirements)
- [Quick Start](#quick-start)
- [Detailed Installation](#detailed-installation)
- [Configuration](#configuration)
- [Verification](#verification)
- [Troubleshooting](#troubleshooting)

---

## System Requirements

### Minimum Requirements

- **Python**: 3.8 or higher (3.10+ recommended)
- **RAM**: 2GB minimum (4GB recommended)
- **Storage**: 500MB free space
- **OS**: Windows 10/11, macOS 10.15+, or Linux (Ubuntu 20.04+)
- **Internet**: Required for Claude AI API and Discord bot

### Optional Requirements

- **Claude Desktop**: Required for MCP-based dynamic scenario generation
- **Discord Account**: Required if using Discord bot features
- **Claude API Key**: Required for AI GM features (Anthropic account)

---

## Quick Start

For impatient users who want to get running immediately:

```bash
# 1. Clone/navigate to the project
cd C:\Users\ilmiv\ProjectArgent\complete_game

# 2. Install all dependencies
pip install -r requirements.txt

# 3. Create environment file
copy .env.example .env
# Edit .env and add your API keys

# 4. Verify installation
python verify_setup.py

# 5. Run the game
python web_game.py
```

Then open your browser to: **http://localhost:5000**

---

## Detailed Installation

### Step 1: Python Installation

#### Windows

1. Download Python from: https://www.python.org/downloads/
2. Run the installer
3. **IMPORTANT**: Check "Add Python to PATH"
4. Choose "Install Now"
5. Verify installation:
   ```cmd
   python --version
   ```

#### macOS

```bash
# Install using Homebrew (recommended)
brew install python@3.10

# Or download from python.org
```

#### Linux (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install python3.10 python3.10-venv python3-pip
```

### Step 2: Create Virtual Environment (Recommended)

Creating a virtual environment isolates project dependencies:

```bash
# Navigate to project directory
cd C:\Users\ilmiv\ProjectArgent\complete_game

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# You should see (venv) in your terminal prompt
```

### Step 3: Install Dependencies

#### Production Installation (Minimal)

For running the game only:

```bash
pip install -r requirements.txt
```

This installs:
- Flask (web framework)
- Flask-SocketIO (real-time communication)
- Flask-CORS (cross-origin support)
- discord.py (Discord bot)
- anthropic (Claude AI API)
- python-dotenv (environment variables)
- psutil (system monitoring)
- mcp (Model Context Protocol)
- eventlet (async support)

#### Development Installation (Full)

For development, testing, and debugging:

```bash
pip install -r requirements-dev.txt
```

This includes all production dependencies PLUS:
- pytest (testing framework)
- pylint, flake8, black (code quality tools)
- mypy (type checking)
- ipython, ipdb (debugging tools)
- sphinx (documentation)

#### Verify Installation

```bash
# Check installed packages
pip list

# Verify critical packages
python -c "import flask; print('Flask:', flask.__version__)"
python -c "import flask_socketio; print('Flask-SocketIO:', flask_socketio.__version__)"
python -c "import discord; print('Discord.py:', discord.__version__)"
python -c "import psutil; print('psutil:', psutil.__version__)"
```

### Step 4: Database Setup

The game uses SQLite (no installation needed):

```bash
# Database will be created automatically on first run
# Location: arcane_codex.db

# To initialize manually:
python -c "from database import ArcaneDatabase; ArcaneDatabase()"
```

### Step 5: Configuration

#### Create .env File

Copy the example environment file:

```bash
# Windows
copy .env.example .env

# macOS/Linux
cp .env.example .env
```

#### Edit .env File

Open `.env` in a text editor and configure:

```env
# ==============================================================================
# ANTHROPIC API (Required for AI GM)
# ==============================================================================
ANTHROPIC_API_KEY=your_anthropic_api_key_here
# Get your key from: https://console.anthropic.com/

# ==============================================================================
# DISCORD BOT (Optional - only if using Discord features)
# ==============================================================================
DISCORD_BOT_TOKEN=your_discord_bot_token_here
# Get token from: https://discord.com/developers/applications

# ==============================================================================
# SERVER CONFIGURATION
# ==============================================================================
FLASK_HOST=0.0.0.0
FLASK_PORT=5000
FLASK_DEBUG=True

# ==============================================================================
# DATABASE
# ==============================================================================
DATABASE_PATH=arcane_codex.db

# ==============================================================================
# MCP CONFIGURATION (Optional - for dynamic scenarios)
# ==============================================================================
MCP_SERVER_PATH=mcp_scenario_server.py
```

### Step 6: Optional - MCP Setup (Advanced)

For 100% dynamic scenario generation via Claude Desktop:

See `MCP_SETUP.md` for detailed instructions.

---

## Configuration

### Web Server Configuration

Edit `web_game.py` or `app.py` at the bottom:

```python
if __name__ == '__main__':
    app.run(
        debug=True,          # Set to False in production
        host='0.0.0.0',      # 0.0.0.0 = accessible from network
        port=5000,           # Change port if 5000 is in use
        threaded=True        # Enable multi-threading
    )
```

### Discord Bot Configuration

If using Discord bot features:

1. Create a Discord application: https://discord.com/developers/applications
2. Create a bot user
3. Copy bot token to `.env`
4. Enable required intents:
   - Server Members Intent
   - Message Content Intent
5. Invite bot to your server using OAuth2 URL generator

### Database Configuration

SQLite database is created automatically. To customize location:

In `database.py`:
```python
db = ArcaneDatabase(db_path="path/to/your/database.db")
```

---

## Verification

### Run Verification Script

```bash
python verify_setup.py
```

This checks:
- Python version
- All required packages
- Database connectivity
- Configuration files
- API connectivity (if keys provided)

### Manual Verification

#### Test Web Server

```bash
python web_game.py
```

Should see:
```
Starting web server...
Open your browser to: http://localhost:5000
Server starting on http://0.0.0.0:5000
```

#### Test Discord Bot (if configured)

```bash
python run_bot.py
```

Should see:
```
Bot logged in as: YourBotName
Ready for players!
```

#### Test Database

```bash
python -c "from database import ArcaneDatabase; db = ArcaneDatabase(); print('Database OK!')"
```

Should see:
```
Database OK!
```

---

## Troubleshooting

### Common Issues

#### Issue: "ModuleNotFoundError: No module named 'flask_socketio'"

**Solution:**
```bash
pip install flask-socketio
```

#### Issue: "ModuleNotFoundError: No module named 'psutil'"

**Solution:**
```bash
pip install psutil
```

#### Issue: "ModuleNotFoundError: No module named 'mcp'"

**Solution:**
```bash
pip install mcp
```

#### Issue: Port 5000 already in use

**Solution 1** (Change port):
Edit `web_game.py`:
```python
app.run(port=5001)  # Use different port
```

**Solution 2** (Kill process using port):
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:5000 | xargs kill -9
```

#### Issue: "pip is not recognized"

**Solution:**
```bash
# Windows - add Python to PATH, or use:
python -m pip install -r requirements.txt

# macOS/Linux - install pip:
sudo apt install python3-pip
```

#### Issue: Permission errors during installation

**Solution:**
```bash
# Windows - run as administrator
# macOS/Linux - use user installation:
pip install --user -r requirements.txt
```

#### Issue: SSL/Certificate errors

**Solution:**
```bash
pip install --trusted-host pypi.org --trusted-host files.pythonhosted.org -r requirements.txt
```

#### Issue: "Database is locked"

**Solution:**
```bash
# Close all Python processes accessing the database
# Delete arcane_codex.db and restart (will create fresh database)
```

#### Issue: Discord bot can't send DMs

**Solution:**
- Users must enable DMs from server members in Discord privacy settings
- Check bot has proper permissions
- Verify bot is in the same server as the user

### Getting Help

1. **Check Documentation**:
   - `README.md` - Project overview
   - `MCP_SETUP.md` - MCP configuration
   - `ARCHITECTURE.md` - System architecture

2. **Verify Setup**:
   ```bash
   python verify_setup.py
   ```

3. **Check Logs**:
   - Web server logs: console output
   - Discord bot logs: console output
   - Database logs: `arcane_codex.db` (SQLite)

4. **Common Solutions**:
   - Restart the server
   - Reinstall dependencies: `pip install --force-reinstall -r requirements.txt`
   - Clear cache: `pip cache purge`
   - Use a fresh virtual environment

### Advanced Troubleshooting

#### Enable Debug Mode

In `web_game.py` or `app.py`:
```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

#### Check Network Connectivity

```bash
# Test if server is accessible
curl http://localhost:5000

# Test from another device on network
curl http://<your-ip>:5000
```

#### Database Inspection

```bash
# Install SQLite browser (optional)
# View database: arcane_codex.db

# Or use Python:
python -c "import sqlite3; conn = sqlite3.connect('arcane_codex.db'); print(conn.execute('SELECT * FROM sqlite_master').fetchall())"
```

---

## Next Steps

After successful installation:

1. **Read User Guide**: See `README.md` for gameplay instructions
2. **Configure MCP** (Optional): See `MCP_SETUP.md` for dynamic scenarios
3. **Test the Game**: Open http://localhost:5000 and create a game
4. **Invite Players**: Share game code with friends (up to 4 players)

---

## Version Compatibility

### Tested Configurations

| Python | OS | Status |
|--------|-----|---------|
| 3.8 | Windows 10 | ✅ Working |
| 3.9 | Windows 11 | ✅ Working |
| 3.10 | Windows 11 | ✅ Recommended |
| 3.11 | Windows 11 | ✅ Working |
| 3.12 | All | ⚠️ Not tested |

### Dependency Versions

Critical version requirements:
- **flask-socketio**: >= 5.3.0 (older versions may have async issues)
- **discord.py**: >= 2.3.0 (required for intents)
- **anthropic**: >= 0.34.0 (latest API features)
- **psutil**: >= 5.9.0 (system monitoring)

---

## Security Notes

### API Keys

- **NEVER** commit `.env` file to version control
- **NEVER** share API keys publicly
- Rotate keys regularly
- Use environment variables in production

### Database

- SQLite database contains game state
- Backup regularly: `copy arcane_codex.db arcane_codex_backup.db`
- In production, consider PostgreSQL or MySQL

### Network Security

- In production, set `FLASK_DEBUG=False`
- Use HTTPS in production
- Configure firewall rules
- Use reverse proxy (nginx/Apache)

---

## Performance Optimization

### For Better Performance

1. **Use Production WSGI Server**:
   ```bash
   pip install gunicorn
   gunicorn -w 4 -b 0.0.0.0:5000 web_game:app
   ```

2. **Enable Caching**:
   - Performance monitor includes built-in caching
   - See `performance_monitor.py`

3. **Database Optimization**:
   - SQLite is sufficient for < 50 concurrent games
   - For larger scale, migrate to PostgreSQL

4. **Monitor Resources**:
   ```bash
   # Check system resources
   python -c "import psutil; print('CPU:', psutil.cpu_percent(), '%'); print('RAM:', psutil.virtual_memory().percent, '%')"
   ```

---

## Updating Dependencies

### Check for Updates

```bash
# Show outdated packages
pip list --outdated

# Update specific package
pip install --upgrade flask-socketio

# Update all packages (careful!)
pip install --upgrade -r requirements.txt
```

### Compatibility Testing

After updates, always test:
```bash
python verify_setup.py
python -m pytest tests/  # If tests exist
```

---

## Uninstallation

### Remove Virtual Environment

```bash
# Deactivate first
deactivate

# Delete virtual environment folder
rm -rf venv  # macOS/Linux
rmdir /s venv  # Windows
```

### Remove Global Installation

```bash
pip uninstall -r requirements.txt -y
```

### Clean Database

```bash
# Remove database file
rm arcane_codex.db  # macOS/Linux
del arcane_codex.db  # Windows
```

---

## Support & Resources

- **Documentation**: See `docs/` folder
- **Issues**: GitHub Issues (if hosted)
- **Discord**: [Your Discord Server]
- **Email**: [Your Contact Email]

---

**Last Updated**: 2025-01-06
**Version**: 1.0.0
**Tested On**: Python 3.10, Windows 11
