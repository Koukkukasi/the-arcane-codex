# 🎭 Playwright Testing Guide for The Arcane Codex

## Quick Start (2 Minutes)

### Option 1: Automated Setup & Test
```bash
# Run everything automatically
python setup_playwright.py --quick

# Or run headless (no browser window)
python setup_playwright.py --quick --headless
```

### Option 2: Manual Steps
```bash
# Step 1: Install Playwright
pip install playwright
playwright install

# Step 2: Start game server (in terminal 1)
python start_game.py

# Step 3: Run tests (in terminal 2)
python playwright_tests.py
```

## 📋 What Gets Tested

The Playwright suite tests **11 scenarios** covering the complete game:

### 1. **Main Menu** ✅
- Landing page loads
- All menu buttons present
- Credits accessible

### 2. **Create Game** ✅
- New game creation
- Game code generation
- Redirect to game page

### 3. **Join Game** ✅
- Join form functionality
- Code entry validation
- Player name input

### 4. **Quick Start** ✅
- Solo game instant start
- Auto character creation
- Direct game entry

### 5. **Game UI Elements** ✅
- Character panel
- Inventory grid
- Quest list
- Chat area
- Action buttons

### 6. **Town Interactions** ✅
- Market access
- Inn functionality
- Quest board
- Adventure start

### 7. **Action Buttons** ✅
- Combat actions
- Inventory button
- Character sheet
- Save game

### 8. **Multiplayer** ✅
- Two player simulation
- Create & join flow
- Simultaneous connections

### 9. **Chat System** ✅
- Message input
- Send functionality
- Display in chat area

### 10. **Responsive Design** ✅
- Desktop (1920x1080)
- Tablet (768x1024)
- Mobile (375x667)

### 11. **End-to-End Gameplay** ✅
- Complete game flow
- Start → Town → Adventure
- Combat/exploration
- Save functionality

## 🛠️ Installation

### Windows
```bash
pip install playwright
playwright install
```

### macOS/Linux
```bash
pip install playwright
playwright install
playwright install-deps  # System dependencies
```

## 🎮 Running Tests

### Interactive Mode
```bash
python setup_playwright.py
# Select from menu:
# 1. Install Playwright
# 2. Run with browser visible
# 3. Run headless
# 4. View results
```

### Command Line Options
```bash
# Run with visible browser
python playwright_tests.py

# Run headless (faster, no window)
python playwright_tests.py --headless

# Custom server URL
python playwright_tests.py --url http://localhost:3000
```

## 📸 Screenshots

Tests automatically capture screenshots at key points:
- `screenshots/main_menu_*.png`
- `screenshots/game_created_*.png`
- `screenshots/quick_start_game_*.png`
- `screenshots/town_interactions_*.png`
- `screenshots/multiplayer_player1_*.png`
- `screenshots/multiplayer_player2_*.png`
- `screenshots/responsive_*.png`
- `screenshots/end_to_end_final_*.png`

## 📊 Test Results

After tests run, check:

### 1. Console Output
```
TEST SUMMARY
============================================================
  Total Tests: 11
  ✅ Passed: 9
  ❌ Failed: 2
  Success Rate: 81.8%

  Test Results:
    ✅ Main Menu
    ✅ Create Game
    ✅ Join Game
    ✅ Quick Start
    ✅ Game UI - 10/12 elements
    ✅ Town Interactions
    ✅ Action Buttons - 6 buttons
    ❌ Multiplayer - Connection failed
    ✅ Chat System
    ✅ Responsive Design
    ❌ End-to-End - Timeout

  📸 Screenshots saved: 15

  🎉 UI TESTS PASSED! GAME IS READY! 🎉
```

### 2. JSON Report
`playwright_test_report.json` contains:
```json
{
  "timestamp": "2024-11-07T10:30:00",
  "success_rate": 81.8,
  "passed": 9,
  "failed": 2,
  "results": [...],
  "screenshots": [...]
}
```

## ⚠️ Troubleshooting

### "Server not running"
```bash
# Start server first
python start_game.py

# Then in another terminal
python playwright_tests.py
```

### "Playwright not installed"
```bash
pip install playwright
playwright install
```

### "Browser not found"
```bash
# Reinstall browsers
playwright install chromium
```

### "Tests timeout"
- Increase timeout in playwright_tests.py
- Check if server is responding
- Try headless mode (faster)

### "Permission denied (Linux/Mac)"
```bash
# Install with sudo
sudo playwright install-deps
```

## 🎯 Success Criteria

- **80%+ Pass Rate** = Game is ready ✅
- **60-79% Pass Rate** = Mostly working ⚠️
- **<60% Pass Rate** = Needs fixes ❌

## 💡 Tips

1. **Run headless for speed**
   ```bash
   python playwright_tests.py --headless
   ```

2. **Debug failing tests**
   - Check screenshots in `screenshots/` folder
   - Run with visible browser to watch
   - Check browser console for errors

3. **Test specific scenario**
   - Comment out other tests in `playwright_tests.py`
   - Run just the test you need

4. **Parallel testing**
   - Tests run sequentially by default
   - Can modify for parallel execution

## 🔄 Continuous Testing

For development:
```bash
# Watch mode (manual)
while true; do
  python playwright_tests.py --headless
  sleep 30
done
```

## 📚 Learn More

- [Playwright Documentation](https://playwright.dev/python/)
- [Writing Tests](https://playwright.dev/python/docs/writing-tests)
- [Debugging](https://playwright.dev/python/docs/debug)

---

## ✅ Quick Checklist

- [ ] Python installed
- [ ] Playwright installed (`pip install playwright`)
- [ ] Browsers installed (`playwright install`)
- [ ] Game server running (`python start_game.py`)
- [ ] Tests passing (`python playwright_tests.py`)

**Ready to test? Run:**
```bash
python setup_playwright.py --quick
```