# THE ARCANE CODEX
## COMPLETE GAME DESIGN DOCUMENT
**Version:** 2.0
**Last Updated:** 2025-01-01
**Status:** Ready for Implementation

---

## 📋 EXECUTIVE SUMMARY

**The Arcane Codex** is a revolutionary AI-driven fantasy RPG that creates moral dilemmas through asymmetric information. Unlike traditional RPGs, players receive DIFFERENT information about the same situation, forcing collaboration, trust, and difficult choices.

### Core Innovation:
**"Conflicting Whispers Create Moral Complexity"**

- 2 Players + 1-2 NPC Companions = 4-person party
- Each character receives unique information (whispers)
- NPCs have hidden agendas and can betray
- 8 gods judge your choices in real-time
- Dragons & wolves as companions/enemies
- No "right" answers - only consequences

### Target Audience:
- Players who want Game of Thrones / Vikings / Walking Dead complexity
- Fans of Baldur's Gate 3, Divinity Original Sin 2
- TTRPG players seeking AI Dungeon Master
- 2-player co-op (parent + child, friends, couples)

### Session Length:
- 45-90 minutes per quest
- 15-25 turns average
- Async-friendly (can pause and resume)

---

## 🎮 CORE GAMEPLAY LOOP

### 1. CHARACTER CREATION (10 minutes)

**Divine Interrogation:**
- 8 gods ask 10 questions
- Players answer based on instinct
- Divine favor calculated automatically
- Class assigned organically (no player choice)
- 23+ possible character builds

**Example Flow:**
```
VALDRIS asks: "A tyrant king demands you kneel. What do you do?"
Player chooses: "I spit in his face. If I die, I die free."
Result: DRAKMOR +30, VALDRIS -20, KAITHA +20

[After 10 questions]
Your divine favor:
- DRAKMOR: +75
- KORVAN: +55
- VALDRIS: -25

Class Assigned: DRAGON KNIGHT (Freedom warrior, dragon rider)
```

---

### 2. QUEST SELECTION (2 minutes)

**10 Diverse Scenarios:**
1. The Blood Price (medicine heist + poisoned shipment)
2. The Beast Within (werewolf curse vs. orphan protection)
3. The Poisoned Crown (king's assassination, queen's desperation)
4. The Dragon's Bargain (treasure vs. dragon invasion)
5. The Plague Lands (infected doctor, zombie horde)
6. Blood Debt (warrior clans, revenge vs. peace)
7. The Saboteur (war sabotage, forbidden weapons)
8. The Traitor's Mark (hidden traitor, paranoia)
9. Forbidden Power (dark magic temptation)
10. The Hostage Exchange (conflicting identities)

**Each scenario features:**
- Conflicting asymmetric whispers
- NPC companions with hidden agendas
- Multiple solution paths
- Real consequences
- Divine Council judgment

---

### 3. TURN STRUCTURE (5-7 minutes per turn)

**Each Turn:**

**STEP 1: Public Narration** (Everyone sees)
```
"The warehouse is silent. Grimsby's daughter is in a cage.
Guards patrol the perimeter."
```

**STEP 2: Asymmetric Whispers** (Private, different per player/NPC)
```
PLAYER 1 (Fighter): "The girl's arm is broken. Slavers coming in 3 days."
PLAYER 2 (Mage): "The medicine shipment is POISONED. 200 will die."
NPC GRIMSBY: "Confession letter in crate. If found, I hang."
NPC RENNA: "My brother orchestrated the poisoning. I must kill him."
```

**STEP 3: Whisper Sharing** (Players decide)
- Share all info = collaboration
- Hide info = tension/betrayal
- NPCs share based on personality

**STEP 4: Planning** (Party discusses)
- Players debate options
- NPCs suggest actions (based on approval)
- Fatal flaws may trigger (NPCs act impulsively)

**STEP 5: Action Submission**
- Each player chooses action
- NPCs act based on AI personality
- Submit simultaneously

**STEP 6: Resolution**
- AI GM resolves actions
- Skill checks rolled
- Combat if triggered
- Environmental tactics applied
- Consequences narrated

**STEP 7: Divine Council** (Major decisions only)
- 8 gods debate party's choice
- Vote: Unanimous / Strong Majority / Narrow / Tie
- Divine favor adjusted
- Blessings/curses applied

**STEP 8: State Updates**
- HP, skills, inventory updated
- NPC approval changed
- Trust score updated
- World flags set
- Consequences planted (callback later)

---

## 🎭 CHARACTER SYSTEMS

### Divine Interrogation (Character Creation)

**10 Questions, 8 Gods:**

| God | Domain | Favors | Opposes |
|-----|--------|--------|---------|
| VALDRIS | Order, Law, Justice | Following rules, upholding law | Chaos, rebellion |
| KAITHA | Chaos, Freedom, Change | Breaking norms, unpredictability | Order, stagnation |
| MORVANE | Survival, Pragmatism | Self-preservation, family | Idealism, sacrifice |
| SYLARA | Nature, Growth, Healing | Protecting nature, healing | Destruction, corruption |
| KORVAN | War, Honor, Glory | Combat, honor codes | Cowardice, dishonor |
| ATHENA | Wisdom, Knowledge, Strategy | Learning, planning | Ignorance, impulsiveness |
| MERCUS | Commerce, Wealth, Trade | Profit, negotiation | Waste, charity |
| **DRAKMOR** | Freedom, Fury, Transformation | Independence, primal power | Slavery, submission |

**Divine Favor Range:** -100 (Condemned) to +100 (Champion)

**At +70:** Divine Blessing unlocked
**At -50:** Divine Curse applied

---

### 23+ Character Archetypes

**Examples:**

1. **The Lawful Paladin** (VALDRIS +90, KORVAN +65)
   - Blessings: Unbreakable Will, Divine Armor, Sacred Oath
   - Playstyle: Tank, protector, upholds justice

2. **The Dragon Knight** (DRAKMOR +85, KORVAN +65)
   - Blessings: Dragon's Blood, Dragon Companion, Mounted Combat
   - Playstyle: Aerial cavalry, primal fury

3. **The Wolf Shaman** (SYLARA +80, DRAKMOR +75, MORVANE +70)
   - Blessings: Wolf Pack, Shapeshifting, Nature Magic
   - Playstyle: Pack leader, transformation specialist

4. **The Chaotic Scholar** (KAITHA +90, ATHENA +65, VALDRIS -35)
   - Blessings: Chaos Magic, Lucky Break, Paradox
   - Playstyle: Unpredictable mage, reality manipulation

5. **The Pragmatic Survivor** (MORVANE +95, KORVAN -45)
   - Blessings: Survivor's Instinct, Last Stand, Escape Artist
   - Playstyle: Tactical retreat, self-preservation

*(Full list in CHARACTER_ARCHETYPES.md)*

---

### Skill System: "Practice Makes Perfect"

**No XP, No Levels. Skills improve by USING them.**

**Skill List (13 skills):**
- Combat: Strength, Archery
- Magic: Arcana, Research
- Stealth: Lockpicking, Stealth, Sleight of Hand
- Social: Persuasion, Intimidation, Deception
- Awareness: Perception, Survival, Medicine

**Progression:**
```
On successful check:
- Easy (skill > difficulty): +1
- Moderate (skill ≈ difficulty): +2
- Hard (skill < difficulty): +3

Skill cap: 100
Starting values: 10 (base) + class bonuses (5-15)
```

**Check Formula:**
```
Success Threshold = 50 + ((player_skill - difficulty) / 2)
Roll d100
If roll ≤ threshold: SUCCESS
```

**Example:**
```
Lockpicking Check (Difficulty 40)
Player skill: 35
Threshold: 50 + ((35-40)/2) = 47.5%
Roll: 42 → SUCCESS!
Lockpicking: 35 → 37 (+2, moderate challenge)
```

---

## 👥 NPC COMPANION SYSTEM

### Party Structure:
- **2 Human Players**
- **1-2 NPC Companions** (varies by scenario)
- **Total: 3-4 person party**

### NPC Design:

**Every NPC has:**
1. **Strengths** - What party needs them for
2. **Fatal Flaw** - Can cause betrayal/death
3. **Hidden Agenda** - Secret goal
4. **Whisper Behavior** - What they share vs. hide
5. **Divine Favor** - Gods judge NPCs too

**Example: RENNA (Vengeful Rogue)**
```
Strengths: Lockpicking 75, Stealth 70, Scout
Fatal Flaw: IMPULSIVE - Acts without consulting when Thieves Guild mentioned
Hidden Agenda: Kill brother (Guild leader)
Shares: Trap locations, guard patrols, tactical info
Hides: Brother relationship, revenge plan
Approval: Starts at 50 (Neutral)

Betrayal Trigger: If party negotiates with Guild, Renna attacks alone
Death: Permanent if killed in combat
Leaving: Can storm off if approval <40, returns later (Option B)
```

### NPC Approval System:

**0-20 (HOSTILE):** Will betray/leave/attack
**21-40 (UNFRIENDLY):** Minimal help, withholds info
**41-60 (NEUTRAL):** Professional, follows orders
**61-80 (FRIENDLY):** Helpful, shares info, suggests actions
**81-100 (DEVOTED):** Loyal to death, shares secrets

**Gaining Approval:** Save NPC's life (+20), support agenda (+15), defend them (+10)
**Losing Approval:** Betray trust (-30), oppose agenda (-20), insult them (-15)

### NPC Whispers:

NPCs receive class-based whispers too.

**What NPCs ALWAYS Share:**
- Tactical info (traps, enemies, loot)

**What NPCs SOMETIMES Share:**
- Strategic info (if approval 60+)
- Emotional state (if personality is honest)

**What NPCs NEVER Share (Until Confronted):**
- Hidden agenda
- Personal relationships
- Fatal flaw triggers

---

## 🐉 DRAGONS & WOLVES

### Dragon System:

**Life Stages:**
1. **Egg** (Turns 0-10): Requires warmth, protection
2. **Wyrmling** (Turns 11-50): Dog-sized, playful, weak fire
3. **Young Dragon** (Turns 51-200): Horse-sized, rideable, combat-capable
4. **Adult Dragon** (Turn 201+): Building-sized, devastating power

**Abilities:**
- Fire breath (damage scales with age)
- Flight (player can ride at Young stage)
- Hoard instinct (guards treasure)
- Combat partner

**Moral Choices:**
- Let it eat livestock vs. buy meat vs. teach restraint
- Allow it to eat corpses vs. forbid
- Keep in cities vs. release to wild

---

### Wolf System:

**Types:**
1. **Lone Wolf:** Single companion, loyal scout
2. **Wolf Pack:** 8 wolves, become alpha through combat
3. **Dire Wolf:** Horse-sized, legendary mount
4. **Werewolf:** Cursed human, shapeshifting path

**Pack Alpha Benefits:**
- 8 wolves follow you (pack tactics)
- Combat advantage (flanking, numbers)
- Tracking (Perception +30)

**Pack Alpha Costs:**
- Feed pack (100 gold/week or hunt)
- Pack morale (if 4+ die, rest flee)
- Challenged by rivals

---

### Shapeshifting (DRAKMOR +70 Required):

**Dragon Form:**
- Duration: 10 minutes
- HP +50, Flight, Fire breath (30 damage)
- Cannot use items/spells
- Terrifying to mortals

**Wolf Form:**
- Duration: 1 hour
- Speed x3, Perception +40, Stealth +30
- Pack tactics, tracking by scent
- Risk of losing control

**Hybrid Form (DRAKMOR +90):**
- Dragon wings + wolf body
- Ultimate power, 5-minute duration
- Society fears you

---

## 🗣️ ASYMMETRIC WHISPERS

### Purpose:
Create moral dilemmas where players have CONFLICTING information.

### How It Works:

**Public Scene:**
```
"The King is poisoned. Find the culprit. 1 hour before he dies."
```

**Player 1 Whisper (Thief):**
```
"The Queen's hand trembles. She's guilty. You see it in her eyes."
```

**Player 2 Whisper (Bard):**
```
"The King was planning to murder the Queen's family tomorrow.
She poisoned him in self-defense."
```

**Result:**
- Player 1 thinks: "Queen is GUILTY!"
- Player 2 thinks: "Queen had REASON!"
- Must collaborate to find best solution

### Whisper Types:

| Class | Specialty | Examples |
|-------|-----------|----------|
| Fighter | Structural, physical | Guard positions, weak points, escape routes |
| Mage | Magical, arcane | Enchantments, wards, spell signatures |
| Thief | Hidden, social | Traps, lies, hidden doors, body language |
| Ranger | Environmental, survival | Tracks, animals, weather, natural hazards |
| Cleric | Spiritual, emotional | Lies, curses, souls, divine will |
| Bard | Social, historical | Emotions, motivations, lore, connections |

---

## ⚖️ DIVINE COUNCIL

### When It Convenes:
- Major moral decisions
- Player betrayals
- NPC deaths
- Quest endings

### Voting System:

**8 Gods Vote:**
- Each god votes based on their domain
- Conflicting votes create drama

**Outcomes:**
- **Unanimous (8-0):** Massive favor shift (±30)
- **Strong Majority (6-2 or 7-1):** Significant shift (±20)
- **Narrow Majority (5-3):** Moderate shift (±10)
- **Tie (4-4):** No consensus, minor shifts (±5)

**Example:**
```
ACTION: Party steals medicine to save child, but 200 plague victims die

VOTES:
FOR (Child over many):
- MORVANE: "Family first. Pragmatic choice."
- KAITHA: "Chaos, but understandable."
Total: 2

AGAINST (Greater good betrayed):
- VALDRIS: "You broke the law. 200 innocents died."
- SYLARA: "Healing magic corrupted. Unforgivable."
- ATHENA: "Short-sighted. Wisdom would have found third path."
- MERCUS: "Economic disaster. 200 customers lost."
- KORVAN: "No honor in letting hundreds die."
- DRAKMOR: (Abstains - conflicted)

Result: STRONG MAJORITY AGAINST (6-2)
- VALDRIS: -25 favor
- SYLARA: -20 favor
- MORVANE: +15 favor
```

---

## 🔀 TRUST & BETRAYAL MECHANICS

### Trust Score:
Tracks party cohesion based on whisper sharing.

**High Trust (80-100):**
- Players share all whispers
- NPCs more helpful
- Bonus to group checks
- Divine favor +5 (gods reward unity)

**Medium Trust (40-79):**
- Some secrets kept
- Normal gameplay

**Low Trust (0-39):**
- Frequent lying/hiding
- NPCs suspicious
- Penalty to group checks
- Divine favor -5 (gods punish division)

**Betrayal:**
- Caught lying: Trust -20
- Hidden critical info: Trust -15
- NPC betrayal: Trust -10 (affects whole party)

---

## 🎯 AI GM ENHANCEMENTS (6 Systems)

### 1. Environmental Tactics

Every scene includes usable objects/terrain.

**Example:**
```
"Tavern. Tables, chairs, chandeliers, barrels, fireplace."

Action Options:
- Flip table for cover
- Throw mug at fireplace (distraction)
- Cut chandelier rope (drops on enemies)
- Hide behind bar
```

**Implementation:**
- AI describes 3-5 environmental objects
- At least 1 action per turn uses environment
- Physics consistent (fire spreads, water conducts lightning)

---

### 2. Proactive NPCs

NPCs don't just react - they ACT.

**Example:**
```
PUBLIC: "Strangers approach, hands on weapons."

NPC GRIMSBY (Approval 60):
"I know a tunnel. Under the bar. 5 gold to bartender. Your call."
[Draws rusty knife] "If this goes bad, I'm with you."

RENNA (Approval 40):
[Says nothing, positions near door, ready to flee]
```

**Implementation:**
- NPCs with Approval 50+ offer help
- NPCs with Approval <40 hesitate
- Fatal flaws trigger at critical moments

---

### 3. Momentum System

Reward creativity and risk-taking.

**Earn Momentum (+1 per):**
- Creative solution (throw mug, seduce door)
- Risky choice that creates drama
- Callback to earlier event
- Surprise AI with novel approach

**Spend Momentum:**
- Reroll failed check (1 point)
- Auto-succeed routine check (1 point)
- Get hint without penalty (1 point)
- Second Wind in combat (2 points, restore 20 HP)

**Max: 5 Momentum Points**

---

### 4. Consequence Callbacks

Every 5-10 turns, reference earlier events.

**Example:**
```
TURN 5: Party saves Grimsby's daughter

TURN 15: Return to city
"Grimsby waves frantically. 'You saved Elara! Word spread.
Merchants trust you now. 10% discount citywide!'"

[CALLBACK: Turn 5 → Reputation effect]
[Grimsby Approval: 70 → 85]
```

**Implementation:**
- Track major actions in world flags
- AI references past choices explicitly
- Consequences unlock/lock content

---

### 5. Dynamic Difficulty

Track success/failure chains, adapt.

**3+ Successes in row:**
- Difficulty +5 to +10
- NPCs comment: "You're too good. Suspicious."
- Enemies become cautious

**3+ Failures in row:**
- Difficulty -5
- NPCs offer help/hints
- Game adapts to skill level

---

### 6. Narrative Status Effects

Status effects aren't just mechanical - they're storytelling.

**Example - Poisoned:**
```
MECHANICAL: -15% all checks, -5 HP/turn

NARRATIVE: "Your hands tremble. Vision swims. Grimsby notices:
'You're in no shape to fight. Here, take this antidote.'"

NPC REACTION (High Approval): Offers help
NPC REACTION (Low Approval): Exploits weakness
```

---

## 🌍 4 REVOLUTIONARY DIMENSIONS

### 1. Time Dilation
- World continues at 10x speed when players offline
- NPCs act independently
- 6-hour buffer before consequences
- Approval drifts over time

### 2. Cross-Party Rumors
- Multiple parties share same world
- Player 1's actions affect Player 2's game
- Economy reacts to all players
- Rumors spread ("Did you hear about the party who...")

### 3. Moral Echo System
- Choices echo to future players
- Mercy/Violence/Betrayal echoes persist 100-500 turns
- Example: If you spare bandit, he helps next party

### 4. Hidden Traitor (10% of players)
- Secret objectives at character creation
- 60% Loyal, 30% Hidden Agenda, 10% Traitor
- Traitor must sabotage party without being caught
- Reveals at quest end

*(Note: Dimensions 1-4 are designed but not implemented in v2.0)*

---

## 📊 QUEST SCENARIO STRUCTURE

### Standard Quest Flow:

**Act 1 - Setup (Turns 1-5):**
- Hook presented
- NPCs introduced
- Asymmetric whispers begin
- Party bonds (or doesn't)

**Act 2 - Complication (Turns 6-15):**
- Twists revealed
- Fatal flaws trigger
- Moral dilemmas escalate
- Combat/negotiation

**Act 3 - Resolution (Turns 16-25):**
- Climax
- Consequences applied
- Divine Council judges
- Epilogue

---

### Example: "The Blood Price"

**Act 1 (Turns 1-5):**
- Grimsby begs for help (daughter kidnapped)
- Medicine heist proposed
- Asymmetric whispers: Child suffering vs. Poisoned medicine
- Party plans

**Act 2 (Turns 6-15):**
- Warehouse infiltration
- Renna's brother appears (impulsive betrayal trigger)
- Grimsby's confession letter discovered
- Combat or negotiation

**Act 3 (Turns 16-25):**
- Resolution based on choices:
  - Path A: 200 die, daughter saved
  - Path B: Daughter enslaved, 200 saved
  - Path C: Both saved (collaboration)
- Divine Council convenes
- Epilogue: 3 months later, consequences shown

---

## 🎨 VISUAL ENHANCEMENT SYSTEM

### ANSI Color Coding:

| Element | Color | Example |
|---------|-------|---------|
| Scene Setting | Yellow | "🌅 Rain hammers the tin roof..." |
| Dialogue | Cyan | "🗣️ GRIMSBY: 'Please help!'" |
| Action | Red | "⚔️ The blade pierces armor!" |
| Magic | Magenta | "🔮 Arcane energy crackles..." |
| Discovery | Green | "💎 Hidden compartment revealed!" |
| Danger | Bright Red | "💀 Poison needle shoots out!" |

### Progress Bars:

**HP Bar:**
```
[████████░░] 80/100 HP
```

**Skill Check:**
```
🎲 LOCKPICKING CHECK
Roll: [■■■■■■■□□□] 68/100
Threshold: 47% → SUCCESS!
```

**Momentum:**
```
[★★★☆☆] 3/5 Momentum
```

---

## 💻 TECHNICAL IMPLEMENTATION

### Game Server Architecture:

```
Client (Web Browser) → HTTP Server → AI GM Engine → Game State
                                   ↓
                          Divine Council Module
                          NPC Behavior Module
                          Dragon/Wolf Module
                          Trust Tracker
                          Consequence Engine
```

### Game State (JSON):

```json
{
  "players": [
    {
      "id": 1,
      "name": "Player1",
      "class": "Dragon Knight",
      "hp": 80,
      "skills": {"strength": 65, "intimidation": 70},
      "divine_favor": {"DRAKMOR": 85, "KORVAN": 65},
      "dragon_companion": {"stage": "young", "hp": 150}
    }
  ],
  "npcs": [
    {
      "id": "renna",
      "approval": 65,
      "hidden_agenda": "kill_brother",
      "fatal_flaw": "impulsive"
    }
  ],
  "world_flags": {
    "medicine_stolen": false,
    "grimsby_daughter_status": "captive",
    "renna_brother_alive": true
  },
  "trust_score": 75,
  "turn": 12,
  "quest": "The Blood Price"
}
```

---

## 📈 SUCCESS METRICS

### Player Engagement:
- Session completion rate: Target 70%+
- Return rate: Target 60%+
- Average session length: 60-90 minutes

### Quality Metrics:
- NPC name recall: Target 70%+
- Surprise factor: Target 80%+ (were you surprised?)
- Emotional investment: Target 75%+ (did you care when NPC died?)

### Innovation Metrics:
- Whisper sharing rate: 40-60% (healthy balance)
- Trust score average: 60-70 (some secrets kept)
- Divine Council agreement: <40% unanimous (good moral complexity)

---

## 🗺️ DEVELOPMENT ROADMAP

### Phase 1: Core Systems (Current)
- ✅ Divine Interrogation (8 gods)
- ✅ Divine Council voting
- ✅ NPC Companion System
- ✅ Asymmetric whispers
- ✅ 6 AI GM enhancements
- ✅ Dragons & wolves
- ✅ 6 detailed quest scenarios

### Phase 2: Implementation (In Progress)
- [ ] Complete game server (2-player local network)
- [ ] Web UI (local network, separate devices)
- [ ] All documentation updated
- [ ] Testing and balancing

### Phase 3: Polish & Expansion
- [ ] Complete scenarios 7-10
- [ ] Discord bot integration
- [ ] WhatsApp bot integration
- [ ] 4 Revolutionary Dimensions implementation

### Phase 4: Long-term
- [ ] Multiplayer scaling (4+ players)
- [ ] Quest creator tools
- [ ] Community content
- [ ] Mobile app

---

## 📝 CHANGELOG

### v2.0 (2025-01-01) - MAJOR REVISION
- Added DRAKMOR (8th god)
- NPC Companion System designed
- Dragons & wolves integrated
- Asymmetric whispers as core mechanic
- Trust/betrayal systems
- 6 detailed quest scenarios
- Complete design consolidation

### v1.0 (2025-10-30) - Initial Design
- 7 gods
- Basic Divine Interrogation
- Single-player prototype
- 3 classes

---

## 🔗 RELATED DOCUMENTS

**Core Systems:**
- DIVINE_INTERROGATION_SYSTEM.md
- DIVINE_COUNCIL_SYSTEM.md
- NPC_COMPANION_SYSTEM.md
- DRAGON_WOLF_SYSTEM.md
- TRUST_BETRAYAL_MECHANICS.md

**Content:**
- QUEST_SCENARIOS.md (10 scenarios)
- CHARACTER_ARCHETYPES.md (23+ builds)
- DRAKMOR_GOD.md (8th god)

**AI Design:**
- AI_GM_SPECIFICATION.md
- AI_GM_ENHANCEMENTS.md
- MECHANICS.md

**Implementation:**
- TECH_STACK.md
- Complete game server (to be built)

---

## 📌 DESIGN PRINCIPLES

1. **"No generic bs"** - Specific details, no clichés
2. **"Choices matter"** - Real consequences, not illusions
3. **"NPCs are people"** - Not quest dispensers
4. **"Trust is earned"** - Whispers create tension
5. **"Gods are real"** - Divine Council judges you
6. **"Death is permanent"** - For NPCs, at least
7. **"Complexity through simplicity"** - Simple rules, complex outcomes

---

**Status:** ✅ COMPLETE GAME DESIGN
**Ready for:** Implementation
**Target:** 2-player local network game with all features
