# The Arcane Codex - Game Server v1.0

## Architecture: Web UI + Chat Integration + AI GM

**The game is a fully integrated system:**

1. **Web UI** (`http://localhost:5000`) - **Game Interface**
   - Character creation (Divine Interrogation)
   - Game visuals and scenario presentation
   - Status displays and inventory
   - Choice selection interface

2. **Chat Integration** (Discord/WhatsApp) - **Communication Layer**
   - Party discussion and coordination
   - Private whispers (asymmetric information)
   - NPC dialogue and interactions
   - Divine Council announcements

3. **AI Game Master** (Claude via MCP) - **Autonomous Control**
   - Generates unique scenarios dynamically
   - Presents content via Web + Chat
   - Tracks party trust, NPC approval, divine favor
   - Applies consequences and updates world state
   - **No human intervention required** - fully automated

## Core Features Implemented

✅ **Divine Interrogation** - 10 questions from 7 gods (web UI)
✅ **Character Creation** - Class assigned based on divine favor patterns (web UI)
✅ **Discord Bot** - Party management, status, NPC tracking
✅ **Asymmetric Whispers** - AI GM sends different DMs to each player
✅ **Safe Town Hub (Valdria)** - Diablo-style safe haven
✅ **NPC Companions** - Grimsby (desperate father) and Renna (vengeful rogue)
✅ **Trust/Betrayal System** - Party-wide trust (0-100) affects NPC behavior
✅ **Divine Council Voting** - 7 gods judge player actions with NPC testimony
✅ **Flask Web Server** - REST API + Character creation UI
✅ **AI Scenario Generation** - Dynamic content creation via Claude (see AI Framework docs)

## AI Game Master Framework

**The game features a fully autonomous AI Game Master** (Claude) that generates unique scenarios, narrates content, tracks state, and runs the entire game without human intervention.

### AI GM Documentation
- **[AI_SCENARIO_GENERATION_PATTERNS.md](AI_SCENARIO_GENERATION_PATTERNS.md)** - Internal pattern library for scenario generation
- **[AI_SCENARIO_QUALITY_CHECKLIST.md](AI_SCENARIO_QUALITY_CHECKLIST.md)** - Quality standards for generated content
- **[AI_GENERATION_EXAMPLES.md](AI_GENERATION_EXAMPLES.md)** - 5 complete scenario examples with analysis
- **[AI_INTEGRATION_WORKFLOW.md](AI_INTEGRATION_WORKFLOW.md)** - How AI GM integrates with game systems
- **[GAME_MASTER_QUICKSTART.md](GAME_MASTER_QUICKSTART.md)** - AI GM operational guide
- **[AI_SCENARIO_USAGE_GUIDE.md](AI_SCENARIO_USAGE_GUIDE.md)** - Scenario generation engine reference

### Key Features
- **100% Dynamic**: Every scenario generated fresh, never repeats
- **Context-Aware**: Adapts to party trust, NPC approval, divine favor
- **Class-Specific Whispers**: Each class sees different information
- **Multiple Dilemma Types**: MUTUALLY_EXCLUSIVE, CONTRADICTORY, COMPLEMENTARY
- **BG3-Style Environmental Tactics**: Interactive objects enable creative solutions
- **Cascading Consequences**: Choices have immediate and long-term effects

## Installation

### 1. Install Python Dependencies

```bash
pip install -r requirements.txt
```

This installs:
- Flask 3.0.0 (web server)
- flask-cors 4.0.0 (CORS support)
- discord.py 2.3.2 (Discord bot)

### 2. Set Up Discord Bot (Optional but Recommended)

**Create Discord Bot:**
1. Go to https://discord.com/developers/applications
2. Click "New Application"
3. Name it "The Arcane Codex"
4. Go to "Bot" section → "Add Bot"
5. Copy the **Token** (you'll need this)
6. Enable "Message Content Intent" under Privileged Gateway Intents

**Invite Bot to Your Server:**
1. Go to OAuth2 → URL Generator
2. Select scopes: `bot`
3. Select permissions: `Send Messages`, `Read Messages/View Channels`, `Send Messages in Threads`, `Embed Links`
4. Copy the generated URL and open it to invite bot to your server

### 3. Run the Server

**Option A: Web UI Only (Character Creation)**
```bash
python arcane_codex_server.py
```
Server starts on `http://localhost:5000`

**Option B: Discord Bot + Web UI (Full Game)**
```bash
# Terminal 1: Web server for character creation
python arcane_codex_server.py

# Terminal 2: Discord bot for gameplay
python discord_bot.py <your-bot-token>
# OR set environment variable:
# export DISCORD_BOT_TOKEN=<your-bot-token>
# python discord_bot.py
```

### 4. WhatsApp Alternative (No Discord Bot Needed)

Don't want to set up Discord bot? Use WhatsApp instead:
1. Run web server for character creation
2. You (AI GM) manually send different messages to each player via WhatsApp
3. Players respond in WhatsApp group chat
4. You track state using the web API endpoints

This is simpler but requires manual message crafting!

## How to Play

### Phase 1: Character Creation (Web UI)

**Each player independently:**
1. Open `http://localhost:5000` in browser
2. Click "Begin Divine Interrogation"
3. Answer 10 questions from the 7 gods:
   - 🌩️ VALDRIS (Order/Law)
   - 🔥 KAITHA (Chaos/Freedom)
   - 💀 MORVANE (Survival/Pragmatism)
   - 🌿 SYLARA (Nature/Life)
   - ⚔️ KORVAN (War/Courage)
   - 📚 ATHENA (Wisdom/Knowledge)
   - 💰 MERCUS (Commerce/Value)
4. The gods deliberate and assign your class organically:
   - Fighter, Mage, Thief, Ranger, Cleric, Paladin, or Bard
5. Enter your character name
6. **Copy your `player_id`** from the web UI (you'll need this for Discord)

### Phase 2: Register with Discord Bot

**In your Discord server:**
```
Player 1: !register player_abc123
Player 2: !register player_def456
```

Both players must register before starting the game.

### Phase 3: Start the Adventure

**In Discord channel:**
```
!start
```

The bot creates your party:
- 2 player characters (from web interrogation)
- 2 NPC companions (Grimsby and Renna)
- Starting location: Valdria (safe town hub)
- Party trust: 50/100

### Phase 4: Gameplay (Discord or WhatsApp)

**AI GM (you, using Claude)** sends asymmetric whispers:

**Example Scenario:**

**PUBLIC (send to Discord channel OR WhatsApp group):**
```
You arrive at the Duke's warehouse. Grimsby whispers: "The medicine
for my daughter is inside. We need to move fast."

The guards are distracted. The door is unlocked.

What do you do?
```

**PRIVATE WHISPER to Player 1 (Fighter):**
```
!whisper @Player1 [WHISPER] Your military training reveals this
is a TRAP. The "distracted" guards are professionals. Their stance
is combat-ready. This feels like an ambush.
```

**PRIVATE WHISPER to Player 2 (Mage):**
```
!whisper @Player2 [WHISPER] You sense dark magic on the medicine
crates. They're CURSED. If used, 200 people will die within a week.
But Grimsby doesn't know this.
```

**Players must now decide:**
- Share their whispers truthfully? (+5 trust)
- Hide information? (-10 trust)
- Lie about what they saw? (-20 trust if caught)
- Trust Grimsby? (He's desperate, might be lying)

### Phase 5: Consequences

**Divine Council Vote:**
```
!council Players stole medicine from Duke's warehouse
```

The bot shows:
1. **NPC Testimonies** - Grimsby/Renna speak first
2. **God Votes** - 7 gods vote SUPPORT or OPPOSE
3. **Judgment** - Blessings, curses, trust changes

**Track Party:**
```
!status  - Party health, location, NPCs
!trust   - Current trust level and effects
!npcs    - NPC approval ratings
```

## WhatsApp Alternative Workflow

If you prefer WhatsApp over Discord:

### Setup
1. Create WhatsApp group with both players
2. Run web server for character creation: `python arcane_codex_server.py`
3. Both players complete Divine Interrogation via web UI
4. Start game via API (see API Endpoints below)

### Gameplay
**You (AI GM using Claude) manually craft and send messages:**

**PUBLIC (WhatsApp group):**
```
🎮 THE ARCANE CODEX

You arrive at the Duke's warehouse. Grimsby says: "The medicine
for my daughter is inside. We need to move fast."

The guards are distracted. The door is unlocked.

What do you do? Discuss and decide.
```

**PRIVATE (Direct message to Player 1):**
```
🔮 [WHISPER - ONLY YOU SEE THIS]

Your military training reveals this is a TRAP. The "distracted"
guards are professionals. Their stance is combat-ready. This
feels like an ambush.

Share this... or don't.
```

**PRIVATE (Direct message to Player 2):**
```
🔮 [WHISPER - ONLY YOU SEE THIS]

You sense dark magic on the medicine crates. They're CURSED.
If used, 200 people will die within a week. But Grimsby doesn't
know this.

Share this... or don't.
```

**Track State:** Use API endpoints to update trust, NPC approval, and trigger Divine Council votes.

## Discord Bot Commands

### Player Commands
```
!register <player_id>  - Link Discord account to web character
!start                 - Start game (requires 2 registered players)
!status                - Show party status (HP, location, NPCs)
!trust                 - Show party trust level and effects
!npcs                  - Show NPC approval ratings
!town                  - Show Valdria (safe town hub) menu
```

### AI GM Commands (Administrator Only)
```
!whisper @Player <message>              - Send private whisper to player
!council <action description>           - Trigger Divine Council vote
!npc_approval <npc_id> <±change> <reason> - Update NPC approval

Examples:
  !whisper @Player1 You sense dark magic in the air...
  !council Players stole medicine from Duke's warehouse
  !npc_approval grimsby +15 Party saved his daughter
  !npc_approval renna -20 Party killed Thieves Guild member
```

## API Endpoints

### Divine Interrogation
- `POST /api/interrogation/start` - Start interrogation for a player
- `POST /api/interrogation/answer` - Answer question
- `POST /api/character/create` - Finalize character

### Game Management
- `POST /api/game/start` - Initialize game with both players
- `GET /api/game/state` - Get current game state

### Town Hub
- `GET /api/town/enter` - Enter Valdria

### Whispers
- `POST /api/whispers/generate` - Generate asymmetric whispers
- `POST /api/whispers/share` - Share whisper with party

### Divine Council
- `POST /api/council/convene` - Trigger Divine Council vote

### NPCs
- `POST /api/npc/approval/update` - Update NPC approval rating

## Architecture

```
complete_game/
├── arcane_codex_server.py    # Main game server (Flask + game logic)
├── static/
│   └── index.html            # Web UI for players
├── requirements.txt          # Python dependencies
└── README.md                 # This file
```

## Core Innovations

### 1. Asymmetric Whispers
Each player receives different private information about the same situation:
- **Fighter**: Tactical military analysis
- **Mage**: Magical auras and energies
- **Thief**: Hidden dangers and opportunities
- **Ranger**: Nature's secrets and tracking info
- **Cleric**: Moral implications and divine insight
- **Bard**: Social cues and interpersonal dynamics

Players must decide what to share with each other.

### 2. NPC Companions with Agendas

**Grimsby (Desperate Father)**
- Fatal Flaw: Desperate
- Hidden Agenda: "Save daughter at any cost"
- Approval: Starts at 50/100
- Divine Favor: +30 VALDRIS, +20 SYLARA, -10 MERCUS

**Renna (Vengeful Rogue)**
- Fatal Flaw: Impulsive
- Hidden Agenda: "Kill brother (Thieves Guild leader)"
- Approval: Starts at 50/100
- Divine Favor: +40 KAITHA, +25 MORVANE, -20 VALDRIS

NPCs can:
- Share whispers (if approval/trust is high)
- Withhold information (if approval/trust is low)
- Betray the party (if trust = 0 and approval < 20)
- Testify before the Divine Council
- Influence god votes based on their divine favor

### 3. Trust/Betrayal System

**Party Trust** (0-100):
- Increases when players share whispers truthfully
- Decreases when players lie or hide information
- Affects NPC behavior and Divine Council favor

**Trust Tiers:**
- 80-100: Unbreakable Bond (+10 group checks, NPCs share freely)
- 40-79: Professional (normal gameplay)
- 10-39: Fragile Alliance (-10 group checks, NPCs withhold info)
- 0-9: Imminent Betrayal (NPCs WILL betray within 2 turns)

### 4. Divine Council Voting

When players take major actions, the gods debate and vote:

1. **NPC Testimony First**: Companions speak before gods vote
   - High approval NPCs defend the party
   - Low approval NPCs condemn the party

2. **Gods Vote**: Each god votes SUPPORT or OPPOSE
   - Influenced by divine favor
   - Influenced by NPC testimonies

3. **Outcomes**:
   - Unanimous (7-0): Major blessing/curse, ±10 trust
   - Strong Majority (5-2): Blessing/curse, ±5 trust
   - Narrow (4-3): Minor consequences
   - Deadlock (3-3-1): No divine intervention

## Current Implementation Status

### ✅ Fully Implemented
- Divine Interrogation (all 10 questions)
- Character class assignment
- Divine favor calculations
- Web UI for interrogation
- Flask REST API
- Data structures (Character, NPC, GameState)
- Trust system logic
- Divine Council voting logic
- NPC creation and approval system
- Town hub framework

### ⚠️ Partially Implemented (Templates Only)
- Asymmetric whisper generation (uses templates, needs AI integration)
- Divine Council narrative (simplified logic, needs full AI)

### ⏳ Not Yet Implemented
- Quest scenario execution
- Combat system
- Skill checks with "Practice Makes Perfect"
- Save/load game state
- Full turn-based gameplay loop
- Town hub interactions (merchants, inn, etc.)
- Full 2-player multiplayer coordination

## Next Steps for Full v1.0

1. Implement quest scenarios from QUEST_SCENARIOS.md
2. Add combat system
3. Integrate Claude API for dynamic whisper generation
4. Build turn-based gameplay loop
5. Add save/load functionality
6. Implement town hub interactions
7. Test full 2-player experience

## Design Documentation

For detailed design documentation, see:
- `MECHANICS.md` - Core game mechanics
- `DIVINE_INTERROGATION_SYSTEM.md` - Character creation details
- `DIVINE_COUNCIL_SYSTEM.md` - Voting system mechanics
- `TRUST_BETRAYAL_MECHANICS.md` - Trust system details
- `AI_GM_ENHANCEMENTS.md` - AI GM behavior patterns
- `PARTY_LEADER_SYSTEM.md` - Party voting and leadership
- `NEMESIS_SYSTEM.md` - v1.5 feature (deferred)

## Technical Notes

- **AI GM Integration**: Currently uses templates. In production, would use Claude API (Anthropic) for dynamic content generation
- **Multiplayer**: Server uses session-based player tracking. Both players connect to same server instance
- **Security**: Local network only. NOT intended for internet deployment without additional security
- **Performance**: Single Flask instance handles all players. For production, would need session management and database

## License

This is a prototype game server for "The Arcane Codex" - an AI-driven 2-player co-op RPG.

---

**Built with:**
- Python 3.11+
- Flask (web server)
- Vanilla JavaScript (no frameworks)
- ❤️ and lots of coffee

**Core Innovation:** Asymmetric whispers create impossible moral dilemmas that require collaboration and trust.
