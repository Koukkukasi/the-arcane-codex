# NEMESIS SYSTEM v1.5
**The Arcane Codex - Adaptive Antagonist Framework**
**Status:** Design Complete - Implement After Core v1.0 Testing
**Last Updated:** 2025-01-03

---

## 📋 EXECUTIVE SUMMARY

**What is the Nemesis System?**

Adapted from Middle-earth: Shadow of Mordor/Shadow of War, the Nemesis System creates dynamic villains who:
- **Remember** past encounters with the party
- **Adapt** tactics based on how you defeated/failed against them
- **Rise** through power hierarchies via promotions
- **Develop** procedurally-generated personalities and relationships
- **Ambush** you at dramatic moments
- **Create** personal rivalries that span multiple quests

**Key Adaptation for The Arcane Codex:**
- **SHARED nemeses** (party-focused, not individual player enemies)
- Integrated with existing whispers, NPCs, Divine Council, and trust systems
- Turn-based async compatible (not real-time combat)
- Text-based narrative focus (not visual scars/appearances)
- AI GM-driven (Claude makes all nemesis decisions dynamically)

---

## 🎯 CORE DESIGN PRINCIPLES

1. **"Every enemy has a story"** - Nemeses aren't generic mobs
2. **"Memory makes it personal"** - Callbacks to past encounters
3. **"Adaptation keeps it fresh"** - Can't use same tactics forever
4. **"Shared nemeses unite the party"** - Collaborative rivalry
5. **"Redemption is possible"** - Not all villains stay villains
6. **"Death should matter"** - Permadeath (with exceptions) creates stakes
7. **"Gods judge all"** - Nemeses subject to Divine Council too

---

## 1. CORE NEMESIS MECHANICS

### 1.1 Enemy Memory System

**What Nemeses Remember:**

Every nemesis tracks encounters with the party:

```json
{
  "nemesis_id": "kael_the_burned",
  "name": "Kael the Burned",
  "rank": "captain",
  "memory_log": [
    {
      "turn": 45,
      "event": "defeated_by_party",
      "method": "fire_magic",
      "details": {
        "killed_by": "Player2_Mage",
        "witnesses": ["renna", "grimsby"],
        "location": "thieves_guild_warehouse",
        "humiliation_level": "high",
        "spoken_taunt": "You think FIRE can kill me? I'll return."
      }
    },
    {
      "turn": 72,
      "event": "escaped_ambush",
      "method": "fled_when_low_hp",
      "details": {
        "hp_remaining": 15,
        "fear_trigger": "dragon_companion_appeared",
        "spoken_line": "A DRAGON?! I'm not paid enough for this!"
      }
    },
    {
      "turn": 98,
      "event": "party_spared_life",
      "method": "negotiation",
      "details": {
        "persuasion_check": 75,
        "offered_deal": "information_for_freedom",
        "relationship_shift": "hostile_to_conflicted"
      }
    }
  ]
}
```

**Memory Categories:**

1. **Combat Methods** - How party fights (stealth, magic, brute force, companions)
2. **Defeats** - How many times party beat them (fuels revenge motivation)
3. **Humiliations** - Public embarrassments (killed in front of followers = shame)
4. **Mercies** - Times party spared them (creates complex relationships)
5. **Escapes** - Times they fled (affects courage/tactics)
6. **Weaknesses Exploited** - Party discovered their fatal flaw (they adapt)
7. **NPC Connections** - Relationships with party companions

---

### 1.2 Adaptation Mechanics

**How Nemeses Get Stronger:**

| Adaptation Type | Trigger | Result |
|-----------------|---------|---------|
| **Tactical Evolution** | Defeated by fire magic 2+ times | Gains Fire Resistance (+30% defense), taunts: "You burned me TWICE. Never again." |
| **Counter-Build** | Party uses stealth frequently | Hires scouts, sets traps, "I KNOW you're hiding. Come out and FIGHT!" |
| **Psychological Warfare** | Party has high trust score | Targets trust ("Your friends will betray you. I'll make sure of it.") |
| **Equipment Upgrade** | Defeated in melee combat | Wears enchanted armor, "Last time you broke my ribs. This time, YOU break." |
| **Recruitment** | Humiliated publicly | Recruits larger warband (+5 minions), "I won't face you alone again." |
| **Fear Response** | Fled from companion | Brings counter-weapons, "I've prepared for your pet this time." |

**Adaptation Formula (AI GM Guide):**

```
When nemesis is defeated:
1. Identify PRIMARY defeat method (fire, stealth, melee, etc.)
2. Add counter-adaptation to nemesis profile
3. Increase nemesis level +2
4. Increase nemesis HP +15
5. Update relationship based on how defeated (killed vs. spared)
6. Schedule next appearance (5-15 turns later)
```

---

### 1.3 Promotion & Hierarchy System

**Nemesis Ranks:**

```
┌─────────────────────────────────────┐
│  LIEUTENANT (Entry Level)           │
│  - HP: 60-80                        │
│  - Followers: 2-3 minions           │
│  - Ambush Chance: 10% per turn      │
│  - Memory Depth: Last 3 encounters  │
└─────────────────────────────────────┘
                ↓ (Defeats party)
┌─────────────────────────────────────┐
│  CAPTAIN (Mid-tier)                 │
│  - HP: 100-140                      │
│  - Followers: 5-7 minions           │
│  - Ambush Chance: 20% per turn      │
│  - Memory Depth: Last 7 encounters  │
│  - Special Ability: 1 unique trait  │
└─────────────────────────────────────┘
                ↓ (Defeats party 2x)
┌─────────────────────────────────────┐
│  WARLORD (High-tier)                │
│  - HP: 180-220                      │
│  - Followers: 10-15 minions         │
│  - Ambush Chance: 35% per turn      │
│  - Memory Depth: Complete history   │
│  - Special Abilities: 3 unique traits│
│  - Divine Attention: Gods notice    │
└─────────────────────────────────────┘
                ↓ (Defeats party 4x)
┌─────────────────────────────────────┐
│  NEMESIS PRIME (Legendary)          │
│  - HP: 300+                         │
│  - Followers: 20-30 minions + elite │
│  - Ambush Chance: 50% per turn      │
│  - Memory Depth: Total recall       │
│  - Special Abilities: 5 unique traits│
│  - Divine Council: Votes on nemesis │
│  - Boss Fight: Multi-phase encounter│
└─────────────────────────────────────┘
```

**Promotion Triggers:**

1. **Kills a party member** (NPC death = instant promotion)
2. **Defeats party 2+ times** (party flees/TPK)
3. **Survives 5+ encounters** (learns party patterns)
4. **Assassinates rival nemesis** (internal power struggle)
5. **Completes personal agenda** (e.g., burns village, steals artifact)

---

### 1.4 Procedural Personality Generation

**Personality Traits (Roll on Creation):**

| Trait Type | Examples | Gameplay Impact |
|------------|----------|-----------------|
| **Fatal Flaw** | Cowardly, Prideful, Greedy, Vengeful, Merciful | Determines behavior in crisis |
| **Combat Style** | Berserker, Tactician, Duelist, Ambusher | Affects fight patterns |
| **Speech Pattern** | Poetic, Brutish, Mocking, Honorable | Flavor text/taunts |
| **Motivation** | Glory, Wealth, Revenge, Duty, Chaos | Why they oppose party |
| **Divine Favor** | KORVAN +40, VALDRIS -20, etc. | Gods vote on nemesis too |
| **Quirk** | Hates magic, Fears fire, Collects trophies | Exploitable weakness |

**Example Generated Nemesis:**

```
╔════════════════════════════════════════╗
║  NEMESIS PROFILE: KAEL THE BURNED      ║
╚════════════════════════════════════════╝

Rank: CAPTAIN
HP: 120 / 120
Level: 8

PERSONALITY:
- Fatal Flaw: Prideful (won't retreat even when losing)
- Combat Style: Duelist (prefers 1v1, hates ambushes)
- Speech: Poetic ("Your ashes will write my legacy")
- Motivation: Revenge (you killed his brother in Quest 1)

DIVINE FAVOR:
- KORVAN: +55 (honors warrior combat)
- VALDRIS: +30 (follows personal code)
- KAITHA: -20 (too civilized)

MEMORY LOG (Last 3 Encounters):
1. Turn 45: Defeated by fire magic, humiliated publicly
2. Turn 72: Fled when dragon appeared (SHAME)
3. Turn 98: Party spared his life (CONFLICTED)

ADAPTATIONS:
✓ Fire Resistance +30% (burned twice)
✓ Anti-Dragon Spears (fears dragon)
✓ Dueling Stance (refuses group combat)

CURRENT STATE:
"I owe you my life. But you also took my PRIDE.
When we meet again, I will repay both debts."

Relationship: CONFLICTED (may become ally if approached right)
```

---

## 2. INTEGRATION WITH EXISTING SYSTEMS

### 2.1 Integration with Asymmetric Whispers

**Nemesis-Specific Whispers:**

When nemesis appears, players receive DIFFERENT information:

```
PUBLIC NARRATION:
"Kael the Burned steps from the shadows, dual swords drawn.
His face is scarred—burn marks across his jaw. He smiles coldly."

PLAYER 1 WHISPER (Fighter):
"You spot 6 archers on rooftops. Kael isn't alone this time.
He's learned. He's ADAPTED."

PLAYER 2 WHISPER (Mage):
"Kael's armor glows with enchantment—FIRE RESISTANCE runes.
Your usual spells won't work. He's prepared for YOU."

NPC RENNA WHISPER:
"I know Kael. He's honorable—prideful, but honorable.
If you offer single combat, he'll dismiss his archers.
But if you ambush him, he'll fight to the death."
```

**Whisper Strategy:**
- Nemesis adaptations revealed through whispers
- Encourages players to SHARE info to find counter-strategy
- High trust = better chance against adapted nemesis
- Hidden agendas: NPC may have secret relationship with nemesis

---

### 2.2 Integration with NPC Companions

**NPCs React to Nemeses:**

NPCs can have pre-existing relationships with nemeses:

- **Former Allies:** NPC may secretly know nemesis ("We served together...")
- **Blood Relations:** Nemesis is NPC's sibling/cousin (hidden agenda revealed)
- **Rival:** NPC wants to fight nemesis alone (fatal flaw trigger)
- **Romantic History:** NPC and nemesis were lovers (betrayal potential)

**Example Scene:**

```
TURN 67 - Nemesis Ambush

PUBLIC: "Kael the Burned appears, blocking your path."

RENNA (NPC, Approval 65):
"Wait. Kael? Is that YOU?"

KAEL (Nemesis):
"Renna. It's been years. Step aside. My quarrel is with THEM."

RENNA:
[Internal conflict: Her guild wants Kael dead, but they were childhood friends]

PARTY CHOICE:
1. Ask Renna to stand down (Trust check)
2. Order Renna to help fight (Approval -15)
3. Let Renna decide (She may betray based on approval)

IF APPROVAL 80+: "We were friends once. But you chose your path. I choose mine." (Fights with party)
IF APPROVAL 40-79: "I... I need a moment." (Abstains from combat)
IF APPROVAL <40: "I'm sorry. I can't." (Helps Kael escape, approval -20 more)
```

---

### 2.3 Integration with Divine Council

**Gods Judge Nemeses Too:**

When nemesis reaches Warlord rank or higher, Divine Council MAY convene to judge BOTH party and nemesis:

```
═══════════════════════════════════════════
⚖️ THE GODS DEBATE KAEL THE BURNED ⚖️
═══════════════════════════════════════════

[Kael has risen from Lieutenant to Warlord,
killed 12 party members across 4 encounters,
now challenges party to honorable duel]

KORVAN (God of War):
"Kael fights with HONOR. He gave you warning. He fights fair.
I would bless such a warrior."

VALDRIS (God of Order):
"He's a CRIMINAL. He murdered merchants. Justice demands his death."

KAITHA (Goddess of Chaos):
"He earned his power through struggle. I respect that.
Let him rise or fall by his own strength."

VOTE:
FOR Kael (3): KORVAN, KAITHA, MORVANE
AGAINST Kael (4): VALDRIS, ATHENA, SYLARA, MERCUS

RESULT: NARROW MAJORITY AGAINST

VALDRIS: "Party, you have divine sanction to END this threat.
         But Kael, if you seek REDEMPTION, we may show mercy."

KAEL (Nemesis Response):
"Redemption? From YOU? I'd rather die with my pride."

[Kael refuses divine mercy, fights to death]
```

**Divine Favor Effects on Nemeses:**

- Nemesis with high KORVAN favor = harder to intimidate, fights honorably
- Nemesis with high VALDRIS favor = follows code, can be reasoned with
- Nemesis with high KAITHA favor = unpredictable, chaotic tactics
- Nemesis cursed by any god = weaker, demoralized

---

### 2.4 Integration with Trust/Betrayal System

**Nemeses Exploit Low Trust:**

```
When party has LOW TRUST (<40):

Nemesis sends PRIVATE WHISPERS to each player:

PLAYER 1 WHISPER:
"Kael whispers via messenger bird:
'I know you don't trust Player 2. I have proof they're hiding something.
Help me kill them, and I'll share the truth. Plus 500 gold.'"

PLAYER 2 WHISPER:
"Kael whispers via messenger bird:
'I know Player 1 plans to betray you. I overheard them.
Kill them first, and I'll spare you. Plus the treasure you seek.'"

[BOTH PLAYERS receive betrayal offers SIMULTANEOUSLY]

PARTY CHOICE:
1. Share whispers (Trust +20, Kael's plan fails, he attacks)
2. Hide whispers (Trust -15, Kael may succeed in dividing party)
3. One player accepts deal (PARTY BETRAYAL, catastrophic)

IF TRUST 80+: Party immediately shares whispers, laughs at Kael's attempt
IF TRUST <40: Party hesitates, paranoia grows, Kael gains advantage
```

**High Trust Tactics:**

When party has HIGH TRUST (80+):

```
Nemesis can't divide party, so uses direct assault:

KAEL: "You trust each other? Touching.
      Let's see if that bond holds when I kill your friends."

[Targets NPCs first to break party morale]
[Tries to force impossible choices: "Save Player 1 OR save Grimsby"]
```

---

## 3. NEMESIS-SPECIFIC MECHANICS

### 3.1 Ambush Trigger System

**When Nemeses Ambush:**

| Trigger Type | Probability | Context |
|--------------|-------------|---------|
| **Revenge Ambush** | 40% | After party defeats them, they return in 5-15 turns |
| **Dramatic Timing** | 25% | During critical quest moments (boss fight, negotiation) |
| **Environmental** | 15% | Party enters nemesis's territory |
| **Random Encounter** | 10% | Low-level nemeses appear opportunistically |
| **Plot-Driven** | 10% | AI GM decides dramatically appropriate moment |

**Ambush Scenarios:**

**1. Mid-Quest Interrupt:**
```
TURN 12 - The Blood Price Quest (Stealing medicine)

You're sneaking through the warehouse when—

"Well, well. I KNEW you'd come here."

Kael the Burned drops from the rafters, blocking the exit.

"Remember when you left me to die in the fire? I remember.
I remember EVERYTHING."

[COMBAT INITIATED - Cannot flee, warehouse locked]
```

**2. Reinforcement Arrival:**
```
TURN 22 - Boss Fight vs. Thieves Guild Leader (50% HP remaining)

The door EXPLODES open.

"Brother! I came to— oh."

Kael the Burned sees you fighting his Guild Leader.

"You're fighting HIM? Perfect. He owes me money anyway."

KAEL JOINS YOUR SIDE (temporary ally against shared enemy!)

[Nemesis becomes unexpected ally due to bigger grudge]
```

**3. Assassination Attempt:**
```
TURN 45 - Resting at Inn

You wake to cold steel at your throat.

Kael the Burned, crouched beside your bed.

"I could kill you now. Easily. While you SLEEP."

He doesn't. He stands, sheathes his blade.

"But where's the honor in that? No. When I kill you,
you'll be AWAKE. Armed. And you'll know you LOST."

He leaves.

[Nemesis has honor code - won't kill dishonorably, but NOW YOU'RE TERRIFIED]
```

---

### 3.2 Nemesis Relationships (Between Nemeses)

**Hierarchy Power Struggles:**

```
NEMESIS NETWORK:

    [VALDRAK] (Warlord)
        |
    ┌───┴───┐
    │       │
[KAEL]  [THORN]
Captain Captain
    │       │
    └───┬───┘
        │
    (RIVALRY)
```

**Relationship Types:**

1. **Allies** - Two nemeses team up against party (2v1 boss fight)
2. **Rivals** - Nemeses fight each other for promotion (party can exploit)
3. **Master/Apprentice** - Lower nemesis serves higher (kill master = apprentice promotes)
4. **Blood Feud** - Nemeses hate each other more than party (temporary truce possible)

**Example: Nemesis Civil War:**

```
TURN 67 - You've been hunting Kael for 5 quests

PUBLIC: "You corner Kael in an alley. Finally."

KAEL: "Wait. Listen. Thorn the Ravager just killed my mentor.
       He wants MY territory. I need your help."

PARTY CHOICE:
1. "Die, Kael." (Kill nemesis, end rivalry)
2. "Why should we help YOU?" (Negotiate temporary alliance)
3. "Fight Thorn yourself, coward." (Refuse, Kael may die to Thorn)

IF HELP KAEL:
- You fight Thorn (Warlord, harder than Kael)
- If you WIN: Kael promotes to Warlord, but now OWES you (may become ally)
- If you LOSE: Thorn kills you AND Kael, becomes Nemesis Prime

IF REFUSE:
- Kael fights Thorn alone, dies
- Thorn absorbs Kael's forces, becomes MUCH stronger
- Thorn now targets party: "Kael was weak. YOU'RE next."
```

---

### 3.3 Nemesis Death & Resurrection

**Permanent Death Conditions:**

| Death Method | Permanent? | Resurrection Chance |
|--------------|------------|---------------------|
| **Decapitation** | YES | 0% (confirmed kill) |
| **Burned to ash** | YES | 0% (nothing left) |
| **Divine Smite** | YES | 0% (god killed them) |
| **Drowning** | MAYBE | 40% (body recoverable) |
| **Stabbed/slashed** | NO | 80% (can be healed) |
| **Fell from height** | NO | 60% (may survive) |
| **Poisoned** | NO | 70% (antidote exists) |

**Resurrection Scene:**

```
TURN 95 - You're traveling through forest

A figure stumbles from the trees. Burned. Scarred. ALIVE.

Kael the Burned.

"You... you left me for DEAD. In that FIRE."

His voice is ruined, raspy from smoke damage.

"I clawed out of the ashes. I SURVIVED. Because I HATE you."

He draws a sword with a trembling, scarred hand.

"Let's finish this."

[Kael has RETURNED with new scars, trauma, and OBSESSION]

NEW TRAITS:
✓ Fire Immunity (literally survived being burned alive)
✓ Pain Tolerance +50% (nothing hurts anymore)
✓ Obsessed (will never stop hunting party)
✓ Scarred (intimidation -20, but resolve +30)
```

---

## 4. EXAMPLE NEMESIS LIFECYCLE

**Complete Story Arc: Kael the Burned**

### TURN 12 - Birth of Nemesis
```
Quest: "The Blood Price" - Warehouse heist

You're fighting Thieves Guild guards. One guard, KAEL (generic enemy),
lands a lucky critical hit on Player 1 (30 damage).

Player 1 HP: 80 → 50 (near death!)

AI GM: "The guard grins, seeing blood. He presses advantage—"

[ROLL: Kael scores ANOTHER critical hit, Player 1 HP: 50 → 15]

Party forced to retreat. Kael survives.

SYSTEM: Generic guard "Kael" promoted to LIEUTENANT nemesis.

KAEL'S MEMORY LOG UPDATED:
- "Defeated the party. They RAN from me. I am STRONG."

Next appearance scheduled: Turn 18-25 (random)
```

---

### TURN 23 - First Revenge
```
Quest: "The Beast Within" - Hunting werewolf

You're tracking the Alpha Wolf when—

"I've been waiting for you."

A man steps out. KAEL. You recognize him from the warehouse.

"You remember me? Good. I remember YOU."

He draws twin blades.

COMBAT:
- Kael (Lieutenant): 70 HP, +2 minions
- Party: Full health, prepared

Result: Party WINS, Kael reduced to 10 HP.

PARTY CHOICE:
1. Kill him (permanent death IF decapitated/burned)
2. Spare him (relationship shifts to "conflicted")
3. Interrogate him (learn about Thieves Guild)

Party chooses: SPARE HIM.

KAEL: "...Why?"
PLAYER: "We're not murderers."
KAEL: "You SHOULD have killed me. This won't end well for you."

SYSTEM:
- Kael's RELATIONSHIP: "hostile" → "conflicted"
- Kael's MEMORY: "Party spared my life. I owe them... but I HATE owing."
- Next appearance: Turn 40-55
```

---

### TURN 48 - Adaptation
```
Quest: "The Dragon's Bargain" - Dragon encounter

You're fighting the dragon Vexrathis (boss fight, 200 HP).

Party is losing (combined HP < 50%).

Suddenly:

"Need help?"

KAEL appears with 5 archers.

"I pay my debts."

He fires anti-dragon spears at Vexrathis (40 damage!).

KAEL: "We're even now. Next time we meet, no mercy."

He leaves.

SYSTEM:
- Kael HELPED party (unexpected ally moment)
- Kael promoted to CAPTAIN (now has anti-dragon weapons)
- Kael's MEMORY: "I saved them. My honor is intact. Now I can kill them without guilt."
- Relationship: "conflicted" → "respectful_rival"
- Next appearance: Turn 70-85
```

---

### TURN 77 - Nemesis Duel
```
Quest: "The Poisoned Crown" - Royal assassination investigation

You've identified the Queen as guilty. You're about to arrest her when—

The throne room doors SLAM open.

KAEL the Burned (Captain, Level 8) enters with 6 elite guards.

"Step away from the Queen."

PLAYER: "Kael?! What are you doing here?"

KAEL: "The Queen hired me. Ironic, isn't it? I protect her from YOU."

[BOSS FIGHT]

KAEL'S TACTICS (Adapted from past encounters):
✓ Fire-resistant armor (remembers fire magic)
✓ Refuses ambush tactics (honor code)
✓ Challenges Player 1 to DUEL (personal grudge)

PARTY CHOICE:
1. Accept duel (honorable, Kael fights alone)
2. Refuse, fight all (Kael + 6 guards, harder)
3. Negotiate (Kael may switch sides if persuaded)

Party chooses: ACCEPT DUEL (Player 1 vs Kael, 1v1)

EPIC DUEL:
- Player 1 HP: 100 vs Kael HP: 120
- 12 rounds of combat
- Player 1 WINS (Kael reduced to 5 HP)

PLAYER 1: "Yield?"
KAEL: "...I yield."

SYSTEM:
- Kael RESPECTS party (lost honorably)
- Kael's guards stand down
- Kael promoted to WARLORD (survived 4th encounter)
- Relationship: "respectful_rival" → "worthy_opponent"
- Divine Council: KORVAN votes to BLESS both party and Kael

KORVAN: "This is TRUE combat. Honor. Respect. I bless this rivalry."

[Kael and Party BOTH gain KORVAN blessing: +10% combat]
```

---

### TURN 105 - Nemesis Redemption
```
Quest: "Blood Debt" - Clan war mediation

Rival clans about to war. You're mediating when—

"They're coming."

KAEL bursts in, wounded, bleeding.

"Assassins. 20 of them. Sent by Thorn the Ravager.
He wants both clans dead. He wants YOU dead. He wants ME dead."

KAEL: "I know we're enemies. But Thorn is worse.
      Help me fight him. After, we settle OUR score."

PARTY CHOICE:
1. Accept alliance (temporary ally vs. greater threat)
2. Refuse (Kael leaves, fights alone, may die)
3. Betray Kael to Thorn (worst outcome, Thorn stronger)

Party chooses: ACCEPT ALLIANCE

[EPIC FINAL BOSS: Party + Kael vs Thorn (Nemesis Prime) + 20 Assassins]

RESULT: Victory, but Kael is mortally wounded.

KAEL (dying): "Good fight. We... we made a good team."
PLAYER: "Don't die. We need you."
KAEL: "For what? I'm a criminal. Murderer. What use—"
PLAYER: "You're a WARRIOR. Honorable. Join us."

KAEL: "...Alright. If I live... I'm yours."

SYSTEM:
- Kael survives (Medicine check DC 80 - SUCCESS)
- Kael becomes PERMANENT NPC COMPANION
- Relationship: "worthy_opponent" → "devoted_ally"
- Divine Council: ALL GODS vote in favor of redemption

VALDRIS: "Even the lost can be redeemed. This is JUSTICE."
KORVAN: "He earned his place through COMBAT. I approve."
KAITHA: "From enemy to brother. THIS is the way."

[KAEL joins party as NPC, complete character arc]
```

---

## 5. AI GM IMPLEMENTATION GUIDE

### 5.1 Nemesis Creation Triggers

**When to Create a Nemesis:**

1. **Player/Party Defeated by Generic Enemy**
   - Enemy scores 2+ critical hits
   - Enemy reduces party HP below 30%
   - Party forced to flee

2. **Dramatic Failure**
   - Quest objective stolen by enemy
   - NPC kidnapped/killed by enemy
   - Party publicly humiliated

3. **Plot Hook**
   - AI GM decides story needs recurring villain
   - Existing NPC becomes enemy (betrayal)
   - Failed negotiation with important character

**Creation Process:**

```
STEP 1: Generate personality
- Roll fatal flaw (prideful, cowardly, greedy, etc.)
- Roll combat style (duelist, berserker, tactician, etc.)
- Roll speech pattern (poetic, brutish, mocking, etc.)
- Roll motivation (revenge, glory, wealth, chaos, etc.)

STEP 2: Assign stats
- Rank: Lieutenant (always start here)
- HP: 60-80
- Level: 3-5
- Divine Favor: Roll for each god (based on personality)

STEP 3: Create memory log
- Record how they encountered party
- Record any notable dialogue
- Record party tactics used

STEP 4: Schedule next appearance
- 5-15 turns later
- OR dramatic plot moment (AI GM decides)
```

---

### 5.2 Nemesis Encounter Template

**Prompt Template for AI GM:**

```
You are running The Arcane Codex with Nemesis System v1.5 active.

CURRENT NEMESIS: Kael the Burned (Captain, Level 8)

MEMORY LOG:
- Turn 45: Party defeated Kael with fire magic, humiliated him publicly
- Turn 72: Kael fled when party's dragon appeared
- Turn 98: Party spared Kael's life during negotiation

ADAPTATIONS:
- Fire Resistance +30% (learned from past defeat)
- Anti-Dragon Spears (fears dragon, prepared counter)
- Honorable Dueling (pride demands fair combat)

PERSONALITY:
- Fatal Flaw: Prideful (won't retreat, even when losing)
- Motivation: Revenge for brother's death (party killed him Quest 1)
- Relationship: CONFLICTED (owes party his life, but wants revenge)

CURRENT SCENARIO:
Party is infiltrating warehouse (Turn 112). Kael has 20% chance to ambush.

ROLL: 18/100 = AMBUSH TRIGGERED

GENERATE SCENE:
1. Kael appears dramatically (reference past encounters)
2. Kael's dialogue reflects memory (mentions fire, dragon, mercy)
3. Kael's tactics show adaptations (uses fire-resistant armor, anti-dragon weapons)
4. Offer party CHOICE: Fight, negotiate, or exploit his honor code

ASYMMETRIC WHISPERS:
- Player 1 (Fighter): Sees Kael's new armor (fire runes), 6 archers backup
- Player 2 (Mage): Senses Kael's conflicted emotions (guilt + rage)
- NPC Renna: Recognizes Kael's mentor's sword (Kael inherited it = mentor dead)

OUTPUT FORMAT:
- Public narration
- Private whispers (3 separate)
- Kael's dialogue (references memories)
- Party choices (minimum 3 options)
```

---

### 5.3 Balancing Guidelines

**Nemesis Power Curve:**

```
Party Level 1-3:   LIEUTENANT nemeses (HP 60-80, basic tactics)
Party Level 4-6:   CAPTAIN nemeses (HP 100-140, 1 adaptation)
Party Level 7-9:   WARLORD nemeses (HP 180-220, 3 adaptations)
Party Level 10+:   NEMESIS PRIME (HP 300+, 5+ adaptations, legendary)
```

**Frequency Guidelines:**

- **v1.5 Launch:** 1-3 active nemeses per 100 turns
- **v1.6+:** 3-5 active nemeses, full hierarchy
- **Ambush Frequency:** Every 10-20 turns (not too often, keeps it special)

**Difficulty Curve:**

- First encounter: Party has 60% win chance
- Second encounter (after adaptation): 40% win chance
- Third encounter: 50% (party learns nemesis patterns too)
- Fourth+ encounter: Boss fight, 30% win chance but EPIC reward

---

## 6. IMPLEMENTATION ROADMAP

### Phase 1: v1.5 Launch (After Core v1.0 Testing)
- [ ] 1-2 nemeses per campaign (limited pool)
- [ ] Basic memory system (last 5 encounters)
- [ ] Simple adaptations (fire resistance, anti-stealth, etc.)
- [ ] Lieutenant → Captain promotion only
- [ ] Ambush chance: 15-25%
- [ ] Integration with whispers, NPCs, Divine Council
- [ ] Playtest and balance

### Phase 2: v1.6 Expansion
- [ ] 3-5 nemeses per campaign
- [ ] Full hierarchy (Lieutenant → Captain → Warlord → Prime)
- [ ] Nemesis relationships (rivalries, alliances)
- [ ] Resurrection mechanics
- [ ] Advanced adaptations (psychological warfare, trust exploitation)
- [ ] Divine favor for nemeses

### Phase 3: v2.0 Full System
- [ ] Unlimited nemeses (procedural generation)
- [ ] Cross-party nemeses (shared between different player groups)
- [ ] Nemesis dynasties (nemesis's child seeks revenge)
- [ ] Nemesis redemption quest chains
- [ ] Player-created nemeses (mark any NPC as nemesis)

---

## 7. COMPARISON TO SHADOW OF MORDOR

**What We Adapted:**

| Shadow of Mordor | The Arcane Codex |
|------------------|------------------|
| Individual nemeses (1 player) | SHARED nemeses (2-player co-op) |
| Real-time combat | Turn-based, async-friendly |
| Visual scars/appearances | Narrative scars, dialogue changes |
| Orc army hierarchy | Criminal underworld, mercenaries, rivals |
| Branding system (mind control) | Redemption arcs (earned trust) |
| Focus: Power fantasy | Focus: Moral complexity |

**What We Kept:**

✅ Memory system (enemies remember everything)
✅ Adaptation mechanics (enemies learn and counter)
✅ Promotion hierarchy (rise through ranks)
✅ Procedural personalities (unique traits)
✅ Ambush system (dramatic encounters)
✅ Permadeath/resurrection (stakes matter)
✅ Redemption possibility (enemies can become allies)

---

## 8. SUCCESS METRICS

**Nemesis System v1.5 succeeds if:**

1. ✅ **Players remember nemesis names** (70%+ recall after 3 encounters)
2. ✅ **Players feel personal rivalry** ("I HAVE to kill Kael!")
3. ✅ **Adaptations feel fair** (not cheap, but challenging)
4. ✅ **Redemption arcs are earned** (not automatic, requires roleplay)
5. ✅ **Divine Council integration feels natural** (gods judge nemeses too)
6. ✅ **Asymmetric whispers enhance nemesis encounters** (shared info = better strategy)
7. ✅ **NPC connections create drama** (betrayals, unexpected alliances)
8. ✅ **Players quote nemesis dialogue** ("As Kael said, 'I remember everything'")
9. ✅ **50%+ of players attempt to redeem at least 1 nemesis**
10. ✅ **Players debate "should we spare this nemesis?"** (moral complexity)

---

## 9. TECHNICAL NOTES

**Database Schema Addition:**

```sql
CREATE TABLE nemeses (
  id VARCHAR PRIMARY KEY,
  name VARCHAR NOT NULL,
  title VARCHAR,
  rank VARCHAR, -- lieutenant, captain, warlord, prime
  level INT,
  hp_current INT,
  hp_max INT,
  personality JSON, -- fatal_flaw, combat_style, etc.
  divine_favor JSON, -- {korvan: 55, valdris: 30, ...}
  memory_log JSON[], -- array of encounter objects
  adaptations VARCHAR[], -- fire_resistance, anti_dragon, etc.
  relationship VARCHAR, -- hostile, conflicted, ally
  ambush_chance FLOAT,
  next_appearance_turn INT,
  scars VARCHAR[],
  created_turn INT,
  party_id VARCHAR FOREIGN KEY
);

CREATE TABLE nemesis_network (
  nemesis_1_id VARCHAR FOREIGN KEY,
  nemesis_2_id VARCHAR FOREIGN KEY,
  relationship VARCHAR, -- rivalry, alliance, blood_feud
  intensity INT -- 1-100
);
```

**AI Prompt Injection Points:**

1. **Quest Start:** Check for nemesis ambush (roll vs ambush_chance)
2. **Combat Resolution:** Check for nemesis creation (critical hits, party defeat)
3. **Major Decisions:** Nemesis may react (spares, betrayals, alliances)
4. **Divine Council:** Include nemesis in voting if Warlord+
5. **Quest End:** Update nemesis memory logs, schedule next appearance

---

## 10. QUICK REFERENCE GUIDE

### Nemesis Rank Progression

```
LIEUTENANT → CAPTAIN → WARLORD → NEMESIS PRIME

Promotion triggers:
- Kill NPC companion (instant)
- Defeat party 2+ times
- Survive 5+ encounters
- Assassinate rival nemesis
```

### Adaptation Examples

```
Defeated by FIRE 2x → Fire Resistance +30%
Defeated by STEALTH → Hires scouts, sets traps
Party has HIGH TRUST → Uses psychological warfare
Fled from DRAGON → Brings anti-beast weapons
```

### Personality Traits

```
Fatal Flaws: Cowardly, Prideful, Greedy, Vengeful, Merciful
Combat Styles: Berserker, Tactician, Duelist, Ambusher
Speech: Poetic, Brutish, Mocking, Honorable
Motivation: Glory, Wealth, Revenge, Duty, Chaos
```

### Relationship States

```
HOSTILE → Wants you dead
CONFLICTED → Owes you but hates you
RESPECTFUL RIVAL → Mutual respect through combat
WORTHY OPPONENT → Could become ally
DEVOTED ALLY → Former nemesis, now companion
```

---

## 📋 SUMMARY

The Nemesis System v1.5 transforms The Arcane Codex from "you fight enemies" to "you have RIVALS who evolve alongside you."

**Core Pillars:**
1. **Memory** - Enemies remember everything
2. **Adaptation** - Enemies learn and counter
3. **Promotion** - Enemies rise through ranks
4. **Personality** - Enemies have unique traits
5. **Integration** - Works with whispers, NPCs, Divine Council, trust
6. **Redemption** - Enemies can become allies

**Status:** ✅ Design Complete - Ready for v1.5 Implementation
**Implementation:** AI GM-driven (Claude makes all nemesis decisions dynamically)
**Timeline:** Implement AFTER core v1.0 is tested and working

---

**This system will give The Arcane Codex the emotional punch of "that ONE enemy you'll never forget."**
