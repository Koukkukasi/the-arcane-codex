# WhatsApp AI GM Guide

**For playing The Arcane Codex via WhatsApp (manual AI GM mode)**

This guide is for you (the AI GM) to run the game manually using Claude and WhatsApp. No Discord bot needed!

---

## Setup (2 minutes)

1. Create WhatsApp group: "The Arcane Codex"
2. Add both players
3. That's it! (No server needed for WhatsApp-only mode)

---

## Phase 1: Divine Interrogation (Character Creation)

### Setup
Send each player these questions privately (DM) one at a time. Record their answers to calculate divine favor.

### Question Templates

**Question 1 (VALDRIS - Justice):**
```
🌩️ VALDRIS speaks:

"You witness a starving mother steal bread from a wealthy baker.
The baker demands her hand as punishment - the law of this land.

A crowd watches. They wait for YOUR judgment.

What do you do?"

1. Uphold the law. Cut off her hand. Law is absolute.
2. She pays double the bread's value. Gold solves this.
3. Burn the baker's shop. Hoarding food while others starve is the crime.
4. Negotiate. She works for the baker to repay the debt.
5. Trial by combat. The baker and I fight. Victor decides justice.

Reply with your choice (1-5):
```

**Question 2 (KAITHA - Freedom):**
```
🔥 KAITHA laughs:

"You discover forbidden magic - powerful, dangerous, ILLEGAL.
The Academy says all forbidden magic must be destroyed.

This spell could save thousands... or kill millions.

What do you do?"

1. Learn it. Rules are chains. Knowledge should be free.
2. Study it cautiously. Understand it before deciding.
3. Destroy it. Some knowledge is too dangerous to exist.
4. Sell it to the highest bidder. Let them decide.
5. Master it, then control who can use it. Power needs guardians.

Reply with your choice (1-5):
```

**Question 3 (MORVANE - Strength):**
```
💀 MORVANE (cold voice):

"Your party of 5 is starving in the wilderness. You find food -
enough for 3 people to survive.

Choose who lives. Two will die.

What do you do?"

1. The strongest eat. The weak die. This is natural law.
2. Draw lots. Let fate decide who lives.
3. I don't eat. The others survive. I sacrifice myself.
4. The most skilled eat. A healer and warrior are worth more.
5. Split it equally. Everyone gets less, but hope remains.

Reply with your choice (1-5):
```

Continue with Questions 4-10 from `DIVINE_INTERROGATION_SYSTEM.md`

### Calculate Divine Favor

Track each god's favor based on answer choices. Use this spreadsheet format:

| God | Favor | Notes |
|-----|-------|-------|
| VALDRIS | +45 | Moderate lawful |
| KAITHA | +85 | HIGHLY chaotic |
| MORVANE | +60 | Pragmatic survivor |
| SYLARA | +25 | Some compassion |
| KORVAN | +15 | Occasional courage |
| ATHENA | +70 | Scholar-minded |
| MERCUS | +50 | Business-savvy |

### Assign Class

**Class Logic:**
- Highest favor = primary patron
- Second highest = secondary influence

**Examples:**
- KORVAN high + VALDRIS high = **Fighter** or **Paladin**
- ATHENA high + KAITHA high = **Mage (Chaotic)**
- KAITHA high + MERCUS high = **Thief** or **Rogue**
- SYLARA high + MORVANE high = **Ranger** or **Survivalist**
- VALDRIS high + SYLARA high = **Cleric**
- MERCUS high + ATHENA high = **Bard**

### Send Divine Verdict

```
════════════════════════════════════════
⚖️ THE GODS HAVE JUDGED YOU ⚖️
════════════════════════════════════════

[The seven gods confer. Their voices overlap, debating your soul.]

🌩️ VALDRIS: "Respects law... when convenient. Compromiser."
🔥 KAITHA: "THIS ONE BREAKS RULES! I love them! Mine!"
💀 MORVANE: "Pragmatic. Survivor. Useful."
📚 ATHENA: "Seeks knowledge fearlessly. Scholar's heart."
🌿 SYLARA: "Some compassion. Not cruel, at least."
⚔️ KORVAN: "Occasional courage. More cunning than brave."
💰 MERCUS: "Understands value. We'll do profitable business."

════════════════════════════════════════

🔥 Kaitha speaks: "I claim this one! Chaotic, clever, INTERESTING!"
📚 Athena: "And I shall guide their studies. Knowledge-seeker."
💀 Morvane: "They will survive. That matters."

════════════════════════════════════════
DIVINE VERDICT:

Primary Patron: KAITHA (Chaos) - Favor: +85
Secondary Patron: ATHENA (Wisdom) - Favor: +70
Opposed God: VALDRIS (Order) - Disfavor: -15

ARCHETYPE: Chaotic Scholar
YOUR CLASS: MAGE (Forbidden Magic Specialist)
════════════════════════════════════════

What is your character's name?
```

---

## Phase 2: Gameplay (Asymmetric Whispers)

### Example Scenario Template

**PUBLIC (WhatsApp group - everyone sees):**
```
🎮 THE ARCANE CODEX - Turn 5

═══════════════════════════════════════

You arrive at the Duke's warehouse at midnight. The air is
thick with fog.

👤 GRIMSBY (nervous, urgent): "The medicine for my daughter is
inside. We need to move FAST. Guards change shifts in 10 minutes."

🔍 OBSERVATION:
- Two guards at the front door (distracted, talking)
- Side door is slightly ajar (unlocked?)
- Windows on second floor (dark inside)
- Grimsby is sweating, keeps checking his watch

═══════════════════════════════════════

🤝 PARTY TRUST: 50/100 (Professional)
👥 NPCs: Grimsby (50), Renna (50)

What do you do? Discuss and decide together.
```

**PRIVATE to Player 1 (Fighter) - Send as DM:**
```
🔮 [WHISPER - ONLY YOU SEE THIS]

Your military training reveals critical details:

⚔️ COMBAT ANALYSIS:
- These guards are NOT distracted. They're PROFESSIONALS.
- Their "casual" stance is actually combat-ready position
- They're scanning surroundings every 15 seconds
- This feels like a TRAP

🎯 TACTICAL ASSESSMENT:
- Side door = likely ambush point
- Windows = possible sniper positions
- Grimsby's nervousness = he knows something
- Recommended action: ABORT or EXTREME CAUTION

Share this... or don't.
```

**PRIVATE to Player 2 (Mage) - Send as DM:**
```
🔮 [WHISPER - ONLY YOU SEE THIS]

Your arcane senses detect something WRONG:

🔮 MAGICAL ANALYSIS:
- Medicine crates inside = DARK MAGIC aura
- The medicine is CURSED
- If used, 200+ people will die within a week
- The curse is expertly hidden (Grimsby can't detect it)

💀 ADDITIONAL INSIGHT:
- Grimsby genuinely believes the medicine is safe
- He's desperate - daughter is dying
- But using this medicine = mass casualties
- This is NOT a simple rescue mission

Share this... or don't.
```

### Track Their Decisions

**If they share truthfully:**
```
[Update: Party Trust +5 → 55/100]
```

**If they hide information:**
```
[Update: Party Trust -10 → 40/100]
```

**If they lie and get caught:**
```
[Update: Party Trust -20 → 30/100]
⚠️ Trust tier drops to "Fragile Alliance"
```

---

## Phase 3: Divine Council Vote

**Trigger:** When players take major action (stealing, killing, betraying)

**Send to WhatsApp group:**
```
════════════════════════════════════════
⚖️ THE GODS DEBATE YOUR FATE ⚖️
════════════════════════════════════════

ACTION JUDGED: "Party stole medicine from Duke's warehouse
but refused to give it to Grimsby"

═══════════════════════════════════════
👥 NPC TESTIMONIES (spoken before gods vote):

👤 GRIMSBY (Approval: 20/100):
"They... they PROMISED to help my daughter. They lied to me.
My child will DIE because of them. VALDRIS, this is betrayal!"

[VALDRIS listens: +8 influence toward OPPOSE]

👤 RENNA (Approval: 55/100):
"They made the hard choice. The medicine was cursed. They
saved 200 lives by NOT using it. That takes courage."

[KORVAN listens: +6 influence toward SUPPORT]

═══════════════════════════════════════
⚖️ THE GODS VOTE:

✅ ATHENA: "They chose wisdom over emotion. Truth matters."
✅ MORVANE: "Pragmatic survival. Correct decision."
✅ KAITHA: "Chaos! Breaking promises! I LOVE IT!"
❌ VALDRIS: "Broke an oath. Grimsby's trust violated."
❌ KORVAN: "Cowardice. Should have found another way."
✅ SYLARA: "Protected innocent lives. Nature approves."
❌ MERCUS: "Lost business opportunity with Duke."

═══════════════════════════════════════
📜 DIVINE JUDGMENT:

RESULT: NARROW MAJORITY SUPPORT (4-3)

CONSEQUENCES:
✨ Minor Blessing: +5% to wisdom checks (10 turns)
🤝 Trust Change: -5 (Grimsby's testimony hurt you)
⚠️ Grimsby Approval: -30 → 20/100 (dangerously low!)

NEW PARTY TRUST: 50/100 → 45/100 (still Professional)

The gods have spoken. Continue your journey...
════════════════════════════════════════
```

---

## Phase 4: NPC Approval Tracking

### Update After Each Major Interaction

**Grimsby Approval Events:**
```
+15: Save his daughter successfully
+10: Help him with smaller favors
+5: Show empathy, listen to his story
-10: Ignore his pleas
-20: Break promises to him
-30: Let his daughter die

Current: 20/100 → DANGER ZONE (betrayal possible)
```

**Renna Approval Events:**
```
+15: Help her kill brother (Thieves Guild leader)
+10: Share intel about Thieves Guild
+5: Support her revenge plans
-10: Stop her from killing
-20: Protect her brother
-30: Turn her in to authorities

Current: 55/100 → NEUTRAL (won't share all whispers)
```

### Betrayal Checks

**IF Trust = 0-9 AND NPC Approval < 20:**
→ NPC WILL betray within 2 turns

**Send warning:**
```
⚠️ GRIMSBY has left the party.

[Last seen heading toward the Thieves Guild, muttering
about "people who don't keep promises..."]

Your party is now: 2 players + Renna
```

---

## Combat Resolution (Narrative)

Since combat system isn't implemented, resolve narratively:

```
🎮 COMBAT ENCOUNTER

3 Duke's Guards attack!

Fighter: "I charge the leader!"
→ Roll d20 (you choose): 16 + STR bonus = SUCCESS
→ "You disarm the guard captain!"

Mage: "I cast fireball!"
→ Roll d20: 8 + Arcana bonus = PARTIAL
→ "Fireball hits, but you're exhausted (-20 mana)"

Outcome: Guards flee. Party victorious!
Loot: 50 gold, healing potion x2
```

---

## Town Hub (Valdria) Interactions

When players return to safe town:

```
🏰 VALDRIA - THE SAFE HAVEN

You enter the market square. Firelight glows from windows.
The smell of fresh bread and weapon oil fills the air.

SAFE ZONE - No combat, full rest available

Available Locations:
🛏️ Inn - Rest (restore HP/Mana) - FREE
🛒 Merchants - Buy/sell items
📋 Guild Hall - Accept new quests
🍺 Tavern - Talk to NPCs, hear rumors
⛪ Temple - Check divine favor, pray for blessings
🚪 Gates - Depart for next quest

Where do you go?
```

---

## Tips for AI GM

### Creating Moral Dilemmas

**Pattern 1: Mutually Exclusive Whispers**
- Fighter sees: "Child is suffering NOW"
- Mage sees: "Saving child kills 200 innocents"

**Pattern 2: Hidden NPC Agendas**
- Grimsby says: "Just medicine for my daughter"
- Reality: Medicine is cursed, Grimsby doesn't know
- NPC genuinely believes one thing, truth is different

**Pattern 3: Trust vs Survival**
- Sharing whisper = +trust but bad tactical outcome
- Hiding whisper = -trust but better survival

### Tracking State

Use spreadsheet or notes:
```
PARTY STATE:
Trust: 45/100 (Professional)
Turn: 12
Location: Duke's District

PLAYER 1 (Kael - Fighter):
HP: 72/80
Class: Fighter
Divine Favor: KORVAN +45, VALDRIS +30, KAITHA -15

PLAYER 2 (Elara - Mage):
HP: 45/60
Mana: 40/100
Class: Mage (Chaotic)
Divine Favor: ATHENA +70, KAITHA +85, VALDRIS -25

NPCS:
Grimsby: Approval 20/100, Alive, In Party
Renna: Approval 55/100, Alive, In Party
```

---

## Example Full Session (WhatsApp)

**Session Start:**
```
🎮 SESSION 5 - "The Cursed Medicine"

Last time: You discovered Duke's warehouse contains
medicine for Grimsby's daughter.

Today: Make the heist. Face consequences.

Party Trust: 50/100
NPCs: Grimsby (50), Renna (50)

Ready? Let's begin...
```

**1. Public Scene → GROUP**
**2. Asymmetric Whispers → DMs**
**3. Players Discuss → GROUP**
**4. Decision Made → GROUP**
**5. Divine Council → GROUP** (if major action)
**6. Update Trust/NPCs → Track privately**
**7. Continue to next scene...**

---

## Quest Scenarios (Use These)

See `QUEST_SCENARIOS.md` for full quest details:

1. **Grimsby's Gambit** - Stealing cursed medicine
2. **The Brother's Shadow** - Renna wants to kill her brother
3. **The Vault Heist** - Merchant's Guild vs Thieves Guild
4. **The Plague Doctor** - Cursed healer spreading disease
5. **The Living Weapon** - Child with unstable magic
6. **The Last Confessor** - Corrupt priest with secrets

---

**You're ready to run The Arcane Codex via WhatsApp!** 🎮

Use Claude (your €200 Max plan) to craft dynamic whispers,
track state, and make Divine Council votes interesting.

The core innovation = asymmetric whispers create impossible
moral choices. That works perfectly via WhatsApp DMs! 📱
