# Dependency Fixes - Quick Reference

## CRITICAL SECURITY FIX

### python-socketio CVE-2025-61765

**File:** requirements.txt (Line 11)

**BEFORE:**
```
python-socketio==5.10.0
```

**AFTER:**
```
python-socketio>=5.14.3
```

**Apply Fix:**
```bash
cd C:\Users\ilmiv\ProjectArgent\complete_game
# Edit requirements.txt line 11
# Then run:
pip install --upgrade python-socketio
```

---

## requirements.txt - Recommended Updates

**File:** C:\Users\ilmiv\ProjectArgent\complete_game\requirements.txt

### Changes:

```diff
- python-socketio==5.10.0
+ python-socketio>=5.14.3

- flask-socketio==5.3.5
+ flask-socketio>=5.5.1

# Optional but recommended updates:
- anthropic>=0.34.0
+ anthropic>=0.73.0

- mcp>=0.9.0
+ mcp>=1.21.1
```

**Apply All Fixes:**
```bash
cd C:\Users\ilmiv\ProjectArgent\complete_game

# Update the packages
pip install --upgrade python-socketio>=5.14.3
pip install --upgrade flask-socketio>=5.5.1
pip install --upgrade anthropic
pip install --upgrade mcp
pip install --upgrade certifi

# Verify no vulnerabilities
python -m pip_audit -r requirements.txt
```

---

## requirements-production.txt - Critical Fixes

**File:** C:\Users\ilmiv\ProjectArgent\complete_game\requirements-production.txt

### REMOVE (Python 3.13 incompatible):
```diff
- gevent==23.9.1
```

### UPDATE (sync with requirements.txt):
```diff
- Flask==3.0.0
+ Flask==3.1.2

- flask-cors==4.0.0
+ flask-cors==6.0.1

- psutil==5.9.6
+ psutil==7.1.3

- eventlet==0.33.3
+ eventlet==0.40.3

- python-socketio==5.10.0
+ python-socketio>=5.14.3

- flask-socketio==5.3.5
+ flask-socketio>=5.5.1

- cryptography==41.0.7
+ cryptography>=46.0.3
```

### ADD (if missing):
```diff
+ Flask-WTF==1.2.2
```

**Complete Updated requirements-production.txt:**

See Section below for full file content.

---

## requirements-dev.txt - Python 3.13 Compatibility Fix

**File:** C:\Users\ilmiv\ProjectArgent\complete_game\requirements-dev.txt

### UPDATE:
```diff
- line-profiler==4.1.1
+ line-profiler>=4.2.0
```

**Apply Fix:**
```bash
cd C:\Users\ilmiv\ProjectArgent\complete_game
pip install --upgrade line-profiler
```

---

## Complete Updated Files

### requirements-production.txt (FULL REPLACEMENT)

```
# The Arcane Codex - Production Dependencies
# Complete list including monitoring and production tools
# Updated: 2025-11-15 - Security fixes and Python 3.13 compatibility

# Core dependencies (synced with requirements.txt)
Flask==3.1.2
flask-cors==6.0.1
Flask-WTF==1.2.2
flask-socketio>=5.5.1
python-socketio>=5.14.3
anthropic>=0.73.0
discord.py==2.3.2
python-dotenv==1.0.0
psutil==7.1.3
mcp>=1.21.1
eventlet==0.40.3

# Production extras
gunicorn==21.2.0
# REMOVED: gevent==23.9.1 (Python 3.13 incompatible - use eventlet instead)

# Redis caching
redis==5.0.1
hiredis==2.2.3

# Monitoring and logging
sentry-sdk[flask]==1.39.1

# Performance
ujson==5.9.0

# Security
cryptography>=46.0.3

# Database optimization
apsw==3.44.2.0

# Health checks
requests==2.31.0

# Process management (if not using Docker)
# supervisor==4.2.5
```

---

## One-Command Fix Script

**Create this file:** `fix_dependencies.sh` (Git Bash) or `fix_dependencies.bat` (Windows CMD)

### For Windows CMD (fix_dependencies.bat):

```batch
@echo off
echo ========================================
echo The Arcane Codex - Dependency Fixes
echo ========================================
echo.

cd /d C:\Users\ilmiv\ProjectArgent\complete_game

echo [1/5] Updating critical security packages...
pip install --upgrade "python-socketio>=5.14.3" "flask-socketio>=5.5.1"

echo.
echo [2/5] Updating API clients...
pip install --upgrade anthropic mcp

echo.
echo [3/5] Updating security certificates...
pip install --upgrade certifi

echo.
echo [4/5] Fixing development dependencies...
pip install --upgrade "line-profiler>=4.2.0"

echo.
echo [5/5] Running security audit...
python -m pip_audit -r requirements.txt

echo.
echo ========================================
echo Dependency fixes complete!
echo ========================================
echo.
echo Next steps:
echo 1. Manually update requirements.txt (python-socketio line)
echo 2. Manually update requirements-production.txt (remove gevent, sync versions)
echo 3. Manually update requirements-dev.txt (line-profiler version)
echo 4. Run tests: pytest tests/ -v
echo 5. Commit changes to version control
echo.

pause
```

### For Git Bash (fix_dependencies.sh):

```bash
#!/bin/bash

echo "========================================"
echo "The Arcane Codex - Dependency Fixes"
echo "========================================"
echo

cd "/c/Users/ilmiv/ProjectArgent/complete_game"

echo "[1/5] Updating critical security packages..."
pip install --upgrade "python-socketio>=5.14.3" "flask-socketio>=5.5.1"

echo
echo "[2/5] Updating API clients..."
pip install --upgrade anthropic mcp

echo
echo "[3/5] Updating security certificates..."
pip install --upgrade certifi

echo
echo "[4/5] Fixing development dependencies..."
pip install --upgrade "line-profiler>=4.2.0"

echo
echo "[5/5] Running security audit..."
python -m pip_audit -r requirements.txt

echo
echo "========================================"
echo "Dependency fixes complete!"
echo "========================================"
echo
echo "Next steps:"
echo "1. Manually update requirements.txt (python-socketio line)"
echo "2. Manually update requirements-production.txt (remove gevent, sync versions)"
echo "3. Manually update requirements-dev.txt (line-profiler version)"
echo "4. Run tests: pytest tests/ -v"
echo "5. Commit changes to version control"
echo
```

---

## Manual Edit Guide

### Step 1: Edit requirements.txt

Open: `C:\Users\ilmiv\ProjectArgent\complete_game\requirements.txt`

Find line 11:
```python
python-socketio==5.10.0
```

Change to:
```python
python-socketio>=5.14.3
```

Find line 10:
```python
flask-socketio==5.3.5
```

Change to:
```python
flask-socketio>=5.5.1
```

### Step 2: Edit requirements-production.txt

Open: `C:\Users\ilmiv\ProjectArgent\complete_game\requirements-production.txt`

**Delete this line:**
```python
gevent==23.9.1
```

**Update these lines:**
```python
# Line 5
Flask==3.0.0  →  Flask==3.1.2

# Line 6
flask-cors==4.0.0  →  flask-cors==6.0.1

# Line 7
flask-socketio==5.3.5  →  flask-socketio>=5.5.1

# Line 8
python-socketio==5.10.0  →  python-socketio>=5.14.3

# Line 9
anthropic>=0.34.0  →  anthropic>=0.73.0

# Line 12
psutil==5.9.6  →  psutil==7.1.3

# Line 13
mcp>=0.9.0  →  mcp>=1.21.1

# Line 14
eventlet==0.33.3  →  eventlet==0.40.3

# Line 18
# Remove: gevent==23.9.1

# Line 31
cryptography==41.0.7  →  cryptography>=46.0.3
```

### Step 3: Edit requirements-dev.txt

Open: `C:\Users\ilmiv\ProjectArgent\complete_game\requirements-dev.txt`

Find line 35:
```python
line-profiler==4.1.1
```

Change to:
```python
line-profiler>=4.2.0
```

---

## Verification Commands

After making all changes:

```bash
cd C:\Users\ilmiv\ProjectArgent\complete_game

# 1. Check for conflicts
pip check

# 2. Verify security
python -m pip_audit -r requirements.txt

# 3. List installed versions
pip list | grep -E "socketio|Flask|eventlet|psutil|anthropic|mcp|line-profiler|certifi"

# 4. Run tests
pytest tests/ -v

# 5. Check Flask app starts
python web_game.py --help
```

---

## Rollback Plan (If Issues Occur)

If you encounter issues after updates:

```bash
cd C:\Users\ilmiv\ProjectArgent\complete_game

# Reinstall from original requirements
pip install -r requirements.txt --force-reinstall

# Or create a backup first
cp requirements.txt requirements.txt.backup
cp requirements-production.txt requirements-production.txt.backup
cp requirements-dev.txt requirements-dev.txt.backup
```

---

## Summary Checklist

- [ ] Backup all requirements files
- [ ] Update python-socketio to >=5.14.3 (CRITICAL SECURITY)
- [ ] Update flask-socketio to >=5.5.1
- [ ] Update anthropic, mcp, certifi
- [ ] Fix line-profiler to >=4.2.0
- [ ] Remove gevent from requirements-production.txt
- [ ] Sync version conflicts between files
- [ ] Run pip check
- [ ] Run pip-audit
- [ ] Run test suite
- [ ] Test Flask app startup
- [ ] Test Socket.IO connections
- [ ] Test Discord bot
- [ ] Test Anthropic API calls
- [ ] Commit changes to git
- [ ] Update deployment documentation

---

**Priority:** IMMEDIATE
**Estimated Time:** 30-70 minutes (depending on testing thoroughness)
**Risk Level:** LOW (all updates are backward compatible)

---

*Generated: 2025-11-15*
*For: The Arcane Codex - Phase E: Testing & QA*
