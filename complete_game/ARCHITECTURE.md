# The Arcane Codex - Architecture

## ✅ Correct Design: Players Stay in Their Messaging Apps

**Target Audience:** Kids/young people who live in Discord/WhatsApp
**Design Philosophy:** Players never leave their messaging apps

---

## 🎮 Three Play Modes

### Mode 1: Discord Bot (Automated - Recommended)

**What Players See:**
- Everything happens in Discord
- Character creation via `!begin` (bot DMs questions)
- Gameplay via bot commands in channel
- AI GM (you) sends whispers via `!whisper @Player`

**Tech Stack:**
```
discord_bot.py (runs continuously)
└── Connects to Discord API
└── Sends DMs for Divine Interrogation
└── Manages party state
└── Triggers Divine Council votes
```

**Player Experience:**
```
1. Join Discord server
2. Type: !begin
3. Answer 10 questions in DMs (1-5)
4. Bot announces class in channel
5. Type: !start (when both ready)
6. Play! AI GM sends whispers, triggers votes
```

**Advantages:**
- ✅ Fully automated
- ✅ Players never leave Discord
- ✅ Bot tracks all state
- ✅ Beautiful embeds and formatting

**Setup Time:** 5 minutes (create bot, run script)

---

### Mode 2: WhatsApp Manual (Pure Messaging - Simplest)

**What Players See:**
- Everything happens in WhatsApp
- You (AI GM) send questions via DM
- Players discuss in WhatsApp group
- You send different whispers to each player

**Tech Stack:**
```
Your phone + Claude (€200 Max plan)
└── Manual message crafting
└── Track state in notes/spreadsheet
└── Send DMs for whispers
```

**Player Experience:**
```
1. Join WhatsApp group "The Arcane Codex"
2. You DM them 10 questions (one at a time)
3. They answer with numbers
4. You calculate class and announce
5. Play! You craft whispers using Claude
```

**Advantages:**
- ✅ Zero setup (just WhatsApp)
- ✅ Players never leave WhatsApp
- ✅ No bot/server needed
- ✅ Perfect for quick testing

**Setup Time:** 30 seconds (create WhatsApp group)

---

### Mode 3: Web UI (Optional Fallback - NOT Primary)

**When to Use:**
- Admin testing only
- Showcase/demo for non-players
- Alternative if Discord/WhatsApp unavailable

**Tech Stack:**
```
arcane_codex_server.py (Flask)
└── static/index.html (web UI)
└── REST API endpoints
```

**NOT recommended for kids/players** - they want to stay in messaging apps!

---

## 📱 Why Messaging Apps?

### Target Audience Behavior
- **Kids/young people:** Live in Discord/WhatsApp
- **Resistance to websites:** "Why do I need to go to some website?"
- **Friction:** Switching apps = lost engagement
- **Social:** Messaging = already social, already grouped

### Design Wins
- ✅ **Zero friction:** Players already in app
- ✅ **Natural flow:** DMs for whispers = already familiar
- ✅ **Mobile-first:** Messaging apps = mobile native
- ✅ **Async gameplay:** Turn-based works perfectly in chat
- ✅ **Persistent:** Chat history = game log

---

## 🏗️ System Architecture

### Discord Bot Architecture

```
PLAYERS (Discord)
    ↓
    ↓ !begin (start interrogation)
    ↓
DISCORD BOT (discord_bot.py)
    ↓
    ↓ Send 10 questions via DM
    ↓
GAME ENGINE (arcane_codex_server.py)
    ↓
    ↓ Track answers, calculate favor
    ↓
    ↓ Assign class
    ↓
DISCORD BOT
    ↓
    ↓ Announce class in channel
    ↓
PLAYERS (Discord)
    ↓
    ↓ !start (begin adventure)
    ↓
DISCORD BOT
    ↓
    ↓ Create party (2 players + 2 NPCs)
    ↓
AI GM (You via Claude)
    ↓
    ↓ !whisper @Player1 You sense a trap...
    ↓ !whisper @Player2 Magic is cursed...
    ↓
PLAYERS
    ↓
    ↓ Discuss and decide
    ↓
AI GM
    ↓
    ↓ !council Players stole medicine
    ↓
DISCORD BOT
    ↓
    ↓ Show Divine Council vote
    ↓ Show NPC testimonies
    ↓ Apply consequences
```

### WhatsApp Manual Architecture

```
PLAYERS (WhatsApp)
    ↓
AI GM (You with Claude)
    ↓
    ↓ DM Question 1: VALDRIS asks...
    ↓
PLAYER 1
    ↓
    ↓ Answer: 3
    ↓
AI GM
    ↓
    ↓ [Track: VALDRIS -25, KAITHA +30]
    ↓ DM Question 2: KAITHA asks...
    ↓
PLAYER 1
    ↓
    ↓ Answer: 1
    ↓
AI GM
    ↓
    ↓ [...after 10 questions]
    ↓ [Calculate: Primary KAITHA +85, Secondary ATHENA +70]
    ↓ [Assign: Mage (Chaotic)]
    ↓
    ↓ Send divine verdict
    ↓
WHATSAPP GROUP
    ↓
AI GM
    ↓
    ↓ "Player 1 is now a Mage (Chaotic)!"
    ↓
    ↓ [Both players complete interrogation]
    ↓
    ↓ PUBLIC: "You arrive at Duke's warehouse..."
    ↓ DM Player 1: "You sense a TRAP!"
    ↓ DM Player 2: "Medicine is CURSED!"
    ↓
PLAYERS
    ↓
    ↓ Discuss and decide in group
    ↓
AI GM
    ↓
    ↓ Send Divine Council vote results
    ↓ Update trust/NPC approval
```

---

## 🎯 Core Innovation: Asymmetric Whispers

**The Magic Happens in Direct Messages:**

```
PUBLIC (everyone sees):
┌─────────────────────────────────────┐
│ You arrive at the warehouse.       │
│ Grimsby: "Medicine inside!"        │
│ Guards are distracted.              │
│ What do you do?                     │
└─────────────────────────────────────┘

PRIVATE DM to Fighter:
┌─────────────────────────────────────┐
│ 🔮 [WHISPER]                        │
│ Your military training reveals:     │
│ This is a TRAP. Guards are          │
│ professionals. Ambush imminent.     │
│                                     │
│ Share this... or don't.             │
└─────────────────────────────────────┘

PRIVATE DM to Mage:
┌─────────────────────────────────────┐
│ 🔮 [WHISPER]                        │
│ You sense dark magic on medicine.   │
│ It's CURSED. If used, 200 die.      │
│ Grimsby doesn't know.               │
│                                     │
│ Share this... or don't.             │
└─────────────────────────────────────┘
```

**Result:** Impossible moral choice requiring trust & collaboration

---

## 📊 State Management

### Discord Bot (Automated)
```python
# Bot tracks everything
active_games = {
    channel_id: GameState(
        party_trust=50,
        player_characters=[fighter, mage],
        npc_companions=[grimsby, renna],
        turn_count=12,
        ...
    )
}
```

### WhatsApp Manual (Spreadsheet/Notes)
```
PARTY STATE:
Trust: 45/100
Turn: 12
Location: Duke's District

NPCS:
Grimsby: 20/100 (DANGER - may betray!)
Renna: 55/100 (Neutral)

DIVINE FAVOR (Player 1):
KORVAN +45, VALDRIS +30, KAITHA -15

DIVINE FAVOR (Player 2):
ATHENA +70, KAITHA +85, VALDRIS -25
```

---

## 🚀 Deployment Options

### For This Week (Testing):

**Option A: Discord Bot (Local)**
```bash
python discord_bot.py <TOKEN>
# Bot runs on your computer
# Players connect via Discord
# Works for 2-10 players
```

**Option B: WhatsApp (Zero Setup)**
```
# Just you + WhatsApp + Claude
# Send messages manually
# Perfect for quick prototype testing
```

### Future (Production):

**Option A: Discord Bot (Cloud)**
```
# Deploy to Heroku/Railway/etc
# Bot runs 24/7
# Multiple parties simultaneously
```

**Option B: WhatsApp Business API**
```
# Automated WhatsApp messages
# Requires WhatsApp Business account
# More complex setup
```

---

## 📁 File Structure

```
complete_game/
├── discord_bot.py              # Discord bot (MAIN for players)
├── arcane_codex_server.py      # Game engine + optional web server
├── static/
│   └── index.html             # Web UI (OPTIONAL, not for players)
├── WHATSAPP_GUIDE.md          # Manual AI GM instructions
├── QUICKSTART.md              # Setup guide
├── ARCHITECTURE.md            # This file
└── requirements.txt           # Dependencies

Parent directory:
../MECHANICS.md                # Game rules
../DIVINE_INTERROGATION_SYSTEM.md
../TRUST_BETRAYAL_MECHANICS.md
../AI_GM_ENHANCEMENTS.md
[...other design docs]
```

---

## ✅ What's Implemented

| Feature | Discord | WhatsApp | Web UI |
|---------|---------|----------|--------|
| Divine Interrogation | ✅ `!begin` | ✅ Manual | ✅ GUI |
| Character Creation | ✅ Auto | ✅ Manual calc | ✅ Auto |
| Asymmetric Whispers | ✅ `!whisper` | ✅ DMs | ❌ |
| Divine Council | ✅ `!council` | ✅ Manual | ❌ |
| NPC Tracking | ✅ `!npcs` | ✅ Manual | ❌ |
| Trust System | ✅ `!trust` | ✅ Manual | ❌ |
| Party Status | ✅ `!status` | ✅ Manual | ❌ |

**Verdict:** Discord bot = full featured, WhatsApp = manual but complete, Web UI = character creation only

---

## 🎮 Recommended Path

**For this week's testing:**

1. **Quick test (30 mins):** Use WhatsApp manual mode
   - No setup
   - Send questions via DM
   - Craft whispers using Claude
   - Test core innovation (asymmetric whispers)

2. **Full test (2-3 hours):** Set up Discord bot
   - Create Discord bot (5 mins)
   - Run `discord_bot.py`
   - Players use `!begin` for interrogation
   - Full automated gameplay

**Winner:** Discord bot for final version, WhatsApp for rapid prototyping

---

## 🔮 Future Enhancements

### v1.5 (After Core Testing)
- Nemesis System (documented in `NEMESIS_SYSTEM.md`)
- Quest scenarios (framework ready)
- Combat system (currently narrative)

### v2.0+ (Future)
- DRAKMOR god (8th god)
- Dragon/wolf companions
- Transmedia features
- Multi-party campaigns

---

**Architecture Summary:**

```
CORRECT: Players → Discord/WhatsApp → AI GM → Game Engine
WRONG:   Players → Website → Game Engine

Kids stay in their apps. That's the whole point! 📱
```
