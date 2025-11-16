# PHASE M: DEPENDENCY AUDIT REPORT
## The Arcane Codex - Complete Dependency Analysis

**Report Generated:** November 16, 2025
**Project:** The Arcane Codex
**Location:** ~/ProjectArgent/complete_game/

---

## EXECUTIVE SUMMARY

### Overall Status: GOOD with Minor Updates Recommended

- **Python Dependencies:** 9/9 required packages installed
- **Node.js Dependencies:** All packages installed, 0 critical vulnerabilities
- **Security Issues:** 2 LOW severity vulnerabilities in Python (uv package)
- **Outdated Packages:** 10 Python packages, 3 Node.js packages have updates available
- **Version Conflicts:** None detected

---

## 1. PYTHON DEPENDENCIES

### 1.1 Production Dependencies (requirements.txt)

| Package | Required | Installed | Status | Notes |
|---------|----------|-----------|--------|-------|
| Flask | 3.1.2 | 3.1.2 | OK | Web framework |
| flask-cors | 6.0.1 | 6.0.1 | OK | CORS support |
| Flask-WTF | 1.2.2 | 1.2.2 | OK | CSRF protection |
| flask-socketio | >=5.5.1 | 5.5.1 | OK | WebSocket support |
| python-socketio | >=5.14.3 | 5.14.3 | OK | Required by flask-socketio |
| Flask-Limiter | 3.5.0 | 3.5.0 | OK | Rate limiting |
| anthropic | >=0.34.0 | 0.72.0 | UPDATE AVAILABLE | AI API client |
| discord.py | 2.3.2 | 2.6.4 | NEWER | Discord bot framework |
| python-dotenv | 1.0.0 | 1.2.1 | NEWER | Environment variables |
| psutil | 7.1.3 | 7.1.3 | OK | System monitoring |
| mcp | >=0.9.0 | 1.20.0 | UPDATE AVAILABLE | Model Context Protocol |
| eventlet | 0.40.3 | 0.40.3 | OK | Async operations for socketio |

### 1.2 Production-Only Dependencies (requirements-production.txt)

| Package | Required | Installed | Status | Usage |
|---------|----------|-----------|--------|-------|
| gunicorn | 21.2.0 | NOT CHECKED | UNUSED | Production WSGI server |
| redis | 5.0.1 | NOT INSTALLED | UNUSED | Caching (optional) |
| hiredis | 2.2.3 | NOT INSTALLED | UNUSED | Redis performance |
| sentry-sdk[flask] | 1.39.1 | NOT INSTALLED | UNUSED | Error tracking |
| ujson | 5.9.0 | NOT INSTALLED | UNUSED | JSON performance |
| cryptography | 41.0.7 | 46.0.3 | INSTALLED | Security (newer version) |
| apsw | 3.44.2.0 | NOT INSTALLED | UNUSED | SQLite optimization |
| requests | 2.31.0 | 2.32.5 | INSTALLED | HTTP requests (newer) |

**Note:** Production-only packages are currently not used in active codebase. They are available for production deployment scenarios.

### 1.3 Development Dependencies (requirements-dev.txt)

| Package | Required | Installed | Status | Purpose |
|---------|----------|-----------|--------|---------|
| pytest | 7.4.3 | NOT INSTALLED | OPTIONAL | Testing framework |
| pytest-asyncio | 0.21.1 | NOT INSTALLED | OPTIONAL | Async testing |
| pytest-cov | 4.1.0 | NOT INSTALLED | OPTIONAL | Test coverage |
| pylint | 3.0.3 | NOT INSTALLED | OPTIONAL | Code linting |
| flake8 | 6.1.0 | NOT INSTALLED | OPTIONAL | Code style |
| black | 23.12.1 | NOT INSTALLED | OPTIONAL | Code formatting |
| mypy | 1.7.1 | NOT INSTALLED | OPTIONAL | Type checking |
| ipython | 8.18.1 | NOT INSTALLED | OPTIONAL | Enhanced REPL |
| watchdog | 3.0.0 | NOT INSTALLED | OPTIONAL | File monitoring |

---

## 2. NODE.JS DEPENDENCIES

### 2.1 Production Dependencies (package.json)

| Package | Required | Installed | Latest | Status |
|---------|----------|-----------|--------|--------|
| cookie-parser | ^1.4.6 | 1.4.7 | 1.4.7 | OK |
| cors | ^2.8.5 | 2.8.5 | 2.8.5 | OK |
| dotenv | ^16.3.1 | 16.6.1 | 17.2.3 | UPDATE AVAILABLE |
| express | ^4.18.2 | 4.21.2 | 5.1.0 | MAJOR UPDATE AVAILABLE |
| express-session | ^1.17.3 | 1.18.1 | 1.18.1 | OK |
| helmet | ^7.1.0 | 7.2.0 | 8.1.0 | UPDATE AVAILABLE |
| morgan | ^1.10.0 | 1.10.0 | 1.10.0 | OK |
| playwright | ^1.56.1 | 1.56.1 | 1.56.1 | OK |
| sqlite3 | ^5.1.7 | 5.1.7 | 5.1.7 | OK |

### 2.2 Development Dependencies

| Package | Required | Installed | Latest | Status |
|---------|----------|-----------|--------|--------|
| @playwright/test | ^1.40.0 | 1.40.0 | 1.56.1 | UPDATE AVAILABLE |
| nodemon | ^3.0.2 | 3.1.9 | 3.1.9 | OK |

### 2.3 Node.js Security Audit

**Result: PASSED**
- Total vulnerabilities: 0
- Critical: 0
- High: 0
- Moderate: 0
- Low: 0

All Node.js dependencies are secure with no known vulnerabilities.

---

## 3. SECURITY VULNERABILITIES

### 3.1 Python Security Issues

**Total Vulnerabilities Found: 2 (LOW severity)**

#### Vulnerability 1: GHSA-w476-p2h3-79g9

- **Package:** uv
- **Current Version:** 0.9.0
- **Fixed In:** 0.9.5
- **Severity:** LOW
- **Impact:** TAR archive parsing differential in source distributions
- **Description:** TAR archives with PAX headers could extract differently between uv and other installers
- **Risk Assessment:** Low - source distributions execute arbitrary code by design
- **Recommendation:** Update to uv >= 0.9.5

#### Vulnerability 2: GHSA-pqhf-p39g-3x64

- **Package:** uv
- **Current Version:** 0.9.0
- **Fixed In:** 0.9.6
- **Severity:** LOW
- **Impact:** ZIP archive parsing differentials
- **Description:** ZIP archives could be constructed to extract differently across installers
- **Risk Assessment:** Low - requires user interaction and malicious package
- **Recommendation:** Update to uv >= 0.9.6

**Note:** The `uv` package is a development/build tool, not a runtime dependency. These vulnerabilities have minimal impact on production deployments.

### 3.2 Node.js Security Issues

**No vulnerabilities detected** in npm audit.

---

## 4. OUTDATED PACKAGES

### 4.1 Python Packages with Updates

| Package | Current | Latest | Update Type | Priority |
|---------|---------|--------|-------------|----------|
| anthropic | 0.72.0 | 0.73.0 | MINOR | MEDIUM |
| certifi | 2025.10.5 | 2025.11.12 | PATCH | LOW |
| click | 8.3.0 | 8.3.1 | PATCH | LOW |
| cyclonedx-python-lib | 9.1.0 | 11.5.0 | MAJOR | LOW |
| jiter | 0.11.1 | 0.12.0 | MINOR | LOW |
| mcp | 1.20.0 | 1.21.1 | MINOR | MEDIUM |
| playwright | 1.55.0 | 1.56.0 | MINOR | MEDIUM |
| pydantic-settings | 2.11.0 | 2.12.0 | MINOR | LOW |
| uv | 0.9.0 | 0.9.9 | PATCH | HIGH (security) |
| wsproto | 1.2.0 | 1.3.1 | MINOR | LOW |

### 4.2 Node.js Packages with Updates

| Package | Current | Latest | Update Type | Breaking? |
|---------|---------|--------|-------------|-----------|
| dotenv | 16.6.1 | 17.2.3 | MAJOR | Likely |
| express | 4.21.2 | 5.1.0 | MAJOR | YES |
| helmet | 7.2.0 | 8.1.0 | MAJOR | Possibly |
| @playwright/test | 1.40.0 | 1.56.1 | MINOR | No |

---

## 5. IMPORT ANALYSIS

### 5.1 Third-Party Imports Used in Code

All required third-party packages are imported and in use:

- anthropic
- discord (discord.py)
- dotenv (python-dotenv)
- flask, flask_cors, flask_limiter, flask_socketio, flask_wtf
- mcp
- playwright
- psutil
- requests
- sqlite3 (standard library)

### 5.2 Unused Dependencies

The following packages are installed but not directly imported in the active codebase:

**Intentionally Unused (Infrastructure):**
- `eventlet` - Required by flask-socketio as async backend
- `python-socketio` - Required by flask-socketio
- `gunicorn` - Production WSGI server (used via command line)

**Not Currently Used (Optional Production Tools):**
- `redis` - Caching layer (not installed)
- `hiredis` - Redis performance (not installed)
- `sentry-sdk` - Error tracking (not installed)
- `ujson` - JSON performance (not installed)
- `apsw` - SQLite optimization (not installed)
- `cryptography` - May be used by Flask-WTF/cryptographic operations

**Development Tools (Not Required in Production):**
- `pytest`, `pylint`, `black`, `mypy` - Not installed (optional dev tools)

---

## 6. VERSION CONFLICTS

**No version conflicts detected** between requirements.txt and requirements-production.txt.

All shared dependencies specify the same versions across both files.

---

## 7. BREAKING CHANGES TO WATCH FOR

### 7.1 Express.js 5.x (If Upgrading)

**Major Breaking Changes:**
- `app.del()` removed - use `app.delete()` instead
- `express.bodyParser` middleware removed
- Path route matching syntax changes
- `req.param()` removed
- Various middleware packages extracted to separate modules

**Recommendation:** Stay on Express 4.x for now unless specific features of 5.x are needed. Express 4.x is stable and widely supported.

### 7.2 Dotenv 17.x (If Upgrading)

**Changes:**
- Requires Node.js 18+ (up from 12+)
- New CLI options and features
- Improved TypeScript support

**Recommendation:** Safe to upgrade if using Node.js 18+

### 7.3 Helmet 8.x (If Upgrading)

**Changes:**
- Updated Content Security Policy defaults
- Some deprecated options removed
- New security headers added

**Recommendation:** Review CSP configuration after upgrade

### 7.4 Anthropic Python SDK

**0.72.0 to 0.73.0:**
- Generally backward compatible
- May include new features and bug fixes
- Check release notes for any deprecations

**Recommendation:** Safe to upgrade

---

## 8. RECOMMENDED UPDATES

### 8.1 HIGH Priority (Security)

```bash
# Update uv to fix security vulnerabilities
pip install --upgrade uv
```

### 8.2 MEDIUM Priority (Features & Compatibility)

```bash
# Update core API clients
pip install --upgrade anthropic>=0.73.0
pip install --upgrade mcp>=1.21.1

# Update Playwright for latest browser compatibility
pip install --upgrade playwright>=1.56.0
playwright install chromium
```

```bash
# Update Playwright test framework (Node.js)
npm install --save-dev @playwright/test@^1.56.1
```

### 8.3 LOW Priority (Maintenance)

```bash
# Update certificates and utilities
pip install --upgrade certifi click wsproto pydantic-settings
```

### 8.4 NOT Recommended (Breaking Changes)

```bash
# DO NOT upgrade these without testing
# npm install express@5  # Major breaking changes
# npm install dotenv@17  # Requires Node 18+
# npm install helmet@8   # CSP config changes
```

---

## 9. INSTALLATION COMMANDS

### 9.1 Fresh Installation

```bash
# Install base production dependencies
pip install -r requirements.txt

# Install ALL production dependencies (including monitoring)
pip install -r requirements-production.txt

# Install development dependencies
pip install -r requirements-dev.txt
```

### 9.2 Install Node.js Dependencies

```bash
# Install all Node.js dependencies
npm install

# Install Playwright browsers
npx playwright install chromium
```

### 9.3 Update All Safe Packages

```bash
# Python - Update all non-breaking packages
pip install --upgrade \
    anthropic \
    mcp \
    playwright \
    certifi \
    click \
    wsproto \
    pydantic-settings \
    uv

# Reinstall Playwright browsers after update
python -m playwright install chromium

# Node.js - Update non-breaking packages
npm update @playwright/test
```

---

## 10. DEPENDENCY TREE INSIGHTS

### 10.1 Core Dependencies

```
Flask (3.1.2)
├── Werkzeug (3.1.3)
├── Jinja2 (3.1.6)
├── itsdangerous (2.2.0)
└── click (8.3.0)

Flask-SocketIO (5.5.1)
├── python-socketio (5.14.3)
├── python-engineio (4.12.3)
└── eventlet (0.40.3)
    └── greenlet (3.2.4)

Anthropic (0.72.0)
├── httpx (0.28.1)
├── pydantic (2.12.4)
└── typing-extensions (4.15.0)

Discord.py (2.6.4)
├── aiohttp (3.13.2)
└── PyJWT (2.10.1)
```

### 10.2 Size Estimates

- **Python dependencies:** ~450MB total
- **Node.js dependencies:** ~240MB total
- **Playwright browsers:** ~400MB (Chromium only)
- **Total:** ~1.1GB

---

## 11. RECOMMENDATIONS SUMMARY

### Immediate Actions

1. **Update uv** to fix security vulnerabilities (v0.9.9)
2. **Update anthropic** SDK to v0.73.0 for latest features
3. **Update mcp** to v1.21.1 for protocol improvements

### Short-term (Next Sprint)

4. **Update Playwright** (Python & Node) to v1.56.x for browser compatibility
5. **Install development tools** (pytest, black, pylint) for better code quality
6. **Review production dependencies** - consider if redis, sentry-sdk are needed

### Long-term (Future Consideration)

7. **Plan Express 5.x migration** - requires code changes and testing
8. **Evaluate Node.js 18+** requirement for newer package versions
9. **Consider dependency reduction** - evaluate if all production extras are needed

### Do NOT Do

- Do not upgrade Express to v5.x without comprehensive testing
- Do not upgrade dotenv to v17.x unless on Node.js 18+
- Do not install production dependencies (redis, sentry) unless implementing those features

---

## 12. MAINTENANCE SCHEDULE

### Weekly
- Check for security advisories
- Monitor `npm audit` and `pip-audit` outputs

### Monthly
- Review outdated packages: `pip list --outdated` and `npm outdated`
- Update PATCH versions (0.0.X)
- Update security certificates (certifi)

### Quarterly
- Update MINOR versions (0.X.0)
- Update development dependencies
- Review and test MAJOR version updates in dev environment

### Annually
- Audit entire dependency tree
- Remove unused dependencies
- Plan migrations for major framework updates

---

## 13. TESTING CHECKLIST

Before deploying dependency updates:

- [ ] Run all unit tests: `pytest`
- [ ] Run integration tests: `pytest tests/`
- [ ] Run Playwright tests: `npm test`
- [ ] Test Discord bot functionality: `python run_bot.py`
- [ ] Test web game: `python web_game.py`
- [ ] Test WebSocket connections
- [ ] Test AI GM features
- [ ] Test MCP scenario generation
- [ ] Verify CSRF protection works
- [ ] Verify rate limiting works
- [ ] Check browser console for errors
- [ ] Test on production-like environment

---

## 14. ADDITIONAL NOTES

### Python Version
- **Required:** Python 3.8+
- **Currently Using:** Python 3.13.3
- **Status:** Excellent - modern Python with all features

### Node.js Version
- **Required:** Node.js 16+ (18+ for some newer packages)
- **Recommended:** Node.js 18 LTS or 20 LTS

### Database
- **SQLite3:** Included in Python standard library
- **APSW:** Optional performance optimization (not currently installed)

### Development Environment
- All core dependencies installed and working
- Development tools (pytest, black, etc.) are optional but recommended
- Consider setting up pre-commit hooks for code quality

---

## 15. CONTACT & SUPPORT

For dependency-related issues:

1. **Check package documentation** for migration guides
2. **Review changelogs** before major updates
3. **Test in development** environment first
4. **Create backups** before production updates
5. **Monitor error logs** after updates (consider Sentry)

---

**End of Dependency Audit Report**

*Generated by Dependency Checker Agent*
*The Arcane Codex Project*
*Phase M: Maintenance & Monitoring*
