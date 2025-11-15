# The Arcane Codex - Quick Start Guide

**Players do EVERYTHING in Discord/WhatsApp** - no website needed!

Kids/players never leave their messaging apps. Perfect for your target audience!

---

## Option 1: Discord Bot (Recommended - Fully Automated)

### Step 1: Install Dependencies (1 minute)
```bash
cd complete_game
pip install -r requirements.txt
```

### Step 2: Create Discord Bot (2 minutes)
1. Go to https://discord.com/developers/applications
2. Click "New Application" → Name: "The Arcane Codex"
3. Go to "Bot" → "Add Bot"
4. **Copy the Token** (keep it safe!)
5. Enable "Message Content Intent" (under Privileged Gateway Intents)
6. Go to OAuth2 → URL Generator
   - Scopes: `bot`
   - Permissions: Send Messages, Read Messages, Embed Links
7. Copy URL and invite bot to your Discord server

### Step 3: Run Discord Bot (30 seconds)
```bash
python discord_bot.py <YOUR_BOT_TOKEN>
```

That's it! No web server needed for Discord-only mode.

### Step 4: Play! (Everything in Discord)

**In Discord channel:**

**Character Creation (Divine Interrogation):**
```
Player 1: !begin
[Bot DMs 10 questions from gods]
[Player answers in DMs with numbers 1-5]
[Bot announces: "Player 1 is now a Fighter!"]

Player 2: !begin
[Same process]
[Bot announces: "Player 2 is now a Mage!"]

Either player: !start
[Bot creates party with 2 players + 2 NPCs]
```

**Gameplay (Asymmetric Whispers):**
```
AI GM (you): !whisper @Player1 Your military training reveals: TRAP!
AI GM (you): !whisper @Player2 You sense dark magic: medicine CURSED!

[Players discuss in channel]
[Players make decision]

AI GM (you): !council Players stole medicine but didn't deliver
[Bot shows Divine Council vote with NPC testimony]

AI GM (you): !npc_approval grimsby -30 Party broke promise
[Bot updates NPC approval, checks for betrayal]
```

**Track Party:**
```
Player: !status   → Shows HP, location, NPCs
Player: !trust    → Shows trust level and effects
Player: !npcs     → Shows NPC approval ratings
```

---

## Option 2: WhatsApp Only (Simplest - Pure Messaging)

### Step 1: Create WhatsApp Group (30 seconds)
- Add both players
- Name it "The Arcane Codex"

### Step 2: Character Creation (You send questions via DM)
Send Divine Interrogation questions one by one via private DMs.
See `WHATSAPP_GUIDE.md` for all 10 questions!

**Example (send privately):**
```
🌩️ VALDRIS speaks:

"You witness a starving mother steal bread from a wealthy baker.
The baker demands her hand as punishment - the law of this land.

What do you do?"

1. Uphold the law. Cut off her hand.
2. She pays double the bread's value.
3. Burn the baker's shop.
4. Negotiate. She works to repay debt.
5. Trial by combat. I fight the baker.

Reply with 1-5:
```

After 10 questions, calculate divine favor and assign class.
See `WHATSAPP_GUIDE.md` for calculation details!

### Step 3: Play! (Manual AI GM)
**You (AI GM using Claude) send messages:**

**PUBLIC (WhatsApp group):**
```
🎮 THE ARCANE CODEX

You enter the Duke's warehouse. Grimsby: "My daughter's
medicine is inside. We need to move fast!"

What do you do?
```

**PRIVATE (DM to Player 1):**
```
🔮 [WHISPER]
Your military training reveals: this is a TRAP.
Guards are professionals. Ambush imminent.
```

**PRIVATE (DM to Player 2):**
```
🔮 [WHISPER]
You sense dark magic: medicine is CURSED.
200 will die if used. Grimsby doesn't know.
```

**Track manually or use API:**
- Update trust: `POST http://localhost:5000/api/trust/update`
- Trigger Divine Council: `POST http://localhost:5000/api/council/convene`

---

## Testing Checklist

### Character Creation ✅
- [ ] Web UI loads at http://localhost:5000
- [ ] Divine Interrogation shows 10 questions
- [ ] Character class assigned after completion
- [ ] Player can enter character name

### Discord Bot ✅ (if using)
- [ ] Bot shows online in Discord
- [ ] `!register` command works
- [ ] `!start` command creates party
- [ ] `!status` shows party info
- [ ] `!whisper @Player message` sends DM
- [ ] `!council action` triggers Divine Council vote
- [ ] `!npc_approval npc_id ±10 reason` updates NPC

### WhatsApp ✅ (if using)
- [ ] WhatsApp group created
- [ ] Both players completed web interrogation
- [ ] You can send different messages to each player
- [ ] Players discuss and decide together

---

## What's Implemented (v1.0 Core)

✅ **Divine Interrogation** - All 10 questions, organic class assignment
✅ **Character Creation** - Web UI with beautiful interface
✅ **Discord Bot** - Party management, whispers, Divine Council
✅ **NPC Companions** - Grimsby + Renna with approval/betrayal
✅ **Trust System** - Party-wide trust (0-100) affects everything
✅ **Divine Council** - 7 gods vote, NPC testimony, blessings/curses
✅ **Town Hub (Valdria)** - Safe haven framework
✅ **Asymmetric Whispers** - You craft different messages per player

---

## What's NOT Implemented Yet

⏳ Quest scenarios (you'll craft these manually using Claude)
⏳ Combat system (resolve narratively for now)
⏳ Skill checks (AI GM decides outcomes)
⏳ Save/load game state
⏳ Merchants, Inn, Guild Hall interactions

**For testing this week:** Focus on Divine Interrogation + asymmetric whispers + Divine Council. The core innovation is there!

---

## Example Play Session (5 minutes)

### 1. Character Creation (Web UI)
```
Player 1 → Answers 10 questions → Becomes Fighter
Player 2 → Answers 10 questions → Becomes Mage
```

### 2. Start Game (Discord)
```
!start

Bot: "Party formed! You're in Valdria. Grimsby and Renna join you."
```

### 3. First Scenario (AI GM via Discord)
```
!whisper @Fighter Your combat training reveals: guards are
professionals. This warehouse feels like a trap.

!whisper @Mage You sense dark magic on the medicine crates.
If used, 200 people will die. Grimsby doesn't know.
```

### 4. Players Discuss
```
Fighter: "I don't trust this..."
Mage: "The medicine is... problematic."
[Do they share details? Or hide info?]
```

### 5. Decision & Consequences
```
Players decide: "We steal the medicine but don't give it to Grimsby"

!council Players stole Duke's medicine but didn't deliver to Grimsby
!npc_approval grimsby -30 Party broke promise to save daughter

Bot shows: Divine Council votes, Grimsby's approval drops to 20/100
```

---

## Tips for AI GM (You, Using Claude)

### Crafting Asymmetric Whispers
- **Fighter**: Tactical analysis, combat threats, guard behavior
- **Mage**: Magic auras, curses, arcane secrets
- **Thief**: Hidden traps, escape routes, valuables
- **Ranger**: Nature clues, tracking info, animal behavior
- **Cleric**: Moral implications, divine approval/disapproval
- **Paladin**: Oath resonance, honor concerns
- **Bard**: Social cues, NPC motivations, hidden tensions

### Creating Moral Dilemmas
**Pattern:** Mutually exclusive whispers
- Player 1: "Child suffering, MUST save NOW"
- Player 2: "Saving child kills 200 innocents"
- Result: Impossible choice, collaboration required

### Divine Council Triggers
Use when:
- Major moral decision (stealing, killing, saving)
- NPC fate decided (betray Grimsby? Help Renna kill her brother?)
- Breaking laws or oaths
- Significant party disagreement

---

## Need Help?

Check:
- `README.md` - Full documentation
- `MECHANICS.md` - Core game mechanics
- `DIVINE_INTERROGATION_SYSTEM.md` - Character creation details
- `TRUST_BETRAYAL_MECHANICS.md` - Trust system details
- `AI_GM_ENHANCEMENTS.md` - AI GM behavior patterns

**Ready to play The Arcane Codex!** 🎮⚔️🔮
