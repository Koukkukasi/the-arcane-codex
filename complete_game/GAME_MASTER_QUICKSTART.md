# Game Master Quickstart Guide
## The Arcane Codex - Running Your First Session

---

## 🎮 What Is The Arcane Codex?

An AI-powered 2-4 player co-op RPG where:
- **Asymmetric Information**: Each player sees different hidden details
- **Impossible Choices**: No perfect solutions to moral dilemmas
- **Dynamic Content**: AI generates unique scenarios every session
- **Trust & Betrayal**: Party trust affects NPC behavior and outcomes
- **Divine Judgment**: 8 gods vote on player actions

**Session Length**: 30-60 minutes per scenario
**Platform**: Discord, WhatsApp, or Web UI
**AI GM**: Claude (via Claude Code or MCP integration)

---

## ⚡ 5-Minute Setup

### Step 1: Choose Your Platform

**Option A: Web UI (Recommended for First Time)**
```bash
python arcane_codex_server.py
# Open http://localhost:5000
```

**Option B: Discord Bot**
```bash
# Terminal 1
python arcane_codex_server.py

# Terminal 2
python discord_bot.py YOUR_BOT_TOKEN
```

**Option C: WhatsApp (Manual)**
- Run web server for character creation
- You manually craft/send messages via WhatsApp

### Step 2: Create Characters

Each player:
1. Opens web UI at `http://localhost:5000`
2. Completes Divine Interrogation (10 questions from 8 gods)
3. Receives organic class assignment
4. Gets `player_id` for registration

**Classes**: Fighter, Mage, Thief, Ranger, Cleric, Bard

### Step 3: Register Party

**Discord**:
```
Player 1: !register player_abc123
Player 2: !register player_def456
!start
```

**Web/WhatsApp**: Use API endpoints to initialize party

### Step 4: Request First Scenario

Send to Claude (via Claude Code):
```
Generate Arcane Codex scenario:
- Party Trust: 50/100
- Players: [Classes from character creation]
- NPCs: None (first session, will introduce NPCs)
- Divine Favor: [From character creation]
- Previous Themes: None (first session)
- Difficulty: Low (introductory)
```

Claude generates scenario in 5-10 minutes.

### Step 5: Run the Scenario

1. Read public scene to all players
2. Send whispers privately to each player
3. Players discuss and choose action
4. Apply consequences
5. Update game state

---

## 📋 Session Checklist

### Before Session

- [ ] Check party trust level
- [ ] Check NPC approval ratings
- [ ] Check divine favor per god
- [ ] Review last scenario theme
- [ ] Request new scenario from Claude
- [ ] Prepare whisper messages (private DMs/notes)

### During Session

- [ ] Read Act 1 public scene
- [ ] Send Act 1 whispers privately
- [ ] Present initial choices
- [ ] Players discuss (encourage them!)
- [ ] Read Act 2 (complication)
- [ ] Send Act 2 whispers
- [ ] Present environmental elements
- [ ] Read Act 3 (resolution)
- [ ] Players make final choice
- [ ] Apply immediate consequences
- [ ] Run Divine Council vote
- [ ] Narrate outcome

### After Session

- [ ] Update party trust (±5 to ±20)
- [ ] Update NPC approvals (±10 to ±30)
- [ ] Update divine favor (±10 to ±40)
- [ ] Record scenario theme (avoid repetition)
- [ ] Note long-term consequences for future
- [ ] Schedule next session

---

## 🎯 Core Mechanics

### 1. Party Trust (0-100)

**How It Changes**:
- Share whispers truthfully: +5 to +10
- Lie or hide info: -10 to -20
- Betray companion: -20 to -30
- Sacrifice for party: +15 to +25

**Trust Tiers**:
- **80-100**: Unbreakable Bond (+10 to group checks, NPCs share freely)
- **40-79**: Professional (normal gameplay)
- **10-39**: Fragile Alliance (-10 to group checks, NPCs withhold info)
- **0-9**: Imminent Betrayal (NPCs WILL betray within 2 turns)

### 2. NPC Approval (0-100 per NPC)

**How It Changes**:
- Help NPC's goal: +15 to +30
- Hinder NPC's goal: -15 to -30
- Save NPC's life: +20 to +40
- Betray NPC: -40 to -60

**Approval Effects**:
- **80-100**: NPC loyal, shares all info, won't betray
- **60-79**: NPC cooperative, shares most info
- **40-59**: NPC neutral, withholds half of info
- **20-39**: NPC untrustworthy, likely to betray
- **0-19**: NPC hostile, will betray immediately

### 3. Divine Favor (-100 to +100 per god)

**How It Changes**:
- Action aligns with god's domain: +10 to +40
- Action opposes god's domain: -10 to -40
- Divine Council judgment: ±15 to ±30

**Favor Effects**:
- **+30 or higher**: God more lenient in votes, may grant blessing
- **-30 or lower**: God more harsh in votes, may curse
- **Neutral (±10)**: God votes purely based on action

### 4. Asymmetric Whispers

**Each player receives different information**:
- **Fighter**: Tactical (ambush detection, numbers, positioning)
- **Mage**: Magical (auras, compulsions, curses)
- **Thief**: Deception (lies, hidden motives, secrets)
- **Ranger**: Natural (tracks, animals, weather)
- **Cleric**: Divine (soul states, holy/unholy, moral weight)
- **Bard**: Social (emotions, relationships, true feelings)

**Key Rule**: Players must decide what to share with each other

### 5. Divine Council

**When It Happens**: After major moral choices

**Process**:
1. NPCs testify first (defend or condemn party)
2. 8 gods vote SUPPORT or OPPOSE
3. Majority determines blessing or curse
4. Trust and favor adjusted

**Vote Outcomes**:
- 7-0 or 0-7: Unanimous → Major blessing/curse
- 6-1 or 1-6: Strong majority → Blessing/curse
- 5-2 or 2-5: Clear majority → Minor blessing/curse
- 4-3 or 3-4: Narrow → Mixed outcome

---

## 🎬 Running Your First Scenario

### Example: "The Informant's Dilemma"

**Setup** (5 min):
```
You: "Rain hammers the cobblestones as Renna leads you through
     the Thieves Guild's back alleys. She stops outside The Broken Blade
     tavern..."

[Read full Act 1 public scene]
```

**Whispers** (Private DMs):
```
To Fighter: "Your combat training reveals: The 'guards' are sitting too
             casually. Their swords are too clean—never used in combat.
             This is a TRAP."

To Mage: "Your arcane senses detect: The informant radiates geas magic.
          Someone is FORCING him to betray Renna's brother."
```

**Player Discussion** (10 min):
- Let players debate
- Encourage them to share (or not) whispers
- Track who shares what (affects trust)

**Act 2** (10 min):
```
[Read complication]
[Send Act 2 whispers]
[Present environmental options]
```

**Act 3** (5 min):
```
[Force final choice]
[Apply immediate consequences]
[Update trust/approval]
```

**Divine Council** (5 min):
```
"Grimsby testifies: 'They helped me get the ledgers! Justice is served!'
Renna testifies: [Refuses, has left the party]

VALDRIS votes: SUPPORT (justice achieved)
KAITHA votes: OPPOSE (boring legal solution)
[Continue for all 8 gods]

JUDGMENT: 4 SUPPORT, 4 OPPOSE - DEADLOCK
No divine intervention."
```

---

## 🎪 GM Techniques

### Technique 1: Dramatic Reading

**Public Scenes**: Read with emotion, vary your voice
**Whispers**: Whisper them literally (if in-person) or mark them **[WHISPER - ONLY YOU SEE THIS]**

### Technique 2: Time Pressure

Use phrases like:
- "The informant stands, heading toward the guards..."
- "You have seconds to decide..."
- "The timer ticks: 3... 2..."

### Technique 3: NPC Personalities

Give each NPC a distinct voice/mannerism:
- Grimsby: Desperate, pleading tone
- Renna: Sharp, impatient, hand on weapon
- Brother Aldric: Calm, religious, hiding something

### Technique 4: Environmental Description

Make settings vivid:
- Sights: "Grimy windows, flickering candlelight"
- Sounds: "Rain hammering, tavern laughter, sword clinking"
- Smells: "Wet leather, stale ale, wood smoke"

### Technique 5: Consequence Narration

Make consequences FEEL real:
- Deaths: Describe them vividly
- Betrayals: Show NPC's hurt/anger
- Trust changes: "You see doubt in their eyes..."

---

## ⚠️ Common Mistakes

### Mistake 1: Revealing Whispers Publicly

**Wrong**: "Fighter, you see it's a trap. [Everyone hears this]"
**Right**: Private DM to Fighter only

### Mistake 2: Letting Players Avoid Choice

**Wrong**: Allowing endless investigation until "perfect" solution found
**Right**: Time pressure forces choice with incomplete info

### Mistake 3: Ignoring Trust/Approval Changes

**Wrong**: Trust stays at 50 all campaign
**Right**: Track every change, let low trust create drama

### Mistake 4: Making Choice Obvious

**Wrong**: One path is clearly best
**Right**: Both paths have heavy costs, players debate

### Mistake 5: Skipping Consequences

**Wrong**: "You chose Option A. Moving on..."
**Right**: Narrate deaths, NPC reactions, world changes vividly

---

## 🔧 Troubleshooting

### Problem: Players Won't Share Whispers

**Solution**:
- Show benefits of sharing (trust bonus)
- Show costs of withholding (missed info leads to disaster)
- NPCs comment: "You're hiding something..."

### Problem: One Player Dominates

**Solution**:
- Give dominant player harsh whispers ("You see danger everywhere")
- Give quiet player critical whispers ("Only YOU see the solution")
- NPCs address quiet player directly

### Problem: Players Always Choose "Safe" Option

**Solution**:
- Make "safe" option have long-term costs
- Show consequences of past "safe" choices coming back
- NPCs call them cowards

### Problem: Too Much Combat (or Too Little)

**Solution**:
- Request scenario with specific combat level
- Adjust difficulty mid-session ("Guards flee" or "Reinforcements arrive")
- Use environmental tactics to avoid/create combat

### Problem: Divine Council Votes Feel Arbitrary

**Solution**:
- Always explain WHY each god votes that way
- Reference god domains in explanation
- Let players predict votes (educates them)

---

## 📊 Tracking Sheet Template

```
═══════════════════════════════════════════════
THE ARCANE CODEX - SESSION TRACKER
═══════════════════════════════════════════════

SESSION #: ___    DATE: _________

PARTY STATE
───────────────────────────────────────────────
Party Trust: ___/100 (Change: ____)

PLAYERS:
• _________ [Class] HP: ___/___
• _________ [Class] HP: ___/___
• _________ [Class] HP: ___/___
• _________ [Class] HP: ___/___

NPC APPROVAL
───────────────────────────────────────────────
• _________ : ___/100 (Change: ____)
• _________ : ___/100 (Change: ____)
• _________ : ___/100 (Change: ____)

DIVINE FAVOR
───────────────────────────────────────────────
VALDRIS  : ____ (Change: ____)
KAITHA   : ____ (Change: ____)
MORVANE  : ____ (Change: ____)
SYLARA   : ____ (Change: ____)
KORVAN   : ____ (Change: ____)
ATHENA   : ____ (Change: ____)
MERCUS   : ____ (Change: ____)
DRAKMOR  : ____ (Change: ____)

SCENARIO
───────────────────────────────────────────────
Theme: _________________
Type: MUTUALLY_EXCLUSIVE / CONTRADICTORY / COMPLEMENTARY
Difficulty: Low / Medium / High / Extreme

CHOICE MADE: _____________________

CONSEQUENCES (Immediate):
_________________________________________
_________________________________________

CONSEQUENCES (Long-term):
Turn 3-5: ________________________________
Turn 5-10: _______________________________

DIVINE COUNCIL
───────────────────────────────────────────────
Support: _____________ (Count: ___)
Oppose:  _____________ (Count: ___)
Abstain: _____________ (Count: ___)

Result: BLESSING / CURSE / DEADLOCK / ABSTAIN

Effect: __________________________________

NOTES
───────────────────────────────────────────────
_________________________________________
_________________________________________
_________________________________________

═══════════════════════════════════════════════
```

---

## 🎓 Advanced GM Skills

### Skill 1: Cascading Consequences

Link scenarios together:
```
Session 1: Use plague medicine → 200 die
Session 3: Blood Vengeance cult forms (200 members)
Session 5: Cult attacks party
Session 8: Cult civil war (if Elara sides with party)
```

### Skill 2: NPC Character Arcs

Track NPC development:
```
Grimsby Arc:
Session 1: Approval 50, desperate for help
Session 2: Approval 45, obsessed with revenge
Session 3: Approval 30, attempts solo raid
Session 4: DEAD, haunts party as consequence
```

### Skill 3: Foreshadowing

Plant seeds early:
```
Session 1: "You notice Duke's advisor watching from shadows..."
Session 5: "The advisor steps forward. You remember him from before..."
```

### Skill 4: Player Agency

Let players drive story:
```
Player: "Can I investigate the advisor?"
You: "Generate scenario focused on investigating advisor"
```

### Skill 5: Varying Tone

Mix heavy and light:
```
Session 1: Dark (child dying from plague)
Session 2: Light (solving noble's marriage problem)
Session 3: Epic (dragon attack)
```

---

## 🏆 Success Metrics

### You're Doing Well If:

✅ Players debate choices for 10+ minutes
✅ Players ask "What did YOUR whisper say?"
✅ Players reference past consequences
✅ Trust fluctuates (not stuck at 50)
✅ NPCs feel like real characters (not quest-givers)
✅ Players care about Divine Council votes
✅ Players say "There's no good answer!"
✅ Players remember scenario themes from weeks ago

### You Need Improvement If:

❌ Players always choose same type of solution
❌ Trust never changes
❌ NPCs are forgettable
❌ Players don't care about Divine Council
❌ Choices are always obvious
❌ Players don't engage with whispers
❌ Sessions feel samey

---

## 📚 Resources

### Essential Reading
1. **AI_SCENARIO_GENERATION_PATTERNS.md** - How scenarios are built
2. **AI_SCENARIO_QUALITY_CHECKLIST.md** - Quality standards
3. **AI_SCENARIO_USAGE_GUIDE.md** - How to request scenarios
4. **AI_GENERATION_EXAMPLES.md** - 5 complete examples

### Game Systems
- **Divine Interrogation**: Character creation system
- **Trust/Betrayal**: Party dynamics
- **Divine Council**: Moral judgment
- **Asymmetric Whispers**: Information asymmetry
- **Environmental Tactics**: BG3-style interactivity

### Commands Reference

**Discord Commands**:
```
!register <player_id>  - Register character
!start                 - Start game
!status                - Show party status
!trust                 - Show trust level
!npcs                  - Show NPC approvals
!whisper @Player <msg> - Send private whisper
!council <action>      - Trigger Divine Council
```

**API Endpoints**:
```
POST /api/interrogation/start - Begin character creation
POST /api/game/start         - Initialize game
GET  /api/game/state         - Get current state
POST /api/council/convene    - Trigger Divine Council
POST /api/npc/approval/update - Update NPC approval
```

---

## 🚀 Quick Start Checklist

Your first session in 30 minutes:

**15 minutes before**:
- [ ] Start server
- [ ] Players create characters
- [ ] Request scenario from Claude

**Session start**:
- [ ] Introduction (5 min)
- [ ] Run scenario (30-40 min)
- [ ] Wrap up and update state (5 min)

**After session**:
- [ ] Update tracking sheet
- [ ] Note consequences for next time

---

## 💡 Pro Tips

1. **Prep Whispers in Advance**: Copy whispers into separate DMs before session
2. **Use Timers**: Set 5-min timer for discussions to create pressure
3. **Voice NPCs Distinctly**: Different tone for each NPC helps players remember
4. **Narrate Consequences Vividly**: Make choices FEEL important
5. **Let Silence Breathe**: After hard choices, pause for dramatic effect
6. **Track Everything**: Small details from Session 1 can matter in Session 10
7. **Embrace Low Trust**: It creates drama, not failure
8. **Reference Past Choices**: "Remember when you saved Grimsby's daughter? Well..."
9. **Ask Players to Predict**: "What do you think VALDRIS will vote?" (engages them)
10. **Celebrate Clever Solutions**: Reward creative use of environment

---

## 🎉 You're Ready!

You now know:
- ✅ How to set up the game
- ✅ How to run a scenario
- ✅ How core mechanics work
- ✅ How to request scenarios from Claude
- ✅ How to track game state
- ✅ How to create drama and tension

**Next Steps**:
1. Set up server
2. Gather 2-4 players
3. Run character creation
4. Request your first scenario
5. Play!

**Remember**: The AI generates content, but YOU bring it to life through narration, NPC voices, and dramatic timing.

**Good luck, Game Master!** 🎲

---

*For detailed scenario generation, see: AI_SCENARIO_USAGE_GUIDE.md*
*For pattern reference, see: AI_SCENARIO_GENERATION_PATTERNS.md*
*For examples, see: AI_GENERATION_EXAMPLES.md*
