# The Arcane Codex - Dependency Audit Report
**Date:** 2025-11-15
**Python Version:** 3.13.3
**Environment:** Windows (win32)
**Project:** C:\Users\ilmiv\ProjectArgent\complete_game

---

## Executive Summary

### Critical Findings
- **1 CRITICAL SECURITY VULNERABILITY** found in python-socketio (CVE-2025-61765)
- **4 VERSION CONFLICTS** between requirements.txt and requirements-production.txt
- **2 PYTHON 3.13 COMPATIBILITY ISSUES** (gevent, line-profiler)
- **9 PACKAGES** have newer versions available
- **0 npm vulnerabilities** found

### Overall Status: NEEDS IMMEDIATE ATTENTION

---

## 1. CRITICAL SECURITY VULNERABILITIES

### CVE-2025-61765: Remote Code Execution in python-socketio

**Severity:** CRITICAL
**Package:** python-socketio
**Current Version:** 5.10.0 (requirements.txt) / 5.14.3 (installed)
**Fixed Version:** 5.14.0+
**GHSA ID:** GHSA-g8c6-8fjj-2r4m

**Description:**
A remote code execution vulnerability in python-socketio versions prior to 5.14.0 allows attackers to execute arbitrary Python code through malicious pickle deserialization in multi-server deployments on which the attacker previously gained access to the message queue that the servers use for internal communications.

**Impact:**
- Affects deployments with a compromised message queue
- Can lead to arbitrary code execution in the context of the Socket.IO server process
- Single-server systems without a message queue are NOT vulnerable

**Current Status:**
- requirements.txt specifies 5.10.0 (VULNERABLE)
- Currently installed: 5.14.3 (SECURE)
- **ACTION REQUIRED:** Update requirements.txt to match installed version

**Recommended Fix:**
```
python-socketio>=5.14.3
```

---

## 2. VERSION CONFLICTS

The following packages have conflicting versions between requirements.txt and requirements-production.txt:

| Package | requirements.txt | requirements-production.txt | Currently Installed | Status |
|---------|------------------|----------------------------|---------------------|--------|
| Flask | 3.1.2 | 3.0.0 | 3.1.2 | Use requirements.txt |
| flask-cors | 6.0.1 | 4.0.0 | 6.0.1 | Use requirements.txt |
| psutil | 7.1.3 | 5.9.6 | 7.1.3 | Use requirements.txt |
| eventlet | 0.40.3 | 0.33.3 | 0.40.3 | Use requirements.txt |

**Impact:**
- Deployment confusion: Production file has outdated versions
- Risk of deploying vulnerable or buggy older versions
- Inconsistent behavior between environments

**Recommended Action:**
Update requirements-production.txt to match requirements.txt versions OR consolidate into a single requirements file with optional extras.

---

## 3. PYTHON 3.13 COMPATIBILITY ISSUES

### Issue 1: gevent==23.9.1 (requirements-production.txt)

**Error:** Cython compilation failure - `undeclared name not builtin: long`

**Reason:**
Python 3.13 removed the `long` built-in type that existed in Python 2.x. The gevent 23.9.1 version uses legacy Cython code that references `long`.

**Status:** INCOMPATIBLE with Python 3.13

**Solutions:**
1. **Recommended:** Upgrade to gevent 24.2.1+ (supports Python 3.13)
2. **Alternative:** Use eventlet instead (already in requirements.txt)
3. **Downgrade:** Use Python 3.11 or 3.12 (not recommended)

**Current Situation:**
- requirements.txt uses eventlet (COMPATIBLE)
- requirements-production.txt uses gevent (INCOMPATIBLE)

### Issue 2: line-profiler==4.1.1 (requirements-dev.txt)

**Error:** Build dependency requires Cython==3.0.0a11 (alpha version not available)

**Reason:**
line-profiler 4.1.1 has a strict dependency on an alpha version of Cython that is not compatible with Python 3.13.

**Status:** INCOMPATIBLE with Python 3.13

**Solution:**
Upgrade to line-profiler 4.2.0+ which supports Python 3.13 and uses stable Cython versions.

**Recommended Fix:**
```
line-profiler>=4.2.0
```

---

## 4. OUTDATED PACKAGES

The following packages have newer versions available:

| Package | Current | Latest | Priority |
|---------|---------|--------|----------|
| anthropic | 0.72.0 | 0.73.0 | Medium |
| certifi | 2025.10.5 | 2025.11.12 | High (security certs) |
| cyclonedx-python-lib | 9.1.0 | 11.5.0 | Low |
| jiter | 0.11.1 | 0.12.0 | Low |
| mcp | 1.20.0 | 1.21.1 | Medium |
| playwright | 1.55.0 | 1.56.0 | Medium |
| pydantic-settings | 2.11.0 | 2.12.0 | Low |
| uv | 0.9.0 | 0.9.9 | Low |
| wsproto | 1.2.0 | 1.3.1 | Low |

**Priority Upgrades:**
1. **certifi** - Contains SSL/TLS certificates, important for security
2. **anthropic** - AI API client, may have bug fixes
3. **mcp** - Model Context Protocol client, used for dynamic scenarios

---

## 5. NPM PACKAGES STATUS

### Status: ALL CLEAR

**Dependencies:**
- playwright: ^1.56.1 (up to date)
- @playwright/test: ^1.40.0 (up to date)

**Vulnerabilities:** 0
**Outdated packages:** 0
**Status:** SECURE

---

## 6. PACKAGE COMPATIBILITY MATRIX

### Python Version Compatibility

| Package | Python 3.8 | Python 3.9 | Python 3.10 | Python 3.11 | Python 3.12 | Python 3.13 |
|---------|-----------|-----------|------------|------------|------------|------------|
| Flask 3.1.2 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| flask-socketio 5.3.5 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| python-socketio 5.14.3 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| discord.py 2.3.2 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| anthropic 0.72.0 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| eventlet 0.40.3 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| gevent 23.9.1 | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ |
| line-profiler 4.1.1 | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ |
| psutil 7.1.3 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

### Inter-package Dependencies

**Flask Ecosystem:**
- Flask 3.1.2 → Werkzeug 3.1.3 ✓
- Flask-SocketIO 5.3.5 → python-socketio 5.x ✓
- Flask-WTF 1.2.2 → WTForms 3.2.1 ✓
- flask-cors 6.0.1 → Flask 3.x ✓

**Async Stack:**
- eventlet 0.40.3 → greenlet 3.2.4 ✓
- Flask-SocketIO → eventlet OR gevent ✓ (using eventlet)

**AI/API Stack:**
- anthropic 0.72.0 → httpx 0.28.1 ✓
- anthropic → pydantic 2.12.4 ✓

**Status:** All currently installed packages are compatible with each other.

---

## 7. RECOMMENDED ACTIONS

### IMMEDIATE (Priority 1 - Do Now)

1. **Update python-socketio version in requirements.txt**
   ```
   # Change from:
   python-socketio==5.10.0

   # To:
   python-socketio>=5.14.3
   ```

2. **Update Flask-SocketIO to match installed version**
   ```
   # Change from:
   flask-socketio==5.3.5

   # To:
   flask-socketio>=5.5.1
   ```

3. **Sync requirements-production.txt with requirements.txt**
   - Update Flask: 3.0.0 → 3.1.2
   - Update flask-cors: 4.0.0 → 6.0.1
   - Update psutil: 5.9.6 → 7.1.3
   - Update eventlet: 0.33.3 → 0.40.3
   - **Remove gevent** (incompatible with Python 3.13)

### HIGH PRIORITY (Priority 2 - This Week)

4. **Update certifi for latest SSL certificates**
   ```bash
   pip install --upgrade certifi
   ```

5. **Fix line-profiler in requirements-dev.txt**
   ```
   # Change from:
   line-profiler==4.1.1

   # To:
   line-profiler>=4.2.0
   ```

6. **Update anthropic API client**
   ```bash
   pip install --upgrade anthropic
   ```

### MEDIUM PRIORITY (Priority 3 - This Month)

7. **Update MCP client**
   ```bash
   pip install --upgrade mcp
   ```

8. **Update Playwright**
   ```bash
   pip install --upgrade playwright
   npm update playwright
   playwright install chromium
   ```

9. **Consolidate requirements files**
   - Consider using a single requirements.txt with optional extras
   - Or use a requirements/ directory with base.txt, dev.txt, prod.txt structure
   - Document which file is the source of truth

### LOW PRIORITY (Optional)

10. **Update remaining packages to latest versions**
    ```bash
    pip install --upgrade jiter pydantic-settings wsproto cyclonedx-python-lib uv
    ```

---

## 8. TESTING RECOMMENDATIONS

After applying updates, run the following tests:

### Unit Tests
```bash
pytest tests/ -v
```

### Integration Tests
```bash
python -m playwright test
```

### Socket.IO Tests
```bash
# Test WebSocket connections
# Test multi-server messaging (if applicable)
# Verify no pickle deserialization warnings
```

### Performance Tests
```bash
# Monitor memory usage with psutil
# Check Flask-SocketIO async performance
# Verify eventlet greenlet pool behavior
```

### Security Audit (Re-run after updates)
```bash
python -m pip_audit -r requirements.txt
python -m pip_audit -r requirements-dev.txt
npm audit
```

---

## 9. DEPENDENCY INSTALLATION STATUS

### Currently Installed (89 packages)

**Status:** Complete ✓

All packages from requirements.txt are installed with compatible versions. The installed versions are actually NEWER and MORE SECURE than what's specified in the requirements files.

### Missing Dependencies

**None** - All required packages are installed.

### Extra Packages (not in requirements files)

These are installed but not explicitly listed:
- pip-audit (development tool)
- uv (fast Python package installer)
- audioop-lts (Python 3.13 compatibility shim)
- Various transitive dependencies (automatically installed)

---

## 10. SECURITY BEST PRACTICES

### Current Security Posture: GOOD (after fixing python-socketio)

**Recommendations:**

1. **Pin all versions in production**
   - Use exact versions (==) in requirements.txt
   - Use ranges (>=) only for known secure packages

2. **Regular security audits**
   ```bash
   # Run monthly:
   python -m pip_audit -r requirements.txt
   npm audit
   ```

3. **Dependency monitoring**
   - Consider using Dependabot or similar tools
   - Subscribe to security advisories for critical packages
   - Monitor: Flask, python-socketio, discord.py, anthropic

4. **Update schedule**
   - Security patches: Immediate
   - Bug fixes: Weekly review
   - Feature updates: Monthly review
   - Major versions: Quarterly review with testing

5. **Environment isolation**
   - Use virtual environments (venv)
   - Separate dev/test/prod dependencies
   - Document Python version requirements

---

## 11. DEPLOYMENT NOTES

### Production Deployment Checklist

Before deploying to production:

- [ ] Update requirements.txt with security fixes
- [ ] Update requirements-production.txt to match requirements.txt
- [ ] Remove or fix gevent dependency (use eventlet instead)
- [ ] Run pip-audit and ensure 0 vulnerabilities
- [ ] Run full test suite
- [ ] Verify Python 3.13 compatibility
- [ ] Test Flask-SocketIO connections
- [ ] Check Discord bot functionality
- [ ] Verify Anthropic API integration
- [ ] Test MCP scenario generation
- [ ] Load test with eventlet
- [ ] Document any breaking changes

### Docker Considerations

If using Docker:
```dockerfile
FROM python:3.13-slim

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Use eventlet for async (not gevent)
ENV FLASK_ASYNC_MODE=eventlet
```

---

## 12. CONCLUSION

### Summary of Findings

**Security:** 1 critical vulnerability identified and fix available
**Compatibility:** 2 packages incompatible with Python 3.13
**Maintenance:** 9 packages have updates available
**Conflicts:** 4 version mismatches between requirement files

### Overall Risk Assessment

**Current Risk Level: MEDIUM**

- High: Outdated python-socketio in requirements.txt (but newer version installed)
- Medium: Version conflicts could cause deployment issues
- Medium: Python 3.13 incompatibilities in production requirements
- Low: Several outdated packages, but no critical issues

### Recommended Priority Order

1. Fix python-socketio version specification (5 minutes)
2. Sync requirements-production.txt versions (10 minutes)
3. Remove gevent from requirements-production.txt (2 minutes)
4. Update certifi, anthropic, mcp (5 minutes)
5. Fix line-profiler in dev requirements (2 minutes)
6. Test all changes (30 minutes)
7. Update remaining packages (15 minutes)

**Total estimated time: ~70 minutes**

### Next Steps

1. Apply IMMEDIATE actions from Section 7
2. Run security audit to verify fixes
3. Run test suite to ensure compatibility
4. Document changes in CHANGELOG
5. Schedule regular dependency reviews (monthly)

---

## APPENDIX A: Complete Package List

### Production Dependencies (requirements.txt)

```
Flask==3.1.2
flask-cors==6.0.1
Flask-WTF==1.2.2
flask-socketio==5.3.5 → NEEDS UPDATE to 5.5.1+
python-socketio==5.10.0 → NEEDS UPDATE to 5.14.3+ (SECURITY)
anthropic>=0.34.0 → Currently 0.72.0
discord.py==2.3.2
python-dotenv==1.0.0
psutil==7.1.3
mcp>=0.9.0 → Currently 1.20.0
eventlet==0.40.3
```

### Development Dependencies (requirements-dev.txt)

```
pytest==7.4.3
pytest-asyncio==0.21.1
pytest-cov==4.1.0
pylint==3.0.3
flake8==6.1.0
black==23.12.1
mypy==1.7.1
types-requests==2.31.0.10
ipython==8.18.1
ipdb==0.13.13
memory-profiler==0.61.0
line-profiler==4.1.1 → NEEDS UPDATE to 4.2.0+ (Python 3.13 compat)
sphinx==7.2.6
sphinx-rtd-theme==2.0.0
watchdog==3.0.0
python-dotenv==1.0.0
```

### Production-Specific Dependencies (requirements-production.txt)

```
Flask==3.0.0 → CONFLICT: should be 3.1.2
flask-cors==4.0.0 → CONFLICT: should be 6.0.1
flask-socketio==5.3.5
python-socketio==5.10.0 → SECURITY: needs 5.14.0+
anthropic>=0.34.0
discord.py==2.3.2
python-dotenv==1.0.0
psutil==5.9.6 → CONFLICT: should be 7.1.3
mcp>=0.9.0
eventlet==0.33.3 → CONFLICT: should be 0.40.3
gunicorn==21.2.0
gevent==23.9.1 → INCOMPATIBLE with Python 3.13
redis==5.0.1
hiredis==2.2.3
sentry-sdk[flask]==1.39.1
ujson==5.9.0
cryptography==41.0.7
apsw==3.44.2.0
requests==2.31.0
```

---

**Report Generated By:** Dependency Checker Agent
**Tools Used:** pip-audit 2.9.0, npm audit, pip list
**Environment:** Python 3.13.3, pip 25.3, npm (detected)

---

*End of Report*
