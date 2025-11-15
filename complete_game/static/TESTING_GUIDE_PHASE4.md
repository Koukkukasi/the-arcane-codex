# Phase 4 Testing Guide
**The Arcane Codex - SVG Integration & Backend Testing**

## Quick Start

### How to Open the Game
1. Navigate to: `C:\Users\ilmiv\ProjectArgent\complete_game\static\`
2. Double-click: `arcane_codex_scenario_ui_enhanced.html`
3. OR right-click → Open with → Chrome/Firefox/Edge
4. Press F12 to open Developer Tools Console

---

## Pre-Flight Check ✓

### Files Verified
- ✅ Main HTML: `arcane_codex_scenario_ui_enhanced.html` (210KB, 6,931 lines)
- ✅ 14 SVG files in `images/` folder:
  - 7 god icons (valdris, kaitha, morvane, sylara, korvan, athena, mercus)
  - 1 logo (arcane_codex_logo.svg)
  - 3 rune symbols
  - 3 decorative elements

---

## Test Sequence

## 4A. BROWSER TESTING (45-60 min)

### TEST 1: Page Load & Console Check
**Steps:**
1. Open the HTML file
2. Check Developer Console (F12)
3. Look for these messages:
   - ✓ "Overlay system initialized..."
   - ✓ "Overlay enhancements loaded successfully"
   - ✓ "The Arcane Codex UI loaded..."

**Expected:**
- No errors on page load
- All console messages appear
- Page displays with dark fantasy theme

**Result:** [ ] PASS / [ ] FAIL
**Notes:**

---

### TEST 2: SVG God Icons in Character Sheet
**Steps:**
1. Press **C key** (or click character button on left)
2. Scroll down to "Divine Favor" section
3. Check each god has an icon next to their name

**Expected:**
- ✓ VALDRIS: Scales with crown icon
- ✓ KAITHA: Flame icon
- ✓ MORVANE: Skull/death icon
- ✓ SYLARA: Tree/nature icon
- ✓ KORVAN: Crossed swords icon
- ✓ ATHENA: Book/owl icon
- ✓ MERCUS: Coins icon
- ✓ All icons have golden borders
- ✓ Icons glow on hover

**Result:** [ ] PASS / [ ] FAIL
**Notes:**

---

### TEST 3: Logo SVG Display
**Steps:**
1. Close overlay (ESC or backdrop click)
2. Look at the narrative panel (center)
3. Check for Arcane Codex logo above the narrative text

**Expected:**
- ✓ SVG logo displays (not text "THE ARCANE CODEX")
- ✓ Logo is centered
- ✓ Logo scales properly

**Result:** [ ] PASS / [ ] FAIL
**Notes:**

---

### TEST 4: Rune Symbol in Whisper
**Steps:**
1. Look at the purple "Fighter Whisper" box
2. Check the header has a rune icon before the text

**Expected:**
- ✓ Small rune symbol visible next to "🔮 Fighter Whisper"
- ✓ Rune has purple glow effect

**Result:** [ ] PASS / [ ] FAIL
**Notes:**

---

### TEST 5: Overlay System & Keyboard Shortcuts
**Steps:**
1. Press **C** → Character overlay opens
2. Press **ESC** → Overlay closes
3. Press **I** → Inventory overlay opens
4. Press **ESC** → Closes
5. Press **K** → Skills overlay opens
6. Press **ESC** → Closes
7. Press **J** → Quests overlay opens
8. Press **ESC** → Closes
9. Press **M** → Map overlay opens
10. Press **ESC** → Closes

**Expected:**
- ✓ Each key opens correct overlay
- ✓ ESC always closes
- ✓ Only one overlay open at a time
- ✓ Smooth slide-up animation on open
- ✓ Fade out animation on close
- ✓ Backdrop darkens behind overlay

**Result:** [ ] PASS / [ ] FAIL
**Notes:**

---

### TEST 6: Sidebar Button Clicks
**Steps:**
1. Click each button on the left sidebar:
   - 👤 (Character)
   - 🎒 (Inventory)
   - ⚔️ (Skills)
   - 📜 (Quests)
   - 🗺️ (Map)
   - ⚙️ (Settings)

**Expected:**
- ✓ Buttons open corresponding overlays
- ✓ Tooltips appear on hover
- ✓ Clicking same button toggles overlay closed

**Result:** [ ] PASS / [ ] FAIL
**Notes:**

---

### TEST 7: Choice Button Interaction
**Steps:**
1. Scroll to the "Available Actions" section
2. Click any choice button (e.g., "🚪 Enter through front door")
3. Watch the console

**Expected:**
- ✓ Button highlights with gold color
- ✓ All choice buttons become disabled (grayed out)
- ✓ Console shows "Player chose: ..."
- ✓ "Processing your choice..." message appears
- ✓ Error message appears: "Connection Error: Unable to process your choice"
- ✓ Error message is styled in red

**Result:** [ ] PASS / [ ] FAIL
**Notes:**

---

### TEST 8: Action Bar Slot Activation
**Steps:**
1. Look at bottom action bar (slots 1-5)
2. Click slot 1 (⚔️)
3. Observe the animation

**Expected:**
- ✓ "⚔️ Activated!" popup appears in center
- ✓ Popup has golden background and border
- ✓ Popup fades out after 1 second
- ✓ Slot shows cooldown overlay (grayed out)
- ✓ Countdown number appears (3... 2... 1...)
- ✓ After 3 seconds, slot re-enables

**Additional Test:**
4. While slot is on cooldown, click it again

**Expected:**
- ✓ Slot shakes (shake animation)
- ✓ Cannot activate during cooldown

**Result:** [ ] PASS / [ ] FAIL
**Notes:**

---

### TEST 9: Party Member Details Modal
**Steps:**
1. Look at the right panel (party members)
2. Click on a party member card (e.g., "Aldric")
3. Observe the modal

**Expected:**
- ✓ Modal appears with dark overlay
- ✓ Member card highlights with gold border
- ✓ Modal shows:
  - Member name and emoji
  - Role
  - Health (❤️ HP)
  - Equipment (⚔️ Weapon, 🛡️ Armor)
  - Active Effects
- ✓ Close button (✕) visible in top right
- ✓ Close button turns red on hover

**Close Tests:**
4. Click the ✕ button → Modal closes
5. Open modal again
6. Click backdrop (dark area outside modal) → Modal closes

**Result:** [ ] PASS / [ ] FAIL
**Notes:**

---

## 4B. RESPONSIVE TESTING (20-30 min)

### TEST 10: Desktop Sizes
**Steps:**
1. Resize browser window to different widths:
   - 1920px wide (full screen)
   - 1366px wide (laptop)
   - 1280px wide (small laptop)

**Expected:**
- ✓ Layout adapts smoothly
- ✓ No horizontal scrollbar
- ✓ Overlays remain centered
- ✓ All text readable

**Result:** [ ] PASS / [ ] FAIL
**Notes:**

---

### TEST 11: Tablet Size
**Steps:**
1. Use DevTools device toolbar (Ctrl+Shift+M)
2. Select "iPad" or set to 768px wide
3. Test both portrait and landscape

**Expected:**
- ✓ Overlays resize to 95% width
- ✓ All buttons still clickable
- ✓ Touch targets adequate size

**Result:** [ ] PASS / [ ] FAIL
**Notes:**

---

### TEST 12: Mobile Size
**Steps:**
1. Use DevTools device toolbar
2. Select "iPhone SE" or "iPhone 11"
3. Test portrait mode

**Expected:**
- ✓ Equipment slots in Character overlay stack vertically
- ✓ Skills tree becomes single column
- ✓ Map legend hidden (check Map overlay)
- ✓ All overlays fit on screen

**Result:** [ ] PASS / [ ] FAIL
**Notes:**

---

## 4C. PERFORMANCE & ERROR TESTING (15-20 min)

### TEST 13: Console Error Check
**Steps:**
1. Open DevTools Console
2. Refresh page (F5)
3. Review all messages

**Expected:**
- ✓ No JavaScript errors (red text)
- ✓ All console.log messages present
- ✓ Expected error: "Failed to load resource: net::ERR_CONNECTION_REFUSED" for /api/scenario/choice
  - This is NORMAL - backend not connected yet
- ✓ No 404 errors for SVG files

**Result:** [ ] PASS / [ ] FAIL
**Notes:**

---

### TEST 14: Network Resource Check
**Steps:**
1. Open DevTools Network tab
2. Refresh page (F5)
3. Check all resources loaded

**Expected:**
- ✓ HTML file: 210KB
- ✓ 14 SVG files loaded (check images folder)
- ✓ All SVG files status: 200 OK
- ✓ No missing resources (404 errors)

**Result:** [ ] PASS / [ ] FAIL
**Notes:**

---

### TEST 15: Animation Performance
**Steps:**
1. Open DevTools Performance tab
2. Click "Record"
3. Open and close 5 different overlays quickly
4. Stop recording
5. Check FPS

**Expected:**
- ✓ FPS stays at or near 60
- ✓ No significant frame drops
- ✓ Animations smooth and fluid

**Result:** [ ] PASS / [ ] FAIL
**Notes:**

---

### TEST 16: Memory Check
**Steps:**
1. Open DevTools Memory tab
2. Take heap snapshot
3. Open/close overlays 10 times
4. Take another heap snapshot
5. Compare sizes

**Expected:**
- ✓ Memory doesn't grow excessively
- ✓ No memory leaks
- ✓ Heap size returns to baseline

**Result:** [ ] PASS / [ ] FAIL
**Notes:**

---

## TEST RESULTS SUMMARY

### Overall Status
- Total Tests: 16
- Passed: ___
- Failed: ___
- Blocked: ___

### Critical Issues Found
1.
2.
3.

### Minor Issues Found
1.
2.
3.

### Notes & Observations


---

## Next Steps After Testing

### If All Tests Pass ✅
- Proceed to Phase 5: Backend API Development
- All frontend features confirmed working
- Ready for backend integration

### If Tests Fail ❌
- Document specific failures above
- Report issues for fixing
- Re-test after fixes applied

---

## Quick Reference

### Keyboard Shortcuts
- **C** - Character Sheet
- **I** - Inventory
- **K** - Skills
- **J** - Quests
- **M** - Map
- **ESC** - Close overlay / Settings

### Files to Check
- Main: `arcane_codex_scenario_ui_enhanced.html`
- SVGs: `images/*.svg` (14 files)

### Browser DevTools
- **F12** - Open DevTools
- **Ctrl+Shift+M** - Device toolbar (responsive testing)
- **Ctrl+Shift+C** - Element inspector

---

**Testing Date:** _______________
**Tester:** _______________
**Browser:** _______________
**OS:** _______________
