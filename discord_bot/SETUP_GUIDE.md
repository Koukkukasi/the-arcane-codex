# Discord Bot Setup Guide
**The Arcane Codex - Asymmetric Whisper System**

---

## 🎯 WHAT THIS BOT DOES

**THE INNOVATION:** Each player receives **DIFFERENT private messages** based on their class in the SAME scene.

**Example:**
- **Shared story:** "A Name-Eater entity appears in the mill..."
- **Mage DM:** "You recognize it needs 3 simultaneous strikes to banish..."
- **Fighter DM:** "You spot weak points that solidify briefly during breath cycles..."
- **Thief DM:** "Marcus is lying - you see warning symbols on the package..."
- **Ranger DM:** "The ceiling will collapse in 90 seconds..."

**No one has the full picture. Players MUST communicate in #planning to succeed.**

---

## 📋 PREREQUISITES

1. **Discord Account** (obviously)
2. **Python 3.11+** installed
3. **Claude API Access** (you have €200 max plan)
4. **Discord Server** with admin permissions

---

## 🚀 STEP 1: Create Discord Bot Application

### 1.1 Go to Discord Developer Portal
- Visit: https://discord.com/developers/applications
- Click **"New Application"**
- Name it: **"The Arcane Codex"**
- Click **"Create"**

### 1.2 Create Bot User
- Go to **"Bot"** tab (left sidebar)
- Click **"Add Bot"**
- Click **"Yes, do it!"**

### 1.3 Configure Bot Permissions
- Scroll down to **"Privileged Gateway Intents"**
- ✅ Enable **"Server Members Intent"**
- ✅ Enable **"Message Content Intent"**
- Click **"Save Changes"**

### 1.4 Get Bot Token
- Under **"Token"** section, click **"Reset Token"**
- Click **"Copy"** to copy your bot token
- ⚠️ **KEEP THIS SECRET!** Never share it publicly
- Save it - you'll need it in step 3

### 1.5 Invite Bot to Your Server
- Go to **"OAuth2"** → **"URL Generator"** tab
- **Scopes:** Check ✅ `bot` and ✅ `applications.commands`
- **Bot Permissions:** Check:
  - ✅ Send Messages
  - ✅ Send Messages in Threads
  - ✅ Embed Links
  - ✅ Read Message History
  - ✅ Use Slash Commands
  - ✅ Manage Messages (optional, for cleanup)
- Copy the generated URL at the bottom
- Paste in browser, select your server, authorize

---

## 🔧 STEP 2: Set Up Discord Server

### 2.1 Create Channels
Create these text channels in your server:

**#story** - Where the AI GM posts narration (everyone can see)
**#planning** - Where players coordinate (bot doesn't read this!)
**#character-creation** - For `/join` commands

### 2.2 Channel Permissions (Important!)
For **#planning**:
- Make sure the bot CANNOT read this channel
- This is where players share their whispers and strategize

For **#story**:
- Bot needs read + write permissions
- This is the public narrative

---

## 💻 STEP 3: Install and Configure Bot

### 3.1 Install Dependencies
```bash
cd C:\Users\ilmiv\ProjectArgent\discord_bot
pip install -r requirements.txt
```

### 3.2 Configure API Keys
Edit `config.json`:

```json
{
  "DISCORD_BOT_TOKEN": "YOUR_BOT_TOKEN_FROM_STEP_1.4",
  "CLAUDE_API_KEY": "YOUR_CLAUDE_API_KEY"
}
```

**Getting Claude API Key:**
Since you have the €200 max plan (not API plan), you'll need to:
1. Go to https://console.anthropic.com/
2. Check if you can generate API keys from your plan
3. If not, you might need to add API credits separately

⚠️ **Alternative:** If you can't get an API key with max plan, we can modify the bot to work differently (let me know!)

---

## ▶️ STEP 4: Run the Bot

### 4.1 Start Bot
```bash
python bot.py
```

You should see:
```
🎮 Starting The Arcane Codex Discord Bot...
============================================================
🎮 THE ARCANE CODEX - Discord Bot Online
============================================================
Logged in as: The Arcane Codex
Bot ID: 123456789...
Servers: 1
============================================================
✅ Synced 5 slash commands
```

### 4.2 Test Bot is Online
In Discord, type `/` in any channel - you should see The Arcane Codex commands appear!

---

## 🎮 STEP 5: Play the Game!

### 5.1 Setup Game
In any channel (admin only):
```
/setup story_channel:#story planning_channel:#planning
```

### 5.2 Create Characters
Each player runs:
```
/join character_class:Mage character_name:Kaelen
/join character_class:Fighter character_name:Thorin
/join character_class:Thief character_name:Renna
```

### 5.3 Test Asymmetric Whispers! (The Magic Moment)
```
/test_whispers
```

**What happens:**
1. Bot posts the mill scene in #story (everyone sees)
2. Bot sends DIFFERENT DMs to each player based on their class
3. Players check their DMs
4. Players share info in #planning
5. Players realize they each have puzzle pieces!

### 5.4 Compare Whispers
Each player reads their DM, then in #planning:
- **Mage:** "My whisper says it needs 3 simultaneous strikes!"
- **Fighter:** "Mine shows the weak points and timing!"
- **Thief:** "Guys... Marcus is LYING. I can see warning symbols."
- **Ranger:** "We have 90 seconds before ceiling collapse!"

**BOOM - You've validated the core innovation!** 💎

---

## 🔍 TESTING CHECKLIST

### Phase 1: Bot Basics
- [ ] Bot shows as online in Discord
- [ ] Slash commands appear when typing `/`
- [ ] `/setup` command works
- [ ] `/join` command creates characters
- [ ] `/party` shows party roster

### Phase 2: Asymmetric Whispers (THE CRITICAL TEST)
- [ ] `/test_whispers` sends DMs to all players
- [ ] Each player receives DIFFERENT information
- [ ] Mage gets arcane knowledge
- [ ] Fighter gets tactical info
- [ ] Thief gets deception detection
- [ ] Information is specific and actionable
- [ ] Players can combine info to find solutions

### Phase 3: Collaboration
- [ ] Players share whispers in #planning
- [ ] Players discover they have different pieces
- [ ] Players formulate coordinated plan
- [ ] Everyone feels their class matters

---

## 🐛 TROUBLESHOOTING

### "Bot won't start"
- Check `config.json` has valid tokens
- Ensure Python 3.11+ installed: `python --version`
- Try: `pip install --upgrade discord.py anthropic`

### "Slash commands don't appear"
- Wait 5 minutes (Discord caches commands)
- Try in a different channel
- Kick and re-invite bot with correct permissions

### "Bot can't send DMs"
- User must have DMs enabled from server members
- Go to Server Settings → Privacy → Allow DMs from server members

### "Claude API errors"
- Check if your max plan includes API access
- Verify API key is correct in `config.json`
- Check https://console.anthropic.com/ for usage limits

### "Whispers are too generic"
- This is a prompt tuning issue
- Edit `WHISPER_TEMPLATES` in `bot.py`
- Make prompts more specific: "What EXACT weak point..." instead of "What does the Mage notice..."

---

## 📊 SUCCESS METRICS

**You've validated the concept if:**

✅ All players receive whispers simultaneously
✅ Each whisper contains DIFFERENT information
✅ Players say "Wait, what did YOUR whisper say?"
✅ Players realize they need to share info to solve puzzle
✅ At least 2 different solutions emerge from combining whispers
✅ Players feel their class is essential (not redundant)

**If even ONE person says:**
> "Oh wow, I had the solution but needed your info to know when to do it!"

**YOU'VE CREATED SOMETHING NEW.** 💎

---

## 🎯 NEXT STEPS AFTER VALIDATION

### If whispers work:
1. Add full AI GM integration (call Claude for main narration)
2. Implement `/action` command with skill checks
3. Add character creation flow
4. Build quest state tracking
5. Invite 2-3 friends for real playtest

### If whispers feel generic:
1. Refine whisper prompts (iterate on `WHISPER_TEMPLATES`)
2. Add examples to Claude prompts
3. Test with more dramatic scenes
4. Add "minimum specificity" requirement

---

## 💡 DESIGN NOTES

**Why this works:**

1. **Information Asymmetry** = Natural player communication
2. **Class Identity** = Every player feels special
3. **Puzzle Pieces** = Discovery happens through collaboration
4. **Mobile Native** = Discord DMs work on phones (always-on engagement)
5. **Async Ready** = Players can share whispers while apart

**This is transmedia before you even add WhatsApp/voice.**

The game is happening in:
- #story (shared reality)
- DMs (private knowledge)
- #planning (player coordination)
- Real life (texting about whispers)

---

## 🚨 SECURITY NOTES

**NEVER commit `config.json` to git!**

Add to `.gitignore`:
```
config.json
__pycache__/
*.pyc
```

**Regenerate tokens if exposed:**
- Discord: Developer Portal → Bot → Regenerate Token
- Claude: console.anthropic.com → Delete key, create new one

---

**Ready to test?** Run `python bot.py` and use `/test_whispers`!

Let me know if you hit any issues - I'll debug with you! 🎮
