# The Arcane Codex - Quick Start Guide

Get the game running in **5 minutes**!

---

## Step 1: Check Python Version

```bash
python --version
```

**Required**: Python 3.8 or higher

If you don't have Python installed: https://www.python.org/downloads/

---

## Step 2: Install Dependencies

```bash
cd C:\Users\ilmiv\ProjectArgent\complete_game
pip install -r requirements.txt
```

**This installs**:
- Flask (web framework)
- Flask-SocketIO (real-time multiplayer)
- psutil (performance monitoring)
- discord.py (Discord bot)
- anthropic (AI features)
- python-dotenv (configuration)
- mcp (dynamic scenarios)
- eventlet (async support)

**Time**: 1-2 minutes

---

## Step 3: Verify Installation

```bash
python check_dependencies.py
```

You should see all ✓ (checkmarks).

If you see any ✗ (X marks), run:
```bash
pip install <missing-package>
```

---

## Step 4: Configure (Optional)

Create `.env` file (only needed for AI/Discord features):

```bash
# Windows
copy .env.example .env

# Edit .env and add (optional):
# ANTHROPIC_API_KEY=your_key_here
# DISCORD_BOT_TOKEN=your_token_here
```

**Skip this if**: You just want to test the game locally

---

## Step 5: Run the Game!

```bash
python web_game.py
```

**Open your browser**: http://localhost:5000

---

## That's It!

You should see:
- Web server running on port 5000
- Game accessible at localhost:5000
- Create a game, share the code with friends

---

## Quick Commands Reference

### Run the game
```bash
python web_game.py
```

### Run Discord bot (optional)
```bash
python run_bot.py
```

### Check dependencies
```bash
python check_dependencies.py
```

### Update dependencies
```bash
pip install --upgrade -r requirements.txt
```

### Stop the server
Press `Ctrl+C` in the terminal

---

## Troubleshooting

### "ModuleNotFoundError: No module named 'flask_socketio'"
```bash
pip install flask-socketio
```

### "ModuleNotFoundError: No module named 'psutil'"
```bash
pip install psutil
```

### "Port 5000 already in use"
Edit `web_game.py`, change line:
```python
app.run(port=5001)  # Use different port
```

### "pip is not recognized"
```bash
python -m pip install -r requirements.txt
```

---

## Need More Help?

- **Full installation guide**: See `INSTALL.md`
- **Dependency details**: See `DEPENDENCIES.md`
- **Complete fix report**: See `DEPENDENCY_FIX_REPORT.md`

---

## What's Next?

1. **Test multiplayer**: Open http://localhost:5000 in 2 browser tabs
2. **Create a game**: Click "Create Game", share the code
3. **Invite friends**: Share your local IP (http://192.168.x.x:5000)
4. **Configure AI** (optional): See `INSTALL.md` for Anthropic API setup
5. **Discord bot** (optional): See `INSTALL.md` for Discord setup

---

**Quick Start Complete!**

Game running? Awesome! Have fun!

Need help? Check the documentation files:
- `README.md` - Game overview
- `INSTALL.md` - Detailed installation
- `DEPENDENCIES.md` - Dependency info
