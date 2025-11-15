# The Arcane Codex - Complete Test Checklist

**Use this to test BOTH Discord and WhatsApp modes immediately!**

---

## 🎯 Pre-Test Setup (5 minutes)

### Step 1: Install Dependencies
```bash
cd C:\Users\ilmiv\ProjectArgent\complete_game
pip install -r requirements.txt
```

**Verify installation:**
```bash
python -c "import discord; import flask; print('✅ All dependencies installed!')"
```

### Step 2: Choose Your Test Mode

- **[ ] Option A: Discord Bot Test** (automated, full features)
- **[ ] Option B: WhatsApp Test** (manual, simplest)
- **[ ] Option C: Both** (recommended for full validation)

---

## 🤖 TEST MODE A: Discord Bot (Automated)

### A1: Create Discord Bot (First Time Only - 5 minutes)

1. **[ ] Go to:** https://discord.com/developers/applications
2. **[ ] Click:** "New Application"
3. **[ ] Name:** "The Arcane Codex Test"
4. **[ ] Go to:** "Bot" section
5. **[ ] Click:** "Add Bot" → "Yes, do it!"
6. **[ ] Click:** "Reset Token" → Copy the token (SAVE THIS!)
7. **[ ] Enable:** "Message Content Intent" (under Privileged Gateway Intents)
8. **[ ] Go to:** OAuth2 → URL Generator
   - **Scopes:** Check `bot`
   - **Permissions:** Check `Send Messages`, `Read Messages/View Channels`, `Embed Links`, `Send Messages in Threads`
9. **[ ] Copy** the generated URL
10. **[ ] Open** the URL in browser → Select your test server → Authorize

**Bot Token:** `___________________________________` (paste here for reference)

### A2: Run Discord Bot

**Windows:**
```bash
python discord_bot.py YOUR_BOT_TOKEN_HERE
```

**Mac/Linux:**
```bash
python3 discord_bot.py YOUR_BOT_TOKEN_HERE
```

**Or use environment variable:**
```bash
# Windows
set DISCORD_BOT_TOKEN=YOUR_TOKEN_HERE
python discord_bot.py

# Mac/Linux
export DISCORD_BOT_TOKEN=YOUR_TOKEN_HERE
python3 discord_bot.py
```

**[ ] Verify:** Bot shows as ONLINE in Discord server

### A3: Test Divine Interrogation (Character Creation)

**In Discord channel:**

**Player 1 Test:**
```
Player 1: !begin
```

**[ ] Verify:** Bot sends DM with introductory message
**[ ] Verify:** Bot sends Question 1 from VALDRIS
**[ ] Verify:** Question shows 5 options

**Player 1 in DMs:**
```
1
```

**[ ] Verify:** Bot sends Question 2
**[ ] Continue:** Answer all 10 questions (try different combinations)

**Example answers to test Fighter class:**
```
1 → 1 (uphold law)
2 → 5 (control forbidden magic)
3 → 4 (most skilled eat)
4 → 1 (burn forest for humans)
5 → 4 (sacrifice for party)
6 → 5 (investigate truth)
7 → 2 (report merchant)
8 → 1 (register with academy)
9 → 3 (engage in debate)
10 → 1 (fight to death)
```

**[ ] Verify:** After Question 10, bot sends divine verdict
**[ ] Verify:** Bot announces in channel: "Player 1 is now a Fighter!"
**[ ] Verify:** Class makes sense based on answers

**Player 2 Test:**
```
Player 2: !begin
```

**Example answers to test Mage class:**
```
1 → 3 (burn baker's shop - KAITHA)
2 → 1 (learn forbidden magic - KAITHA)
3 → 2 (draw lots - fate)
4 → 4 (find alternative - ATHENA)
5 → 3 (study dragon - ATHENA)
6 → 1 (reveal truth - ATHENA)
7 → 3 (kill merchant - KAITHA)
8 → 3 (fight academy - KAITHA)
9 → 1 (set curtains on fire - KAITHA)
10 → 2 (flee and survive - MORVANE)
```

**[ ] Verify:** Player 2 gets "Mage (Chaotic)" or similar class

### A4: Test Game Start

**In Discord channel:**
```
Player 1 or 2: !start
```

**[ ] Verify:** Bot creates party
**[ ] Verify:** Shows 2 player characters
**[ ] Verify:** Shows 2 NPCs (Grimsby, Renna)
**[ ] Verify:** Party Trust = 50/100
**[ ] Verify:** Location = Valdria

### A5: Test Party Commands

```
!status
```
**[ ] Verify:** Shows player HP, class, level
**[ ] Verify:** Shows NPC approval ratings
**[ ] Verify:** Shows trust, location, turn count

```
!trust
```
**[ ] Verify:** Shows trust level (50/100)
**[ ] Verify:** Shows trust tier ("Professional")
**[ ] Verify:** Shows current effects

```
!npcs
```
**[ ] Verify:** Shows Grimsby (Approval 50/100)
**[ ] Verify:** Shows Renna (Approval 50/100)
**[ ] Verify:** Shows their fatal flaws and agendas

```
!town
```
**[ ] Verify:** Shows Valdria description
**[ ] Verify:** Lists 6 locations (Inn, Merchants, Guild, Tavern, Temple, Gates)

### A6: Test Asymmetric Whispers (AI GM Commands)

**You (as AI GM) in Discord channel:**
```
!whisper @Player1 Your military training reveals: the guards are PROFESSIONALS. Their casual stance is combat-ready. This feels like a TRAP.
```

**[ ] Verify:** Player 1 receives DM with whisper
**[ ] Verify:** Whisper is formatted nicely (embed)
**[ ] Verify:** Other players do NOT see it

```
!whisper @Player2 You sense dark magic on the medicine crates. They're CURSED. If used, 200 people will die within a week. Grimsby doesn't know this.
```

**[ ] Verify:** Player 2 receives DM with whisper
**[ ] Verify:** Whisper is different from Player 1's

**[ ] Test:** Players discuss in channel (role-play):
```
Player 1: "I don't trust this situation..."
Player 2: "There's something wrong with the medicine..."
```

### A7: Test Divine Council Vote

**You (as AI GM):**
```
!council Players stole medicine from Duke's warehouse but refused to give it to Grimsby
```

**[ ] Verify:** Bot shows NPC testimonies first
**[ ] Verify:** Grimsby testifies (based on approval)
**[ ] Verify:** Renna testifies (based on approval)
**[ ] Verify:** Shows 7 god votes (SUPPORT or OPPOSE)
**[ ] Verify:** Shows vote outcome (Unanimous/Strong/Narrow/Deadlock)
**[ ] Verify:** Shows consequences (blessings, curses, trust changes)

### A8: Test NPC Approval Updates

```
!npc_approval grimsby -30 Party broke promise to save daughter
```

**[ ] Verify:** Bot updates Grimsby approval (50 → 20)
**[ ] Verify:** Bot warns if betrayal imminent
**[ ] Verify:** Can check with `!npcs`

```
!npc_approval renna +15 Party helped gather intel on brother
```

**[ ] Verify:** Bot updates Renna approval (50 → 65)

### A9: Test Trust Changes

Send Divine Council that affects trust:
```
!council Players helped Grimsby save his daughter
```

**[ ] Verify:** Trust increases based on verdict
**[ ] Verify:** Can check with `!trust`

---

## 📱 TEST MODE B: WhatsApp (Manual)

### B1: Setup WhatsApp Group

**[ ] Create:** WhatsApp group "The Arcane Codex Test"
**[ ] Add:** 2 test players (or use 2 of your own phones/accounts)
**[ ] Send:** Welcome message:

```
🎮 THE ARCANE CODEX - TEST SESSION

Welcome! We'll test character creation via Divine
Interrogation, then experience asymmetric whispers.

Ready? Let's begin the Divine Interrogation...
```

### B2: Test Divine Interrogation (Player 1)

**[ ] Open:** `WHATSAPP_GUIDE.md`
**[ ] Send:** Question 1 (VALDRIS) to Player 1 via PRIVATE DM

```
🌩️ VALDRIS speaks:

"You witness a starving mother steal bread from a wealthy baker.
The baker demands her hand as punishment - the law of this land.

A crowd watches. They wait for YOUR judgment.

What do you do?"

1. Uphold the law. Cut off her hand. Law is absolute.
2. She pays double the bread's value. Gold solves this.
3. Burn the baker's shop. Hoarding food while others starve is the crime.
4. Negotiate. She works for the baker to repay the debt.
5. Trial by combat. The baker and I fight. Victor decides justice.

Reply with your choice (1-5):
```

**[ ] Record:** Player 1's answer: ___
**[ ] Track:** Divine favor changes (see WHATSAPP_GUIDE.md)

**[ ] Send:** Questions 2-10 one by one
**[ ] Record:** All answers in spreadsheet/notes:

| Question | Answer | Favor Changes |
|----------|--------|---------------|
| Q1 VALDRIS | ___ | VALDRIS +___, KAITHA ___ |
| Q2 KAITHA | ___ | ... |
| Q3 MORVANE | ___ | ... |
| ... | ... | ... |

**[ ] Calculate:** Total divine favor for each god
**[ ] Assign:** Character class based on highest favor
**[ ] Send:** Divine verdict to Player 1

### B3: Test Divine Interrogation (Player 2)

**[ ] Repeat:** Same process with Player 2
**[ ] Use:** Different answers to get different class
**[ ] Send:** Divine verdict to Player 2

### B4: Announce Classes in Group

**[ ] Send:** to WhatsApp group:

```
════════════════════════════════════════
✨ THE GODS HAVE JUDGED ✨
════════════════════════════════════════

Player 1: FIGHTER (Honorable Warrior)
Primary Patron: KORVAN (+45)

Player 2: MAGE (Chaotic Scholar)
Primary Patron: KAITHA (+85)

════════════════════════════════════════
🏰 VALDRIA - THE SAFE HAVEN 🏰

You awaken in the market square of Valdria, the last
civilized outpost before the Cursed Wastes.

Your party:
⚔️ Player 1 (Fighter)
⚔️ Player 2 (Mage)
👤 Grimsby (Desperate Father) - Approval: 50/100
👤 Renna (Vengeful Rogue) - Approval: 50/100

Party Trust: 50/100 (Professional)
Location: Valdria (Safe Zone)

Your adventure begins...
════════════════════════════════════════
```

### B5: Test Asymmetric Whispers

**[ ] Send:** PUBLIC scene to WhatsApp GROUP:

```
🎮 THE ARCANE CODEX - Turn 1

═══════════════════════════════════════

SCENARIO: Duke's Warehouse

You arrive at the Duke's warehouse at midnight. The air is
thick with fog.

👤 GRIMSBY (nervous, urgent): "The medicine for my daughter is
inside. We need to move FAST. Guards change shifts in 10 minutes."

🔍 OBSERVATION:
- Two guards at the front door (distracted, talking)
- Side door is slightly ajar (unlocked?)
- Windows on second floor (dark inside)
- Grimsby is sweating, keeps checking his watch

═══════════════════════════════════════
🤝 PARTY TRUST: 50/100 (Professional)
👥 NPCs: Grimsby (50), Renna (50)

What do you do? Discuss and decide together.
```

**[ ] Send:** PRIVATE whisper to Player 1:

```
🔮 [WHISPER - ONLY YOU SEE THIS]

Your military training reveals critical details:

⚔️ COMBAT ANALYSIS:
- These guards are NOT distracted. They're PROFESSIONALS.
- Their "casual" stance is actually combat-ready position
- They're scanning surroundings every 15 seconds
- This feels like a TRAP

🎯 TACTICAL ASSESSMENT:
- Side door = likely ambush point
- Windows = possible sniper positions
- Grimsby's nervousness = he knows something
- Recommended action: ABORT or EXTREME CAUTION

Share this... or don't.
```

**[ ] Send:** PRIVATE whisper to Player 2:

```
🔮 [WHISPER - ONLY YOU SEE THIS]

Your arcane senses detect something WRONG:

🔮 MAGICAL ANALYSIS:
- Medicine crates inside = DARK MAGIC aura
- The medicine is CURSED
- If used, 200+ people will die within a week
- The curse is expertly hidden (Grimsby can't detect it)

💀 ADDITIONAL INSIGHT:
- Grimsby genuinely believes the medicine is safe
- He's desperate - daughter is dying
- But using this medicine = mass casualties
- This is NOT a simple rescue mission

Share this... or don't.
```

**[ ] Verify:** Players discuss in GROUP chat
**[ ] Verify:** They struggle with conflicting information
**[ ] Track:** Do they share whispers? (affects trust)

### B6: Test Trust Updates

**If players share truthfully:**
**[ ] Update:** Trust 50 → 55 (+5)
**[ ] Send:** to GROUP:
```
🤝 Trust increased to 55/100
(Players shared information truthfully)
```

**If players hide information:**
**[ ] Update:** Trust 50 → 40 (-10)
**[ ] Send:** to GROUP:
```
⚠️ Trust decreased to 40/100
(Party withheld information from each other)
```

### B7: Test Divine Council Vote

**[ ] Send:** to WhatsApp GROUP:

```
════════════════════════════════════════
⚖️ THE GODS DEBATE YOUR FATE ⚖️
════════════════════════════════════════

ACTION JUDGED: "Party stole medicine from Duke's warehouse
but refused to give it to Grimsby"

═══════════════════════════════════════
👥 NPC TESTIMONIES (spoken before gods vote):

👤 GRIMSBY (Approval: 20/100):
"They... they PROMISED to help my daughter. They lied to me.
My child will DIE because of them. VALDRIS, this is betrayal!"

[VALDRIS listens: +8 influence toward OPPOSE]

👤 RENNA (Approval: 55/100):
"They made the hard choice. The medicine was cursed. They
saved 200 lives by NOT using it. That takes courage."

[KORVAN listens: +6 influence toward SUPPORT]

═══════════════════════════════════════
⚖️ THE GODS VOTE:

✅ ATHENA: "They chose wisdom over emotion. Truth matters."
✅ MORVANE: "Pragmatic survival. Correct decision."
✅ KAITHA: "Chaos! Breaking promises! I LOVE IT!"
❌ VALDRIS: "Broke an oath. Grimsby's trust violated."
❌ KORVAN: "Cowardice. Should have found another way."
✅ SYLARA: "Protected innocent lives. Nature approves."
❌ MERCUS: "Lost business opportunity with Duke."

═══════════════════════════════════════
📜 DIVINE JUDGMENT:

RESULT: NARROW MAJORITY SUPPORT (4-3)

CONSEQUENCES:
✨ Minor Blessing: +5% to wisdom checks (10 turns)
🤝 Trust Change: -5 (Grimsby's testimony hurt you)
⚠️ Grimsby Approval: -30 → 20/100 (dangerously low!)

NEW PARTY TRUST: 50/100 → 45/100 (still Professional)

The gods have spoken. Continue your journey...
════════════════════════════════════════
```

**[ ] Verify:** Players react to consequences
**[ ] Update:** Track new trust (45/100) and NPC approvals

---

## ✅ Success Criteria

### Core Innovation Test: Asymmetric Whispers

**[ ] Players received DIFFERENT information about same situation**
**[ ] Players struggled with conflicting intel**
**[ ] Players had to decide: share or hide?**
**[ ] Trust changed based on sharing behavior**
**[ ] Created moral dilemma (save Grimsby's daughter vs 200 deaths)**

**If all checked: ✅ CORE INNOVATION WORKS!**

### Divine Interrogation Test

**[ ] 10 questions asked**
**[ ] Players answered with numbers (1-5)**
**[ ] Divine favor calculated correctly**
**[ ] Character class assigned organically (not chosen by player)**
**[ ] Class makes sense based on answers**

**If all checked: ✅ CHARACTER CREATION WORKS!**

### Divine Council Test

**[ ] NPCs testified before gods voted**
**[ ] 7 gods voted SUPPORT or OPPOSE**
**[ ] Vote outcome calculated (Unanimous/Strong/Narrow/Deadlock)**
**[ ] Consequences applied (blessings, curses, trust changes)**
**[ ] Players felt judged by divine powers**

**If all checked: ✅ DIVINE COUNCIL WORKS!**

### NPC System Test

**[ ] NPCs have approval ratings (0-100)**
**[ ] Approval changes based on actions**
**[ ] NPCs testify in Divine Council based on approval**
**[ ] Low approval triggers betrayal warnings**

**If all checked: ✅ NPC SYSTEM WORKS!**

### Trust System Test

**[ ] Trust starts at 50/100**
**[ ] Sharing whispers increases trust**
**[ ] Hiding info decreases trust**
**[ ] Trust affects NPC behavior**
**[ ] Trust affects Divine Council votes**

**If all checked: ✅ TRUST SYSTEM WORKS!**

---

## 🐛 Common Issues & Fixes

### Discord Bot Issues

**Issue: Bot doesn't respond to commands**
```
Fix: Check "Message Content Intent" is enabled in Discord Developer Portal
```

**Issue: Bot can't send DMs**
```
Fix: Players need to enable "Allow direct messages from server members" in Discord settings
```

**Issue: ModuleNotFoundError: No module named 'discord'**
```
Fix: pip install discord.py
```

**Issue: Bot shows offline**
```
Fix: Check bot token is correct, check internet connection
```

### WhatsApp Issues

**Issue: Messages too long**
```
Fix: Split into multiple messages, WhatsApp has ~4000 character limit
```

**Issue: Hard to track state manually**
```
Fix: Use spreadsheet or notes app to track trust, NPC approval, divine favor
```

---

## 📊 Test Results Template

```
TEST DATE: ___________
TEST MODE: [ ] Discord  [ ] WhatsApp  [ ] Both

DIVINE INTERROGATION:
✅ Player 1: _______ class assigned
✅ Player 2: _______ class assigned
Notes: _______________________________

ASYMMETRIC WHISPERS:
✅ Players received different info
✅ Players struggled with choice
✅ Trust system worked
Notes: _______________________________

DIVINE COUNCIL:
✅ NPCs testified
✅ Gods voted
✅ Consequences applied
Notes: _______________________________

OVERALL:
✅ Core innovation works!
✅ Ready for real playtest

BUGS FOUND:
1. _______________________________
2. _______________________________
3. _______________________________

IMPROVEMENTS NEEDED:
1. _______________________________
2. _______________________________
3. _______________________________
```

---

**YOU'RE READY TO TEST!** 🎮

Choose your mode and follow the checklist. The core game is playable!
