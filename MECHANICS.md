# MECHANICS.md
**Project Argent: The Arcane Codex**
**Living Game Design Document**
**Current Version:** v0.1-prototype
**Last Updated:** 2025-10-30

---

## 📋 Quick Start

**What is this game?**
An AI-driven asynchronous cooperative RPG where 1-4 players explore a fantasy world guided by Claude (AI Dungeon Master). The game uses asymmetric information—each player sees different clues based on their class—forcing real collaboration. The game "bleeds" into real life through Discord DMs, creating urgency even when players aren't actively playing.

**Current Playable State:**
✅ v0.1 prototype design (3 classes, guided actions, async play)
📋 Planned: Full implementation, 6 classes, transmedia extensions

**Core Philosophy:**
This game prioritizes **entertaining AI storytelling** above all else. The AI DM must be witty, surprising, character-driven, and avoid fantasy clichés. If the AI isn't fun, nothing else matters.

---

## ✅ v0.1: Prototype Mechanics (CURRENT FOCUS)

### Core Game Loop (Async-First Design)

The game is designed for mobile-first, asynchronous play where players check in throughout the day rather than scheduling 3-hour sessions.

**1. AI Narrates Scene**
- Claude describes the current situation with specific, evocative details
- No generic fantasy descriptions (see Anti-Cliché Principles)

**2. AI Presents Choices**
- 3-4 contextually relevant actions + custom option
- Each shows: required skill, difficulty, player's current skill, success indicator

**3. Player Chooses**
- Select numbered option (1-4) or type custom action
- Can happen anytime (during lunch break, before bed, etc.)

**4. AI Resolves**
- Claude determines outcome using skill check system
- Narrates result with personality and consequences

**5. State Updates**
- Skills improve on success
- Inventory changes
- Location updates
- Other players see update when they check in

### Action Selection System

**Example Turn:**
```
You stand before the Obsidian Gate. Ancient runes pulse with violet light,
casting shadows that seem to reach toward you. The air smells of ozone and old magic.

What do you do?
1. 🔓 Push the door open [Strength: 20] - Your skill: 45 🟢 LIKELY
   Force your way through with raw power

2. 📖 Study the runes [Arcana: 50] - Your skill: 12 🔴 DESPERATE
   Attempt to decipher the magical lock (hard, but could learn something)

3. 👂 Listen at the door [Perception: 15] - Your skill: 22 🟢 LIKELY
   Gather intel before committing to an approach

4. ✍️ Something else (describe your action)

> _
```

**Action Generation Rules (for AI):**

The AI must generate actions that:
- **Match context** - No "climb tree" if there's no tree
- **Leverage player strengths** - At least 1 action using player's best skill
- **Provide variety** - Mix of safe/risky, physical/mental, direct/creative
- **Enable creativity** - Option 4 always allows freeform input
- **Show consequences** - Hint at what might happen ("noisy" vs "subtle")

**Success Indicators:**
- 🟢 **LIKELY** - Success chance ≥ 65% (your skill significantly exceeds difficulty)
- 🟡 **RISKY** - Success chance 40-64% (challenging but possible)
- 🔴 **DESPERATE** - Success chance < 40% (low odds, but big reward if successful)

**Hybrid Input:**
If player types freeform action instead of choosing:
```
> I politely knock and ask if anyone's home

AI analyzes: Reasonable? Yes. Which skill? Persuasion. Difficulty? Medium.
Resolves using standard skill check, adds personality:

"You knock three times. Politely. Like you're visiting your grandmother.

From beyond the door, a gravelly voice responds: 'We don't want any.'

'Any what?' you ask.

'ANYTHING. Go away.'

New options unlocked..."
```

---

## Character System

### Classes (v0.1: Prototype)

**Three core classes** to test asymmetric information mechanic:

| Class | HP | Stamina | Mana | Primary Role | Whisper Specialty |
|-------|----|---------|----|--------------|-------------------|
| **Fighter** | 100 | 100 | 0 | Tank/Melee DPS | Structural weaknesses, combat tactics, physical threats |
| **Mage** | 60 | 60 | 100 | Magic DPS/Utility | Magic auras, wards, enchantments, arcane lore |
| **Thief** | 80 | 100 | 0 | Stealth/Utility | Traps, locks, hidden passages, social cues |

**Fighter (The Muscle)**
- Starting bonuses: Strength +10, Intimidation +5
- Sees: Structural weaknesses, defensive positions, weapon quality, enemy armor gaps
- Playstyle: Direct approaches, physical solutions, protecting allies

**Mage (The Scholar)**
- Starting bonuses: Arcana +15, Research +10
- Sees: Magical auras, spell types, ward mechanisms, ancient runes, mana flows
- Playstyle: Puzzle-solving, magical solutions, long-range damage

**Thief (The Specialist)**
- Starting bonuses: Lockpicking +15, Stealth +10, Sleight_of_hand +10
- Sees: Trap mechanisms, lock types, hidden compartments, guard patterns, valuables
- Playstyle: Infiltration, precision, avoiding direct confrontation

### Attributes

**Health (HP):**
- Represents physical wellbeing
- Depleted by combat damage, traps, falls
- Reaches 0 = death (prototype: simple restart)

**Stamina:**
- Represents physical energy
- Depleted by: climbing, running, swimming, melee combat
- Regenerates: 10 points per hour of rest
- Reaches 0 = exhausted (all physical actions at -25%)

**Mana (Mage only):**
- Represents magical energy
- Depleted by: casting spells, identifying magic
- Regenerates: 15 points per hour of rest
- Reaches 0 = can't cast spells

### Skills System

**Philosophy:** "Practice makes perfect" - No XP, no levels. Skills improve by using them successfully.

**Skill List (v0.1):**

```
COMBAT:
- strength: Melee attacks, smashing, lifting, forcing
- archery: Ranged attacks with bow/crossbow

MAGIC:
- arcana: Spellcasting, identifying magic, dispelling
- research: Lore, ancient texts, historical knowledge

STEALTH & SUBTERFUGE:
- lockpicking: Doors, chests, mechanisms
- stealth: Sneaking, hiding, moving silently
- sleight_of_hand: Pickpocketing, palming objects, tricks

SOCIAL:
- persuasion: Charm, diplomacy, negotiation
- intimidation: Threats, fear, commanding presence
- deception: Lying, disguising, misdirection

SURVIVAL & AWARENESS:
- perception: Spotting details, traps, hidden objects
- survival: Tracking, foraging, navigation, wilderness lore
- medicine: Healing, diagnosing poison/disease, first aid
```

**Starting Values:**
- Most skills start at 10
- Class bonuses add +5 to +15 to relevant skills
- Skills cap at 100

**Skill Progression:**
```
On successful check:
- Easy challenge (difficulty < your skill): +1 skill
- Moderate challenge (difficulty near your skill): +2 skill
- Hard challenge (difficulty > your skill + 20): +3 skill

On failure: No penalty (learning opportunity)
```

---

## Skill Check System

**When triggered:**
- Player selects an action (or types custom)
- AI identifies required skill and determines difficulty (10-90)

**Resolution Formula:**
```
roll = random(1, 100)
success_threshold = 50 + ((player_skill - difficulty) / 2)

if roll ≤ success_threshold:
    SUCCESS → Skill improves
else:
    FAILURE → No penalty, but consequences may occur
```

**Example:**
```
Action: Pick a complex lock (Difficulty 40)
Player skill: Lockpicking 25

Success threshold = 50 + ((25 - 40) / 2) = 50 - 7.5 = 42.5%

Roll: 38 → SUCCESS!
Narration: "Click. Click. Click. The lock yields to your patient work."
Lockpicking: 25 → 27 (+2, moderate challenge)

Roll: 55 → FAILURE
Narration: "The pick slips. You hear footsteps approaching..."
Lockpicking: 25 (unchanged, but now you have a complication)
```

### Favorable/Unfavorable Conditions (Adapted from D&D Advantage)

**Favorable (+15% success chance):**
- Good lighting for precision work
- Proper tools for the job
- Taking time and being careful
- Ally assisting you
- Enemy is distracted or surprised

**Unfavorable (-15% success chance):**
- Poor conditions (darkness, rain, time pressure)
- Improper tools or damaged equipment
- Wounded or exhausted
- Multiple enemies or distractions
- Working against the clock

**Example Display:**
```
1. 🔓 Pick the lock [Lockpicking: 30] 🟢⬆️ FAVORABLE
   Your skill: 25 → Success: 57% (torch provides good light)
```

### Critical Success/Failure

**Critical Success (Roll 1-5):**
- Combat: Double damage + bonus effect (enemy stunned, disarmed)
- Skills: +5 to skill (instead of +1-3) + bonus discovery
- Social: NPC becomes ally or reveals secret
- Locks/Traps: Open silently + find hidden compartment

**Critical Failure (Roll 96-100):**
- Combat: Drop weapon, enemy gets free attack
- Skills: Tool breaks (lockpick snaps, rope frays)
- Social: NPC becomes hostile, alerts others
- Stealth: Trigger alarm or ambush

**Mastery Reduces Risk:**
- Skill ≥ 70: Crit fail only on 99-100 (mastery protects you)

---

## Combat System (v0.1 - Turn-Based)

**Initiative:** v0.1 = player always goes first (simplified)

**Player Turn Structure:**

```
The goblin snarls, raising a notched blade. Dried blood stains its leather armor.

Combat Actions:
1. ⚔️ Attack with sword [Strength: 15] - Your skill: 35 🟢 LIKELY
   Standard melee attack

2. 🏹 Shoot arrow [Archery: 20] - Your skill: 18 🟡 RISKY
   Ranged attack from a distance

3. 🛡️ Defensive stance [Perception: 20] - Your skill: 22 🟢 LIKELY
   Dodge and look for opening (reduces damage, sets up counter)

4. 🏃 Flee the battle [Survival: 10] - Your skill: 15 🟢 LIKELY
   Escape while you can (not always possible)
```

**Damage Calculation:**
```
base_damage = 10
skill_bonus = player_skill / 10
total_damage = base_damage + skill_bonus

Example: Strength 35 → Damage = 10 + 3.5 = 13-14 damage
```

**Enemy Turn:**
- Enemy attacks automatically (AI narrates)
- Damage based on enemy type:
  - Goblin: 8 damage
  - Orc: 15 damage
  - Troll: 25 damage
  - Dragon: 50 damage

**Combat continues until:**
- Enemy HP reaches 0 (victory)
- Player HP reaches 0 (death)
- Player successfully flees

**⚠️ Known Limitations (v0.1):**
- No initiative system (player always goes first)
- No multi-enemy encounters
- No tactical positioning
- No status effects in combat (planned v0.2)

---

## Momentum System (Adapted from D&D Inspiration)

**Earn Momentum by:**
- Creative solutions that surprise the AI (novel approaches)
- Overcoming very hard challenges (difficulty > skill + 20)
- Great roleplay (in-character decisions that create drama)
- Callbacks to earlier events (AI recognizes and rewards)

**Spend Momentum for:**
- **Reroll** - Retry a failed check (once per session)
- **Hint** - Get a clue without penalty
- **Auto-succeed** - Succeed on a routine check without rolling (non-combat)
- **Second Wind** - Restore 20 HP/Stamina in combat (once per session)

**Example:**
```
Player: "I try to convince the guard by pretending to be the Duke's nephew"

AI: "Bold. Deception check..."

[Rolls: Failure]

AI: "The guard narrows his eyes. 'The Duke doesn't have a nephew.'

Oh. Oh no.

**You've earned 1 Momentum Point!** (Creative lie, even though it failed)
[Momentum: 2/3]"
```

---

## Reflex Checks (Adapted from D&D Saving Throws)

**When danger strikes unexpectedly:**
- AI triggers automatic check
- No player choice
- Success reduces or avoids consequence

**Common Reflex Checks:**
- **Dodge trap** → Perception check
- **Resist poison** → Survival check
- **Resist charm/fear** → Persuasion check (force of will)
- **Catch falling ally** → Strength check
- **Spot ambush** → Perception check

**Example:**
```
You open the ancient chest...

⚠️ REFLEX CHECK!
A poison needle shoots from the lock!

[Perception: 22 vs Difficulty: 30] → FAILURE

The needle grazes your hand. You feel drowsy...
-8 HP
STATUS: Poisoned (3 turns, -15% to all checks, -5 HP per turn)
```

---

## Rest & Recovery System

**Camp (Quick Rest):**
- Takes 1 in-game hour
- Restores: 30% HP, 40% Stamina, 40% Mana
- Can only camp in "safe" areas (AI decides)
- Risk: Random encounters possible (15% chance)
- Effect: Advance world clock 1 hour

**Inn (Full Rest):**
- Costs: 10-50 gold (depends on inn quality)
- Restores: 100% HP, Stamina, Mana
- Removes: Poisoned, Exhausted status effects
- Effect: Advance world clock 8 hours
- Trade-off: Time-sensitive quests may progress/fail

**Strategic Decision:**
"Do we rest now and risk missing the deadline, or push forward wounded?"

---

## Status Effects (Afflictions)

**v0.1 Status Effects:**

| Effect | Duration | Penalty | Cure |
|--------|----------|---------|------|
| **Poisoned** | 5 turns | -15% all checks, -5 HP/turn | Antidote, Medicine check, Rest |
| **Bleeding** | Until healed | -10 HP/turn | Medicine check, Bandages |
| **Exhausted** | Until rest | -25% Stamina costs, -10% physical checks | Camp or Inn rest |
| **Frightened** | 3 turns | -20% combat actions, must flee or pass check | Time, or ally Persuasion check |

**Display:**
```
Your Status:
❤️ 45/100 HP
⚡ 60/100 Stamina
💀 POISONED (3 turns remaining)

The poison burns in your veins...
```

---

## Inventory System (v0.1 - Simple)

**Current Implementation:** List of items (no weight, no slots)

```
Inventory:
- rusty_sword (equipped)
- health_potion x2
- torch (lit)
- lockpick_set (5 picks remaining)
- mysterious_key
```

**Using Items:**

AI suggests contextually:
```
You're badly wounded (HP: 15/100)

What do you do?
1. 💊 Drink health potion [Restores 30 HP]
2. 🏃 Flee to safety [Survival: 20] - Your skill: 15 🟡 RISKY
3. ⚔️ Fight on (you might not survive another hit)
```

**Item Effects (v0.1):**
- **Health Potion:** +30 HP (instant)
- **Mana Potion:** +50 Mana (instant, Mage only)
- **Antidote:** Removes Poisoned status
- **Torch:** Enables vision in dark areas (lasts 1 hour)
- **Lockpick Set:** Required for lockpicking (can break on crit fail)
- **Rope:** Enables climbing, tying up NPCs

**📋 Planned (v0.2):**
- Equipment slots (weapon, armor, accessory)
- Item stats (+5 Strength sword, +10 HP armor)
- Durability system

---

## ⚠️ v0.2: Multiplayer Asymmetry (EXPERIMENTAL - Not Yet Implemented)

### The Core Innovation: Private Whispers

**How It Works:**

When players enter a new location:

**1. Public Narration** (Discord #story, everyone sees):
```
You enter a dusty library. Towering shelves line the walls, and a locked
chest sits in the corner, covered in arcane symbols. Silence presses down
like a weight.
```

**2. Private Whispers** (Discord DMs, class-based):

```
📱 DM to Mage:
"[Whisper - Arcana] You sense a powerful Abjuration ward on the third shelf.
The chest is a decoy—the REAL treasure is hidden behind the ward."

📱 DM to Thief:
"[Whisper - Perception] The chest lock is a Draken-5 model. Pickable, but
you notice a tripwire running from the chest to the ceiling. Someone will
drop when you open it."

📱 DM to Fighter:
"[Whisper - Strength] The floorboards near the window are rotted. You could
smash through to the room below—probably quieter than triggering that trap."
```

**3. The Planning Phase:**

Players switch to #planning channel (AI cannot read):
```
Sarah (Mage): "Guys the chest is fake! There's a ward on the third shelf"
Marcus (Thief): "Wait the chest is TRAPPED. Like, ceiling-drop trapped"
Jake (Fighter): "I can break through the floor if we need an escape route"
Sarah: "Okay so: Marcus disarms trap, I dispel ward, Jake stands ready?"
Marcus: "...what if I just DON'T open the chest and we go for the ward first?"
Jake: "Big brain move. Let's do it"
```

### Environmental Tactics (Enhanced Whispers)

**The Innovation: Whispers reveal tactical environmental options** (inspired by BG3)

**Example: Boss Fight in Warehouse**

**Shared Story (Everyone sees):**
```
The Crimson Sorcerer raises his staff. Lightning crackles around his fingers.
Crates and barrels line the walls. A heavy chandelier hangs from rusted chains.
Roll for initiative!
```

**Class-Specific Whispers:**
```
📱 Ranger Whisper:
"Cargo net above sorcerer - controlled by rope pulley on east wall.
Cut the rope = net falls, traps him. Also: chandelier chain is WEAK.
One arrow severs it."

📱 Fighter Whisper:
"Wine barrels (west wall) labeled 'ALCHEMICAL' - they're EXPLOSIVE.
Throw one into his lightning spell? Boom. Also: support beam (northeast)
shows rot damage. Kick it = ceiling collapses away from door."

📱 Mage Whisper:
"Sorcerer's spell draws power from FLOOR RUNES (arcane circle).
Disrupt them = spell fizzles. Also: water puddle near your feet
conducts lightning. Move or use it against him?"

📱 Thief Whisper:
"Hidden tripwire runs from crates to chandelier mechanism.
Someone PLANNED to drop it. Also: ventilation shaft (north wall)
leads behind sorcerer. Sneak attack opportunity?"
```

**Party Planning (#planning channel):**
```
Jake (Fighter): "I can throw the explosive barrel!"
Sarah (Mage): "Wait, throw it WHERE?"
Renna (Ranger): "Into the cargo net! I'll cut the rope first!"
Jake: "So: Renna cuts rope, net falls, I throw barrel INTO net?"
Sarah: "Then I disrupt the floor runes so he can't cast?"
Renna: "He'll be trapped, exploded, AND powerless. PERFECT."
Marcus (Thief): "...or I sneak through the vent and backstab?"
Jake: "TOO RISKY. Stick with the net combo."
```

**Environmental Action Options:**

```
What do you do?
1. ⚔️ Attack sorcerer directly [Strength: 35] 🟡 RISKY
   Standard melee combat

2. 🏹 Shoot chandelier chain [Archery: 25] 🟢 LIKELY
   → Chandelier falls (30 damage + stunned 2 turns)

3. 🔥 Throw explosive barrel at enemy [Strength: 20] 🟢 LIKELY
   → 40 damage to all in 10ft radius (including you if close!)

4. 🎯 COORDINATED: Ranger cuts net rope, Fighter throws barrel into net
   → Requires both players, but enemy trapped + exploded (60 damage!)

5. 🔮 Disrupt floor runes [Arcana: 30] 🟡 RISKY
   → Sorcerer can't cast spells for 3 turns

6. ✍️ Something else (describe your action)
```

**Why This Works:**
- **Rewards observation** (whispers reveal environment)
- **Enables creativity** (10+ ways to solve each combat)
- **Synergizes with whispers** (must share info to find best combo)
- **Creates memorable moments** ("I DROPPED A CHANDELIER ON HIM!")
- **Makes classes essential** (only Ranger sees the net, only Mage sees runes)

### Environmental Whisper Types by Class

**Ranger - Tactical Environment:**
- Weak structures (collapse ceiling, break bridge)
- Usable materials (rope, oil, flammable items)
- Natural hazards (loose rocks, animal nests, water currents)
- Escape routes (hidden paths, climbable walls)
- Choke points (narrow passages, bottlenecks)

**Fighter - Combat Advantages:**
- High ground positions
- Cover and defensible spots
- Improvised weapons (chairs, chains, barrels)
- Enemy positioning weaknesses
- Structural weak points (support beams, walls)

**Mage - Magical Interactions:**
- Magical conductors (water + lightning, metal + fire)
- Arcane power sources (runes, ley lines, crystals)
- Ward mechanisms (how to disable magical barriers)
- Elemental hazards (explosive gas, cursed ground)
- Spell amplification opportunities

**Thief - Hidden Mechanics:**
- Trap mechanisms (tripwires, pressure plates)
- Secret passages (hidden doors, crawlspaces)
- Valuable objects worth stealing
- Security weaknesses (blind spots, patrol patterns)
- Sabotage opportunities (cut support rope, poison supplies)

**Cleric - Spiritual Terrain:**
- Consecrated/cursed ground
- Holy symbols (can be used for protection)
- Undead vulnerabilities (sunlight, salt circles)
- Spiritual weak points (where to place blessings)
- Divine intervention opportunities

**Bard - Social Environment:**
- NPC motivations (who can be persuaded)
- Historical context (why this place matters)
- Cultural significance (taboos, customs)
- Distraction opportunities (play music to create chaos)
- Negotiation openings (offer alternative solutions)

**4. Party Action:**

Party leader uses command:
```
/action Marcus disarms the trap on the chest (just in case), then Sarah
dispels the ward on the third shelf while Jake watches the door.
```

AI resolves based on group coordination.

**Success Criteria:**
- Parties MUST share info to progress
- Solo players get stuck
- Withholding info = trust game / potential betrayal

---

## NPC Memory & Approval System (Inspired by BG3)

### The Living World That Remembers

**Philosophy:** NPCs aren't vending machines. They're people with memory, opinions, and consequences.

### How It Works

Every NPC the party meets has:

**1. Approval Rating (0-100):**
```
  0-20: HOSTILE - Attacks on sight, refuses all interaction
 21-40: UNFRIENDLY - Suspicious, unhelpful, overcharges
 41-60: NEUTRAL - Business-like, transactional
 61-80: FRIENDLY - Helpful, shares rumors, offers discounts
81-100: TRUSTED - Offers quests, reveals secrets, loyalty
```

**2. Memory Log:**
- What the party did for/to them
- Promises made (and broken)
- Lies told (if detected)
- Favors owed

**3. Reactive Dialogue:**
Greetings change based on approval:

```
GRIMSBY (Approval: 25 - Unfriendly):
"Oh. You again. What do you want?"

GRIMSBY (Approval: 75 - Friendly):
"Kaelen! Thank the gods. I need your help - and yes,
I'm paying this time. After that thing with Marcus...
I owe you. Big time."
```

### Approval Changes

**Gain Approval:**
- Help NPC (+5 to +20)
- Complete their requests (+10)
- Save their life (+30)
- Keep promises (+15)
- Share valuable information (+5)
- Defend them from enemies (+20)

**Lose Approval:**
- Lie to them, if caught (-10)
- Break promises (-20)
- Steal from them (-30)
- Threaten them (-15)
- Insult them (-5)
- Ignore cries for help (-10)

### Whispers Reveal NPC Secrets

**This is where YOUR innovation shines** - Class whispers reveal what NPCs are REALLY thinking:

**Example: Returning to Grimsby (Turn 30)**

**Shared Story (Everyone sees):**
```
Grimsby's eyes light up when he sees you. "My friends! I have news!"
```

**Class-Specific Whispers:**
```
📱 Mage Whisper:
"Grimsby's magical aura shows FEAR beneath the smile.
Someone cast a Charm spell on him within the last hour."

📱 Thief Whisper:
"Grimsby's hand signal (taught by Marcus) = 'DANGER, PLAY ALONG'
He keeps glancing at the corner booth. Two men watching."

📱 Fighter Whisper:
"Two armed mercenaries in corner booth. Grimsby's positioned
himself so his back is to the wall. He's expecting violence."

📱 Cleric Whisper:
"Grimsby's soul shows GRATITUDE... and GUILT. He wants to warn
you but something prevents him from speaking freely."
```

**Result:** Players must decode that Grimsby is in danger WITHOUT him saying it directly. They piece together:
- Mage: "He's charmed!"
- Thief: "He's signaling danger!"
- Fighter: "There are armed guys watching!"
- Cleric: "He wants to help but CAN'T!"

**Party coordination:** Rescue Grimsby without alerting the mercenaries.

### NPC Reputation Spreads

**Word gets around:**

```
TURN 10: You help Grimsby with cursed package (+20 approval)
TURN 15: Grimsby tells his merchant friends about you
TURN 25: Other merchants in district give you 10% discount
TURN 40: Merchant Guild offers you membership quest

[Reputation: "Friend of the Market District"]
```

**Bad reputation also spreads:**

```
TURN 8: You rob a merchant blind
TURN 12: Guards are alerted, watch for you
TURN 20: All shops in district charge you DOUBLE
TURN 35: Merchant Guild sends assassins

[Reputation: "Thief - Shoot on Sight"]
```

### Companion NPCs (Deep Bonds)

**Special NPCs who join the party** (like Renna the Rogue):

**Bond Levels (0-5):**
```
Level 0: Just met - Generic dialogue
Level 1: Acquaintance - Shares rumors
Level 2: Friend - Personal conversations
Level 3: Trusted - Reveals secrets, personal quest unlocks
Level 4: Close friend - Helps unconditionally
Level 5: Soulmate - Ultimate loyalty, romance path (optional)
```

**Example: Renna's Bond Progression**

```
TURN 5 (Bond 0 → 1):
Renna: "Name's Renna. I pick locks, you don't ask questions. Deal?"

TURN 15 (Bond 1 → 2):
Renna: "That guard reminded me of someone. The Guild used to
recruit kids like him. Naive. Then they'd USE them."
[Opens up about Thieves' Guild past]

TURN 30 (Bond 2 → 3):
Renna: "I need to tell you something. My brother RUNS the
Thieves' Guild. And he's looking for me."
[Personal Quest Unlocked: "Blood and Shadows"]

TURN 50 (Bond 3 → 4):
Renna: "You could've turned me in for the bounty. You didn't.
Why?"
> Player: "Because you're my friend"
Renna: "...I've never had a friend before."
[Renna Loyalty: MAX - will sacrifice herself for party]
```

**Whispers Reveal Companion Emotions:**

```
📱 Cleric Whisper:
"Renna's aura shows FEAR when her brother is mentioned.
Not fear of him - fear OF BECOMING him."

📱 Thief Whisper:
"Renna's checking exits compulsively. Old Guild training.
She's planning escape routes even among friends."

📱 Bard Whisper:
"Renna's body language softens when she looks at [Player].
She trusts you - rare for someone with her past."
```

### Long-Term Consequences (BG3's Secret Sauce)

**Actions ripple through time:**

```json
{
  "consequence_chains": [
    {
      "turn": 8,
      "action": "Player saved Grimsby from Name-Eater",
      "planted_seeds": [
        {
          "turn": 25,
          "event": "Grimsby leaves healing potion at inn with note: 'Thank you'"
        },
        {
          "turn": 50,
          "event": "Grimsby warns player about assassination plot"
        },
        {
          "turn": 80,
          "event": "Grimsby sacrifices himself to save player from ambush",
          "impact": "Emotional payoff for early kindness"
        }
      ]
    }
  ]
}
```

**Example Timeline:**

```
TURN 10: You lie to Guard Captain Vex about seeing strangers
        [Consequence planted: "Vex remembers this"]

TURN 25: Vex catches you in another lie
        "You lied to me before. At the Soggy Boot. About the strangers.
         Why should I believe you now?"
        [Vex Approval: -15]

TURN 50: Vex refuses to help during final battle
        "I don't work with liars. You're on your own."
        [Major consequence: No guard reinforcements]
```

### AI Prompt Integration

**The Chronicler tracks NPC state:**

```
When generating responses, check NPC approval:

IF approval >= 61 (Friendly):
  - NPC greets warmly
  - Offers help proactively
  - Shares rumors/secrets
  - Gives discounts/gifts

IF approval <= 40 (Unfriendly):
  - NPC is cold, suspicious
  - Refuses help unless paid extra
  - May lie or mislead
  - Alerts enemies to party location

IF approval <= 20 (Hostile):
  - NPC attacks on sight
  - Or: Flees and alerts authorities
  - Or: Sets trap for party
```

**Callbacks & Memory:**

```
The Chronicler remembers:
- Every named NPC the party has met
- What the party did for/to each NPC
- Promises made (track if broken)
- Items stolen/given
- Lies told (if detected by Thief whisper)

When NPC reappears, reference earlier encounter:
"You! You're the one who saved my daughter from the fire!
 I owe you everything. What do you need?"
```

### Implementation Notes

**v0.1 Prototype:**
- Track approval for KEY NPCs only (Grimsby, Renna, Guildmaster)
- Simple memory log (text list of important events)
- Reactive dialogue based on approval tier

**v0.2 MVP:**
- Approval for ALL named NPCs
- Reputation system (district-wide effects)
- Companion bond progression
- Long-term consequence chains

**v0.3 Full:**
- Romance paths (optional)
- Companion personal quests
- NPC-to-NPC relationships (Grimsby likes Renna, hates Marcus)

---

## 👥 Party Structure & Core Mechanics (v1.0)

### Party Composition

**Standard Party:** 2 Human Players + 1-2 NPC Companions = 3-4 Total Members

```
Party Example:
- Player 1 (Fighter)
- Player 2 (Mage)
- NPC Grimsby (Desperate Father)
- NPC Renna (Vengeful Rogue)

Total: 4 members
```

**Why This Structure:**
- **2 Players Minimum:** Core gameplay requires collaboration through asymmetric whispers
- **1-2 NPCs:** Add story hooks, moral complexity, and can betray/leave/die
- **4 Maximum:** Keeps combat manageable, makes every member matter
- **Fixed Party:** Cannot kick NPCs (must manage relationships)

---

### Trust Score System (Party-Wide)

**Trust Score Range:** 0-100 (tracks party cohesion)

#### Trust Tiers:

**🔥 HIGH TRUST (80-100) - "Unbreakable Bond"**
```
Effects:
- Group skill checks: +10 bonus
- NPCs share secrets willingly (no Persuasion needed)
- Divine Council favor: +5 to all gods
- Crisis moments: NPCs act to save players without hesitation
- Whisper reveals: NPCs volunteer information proactively

Visual: "Your party moves as one. Words are unnecessary."
```

**✅ MEDIUM TRUST (40-79) - "Professional"**
```
Effects:
- Normal gameplay (no modifiers)
- NPCs follow orders but keep some secrets
- Divine Council neutral
- Crisis moments: NPCs act based on approval rating
- Whisper reveals: NPCs share if asked with moderate Persuasion (DC 60)
```

**⚠️ LOW TRUST (10-39) - "Fragile Alliance"**
```
Effects:
- Group skill checks: -10 penalty
- NPCs suspicious, withhold information (Persuasion DC 80+)
- Divine Council disfavor: -5 to VALDRIS, ATHENA (value unity)
- Crisis moments: NPCs hesitate, may prioritize self-preservation
- Whisper reveals: NPCs lie or refuse to share
```

**💀 ZERO TRUST (0-9) - "Imminent Betrayal"**
```
Effects:
- Group skill checks: -20 penalty
- NPCs actively consider leaving/betraying
- Divine Council judgment: -10 to all gods except KAITHA (chaos)
- Crisis moments: NPCs may abandon party or act against group interest
- Whisper reveals: NPCs deliberately mislead
- WARNING: At 0 trust, NPC betrayal GUARANTEED within 2 turns
```

#### Trust Gain/Loss:

**GAINING TRUST (+):**
- +15: Share critical whisper that saves life
- +10: Share whisper that changes strategy
- +5: Share minor whisper proactively
- +10: Defend NPC when others doubt
- +15: Risk self to save companion
- +5: Admit mistake/apologize

**LOSING TRUST (-):**
- -20: Lie about whisper content (when caught)
- -15: Hide critical whisper that causes harm
- -10: Keep secret that would change decision
- -5: Refuse to share when directly asked
- -10: Act against group without explanation
- -15: Betray NPC to save self
- -25: Deliberately mislead party for personal gain
- -30: Betray player character (PvP betrayal)

---

### NPC Companion Mechanics

#### NPC Core Stats:

Every NPC has:
1. **Approval (0-100)** - Individual relationship with each player
2. **Strengths** - What party needs them for (skills, knowledge, connections)
3. **Fatal Flaw** - Weakness that can cause betrayal/death
4. **Hidden Agenda** - Secret goal (revealed gradually)
5. **Whisper Behavior** - What they share vs. hide
6. **Divine Favor** - Gods judge NPCs too (7 gods, -100 to +100 each)

#### NPC Approval System:

```
  0-20: HOSTILE - Will betray/leave/attack
 21-40: UNFRIENDLY - Minimal help, withholds info
 41-60: NEUTRAL - Professional, follows orders
 61-80: FRIENDLY - Helpful, shares info
81-100: DEVOTED - Loyal to death, shares secrets
```

**Approval Changes:**
- Complete NPC's personal quest: +20
- Defend NPC in combat: +15
- Share critical whisper with NPC: +10
- Make decision aligned with NPC's values: +5 to +10
- Save NPC's life: +30

**Approval Penalties:**
- Betray NPC's trust: -30
- Make decision against NPC's values: -10 to -15
- Ignore NPC's warnings (that prove correct): -10
- Steal from NPC: -40
- Attack NPC: -50 (becomes hostile)

#### Fatal Flaws (Trigger Conditions):

**IMPULSIVE (Renna-type):**
```
Trigger: Party encounters NPC's enemy/obsession
Effect (Trust <60): Acts alone, ignores party input
Effect (Trust 60+): Asks for support, waits for party
```

**COWARDLY:**
```
Trigger: Combat with 3+ enemies
Effect (Trust <60): Flees combat
Effect (Trust 60+): Stays but fights poorly (-20% effectiveness)
```

**GREEDY:**
```
Trigger: Large treasure discovered
Effect (Approval <60): Steals treasure, leaves party
Effect (Approval 60+): Nervous, asks about splitting evenly
```

**VENGEFUL:**
```
Trigger: Enemy who harmed NPC appears
Effect (Trust <60 + Approval <60): Attacks alone, likely dies
Effect (Trust 60+ OR Approval 60+): Asks for help
```

---

### Asymmetric Whisper System

**Core Innovation:** Each player/NPC receives DIFFERENT private information about the SAME situation.

#### Whisper Delivery Process:

**Step 1: PUBLIC SCENE** (Everyone sees same narration)
```
AI GM: "Grimsby leads you to Duke's warehouse. 'Medicine inside.
        My daughter has 3 days before slavers take her.'"

[Everyone sees this]
```

**Step 2: PRIVATE WHISPERS** (Individual messages based on class/skills)
```
📱 PLAYER 1 (Fighter, Perception 65):
"Guards are PROFESSIONALS, not thugs. This is a trap."

📱 PLAYER 2 (Mage, Arcana 70):
"You sense NECROTIC magic. Medicine is CURSED. 200 die if used."

📱 NPC GRIMSBY (Approval with P1: 55):
Internal whisper: "Confession letter in shipment. If found, I hang."
Shares: "I know warehouse layout" (helpful)
Hides: Confession letter (self-preservation)

📱 NPC RENNA (Trust: 45):
Internal whisper: "Brother orchestrated poisoning."
Shares: Nothing
Hides: Brother's involvement (planning solo revenge)
```

**Step 3: WHISPER SHARING PHASE**
```
AI GM: "🔮 WHISPERS DISTRIBUTED
[PLAYER 1 - Check your DMs]
[PLAYER 2 - Check your DMs]
[NPCs received whispers too. Will they share?]

Now discuss your options as a party..."
```

**Step 4: PARTY DISCUSSION**
```
Players/NPCs decide what to share:
- Player 1 shares: "It's a trap" → Trust +5
- Player 2 shares: "Medicine is cursed" → Trust +15 (critical!)
- Grimsby shares: Warehouse layout → Trust +5
- Grimsby hides: Confession letter → (no penalty yet, secret)
- Renna hides: Brother's involvement → (no penalty yet, secret)
```

**Step 5: DECISION**
```
Party makes choice based on INCOMPLETE information:
- Refuse heist → Grimsby's daughter dies
- Steal medicine → 200 plague victims die
- Share all whispers → Discover full truth, find alternative
```

#### Whisper Conflict Patterns:

**COMPLEMENTARY (Easy):**
```
P1: "Guard is scared"
P2: "Guard is blackmailed"
Combined: Guard is victim, negotiable
```

**CONTRADICTORY (Medium):**
```
P1: "Merchant is LYING"
P2: "Merchant is TERRIFIED"
Combined: Lying BECAUSE terrified (requires discussion)
```

**MUTUALLY EXCLUSIVE (Hard):**
```
P1: "Child suffering, MUST save NOW"
P2: "Medicine POISONED, kills 200 if used"
Combined: Impossible dilemma (moral choice required)
```

---

### NPC Whisper Sharing Behavior

**Algorithm:**
```python
def npc_shares_whisper(npc, whisper_importance, party_trust, npc_approval):
    # ALWAYS share if life-threatening and high approval
    if whisper_importance == 'CRITICAL' and npc_approval >= 60:
        return True

    # ALWAYS hide if conflicts with hidden agenda
    if whisper_conflicts_with_agenda(npc, whisper):
        if party_trust < 70:
            return False  # Lies or stays silent
        else:
            return False  # Omits but doesn't actively lie

    # Approval-based
    if npc_approval >= 70:
        return True  # Shares proactively
    elif npc_approval >= 40:
        return "shares_if_asked"  # Requires Persuasion DC 60
    else:
        return False  # Refuses

    # Trust overrides
    if party_trust >= 80:
        return True  # High trust = party unity > secrets
    elif party_trust <= 20:
        return False  # Low trust = withhold everything
```

**Example - High Trust vs Low Trust:**

**HIGH TRUST (85):**
```
PLAYER 1: "My whisper says it's a trap."
PLAYER 2: "Mine says medicine is poisoned. 200 die."
GRIMSBY: "I... need to confess. There's a letter that incriminates me."
RENNA: "The guard works for my brother. He poisoned the medicine."

[ALL WHISPERS SHARED - Full information]
```

**LOW TRUST (15):**
```
PLAYER 1: "It's a trap. That's all."
PLAYER 2: "Medicine is dangerous. Don't steal it."
GRIMSBY: "I have nothing to add."  [LIES]
RENNA: "Same."  [LIES]

[INCOMPLETE INFORMATION - Secrets withheld]
```

---

### NPC Betrayal & Leaving

#### Betrayal Conditions:

**Guaranteed Betrayal (100% chance) when:**
- Trust = 0 + Approval <20 + 2 turns elapse
- Player attacks NPC (immediate retaliation)
- Fatal flaw triggered + Trust <40 + Approval <40

**Possible Betrayal (roll d100) when:**
- Trust 10-20 + Approval <30 (30% chance per turn)
- Hidden agenda directly blocked by party (50% chance)
- NPC offered better deal by enemy (Approval <50, 40% chance)

#### Betrayal Actions:

```
MINOR BETRAYAL (Low stakes):
- Steals non-essential item, flees
- Refuses to help in combat
- Lies about enemy location

MAJOR BETRAYAL (High stakes):
- Steals quest objective, joins enemy
- Attacks party during combat
- Reveals party location to enemies
- Poisons food/supplies
```

#### NPC Leaving (Non-hostile):

**"Option B" - NPC can leave and return later:**
```
Trigger: Approval <40 + Disagreement about major decision

GRIMSBY (Approval 30):
"I can't be part of this. I'm leaving."

[Grimsby leaves party]
[Can be recruited again later if Approval raised to 60+]
[Requires 3-turn quest to make amends]
```

**Permanent Death:**
```
Trigger: NPC dies in combat OR betrays and is killed

RENNA dies fighting brother:
"Tell them... I tried..." [Last words]

[Renna PERMANENTLY removed from game]
[Cannot be resurrected]
[Other NPCs remember and mourn]
```

---

### Integration with Divine Council

**NPCs Testify Before Gods:**

When Divine Council convenes, NPCs speak BEFORE gods vote:

```
═══════════════════════════════════════════
⚖️ THE GODS DEBATE YOUR FATE ⚖️
═══════════════════════════════════════════

[Your companions speak first]

👤 GRIMSBY (Approval 75):
"This hero saved my daughter. VALDRIS, this is justice made real."
[VALDRIS listens: +5 influence toward SUPPORT]

👤 RENNA (Approval 45):
"They let my brother's killers walk. I question their honor."
[KORVAN listens: +3 influence toward OPPOSE]

[Now gods vote, influenced by NPC testimonies]

✅ VALDRIS: "Grimsby speaks truth. You honored your oath."
❌ KORVAN: "Renna's doubt troubles me..."
═══════════════════════════════════════════
```

**NPC Testimony Influence:**
```
Testimony Strength = (Approval / 20) + (NPC Divine Favor with God / 30)

High Approval NPC (70+) defending player = +6 to +10 vote influence
Low Approval NPC (30-) condemning player = -6 to -10 vote influence

If ALL NPCs defend (Approval 60+): +10% bonus to all god votes
If NPCs divided testimony: Gods more likely to DEADLOCK (3-3-1)
```

---

### Party Mechanics Summary

**Core Loop:**
1. **Scene narrated** (public, everyone sees)
2. **Whispers distributed** (private, class-based)
3. **Sharing phase** (players/NPCs decide what to reveal)
4. **Discussion** (party coordinates based on shared info)
5. **Decision** (action taken with incomplete knowledge)
6. **Consequences** (trust changes, approval changes, Divine Council may judge)

**Key Systems:**
- **Trust (0-100):** Party cohesion, affects NPC sharing
- **Approval (0-100):** Individual NPC relationship
- **Fatal Flaws:** NPC weaknesses that trigger betrayal
- **Hidden Agendas:** NPC secret goals revealed over time
- **Asymmetric Whispers:** Different info creates collaboration necessity
- **Divine Council:** Gods judge with NPC testimony influence

**Design Goals:**
- **No "right" answer** - Moral dilemmas with only consequences
- **Collaboration required** - Asymmetric info forces teamwork
- **Trust matters** - Secrets vs. transparency affects outcomes
- **NPCs feel real** - Can betray, die permanently, defend you
- **Consequences permanent** - Dead NPCs stay dead

---

## 👑 Party Leader System (Async Multiplayer)

### The Challenge: Keeping Async Games Alive

**The Problem:**
- Players check in at different times (lunch, commute, before bed)
- Rarely all online simultaneously
- Game must keep moving 24/7
- One AFK player can't block everyone

**The Solution:**
> "The leader keeps the game alive, but doesn't control other players' souls."

### Two-Tier System

**1. LEADER POWERS** - Keep game moving
- Accept/decline quests
- Trigger party rests
- Set travel destinations
- Initiate major decision votes
- Autopilot AFK players

**2. PLAYER AUTONOMY** - Sacred individual control
- Own actions & dialogue choices
- Private whispers (leader CANNOT see)
- Personal items & gold
- When they play (real life > game)

---

### 👑 Leader Powers

#### 1. Quest Management

**Leader-only command:** `/accept_quest [id]` or `/decline_quest [id]`

```
[Guildmaster offers: "Find the Missing Caravan"]

LEADER sees:
✅ /accept_quest missing_caravan (starts 8-hour timer)
❌ /decline_quest missing_caravan (continue exploring)
🗳️ /discuss_quest missing_caravan (ask party first, 30-min timer)

Jake (Leader): "/accept_quest missing_caravan"

Bot: "✅ Quest accepted: Find the Missing Caravan
      - Time limit: 8 hours (real-time)
      - Reward: 200 gold
      - Party is now committed

      ⏳ Party has 5 minutes to object or quest begins"
```

**Objection System:**
```
Sarah: "/object quest"

Bot: "⚠️ Sarah objects to quest!

      @Jake (leader) choose:
      1. /cancel - Listen to Sarah
      2. /override - Force quest anyway (leader privilege)
      3. /vote - Let party decide"
```

#### 2. Rest Management

**Leader-only command:** `/rest [camp/inn]`

```
Jake: "/rest inn"

Bot: "🛏️ RESTING at inn
      - Cost: 30 gold from PARTY FUNDS
      - Restores: 100% HP/Stamina/Mana
      - Time: Evening → Morning (8 hours)
      - Removes: Poisoned, Exhausted status effects

      ⏳ 5 minutes to object or rest happens"

[No objections after 5 min]

Bot: "✅ Party rests. All resources restored."
```

#### 3. Travel Coordination

**Leader-only command:** `/travel [location]`

```
Jake: "/travel Old Mill"

Bot: "📍 TRAVEL ORDER: Party heading to Old Mill
      - Journey time: 15 minutes (real-time)
      - ETA: 3:45 PM
      - Random encounter chance: 20%

      Party can continue actions during travel or prepare for arrival"
```

#### 4. Major Decision Voting

**Leader-only command:** `/vote [decision_name] [option1/option2/...]`

```
[NPC offers: "Betray Marcus to save the city?"]

Jake: "/vote betray_marcus yes/no"

Bot creates Discord poll:
"🗳️ PARTY VOTE: Betray Marcus to save 10,000 lives?

✅ YES - Betray Marcus (save city)
❌ NO - Stay loyal (risk destruction)
🤔 ABSTAIN - Let others decide

React to vote. Closes in: 2 hours (or when all vote)

Votes hidden until close"

[After 2 hours or all votes:]

Bot: "🗳️ RESULTS:
      ✅ YES: 2 votes (Jake, Sarah)
      ❌ NO: 1 vote (Renna)
      🤔 ABSTAIN: 1 vote (Marcus)

      MAJORITY WINS: Party betrays Marcus

      [Consequences:]
      - Marcus Approval: -50 (now HOSTILE)
      - City saved (+reputation)
      - Marcus: 'I won't forget this. Ever.'"
```

**When Votes Required (can't be unilateral):**
- ✅ Betray an NPC/ally
- ✅ Join a faction
- ✅ Sacrifice a party member
- ✅ Split the party
- ✅ Spend party funds (>100 gold)
- ✅ Kick a player from party

**When Leader Decides (with objection timer):**
- ⚡ Accept routine quests
- ⚡ Rest at camp/inn
- ⚡ Travel to locations
- ⚡ Buy items with party funds (<100 gold)

#### 5. AFK Management (Emergency)

**Leader-only command:** `/autopilot [player] [defensive/basic/aggressive]`

```
Situation: Combat encounter, Marcus offline 6+ hours

Jake: "/autopilot @Marcus defensive"

Bot: "🤖 AUTOPILOT ENABLED: Marcus (Thief)
      - Mode: DEFENSIVE
      - Will dodge/hide if attacked
      - Won't use items or make risky moves
      - Owner can reclaim control anytime

      This prevents game from stalling"

[Marcus logs back in]

Bot: "👋 Welcome back @Marcus!
      You were on autopilot (defensive mode).
      Combat happened: You dodged 2 attacks, hid behind crates.
      Resuming manual control."
```

**AFK Detection:**
```
Bot auto-warns after 6 hours inactive:

"⚠️ @Marcus has been inactive 6 hours during active quest

@Jake (leader) options:
1. ⏸️ Pause quest timer (wait for Marcus)
2. 🤖 Autopilot Marcus (basic defensive AI)
3. 📤 Continue without Marcus (he misses rewards)

Choose within 30 min or option 3 auto-applies"
```

---

### 🚫 What Leaders CANNOT Do

**FORBIDDEN (these violate player autonomy):**

❌ **Control another player's actions**
```
Leader: "Everyone attack!"
Sarah: "/action I run away"
✅ ALLOWED - Sarah controls her character
[Consequence: Party might be mad at her]
```

❌ **See other players' whispers**
```
📱 Mage Whisper (only Sarah sees):
"The dragon is an ILLUSION. Real threat behind you."

Leader CANNOT:
- See this whisper
- Force Sarah to share it
- Punish Sarah for keeping secret

Sarah's choices:
✅ Share in #planning: "Guys it's fake!"
✅ Keep secret: (maybe she wants chaos?)
✅ Lie: "My whisper says attack!" (trust game!)
```

❌ **Spend another player's personal gold**
```
Sarah has 50 personal gold

Leader CANNOT:
- Force Sarah to buy potions
- Take Sarah's gold
- Give Sarah's items to others

Leader CAN:
- Ask nicely: "Sarah can you buy potions?"
- Use PARTY funds instead
- Vote to kick if Sarah hoards maliciously
```

❌ **Force players to be online**
```
Leader: "Everyone online at 8 PM for raid!"
Sarah: "I have work. Can't make it."

✅ ALLOWED - Real life > game
[Leader can autopilot Sarah with her permission, or continue with 3 players]
```

---

### 🔄 Leadership Transfer

#### Voluntary Transfer

**Command:** `/transfer_leader [player]`

```
Jake: "/transfer_leader @Sarah"

Bot: "👑 Leadership transferred!
      @Sarah is now party leader
      @Jake remains in party as regular member"
```

#### Vote to Remove Leader (Mutiny)

**Command:** `/vote_remove_leader`

```
Situation: Leader AFK 48+ hours, blocking game

Renna: "/vote_remove_leader"

Bot: "🗳️ MUTINY VOTE: Remove Jake as leader?

      Requires 75% (3/4 players) to pass

      Jake stays in party unless separately voted to kick

      Vote closes: 24 hours"

[If passed:]

Bot: "👑 Jake removed as leader!

      🗳️ Choose new leader:
      React to vote:
      🔮 @Sarah (Mage)
      🗡️ @Renna (Rogue)
      🏹 @Marcus (Ranger)

      Highest votes = new leader (closes in 1 hour)"
```

#### Leader Abandons Party

```
[Leader quits game entirely]

Bot: "⚠️ Leader has left the party!

      🗳️ EMERGENCY ELECTION
      Choose new leader (vote closes in 1 hour):
      React to candidates...

      Highest votes wins"
```

---

### ⚖️ Leader vs. Autonomy Examples

#### Example 1: Split Strategy

**Leader's Plan:**
```
Jake in #planning: "Plan: I tank, Sarah blast, Renna flank"
```

**Player's Execution:**
```
TURN 1:
Jake: "/action I charge the dragon" ✅ Follows plan
Sarah: "/action I cast lightning" ✅ Follows plan
Renna: "/action I steal treasure while it's distracted" ❌ CHAOS!

Bot: "Renna sneaks to hoard while dragon fights Jake...
      Stealth check: SUCCESS! You grab a jeweled crown."

Jake in #planning: "RENNA WTF?!"
Renna in #planning: "I'm a THIEF. This is what I DO."
```

**Resolution:**
- No code enforcement
- Social dynamics handle it
- Party might kick Renna later via vote
- Or: They laugh and it becomes party legend

#### Example 2: Whisper Secrets

**Scenario:** Library puzzle

**Shared Story (everyone sees):**
```
"The library is silent. A locked chest in the corner."
```

**Class Whispers:**
```
📱 Mage Whisper (only Sarah):
"The chest is a DECOY. Real treasure behind ward on shelf 3."

📱 Thief Whisper (only Renna):
"Chest is TRAPPED. Ceiling-drop mechanism."
```

**Player Choices:**
```
Sarah in #planning: "My whisper says chest is fake!"
Renna in #planning: "Mine says it's trapped!"

Jake (Leader): "So we go for shelf 3?"
Sarah: "Yeah I can dispel the ward"

[Both shared - cooperation wins]

ALTERNATE SCENARIO:
Sarah: (says nothing about chest being fake)
Renna opens chest → TRAP TRIGGERS
Sarah: "Oh... my whisper said it was fake. Sorry forgot to mention."

[Betrayal? Forgetfulness? Trust game!]
```

---

### 🚨 Emergency Systems

#### System 1: Deadlock Resolution

```
TRIGGER: Vote tied for 24 hours

Bot: "🗳️ DEADLOCK (24 hours)

      Vote: Betray Marcus (2 yes, 2 no)

      EMERGENCY OPTIONS:
      1. Leader breaks tie (Jake's vote counts 1.5x)
      2. Status quo wins (don't betray)
      3. Random coin flip

      @Jake (leader) choose in 1 hour or option 2 auto-applies"
```

#### System 2: Leaderless Party

```
TRIGGER: No leader for 1+ hour

Bot: "⚠️ ANARCHY MODE

      No active leader detected

      Temporary rules:
      - All major decisions require unanimous vote
      - Any player can trigger votes
      - First to ✅ react acts as temp leader

      Recommend: /vote_leader to choose permanent leader"
```

---

### 📊 Leader Dashboard

**Command:** `/leader_status` (leader-only)

```
Bot shows leader:

👑 PARTY LEADER DASHBOARD

📍 Location: Old Mill
⏰ Quest: "Find Caravan" (2h 15m remaining)
💰 Party Funds: 150 gold

🎮 ONLINE NOW:
⚔️ Jake (Leader) - 🟢 ACTIVE
🔮 Sarah (Mage) - 🟢 ACTIVE

💤 OFFLINE:
🗡️ Renna (Rogue) - Last seen: 45 min ago
🏹 Marcus (Ranger) - Last seen: 3 hours ago ⚠️

⚡ PENDING DECISIONS:
- [Vote] Betray Marcus? (closes 1h 20m)
- [Timer] Inn rest objection (4 min left)

🔧 LEADER COMMANDS:
/rest [camp/inn] - Rest party
/travel [location] - Set destination
/accept_quest [id] - Accept quest
/autopilot [player] - AI control AFK player
/vote [decision] - Trigger vote
/transfer_leader - Give leadership away
```

---

### 💡 Async Play Example (Full Day)

**Monday 8 AM - Leader starts day:**
```
Jake: "/accept_quest missing_caravan"
Bot: "Quest accepted! 8-hour timer."
Jake: "/travel Merchant_District"
[Jake logs off - going to work]
```

**Monday 12 PM - Player 2 lunch break:**
```
Sarah logs in:
Bot: "Party traveling to Merchant District (ETA: 2 PM)"
Sarah: "/action I research caravan routes during travel"
Bot: [Resolves, Sarah gains lore]
[Sarah logs off - back to work]
```

**Monday 3 PM - Player 3 after work:**
```
Renna logs in:
Bot: "Party arrived: Merchant District!"
Renna: "/action I question merchants about caravan"
Bot: [Narrates scene + Thief whisper: "Merchant is LYING"]
Renna in #planning: "My whisper: merchant LYING"
[Renna logs off]
```

**Monday 7 PM - SYNC OPPORTUNITY:**
```
All online!
Bot: "🎉 ALL PLAYERS ONLINE - Sync mode available!"

Jake: "Okay team: merchant lying (Renna), caravan went through Darkwood (Sarah). Marcus what's your whisper?"
Marcus: "Bandits in Darkwood. We need to prepare."

Jake: "/vote go_darkwood yes/no"
[Votes: 3 yes, 1 no]
Jake: "/travel Darkwood_Forest"

[Party plays 1 hour together, then scatter]
```

**Result:** Game progressed over 12 hours with async check-ins. Leader kept it alive!

---

### Implementation Notes

**v0.1 Prototype:**
- Single leader (first player = auto-leader)
- Basic `/rest` and `/travel` commands
- 5-minute objection timer
- Simple voting (reactions)

**v0.2 MVP:**
- `/transfer_leader` command
- `/autopilot` for AFK players
- Voting system for major decisions
- Leader dashboard

**v0.3 Full:**
- AFK detection (6-hour warning)
- Deadlock resolution (24-hour auto-resolve)
- Mutiny system (`/vote_remove_leader`)
- Leadership history tracking

---

## Presence & Async Play System

### Online Status Tracking

**Auto-updating #status channel:**
```
🎮 THE CRIMSON BLADES - Party Status

⚔️ Jake (Fighter) 🟢 ONLINE - Last action: 2 min ago
🔮 Sarah (Mage) 🟡 IDLE - Last action: 23 min ago
🗡️ Marcus (Thief) 🔴 OFFLINE - Last seen: 3 hours ago

🟢 2 players online NOW - Sync window available!
⏰ Current Quest: "Find the Missing Caravan" (4h 23m remaining)
```

**Status Types:**
- 🟢 **ONLINE** - Active, responded in last 5 min
- 🟡 **IDLE** - Discord open but inactive 5-30 min
- 🔴 **OFFLINE** - Not seen in 30+ min
- 🌙 **SLEEPING** - Do Not Disturb mode (mutes urgent pings)
- ⚡ **IN COMBAT** - Currently in real-time encounter

### Sync Opportunities

When 2+ players are online simultaneously:

```
🎉 SYNC OPPORTUNITY! 🎉

Jake and Sarah are both online!

You can now:
- 🤝 Plan together in real-time (faster decisions)
- ⚔️ Enter combat as a duo (combined actions)
- 🗣️ Have in-character conversation
- 📍 Meet up in-game (coordinate locations)

Type /sync to enable 10-minute real-time mode
```

**Real-Time Mode:**
- 10-minute window
- AI responds within 30 seconds
- Players can combo actions
- After timer: returns to async

### Breadcrumbs (For Async Play)

When a player acts while others are offline:

```
[4:47 PM] Sarah types: /action I search the library for summoning magic

Bot: "You spend an hour researching ancient tomes..."

[Result narrated to #story]

📨 Breadcrumb left for party:
"Sarah discovered the symbol is INFERNAL origin. This is demon magic."

[Discord ping sent to Jake & Marcus' phones]
```

**Breadcrumb Types:**
- 🔍 **Discovery** - Found critical clue
- ⚠️ **Warning** - Danger ahead (urgent)
- 📦 **Loot** - Found items (added to shared inventory)
- 🗨️ **NPC Intel** - Important conversation happened
- ❓ **Question** - Needs party vote ("Should we trust this NPC?")

### Catch-Up System

When a player returns after being offline:

```
[7:32 PM] Marcus comes online

🔔 WELCOME BACK, MARCUS!

While you were away (3 hours):
✅ Jake and Sarah met the Guildmaster
✅ They learned the caravan was hit by SUMMONED creatures (not bandits)
✅ Sarah found a tracking spell (needs YOUR lockpicking to activate it)
⚠️ Jake is currently waiting at the Old Warehouse for you

💬 3 messages in #planning need your input
📍 Party location: Warehouse District

Quick Actions:
1. ✅ Catch up in 2 minutes (AI summary)
2. 📖 Read full log (5 min, see everything)
3. 🏃 Jump in now ("What do you need me to do?")
```

This creates **healthy FOMO** without forcing synchronous play.

---

## Death & Failure States

**Death (HP = 0):**
```
Your vision fades to black. The last thing you hear is the clang of steel...

💀 YOU HAVE DIED 💀

Options:
1. ⏮️ Restart from last checkpoint (5 minutes ago)
2. 🔄 Create new character (keep party progress)
3. 👻 Spectator mode (watch party, can't act)
4. 🚪 Quit session
```

**v0.1:** Simple restart from checkpoint
**📋 v0.2:** Respawn with penalty, permadeath toggle option

**Stuck States:**

If player seems confused (invalid actions 3x):
```
🤔 You seem stuck. Would you like a hint?

> yes

[Hint] The runes on the door spell "FRIEND" in Old Elvish. Perhaps
speaking the word aloud...?

(This hint cost you 1 Momentum Point)
```

**Safety Rule:** AI will NEVER soft-lock the game. Every puzzle has ≥2 solutions.

---

## 📋 FUTURE: Additional Classes (v0.2+)

**Ranger** - Wilderness scout, tracker, ranged specialist
- Whispers: Environmental hazards, creature tracks, escape routes
- Skills: Archery +15, Survival +10, Perception +10

**Cleric** - Healer, undead hunter, divine magic
- Whispers: Undead detection, lies/deception, holy symbols, curses
- Skills: Medicine +15, Persuasion +10, Divine Magic +10

**Bard** - Social specialist, lore expert, jack-of-all-trades
- Whispers: NPC emotions, historical lore, rumors, cultural clues
- Skills: Persuasion +15, Performance +15, Deception +10, Lore +10

**Implementation:** Post-prototype, once 3-class system is validated

---

## 🎭 Anti-Cliché Design Principles

**These principles are EMBEDDED in the AI prompt:**

### 1. Subvert Fantasy Tropes

**❌ Don't:**
- "You enter a dark tavern..."
- "A mysterious hooded figure..."
- "The ancient evil awakens..."

**✅ Do:**
- Specific details (smells, sounds, textures)
- Subvert expectations (hooded figure is incompetent)
- Fresh descriptions (tavern is weirdly cheerful despite the danger)

### 2. NPCs Are People, Not Quest Dispensers

**Every NPC has:**
- A name + memorable quirk
- A clear motivation (not just "needs heroes")
- Personality revealed through dialogue

**Example:**
```
Guildmaster Thorne (60s, ex-adventurer, missing left hand):

"You're the new recruits? Gods, you're young. I remember being young.
I also remember having TWO hands, so let's skip the 'glory and adventure'
speech and get to the part where I tell you not to die stupidly."
```

### 3. Surprising Twists (Layered Clues)

**Technique:** Plant seeds early, pay off later

- Turn 1: NPC mentions "the weight"
- Turn 5: Caravan manifest says "silk" (silk isn't heavy?)
- Turn 8: Reveal - it was a weapons smuggling operation

### 4. Comedy Through Specificity

**Generic:** "The goblin attacks."
**Specific:** "The goblin charges, trips over his own sword sheath, and lands face-first in mud. He gets up FURIOUS and somehow MORE dangerous."

### 5. Creative Actions Get Creative Responses

**Player:** "I seduce the door"
**AI:** "The GUARD on the other side asks, 'Are you... hitting on the door?'"
[New option unlocked: Confusion tactic]

### 6. Moral Complexity

**Not:** Kill the necromancer (quest complete)
**But:** The necromancer is a 14-year-old girl raising her dead mother for protection. What do you do?

---

## 🧪 Testing Checklist (v0.1 Prototype)

### Core Mechanics
- [ ] Character creation displays correct class bonuses
- [ ] Action choices show 3-4 options + custom
- [ ] Success indicators (🟢🟡🔴) calculate correctly
- [ ] Skill check math works across difficulty range
- [ ] Skills increment correctly (+1/+2/+3 based on challenge)
- [ ] Favorable/unfavorable conditions apply correctly (+/- 15%)
- [ ] Critical success (1-5) and failure (96-100) trigger

### Combat
- [ ] Damage formula correct (10 + skill/10)
- [ ] Enemy damage applies to player HP
- [ ] Combat ends when enemy/player reaches 0 HP
- [ ] Death state triggers at HP = 0

### Items & Resources
- [ ] Inventory add/remove works
- [ ] Potions heal correct amount
- [ ] Stamina/Mana deplete and regenerate
- [ ] Resting restores correct percentages

### AI Quality (MOST IMPORTANT)
- [ ] AI creates specific, non-generic descriptions
- [ ] NPCs have names and personality quirks
- [ ] AI responds cleverly to unexpected actions
- [ ] AI doesn't hallucinate items/abilities not in state
- [ ] 15-minute session feels engaging and fun

### Success Criteria (User Testing)

**Ask playtesters:**
1. ❓ Did you laugh at least once? (Humor test)
2. ❓ Were you surprised by something? (Twist test)
3. ❓ Do you remember any NPC's name? (Character test)
4. ❓ Did your choices feel meaningful? (Agency test)
5. ❓ Do you want to play again tomorrow? (Engagement test)

**If 4/5 are "YES"** → Prototype successful, proceed to MVP
**If <4/5** → Refine AI prompts until entertaining

---

## 📝 Changelog

### v0.1-prototype (2025-10-30)
- Initial mechanics design
- 3 classes defined (Fighter/Mage/Thief)
- Guided action system (3-4 choices + custom)
- Skill check formulas with favorable/unfavorable
- Momentum system (adapted from D&D Inspiration)
- Reflex checks (adapted from D&D Saving Throws)
- Rest system (camp vs inn trade-offs)
- Status effects (poisoned, bleeding, exhausted, frightened)
- Critical success/failure mechanics
- Async/mobile-first design principles
- Presence system and breadcrumbs
- Anti-cliché design philosophy embedded
- Future classes defined (Ranger/Cleric/Bard for v0.2)

---

## 🔗 Related Documents
- **PROMPTS.md** - Claude's full system prompt with personality rules
- **TECH_STACK.md** - Implementation (Python, Discord, Claude API)
- **PROTOTYPE_PLAN.md** - 3-5 day build schedule
- **VISION.md** - Post-prototype features (transmedia, scaling, monetization)

---

**Status:** ✅ Ready for implementation
**Next Step:** Create PROMPTS.md with AI personality instructions
