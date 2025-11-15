# Error Handling and Logging - Quick Reference

## For Developers

### Viewing Logs

**Watch logs in real-time**:
```bash
tail -f game.log
```

**Search for errors**:
```bash
grep ERROR game.log
```

**View last 50 lines**:
```bash
tail -50 game.log
```

**Filter by player ID**:
```bash
grep "a1b2c3d4" game.log
```

**Filter by endpoint**:
```bash
grep "MAKE_CHOICE\|CREATE_GAME\|GENERATE_SCENARIO" game.log
```

---

## Adding Logging to New Endpoints

**Template**:
```python
@app.route('/api/my_endpoint', methods=['POST'])
def my_endpoint():
    """My new endpoint"""
    try:
        player_id = get_player_id()
        game_code = session.get('game_code')

        logger.info(f"[MY_ENDPOINT] Player {player_id[:8]}... starting operation")

        # Your code here
        result = do_something()

        logger.info(f"[MY_ENDPOINT] Operation successful")
        return jsonify({'status': 'success', 'data': result})

    except Exception as e:
        logger.error(f"[MY_ENDPOINT] Error: {str(e)}", exc_info=True)
        return jsonify({'status': 'error', 'message': str(e)}), 500
```

**Key Points**:
- Use `[ENDPOINT_NAME]` prefix in ALL log messages
- Use `logger.info()` for normal operations
- Use `logger.warning()` for suspicious but non-critical issues
- Use `logger.error()` with `exc_info=True` for exceptions
- Always include player/game context when available

---

## Frontend: Handling Errors

**Show error message**:
```javascript
errorHandler.showErrorToUser("Something went wrong!");
```

**Log error to server**:
```javascript
errorHandler.logError("My error message", {
    endpoint: "/api/my_endpoint",
    action: "some_action"
});
```

**Combined**:
```javascript
try {
    const result = await gameInstance.apiRequest('/my_endpoint', 'POST', data);
} catch (error) {
    errorHandler.showErrorToUser(error.message);
    errorHandler.logError("Failed to do operation", {
        endpoint: "/api/my_endpoint",
        error: error.message
    });
}
```

---

## Debugging in Browser

**In browser console**:
```javascript
// Get all errors logged
errorHandler.getErrorLog()

// See the error log as JSON
console.table(errorHandler.getErrorLog())

// Export errors
copy(errorHandler.exportErrorLog())
```

---

## Common Log Patterns

### Game Creation
```
[CREATE_GAME] Player a1b2c3d4... attempting to create new game as Alice
[CREATE_GAME] Generated game code ABCD12 for player Alice
[CREATE_GAME] Game ABCD12 created successfully. Players: 1/4 | Creator: Alice
```

### Player Joins
```
[JOIN_GAME] Player b2c3d4e5... (Bob) attempting to join game
[JOIN_GAME] Player Bob attempting to join game ABCD12
[JOIN_GAME] Player Bob joined game ABCD12. Players: 2/4
```

### Making Choices
```
[MAKE_CHOICE] Player a1b2c3d4... making choice in game ABCD12
[MAKE_CHOICE] Player Alice submitted choice in game ABCD12. Submissions: 1/4
[MAKE_CHOICE] All players submitted choices in game ABCD12. Turn ready for resolution.
```

### Scenario Generation
```
[GENERATE_SCENARIO] Generating scenario for game ABCD12
[GENERATE_SCENARIO] Calling MCP for game ABCD12. Players: 4
[GENERATE_SCENARIO] Successfully generated scenario mcp_a1b2c3d4 with theme 'betrayal'
```

### Interrogation
```
[START_INTERROGATION] Player a1b2c3d4... starting Divine Interrogation in game ABCD12
[ANSWER_QUESTION] Player a1b2c3d4... answering with answer_id: q1_a
[ANSWER_QUESTION] Interrogation COMPLETE for Alice. Assigned class: Mage (highest favor: SYLARA)
[ANSWER_QUESTION] All players ready! Game ABCD12 STARTED
```

### Client Errors
```
[CLIENT_ERROR] Network timeout | Context: /api/make_choice | User: Alice | Game: ABCD12
[CLIENT_ERROR_STACK] Error: Network timeout\n    at apiCall (game.js:100)
```

---

## Log Levels

| Level | Usage | Example |
|-------|-------|---------|
| INFO | Normal operations | Player joined game, scenario generated |
| WARNING | Unusual but handled | Duplicate submission attempt, game full |
| ERROR | Failures | MCP call failed, game not found |
| DEBUG | Detailed diagnostics | Function entry/exit, variable values |

---

## Troubleshooting with Logs

### Problem: "Game not found"
Look for:
```bash
grep -A5 -B5 "game_not_found\|Game.*not found" game.log
```

### Problem: Players timing out
Look for:
```bash
grep "timeout\|took.*seconds" game.log
```

### Problem: MCP failures
Look for:
```bash
grep "MCP\|generation failed" game.log
```

### Problem: High error rate
Look for:
```bash
grep ERROR game.log | wc -l
```

---

## Rate Limiting Reference

Current limits (in `web_game.py`):
- `/api/create_game`: 10 per hour
- `/api/join_game`: 20 per hour
- `/api/generate_scenario`: 5 per minute (expensive)
- `/api/make_choice`: 30 per minute
- `/api/start_interrogation`: 3 per hour

To modify:
```python
@app.route('/api/endpoint', methods=['POST'])
@limiter.limit("N per PERIOD")  # Change N and PERIOD
def endpoint():
    # ...
```

---

## Error Handler API

### Show Messages
```javascript
// Error message (auto-dismisses after 5s)
errorHandler.showErrorToUser("Error message");

// Success message (auto-dismisses after 3s)
errorHandler.showSuccessToUser("Success message");

// With custom duration
errorHandler.showErrorToUser("Error", 10000);  // 10 seconds
```

### Loading States
```javascript
// Show loading
gameUX.showLoading("Generating scenario...");

// Do work...

// Hide loading
gameUX.hideLoading();
```

### Logging
```javascript
// Log to server and local storage
errorHandler.logError("Something happened", {
    endpoint: "/api/endpoint",
    custom_field: "custom_value"
});
```

### Error History
```javascript
// Get all logged errors
const errors = errorHandler.getErrorLog();

// Export as JSON
const json = errorHandler.exportErrorLog();

// Clear history
errorHandler.clearErrorLog();
```

---

## Testing Error Scenarios

### Simulate Network Error
```javascript
// In browser console
fetch = () => Promise.reject(new Error("Network error"));
```

### Force Error Message
```javascript
errorHandler.showErrorToUser("Test error message");
```

### Test Logging
```javascript
errorHandler.logError("Test error", {
    test: true,
    timestamp: new Date()
});
```

---

## Production Checklist

- [ ] Logs are being written to file
- [ ] Old logs are being rotated correctly
- [ ] No sensitive data in logs (passwords, tokens)
- [ ] Rate limits are appropriate for traffic
- [ ] Error email alerts are configured (if applicable)
- [ ] Log retention policy is set
- [ ] Monitoring is in place for ERROR entries
- [ ] Team knows how to access logs
- [ ] Documentation is up to date

---

## Files Reference

| File | Purpose |
|------|---------|
| `web_game.py` | Backend logging, endpoints, client error logging |
| `static/js/error_handler.js` | Frontend error handling, retry logic, user messages |
| `static/css/error_handling.css` | Styling for error/success toasts and loading |
| `game.log` | Main log file (auto-rotated) |
| `PHASE_E2_ERROR_HANDLING.md` | Detailed documentation |

