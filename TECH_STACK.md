# TECH_STACK.md
**Project Argent: The Arcane Codex**
**Technical Implementation Guide**
**Current Version:** v0.1-prototype
**Last Updated:** 2025-10-30

---

## 📋 Overview

This document outlines the complete technical architecture for the prototype phase. The focus is on **simplicity and speed**—we're testing if the AI DM is entertaining, not building a scalable production system yet.

**Philosophy:** Start simple, prove the concept, then add complexity.

---

## ✅ v0.1: Prototype Stack (CURRENT)

### Architecture Summary

```
┌─────────────────────────────────────────┐
│         DISCORD (User Interface)        │
│  #story, #planning, #status channels   │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│      PYTHON BOT (discord.py)           │
│  - Command handlers (/action, /status) │
│  - Event listeners (messages)           │
│  - Game state management                │
└──────────────────┬──────────────────────┘
                   │
         ┌─────────┴──────────┐
         ▼                    ▼
┌──────────────────┐   ┌──────────────────┐
│  CLAUDE API      │   │   JSON FILE      │
│  (Anthropic)     │   │ (game_state.json)│
│  - Story gen     │   │ - Player stats   │
│  - Choices       │   │ - Inventory      │
│  - NPCs          │   │ - World flags    │
└──────────────────┘   └──────────────────┘
```

**Key Decision:** Single Claude instance, no background workers, no database. Everything is synchronous and simple.

---

## 🐍 Core Technology Choices

### 1. Python 3.11+

**Why Python:**
- ✅ Excellent AI/ML library ecosystem
- ✅ discord.py is mature and well-documented
- ✅ Anthropic Claude SDK is native Python
- ✅ Fast prototyping (we need speed over optimization)
- ✅ Easy to read/maintain for solo developer

**Installation:**
```bash
python --version  # Verify 3.11+
```

### 2. discord.py (v2.3+)

**Why discord.py:**
- ✅ Full Discord Bot API support
- ✅ Async/await native (perfect for bot commands)
- ✅ Built-in DM (Direct Message) support for whispers
- ✅ Presence tracking (online/offline status)
- ✅ Extensive documentation and community

**Installation:**
```bash
pip install discord.py==2.3.2
```

**Key Features We Use:**
- Commands (slash commands via `@bot.command()`)
- DMs for private whispers
- Channel permissions
- Embeds for formatted output
- Presence updates for async play tracking

### 3. Anthropic Claude API (Claude Sonnet 4)

**Why Claude:**
- ✅ Excellent at creative writing and storytelling
- ✅ Structured output support (JSON mode)
- ✅ Large context window (200K tokens)
- ✅ Strong instruction following
- ✅ Tool use capability (for future expansion)

**API Choice:**
```python
# Model: claude-sonnet-4-20250514
# Cost: ~$3 per million input tokens, $15 per million output
# For prototype: ~$0.01-0.02 per player action
```

**Installation:**
```bash
pip install anthropic==0.25.0
```

### 4. JSON File Storage (Simple Persistence)

**Why NOT a database for prototype:**
- ❌ Firebase/PostgreSQL is overkill for 3-4 test players
- ❌ Adds setup complexity
- ❌ Slows iteration speed
- ✅ JSON file is human-readable (easy debugging)
- ✅ Can migrate to database later without changing logic

**File Structure:**
```
ProjectArgent/
├── bot.py                 # Main bot application
├── game_state.json        # All game data (auto-generated)
├── prompts.py            # Claude system prompts
├── mechanics.py          # Skill check, combat logic
└── config.json           # API keys, settings
```

---

## 📁 Project Structure (Detailed)

### File Organization

```
ProjectArgent/
│
├── bot.py                    # Main entry point
│   ├── Discord bot initialization
│   ├── Command handlers (/action, /status, /rest)
│   └── Event listeners (on_message, on_ready)
│
├── game_state.json           # Persistent game data
│   └── Auto-saved after every action
│
├── mechanics.py              # Game logic
│   ├── skill_check(player_skill, difficulty)
│   ├── calculate_damage(skill, base_damage)
│   ├── apply_status_effect(player, effect)
│   └── update_skills(player, skill_name, difficulty)
│
├── prompts.py                # Claude prompts
│   ├── DM_SYSTEM_PROMPT (main personality)
│   ├── build_context(game_state) → formatted prompt
│   └── parse_claude_response(response) → structured data
│
├── claude_client.py          # Claude API wrapper
│   ├── call_claude(prompt, game_state)
│   └── Error handling and retries
│
├── config.json               # Settings (NOT in git)
│   ├── DISCORD_BOT_TOKEN
│   ├── CLAUDE_API_KEY
│   └── CHANNEL_IDS
│
├── utils.py                  # Helper functions
│   ├── save_game_state()
│   ├── load_game_state()
│   └── format_action_choices()
│
└── requirements.txt          # Python dependencies
```

---

## 🔧 Implementation Details

### 1. Discord Bot Setup

**bot.py (Core Structure):**

```python
import discord
from discord.ext import commands
import json
from mechanics import skill_check, calculate_damage
from claude_client import call_claude
from prompts import DM_SYSTEM_PROMPT

# Initialize bot
intents = discord.Intents.default()
intents.message_content = True
intents.presences = True  # For online/offline tracking

bot = commands.Bot(command_prefix="/", intents=intents)

# Load config
with open("config.json", "r") as f:
    config = json.load(f)

STORY_CHANNEL_ID = config["story_channel_id"]
PLANNING_CHANNEL_ID = config["planning_channel_id"]

# Load game state
with open("game_state.json", "r") as f:
    game_state = json.load(f)

@bot.event
async def on_ready():
    print(f"Bot connected as {bot.user}")
    # Post party status to #status channel
    await update_status_channel()

@bot.command()
async def action(ctx, *, action_text: str):
    """
    Main command: /action <description>
    Player describes what they want to do
    """
    player_id = str(ctx.author.id)

    # Get player from game state
    if player_id not in game_state["players"]:
        await ctx.send("You need to create a character first! Use /create")
        return

    player = game_state["players"][player_id]

    # Build prompt for Claude
    prompt = build_action_prompt(player, game_state, action_text)

    # Call Claude
    response = await call_claude(prompt)

    # Parse response
    narration = response["narration"]
    actions = response.get("actions", [])
    state_updates = response.get("state_updates", {})

    # Update game state
    apply_state_updates(player, state_updates)
    save_game_state(game_state)

    # Post to #story channel
    story_channel = bot.get_channel(STORY_CHANNEL_ID)
    await story_channel.send(f"**{player['name']}** {narration}")

    # If actions are presented, show them
    if actions:
        action_text = format_action_choices(actions, player)
        await story_channel.send(action_text)

    # Update status
    await update_status_channel()

@bot.command()
async def status(ctx):
    """Show current player stats"""
    player_id = str(ctx.author.id)
    player = game_state["players"].get(player_id)

    if not player:
        await ctx.send("Character not found!")
        return

    embed = discord.Embed(title=f"{player['name']} - {player['class']}")
    embed.add_field(name="HP", value=f"{player['hp']}/{player['max_hp']}")
    embed.add_field(name="Stamina", value=f"{player['stamina']}/{player['max_stamina']}")
    if player['class'] == "Mage":
        embed.add_field(name="Mana", value=f"{player['mana']}/{player['max_mana']}")

    # Show top skills
    top_skills = sorted(player['skills'].items(), key=lambda x: x[1], reverse=True)[:5]
    skills_text = "\n".join([f"{skill}: {value}" for skill, value in top_skills])
    embed.add_field(name="Top Skills", value=skills_text, inline=False)

    await ctx.send(embed=embed)

@bot.command()
async def rest(ctx, rest_type: str = "camp"):
    """Rest to recover HP/Stamina/Mana"""
    player_id = str(ctx.author.id)
    player = game_state["players"][player_id]

    if rest_type == "camp":
        player['hp'] = min(player['hp'] + int(player['max_hp'] * 0.3), player['max_hp'])
        player['stamina'] = min(player['stamina'] + int(player['max_stamina'] * 0.4), player['max_stamina'])
        if 'mana' in player:
            player['mana'] = min(player['mana'] + int(player['max_mana'] * 0.4), player['max_mana'])

        await ctx.send(f"{player['name']} makes camp and rests for an hour...")

    elif rest_type == "inn":
        player['hp'] = player['max_hp']
        player['stamina'] = player['max_stamina']
        if 'mana' in player:
            player['mana'] = player['max_mana']
        player['status_effects'] = []

        await ctx.send(f"{player['name']} rests at an inn and fully recovers!")

    save_game_state(game_state)

# Run bot
bot.run(config["DISCORD_BOT_TOKEN"])
```

### 2. Claude Integration

**claude_client.py:**

```python
import anthropic
import json
from prompts import DM_SYSTEM_PROMPT

# Initialize client
client = anthropic.Anthropic(api_key=CLAUDE_API_KEY)

async def call_claude(game_state, player_action):
    """
    Call Claude API with game state and player action
    Returns structured response
    """

    # Build context from game state
    context = build_game_context(game_state)

    # Construct message
    user_message = f"""
{context}

Player Action: {player_action}

Generate response in this JSON format:
{{
  "narration": "Descriptive text of what happens",
  "actions": [
    {{
      "id": 1,
      "description": "Action description",
      "skill_required": "perception",
      "difficulty": 25,
      "icon": "🔍"
    }},
    ...
  ],
  "state_updates": {{
    "hp": 45,
    "skills": {{"perception": 23}},
    "inventory": ["torch", "sword"]
  }}
}}
"""

    # Call Claude
    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=2000,
        system=DM_SYSTEM_PROMPT,  # From prompts.py
        messages=[{
            "role": "user",
            "content": user_message
        }]
    )

    # Parse JSON response
    response_text = response.content[0].text
    parsed = json.loads(response_text)

    return parsed

def build_game_context(game_state):
    """Format game state for Claude"""
    player = game_state["players"]["current_player"]

    context = f"""
PLAYER STATE:
Name: {player['name']}
Class: {player['class']}
HP: {player['hp']}/{player['max_hp']}
Stamina: {player['stamina']}/{player['max_stamina']}

SKILLS (top 5):
{format_skills(player['skills'])}

INVENTORY:
{', '.join(player['inventory'])}

STATUS EFFECTS:
{', '.join(player['status_effects']) if player['status_effects'] else 'None'}

LOCATION: {game_state['party']['location']}
QUEST: {game_state['party']['quest']}

RECENT EVENTS:
{format_recent_events(game_state['recent_events'])}
"""
    return context
```

### 3. Game Mechanics

**mechanics.py:**

```python
import random

def skill_check(player_skill, difficulty, favorable=False, unfavorable=False):
    """
    Core skill check system
    Returns (success: bool, roll: int, threshold: int)
    """
    roll = random.randint(1, 100)
    threshold = 50 + ((player_skill - difficulty) / 2)

    # Apply conditions
    if favorable:
        threshold += 15
    if unfavorable:
        threshold -= 15

    # Critical success/failure
    if roll <= 5:
        return (True, roll, threshold, "critical_success")
    elif roll >= 96:
        return (False, roll, threshold, "critical_failure")

    success = roll <= threshold
    return (success, roll, threshold, "normal")

def calculate_skill_gain(difficulty, player_skill):
    """How much skill improves on success"""
    if difficulty > player_skill + 20:
        return 3  # Hard challenge
    elif difficulty > player_skill:
        return 2  # Moderate challenge
    else:
        return 1  # Easy challenge

def calculate_damage(skill, base_damage=10):
    """Calculate combat damage"""
    skill_bonus = skill / 10
    return int(base_damage + skill_bonus)

def apply_status_effect(player, effect):
    """Add status effect to player"""
    if effect not in player['status_effects']:
        player['status_effects'].append(effect)

def process_status_effects(player):
    """Process ongoing status effects"""
    effects_to_remove = []

    for effect in player['status_effects']:
        if effect.startswith('poisoned'):
            player['hp'] -= 5
            # Decrement duration
            # ... (implement duration tracking)

    # Remove expired effects
    player['status_effects'] = [e for e in player['status_effects']
                                if e not in effects_to_remove]
```

### 4. Game State Structure

**game_state.json:**

```json
{
  "party": {
    "name": "The Crimson Blades",
    "location": "Guildmaster's Office",
    "quest": "Find the Missing Caravan",
    "quest_timer": "8h 0m",
    "shared_inventory": ["rope", "map"],
    "gold": 50
  },
  "players": {
    "123456789": {
      "discord_id": "123456789",
      "name": "Kaelen",
      "class": "Mage",
      "hp": 60,
      "max_hp": 60,
      "stamina": 60,
      "max_stamina": 60,
      "mana": 100,
      "max_mana": 100,
      "skills": {
        "arcana": 25,
        "research": 20,
        "perception": 18,
        "strength": 10,
        "lockpicking": 10
      },
      "inventory": ["staff", "health_potion", "torch"],
      "status_effects": [],
      "momentum": 0
    }
  },
  "world": {
    "time": "Evening",
    "weather": "Overcast",
    "flags": {
      "met_guildmaster": true,
      "caravan_found": false,
      "warehouse_searched": false
    }
  },
  "recent_events": [
    "Party accepted quest from Guildmaster Thorne",
    "Guildmaster revealed his nephew lost the shipment",
    "Party is investigating the last known location"
  ]
}
```

---

## 🔐 Configuration & Security

### config.json (Template)

```json
{
  "DISCORD_BOT_TOKEN": "YOUR_DISCORD_BOT_TOKEN_HERE",
  "CLAUDE_API_KEY": "YOUR_CLAUDE_API_KEY_HERE",
  "story_channel_id": 123456789,
  "planning_channel_id": 123456790,
  "status_channel_id": 123456791
}
```

**IMPORTANT: Add config.json to .gitignore!**

```
# .gitignore
config.json
game_state.json
__pycache__/
*.pyc
venv/
```

---

## 📊 Cost Estimates (Prototype)

### Claude API Costs

**Model:** Claude Sonnet 4
- Input: $3 per 1M tokens
- Output: $15 per 1M tokens

**Per Action Estimate:**
- Input: ~2000 tokens (game state + prompt)
- Output: ~500 tokens (narration + choices)
- Cost: $0.006 + $0.0075 = **~$0.01 per action**

**For Prototype (50 actions):** ~$0.50 total

### Discord Bot Costs

**Free tier:** Unlimited for small bots (<100 servers)

### Hosting Costs

**For prototype:** $0 (run locally on your machine)

**Total Prototype Cost:** <$1

---

## 🚀 Setup Instructions

### 1. Create Discord Bot

1. Go to https://discord.com/developers/applications
2. Click "New Application"
3. Go to "Bot" tab → "Add Bot"
4. Enable these intents:
   - Message Content Intent
   - Presence Intent
   - Server Members Intent
5. Copy bot token → save to config.json
6. Go to OAuth2 → URL Generator:
   - Scopes: `bot`
   - Permissions: `Send Messages`, `Read Messages`, `Manage Channels`
7. Use generated URL to invite bot to your test server

### 2. Create Discord Channels

In your test server, create:
- `#story` - Public narrative
- `#planning` - Player coordination (bot doesn't read this)
- `#status` - Auto-updating party status

Get channel IDs (enable Developer Mode → right-click channel → Copy ID)

### 3. Get Claude API Key

1. Go to https://console.anthropic.com/
2. Create account (credit card required, but $5 free credit)
3. Go to "API Keys" → "Create Key"
4. Copy key → save to config.json

### 4. Install Dependencies

```bash
# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Mac/Linux)
source venv/bin/activate

# Install packages
pip install discord.py==2.3.2
pip install anthropic==0.25.0

# Save dependencies
pip freeze > requirements.txt
```

### 5. Run Bot

```bash
python bot.py
```

**You should see:**
```
Bot connected as YourBot#1234
Logged in to 1 guilds
```

### 6. Test Commands

In Discord #story channel:
```
/action I look around the room
```

Bot should respond with narration and action choices!

---

## 🧪 Development Workflow

### Testing Cycle

1. **Make code change** in bot.py or mechanics.py
2. **Restart bot** (Ctrl+C, then `python bot.py`)
3. **Test in Discord** with `/action` commands
4. **Check logs** for errors
5. **Iterate**

### Debugging Tips

**Add logging:**
```python
import logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# In your code
logger.info(f"Player action: {action_text}")
logger.error(f"Claude API error: {e}")
```

**Check game state:**
```python
import json
print(json.dumps(game_state, indent=2))
```

**Test Claude responses locally:**
```python
# test_claude.py
from claude_client import call_claude

response = call_claude(test_game_state, "I search the room")
print(response)
```

---

## ⚠️ Known Limitations (v0.1)

**Prototype Shortcuts:**
- ❌ No database (JSON file resets if corrupted)
- ❌ No error recovery (bot crash = restart manually)
- ❌ No rate limiting (could hit API limits if spamming)
- ❌ No user authentication (anyone in server can play)
- ❌ Single party only (can't handle multiple groups)
- ❌ No backup/restore system

**These are ACCEPTABLE for prototype.** Focus is on validating the AI DM, not production readiness.

---

## 📋 Future: MVP Tech Stack (v0.2+)

When prototype succeeds, upgrade to:

```
Discord Bot (same)
    ↓
Python Backend (same)
    ↓
Cloud Firestore (replaces JSON)
    ↓
Firebase Cloud Functions (for async events)
    ↓
Twilio API (for WhatsApp/SMS)
```

**But NOT until prototype proves the concept!**

---

## 📝 Changelog

### v0.1-prototype (2025-10-30)
- Python + discord.py + Claude API stack chosen
- JSON file storage for simplicity
- Single-server, single-party architecture
- Synchronous bot (no background workers)
- Local hosting (no cloud deployment)
- Manual channel setup
- Cost estimate: <$1 for prototype

---

## 🔗 Related Documents
- **MECHANICS.md** - Game rules this tech implements
- **PROMPTS.md** - Claude prompts to use
- **PROTOTYPE_PLAN.md** - Step-by-step build guide
- **VISION.md** - Future tech upgrades

---

**Status:** ✅ Ready for implementation
**Next Step:** Follow PROTOTYPE_PLAN.md to build bot
