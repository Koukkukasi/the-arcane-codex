# TERMINAL PROTOTYPE TEST CHECKLIST
**Testing All 6 AI GM Enhancements**
**Date:** 2025-10-30

---

## 🎯 PURPOSE

This checklist helps you systematically test the terminal prototype to verify all 6 AI GM enhancements are working.

---

## ✅ PRE-TEST SETUP

### 1. Configure API Key
```bash
cd C:\Users\ilmiv\ProjectArgent\terminal_prototype
```

Open `config.json` and add your Claude API key:
```json
{
  "CLAUDE_API_KEY": "your-key-here"
}
```

### 2. Run the Game
```bash
python game.py
```

You should see:
```
THE ARCANE CODEX - Terminal Prototype
Welcome, Kaelen the Mage!
```

---

## 🧪 ENHANCEMENT #1: ENVIRONMENTAL TACTICS

**What to Look For:** Every turn should include 1-2 environmental action options (🪑🔥🚪 emojis)

### Test Steps:

1. **Check Initial Scene** - Does it describe specific objects?
   - [ ] At least 3-5 physical objects mentioned (tables, barrels, doors, etc.)
   - [ ] Emojis like 🪑🔥🚪 in action options
   - [ ] Environmental actions have clear consequences (e.g., "→ Creates barrier")

2. **Try an Environmental Action**
   - [ ] Select option with 🪑 or 🔥 or 🚪 emoji
   - [ ] AI narrates HOW you use the environment
   - [ ] Environment persists (broken window stays broken)

**Example of SUCCESS:**
```
What do you do?
1. 💬 Talk to Grimsby [Persuasion: 15] 🟢 65%
2. 🪑 FLIP TABLE for cover [Strength: 15] 🟢 67%
   → Creates defensive position
3. 🚪 SPOT back exit [Perception: 20] 🟡 49%
   → Escape route through kitchen
```

**If This Fails:** Environmental options are missing or too abstract.

---

## 🧪 ENHANCEMENT #2: PROACTIVE NPCs

**What to Look For:** NPCs act independently, offer help, suggest tactics

### Test Steps:

1. **Be Nice to Grimsby** (gain approval to 50+)
   - [ ] Choose kind/helpful dialogue options
   - [ ] See NPC approval display: `💫 [Grimsby Approval: 50 → 55 (+5)]`

2. **Watch for Proactive Behavior**
   - [ ] Grimsby offers help WITHOUT being asked
   - [ ] Grimsby suggests environmental tactics
   - [ ] Grimsby draws weapon or acts independently

**Example of SUCCESS:**
```
Grimsby's eyes dart to the strangers. His hand moves to his belt—
there's a small knife there, rusted but sharp.

"If this goes bad," he whispers, "I know a tunnel under the bar.
Costs 5 gold. Your call."

[Grimsby draws knife without waiting for your command]
```

**If This Fails:** Grimsby is passive, waits for you to act first.

---

## 🧪 ENHANCEMENT #3: MOMENTUM SYSTEM

**What to Look For:** Creative actions earn Momentum, even on failures

### Test Steps:

1. **Try a Creative/Risky Action**
   - [ ] Choose environmental action (throw mug, flip table)
   - [ ] OR write custom action that's unusual

2. **Check for Momentum Reward**
   - [ ] See message: `✨ +1 MOMENTUM!`
   - [ ] Current momentum shown: `[Momentum: 1/3]`
   - [ ] Reward appears EVEN IF you failed the check

**Example of SUCCESS:**
```
You hurl the mug at the fireplace. It MISSES and shatters on wall.
Strangers turn to look—Grimsby grabs your sleeve: "MOVE!"

**✨ +1 MOMENTUM!** (Creative thinking under pressure)
[Momentum: 1/3]

You escaped through the chaos you created!
```

**If This Fails:** No momentum messages appear after creative actions.

---

## 🧪 ENHANCEMENT #4: CONSEQUENCE CALLBACKS

**What to Look For:** AI references earlier turns explicitly

### Test Steps:

1. **Play 10-15 Turns**
   - [ ] Make meaningful choices (help Grimsby, pay debts, make promises)

2. **Watch for Callback Messages**
   - [ ] Format: `[CALLBACK: Turn X - you did Y]`
   - [ ] NPCs reference your earlier actions
   - [ ] Past choices affect current options

**Example of SUCCESS:**
```
Turn 30 - You return to The Soggy Boot...

Grimsby's face lights up. "Kaelen! After that tunnel escape—Madge told
EVERYONE you paid the 5 gold without hesitation. Word spread. You're
trustworthy."

[CALLBACK: Turn 4 - you paid Madge for tunnel]
[Grimsby Approval: 55 → 70 - Reputation boost]

"I want to help you find Marcus. He needs to answer for what he did."
```

**If This Fails:** No explicit callbacks to earlier turns.

---

## 🧪 ENHANCEMENT #5: DYNAMIC DIFFICULTY

**What to Look For:** Difficulty adapts based on success/failure chains

### Test Steps:

1. **Succeed Same Skill 3 Times in a Row**
   - [ ] Use Persuasion/Arcana/Perception 3+ times successfully
   - [ ] NPCs comment on your skill level
   - [ ] Difficulty increases (+5 to +10)

**Example of SUCCESS (Success Chain):**
```
[After 3 Persuasion successes]

"You're VERY smooth," the merchant says, eyes narrowing. "Too smooth.
Guild-trained? Or conning me?"

[Next Persuasion check: Difficulty +10 - NPC is suspicious of your skill]
```

2. **Fail Same Skill 3 Times in a Row**
   - [ ] Attempt difficult checks and fail 3+ times
   - [ ] NPCs offer hints or help
   - [ ] Difficulty decreases (-5)

**Example of SUCCESS (Failure Chain):**
```
[After 3 Combat failures]

Grimsby sees you struggling. "Here!" He tosses oil vial. "Throw it then
light it—area damage!"

[HINT unlocked - environmental tactic]
[Next Combat: Difficulty -5 - Grimsby coaching you]
```

**If This Fails:** Difficulty stays static, no NPC comments on your skill.

---

## 🧪 ENHANCEMENT #6: NARRATIVE STATUS EFFECTS

**What to Look For:** Status effects described with sensory details, NPC reactions

### Test Steps:

1. **Get Poisoned/Injured in Combat**
   - [ ] AI describes HOW it affects you (sweating, vision blurred, hands trembling)
   - [ ] NOT just "-15% to checks"

2. **Watch NPC Reactions**
   - [ ] High approval NPCs offer help (antidote, healing)
   - [ ] Low approval NPCs exploit weakness or flee

**Example of SUCCESS:**
```
The poison burns through your veins like liquid fire. Your hands tremble.
Vision swims. You're sweating profusely.

Grimsby grabs your arm. 'You're in no shape!' He pulls out a grimy vial.
'Antidote. Probably expired. Better than dying of spider venom though.'

What do you do?
1. Drink antidote [Medicine: 15] 🟡 - Might cure, might worsen (expired)
2. Try to climb anyway [Strength: 10, -15% POISONED] 🔴 - Slippery hands!
3. Rest here 1 hour - Poison worsens but stamina recovers
```

**If This Fails:** Status effects are mechanical only, no sensory descriptions.

---

## 🎯 SUCCESS METRICS

**You'll know the prototype works if you can check 8+ of these:**

1. [ ] **Did you laugh?** (Humor through specificity, Terry Pratchett vibes)
2. [ ] **Were you surprised?** (Plot twists, unexpected NPC actions)
3. [ ] **Do you remember Grimsby's name?** (Memorable NPC personality)
4. [ ] **Did choices feel meaningful?** (Consequences visible later)
5. [ ] **Do you want to play again?** (Hooked in first 3-5 turns)
6. [ ] **Did you use environment creatively?** (Flip tables, throw objects)
7. [ ] **Did Grimsby feel like a person?** (Acts independently, offers help)
8. [ ] **Did AI reference past turns?** (Callbacks to earlier events)
9. [ ] **Did status effects feel real?** (Sweaty hands, blurred vision, NPC reactions)
10. [ ] **Did difficulty feel fair?** (Adapts to your skill, offers help when failing)

**Target: 8/10 = EXCEPTIONAL AI GM** 💎

---

## 🐛 BUG REPORTING

If something doesn't work, note:

1. **What enhancement failed?** (Environmental tactics, proactive NPCs, etc.)
2. **What turn number?** (helps trace the issue)
3. **What was the last player action?** (before the bug)
4. **What should have happened?** (expected behavior)
5. **What actually happened?** (actual behavior)

---

## 🚀 AFTER TESTING

Once you've verified all 6 enhancements work:

### Option A: Playtest More (Recommended)
- Play 20-30 turns to experience full system
- Test all 3 character classes (Fighter, Mage, Thief)
- Identify any remaining gaps

### Option B: Build Discord Bot
- Port enhanced AI to Discord
- Add asymmetric whisper system
- Implement party leader commands
- Test with 3-4 real players

### Option C: Implement The Shattered Crown
- Add 7 factions to world
- Update starting quest to crown mystery
- Add crown fragment mechanics

---

## 📊 TESTING LOG TEMPLATE

Copy this for each test session:

```
TEST SESSION: [Date/Time]
Player Character: Kaelen the Mage
Turns Played: [Number]

✅ Environmental Tactics: [PASS/FAIL] - Notes:
✅ Proactive NPCs: [PASS/FAIL] - Notes:
✅ Momentum System: [PASS/FAIL] - Notes:
✅ Consequence Callbacks: [PASS/FAIL] - Notes:
✅ Dynamic Difficulty: [PASS/FAIL] - Notes:
✅ Narrative Status Effects: [PASS/FAIL] - Notes:

SUCCESS METRICS: [X/10 checked]

BUGS FOUND:
1.
2.
3.

OVERALL IMPRESSION:
[Your thoughts]
```

---

**Status:** ✅ Checklist created
**Ready for:** Terminal prototype testing
**Estimated test time:** 20-30 minutes to verify all enhancements
