# Archive Directory

This directory contains legacy Flask applications that have been superseded by **web_game.py** (the current production server).

---

## 📁 Archived Files

### **app.py** (13K)
- **Purpose**: Basic Flask + SocketIO server
- **Features**: Simple multiplayer with basic database operations
- **Status**: Superseded by web_game.py
- **Reason**: No unique functionality, basic implementation

### **app_production.py** (24K)
- **Purpose**: Production-optimized Flask + SocketIO server
- **Features**:
  - Connection pooling (database_pooled.py)
  - Redis caching
  - Performance monitoring
  - Security features
  - Health checks
  - Reconnection handling
- **Status**: Not currently used in production
- **Reason**: web_game.py is the active production server

---

## 🎯 Current Production Server

**web_game.py** is the CURRENT PRODUCTION server with:
- MCP (Model Context Protocol) integration for dynamic scenarios
- CSRF protection (Phase A security fixes)
- XSS protection (Phase A security fixes)
- Web/mobile multiplayer support (1-4 players)
- Integration with arcane_codex_server.py game engine

---

## 🔮 Future Work

**app_production.py** contains valuable production optimizations that could be integrated into **web_game.py**:

1. **Connection Pooling** - Improve database performance
2. **Performance Monitoring** - Track server metrics
3. **Caching Layer** - Redis-based caching for faster responses
4. **Health Checks** - Server health monitoring endpoints
5. **Advanced Security** - Rate limiting, input validation

Consider migrating these features to web_game.py for improved production performance.

---

## ⚠️ Important

**DO NOT DELETE** these files - they contain valuable code that may be useful for future optimizations.

To restore an archived file:
```bash
git mv archive/app_production.py app_production.py
```

---

**Archived**: 2025-11-15 (Phase C Cleanup)
**Superseded By**: web_game.py
