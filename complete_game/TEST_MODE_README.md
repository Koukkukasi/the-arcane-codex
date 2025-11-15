# Test Mode for The Arcane Codex

## Overview

TEST_MODE allows you to run and test The Arcane Codex **without MCP configuration** using mock interrogation questions. This is perfect for:

- **Playwright end-to-end testing**
- **Local development without Claude Desktop**
- **Quick prototyping and iteration**
- **Demonstrating game flow to collaborators**

## Important: Production vs Testing

### Production Mode (Default)
- **Requires**: MCP configured with Claude Desktop
- **Content**: 100% AI-generated, unique for each player
- **Purpose**: Real gameplay with dynamic scenarios
- **How to enable**: No action needed - this is default

### Test Mode
- **Requires**: Nothing - works out of the box
- **Content**: Mock questions (2 questions that cycle)
- **Purpose**: Testing game flow and UI
- **How to enable**: Set `ARCANE_TEST_MODE=1` environment variable

## How to Enable TEST_MODE

### Option 1: Use START_TEST_MODE.bat (Windows)

```bash
cd C:\Users\ilmiv\ProjectArgent\complete_game
START_TEST_MODE.bat
```

This batch file:
1. Sets `ARCANE_TEST_MODE=1`
2. Starts the Flask server
3. Displays TEST MODE banner

### Option 2: Set Environment Variable Manually

**Windows (CMD):**
```cmd
set ARCANE_TEST_MODE=1
python web_game.py
```

**Windows (PowerShell):**
```powershell
$env:ARCANE_TEST_MODE="1"
python web_game.py
```

**Linux/Mac:**
```bash
export ARCANE_TEST_MODE=1
python web_game.py
```

### Option 3: Playwright Tests

Playwright tests can set the environment variable before launching the server:

```javascript
// In your test setup
process.env.ARCANE_TEST_MODE = '1';
// Then start server...
```

## What You'll See

### Server Startup
```
❌ MCP client not available. Game requires MCP for dynamic scenarios!
   See MCP_SETUP.md or QUICK_TEST_SETUP.md for configuration.
⚠️  TEST MODE ENABLED - Using mock interrogation questions
   Set ARCANE_TEST_MODE=0 or unset to require MCP
```

### During Interrogation
```
⚠️  TEST MODE: Using mock interrogation question for player abc12345
```

## Mock Questions

TEST_MODE provides 2 mock interrogation questions:

### Question 1
**"A comrade lies dying. Their final wish is to reveal a secret that could save the party or doom them. Do you listen?"**

Options:
- A: Listen carefully - knowledge is power
- B: Refuse - some secrets are better buried
- C: End their suffering before they speak

### Question 2
**"You discover your companion has been stealing from the party treasury. They claim it's for their sick child."**

Options:
- A: Expose them to the group immediately
- B: Confront them privately and demand repayment
- C: Say nothing and secretly add your own gold

**Note**: After 2 questions, the questions cycle back. Players always complete 10 questions total before character assignment.

## Testing Complete Game Flow

With TEST_MODE enabled, you can test:

1. ✅ Landing page → Game lobby
2. ✅ Create game / Join game
3. ✅ Player lobby (1-4 players)
4. ✅ Divine Interrogation (character creation)
5. ✅ Character class assignment
6. ✅ Waiting for other players
7. ✅ Game start

**Without TEST_MODE**, the game will error at step 4 (Divine Interrogation) if MCP is not configured.

## Playwright Testing Example

```javascript
// Set TEST_MODE before starting server
process.env.ARCANE_TEST_MODE = '1';

// Start server
const server = spawn('python', ['web_game.py'], {
    cwd: 'C:\\Users\\ilmiv\\ProjectArgent\\complete_game',
    env: { ...process.env, ARCANE_TEST_MODE: '1' }
});

// Run your Playwright tests
// ... test create game, join game, interrogation, etc.

// Cleanup
server.kill();
```

## Limitations

TEST_MODE has these limitations:

- **Only 2 unique questions**: Real game has infinite AI-generated questions
- **Same questions for all players**: Real game has unique questions per player
- **No adaptive questioning**: Real game adapts questions based on previous answers
- **Mock scenario generation**: Scenarios after interrogation will also fail without MCP

## Disabling TEST_MODE

To go back to production mode (requiring MCP):

**Windows (CMD):**
```cmd
set ARCANE_TEST_MODE=0
python web_game.py
```

**Or simply don't set the variable:**
```cmd
python web_game.py
```

**Linux/Mac:**
```bash
unset ARCANE_TEST_MODE
python web_game.py
```

## When to Use TEST_MODE

### ✅ Good Use Cases

- Running Playwright end-to-end tests
- Testing UI/UX without MCP setup
- Demonstrating game flow
- Development iteration on non-AI features
- Teaching others how the game works

### ❌ Bad Use Cases

- **NEVER for real gameplay** - Questions are repetitive
- **NEVER for production deployment** - Must use MCP
- **NEVER for testing AI behavior** - Mock questions are static

## Configuration Files

TEST_MODE is configured in `web_game.py`:

```python
# Line 33-36
TEST_MODE = os.environ.get('ARCANE_TEST_MODE', '0') == '1'
if TEST_MODE:
    print("⚠️  TEST MODE ENABLED - Using mock interrogation questions")
    print("   Set ARCANE_TEST_MODE=0 or unset to require MCP")
```

## Troubleshooting

### "MCP client not available" error even with TEST_MODE

**Cause**: Environment variable not set correctly

**Solutions**:
1. Use `START_TEST_MODE.bat` (Windows)
2. Verify variable is set: `echo %ARCANE_TEST_MODE%` (Windows) or `echo $ARCANE_TEST_MODE` (Linux/Mac)
3. Restart server after setting variable

### Mock questions not appearing

**Cause**: MCP is available, so TEST_MODE is bypassed

**Solution**: TEST_MODE only activates when MCP is NOT available. If you have MCP configured, it will always use MCP instead of mock data.

### Scenario generation still fails after interrogation

**Cause**: TEST_MODE only covers interrogation, not scenario generation

**Solution**: Full MCP integration needed for scenario generation. TEST_MODE is only for testing the interrogation flow.

## Next Steps

After testing with TEST_MODE:

1. Configure MCP for production use (see `MCP_SETUP.md`)
2. Test with real MCP-generated content
3. Deploy without TEST_MODE enabled

---

**Remember**: TEST_MODE is a testing tool only. For real gameplay, configure MCP!
