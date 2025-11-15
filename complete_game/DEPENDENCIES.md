# The Arcane Codex - Dependency Documentation

Complete documentation of all project dependencies, their purposes, and version requirements.

## Table of Contents

- [Critical Dependencies](#critical-dependencies)
- [Version Compatibility Matrix](#version-compatibility-matrix)
- [Dependency Analysis](#dependency-analysis)
- [Security Considerations](#security-considerations)
- [Known Issues](#known-issues)

---

## Critical Dependencies

### ✗ MISSING FROM ORIGINAL requirements.txt

These critical dependencies were **NOT** in the original requirements.txt but are **REQUIRED** by the code:

#### 1. flask-socketio (CRITICAL)
- **Used in**: `app.py`, `web_game.py`, `main_integration.py`
- **Purpose**: Real-time WebSocket communication for multiplayer gameplay
- **Lines of code using it**: 50+ lines across multiple files
- **Version required**: >= 5.3.0
- **Installation**: `pip install flask-socketio>=5.3.5`
- **Why critical**: Without this, the entire real-time multiplayer system fails

**Evidence from code**:
```python
# app.py:7
from flask_socketio import SocketIO, emit, join_room, leave_room

# app.py:27
socketio = SocketIO(app,
                   cors_allowed_origins="*",
                   async_mode='threading',
                   logger=True,
                   engineio_logger=True)
```

#### 2. psutil (CRITICAL)
- **Used in**: `performance_monitor.py`
- **Purpose**: System resource monitoring (CPU, memory, disk, network)
- **Lines of code using it**: 20+ lines
- **Version required**: >= 5.9.0
- **Installation**: `pip install psutil>=5.9.6`
- **Why critical**: Performance monitoring system crashes without it

**Evidence from code**:
```python
# performance_monitor.py:7
import psutil

# performance_monitor.py:78-79
cpu_percent = psutil.cpu_percent(interval=1)
memory = psutil.virtual_memory()
```

#### 3. mcp (REQUIRED for dynamic scenarios)
- **Used in**: `mcp_client.py`, `mcp_client_fixed.py`, `mcp_scenario_server.py`, `web_game.py`
- **Purpose**: Model Context Protocol client for Claude Desktop integration
- **Lines of code using it**: 100+ lines across multiple files
- **Version required**: >= 0.9.0
- **Installation**: `pip install mcp>=0.9.0`
- **Why critical**: 100% dynamic scenario generation requires MCP

**Evidence from code**:
```python
# mcp_client.py:9
from mcp import ClientSession
from mcp.client.stdio import stdio_client, StdioServerParameters

# web_game.py:24
from mcp_client import SyncMCPClient, generate_scenario_prompt
```

#### 4. eventlet (REQUIRED for async)
- **Used in**: Implicit dependency of flask-socketio
- **Purpose**: Async networking support for WebSockets
- **Version required**: >= 0.33.0
- **Installation**: `pip install eventlet>=0.33.3`
- **Why critical**: Flask-SocketIO requires either eventlet or gevent for async mode

---

## Existing Dependencies

These were already in requirements.txt:

### Flask (3.0.0)
- **Purpose**: Web framework
- **Status**: ✓ Correctly specified

### flask-cors (4.0.0)
- **Purpose**: Cross-Origin Resource Sharing (CORS) support
- **Status**: ✓ Correctly specified

### discord.py (2.3.2)
- **Purpose**: Discord bot functionality
- **Status**: ✓ Correctly specified

### anthropic
- **Purpose**: Claude AI API for AI Game Master
- **Status**: ⚠ No version specified (recommend: >=0.34.0)

### python-dotenv
- **Purpose**: Load environment variables from .env file
- **Status**: ⚠ No version specified (recommend: >=1.0.0)

---

## Version Compatibility Matrix

### Python Versions

| Python Version | Support Status | Notes |
|---------------|----------------|-------|
| 3.7 | ✗ Not Supported | Missing dataclasses support |
| 3.8 | ✓ Minimum | Dataclasses, typing features |
| 3.9 | ✓ Supported | Better type hints |
| 3.10 | ✓✓ Recommended | Best performance |
| 3.11 | ✓ Supported | Faster execution |
| 3.12 | ? Not tested | Should work but not verified |

### Dependency Version Matrix

| Dependency | Minimum | Tested | Latest | Notes |
|-----------|---------|--------|--------|-------|
| Flask | 3.0.0 | 3.0.0 | 3.0.1 | Latest bugfixes recommended |
| flask-socketio | 5.3.0 | 5.3.5 | 5.3.6 | Critical for real-time |
| flask-cors | 4.0.0 | 4.0.0 | 4.0.0 | Stable |
| discord.py | 2.3.0 | 2.3.2 | 2.3.2 | Requires intents |
| anthropic | 0.34.0 | 0.34.0 | 0.35.0 | Latest API features |
| python-dotenv | 1.0.0 | 1.0.0 | 1.0.1 | Stable |
| psutil | 5.9.0 | 5.9.6 | 5.9.7 | System monitoring |
| mcp | 0.9.0 | 0.9.0 | 1.0.0 | Protocol updates |
| eventlet | 0.33.0 | 0.33.3 | 0.35.1 | Async support |

### Known Incompatibilities

#### Flask-SocketIO + Flask Version

- Flask-SocketIO 5.3.x requires Flask >= 2.3.0
- Flask 3.0.0 is fully compatible
- ⚠ Flask < 2.3.0 will cause import errors

#### Discord.py + Python Version

- discord.py 2.3.x requires Python >= 3.8
- ⚠ Python 3.7 and below not supported

#### MCP + Async Libraries

- MCP requires asyncio support (Python 3.7+)
- Compatible with both eventlet and gevent
- ⚠ May conflict with older async libraries

---

## Dependency Analysis

### Standard Library (No Installation Needed)

These are built into Python 3.8+ and don't need installation:

| Module | Purpose | First Available |
|--------|---------|-----------------|
| sqlite3 | Database | Python 2.5+ |
| json | JSON parsing | Python 2.6+ |
| asyncio | Async operations | Python 3.4+ |
| datetime | Date/time | Python 1.5+ |
| typing | Type hints | Python 3.5+ |
| logging | Logging | Python 2.3+ |
| secrets | Secure random | Python 3.6+ |
| hashlib | Hashing | Python 2.5+ |
| threading | Multi-threading | Python 1.5+ |
| contextlib | Context managers | Python 2.5+ |
| dataclasses | Data classes | Python 3.7+ |
| enum | Enumerations | Python 3.4+ |
| functools | Functional tools | Python 2.5+ |
| collections | Data structures | Python 2.4+ |
| random | Random generation | Python 1.5+ |
| os | OS interface | Python 1.0+ |
| sys | System parameters | Python 1.0+ |
| subprocess | Subprocess | Python 2.4+ |
| signal | Signal handling | Python 1.0+ |
| traceback | Exception tracing | Python 1.4+ |
| time | Time functions | Python 1.0+ |

### Dependency Tree

```
Arcane Codex
├── Flask (3.0.0)
│   ├── Werkzeug
│   ├── Jinja2
│   └── Click
├── Flask-SocketIO (5.3.5) [MISSING IN ORIGINAL]
│   ├── python-socketio
│   ├── Flask
│   └── eventlet [MISSING IN ORIGINAL]
├── Flask-CORS (4.0.0)
│   └── Flask
├── discord.py (2.3.2)
│   ├── aiohttp
│   └── websockets
├── anthropic (>=0.34.0)
│   └── httpx
├── python-dotenv (1.0.0)
├── psutil (5.9.6) [MISSING IN ORIGINAL]
└── mcp (>=0.9.0) [MISSING IN ORIGINAL]
    └── asyncio
```

### Import Analysis

Total Python files scanned: **20**

**External dependencies found**:
- `flask`: 5 files
- `flask_socketio`: 3 files (⚠ MISSING)
- `flask_cors`: 3 files
- `discord`: 2 files
- `anthropic`: 0 files (imported dynamically)
- `python-dotenv`: 0 files (used via os.getenv)
- `psutil`: 1 file (⚠ MISSING)
- `mcp`: 4 files (⚠ MISSING)

**Standard library imports**: 100+ across all files

---

## Security Considerations

### Dependency Vulnerabilities

#### Regular Security Audits

Run security checks:
```bash
# Using pip-audit (recommended)
pip install pip-audit
pip-audit

# Using safety
pip install safety
safety check
```

#### Known Security Issues

| Dependency | CVE | Severity | Status | Fix |
|-----------|-----|----------|--------|-----|
| Flask < 2.3.0 | CVE-2023-30861 | HIGH | Fixed in 3.0.0 | ✓ |
| eventlet < 0.33.3 | CVE-2023-4863 | MEDIUM | Fixed in 0.33.3 | ✓ |

### Pinning Strategies

#### Strict Pinning (Production)
```
Flask==3.0.0
flask-socketio==5.3.5
```
**Pros**: Reproducible builds
**Cons**: Miss security updates

#### Range Pinning (Recommended)
```
Flask>=3.0.0,<4.0.0
flask-socketio>=5.3.5,<6.0.0
```
**Pros**: Security updates, compatible versions
**Cons**: May break on minor changes

#### Unpinned (Not Recommended)
```
Flask
flask-socketio
```
**Pros**: Always latest
**Cons**: Breaking changes, instability

### Recommended Configuration

**requirements.txt** (Production):
```
Flask==3.0.0
flask-socketio==5.3.5
discord.py==2.3.2
# Security: pin exact versions
```

**requirements-dev.txt** (Development):
```
Flask>=3.0.0
flask-socketio>=5.3.0
# Flexibility: allow updates
```

---

## Known Issues

### Issue 1: Flask-SocketIO Async Mode

**Problem**: Flask-SocketIO requires either eventlet or gevent

**Symptoms**:
```
ImportError: Flask-SocketIO requires either eventlet or gevent for async operations
```

**Solution**:
```bash
pip install eventlet>=0.33.3
```

**Code fix**:
```python
# In app.py
socketio = SocketIO(app, async_mode='eventlet')  # or 'gevent'
```

### Issue 2: Discord.py Intents

**Problem**: Discord.py 2.0+ requires explicit intents

**Symptoms**:
```
discord.errors.Privileged IntentsRequired: Privileged intents are not enabled
```

**Solution**: Enable intents in Discord Developer Portal
```python
# In discord_bot.py
intents = discord.Intents.default()
intents.message_content = True
intents.members = True
```

### Issue 3: MCP Connection Failures

**Problem**: MCP requires Claude Desktop to be running

**Symptoms**:
```
RuntimeError: MCP scenario generation failed!
```

**Solution**:
1. Install Claude Desktop
2. Configure MCP server in Claude Desktop
3. See MCP_SETUP.md

### Issue 4: psutil Compilation (Linux)

**Problem**: psutil may require compilation on Linux

**Symptoms**:
```
error: command 'gcc' failed with exit status 1
```

**Solution**:
```bash
# Ubuntu/Debian
sudo apt-get install python3-dev gcc

# Then reinstall
pip install psutil
```

---

## Dependency Upgrade Guide

### Safe Upgrade Path

1. **Check current versions**:
   ```bash
   pip list
   ```

2. **Check for updates**:
   ```bash
   pip list --outdated
   ```

3. **Test in virtual environment**:
   ```bash
   python -m venv test_env
   source test_env/bin/activate  # Windows: test_env\Scripts\activate
   pip install --upgrade <package>
   python verify_setup.py
   ```

4. **If tests pass, upgrade production**:
   ```bash
   pip install --upgrade <package>
   pip freeze > requirements.txt
   ```

### Major Version Upgrades

⚠ **Caution**: Major version upgrades may break compatibility

#### Flask 2.x → 3.x
- **Breaking changes**: Minimal
- **Risk**: LOW
- **Test**: API endpoints, SocketIO

#### discord.py 1.x → 2.x
- **Breaking changes**: Intents required
- **Risk**: MEDIUM
- **Test**: Bot commands, DMs

#### anthropic 0.x → 1.x
- **Breaking changes**: API changes expected
- **Risk**: HIGH
- **Test**: AI GM functionality

---

## Quick Reference

### Check Dependencies

```bash
python check_dependencies.py
```

### Install All Dependencies

```bash
pip install -r requirements.txt
```

### Upgrade All Dependencies

```bash
pip install --upgrade -r requirements.txt
```

### Freeze Current Environment

```bash
pip freeze > requirements-freeze.txt
```

### Audit Security

```bash
pip install pip-audit
pip-audit
```

---

## Troubleshooting Commands

### Reinstall Everything

```bash
pip uninstall -r requirements.txt -y
pip install -r requirements.txt
```

### Clear Pip Cache

```bash
pip cache purge
```

### Force Reinstall

```bash
pip install --force-reinstall --no-cache-dir -r requirements.txt
```

### Check Import Errors

```python
# Test each dependency
python -c "import flask; print('Flask OK')"
python -c "import flask_socketio; print('Flask-SocketIO OK')"
python -c "import discord; print('Discord.py OK')"
python -c "import psutil; print('psutil OK')"
python -c "import mcp; print('MCP OK')"
```

---

**Last Updated**: 2025-01-06
**Version**: 1.0.0
**Critical Missing Dependencies**: 4 (flask-socketio, psutil, mcp, eventlet)
