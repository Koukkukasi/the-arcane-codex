# AI Scenario Generation Patterns
## The Arcane Codex - Dynamic Content Framework

## Core Principle: 100% Dynamic Generation

**CRITICAL RULE**: Every scenario must be generated fresh based on current game state. ZERO static content. ZERO repetition.

---

## 1. Generation Philosophy

### Why Dynamic Beats Static
- **Contextual Relevance**: Scenarios adapt to current trust, approval, and divine favor
- **True Replayability**: Same party composition produces different stories
- **Organic Progression**: NPCs remember past actions, world state evolves
- **No Spoilers**: Players can't look up solutions
- **Infinite Content**: Never run out of scenarios

### Context-Driven Generation
Every scenario generation must consider:
1. **Party Trust** (0-100): Affects NPC behavior and cooperation mechanics
2. **Player Classes**: Determines whisper types and solution options
3. **NPC Approval** (0-100 per NPC): Dictates loyalty, betrayal risk, information sharing
4. **Divine Favor** (-100 to +100 per god): Influences NPC attitudes and Council votes
5. **Location**: Urban, wilderness, dungeon, social settings
6. **Previous Themes**: Avoid repeating last 5 scenario themes
7. **Difficulty**: Based on party power level and player experience

### Uniqueness Requirements
- **Theme**: Never repeat theme from last 5 scenarios
- **Setting**: Vary location type (no 2 urban scenarios back-to-back)
- **NPC Names**: Always unique, never reuse
- **Moral Structure**: Rotate between MUTUALLY_EXCLUSIVE, CONTRADICTORY, COMPLEMENTARY
- **Environmental Elements**: Context-specific, never generic

---

## 2. The 3-Act Scenario Structure

### Act 1: The Setup (3-5 minutes of play)

**Purpose**: Establish context, introduce NPCs, present initial choice

**Pattern Elements**:
```
PUBLIC SCENE:
- Location description (sensory-rich: sights, sounds, smells)
- NPC introduction (appearance, emotional state, urgency)
- Initial problem/request (clear but incomplete information)
- Time pressure hint (days left, hours remaining)
- Party's immediate options

ASYMMETRIC WHISPERS:
- Fighter: Tactical assessment, danger analysis
- Mage: Magical auras, supernatural detection
- Thief: Hidden details, deception cues
- Ranger: Natural signs, tracking information
- Cleric: Moral weight, divine presence
- Bard: Emotional undercurrents, social dynamics

INITIAL CHOICES:
- Help immediately (trusting)
- Investigate first (cautious)
- Refuse outright (safe but cold)
- Negotiate alternative (creative)
```

**Information Revelation in Act 1**:
- PUBLIC: 30% of the truth
- WHISPERS: Each reveals 10-15% of truth (but different aspects)
- COMBINED: Players can deduce 50-60% if they share

**Example Act 1**:
```
PUBLIC: Grimsby begs for help saving his daughter from disease
FIGHTER WHISPER: His map of guard positions is outdated (trap?)
MAGE WHISPER: Grimsby radiates compulsion magic (being controlled?)
COMBINED DEDUCTION: Something is wrong, but help still needed?
```

### Act 2: The Complication (5-8 minutes of play)

**Purpose**: Reveal hidden information, add environmental challenges, escalate tension

**Pattern Elements**:
```
NEW INFORMATION:
- Initial assumptions questioned
- NPC motivations revealed (partially)
- Hidden costs exposed
- Time pressure intensifies

ENVIRONMENTAL CHALLENGES:
- 3-5 interactive elements (BG3 style)
- Multiple solution paths emerge
- Risk/reward calculations needed

WHISPERS DEEPEN:
- Earlier whispers gain new meaning
- Contradictions emerge
- Players must decide: trust or doubt?

NPC BEHAVIORS EMERGE:
- Fatal flaws show (DESPERATE, IMPULSIVE)
- Approval affects cooperation
- Hidden agendas hint at surface
```

**Information Revelation in Act 2**:
- PUBLIC: Another 20% revealed
- WHISPERS: Critical 15-20% that changes everything
- ENVIRONMENTAL: Physical challenges add urgency
- COMBINED: 80-90% truth visible, but how to ACT on it?

**Example Act 2**:
```
PUBLIC: Inside warehouse, too quiet, feels wrong
FIGHTER WHISPER: 20+ soldiers waiting - this IS a trap
MAGE WHISPER: Medicine glows with necromantic plague magic
ENVIRONMENTAL: Oil barrels (flammable), crane (drop crates), hidden tunnel
TENSION: Grimsby signals someone above - he's working with them
```

### Act 3: The Resolution (2-4 minutes of decision)

**Purpose**: Force impossible choice, show consequences immediately

**Pattern Elements**:
```
THE TRUTH EXPLODES:
- All information revealed (100%)
- Multiple agendas collide
- No perfect solution exists
- Time runs out NOW

THE IMPOSSIBLE CHOICE:
- 4-6 distinct paths
- Each sacrifices something important
- Consequences are REAL (deaths, betrayals)
- Party must decide TOGETHER

IMMEDIATE CONSEQUENCES:
- NPCs react based on approval + choice
- Trust changes (±5 to ±20)
- Deaths/injuries
- Betrayals trigger

DIVINE COUNCIL PREVIEW:
- Show predicted votes per choice
- Highlight which gods support/oppose
- Hint at blessings or curses
```

**The Final Choice Must Have**:
- **High Stakes**: Lives, relationships, or principles at risk
- **No Perfect Answer**: Every choice sacrifices something important
- **Clear Trade-offs**: Players understand what they're giving up
- **Personal Cost**: NPCs players care about are affected
- **Divine Judgment**: Gods will react based on choice

**Example Act 3**:
```
TRUTH: Daughter is dying from Duke's son's assault (covered up)
      Medicine is cursed plague (saves her, kills 200 innocents)
      Grimsby KNOWS and doesn't care ("Let them suffer!")
      Duke offers deal: freedom for silence

IMPOSSIBLE CHOICE:
1. Use plague medicine (saves child, dooms 200)
2. Let child die (saves 200, breaks Grimsby)
3. Expose Duke (justice, but everyone dies in chaos)
4. Find alternative cure (desperate, time running out)
5. Destroy all plague (safe, but child still dies)

Each choice has immediate + long-term consequences
```

---

## 3. Whisper Generation Patterns

### The Whisper Formula

**Base Structure**:
```
[CLASS ABILITY] reveals [SPECIFIC INFORMATION] that [CREATES DILEMMA]
```

**Rules**:
1. Each class sees DIFFERENT information
2. Information must be USEFUL (not just flavor)
3. Combined whispers create TENSION (not clarity)
4. Never make choice OBVIOUS
5. Always match CLASS FANTASY

### Fighter Whispers - Tactical Analysis

**What Fighters Notice**:
- Combat readiness (stance, equipment quality, training level)
- Numbers and positioning (exact counts, formation analysis)
- Tactical vulnerabilities (escape routes, choke points, high ground)
- Military deception (fake patrols, ambush setups, false signals)

**Pattern**:
```
"Your [military training/combat experience] reveals:

• [Specific tactical detail 1 - numbers/equipment]
• [Specific tactical detail 2 - positioning/readiness]
• [Specific tactical detail 3 - hidden danger/opportunity]

This is [CONCLUSION that creates dilemma].

But you also notice: [ALTERNATIVE that complicates choice]"
```

**Example**:
```
"Your military training reveals:

• The 'guards' have clean swords (never used in real combat)
• Their formation is too perfect (professional soldiers, not town watch)
• The back exit is blocked by recently-moved crates (trap prepared TODAY)

This is an AMBUSH. Someone set up Renna to walk into a kill zone.

But you also notice: The patrol route has a 40-second gap. If you act in that window, you could grab the target without a fight."
```

### Mage Whispers - Magical Detection

**What Mages Notice**:
- Magical auras (enchantments, curses, illusions)
- Supernatural energies (divine, infernal, fey, elemental)
- Scrying sensors (who's watching)
- Magical compulsions (geas, charm, domination)

**Pattern**:
```
"Your arcane senses detect [MAGICAL PHENOMENON]:

• [Specific magical detail 1 - type of magic]
• [Specific magical detail 2 - source/caster]
• [Specific magical detail 3 - effect/purpose]

This means [CONCLUSION that changes understanding].

You also notice: [MAGICAL SOLUTION that has its own risk]"
```

**Example**:
```
"Your arcane senses detect something WRONG:

• The informant radiates faint enchantment magic (GEAS - magical compulsion)
• Someone is FORCING him to betray Renna's brother
• The 'guards' wear expensive anti-magic amulets
• There's a scrying sensor above the bar (someone is WATCHING remotely)

If you dispel the geas, the informant will be free... but whoever cast it will know you're here within seconds.

You also notice: The scrying sensor has a blind spot near the fireplace. You could act unobserved for about 2 minutes."
```

### Thief Whispers - Hidden Details

**What Thieves Notice**:
- Deception cues (lies, inconsistencies, acting)
- Hidden passages (secret doors, smuggler routes)
- Valuable intel (documents, overheard conversations)
- Who's really in charge (power dynamics, hidden bosses)

**Pattern**:
```
"Your [street smarts/keen eye] catches what others miss:

• [Specific deception detail 1 - lie detected]
• [Specific hidden detail 2 - physical hiding place]
• [Specific social detail 3 - true motivation]

[NPC NAME] is [CONCLUSION that reveals betrayal/agenda].

You also spot: [THEFT/STEALTH OPPORTUNITY that enables alternative path]"
```

**Example**:
```
"Your street instincts scream warning:

• Grimsby's daughter died THREE MONTHS AGO in the plague (you heard it from fences)
• His 'map' of the warehouse is a fake (wrong building style for that district)
• He keeps glancing at the rafters (signaling someone above)

Grimsby is WORKING WITH whoever set this trap. His 'desperate father' act is a lure.

You also spot: A smuggler's mark on the back wall. There's a hidden passage here that leads to the underground market. Instant escape route."
```

### Ranger Whispers - Natural Insights

**What Rangers Notice**:
- Tracks and signs (who's been here, how long ago)
- Animal behavior (scared by predators, fleeing danger)
- Weather patterns (storm coming, fog advantage)
- Wilderness secrets (hidden paths, safe camps, poisonous plants)

**Pattern**:
```
"Your wilderness training reads the [environment/creatures]:

• [Specific tracking detail 1 - who/what passed through]
• [Specific natural detail 2 - animal warnings]
• [Specific environmental detail 3 - terrain advantage]

This tells you [CONCLUSION about hidden danger or opportunity].

Nature also offers: [NATURAL SOLUTION using environment/animals]"
```

**Example**:
```
"Your tracking skills read the scene:

• Fresh blood scent, less than an hour old (someone died here recently)
• The rats are ALL gone (they flee before mass death events)
• The wind is shifting toward the poor quarter (if something spreads, it goes there first)

Whatever is in those crates, the animals know it's DEATH. They've already fled.

Nature also offers: The river is 50 feet north. If you need to destroy something contagious, drowning it in running water will cleanse the curse."
```

### Cleric Whispers - Divine/Moral Insight

**What Clerics Notice**:
- Soul states (corruption, purity, fragmentation)
- Divine presence (blessed, cursed, abandoned by gods)
- Moral weight (how many souls affected by an action)
- Undead/unholy (necromancy, desecration)

**Pattern**:
```
"Your divine sight reveals [SPIRITUAL TRUTH]:

• [Specific soul detail 1 - NPC's spiritual state]
• [Specific moral detail 2 - scale of consequences]
• [Specific divine detail 3 - god involvement]

The gods see [MORAL JUDGMENT that complicates choice].

Divine wisdom whispers: [REDEMPTIVE OPTION that requires sacrifice]"
```

**Example**:
```
"Your connection to the divine reveals terrible truth:

• Grimsby's soul is FRACTURED (he made a pact with something dark)
• 200 innocent souls cry out in anguish (if the plague is used, they ALL die)
• The medicine itself is UNHOLY (it was blessed by a demon, not a god)

The gods demand: Choose the greater good, even if it breaks a father's heart.

But divine mercy also shows: Elara's soul is pure. If you pray to SYLARA with sincere heart, she MIGHT intervene. But gods demand sacrifice for miracles."
```

### Bard Whispers - Social/Emotional Reading

**What Bards Notice**:
- True emotions (hidden feelings, suppressed fear)
- Relationship dynamics (who trusts whom, secret affairs)
- Social hierarchies (real power vs claimed authority)
- Persuasion opportunities (what someone truly wants)

**Pattern**:
```
"Your empathy reads the room:

• [Specific emotional detail 1 - what NPC truly feels]
• [Specific relationship detail 2 - hidden connections]
• [Specific motivation detail 3 - what they really want]

[NPC NAME] doesn't want [WHAT THEY SAY]. They want [TRUE DESIRE].

You could use this: [SOCIAL MANIPULATION option that avoids violence]"
```

**Example**:
```
"Your performance training reads the emotions:

• Grimsby's fear isn't for his daughter - it's for HIMSELF (he's terrified of something)
• The Captain's body language screams GUILT (he hates what he's doing)
• Renna is about to snap (her impulsive flaw is at breaking point)

The Captain doesn't want to arrest you. He's being BLACKMAILED to betray his brother-in-law Grimsby.

You could use this: If you can expose who's blackmailing the Captain, he might switch sides and help you find a real cure for Elara."
```

---

## 4. Environmental Tactics Patterns (BG3 Style)

### The Interactive Environment Philosophy

**Core Principle**: Every scenario should have 3-5 environmental elements that enable creative solutions.

**Element Types**:
1. **Explosive/Flammable**: Oil barrels, braziers, gas leaks
2. **Elevation**: High ground, chandeliers, balconies
3. **Destructible Barriers**: Doors, walls, crates blocking paths
4. **Stealth Enablers**: Shadows, crowds, ventilation shafts
5. **Crowd Dynamics**: Panic triggers, distractions, witnesses

### Environmental Element Template

```
{
    "object": "[Physical object name]",
    "location": "[Where in scene]",
    "action": "[What players can do with it]",
    "consequence": "[Immediate result]",
    "risk": "[Potential downside]",
    "class_synergy": "[Which class benefits most]"
}
```

### Example Environmental Elements by Setting

**Urban Setting**:
```
1. Burning brazier near entrance
   Action: Knock over to create smoke screen
   Consequence: Chaos, easy to grab target
   Risk: Civilians hurt (SYLARA -15 favor)

2. Horse cart nearby
   Action: Use as battering ram through door
   Consequence: Fast entry, destroys barriers
   Risk: Very loud (reinforcements arrive in 2 turns)

3. Market crowd
   Action: Start panic by yelling "Fire!"
   Consequence: Guards distracted by crowd control
   Risk: Innocents trampled (trust -10, VALDRIS opposes)

4. Rain gutter/rooftops
   Action: Climb to second floor
   Consequence: Avoid guards entirely, stealth advantage
   Risk: Loud crash if failed (alerts everyone)

5. Tavern's wine cellar
   Action: Flood upper floor via burst barrels
   Consequence: Slippery floor (enemies fall), buys time
   Risk: Ruins merchant's stock (MERCUS -10)
```

**Dungeon Setting**:
```
1. Crumbling pillar
   Action: Collapse it to block pursuit
   Consequence: Safe retreat, cuts off enemies
   Risk: Blocks future access to that area

2. Chained chandelier
   Action: Drop it on enemies
   Consequence: 3d6 damage, crushes armor
   Risk: Expensive artifact (MERCUS -5, noble -20 reputation)

3. Ancient runes on floor
   Action: Mage activates trap magic
   Consequence: Lightning strikes enemies
   Risk: Drains mage's spell slots, exhausting

4. Spider webs (thick)
   Action: Set on fire
   Consequence: Burns enemies, smoke screen
   Risk: Kills spiders (SYLARA -5, might need them later)

5. Underground river
   Action: Divert water to flood chamber
   Consequence: Forces enemies to higher ground
   Risk: Water damage to quest items, hypothermia
```

**Wilderness Setting**:
```
1. Bee hive
   Action: Knock down onto enemies
   Consequence: Swarm attack, confusion
   Risk: Party also stung if too close

2. Unstable cliff edge
   Action: Trigger rockslide
   Consequence: Blocks path, buries enemies
   Risk: Can't return this way, loud (alerts others)

3. Thornbush maze
   Action: Lead enemies into it
   Consequence: They take damage, slowed movement
   Risk: Party also slowed if they enter

4. Animal stampede path
   Action: Spook the herd toward enemies
   Consequence: Trampling damage, chaos
   Risk: SYLARA -10 (harming nature), unpredictable

5. Foggy ravine
   Action: Use fog for stealth approach
   Consequence: Hidden movement, surprise attack
   Risk: Easy to get lost, fall into ravine (damage)
```

**Social Setting** (Noble party, council meeting):
```
1. Servant's entrance
   Action: Disguise and infiltrate via kitchen
   Consequence: Unnoticed entry, access to poison food
   Risk: Caught = torture, not just arrest

2. Embarrassing secret
   Action: Threaten to expose noble's affair
   Consequence: Noble cooperates, grants favor
   Risk: Noble becomes lifelong enemy, might retaliate

3. Competing nobles
   Action: Play two factions against each other
   Consequence: They fight, you slip away in chaos
   Risk: Start political war, blame falls on party

4. Priceless artifact
   Action: Steal it to force negotiation
   Consequence: Leverage for demands
   Risk: MERCUS -20, all nobles hunt you

5. Dueling challenge
   Action: Challenge noble to formal duel
   Consequence: Legal way to defeat him
   Risk: If you lose, you DIE or enslaved
```

### Environmental Synergies with Classes

**Fighter**:
- Strength-based actions (battering ram, collapse pillar)
- Combat positioning (high ground, choke points)
- Weapon interactions (cut rope, break chains)

**Mage**:
- Elemental interactions (fire+oil, lightning+water)
- Magical activation (runes, wards, golems)
- Dispelling (remove magical barriers)

**Thief**:
- Stealth routes (ventilation, shadows, crowds)
- Lockpicking (chests with tools, doors with keys)
- Trap manipulation (disable or redirect)

**Ranger**:
- Animal control (stampede, guard dogs, mounts)
- Nature weapons (poisonous plants, bees, thorns)
- Tracking (find hidden paths, secret entrances)

**Cleric**:
- Consecration (holy water on cursed items)
- Divine light (reveal hidden evil, blind undead)
- Healing (save dying enemies for information)

**Bard**:
- Social manipulation (start rumors, impersonate)
- Performance (distraction, crowd control)
- Inspiration (buff allies via environmental monologue)

---

## 5. NPC Behavior Patterns by Approval Rating

### Approval Tiers and Behaviors

**High Approval (80-100): Loyal Companion**
```
BEHAVIORS:
- Shares ALL whispers immediately
- Defends party decisions to others
- Volunteers to take personal risks
- Offers hidden knowledge/resources
- Will NOT betray even if betrayal condition met
- Testimonies positively before Divine Council

DIALOGUE TONE: Warm, protective, "We're in this together"

FATAL FLAW: Suppressed (controlled by loyalty)

EXAMPLE:
"I trust you. Here's what I REALLY know: [shares hidden agenda]
 Whatever you decide, I'm with you until the end."
```

**Medium-High Approval (60-79): Cooperative Ally**
```
BEHAVIORS:
- Shares MOST whispers (withholds 1-2 minor details)
- Generally supports party, occasional doubts
- Takes risks but expects reciprocity
- Offers help but reminds of debts owed
- Will betray only if betrayal condition strongly met
- Testimonies neutrally before Divine Council

DIALOGUE TONE: Friendly but pragmatic, "I'll help, but..."

FATAL FLAW: Occasionally visible under stress

EXAMPLE:
"Look, I'll tell you what I know: [shares partial info]
 But if this goes wrong, I'm not taking the fall alone."
```

**Neutral Approval (40-59): Self-Interested Partner**
```
BEHAVIORS:
- Withholds half of whispers (only shares when pressed)
- Questions party decisions openly
- Takes risks only if personally beneficial
- Negotiates for payment/favors
- Will betray if betrayal condition met + advantage present
- Testimonies based on self-preservation

DIALOGUE TONE: Transactional, "What's in it for me?"

FATAL FLAW: Visible, influences decisions

EXAMPLE:
"Fine, I'll share SOME of what I know: [minimal info]
 But you owe me. And if things go bad, I'm out."
```

**Low Approval (20-39): Untrustworthy Liability**
```
BEHAVIORS:
- Withholds most whispers (shares only obvious info)
- Argues against party decisions frequently
- Avoids personal risk entirely
- Demands payment upfront
- Will betray when betrayal condition met
- Testimonies negatively before Divine Council

DIALOGUE TONE: Hostile, "I don't trust you"

FATAL FLAW: Dominates behavior, causes problems

EXAMPLE:
"I'm not telling you anything until you prove you're not going to screw me.
 And I'm staying back here where it's safe."
```

**Very Low Approval (0-19): Imminent Betrayal**
```
BEHAVIORS:
- Shares FALSE whispers (actively lies)
- Sabotages party plans
- Refuses to help, might hinder
- Demands impossible terms
- WILL betray at first opportunity
- Testimonies to hurt party

DIALOGUE TONE: Vengeful, "You'll regret this"

FATAL FLAW: Out of control, fatal consequences imminent

WARNING TO PLAYERS: "NPC is on the edge of betrayal. One more wrong move..."

EXAMPLE:
"You want my help? After what you did?
 Here's what I 'know': [lies designed to get party killed]"
```

### Fatal Flaw Integration

**Fatal Flaws List**:
- **DESPERATE**: Will sacrifice anything/anyone for goal
- **IMPULSIVE**: Acts without thinking, escalates situations
- **GREEDY**: Betrays for money/treasure
- **VENGEFUL**: Prioritizes revenge over survival
- **COWARDLY**: Abandons party in danger
- **PROUD**: Refuses to admit mistakes, doubles down
- **NAIVE**: Trusts obvious lies, betrayed by others

**How Approval Affects Fatal Flaws**:

**High Approval** (80-100):
- Flaw is SUPPRESSED by loyalty
- Example: DESPERATE Grimsby won't sacrifice party for daughter

**Medium Approval** (60-79):
- Flaw shows under EXTREME stress only
- Example: IMPULSIVE Renna asks before attacking

**Low Approval** (40-59):
- Flaw shows under MODERATE stress
- Example: GREEDY merchant steals if valuable item appears

**Very Low Approval** (0-39):
- Flaw DOMINATES all decisions
- Example: VENGEFUL NPC abandons mission to attack enemy

**How to Write Fatal Flaw Triggers**:
```
IF approval >= 80:
    Flaw suppressed, NPC resists temptation
ELIF approval >= 60:
    Flaw triggers only under extreme stress
    Warning given: "[NPC] is struggling with their [FLAW]"
ELIF approval >= 40:
    Flaw triggers under moderate stress
    Players can stop it with persuasion check
ELIF approval >= 20:
    Flaw dominates behavior
    Betrayal imminent unless situation changes
ELSE:
    Flaw causes immediate betrayal
    No persuasion possible
```

---

## 6. Moral Dilemma Construction

### Three Dilemma Types

### Type 1: MUTUALLY_EXCLUSIVE

**Definition**: Two equally important goals, can only achieve one.

**Pattern**:
```
GOAL A: Save [sympathetic victim 1]
GOAL B: Save [sympathetic victim 2]
CONSTRAINT: Time/resources/physics make both impossible
MORAL WEIGHT: Both choices are morally justifiable
```

**Examples**:
- Save the child or save 200 innocents (cursed medicine)
- Save Renna's brother or save Grimsby's daughter
- Warn village A (your friends) or village B (more people)
- Cure poison or heal wound (only one antidote dose)

**Generation Template**:
```
1. Create two sympathetic victims/goals
2. Make both morally equal (no "correct" answer)
3. Add constraint that makes both impossible
4. Ensure consequences for BOTH choices are heavy
5. Divine Council splits evenly (3-4 vs 3-4)
```

**Divine Vote Prediction**:
```
SAVE OPTION A:
Support: [Gods aligned with A's values]
Oppose: [Gods aligned with B's values]
Result: Narrow majority (4-3)

SAVE OPTION B:
Support: [Gods aligned with B's values]
Oppose: [Gods aligned with A's values]
Result: Narrow majority (4-3)
```

### Type 2: CONTRADICTORY

**Definition**: Player whispers reveal conflicting information, suggesting opposite actions.

**Pattern**:
```
FIGHTER WHISPER: Information suggests ACTION X
MAGE WHISPER: Information suggests ACTION Y (opposite)
REALITY: BOTH are partially correct, both lead to problems
MORAL WEIGHT: No way to know which info is more important
```

**Examples**:
- Fighter: "It's a trap" vs Mage: "They're innocent, geas-controlled"
- Thief: "NPC is lying" vs Cleric: "NPC's soul is pure, they believe it"
- Ranger: "Animals fled (danger)" vs Bard: "NPC is genuinely terrified"

**Generation Template**:
```
1. Create situation with hidden complexity
2. Give Fighter info that suggests danger/combat
3. Give Mage info that suggests magic/innocence
4. Make BOTH correct but incomplete
5. Combined info reveals deeper problem
6. Correct action requires trusting BOTH whispers
```

**Example Full Scenario**:
```
PUBLIC: Merchant begs for help, bandits took his daughter

FIGHTER WHISPER:
"The merchant has calluses from sword training. His 'terror' is an act.
 This is a trap - he's bait to lure heroes into an ambush."

MAGE WHISPER:
"The merchant radiates enchantment magic. He's under a GEAS.
 Someone is FORCING him to lure you. He's a victim too."

REALITY (when both trust each other):
- Merchant WAS a soldier (Fighter correct)
- But he's FORCED to lure heroes (Mage correct)
- Bandits have his daughter AND control him via geas
- Correct solution: Free him from geas, then work TOGETHER

CONTRADICTORY because:
- Fighter sees: "Don't trust him, he's dangerous"
- Mage sees: "Trust him, he's being controlled"
- Truth: Trust him BUT break the control first
```

### Type 3: COMPLEMENTARY

**Definition**: All whispers fit together perfectly, revealing a no-win situation.

**Pattern**:
```
WHISPER 1: Reveals truth piece A
WHISPER 2: Reveals truth piece B
WHISPER 3: Reveals truth piece C
COMBINED: A + B + C = Impossible situation
MORAL WEIGHT: Full information makes choice HARDER, not easier
```

**Examples**:
- All whispers reveal: child dying, medicine cursed, Duke innocent, Grimsby controlled
- All whispers reveal: village needs food, food is poisoned, poisoner is sympathetic
- All whispers reveal: traitor exists, traitor has good reason, exposing them dooms quest

**Generation Template**:
```
1. Create complex situation with multiple layers
2. Each whisper reveals ONE layer accurately
3. Combined whispers show COMPLETE picture
4. Complete picture reveals NO GOOD OPTION
5. Players must choose: least evil or desperate gamble
```

**Example Full Scenario**:
```
PUBLIC: Duke's son accused of murdering villagers

FIGHTER WHISPER:
"The Duke's son is a trained killer. His hands show fresh blood (last 24h).
 He's guilty of at least ONE murder recently."

MAGE WHISPER:
"The son radiates innocence magic. He hasn't WILLINGLY killed anyone.
 But there's also faint necromancy... someone is controlling him at night."

THIEF WHISPER:
"The REAL murderer is the Duke's advisor. I saw him in the tavern, bragging
 to shady figures. He's using the son as a scapegoat via possession."

RANGER WHISPER:
"The bodies were killed by the Duke's son's sword (no doubt from tracks).
 But the killing technique is all wrong - too skilled. Someone experienced
 was controlling his body."

COMPLEMENTARY REVELATION:
- Son is being possessed at night (all whispers confirm)
- He's killing innocents while possessed (all whispers confirm)
- Advisor is the possessor and real villain (all whispers hint)
- Exposing the truth means NO ONE believes you (noble's word > yours)
- Killing the son stops murders BUT he's innocent

IMPOSSIBLE CHOICE:
1. Kill innocent son (stops murders, but murder an innocent)
2. Kill advisor (hard, might fail, son keeps killing until you succeed)
3. Expose truth (no proof, you're arrested, murders continue)
4. Imprison son (stops murders, but his life is ruined)
5. Exorcism (risky, might kill son, might fail, advisor learns your plan)
```

---

## 7. Consequence Design Patterns

### Immediate Consequences (Turn 1)

**Types**:
1. **Character Deaths**: NPCs or party members die
2. **Trust Changes**: Party trust ±5 to ±20
3. **NPC Approval Shifts**: ±10 to ±30 per NPC
4. **Location Changes**: Access granted/denied
5. **Resource Loss**: Items, money, information

**Writing Immediate Consequences**:
```
CHOICE: [Player action]

IMMEDIATE:
- Who lives/dies RIGHT NOW
- Which NPCs react positively/negatively
- What resources are gained/lost
- Where players can/cannot go next
- How much trust/approval changed (exact numbers)

DESCRIPTION: [2-3 sentences of vivid outcome]
```

**Example**:
```
CHOICE: Use cursed medicine to save Elara

IMMEDIATE:
- Elara is CURED (survives, grateful)
- Grimsby approval +30 (ecstatic, loyal forever)
- Renna LEAVES party (her sister died in last plague, cannot forgive)
- Party trust -15 (party knowingly doomed innocents)
- Gained: Grimsby's "Blood Price" boon (can call in favor from underworld)

DESCRIPTION:
"Elara's color returns as the medicine takes effect. Grimsby weeps with joy,
 swearing eternal loyalty. But Renna's face goes cold. 'You're monsters,' she
 whispers, and walks away forever. In the distance, you hear the first screams
 from the poor quarter as the plague awakens."
```

### Long-Term Consequences (Future Turns)

**Types**:
1. **Divine Favor Changes**: ±10 to ±40 per god
2. **World State Changes**: Plague spreads, war starts, factions shift
3. **Reputation Changes**: Fame, infamy, trust by factions
4. **Recurring NPCs**: Gratitude or revenge later
5. **Scenario Triggers**: Certain scenarios become available/locked

**Writing Long-Term Consequences**:
```
3-5 TURNS LATER:
- [Major world change] occurs
- [Faction/NPC] remembers and [helps/hinders]
- [Divine god] grants [blessing/curse]
- [New scenario] becomes available because of this choice

10+ TURNS LATER:
- [Ultimate consequence] of this choice is revealed
- Players see the FULL impact of what they did
```

**Example**:
```
CHOICE: Used cursed medicine to save Elara

3 TURNS LATER:
- 200 people dead from plague in poor quarter
- Poor survivors form "Blood Vengeance" cult hunting the party
- SYLARA favor -40 (goddess of life opposes mass death)
- MORVANE favor +30 (survival god approves pragmatism)
- Grimsby remains loyal but haunted by 200 deaths

10 TURNS LATER:
- "Blood Vengeance" cult has grown to 500 members
- They've become a major faction hunting "child-saving murderers"
- Elara (now grown) learns the truth, must choose: thank you or condemn you
- City's poor quarter is permanently scarred, never recovers
- If Elara sides with party, cult fractures; if she condemns, they intensify hunt
```

### Cascading Consequences

**Pattern**: One consequence triggers another, which triggers another.

**Template**:
```
IMMEDIATE → SHORT-TERM → LONG-TERM → ULTIMATE

Example:
Save child with plague medicine →
    200 die from plague →
        Survivors form revenge cult →
            Cult becomes major faction →
                End-game: Cult civil war or redemption arc
```

**Writing Cascading Consequences**:
1. **Immediate**: The direct result of choice
2. **Short-Term** (1-3 turns): Reaction to immediate result
3. **Long-Term** (5-10 turns): Consequences of the reaction
4. **Ultimate** (end-game): Final form of the cascade

**Example Cascade**:
```
CHOICE: Expose Duke's crimes publicly

IMMEDIATE:
- Duke's corruption revealed
- Party gains reputation as truth-seekers
- Duke arrested

SHORT-TERM (2-3 turns):
- Duke's family swears revenge
- Duke's allies in government turn on party
- Poor people celebrate party as heroes

LONG-TERM (5-8 turns):
- Duke's son becomes vengeful villain
- Government corruption investigation leads to civil war
- Poor people's gratitude grants party safe houses

ULTIMATE (end-game):
- Civil war resolution depends on party's continued choices
- Duke's son becomes major antagonist or redeemed ally
- Party remembered as heroes who toppled tyranny (if successful)
  OR as idiots who started a war (if disaster)
```

---

## 8. Divine Council Vote Prediction

### The 8 Gods and Their Domains

```
1. VALDRIS (Order & Justice)
   - Supports: Lawful actions, keeping oaths, protecting innocents via law
   - Opposes: Chaos, breaking laws, vigilante justice

2. KAITHA (Chaos & Freedom)
   - Supports: Breaking unjust rules, personal freedom, bold action
   - Opposes: Oppressive authority, following unjust laws, submission

3. MORVANE (Death & Survival)
   - Supports: Pragmatic choices, survival over principle, harsh truths
   - Opposes: Wasteful sacrifice, naivete, "honorable" death

4. SYLARA (Nature & Life)
   - Supports: Preserving life, protecting nature, healing
   - Opposes: Mass death, environmental destruction, plague/poison

5. KORVAN (War & Honor)
   - Supports: Courage, keeping oaths, warrior code, honorable combat
   - Opposes: Cowardice, betrayal, dishonorable tactics

6. ATHENA (Wisdom & Knowledge)
   - Supports: Clever solutions, learning from mistakes, wise counsel
   - Opposes: Foolish choices, ignoring information, anti-intellectualism

7. MERCUS (Commerce & Wealth)
   - Supports: Fair deals, wealth creation, respecting property
   - Opposes: Theft without compensation, destroying trade, wasteful spending

8. DRAKMOR (Freedom & Fury)
   - Supports: Explosive action, freedom through strength, overthrowing tyrants
   - Opposes: Passive acceptance, weakness, bureaucratic solutions
```

### Vote Prediction Formula

**For Each Choice, Calculate Each God's Vote**:

```python
def predict_god_vote(god_name, player_action, context):
    """
    Returns: "SUPPORT", "OPPOSE", or "ABSTAIN"
    """

    # Base alignment with god's values
    alignment_score = calculate_alignment(god_name, player_action)

    # Modify by divine favor
    if context['divine_favor'][god_name] > 30:
        alignment_score += 1  # More lenient
    elif context['divine_favor'][god_name] < -30:
        alignment_score -= 1  # More harsh

    # Modify by NPC testimony
    for npc in context['npcs']:
        if npc['testifies']:
            if npc['divine_affinity'][god_name] > 20:
                alignment_score += npc['testimony_strength']

    if alignment_score >= 2:
        return "SUPPORT"
    elif alignment_score <= -2:
        return "OPPOSE"
    else:
        return "ABSTAIN"
```

### Example Vote Predictions

**Scenario**: Save child with cursed medicine (200 die)

```
VALDRIS (Order & Justice):
- Law says: Don't use forbidden plague magic
- But also: Save the innocent when possible
- Conflict! Leans toward: OPPOSE (law broken)
- Final: OPPOSE

KAITHA (Chaos & Freedom):
- Freedom to choose, even if tragic
- Bold action, not passive acceptance
- Final: SUPPORT

MORVANE (Death & Survival):
- Pragmatic: save who you can
- 1 life vs 200, but saved the one you could save
- Final: SUPPORT (barely)

SYLARA (Nature & Life):
- 200 innocents DEAD
- Life goddess cannot forgive mass death
- Final: OPPOSE (strongly)

KORVAN (War & Honor):
- Dishonorable to doom innocents
- But saving companion is loyalty (honor)
- Conflict! Leans toward: OPPOSE (innocents matter)
- Final: OPPOSE

ATHENA (Wisdom & Knowledge):
- Foolish choice, didn't seek alternative
- Ignored warnings about plague
- Final: OPPOSE

MERCUS (Commerce & Wealth):
- Stole medicine (theft)
- Killed 200 potential customers
- Final: OPPOSE

DRAKMOR (Freedom & Fury):
- Bold action, defied authority
- Chose passion over calculation
- Final: SUPPORT

FINAL TALLY: 3 SUPPORT, 5 OPPOSE
RESULT: Majority OPPOSE → CURSE applied
```

**Scenario**: Find alternative cure (desperate gamble)

```
VALDRIS: SUPPORT (lawful approach)
KAITHA: ABSTAIN (not bold enough)
MORVANE: OPPOSE (risky gamble vs sure thing)
SYLARA: SUPPORT (trying to save all lives)
KORVAN: SUPPORT (honorable effort)
ATHENA: SUPPORT (wise search for third option)
MERCUS: ABSTAIN (no economic impact)
DRAKMOR: ABSTAIN (not explosive enough)

FINAL TALLY: 4 SUPPORT, 1 OPPOSE, 3 ABSTAIN
RESULT: Majority SUPPORT → BLESSING applied
```

### Writing Divine Council Outcomes

**Vote Patterns**:
- **7-0 or 0-7**: Unanimous → Major blessing or major curse
- **6-1 or 1-6**: Strong majority → Blessing or curse
- **5-2 or 2-5**: Clear majority → Minor blessing or curse
- **4-3 or 3-4**: Narrow → Mixed outcome (small effect)
- **With abstentions**: Less dramatic outcome

**Outcome Template**:
```
DIVINE COUNCIL CONVENES

TESTIMONIES:
[NPC 1]: "[Speech defending or condemning party]"
[NPC 2]: "[Speech defending or condemning party]"

DIVINE VOTES:
✓ SUPPORT: [God names] - [Reason]
✗ OPPOSE: [God names] - [Reason]
○ ABSTAIN: [God names] - [Reason]

JUDGMENT: [X SUPPORT, Y OPPOSE, Z ABSTAIN]

OUTCOME:
[Blessing/Curse description]
[Mechanical effect: ±stats, ±favor, ±trust]
[Narrative effect: What changes in world]
```

**Example Full Council**:
```
DIVINE COUNCIL CONVENES

TESTIMONIES:
GRIMSBY: "They saved my daughter when no one else would! 200 deaths haunt me,
          but Elara lives. They chose mercy for one over cold calculation."
          (Divine Affinity: VALDRIS +30, SYLARA +20, MERCUS -10)

RENNA: "[Refuses to testify, has left the party]"

DIVINE VOTES:
✓ SUPPORT: KAITHA, MORVANE, DRAKMOR
  "They chose action over passivity, survival over philosophy, fury over fear"

✗ OPPOSE: VALDRIS, SYLARA, KORVAN, ATHENA, MERCUS
  "They broke sacred law, caused mass death, acted dishonorably,
   ignored wisdom, and destroyed without compensation"

JUDGMENT: 3 SUPPORT, 5 OPPOSE

OUTCOME: MAJORITY CURSE
- Party gains "Blood Price" curse: Haunted by 200 dead souls
- Disadvantage on charisma checks in poor districts (-2)
- Divine Favor: SYLARA -40, VALDRIS -20, KAITHA +20, MORVANE +15
- World Change: "Blood Vengeance" cult formed
- Trust: -15 (party knowingly doomed innocents)

The gods have judged. The scales of balance tip toward condemnation.
```

---

## 9. Pattern Integration Checklist

### Before Generating Scenario, Ask:

**Context Gathered?**
- [ ] Party trust level (0-100)
- [ ] Player classes present
- [ ] NPC approval ratings (each NPC)
- [ ] Divine favor (per god)
- [ ] Current location
- [ ] Previous 5 scenario themes
- [ ] Party power level

**Structure Planned?**
- [ ] 3-Act structure outlined
- [ ] Each act has clear purpose
- [ ] Information revelation paced correctly
- [ ] Time pressure increases per act

**Whispers Designed?**
- [ ] Each class gets unique info
- [ ] Information creates tension when combined
- [ ] Matches class fantasy/abilities
- [ ] No whisper makes choice obvious

**NPCs Developed?**
- [ ] Fatal flaws assigned
- [ ] Hidden agendas created
- [ ] Approval-based behaviors defined
- [ ] Betrayal triggers clear
- [ ] Loyalty rewards meaningful

**Environment Built?**
- [ ] 3-5 interactive elements
- [ ] Each element has action + consequence
- [ ] Multiple solution paths enabled
- [ ] Matches location type

**Moral Dilemma Crafted?**
- [ ] Type chosen (MUTUALLY_EXCLUSIVE, CONTRADICTORY, COMPLEMENTARY)
- [ ] No perfect solution exists
- [ ] Both/all sides have merit
- [ ] Consequences are REAL

**Consequences Planned?**
- [ ] Immediate (turn 1) defined
- [ ] Short-term (2-5 turns) outlined
- [ ] Long-term (5-10 turns) hinted
- [ ] Cascading effects considered

**Divine Council Predicted?**
- [ ] Each god's likely vote calculated
- [ ] NPC testimonies written
- [ ] Blessing/curse outcomes defined
- [ ] Vote tally makes sense with god domains

**Uniqueness Verified?**
- [ ] Theme not used in last 5 scenarios
- [ ] NPC names unique
- [ ] Setting varied from last 2 scenarios
- [ ] Moral structure different from last scenario

---

## 10. Quick Reference: Generation Formula

```
SCENARIO GENERATION FORMULA

INPUT:
- Context (trust, classes, NPCs, favor, location, history)

PROCESS:
1. Choose moral dilemma type
2. Design 3-act structure
3. Write public scenes (30% → 50% → 100% info)
4. Generate class-specific whispers (each reveals 10-15%)
5. Create 3-5 environmental elements
6. Define NPC behaviors based on approval
7. Build 4-6 solution paths with consequences
8. Predict Divine Council votes per path
9. Verify uniqueness vs history

OUTPUT:
- Complete scenario JSON with all elements
- Ready to play immediately
- Guaranteed unique and context-appropriate
```

**Remember**: ZERO STATIC CONTENT. Every scenario is generated fresh for current game state.

---

## Next Document
See **AI_SCENARIO_QUALITY_CHECKLIST.md** for quality assurance framework.
