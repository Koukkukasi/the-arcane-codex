# The Arcane Codex - Comprehensive Testing Guide

## Table of Contents
1. [Quick Start](#quick-start)
2. [Running Integration Tests](#running-integration-tests)
3. [Manual Testing Procedures](#manual-testing-procedures)
4. [Security Testing](#security-testing)
5. [Performance Testing](#performance-testing)
6. [Expected Results](#expected-results)
7. [Troubleshooting](#troubleshooting)

---

## Quick Start

### Prerequisites
```bash
# Ensure dependencies are installed
pip install -r requirements.txt

# Verify server starts without errors
python web_game.py
```

### Running All Tests
```bash
# 1. Start the server in one terminal
python web_game.py

# 2. Run integration tests in another terminal
python test_integration_complete.py

# 3. Run Playwright E2E tests (optional)
python playwright_tests.py
```

---

## Running Integration Tests

### Integration Test Suite
The main integration test suite (`test_integration_complete.py`) covers:
- Input validation and XSS prevention
- Authentication and authorization
- Multiplayer game flow
- API endpoint availability
- Session security
- Transaction logging

**Run the test suite:**
```bash
# Ensure server is running on http://localhost:5000
python web_game.py

# In another terminal, run tests
python test_integration_complete.py
```

**Expected output:**
```
ARCANE CODEX - INTEGRATION TEST SUITE
============================================================

Testing server at: http://localhost:5000
Starting tests...

============================================================
TEST 1: Input Validation & XSS Prevention
============================================================

✓ 1.1 XSS Prevention in Username
✓ 1.2 Empty Username Rejection
✓ 1.3 Long Username Rejection
✓ 1.4 Valid Username Accepted

...

============================================================
TEST SUMMARY
============================================================

Total Tests:  20
Passed:       20
Failed:       0
Pass Rate:    100.0%

✓ ALL TESTS PASSED!
```

### Test Results
Results are saved to `test_results.txt` with detailed pass/fail information.

---

## Manual Testing Procedures

### 1. Server Startup Validation

**Test: Server starts correctly**
```bash
python web_game.py
```

**Expected output:**
```
[OK] Loaded persisted secret key from flask_secret.key
[OK] Session security configured (4-hour lifetime, httponly, samesite)
[OK] CSRF protection enabled
[OK] Rate limiting initialized (default: 200/day, 50/hour)
[OK] SocketIO initialized with eventlet async mode

===============================================================
    THE ARCANE CODEX - WEB MULTIPLAYER RPG
===============================================================

Server running at: http://localhost:5000
```

**PASS Criteria:**
- No error messages
- All [OK] messages appear
- Server listens on port 5000

**FAIL Criteria:**
- Import errors
- Port already in use
- Missing dependencies

---

### 2. User Registration Flow

**Test: Create user and join game**

**Step 1: Set username**
```bash
curl -X POST http://localhost:5000/api/set_username \
  -H "Content-Type: application/json" \
  -d '{"username": "TestPlayer1"}' \
  -c cookies.txt
```

**Expected response:**
```json
{
  "status": "success",
  "username": "TestPlayer1",
  "message": "Welcome, TestPlayer1!"
}
```

**Step 2: Create game**
```bash
curl -X POST http://localhost:5000/api/create_game \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -c cookies.txt
```

**Expected response:**
```json
{
  "status": "success",
  "game_code": "ABC123",
  "player_id": "a1b2c3d4...",
  "player_name": "TestPlayer1",
  "message": "Game created! Share code ABC123 with friends"
}
```

**PASS Criteria:**
- 200 status code
- Valid game_code (6 alphanumeric characters)
- Session cookie set

---

### 3. Multiplayer Join Flow

**Test: Second player joins game**

**Step 1: Second player sets username (new session)**
```bash
curl -X POST http://localhost:5000/api/set_username \
  -H "Content-Type: application/json" \
  -d '{"username": "TestPlayer2"}' \
  -c cookies2.txt
```

**Step 2: Join game with code from Player 1**
```bash
curl -X POST http://localhost:5000/api/join_game \
  -H "Content-Type: application/json" \
  -d '{"game_code": "ABC123"}' \
  -b cookies2.txt
```

**Expected response:**
```json
{
  "status": "success",
  "game_code": "ABC123",
  "player_id": "e5f6g7h8...",
  "player_name": "TestPlayer2",
  "message": "Joined game ABC123!",
  "players": ["TestPlayer1", "TestPlayer2"],
  "player_count": 2
}
```

**PASS Criteria:**
- 200 status code
- player_count = 2
- Both usernames in players array

---

### 4. Character Creation (Divine Interrogation)

**Test: Start interrogation and answer questions**

**Step 1: Start interrogation**
```bash
curl -X POST http://localhost:5000/api/start_interrogation \
  -H "Content-Type: application/json" \
  -d '{"class_choice": "Mage"}' \
  -b cookies.txt
```

**Expected response:**
```json
{
  "status": "success",
  "question_number": 1,
  "question_text": "A starving mother steals bread...",
  "options": [
    {
      "id": "q1_a",
      "letter": "A",
      "text": "Uphold the law. Cut off her hand...",
      "favor": {...}
    },
    ...
  ]
}
```

**Step 2: Answer question**
```bash
curl -X POST http://localhost:5000/api/answer_question \
  -H "Content-Type: application/json" \
  -d '{"answer_id": "q1_a"}' \
  -b cookies.txt
```

**Expected response:**
```json
{
  "status": "success",
  "message": "Answer recorded",
  "question_number": 2,
  "divine_favor": {
    "VALDRIS": 20,
    "KORVAN": 10,
    ...
  }
}
```

**PASS Criteria:**
- 10 questions total
- Divine favor accumulates correctly
- Character created after question 10

---

### 5. Game State Access

**Test: Retrieve game state**
```bash
curl -X GET http://localhost:5000/api/game_state \
  -b cookies.txt
```

**Expected response:**
```json
{
  "status": "success",
  "game_state": {
    "current_location": "Valdria",
    "party_trust": 50,
    "turn_number": 1,
    "gold": 100,
    "characters": [...],
    "npc_companions": []
  }
}
```

**PASS Criteria:**
- 200 status code
- Valid game state structure
- All expected fields present

---

### 6. Inventory Management

**Test: View and manage inventory**

**Get inventory:**
```bash
curl -X GET http://localhost:5000/api/inventory/all \
  -b cookies.txt
```

**Expected response:**
```json
{
  "items": [
    {
      "id": "sword_001",
      "name": "Iron Sword",
      "type": "weapon",
      "description": "A simple iron blade",
      "quantity": 1,
      "equipped": false
    }
  ],
  "gold": 100,
  "weight": 15,
  "max_weight": 100
}
```

**Equip item:**
```bash
curl -X POST http://localhost:5000/api/inventory/equip \
  -H "Content-Type: application/json" \
  -d '{"item_id": "sword_001", "slot": "main_hand"}' \
  -b cookies.txt
```

**PASS Criteria:**
- Items returned in correct format
- Equip/unequip operations succeed
- Weight calculations correct

---

### 7. Quest System

**Test: View active quests**
```bash
curl -X GET http://localhost:5000/api/quests/active \
  -b cookies.txt
```

**Expected response:**
```json
{
  "quests": [
    {
      "id": "quest_001",
      "title": "The Missing Artifact",
      "description": "Find the stolen artifact...",
      "objectives": [
        {
          "description": "Talk to the merchant",
          "completed": false
        }
      ],
      "rewards": {
        "gold": 50,
        "experience": 100
      }
    }
  ]
}
```

---

### 8. Divine Council System

**Test: Convene Divine Council**
```bash
curl -X POST http://localhost:5000/api/divine_council/convene \
  -H "Content-Type: application/json" \
  -d '{"situation": "We found a cursed artifact. Should we destroy it?"}' \
  -b cookies.txt
```

**Expected response:**
```json
{
  "status": "success",
  "council_id": "council_001",
  "votes": [
    {
      "god": "VALDRIS",
      "vote": "destroy",
      "reasoning": "Cursed artifacts threaten the order..."
    },
    ...
  ],
  "majority_decision": "destroy",
  "consequences": {
    "party_trust": 5,
    "divine_favor_changes": {...}
  }
}
```

---

### 9. Skills System

**Test: View skill tree**
```bash
curl -X GET http://localhost:5000/api/skills/tree \
  -b cookies.txt
```

**Unlock skill:**
```bash
curl -X POST http://localhost:5000/api/skills/unlock \
  -H "Content-Type: application/json" \
  -d '{"skill_id": "fireball"}' \
  -b cookies.txt
```

**Expected response:**
```json
{
  "status": "success",
  "skill_unlocked": {
    "id": "fireball",
    "name": "Fireball",
    "rank": 1,
    "cooldown": 3
  }
}
```

---

### 10. SocketIO Real-Time Events

**Test: Real-time updates (requires browser or socket client)**

Open browser console at `http://localhost:5000` and test:

```javascript
// Connect to SocketIO
const socket = io();

// Join game room
socket.emit('join_game_room', {game_code: 'ABC123'});

// Listen for player join events
socket.on('player_joined', (data) => {
  console.log('Player joined:', data);
});

// Listen for choice submissions
socket.on('choice_submitted', (data) => {
  console.log('Choice submitted:', data);
});

// Submit a choice
socket.emit('choice_submitted', {
  game_code: 'ABC123',
  choice: 'I choose to help the villagers'
});
```

**PASS Criteria:**
- Connection established
- Events received in real-time
- All players in room receive updates

---

## Security Testing

See [SECURITY_TEST_SCENARIOS.md](SECURITY_TEST_SCENARIOS.md) for detailed security testing procedures including:
- XSS attack scenarios
- SQL injection attempts
- CSRF protection tests
- Session hijacking tests
- Authorization bypass attempts
- Rate limiting verification

---

## Performance Testing

### 1. Load Testing with Apache Bench

**Test: 100 concurrent requests to homepage**
```bash
ab -n 1000 -c 100 http://localhost:5000/
```

**Expected results:**
- Requests per second: >100
- Mean response time: <100ms
- Failed requests: 0

---

### 2. Rate Limiting Verification

**Test: Trigger rate limit**
```bash
# Send 60 requests rapidly (should hit 50/hour limit)
for i in {1..60}; do
  curl -X POST http://localhost:5000/api/create_game \
    -H "Content-Type: application/json" \
    -b cookies.txt
  echo "Request $i"
done
```

**Expected behavior:**
- First 10 requests: 200 OK
- Remaining requests: 429 Too Many Requests

---

### 3. Database Query Performance

**Test: Check slow queries**
```bash
# Enable query logging in database.py
# Monitor logs for queries >100ms
tail -f game.log | grep "SLOW QUERY"
```

**PASS Criteria:**
- No queries >500ms
- Proper indexing on game_code, player_id
- Connection pooling active

---

### 4. Memory Usage Monitoring

**Test: Monitor memory during gameplay**
```bash
# Install psutil if needed
pip install psutil

# Run memory monitor
python -c "
import psutil
import time
pid = $(pgrep -f web_game.py)
while True:
    p = psutil.Process(pid)
    print(f'Memory: {p.memory_info().rss / 1024 / 1024:.2f} MB')
    time.sleep(5)
"
```

**PASS Criteria:**
- Memory stable over time (no leaks)
- Memory <500MB for 100 concurrent sessions

---

### 5. WebSocket Connection Stress Test

**Test: Simulate 50 concurrent socket connections**
```python
# test_socket_stress.py
import socketio
import threading

def connect_client(client_id):
    sio = socketio.Client()
    sio.connect('http://localhost:5000')
    print(f'Client {client_id} connected')
    time.sleep(30)  # Stay connected
    sio.disconnect()

threads = []
for i in range(50):
    t = threading.Thread(target=connect_client, args=(i,))
    threads.append(t)
    t.start()

for t in threads:
    t.join()
```

**PASS Criteria:**
- All 50 clients connect successfully
- No connection drops
- Server remains responsive

---

## Expected Results

### Integration Tests
| Test Category | Expected Pass Rate |
|---------------|-------------------|
| Input Validation | 100% |
| Authentication | 100% |
| Multiplayer Flow | 100% |
| API Endpoints | 100% |
| Security | 100% |
| **TOTAL** | **100%** |

### Manual Tests
| Test | Expected Outcome |
|------|-----------------|
| Server Startup | All [OK] messages, no errors |
| User Registration | 200 OK, session cookie set |
| Game Creation | Valid game code generated |
| Multiplayer Join | Both players in game |
| Divine Interrogation | 10 questions, character created |
| Inventory Management | Items displayed, equip/unequip works |
| Quest System | Quests loaded correctly |
| Divine Council | Gods vote, consequences applied |
| Skills System | Skills unlock, cooldowns work |
| SocketIO Events | Real-time updates received |

### Performance Benchmarks
| Metric | Target | Acceptable |
|--------|--------|-----------|
| Requests/sec | >100 | >50 |
| Response time (avg) | <100ms | <200ms |
| Memory usage | <300MB | <500MB |
| Concurrent users | 100+ | 50+ |
| Failed requests | 0% | <1% |

---

## Troubleshooting

### Server Won't Start

**Problem:** ImportError or ModuleNotFoundError
```
ImportError: No module named 'flask'
```

**Solution:**
```bash
# Install all dependencies
pip install -r requirements.txt

# Verify installation
python -c "import flask; print(flask.__version__)"
```

---

**Problem:** Port already in use
```
OSError: [Errno 48] Address already in use
```

**Solution:**
```bash
# Find process using port 5000
lsof -i :5000  # macOS/Linux
netstat -ano | findstr :5000  # Windows

# Kill the process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows

# Or use a different port
python web_game.py --port 5001
```

---

### Integration Tests Fail

**Problem:** Server not responding
```
ERROR: Cannot connect to server at http://localhost:5000
```

**Solution:**
```bash
# Ensure server is running
python web_game.py

# In another terminal, verify server is up
curl http://localhost:5000/

# If firewall issues, check:
# - Windows Firewall allows Python
# - Antivirus not blocking local connections
```

---

**Problem:** CSRF token errors
```
400 Bad Request: The CSRF token is missing
```

**Solution:**
```bash
# Get CSRF token first
curl -X GET http://localhost:5000/api/csrf-token -c cookies.txt

# Then include in subsequent requests
curl -X POST http://localhost:5000/api/... \
  -b cookies.txt \
  -H "X-CSRFToken: <token>"
```

---

### MCP/Claude Desktop Issues

**Problem:** MCP scenarios not generating
```
❌ MCP client not available. Game requires MCP for dynamic scenarios!
```

**Solution:**
```bash
# Option 1: Set up MCP (see MCP_SETUP.md)
# Option 2: Enable test mode for automated tests
export ARCANE_TEST_MODE=1  # Linux/macOS
set ARCANE_TEST_MODE=1     # Windows CMD
$env:ARCANE_TEST_MODE=1    # Windows PowerShell

# Then restart server
python web_game.py
```

---

### Session Lost After Server Restart

**Problem:** Session expires on server restart

**Solution:**
Server now persists secret key to `flask_secret.key`. Sessions survive restarts.

If still having issues:
```bash
# Check if flask_secret.key exists
ls flask_secret.key

# If not, it will be created on next startup
# Ensure write permissions in project directory
```

---

### Database Connection Errors

**Problem:** Database locked or connection pool exhausted
```
sqlite3.OperationalError: database is locked
```

**Solution:**
```bash
# Close all database connections
# Kill any running processes holding the DB

# Check for .db-wal and .db-shm files
rm arcane_codex.db-wal arcane_codex.db-shm

# Restart server
python web_game.py
```

---

### WebSocket Connection Fails

**Problem:** SocketIO not connecting in browser
```
Console: WebSocket connection failed
```

**Solution:**
1. Check browser console for errors
2. Verify server is running with eventlet:
   ```bash
   pip install eventlet
   python web_game.py
   ```
3. Check for CORS issues (should allow all origins in dev)
4. Try different browser (Chrome recommended)

---

### Rate Limiting Too Aggressive

**Problem:** Getting 429 errors during testing

**Solution:**
```bash
# Temporarily disable rate limiting for testing
# Edit web_game.py, find limiter configuration:
# Comment out @limiter.limit() decorators

# Or increase limits:
limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["1000 per day", "500 per hour"]  # Increased
)
```

---

### Memory Leaks During Load Testing

**Problem:** Memory grows continuously under load

**Solution:**
1. Check for unclosed database connections
2. Verify SocketIO clients disconnect properly
3. Monitor with:
   ```bash
   python -m memory_profiler web_game.py
   ```
4. Check game_sessions dict cleanup (should remove inactive games)

---

### Performance Degradation

**Problem:** Server becomes slow over time

**Diagnostics:**
```bash
# Check active sessions
curl http://localhost:5000/api/health

# Monitor logs for slow queries
tail -f game.log | grep "took"

# Check CPU usage
top -p $(pgrep -f web_game.py)
```

**Solutions:**
- Restart server daily (cron job)
- Implement session timeout cleanup
- Add database query caching
- Scale horizontally (multiple instances + load balancer)

---

## Test Coverage Summary

### Automated Tests
- **Unit tests:** N/A (integration-focused project)
- **Integration tests:** 20+ tests covering core functionality
- **E2E tests:** Playwright suite (10+ scenarios)
- **Security tests:** 15+ attack scenarios

### Manual Test Checklist
- [ ] Server starts without errors
- [ ] User registration works
- [ ] Multiplayer join works
- [ ] Divine interrogation completes
- [ ] Game state accessible
- [ ] Inventory management works
- [ ] Quests display correctly
- [ ] Divine Council votes
- [ ] Skills unlock and use
- [ ] SocketIO events fire
- [ ] Rate limiting active
- [ ] CSRF protection works
- [ ] Session persistence works
- [ ] Error handling graceful
- [ ] Performance acceptable

---

## Next Steps

After completing this testing guide:

1. **Review:** Check [API_TEST_SUITE.md](API_TEST_SUITE.md) for endpoint-specific tests
2. **Security:** Review [SECURITY_TEST_SCENARIOS.md](SECURITY_TEST_SCENARIOS.md)
3. **Deploy:** See [DEPLOYMENT.md](DEPLOYMENT.md) for production deployment
4. **Monitor:** Set up logging and monitoring (see [PRODUCTION_OPTIMIZATION_SUMMARY.md](PRODUCTION_OPTIMIZATION_SUMMARY.md))

---

## Support

For issues or questions:
- Check existing documentation in the project root
- Review error logs in `game.log`
- Check test results in `test_results.txt`
- Ensure all dependencies installed: `pip install -r requirements.txt`

**Happy Testing! May the Seven Gods guide your tests to victory!**
