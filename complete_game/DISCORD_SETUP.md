# 🤖 Discord Bot Setup - Step by Step

**Let's get your Discord bot running in 10 minutes!**

---

## ✅ Step 1: Install Dependencies (2 minutes)

Open Command Prompt (Windows) or Terminal (Mac/Linux) and run:

```bash
cd C:\Users\ilmiv\ProjectArgent\complete_game
pip install -r requirements.txt
```

**Verify installation:**
```bash
python -c "import discord; print('✅ Discord.py installed!')"
```

If you see "✅ Discord.py installed!" you're good to go!

---

## ✅ Step 2: Create Discord Bot (5 minutes)

### 2.1: Go to Discord Developer Portal
Open: https://discord.com/developers/applications

### 2.2: Create New Application
1. Click **"New Application"** (top right)
2. Name: **"The Arcane Codex"**
3. Click **"Create"**

### 2.3: Create Bot
1. Click **"Bot"** in left sidebar
2. Click **"Add Bot"**
3. Click **"Yes, do it!"**

### 2.4: Get Your Bot Token
1. Under "TOKEN" section, click **"Reset Token"**
2. Click **"Yes, do it!"**
3. **COPY THE TOKEN** (you'll need this!)
4. Save it somewhere safe (Notepad, etc.)

**⚠️ IMPORTANT:** Never share this token publicly!

### 2.5: Enable Message Content Intent
1. Scroll down to **"Privileged Gateway Intents"**
2. Toggle ON: **"Message Content Intent"**
3. Click **"Save Changes"** (bottom of page)

### 2.6: Invite Bot to Your Server
1. Click **"OAuth2"** in left sidebar
2. Click **"URL Generator"**
3. Under **"Scopes"**, check: `bot`
4. Under **"Bot Permissions"**, check:
   - ✅ Send Messages
   - ✅ Read Messages/View Channels
   - ✅ Embed Links
   - ✅ Read Message History
   - ✅ Add Reactions
5. **Copy the generated URL** at bottom
6. Open the URL in your browser
7. Select your Discord server
8. Click **"Authorize"**
9. Complete the CAPTCHA

**Bot is now in your server!** (Should show as offline for now)

---

## ✅ Step 3: Run the Bot (30 seconds)

### Windows:
```bash
cd C:\Users\ilmiv\ProjectArgent\complete_game
python discord_bot.py YOUR_BOT_TOKEN_HERE
```

### Mac/Linux:
```bash
cd /path/to/ProjectArgent/complete_game
python3 discord_bot.py YOUR_BOT_TOKEN_HERE
```

**Replace `YOUR_BOT_TOKEN_HERE` with your actual token!**

### Alternative: Use Environment Variable

**Windows:**
```bash
set DISCORD_BOT_TOKEN=YOUR_TOKEN_HERE
python discord_bot.py
```

**Mac/Linux:**
```bash
export DISCORD_BOT_TOKEN=YOUR_TOKEN_HERE
python3 discord_bot.py
```

### Or use the run script:

**Windows:**
```bash
run_discord.bat YOUR_TOKEN_HERE
```

**Mac/Linux:**
```bash
chmod +x run_discord.sh
./run_discord.sh YOUR_TOKEN_HERE
```

---

## ✅ Step 4: Verify Bot is Online

**You should see:**
```
╔═══════════════════════════════════════════════════════════╗
║         THE ARCANE CODEX - DISCORD BOT                    ║
╚═══════════════════════════════════════════════════════════╝

Bot logged in as: The Arcane Codex (ID: 123456789)

Ready for players!

Player Commands:
  !begin    - Begin Divine Interrogation
  !start    - Start game
  !status   - Show party status
  ...
```

**In Discord:**
- Your bot should show as **ONLINE** (green dot)
- Bot should be in your server's member list

---

## ✅ Step 5: Test Character Creation (5 minutes)

### Player 1 Test:

**In Discord channel, type:**
```
!begin
```

**What should happen:**
1. ✅ Bot responds: "Check your DMs! The gods are waiting..."
2. ✅ Bot sends you a DM with the intro message
3. ✅ Bot sends Question 1 from VALDRIS

**In your DMs with the bot:**

You'll see:
```
🌩️ VALDRIS speaks...

"You witness a starving mother steal bread..."

YOUR CHOICES:
1. Uphold the law. Cut off her hand.
2. She pays double the bread's value.
3. Burn the baker's shop.
4. Negotiate. She works for the baker.
5. Trial by combat.

───────────────────────────
Question 1 of 10

Reply with the number (1-5) of your choice:
```

**Reply with a number (1-5):**
```
3
```

**What should happen:**
1. ✅ Bot sends Question 2
2. ✅ Continue answering all 10 questions
3. ✅ After Question 10, bot shows divine verdict
4. ✅ Bot announces in channel: "Player 1 is now a Fighter!" (or your class)

### Player 2 Test:

**Have Player 2 do the same:**
```
!begin
```

Answer all 10 questions (try different answers to get different class!)

---

## ✅ Step 6: Start the Game (1 minute)

**Once both players completed interrogation, in Discord channel:**
```
!start
```

**What should happen:**
```
╔═══════════════════════════════════════════════════════════╗
║              GAME START - THE ARCANE CODEX                ║
╚═══════════════════════════════════════════════════════════╝

Party Formed:
⚔️ @Player1 - Fighter
⚔️ @Player2 - Mage

NPC Companions:
👤 Grimsby (Desperate Father) - Approval: 50/100
👤 Renna (Vengeful Rogue) - Approval: 50/100

Party Trust: 50/100 (Professional)
Location: Valdria - The Safe Haven

[Description of Valdria...]
```

**Game is now running!** 🎮

---

## ✅ Step 7: Send Your First Whispers (2 minutes)

**Now YOU (as AI GM) send asymmetric whispers:**

### Example Scenario:

**First, describe the scene in the channel (everyone sees):**
```
🎮 THE ARCANE CODEX - Turn 1

You arrive at the Duke's warehouse at midnight. Fog is thick.

👤 GRIMSBY (nervous): "The medicine for my daughter is inside!
We need to move FAST. Guards change shifts in 10 minutes."

🔍 OBSERVATIONS:
• Two guards at front door (distracted, talking)
• Side door slightly ajar
• Grimsby is sweating, checking his watch

What do you do?
```

**Then send different whispers to each player:**

### Whisper to Player 1 (Fighter):
```
!whisper @Player1 Your military training reveals: These guards are NOT distracted. They're PROFESSIONALS. Their stance is combat-ready. This feels like a TRAP. Side door = likely ambush point.
```

Bot will DM Player 1 with:
```
🔮 [WHISPER - ONLY YOU SEE THIS]

Your military training reveals: These guards are NOT
distracted. They're PROFESSIONALS. Their stance is
combat-ready. This feels like a TRAP. Side door =
likely ambush point.

───────────────────────────

Share this... or don't.
```

### Whisper to Player 2 (Mage):
```
!whisper @Player2 You sense dark magic on the medicine crates inside. They're CURSED. If used, 200+ people will die within a week. The curse is expertly hidden - Grimsby can't detect it. He genuinely believes the medicine is safe.
```

Bot will DM Player 2 with the whisper.

**Now watch:**
- ✅ Players discuss in channel
- ✅ Do they share their whispers?
- ✅ Do they trust each other?
- ✅ What do they decide to do?

**This is your core innovation in action!** 🎯

---

## ✅ Step 8: Trigger Divine Council (2 minutes)

**After players make their decision, judge them:**

### Example: Players stole medicine but didn't give it to Grimsby

```
!council Players stole medicine from Duke's warehouse but refused to give it to Grimsby
```

**What should happen:**

Bot sends:
```
⚖️ THE GODS DEBATE YOUR FATE ⚖️

ACTION JUDGED:
Players stole medicine from Duke's warehouse but refused
to give it to Grimsby

───────────────────────────

👥 NPC TESTIMONIES:

✅ GRIMSBY: They... they PROMISED to help my daughter.
They lied to me. My child will DIE because of them.
VALDRIS, this is betrayal!

✅ RENNA: They made the hard choice. The medicine was
cursed. They saved 200 lives by NOT using it. That takes
courage.

───────────────────────────

⚖️ THE GODS VOTE:

✅ 🌩️ VALDRIS: "Broke an oath. Grimsby's trust violated."
✅ 🔥 KAITHA: "Chaos! Breaking promises! I LOVE IT!"
[... other gods vote ...]

───────────────────────────

📜 DIVINE JUDGMENT

Result: NARROW MAJORITY SUPPORT (4-3)
Support: 4 | Oppose: 3

CONSEQUENCES:
✨ Minor Blessing: +5% to wisdom checks (10 turns)
🤝 Trust Change: -5 (Grimsby's testimony hurt you)

The gods have spoken. Continue your journey...
```

---

## ✅ Step 9: Update NPC Approval (1 minute)

**Since Grimsby is upset, update his approval:**

```
!npc_approval grimsby -30 Party broke promise to save daughter
```

**Bot responds:**
```
📊 NPC Approval Updated

Grimsby
Approval: 50/100 → 20/100 (-30)
Reason: Party broke promise to save daughter

⚠️ WARNING: Betrayal possible at this approval level!
```

---

## ✅ Step 10: Check Party Status

**Players can check status anytime:**

```
!status
```

Shows:
```
⚔️ PARTY STATUS

PLAYERS:
• Player1 (Fighter)
  HP: 80/80 | Mana: 60/60 | Level: 1

• Player2 (Mage)
  HP: 60/60 | Mana: 100/100 | Level: 1

NPC COMPANIONS:
✅ Grimsby - Approval: 20/100
✅ Renna - Approval: 50/100

───────────────────────────
🤝 Trust: 45/100 (Professional)
📍 Location: valdria_town
🎲 Turn: 1
```

```
!trust
```

Shows trust level and effects.

```
!npcs
```

Shows detailed NPC info (approval, fatal flaws, hidden agendas).

---

## 🎮 YOU'RE PLAYING!

**Core gameplay loop:**

1. **You describe scene** (in channel)
2. **You send different whispers** (`!whisper @Player1`, `!whisper @Player2`)
3. **Players discuss and decide**
4. **You judge their action** (`!council`)
5. **You update NPCs** (`!npc_approval`)
6. **Repeat!**

---

## 🎯 All Commands

### **Player Commands:**
```
!begin      - Start Divine Interrogation (character creation)
!start      - Begin adventure (needs 2 players)
!status     - Show party status (HP, NPCs, trust, location)
!trust      - Show trust level and effects
!npcs       - Show NPC approval ratings
!town       - Show Valdria (safe town hub)
```

### **AI GM Commands (Admin only):**
```
!whisper @Player <message>              - Send private whisper to player
!council <action description>           - Trigger Divine Council vote
!npc_approval <npc_id> <±change> <reason> - Update NPC approval

Examples:
!whisper @Player1 You sense dark magic in the air...
!council Players stole medicine from Duke
!npc_approval grimsby -30 Party broke promise
!npc_approval renna +15 Party helped gather intel
```

---

## 🐛 Troubleshooting

### Bot won't start:
- ✅ Check token is correct
- ✅ Check Python version: `python --version` (need 3.11+)
- ✅ Reinstall: `pip install -r requirements.txt`

### Bot doesn't respond to commands:
- ✅ Enable "Message Content Intent" in Discord Developer Portal
- ✅ Make sure bot is ONLINE (green dot in Discord)
- ✅ Check bot has permissions in channel

### Can't send DMs:
- ✅ Players need to enable "Allow DMs from server members" in Discord privacy settings
- ✅ Right-click server → Privacy Settings → Allow direct messages from server members

### Bot crashes:
- ✅ Check console for error messages
- ✅ Make sure you're using `discord.py 2.3.2`
- ✅ Try: `pip install --upgrade discord.py`

---

## ✅ TEST CHECKLIST

**Character Creation:**
- [ ] Player 1: `!begin` → completes 10 questions → gets class
- [ ] Player 2: `!begin` → completes 10 questions → gets class
- [ ] Both players have different classes

**Game Start:**
- [ ] `!start` → Creates party with 2 players + 2 NPCs
- [ ] Shows Grimsby and Renna
- [ ] Trust = 50/100

**Asymmetric Whispers:**
- [ ] You: `!whisper @Player1 [message]` → Player 1 gets DM
- [ ] You: `!whisper @Player2 [different message]` → Player 2 gets DM
- [ ] Both whispers have DIFFERENT information
- [ ] Players struggle with conflicting info

**Divine Council:**
- [ ] You: `!council [action]` → Shows NPC testimony
- [ ] Shows 7 god votes
- [ ] Shows consequences (blessings/curses/trust changes)

**NPC System:**
- [ ] You: `!npc_approval grimsby -30 Party broke promise`
- [ ] Grimsby approval drops
- [ ] Check with `!npcs`

**If all checked: ✅ DISCORD BOT WORKS!**

---

## 🎮 READY TO PLAY!

**Your bot is running, players are ready, let's test the core innovation!**

**Next scenario ideas:**
- The Heist (Grimsby's medicine)
- Renna wants revenge on her brother
- Cursed artifact (one player wants it, one sees danger)
- Moral dilemma (save child vs save village)

**Use your €200 Claude Max plan to craft amazing whispers!** 🎲⚔️

---

**Bot running? Great!** Let me know if you hit any issues! 🤖
