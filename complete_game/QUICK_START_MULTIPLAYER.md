# The Arcane Codex - Multiplayer Quick Start

## 🎮 How to Play (1-4 Players)

### Step 1: Start the Server

**Windows:**
```bash
START_MULTIPLAYER.bat
```

**Mac/Linux:**
```bash
python web_game.py
```

Server starts on **http://localhost:5000**

### Step 2: Create a Game

1. Open browser to http://localhost:5000
2. Enter username
3. Click "CREATE NEW GAME"
4. Share the 6-character game code with friends

### Step 3: Join the Game

**Other players:**
1. Open http://localhost:5000
2. Enter username
3. Enter game code
4. Click "JOIN GAME"

### Step 4: Character Creation (Divine Interrogation)

Each player answers 10 AI-generated questions. Your answers determine:
- Character class (Fighter, Mage, Thief, Cleric, Ranger, Bard)
- Divine favor with 7 gods
- Starting abilities

**Gods:**
- ⚖️ **VALDRIS** - Order & Law
- 🔥 **KAITHA** - Chaos & Freedom
- 💀 **MORVANE** - Death & Survival
- 🌿 **SYLARA** - Nature & Healing
- ⚔️ **KORVAN** - War & Honor
- 📚 **ATHENA** - Wisdom & Knowledge
- 💰 **MERCUS** - Commerce & Wealth

### Step 5: Play the Adventure

**What You See:**
- **Public Scene:** What everyone sees
- **Your Whisper:** Class-specific secret information (ONLY YOU SEE THIS)

**Sensory Details:**
- 👁️ **Visual:** What you see
- 👂 **Audio:** What you hear
- 👃 **Smell:** What you smell
- ✋ **Touch:** What you feel
- 🔮 **Supernatural:** Magic, divine, otherworldly

**How to Play:**
1. Read the public scene
2. Read YOUR whisper (keep it secret or share it)
3. Discuss with party in planning channel
4. Submit your action
5. Wait for all players to choose
6. AI GM resolves the turn

### Step 6: Asymmetric Information

**The Diamond Innovation:**

Each class sees DIFFERENT information about the SAME situation.

**Example:**
- **Fighter:** "These guards are professionals in disguise - this is a trap"
- **Mage:** "You sense dark magic in the cargo - it's cursed"
- **Thief:** "You recognize the merchant's tattoo - he's a criminal"
- **Cleric:** "The cargo contains a cursed artifact that will kill hundreds"

**You MUST share whispers to understand the full picture!**

---

## 🎯 Game Features

### Real-Time Multiplayer
- Socket.IO for instant updates
- See when other players join/ready/choose
- Live trust meter
- Real-time turn resolution

### AI Game Master (Claude Desktop)
- 100% dynamic scenarios (no hardcoded content)
- Uses your €200 Claude Max plan via MCP
- Responds to creative player actions
- Generates unique scenarios every turn

### Visual Enhancements
- Emoji-coded narration (🌅 🗣️ ⚔️ 🔮 💎)
- Color-coded UI
- Progress bars
- Skill check visualization
- CRT screen effects (retro terminal look)

### Party Dynamics
- **Trust Meter:** 0-100, affects outcomes
- **NPC Companions:** Can help, betray, or die
- **Divine Council:** Gods vote on your choices
- **Approval Ratings:** NPCs remember your actions

---

## 🔧 Technical Requirements

### Required
- **Python 3.8+**
- **Claude Desktop** (with €200 Max plan)
- **MCP configured** (see MCP_SETUP.md)

### Dependencies (auto-installed)
- Flask + Flask-SocketIO
- Flask-CORS
- anthropic (for MCP)
- eventlet

---

## 🐛 Troubleshooting

### "MCP client not available"
- Make sure Claude Desktop is running
- Check MCP_SETUP.md for configuration
- Verify MCP server is installed

### "Failed to generate scenario"
- Check Claude Desktop is open
- Check internet connection
- See MCP_SETUP.md troubleshooting

### Players not seeing updates
- Check Socket.IO connection in browser console (F12)
- Refresh the page
- Check firewall isn't blocking connections

### Server won't start
- Check if port 5000 is in use
- Run: `netstat -ano | findstr :5000`
- Kill the process or change port in web_game.py

---

## 📊 Game Flow

```
1. CREATE GAME
   ↓
2. PLAYERS JOIN (1-4)
   ↓
3. DIVINE INTERROGATION (character creation)
   ↓
4. ALL READY → GAME STARTS
   ↓
5. SCENARIO GENERATED (AI)
   ↓
6. WHISPERS DISTRIBUTED (asymmetric)
   ↓
7. PLAYERS DISCUSS + CHOOSE
   ↓
8. ALL SUBMITTED → TURN RESOLVES
   ↓
9. NEXT SCENARIO
   ↓
10. REPEAT until quest complete
```

---

## 🎭 Example Session

**Turn 1: The Warehouse**

**Public Scene (everyone sees):**
> 🌅 Midnight. Rain hammers the warehouse roof.
>
> 🗣️ GRIMSBY (nervous, missing 3 fingers): "The medicine is inside! My daughter needs it! Guards change in 10 minutes!"
>
> ⚔️ Two guards at the front door. Side door slightly ajar.

**Fighter's Whisper:**
> 👁️ Your military training reveals: These guards aren't distracted. Combat-ready stance. This is a TRAP.
>
> ⚠️ Side door = likely ambush point.

**Mage's Whisper:**
> 🔮 You sense dark magic emanating from the crates inside.
>
> 👁️ The "medicine" radiates a curse. If used, 200+ people will die within a week.
>
> 💭 Grimsby genuinely believes the medicine is safe.

**Thief's Whisper:**
> 👁️ You spot Grimsby's guild tattoo under his sleeve. He's part of the Thieves' Guild.
>
> 👂 His story has inconsistencies. Daughter? He's unmarried.

**Cleric's Whisper:**
> 🔮 You sense no life force from the "medicine" crates. Necromancy.
>
> 💭 Three souls are trapped in those boxes, screaming.

**Players must:**
1. Share whispers (or not)
2. Decide: Trust Grimsby? Stop the theft? Steal anyway?
3. Submit actions

**AI GM resolves based on all choices + trust level + divine favor**

---

## 🎯 Win Conditions

There are NO win conditions. This is a narrative game.

**Success is:**
- Interesting story
- Memorable moments
- Tough moral choices
- Party surviving (or not)

**The gods judge you. Not on success, but on your reasoning.**

---

**Ready to play?**

Run `START_MULTIPLAYER.bat` and open http://localhost:5000!
