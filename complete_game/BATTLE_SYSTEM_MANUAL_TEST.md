# Battle System - Manual Testing Guide

**Status:** Server is already running (port 5000)
**Test Duration:** 5 minutes
**Prerequisites:** Flask server running

---

## Quick Test Steps

### 1. Open Browser
```
http://localhost:5000
```

### 2. Create Character
- Set username
- Create game
- Go through divine interrogation (click any answers)
- Wait for game to load

### 3. Open Browser Console
Press **F12** to open Developer Tools

### 4. Trigger Battle
Type in console:
```javascript
battleManager.startTestBattle()
```

### 5. Expected Results

**✅ You should see:**

1. **Battle Animation** (~5 seconds):
   - Flash effect
   - Screen crack
   - Goblin Scout appears with dramatic reveal
   - "A goblin scout emerges from the shadows!"

2. **Battle Controls Appear**:
   - Three buttons at bottom of screen:
     - ⚔️ Attack (red)
     - 🛡️ Defend (blue)
     - 🏃 Flee (orange)

3. **Click "Attack" Button**:
   - Damage message appears (e.g., "💥 You strike for 5 damage!")
   - If critical: "CRITICAL HIT!" message
   - Button disabled briefly (500ms cooldown)

4. **Keep Attacking**:
   - Click Attack 1-2 more times
   - Enemy has 8 HP, takes 3-8 damage per hit

5. **Victory**:
   - "Victory! The goblin falls!" message
   - Rewards: "+25 XP, +10 Gold"
   - Battle controls disappear

---

## What to Check

### ✅ Animation System
- [ ] Flash effect plays
- [ ] Screen crack appears
- [ ] Enemy name displays correctly
- [ ] Goblin icon (👺) shows up
- [ ] Animation duration feels right (~5 sec)

### ✅ Battle Controls
- [ ] Buttons appear after animation
- [ ] Buttons are styled correctly (colors, hover)
- [ ] Buttons are clickable
- [ ] Attack, Defend, Flee all work

### ✅ Combat Mechanics
- [ ] Attack deals damage (3-8)
- [ ] Critical hits detected (damage >= 7)
- [ ] Damage messages appear
- [ ] Enemy HP tracked correctly
- [ ] Victory triggers at 0 HP

### ✅ Security & Performance
- [ ] No XSS issues (no script injection)
- [ ] Buttons can't be spam-clicked (500ms cooldown)
- [ ] No memory leaks (open/close console multiple times)
- [ ] Socket events work correctly

### ✅ User Experience
- [ ] Messages are readable
- [ ] Timing feels smooth
- [ ] Controls are intuitive
- [ ] Victory feels rewarding

---

## Console Commands for Testing

### Start Battle
```javascript
battleManager.startTestBattle()
```

### Check Battle State
```javascript
console.log('In Battle:', battleManager.isInBattle);
console.log('Enemy HP:', battleManager.enemyHp);
console.log('Current Battle:', battleManager.currentBattle);
```

### Check Animation System
```javascript
console.log('Animator:', window.ArcaneCodex.animations);
```

### Manual Attack (if controls don't appear)
```javascript
battleManager.attack()
```

### Manual Cleanup
```javascript
battleManager.cleanup()
```

---

## Troubleshooting

### Problem: "battleManager is not defined"
**Solution:** Battle manager script not loaded. Check:
```javascript
// Verify script loaded
console.log(typeof battleManager); // Should be "object"

// Check if file exists
// Open: http://localhost:5000/static/js/battle_manager.js
```

### Problem: "No game code found"
**Solution:** Must create/join game first
```javascript
// Check game code
console.log(localStorage.getItem('game_code'));
console.log(window.gameCode);
```

### Problem: Animation doesn't play
**Solution:** Check animation system
```javascript
// Verify animations loaded
console.log(window.ArcaneCodex);
console.log(window.ArcaneCodex.animations);
```

### Problem: Buttons don't appear
**Solution:** Check DOM
```javascript
// Look for battle controls
document.getElementById('battle-controls');

// If null, controls didn't render
// Check console for errors
```

### Problem: Socket events not working
**Solution:** Check socket connection
```javascript
console.log('Socket connected:', socket.connected);
console.log('Socket ID:', socket.id);
```

---

## Advanced Testing

### Test Multiple Battles
```javascript
// Start battle, win it, start another
battleManager.startTestBattle();
// ... win battle ...
battleManager.startTestBattle(); // Should work again
```

### Test Concurrent Prevention
```javascript
battleManager.startTestBattle();
// Immediately try again (should be prevented)
battleManager.startTestBattle(); // Should see warning in console
```

### Test Cleanup
```javascript
battleManager.startTestBattle();
// Before winning, clean up
battleManager.cleanup();
// Battle should end, controls removed
```

### Test Spam Protection
```javascript
// Start battle, then spam attack
battleManager.startTestBattle();
// Wait for controls, then rapidly click Attack
// Should only send one request per 500ms
```

---

## Expected Console Output

```
[Battle] Battle Manager initialized
[Battle] Socket listeners registered
[Battle] Starting test battle for game: ABC123
[Battle] Battle data received: {enemy: {…}, player: {…}}
[Battle] Animation complete, showing controls
⚔️ Battle Started! Enemy: Goblin Scout
[Battle] Player attacks
💥 You strike for 5 damage!
[Battle] Action result: {damage: 5, critical: false, …}
[Battle] Player attacks
💥 You strike for 8 damage! CRITICAL HIT!
[Battle] Victory! {rewards: {xp: 25, gold: 10}}
✅ VICTORY! Battle won!
Rewards: +25 XP, +10 Gold
```

---

## Screenshots to Take

1. **Before Battle** - Normal game screen
2. **Animation Playing** - Flash/crack effect visible
3. **Enemy Revealed** - Goblin Scout displayed
4. **Controls Visible** - Three buttons at bottom
5. **After Attack** - Damage message showing
6. **Victory** - Rewards message visible

---

## Success Criteria

✅ All animations play smoothly
✅ Battle controls appear and function
✅ Combat mechanics work (damage, critical, victory)
✅ No console errors
✅ No memory leaks
✅ Spam protection works
✅ Victory triggers correctly

---

## Known Limitations (Phase 1)

These are expected and will be fixed in Phase 2:

- Only fights Goblin Scout (hardcoded)
- Enemy doesn't attack back
- No health bars (text-only)
- No turn order
- Simple damage calculation
- Single player only

---

## Next Steps After Testing

If all tests pass:
- ✅ Phase 1 Complete
- → Proceed to Phase 2: Full battle system integration

If issues found:
- Report specific failing test
- Check browser console for errors
- Take screenshots
- Note exact steps to reproduce

---

**Ready to test?** Open http://localhost:5000 and follow the steps above!
