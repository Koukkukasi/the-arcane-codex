# How to Play The Arcane Codex - Complete Guide

**Web/Mobile Multiplayer RPG (1-4 players)**
**Uses your €200 Claude Max plan via MCP - NO API key needed!**

---

## Quick Start (5 Minutes)

### Step 1: Start the Game Server

```bash
cd C:\Users\ilmiv\ProjectArgent\complete_game
python web_game.py
```

You'll see:
```
===============================================================
         THE ARCANE CODEX - WEB GAME
===============================================================

Starting web server...

Open your browser to: http://localhost:5000

FEATURES:
- Multiplayer sessions (1-4 players)
- Divine Interrogation character creation
- Dynamic MCP-powered scenarios (placeholder ready)
- Asymmetric whispers (class-specific secrets)
...
===============================================================
```

Server is running at: **http://localhost:5000**

### Step 2: Open in Browser

**On your computer:**
- Open: http://localhost:5000

**On phone/tablet (same WiFi):**
1. Find your computer's IP:
   ```bash
   ipconfig
   ```
   Look for "IPv4 Address": **192.168.X.X**

2. Open on phone: **http://192.168.X.X:5000**

---

## Game Flow

### Phase 1: Create/Join Game

**Player 1 (Host):**
1. Click **"Create Game"**
2. Enter your name
3. You'll get a **6-character game code** (e.g., "ABC123")
4. Share this code with friends

**Players 2-4:**
1. Click **"Join Game"**
2. Enter the game code
3. Enter your name
4. Click **"Join"**

You'll see all players in the lobby.

### Phase 2: Divine Interrogation (Character Creation)

Each player completes **10 questions** from the gods:

**Questions look like:**
```
VALDRIS (God of Order) asks:

"You witness a thief steal bread to feed their starving family.
What do you do?"

A) Report them to the guards (Law must be upheld)
B) Pay for the bread yourself (Compassionate solution)
C) Teach them to fish (Long-term solution)
```

**How it works:**
- Each player sees questions in **different order** (randomized)
- Answers affect **divine favor** with each god
- After 10 questions, your **character class** is assigned:
  - **Fighter** - Favored by Valdris (Order) and Korvan (War)
  - **Mage** - Favored by Athena (Wisdom) and Kaitha (Chaos)
  - **Thief** - Favored by Mercus (Commerce) and Drakmor (Darkness)
  - **Cleric** - Favored by Sylara (Nature) and Morvane (Death)

**Progress:**
- You'll see: "Question 3/10"
- Can't go back to change answers
- Wait for all players to finish before game starts

### Phase 3: Game Start

Once all players finish Divine Interrogation:
- **Party Trust** starts at 50/100
- **NPCs** join your party (Grimsby, Renna)
- Game begins!

### Phase 4: Scenarios

#### Generating a Scenario

Click **"Generate Scenario"** button.

**Two modes:**

**Mode 1: MCP (Claude Desktop) - Recommended**
- If MCP is configured (see MCP_SETUP.md)
- Game → MCP Server → Claude Desktop → Dynamic scenario generated
- Uses your €200 Max plan
- Every scenario is unique
- Takes 5-10 seconds

**Mode 2: Mock Scenarios - Fallback**
- If MCP not configured
- Game uses 3 pre-written scenarios
- Still randomized to avoid repetition
- Instant generation

#### Viewing a Scenario

**Public Scene** (everyone sees):
```
You enter the abandoned warehouse. Moonlight filters through broken windows.

Grimsby points to a locked door. "My daughter's in there..."

What do you do?
```

**YOUR Secret Whisper** (only you see):
```
┌─────────────────────────────────────┐
│ 🔒 YOUR SECRET (Mage)              │
│                                     │
│ You sense illusion magic emanating  │
│ from behind the door. Something     │
│ about that crying voice isn't       │
│ natural.                            │
│                                     │
│ (Share this... or don't!)          │
└─────────────────────────────────────┘
```

**Other players see DIFFERENT whispers:**
- **Fighter**: "Your combat instincts scream DANGER..."
- **Thief**: "You spot tripwires around the doorframe..."
- **Cleric**: "You feel divine unease. The gods do NOT want you opening that door..."

### Phase 5: Making Choices

1. Read the public scene
2. Read YOUR secret whisper
3. **Decide: Share your info or keep it secret?**
4. Discuss with other players (or lie to them!)
5. Enter your choice in the text box
6. Click **"Submit Choice"**

**Waiting:**
- You'll see: "Waiting for 2 players..."
- Shows who hasn't chosen yet
- Can't change your choice once submitted

### Phase 6: Resolution

Once all players submit choices:
1. Click **"Resolve Turn"**
2. Game processes all choices
3. **Outcome narration** appears
4. **Party Trust changes** (±5 to ±10)
5. **NPC approval changes**
6. **Divine Council votes** (gods approve/disapprove)

**Example Outcome:**
```
OUTCOME:

You break down the door. AMBUSH!

Grimsby rushes in anyway. It WAS a trap - his daughter
was never here.

The Fighter spotted the danger but didn't share.
The Mage sensed illusion but stayed quiet.

Party Trust: -10 (now 40/100)
Grimsby Approval: -15 (now 30/100) - ANGRY at deception

VALDRIS disapproves (lack of honesty)
KAITHA approves (chaos and deception)
```

### Phase 7: Continue

1. Click **"Generate Next Scenario"**
2. Repeat Phases 4-6
3. Story evolves based on trust, NPC approval, divine favor

---

## Key Mechanics

### Party Trust (0-100)

**Visual:**
```
Party Trust: [====------] 65/100
```

**Affects:**
- **High (70-100)**: NPCs help, better outcomes, gods favor you
- **Medium (30-69)**: Normal gameplay
- **Low (0-29)**: NPCs may betray, gods judge harshly

**Changes when:**
- ✅ Players share whispers honestly: +5 to +10
- ✅ Choices align: +5
- ❌ Players lie or hide info: -5 to -10
- ❌ Choices conflict: -5

### Asymmetric Whispers

**The Core Innovation:**

Each class gets DIFFERENT secret information about the SAME situation:

| Class | Sees |
|-------|------|
| **Fighter** | Tactical threats, combat readiness, guard positions |
| **Mage** | Magic auras, illusions, curses, arcane symbols |
| **Thief** | Lies, hidden motives, secret passages, traps |
| **Cleric** | Divine judgment, moral implications, soul status |

**Strategy:**
- Share info → Build trust → Better outcomes
- Hide info → Keep advantage → Risk betrayal
- Lie about whisper → Manipulate party → Lower trust

### NPC Approval

**NPCs in your party:**
- **Grimsby** (Gruff Mercenary) - Approval starts at 50
- **Renna** (Cunning Thief) - Approval starts at 50

**Fatal Flaws:**
- **IMPULSIVE**: Acts without thinking when approval < 30
- **COWARDLY**: Abandons party in danger when approval < 30
- **GREEDY**: Steals from party when approval < 30
- **VENGEFUL**: Attacks party when approval < 20

**Grimsby's Fatal Flaw:** IMPULSIVE
**Renna's Fatal Flaw:** GREEDY

### Divine Council

After major choices, gods vote:

```
DIVINE COUNCIL VOTES:

✓ VALDRIS (Order) - Approves (+5 favor)
✗ KAITHA (Chaos) - Disapproves (-5 favor)
✓ MORVANE (Death) - Neutral (0)
✓ SYLARA (Nature) - Approves (+5 favor)
...
```

**Affects:**
- Future scenarios (gods with high favor help you)
- Ending (which gods judge you favorably)
- Divine intervention (rare, at critical moments)

---

## MCP vs Mock Scenarios

### MCP Mode (Recommended)

**Setup:** See MCP_SETUP.md or START_GAME.md

**How it works:**
1. Game gathers state (trust, NPCs, classes, previous themes)
2. Calls MCP server
3. MCP formats request for Claude Desktop
4. Claude Desktop (your €200 Max) generates unique scenario
5. MCP returns structured JSON
6. Game displays scenario

**Advantages:**
- ✅ Every scenario is unique
- ✅ Never repeats
- ✅ Responds to your specific game state
- ✅ Adapts to player choices
- ✅ NO additional cost (uses €200 Max)

**Requirements:**
- Claude Desktop installed
- MCP configured (5-minute setup)
- MCP server running

### Mock Mode (Fallback)

**How it works:**
1. Game picks from 3 pre-written scenarios
2. Randomizes theme to avoid immediate repetition
3. Assigns class-specific whispers
4. Returns instantly

**Advantages:**
- ✅ Works immediately (no setup)
- ✅ Good for testing game flow
- ✅ Instant generation

**Limitations:**
- ❌ Only 3 scenarios (will repeat after a while)
- ❌ Doesn't adapt to specific game state
- ❌ Not truly unique

**When to use:**
- Testing the game before MCP setup
- Demonstrating game mechanics
- Offline play

---

## Multiplayer Tips

### 1-4 Players

**1 Player (Solo):**
- Still get whispers
- Make all decisions alone
- Good for learning mechanics

**2 Players (Recommended):**
- Core asymmetric experience
- Each player has secret info
- Must decide: cooperate or compete?

**3 Players:**
- More complex coordination
- Triple information asymmetry
- Harder to align choices

**4 Players (Maximum):**
- Maximum chaos
- Four different perspectives
- Very difficult to achieve consensus

### Communication Strategies

**High Trust Strategy:**
- Share all whispers openly
- Discuss choices before submitting
- Align on single approach
- Result: +trust, NPCs loyal, gods approve

**Low Trust Strategy:**
- Keep whispers secret
- Lie about what you know
- Submit conflicting choices
- Result: -trust, NPCs betray, gods judge

**Mixed Strategy:**
- Share some info, hide some
- Selectively honest
- Balance risk/reward

---

## Troubleshooting

### "Server won't start"

**Check Python:**
```bash
python --version
```
Should be Python 3.8+

**Install dependencies:**
```bash
pip install flask flask-cors python-dotenv mcp
```

**Check port 5000:**
```bash
netstat -an | findstr :5000
```
If in use, kill process or change port in web_game.py

### "Can't connect from phone"

1. **Same WiFi**: Both devices must be on same network
2. **Firewall**: Windows Firewall may block port 5000
   - Allow Python through firewall
3. **Correct IP**: Double-check `ipconfig` output
4. **Format**: Use http://192.168.X.X:5000 (not https)

### "MCP not working"

**Check MCP setup:**
1. Claude Desktop installed?
2. Config file at `%APPDATA%\Claude\claude_desktop_config.json`?
3. MCP server path correct in config?
4. Claude Desktop restarted after config?

**Fallback:**
Game will automatically use mock scenarios if MCP unavailable.

### "Scenarios repeating"

**Mock mode:** Only 3 scenarios, will repeat
**Solution:** Set up MCP for infinite unique scenarios

**MCP mode:** Shouldn't repeat (tracks previous themes)
**If repeating:** Check MCP connection, may have fallen back to mock

### "Divine Interrogation stuck"

**Symptoms:** Can't proceed past question 5/10

**Causes:**
1. JavaScript error (check browser console - F12)
2. API endpoint failed
3. Session lost

**Fix:**
1. Refresh page
2. Rejoin game with same game code
3. Restart from interrogation

### "Trust not updating"

**Check:**
1. All players submitted choices?
2. Turn resolved?
3. Check game state: GET /api/game_state

**If stuck:**
1. Generate new scenario
2. Restart game session

---

## API Endpoints (For Testing)

You can test endpoints directly:

### Create Game
```bash
curl -X POST http://localhost:5000/api/create_game \
  -H "Content-Type: application/json" \
  -d '{"player_name": "Alice"}'
```

### Join Game
```bash
curl -X POST http://localhost:5000/api/join_game \
  -H "Content-Type: application/json" \
  -d '{"game_code": "ABC123", "player_name": "Bob"}'
```

### Get Session Info
```bash
curl http://localhost:5000/api/session_info
```

### Generate Scenario
```bash
curl -X POST http://localhost:5000/api/generate_scenario
```

### Get Current Scenario
```bash
curl http://localhost:5000/api/current_scenario
```

### Get Your Whisper
```bash
curl http://localhost:5000/api/my_whisper
```

### Submit Choice
```bash
curl -X POST http://localhost:5000/api/make_choice \
  -H "Content-Type: application/json" \
  -d '{"choice": "I break down the door"}'
```

### Resolve Turn
```bash
curl -X POST http://localhost:5000/api/resolve_turn
```

---

## Game Session Example

**Full playthrough for 2 players:**

```
1. Alice creates game → Gets code "XYZ789"
2. Bob joins with code "XYZ789"
3. Both complete Divine Interrogation (10 questions each)
   - Alice becomes Fighter
   - Bob becomes Mage
4. Game starts, trust = 50
5. Alice clicks "Generate Scenario"
   - Public: Warehouse trap scenario
   - Alice's whisper: "Combat instincts scream DANGER"
   - Bob's whisper: "You sense illusion magic"
6. Alice shares her whisper with Bob
7. Bob shares his whisper with Alice
8. They decide together: "Don't open the door"
9. Both submit choice: "Search for another entrance"
10. Click "Resolve Turn"
    - Outcome: "You find Grimsby's daughter through side door"
    - Trust: +10 (now 60) - teamwork rewarded
    - Grimsby approval: +15 - grateful
11. Generate next scenario
12. Repeat...
```

---

## Next Steps

1. **Start playing** - Follow Quick Start above
2. **Set up MCP** - See MCP_SETUP.md for dynamic scenarios
3. **Invite friends** - Share game code for multiplayer
4. **Explore mechanics** - Try different trust strategies

**Have fun in The Arcane Codex!** 🎲✨
