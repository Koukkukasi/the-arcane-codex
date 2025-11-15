# Phase E.2: Comprehensive Error Handling and Logging

This document outlines the complete error handling and logging system implemented for The Arcane Codex game.

## Overview

Phase E.2 adds proper error handling, comprehensive logging, and client-side error tracking to ensure game stability, better debugging, and improved user experience.

### What Was Added

1. **Backend Logging** - Rotating file-based logging with structured log messages
2. **Frontend Error Handling** - Client-side error catching, user-friendly messages, and retry logic
3. **Client Error Reporting** - Server-side logging of client-side errors for monitoring
4. **Rate Limiting** - DOS attack prevention with configurable rate limits
5. **Loading States** - Visual feedback for long-running operations
6. **Error Recovery** - Automatic retry with exponential backoff

---

## Backend Changes (web_game.py)

### 1. Enhanced Logging Configuration

**Location**: Lines 70-84 in `web_game.py`

```python
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(name)s: %(message)s',
    handlers=[
        RotatingFileHandler(
            'game.log',
            maxBytes=10485760,  # 10MB
            backupCount=5       # Keep 5 backup files
        ),
        logging.StreamHandler()  # Also print to console
    ]
)
logger = logging.getLogger(__name__)
```

**Features**:
- Rotating file handler with 10MB max size
- Keeps 5 backup log files (game.log, game.log.1, game.log.2, etc.)
- Logs to both file and console
- Standard format: `[timestamp] [LEVEL] [module]: message`

### 2. Logging Added to All API Endpoints

#### Game Management Endpoints

**CREATE_GAME** - `/api/create_game` (Lines 630-699)
- Logs game creation attempts
- Logs generated game codes
- Logs creation success/failure
- Logs player information

Example log output:
```
2024-11-15 10:30:45,123 [INFO] web_game: [CREATE_GAME] Player a1b2c3d4... attempting to create new game as Alice
2024-11-15 10:30:45,234 [INFO] web_game: [CREATE_GAME] Generated game code ABCD12 for player Alice
2024-11-15 10:30:45,456 [INFO] web_game: [CREATE_GAME] Game ABCD12 created successfully. Players: 1/4 | Creator: Alice
```

**JOIN_GAME** - `/api/join_game` (Lines 701-779)
- Logs join attempts
- Logs game validation (full, started, etc.)
- Logs successful joins
- Logs duplicate prevention
- Logs player count

Example log output:
```
2024-11-15 10:31:20,123 [INFO] web_game: [JOIN_GAME] Player b2c3d4e5... (Bob) attempting to join game
2024-11-15 10:31:20,456 [INFO] web_game: [JOIN_GAME] Player Bob attempting to join game ABCD12
2024-11-15 10:31:20,789 [INFO] web_game: [JOIN_GAME] Player Bob joined game ABCD12. Players: 2/4
```

#### Gameplay Endpoints

**MAKE_CHOICE** - `/api/make_choice` (Lines 940-1036)
- Logs choice submissions
- Logs validation errors (no game, no scenario, duplicate, etc.)
- Logs choice sanitization
- Logs turn completion status
- Tracks submission progress

Example log output:
```
2024-11-15 10:35:10,123 [INFO] web_game: [MAKE_CHOICE] Player a1b2c3d4... making choice in game ABCD12
2024-11-15 10:35:10,456 [INFO] web_game: [MAKE_CHOICE] Player Alice submitted choice in game ABCD12. Submissions: 1/4
2024-11-15 10:35:15,789 [INFO] web_game: [MAKE_CHOICE] All players submitted choices in game ABCD12. Turn ready for resolution.
```

**GENERATE_SCENARIO** - `/api/generate_scenario` (Lines 826-892)
- Logs scenario generation requests
- Logs MCP communication
- Logs successful scenario creation
- Logs scenario themes

Example log output:
```
2024-11-15 10:36:00,123 [INFO] web_game: [GENERATE_SCENARIO] Generating scenario for game ABCD12
2024-11-15 10:36:00,456 [INFO] web_game: [GENERATE_SCENARIO] Calling MCP for game ABCD12. Players: 4
2024-11-15 10:36:02,789 [INFO] web_game: [GENERATE_SCENARIO] Successfully generated scenario mcp_a1b2c3d4 with theme 'betrayal'
```

#### Divine Interrogation Endpoints

**START_INTERROGATION** - `/api/start_interrogation` (Lines 1198-1277)
- Logs interrogation start
- Logs MCP question generation
- Logs test mode usage
- Logs generation errors

Example log output:
```
2024-11-15 10:32:00,123 [INFO] web_game: [START_INTERROGATION] Player a1b2c3d4... starting Divine Interrogation in game ABCD12
2024-11-15 10:32:00,456 [INFO] web_game: [START_INTERROGATION] Generating question via MCP for player a1b2c3d4...
2024-11-15 10:32:01,789 [INFO] web_game: [START_INTERROGATION] Question generated for player a1b2c3d4... Question: 1
```

**ANSWER_QUESTION** - `/api/answer_question` (Lines 1279-1460)
- Logs answer submissions
- Logs question progression
- Logs divine favor changes
- Logs interrogation completion
- Logs character class assignment
- Logs game start when all ready

Example log output:
```
2024-11-15 10:32:30,123 [INFO] web_game: [ANSWER_QUESTION] Player a1b2c3d4... answering with answer_id: q1_a
2024-11-15 10:32:30,456 [INFO] web_game: [ANSWER_QUESTION] Player a1b2c3d4... answered question 1
2024-11-15 10:33:45,789 [INFO] web_game: [ANSWER_QUESTION] Interrogation COMPLETE for Alice. Assigned class: Mage (highest favor: SYLARA)
2024-11-15 10:34:20,111 [INFO] web_game: [ANSWER_QUESTION] All players ready! Game ABCD12 STARTED
```

### 3. Client Error Logging Endpoint

**Location**: Lines 1462-1487 in `web_game.py`

**Endpoint**: `/api/log_client_error` (POST)

```python
@app.route('/api/log_client_error', methods=['POST'])
def log_client_error():
    """Log client-side errors for debugging and monitoring"""
    try:
        data = request.json or {}
        error_message = data.get('error', 'Unknown error')
        error_stack = data.get('stack', '')
        context = data.get('context', 'Unknown context')
        timestamp = data.get('timestamp', datetime.now().isoformat())
        username = session.get('username', 'Unknown')
        game_code = session.get('game_code', 'None')

        logger.error(f"[CLIENT_ERROR] {error_message} | Context: {context} | User: {username} | Game: {game_code}")
```

**Request Format**:
```json
{
  "error": "Network timeout",
  "stack": "Error: Network timeout\n    at apiCall (game.js:100)",
  "context": "/api/make_choice",
  "timestamp": "2024-11-15T10:35:20.123Z"
}
```

**Log Format**:
```
2024-11-15 10:35:20,123 [ERROR] web_game: [CLIENT_ERROR] Network timeout | Context: /api/make_choice | User: Alice | Game: ABCD12
```

### 4. Rate Limiting (DOS Prevention)

**Location**: Lines 67-75 and endpoint decorators

**Configuration**:
```python
limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"],
    storage_uri="memory://"
)
```

**Endpoint-Specific Limits**:
- `/api/create_game`: 10 per hour (prevents game spam)
- `/api/generate_scenario`: 5 per minute (expensive MCP call)

When limit exceeded:
```json
{
  "error": "Rate limit exceeded",
  "message": "Too many requests. Please try again later.",
  "status": 429
}
```

---

## Frontend Changes

### 1. Error Handler Module

**File**: `static/js/error_handler.js` (NEW)

**Key Classes**:

#### ErrorHandler Class
- Automatic retry logic with exponential backoff
- Global error handler for uncaught exceptions
- Client-side error logging
- User-friendly error messages
- Error log tracking

**Methods**:
- `apiCallWithRetry(endpoint, options, retries)` - Make API call with retries
- `showErrorToUser(message, duration)` - Display error toast
- `showSuccessToUser(message, duration)` - Display success toast
- `logError(message, context)` - Log error locally and to server
- `getErrorLog()` - Get error history
- `exportErrorLog()` - Export errors as JSON

#### GameUX Class
- Show/hide loading overlays
- Handle loading state nesting
- User-friendly loading messages

**Methods**:
- `showLoading(message)` - Show loading spinner
- `hideLoading()` - Hide loading spinner

### 2. Enhanced API Request Method

**Location**: `static/js/game.js` lines 174-226

**Changes**:
- Integrated with ErrorHandler's retry logic
- Automatic 3 retries with exponential backoff
- Error logging to server
- Fallback if error handler not loaded

```javascript
async apiRequest(endpoint, method = 'GET', body = null, silent = false) {
    // ... setup code ...

    // Use error handler with automatic retry
    if (typeof errorHandler !== 'undefined' && errorHandler) {
        return await errorHandler.apiCallWithRetry(
            `${this.API_BASE}${endpoint}`,
            options,
            3  // 3 retries
        );
    }
    // ... fallback code ...
}
```

### 3. Error Handling CSS

**File**: `static/css/error_handling.css` (NEW)

**Features**:
- Error toast styling (top-right position)
- Success toast styling
- Loading overlay with spinner
- Smooth animations
- Responsive design for mobile
- Dark mode support

**Toast Animations**:
- Slide in from right
- Fade out after duration
- Manual dismiss button

**Loading Spinner**:
- Spinning animation
- Semi-transparent backdrop
- Centered content
- Responsive sizing

### 4. Global Error Handlers

**Location**: `static/js/error_handler.js` lines 14-38

Catches:
- Global uncaught errors via `window.onerror`
- Unhandled promise rejections via `unhandledrejection` event
- Logs with context to server

---

## Usage Examples

### Backend Logging

To add logging to a new endpoint:

```python
@app.route('/api/my_endpoint', methods=['POST'])
def my_endpoint():
    """My new endpoint"""
    try:
        player_id = get_player_id()
        game_code = session.get('game_code')

        logger.info(f"[MY_ENDPOINT] Starting operation for player {player_id[:8]}...")

        # Do something
        result = some_operation()

        logger.info(f"[MY_ENDPOINT] Operation successful")

        return jsonify({'status': 'success', 'data': result})

    except Exception as e:
        logger.error(f"[MY_ENDPOINT] Error: {str(e)}", exc_info=True)
        return jsonify({'status': 'error', 'message': str(e)}), 500
```

### Frontend Error Handling

Basic error display:
```javascript
try {
    const response = await gameInstance.makeChoice("my choice");
} catch (error) {
    errorHandler.showErrorToUser("Failed to submit choice. Please try again.");
    errorHandler.logError("Failed to submit choice", {
        endpoint: "/api/make_choice",
        action: "choice_submission"
    });
}
```

With loading state:
```javascript
gameUX.showLoading("Generating scenario...");
try {
    const scenario = await gameInstance.generateScenario();
    gameUX.hideLoading();
    errorHandler.showSuccessToUser("Scenario generated!");
} catch (error) {
    gameUX.hideLoading();
    errorHandler.showErrorToUser(error.message);
}
```

### Accessing Error Logs

In browser console:
```javascript
// Get all logged errors
console.log(errorHandler.getErrorLog());

// Export errors as JSON
const json = errorHandler.exportErrorLog();
console.save(json, "error_log.json");

// Clear error log
errorHandler.clearErrorLog();
```

---

## Log Files

### Location
- Default: `game.log` in project root
- Can be customized in logging configuration

### Rotation
- Max size: 10MB per file
- Backup files: 5 (game.log.1 through game.log.5)
- Automatic rotation when max size reached

### Accessing Logs

**Current log**:
```bash
tail -f game.log
```

**Search for errors**:
```bash
grep ERROR game.log
```

**Filter by player**:
```bash
grep "Player a1b2c3d4" game.log
```

**Filter by endpoint**:
```bash
grep "CREATE_GAME" game.log
```

---

## Monitoring Checklist

Daily checks:
- [ ] Check `game.log` for ERROR entries
- [ ] Look for repeated failures in same endpoint
- [ ] Monitor rate limit violations (429 errors)
- [ ] Check for uncaught exceptions
- [ ] Review client error reports

Signs of issues:
- Many `[ERROR]` entries for same endpoint
- Repeated `Rate limit exceeded` messages
- Client errors without retry success
- Sudden increase in error frequency

---

## Best Practices

### Backend
1. Always use structured logging with endpoint names in brackets
2. Log at appropriate levels (INFO for normal ops, WARNING for issues, ERROR for failures)
3. Include context (player ID, game code, etc.) in all logs
4. Use `exc_info=True` for exceptions to get full stack traces
5. Log both success and failure paths

### Frontend
1. Always catch API errors and show user-friendly messages
2. Let retry logic handle transient failures
3. Log context with errors for better debugging
4. Use loading states for long operations
5. Test error paths in development

### General
1. Review logs regularly for patterns
2. Set up alerts for ERROR entries
3. Monitor rate limit usage
4. Keep error logs for at least 30 days
5. Document any custom error codes or patterns

---

## Troubleshooting

### Logs not being written
- Check file permissions on `game.log`
- Ensure Flask process has write access to project root
- Check disk space

### Rate limits being exceeded
- Reduce client retry attempts
- Increase rate limit thresholds if legitimate traffic
- Check for bot/script activity (IPs in logs)

### Client errors not reaching server
- Check network connection in browser
- Verify `/api/log_client_error` endpoint is accessible
- Check browser console for CORS errors

### Loading spinners stuck
- Check if all operations call `gameUX.hideLoading()`
- Look for nested loading issues (multiple `showLoading` calls)
- Check error logs for unhandled exceptions

---

## Configuration Options

### Logging Levels
- DEBUG: Detailed diagnostic information
- INFO: General informational messages
- WARNING: Warning messages for unusual situations
- ERROR: Error messages for failures
- CRITICAL: Critical messages for system failures

### Rate Limits
Adjust in `web_game.py`:
```python
limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"],  # Change these
    storage_uri="memory://"  # Use "redis://" for production
)
```

### Retry Configuration
Adjust in `static/js/error_handler.js`:
```javascript
this.maxRetries = 3;           // Number of retries
this.baseRetryDelay = 1000;   // 1 second initial delay
```

---

## Summary of Files Modified/Created

### Modified Files
- `web_game.py` - Added logging to all endpoints, client error logging endpoint, rate limiting

### New Files
- `static/js/error_handler.js` - Error handling, retry logic, user notifications
- `static/css/error_handling.css` - Styling for error/success toasts and loading overlay

### Configuration Files to Update
- `static/rpg_game.html` - Add error_handler.js and error_handling.css imports (optional, can use inline script)
- Other HTML files that include game.js should also include error_handler.js

---

## Next Steps

1. Load error_handler.js before game.js in all HTML files
2. Load error_handling.css in all HTML files
3. Test error scenarios in development
4. Monitor game.log for issues
5. Adjust rate limits based on traffic patterns
6. Set up log rotation in production environment

