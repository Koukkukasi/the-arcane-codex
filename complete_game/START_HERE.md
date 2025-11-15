# 🎮 START HERE - The Arcane Codex

**Everything is ready to test! Choose your mode:**

---

## ⚡ FASTEST: WhatsApp Test (5 minutes)

**No setup needed - just WhatsApp!**

### Step 1: Create WhatsApp Group
- Add 2 players
- Name: "The Arcane Codex Test"

### Step 2: Send First Question
Open `WHATSAPP_GUIDE.md` and copy Question 1:

```
🌩️ VALDRIS speaks:

"You witness a starving mother steal bread from a wealthy baker.
The baker demands her hand as punishment - the law of this land.

What do you do?"

1. Uphold the law. Cut off her hand.
2. She pays double the bread's value.
3. Burn the baker's shop.
4. Negotiate. She works for the baker.
5. Trial by combat.

Reply 1-5:
```

Send this to **Player 1 via PRIVATE MESSAGE**

### Step 3: Follow WHATSAPP_GUIDE.md
- All 10 questions are there
- Divine favor tracking
- Class assignment
- Asymmetric whisper templates
- Divine Council format

**Done! Start playing!**

---

## 🤖 AUTOMATED: Discord Bot (10 minutes setup)

**Fully automated - bot handles everything!**

### Step 1: Install Dependencies
```bash
cd complete_game
pip install -r requirements.txt
```

### Step 2: Create Discord Bot
1. Go to: https://discord.com/developers/applications
2. Click "New Application" → Name: "The Arcane Codex"
3. Go to "Bot" → "Add Bot"
4. Copy the TOKEN (keep safe!)
5. Enable "Message Content Intent"
6. Go to OAuth2 → URL Generator:
   - Scopes: `bot`
   - Permissions: Send Messages, Read Messages, Embed Links
7. Copy URL → Invite to your server

### Step 3: Run Bot

**Windows:**
```bash
run_discord.bat YOUR_BOT_TOKEN
```

**Mac/Linux:**
```bash
chmod +x run_discord.sh
./run_discord.sh YOUR_BOT_TOKEN
```

**Or use environment variable:**
```bash
# Windows
set DISCORD_BOT_TOKEN=YOUR_TOKEN
python discord_bot.py

# Mac/Linux
export DISCORD_BOT_TOKEN=YOUR_TOKEN
python3 discord_bot.py
```

### Step 4: Play in Discord!

**Players type:**
```
!begin
```
Bot DMs 10 questions → Players answer 1-5 → Class assigned!

**Start game:**
```
!start
```

**You (AI GM) send whispers:**
```
!whisper @Player1 Your military training reveals: TRAP!
!whisper @Player2 You sense dark magic: medicine CURSED!
```

**Trigger Divine Council:**
```
!council Players stole medicine but didn't deliver
```

**Done! Game is running!**

---

## 📋 Commands Reference

### **Player Commands:**
```
!begin      - Start Divine Interrogation (character creation)
!start      - Begin adventure (needs 2 players)
!status     - Show party status
!trust      - Show trust level
!npcs       - Show NPC approval
!town       - Show town hub
```

### **AI GM Commands (Admin only):**
```
!whisper @Player <message>  - Send private whisper
!council <action>           - Trigger Divine Council vote
!npc_approval <npc> <±X> <reason> - Update NPC approval

Examples:
!whisper @Player1 You sense dark magic in the air...
!council Players stole medicine from Duke
!npc_approval grimsby -30 Party broke promise
```

---

## 🎯 Test The Core Innovation

**The asymmetric whispers system:**

1. **Send different whispers to each player**
2. **Watch them struggle with conflicting info**
3. **See if they share or hide information**
4. **Track trust changes**

**This is your core innovation - test it!**

---

## 📁 Important Files

- **WHATSAPP_GUIDE.md** - Complete manual for WhatsApp mode
- **QUICKSTART.md** - Full setup guide
- **TEST_CHECKLIST.md** - Comprehensive testing checklist
- **PLATFORM_COMPARISON.md** - Format comparison
- **ARCHITECTURE.md** - System design
- **README.md** - Full documentation

---

## ✅ Pre-Test Checklist

**Before testing:**

- [ ] Python installed (3.11+)
- [ ] Dependencies installed: `pip install -r requirements.txt`
- [ ] Discord bot created (if using Discord)
- [ ] Bot token saved somewhere safe
- [ ] 2 test players ready
- [ ] WhatsApp group created OR Discord channel ready

**You're ready to test!**

---

## 🚨 Quick Troubleshooting

**Discord bot won't start:**
- Check bot token is correct
- Check Python version: `python --version` (needs 3.11+)
- Install dependencies: `pip install -r requirements.txt`

**Bot doesn't respond:**
- Enable "Message Content Intent" in Discord Developer Portal
- Bot needs admin permissions in channel

**Can't send DMs:**
- Players need to enable "Allow DMs from server members" in Discord settings

**WhatsApp messages too long:**
- Split into 2-3 shorter messages
- WhatsApp has ~4000 character limit

---

## 🎮 READY TO PLAY!

**Choose your mode:**
- ⚡ Quick test: WhatsApp (no setup)
- 🤖 Full test: Discord bot (10 min setup)

**The Arcane Codex is ready for testing!** 🎲⚔️
