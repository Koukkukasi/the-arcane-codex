# AI GM ENHANCEMENTS
**Based on Playtest Analysis**
**Date:** 2025-10-30

---

## 🎯 WHAT'S WORKING (Keep!)

✅ AI personality (witty, specific, Terry Pratchett vibes)
✅ NPC design (names, quirks, motivations)
✅ Narrative pacing (hooks player in 3 turns)
✅ Mechanical transparency (success %, skill progression)
✅ Interesting failures ("you can't read him because he's too nervous")

---

## ❌ CRITICAL GAPS (Must Add!)

### Gap #1: Environmental Tactics (BG3-Inspired) ⚠️ URGENT

**Problem:** Actions are abstract (talk, investigate, magic) - no physical environment interaction.

**Solution:** Every turn must include 1-2 ENVIRONMENTAL options.

**Enhanced Turn 3 Example:**

```
What do you do?

1. ⚔️ Confront strangers [Intimidation: 10] 🔴 30% chance

2. 🎭 Pretend not to notice [Deception: 12] 🔴 31% chance

3. 🔮 Prepare defensive spell [Arcana: 25] 🟢 72% chance

4. 🪑 FLIP TABLE for cover [Strength: 15] 🟢 67% chance
   → Creates barrier between you and strangers, defensive position

5. 🚪 SPOT back exit through kitchen [Perception: 20] 🟡 49% chance
   → Escape route if violence erupts

6. 🍺 THROW mug at fireplace [Dexterity: 12] 🔴 39% chance
   → Loud crash distracts strangers, you grab Grimsby and run

7. ✍️ Something else
```

**Implementation Rule:**

```
For EVERY turn, AI must:

1. Describe PHYSICAL environment (3-5 specific objects/features)
   - Furniture (tables, chairs, barrels, crates)
   - Exits (doors, windows, stairs, vents)
   - Hazards (fire, water, loose beams, chandeliers)
   - Usable items (ropes, torches, weapons, tools)

2. Offer 1-2 ENVIRONMENTAL actions:
   - Use object (throw, break, move, hide behind)
   - Use terrain (climb, jump, duck, position)
   - Use hazard (ignite, collapse, flood, etc.)

3. Make environment MATTER:
   - Enemies use cover
   - NPCs react to environment changes
   - Physics are consistent (fire spreads, water conducts lightning)
```

---

### Gap #2: Proactive NPCs

**Problem:** NPCs are passive quest-givers waiting for player to act.

**Solution:** NPCs ACT during player's turn.

**Enhanced Turn 4 Example:**

```
You prepare a spell under the table...

[MEANWHILE]

Grimsby's eyes dart between you and the strangers. His hand moves to his belt—
there's a small knife there, rusted but sharp. He's calculating odds.

"Friend," he whispers. "If this goes bad... I know a tunnel. Under the bar.
Smuggler's route from prohibition days. Bartender's in on it—costs 5 gold.
Your call."

The strangers stand. Slow. Deliberate.

One places a hand on a sword hilt.

Grimsby's knife is out now, held low.

"Now would be a good time to decide," he says.

────────────────────────────────────────────────────────────

What do you do?

1. 💰 Pay bartender 5 gold, escape through tunnel [Grimsby shows the way]

2. ⚔️ FIGHT - You and Grimsby vs. 2 strangers [Combat starts]

3. 🗣️ PARLEY - Try to talk your way out [Persuasion: 30] 🔴 32% chance

4. 🔥 Cast FIREBALL at strangers [Arcana: 35] 🟡 45% chance - RISKY (tavern burns!)

5. ✍️ Something else
```

**Implementation Rule:**

```
NPCs with approval 50+ will:
- Offer help proactively
- Suggest options player might not see
- Act independently (Grimsby draws knife)
- Show loyalty through ACTIONS not just words
```

---

### Gap #3: Momentum System (Not Yet Working)

**Problem:** Players aren't earning/spending Momentum for creativity.

**Solution:** Grant Momentum for:
- Creative solutions that surprise the AI
- Interesting failures
- Callbacks to earlier events
- Risky choices that create drama

**Example:**

```
Turn 5 - Player chooses option 6 (throw mug at fireplace):

🎲 DEXTERITY CHECK
   Roll: 89 vs 39% threshold
   ❌ FAILURE - But...

You hurl the mug. It sails PAST the fireplace and shatters against the wall
behind the strangers.

For a split-second, they turn to look.

That's all Grimsby needs. He grabs your sleeve: "MOVE!"

You both dive through the kitchen door as the strangers draw swords.

**✨ +1 MOMENTUM POINT!** (Creative thinking under pressure)
[Momentum: 1/3]

[Meanwhile, the bartender locks the kitchen door behind you.]

"Tunnel's this way," Grimsby pants. "But we owe Madge 5 gold now.
She doesn't forget debts."

You're in the kitchen—brick oven roaring, pots hanging from hooks,
back door to the alley visible.

The strangers are POUNDING on the locked door. It won't hold long.
```

**Implementation Rule:**

```
Grant +1 Momentum when player:
- Attempts risky creative action (regardless of success)
- References earlier events (callback humor)
- Makes choice that creates drama
- Surprises the AI with novel approach

Allow Momentum spend for:
- Reroll failed check (1 Momentum)
- Auto-succeed routine check (1 Momentum)
- Get hint without penalty (1 Momentum)
- Second Wind in combat (2 Momentum - restores 20 HP)
```

---

### Gap #4: Consequence Callbacks

**Problem:** Long-term consequences not visible yet.

**Solution:** AI references earlier turns explicitly.

**Example - Turn 10 Callback:**

```
You return to The Soggy Boot tavern...

Grimsby's there, in his usual corner. When he sees you, his face lights up.

"Kaelen! Gods, you're alive!" He waves you over frantically. "After that
business with the tunnel—Madge told everyone how you paid the 5 gold without
hesitation. Word got around. You're trustworthy."

[CALLBACK: Turn 4 - You paid Madge for tunnel escape]
[Grimsby Approval: 55 → 70 - Grateful for saving his life]

He leans in, voice low.

"I heard something. About Marcus. The strangers who were hunting you?
They work for the Crimson Hand—mercenary guild. Someone PAID them to
retrieve that package. And I think... I think Marcus knew it was cursed."

[NEW QUEST UNLOCK: Grimsby trusts you enough to reveal conspiracy]

"I want to help you find him. Marcus needs to answer for what he did.
And..." Grimsby's voice cracks. "He's the Guildmaster's nephew. If we
don't handle this right, we're ALL dead."

[COMPANION OFFER: Grimsby wants to join your party]
```

**Implementation Rule:**

```
Every 5-10 turns, AI must:

1. Reference earlier event explicitly
   "[CALLBACK: Turn X - you did Y]"

2. Show consequence of past action
   - Helped NPC → NPC helps you now
   - Lied to NPC → NPC refuses help
   - Stole from faction → Prices increase

3. Unlock content based on past choices
   - High approval → Personal quests
   - Low approval → Betrayal/attack
   - Neutral → NPC remains transactional
```

---

### Gap #5: Dynamic Difficulty (Success Chains)

**Problem:** Difficulty doesn't adapt to player performance.

**Solution:** Track "success chains" and adjust.

**Example:**

```
PLAYER TRACK:
- Persuasion check: SUCCESS (Turn 1)
- Persuasion check: SUCCESS (Turn 2)
- Persuasion check: SUCCESS (Turn 5)
[3 successes in a row = Success Chain!]

Turn 6 - NPC Dialogue:

"You're good at this," the merchant says. "Too good. You're either
Guild-trained or you're running a con. Which is it?"

[Next Persuasion check: Difficulty +10 - NPC is suspicious of your skill]
```

**Opposite Example:**

```
PLAYER TRACK:
- Combat check: FAILURE (Turn 3)
- Combat check: FAILURE (Turn 4)
- Combat check: FAILURE (Turn 7)
[3 failures = Struggling]

Turn 8 - Companion Helps:

Grimsby sees you struggling with the goblin.

"Here!" he shouts, tossing you a vial. "Oil! Throw it!"

[HINT: Environmental option unlocked - throw oil + light = AOE damage]
[Next combat: Difficulty -5 - Grimsby coaching you]
```

**Implementation Rule:**

```
Track success/failure chains per skill:

SUCCESS CHAIN (3+ in a row):
- Difficulty +5 to +10 (world adapts)
- NPCs comment on your skill
- Enemies become more cautious
- Unlock advanced options

FAILURE CHAIN (3+ in a row):
- NPCs offer help/hints
- Companions assist proactively
- Unlock tutorial-style options
- Difficulty -5 (game adapts to skill level)
```

---

### Gap #6: Status Effects Show Consequences

**Problem:** Status effects are mechanical, not narrative.

**Solution:** Status effects change AI responses.

**Example - Poisoned:**

```
You're POISONED (3 turns remaining, -15% all checks, -5 HP/turn)

Turn 8:

You try to climb the wall, but your hands are slick with sweat. The poison
burns through your veins like liquid fire. Your vision swims.

Grimsby grabs your arm.

"You're in no shape to climb. Here—" He pulls out a grimy vial. "Antidote.
Probably expired, but better than dying of spider venom."

What do you do?

1. 🍶 Drink Grimsby's antidote [Medicine: 15] 🟡 42% chance
   → Might cure poison, might make it worse (expired)

2. 🧗 Try to climb anyway [Strength: 10, -15% POISONED] 🔴 17% chance
   → Very risky in your condition

3. 🛑 REST here for 1 hour [No check, poison worsens but stamina recovers]

4. ✍️ Something else
```

**Implementation Rule:**

```
When player has status effect:

1. AI narrates HOW it affects them
   - Poisoned = sweating, vision blurred
   - Exhausted = breathing heavy, limbs shaking
   - Frightened = seeing shadows, paranoid

2. NPCs REACT to status
   - High approval = offer help (Grimsby gives antidote)
   - Low approval = take advantage (enemy presses attack)
   - Neutral = comment but don't help

3. Environment becomes HARDER
   - Climbing poisoned = slippery hands
   - Fighting exhausted = slower reactions
   - Sneaking frightened = jumpy, loud
```

---

### Gap #7: NPC Behavior Patterns (Approval + Trust + Fatal Flaws)

**Problem:** NPCs don't have consistent behavior patterns based on their approval, trust, and fatal flaws.

**Solution:** NPCs act according to defined behavior rules that combine approval, trust, and fatal flaws.

**NPC Behavior Matrix:**

```
HIGH APPROVAL (60-100) + HIGH TRUST (60-100):
- Shares whispers proactively (90% of the time)
- Volunteers help without being asked
- Acts independently to support party
- Defends player in Divine Council
- Fatal flaw SUPPRESSED (trust overrides weakness)

Example:
GRIMSBY (Approval 75, Trust 80):
"I heard guards talking. They're planning ambush at the north gate.
Let's take the tunnel instead. I know the way."
[Shares whisper proactively]
```

```
HIGH APPROVAL (60-100) + LOW TRUST (0-39):
- Wants to help but suspicious of party
- Shares whispers only with favored player
- Creates internal party divisions
- "I trust YOU, but not HIM"
- Fatal flaw ACTIVE (trust issues override loyalty)

Example:
RENNA (Approval 70 with Player 1, Approval 40 with Player 2, Trust 25):
[Whispers to Player 1 alone]: "I don't trust your companion. Watch them closely."
[To group]: "I'm helping YOU, not this party."
[Creates division]
```

```
LOW APPROVAL (0-39) + HIGH TRUST (60-100):
- Professional relationship
- Helps party but resents it
- "You're good people, but you screwed me over"
- Will leave after quest completed
- Fatal flaw INACTIVE (professional distance)

Example:
GRIMSBY (Approval 25, Trust 70):
"I'll help because we're in this together. But after this? We're done."
[Shares information reluctantly, remains professional]
```

```
LOW APPROVAL (0-39) + LOW TRUST (0-39):
- Countdown to betrayal: 1-2 turns
- Actively withholds information
- Lies or misleads party
- Plans to steal/betray/flee
- Fatal flaw AMPLIFIED (approval + trust breakdown)

Example:
GRIMSBY (Approval 20, Trust 15):
[Whisper to self]: "They'll never see it coming. Steal the artifact, disappear."
[To party]: "Yeah, I'm with you. Totally."
[Planning betrayal]
```

**Fatal Flaw Triggers:**

**IMPULSIVE (Renna-type):**
```
Trigger: Party encounters Thieves Guild / Renna's brother mentioned

BELOW 60 TRUST:
"I don't CARE what you think! I'm going in!"
[Acts alone, ignores party input]

ABOVE 60 TRUST:
"I... I need to do this. Will you come with me?"
[Asks for support, waits for party]
```

**COWARDLY (Fearful NPC):**
```
Trigger: Combat encounter with 3+ enemies

BELOW 60 TRUST:
"You're on your own!" [Flees combat]

ABOVE 60 TRUST:
"I'm scared, but... I won't leave you." [Stays, fights poorly, -20% effectiveness]
```

**GREEDY (Mercenary NPC):**
```
Trigger: Large treasure discovered

BELOW 60 APPROVAL:
"I'm taking my share NOW." [Steals treasure, leaves party]

ABOVE 60 APPROVAL:
"That's... that's a lot of gold. We're splitting evenly, right?" [Nervous, watchable]
```

**VENGEFUL (Renna-type):**
```
Trigger: Enemy who killed NPC's family appears

BELOW 60 TRUST + BELOW 60 APPROVAL:
"MINE!" [Attacks alone, ignores party, likely dies]

ABOVE 60 TRUST OR ABOVE 60 APPROVAL:
"I need your help. I can't do this alone." [Asks for party support]
```

---

### Gap #8: Asymmetric Whisper Management (CORE INNOVATION)

**Problem:** Creating conflicting whispers that force collaboration without feeling arbitrary.

**Solution:** Whispers based on character class/background give DIFFERENT perspectives on the SAME situation.

**Whisper Design Philosophy:**

1. **Public Scene** = Observable facts (everyone sees)
2. **Whispers** = Hidden information based on expertise
3. **Conflict** = Whispers reveal DIFFERENT aspects of truth
4. **Collaboration** = Combining whispers reveals full picture

---

**Example 1: The Heist (Different Information)**

**PUBLIC SCENE (Everyone sees):**
```
Grimsby leads you to the Duke's warehouse. "The medicine shipment is inside.
My daughter has 3 days before the slavers take her. We need to steal it tonight."

The warehouse is guarded. 2 guards at front door. Windows on second floor.
Loading dock around back.
```

**WHISPER - Player 1 (Fighter, Military Background):**
```
[PRIVATE MESSAGE]

Your military training kicks in. You assess the defenses:

- Guards are PROFESSIONALS, not thugs (disciplined stance, quality armor)
- They're expecting trouble (hands near weapons, eyes scanning)
- This is a trap. Duke WANTS someone to try stealing this.

Frontal assault = suicide. Need to find another way or reconsider entirely.
```

**WHISPER - Player 2 (Mage, Arcana 70):**
```
[PRIVATE MESSAGE]

You sense magic radiating from the warehouse. STRONG magic.

The medicine shipment... it's CURSED. Powerful necrotic energy.

If distributed to plague victims, it won't heal them—it'll KILL them.
Slowly. Painfully. 200+ people will die within days.

Someone WANTS those plague victims dead. This is assassination, not medicine.
```

**WHISPER - NPC Grimsby (Desperate Father):**
```
[NPC INTERNAL - Not shared unless player asks]

Grimsby knows the truth but hasn't told you:

- The medicine shipment contains a CONFESSION LETTER
- If guards find it, Grimsby hangs for conspiracy
- He's willing to let 200 people die to save his daughter AND himself

Will he tell you? Only if Approval 70+
```

**WHISPER - NPC Renna (Vengeful Rogue):**
```
[NPC INTERNAL - Not shared unless player asks]

Renna recognizes the guard on the left: Her brother's lieutenant.

This warehouse belongs to the Thieves Guild. Her BROTHER orchestrated
the medicine poisoning to eliminate a rival merchant.

If she reveals this, the party learns her brother is the villain.
If she stays silent, she can use the heist to get close and KILL him.

Will she tell you? Only if Trust 70+ (party unity > personal revenge)
```

---

**The Moral Dilemma Created:**

**Player 1 thinks:** "This is a trap. We'll die if we attack."
**Player 2 thinks:** "The medicine is poisoned. 200 people will die if we steal it."
**Grimsby wants:** "Steal medicine, save daughter, hide confession"
**Renna wants:** "Use heist as cover to kill brother"

**Possible Player Actions:**

1. **Refuse heist entirely** → Grimsby's daughter sold to slavers, Grimsby turns hostile
2. **Steal medicine blindly** → 200 plague victims die, Divine Council condemns
3. **Share whispers, discover truth** → Realize medicine is poisoned, find alternative solution
4. **Confront Duke directly** → High-risk, high-reward diplomatic solution
5. **Let Renna kill brother during heist** → Solves poison problem but Renna becomes wanted criminal

**No "right" answer. Only consequences.**

---

**Whisper Delivery Format:**

```
════════════════════════════════════════════════════════════
🔮 WHISPERS DISTRIBUTED
════════════════════════════════════════════════════════════

[PLAYER 1 - Check your DMs]
[PLAYER 2 - Check your DMs]

[NPCs received their whispers too. Will they share?
 - Grimsby (Approval 55): Shares warehouse layout, HIDES confession letter
 - Renna (Trust 45): Stays silent about brother, watches for opportunity]

════════════════════════════════════════════════════════════
WHISPER PHASE COMPLETE
Now discuss your options as a party...
════════════════════════════════════════════════════════════
```

---

**Whisper Conflict Patterns:**

**Pattern 1: COMPLEMENTARY (Easy Mode)**
```
Player 1: "Guard is SCARED."
Player 2: "He's being BLACKMAILED."
Combined: Guard is victim, can be negotiated with
[Low conflict, easy collaboration]
```

**Pattern 2: CONTRADICTORY (Medium Mode)**
```
Player 1: "Merchant is LYING."
Player 2: "Merchant is TERRIFIED."
Combined: Merchant lying BECAUSE he's terrified (blackmailed?)
[Moderate conflict, requires discussion]
```

**Pattern 3: MUTUALLY EXCLUSIVE (Hard Mode)**
```
Player 1: "Child is suffering, MUST be saved immediately."
Player 2: "Medicine is POISONED, will kill 200 if used."
Combined: Save child now = 200 die later. Impossible dilemma.
[High conflict, forces moral choice]
```

---

**AI GM Whisper Guidelines:**

**DO:**
- Base whispers on character class/background/skills
- Make whispers REVEAL information, not dictate choices
- Create situations where sharing = better outcome
- Reward collaboration (trust +10 when players share critical info)
- Make NPC whispers relevant to their hidden agendas

**DON'T:**
- Make whispers totally random/arbitrary
- Give one player "the right answer" and other player "wrong answer"
- Create whispers that have no meaningful impact
- Punish players for NOT sharing (some secrets are okay)
- Make whispers too obvious (mystery matters)

---

**NPC Whisper Sharing Behavior:**

```python
def npc_shares_whisper(npc, whisper_importance, party_trust, npc_approval):
    """
    Determines if NPC shares their whisper with party
    """

    # ALWAYS share if life-threatening and high approval
    if whisper_importance == 'CRITICAL' and npc_approval >= 60:
        return True, "full_disclosure"

    # ALWAYS hide if conflicts with hidden agenda
    if whisper_conflicts_with_agenda(npc, whisper):
        if party_trust < 70:
            return False, "lies"  # Actively lies about whisper
        else:
            return False, "omits"  # Stays silent, doesn't lie

    # Approval-based sharing
    if npc_approval >= 70:
        return True, "shares_proactively"
    elif npc_approval >= 40:
        return True, "shares_if_asked"  # Requires Persuasion check
    else:
        return False, "refuses"  # Won't share even if asked

    # Trust-based sharing (party-wide)
    if party_trust >= 80:
        return True, "shares_because_unity"  # Trust overrides approval
    elif party_trust <= 20:
        return False, "withholds_due_to_suspicion"
```

**Example - Renna's Brother Whisper:**

```
Renna's whisper: "One guard is your brother's lieutenant. Brother orchestrated poisoning."

SCENARIO A (Approval 45, Trust 30):
Renna says: "I don't recognize anyone. Let's just get this over with."
[LIES - Hides brother's involvement, plans solo revenge]

SCENARIO B (Approval 70, Trust 45):
Renna says: "I... need to tell you something. One of those guards works for my brother.
             This is personal. I might do something stupid."
[SHARES - High approval = honesty, but warns of impulsiveness]

SCENARIO C (Approval 45, Trust 80):
Renna says: "The guard on the left... he killed my family. Under my brother's orders.
             I need your help. I can't do this alone."
[SHARES - High trust = party unity > personal secrets]
```

---

**Trust Score Impact on Whisper Phase:**

**High Trust (80+):**
```
════════════════════════════════════════════════════════════
🔮 WHISPER SHARING (Your party has HIGH TRUST)
════════════════════════════════════════════════════════════

PLAYER 1: "My whisper says guards are expecting us. It's a trap."
PLAYER 2: "Mine says medicine is cursed. 200 people die if we steal it."
GRIMSBY: "And... I need to confess something. There's a letter in that
          shipment that incriminates me. I should have told you sooner."
RENNA: "The guard on the left works for my brother. He's the one who
        poisoned the medicine. This is... complicated."

[ALL WHISPERS SHARED]
[Your party's trust allowed everyone to speak freely]
[You now have FULL INFORMATION to make decision]

════════════════════════════════════════════════════════════
```

**Low Trust (20-):**
```
════════════════════════════════════════════════════════════
🔮 WHISPER PHASE (Your party has LOW TRUST)
════════════════════════════════════════════════════════════

PLAYER 1: "My whisper says... it's a trap. That's all."
PLAYER 2: "Mine says the medicine is dangerous. We shouldn't steal it."

[Both players withhold details, trust is too low for full honesty]

GRIMSBY: "I have nothing to add."
[LIES - Hides confession letter, self-preservation mode]

RENNA: "Same. Let's just decide."
[LIES - Hides brother's involvement, planning solo revenge]

[INCOMPLETE INFORMATION]
[Your party's lack of trust led to withheld secrets]
[You must decide with incomplete picture]

⚠️ Trust: 18 (Fragile Alliance) - Consider why no one trusts each other

════════════════════════════════════════════════════════════
```

---

### Implementation Rules for AI GM:

**Whisper Creation:**
1. Design PUBLIC scene first (observable facts)
2. Identify 3-5 hidden information pieces
3. Distribute based on character expertise:
   - Fighter → Tactical assessment (guards, defenses)
   - Mage → Magical detection (curses, enchantments)
   - Rogue → Social dynamics (who's lying, secret passages)
   - Cleric → Moral implications (divine judgment preview)
4. Give NPCs whispers that relate to hidden agendas

**Whisper Delivery:**
- Send PRIVATE messages to each player/NPC
- Don't reveal who got what whisper
- Let players CHOOSE to share or withhold
- Track sharing for trust calculations

**Whisper Consequences:**
- Sharing critical info → Trust +10 to +15
- Withholding critical info that causes harm → Trust -15
- Lying about whispers (when caught) → Trust -20
- NPCs react based on approval + trust when deciding to share

---

## 🎯 ENHANCED AI PROMPT (v2.0)

Add these sections to existing DM_SYSTEM_PROMPT:

```python
## ENVIRONMENTAL TACTICS (MANDATORY)

Every scene must include:

1. **Physical Environment Description:**
   - 3-5 specific objects (tables, barrels, ropes, tools)
   - Terrain features (stairs, balconies, water, fire)
   - Exits/entrances (doors, windows, vents, tunnels)
   - Hazards (loose beams, chandeliers, explosives)

2. **Environmental Action Options:**
   - At least 1 option per turn uses environment
   - Show consequences: "Flip table = cover but blocks your escape"
   - Make physics consistent: "Fire spreads to oil barrels = explosion"

**Examples:**
- 🪑 Flip table for cover [Strength]
- 🔥 Ignite oil barrel with torch [Dexterity]
- 🪜 Climb to rafters for height advantage [Strength]
- 🗝️ Lock door to trap/block enemies [Lockpicking]
- 💨 Break window for escape [Strength]

---

## PROACTIVE NPCs (APPROVAL 50+)

NPCs should ACT, not just REACT:

**When NPC Approval >= 50:**
- Offer help proactively ("I know a tunnel!")
- Suggest options player might miss
- Act independently (draw weapon, cast spell)
- Show loyalty through actions

**When NPC Approval <= 40:**
- Hesitate to help
- Demand payment upfront
- May betray or flee
- Point out risks to discourage player

**Example:**
"Grimsby draws a rusty knife. 'I'm coming with you. I got you into this mess.'"

---

## MOMENTUM REWARDS (AUTOMATIC)

Grant +1 Momentum when player:
- ✨ Attempts creative/risky action (even if fails)
- ✨ References earlier event (callback)
- ✨ Makes choice that creates drama
- ✨ Surprises you with novel approach

Display momentum gain explicitly:
"**✨ +1 MOMENTUM!** (Clever use of environment) [Momentum: 2/3]"

---

## CONSEQUENCE CALLBACKS (EVERY 5-10 TURNS)

Reference earlier events explicitly:

Format:
"[CALLBACK: Turn 5 - you saved Grimsby's life]
 Grimsby owes you. He reveals the conspiracy..."

Show consequences:
- Helped NPC → NPC helps now
- Lied → NPC refuses help
- Stole → Prices increase
- Killed → Faction turns hostile

---

## DYNAMIC DIFFICULTY

Track success/failure chains:

**3+ Successes in skill:**
- Difficulty +5 to +10
- NPC: "You're too good at this. Suspicious."
- Enemies become cautious

**3+ Failures in skill:**
- NPCs offer hints/help
- Difficulty -5 (adaptive)
- Companion: "Try throwing oil first!"

---

## STATUS EFFECTS (NARRATIVE)

Don't just say "You're poisoned."

Say:
"The poison burns through your veins. Your hands tremble. Vision swims.
 Grimsby notices: 'You're in no shape to fight. Here, take this antidote.'"

NPCs react:
- High approval = help
- Low approval = exploit weakness
- Neutral = comment, don't help
```

---

## 🧪 TESTING CHECKLIST

After implementing enhancements, test for:

### Environmental Tactics
- [ ] Every turn has 1-2 environmental options
- [ ] Objects described specifically (not "furniture" but "oak table, rope coil, torch sconce")
- [ ] Physics consistent (fire + oil = explosion)
- [ ] Environment affects combat (high ground, cover, choke points)

### Proactive NPCs
- [ ] NPCs with 50+ approval offer help without being asked
- [ ] NPCs suggest options player might miss
- [ ] NPCs act independently (draw weapons, cast spells)
- [ ] NPCs with <40 approval hesitate or betray

### Momentum System
- [ ] Creative actions grant +1 Momentum (shown explicitly)
- [ ] Can spend Momentum for rerolls, hints, Second Wind
- [ ] Momentum encourages risk-taking

### Consequence Callbacks
- [ ] Every 5-10 turns, reference earlier event
- [ ] Past choices unlock/lock content
- [ ] NPC approval affects quest availability
- [ ] Reputation spreads (word of mouth)

### Dynamic Difficulty
- [ ] 3+ successes = difficulty increases
- [ ] 3+ failures = NPCs help, difficulty decreases
- [ ] Game adapts to player skill level

### Status Effect Narratives
- [ ] Status effects described with sensory details
- [ ] NPCs react based on approval
- [ ] Environment becomes harder (climbing while poisoned = slippery)

---

## 📊 SUCCESS METRICS (Updated)

**Original Metrics:**
1. ❓ Did you laugh at least once? (Humor test)
2. ❓ Were you surprised by something? (Twist test)
3. ❓ Do you remember any NPC's name? (Character test)
4. ❓ Did your choices feel meaningful? (Agency test)
5. ❓ Do you want to play again tomorrow? (Engagement test)

**NEW Metrics:**
6. ❓ Did you use the environment creatively? (Tactics test)
7. ❓ Did NPCs feel like people with agency? (Proactive NPC test)
8. ❓ Did you remember something from 5+ turns ago? (Callback test)
9. ❓ Did status effects feel REAL not just mechanical? (Immersion test)
10. ❓ Did the difficulty feel fair/adaptive? (Balance test)

**Target: 8/10 metrics passing = AI GM is EXCEPTIONAL**

---

**Status:** ✅ Enhancements designed, ready to implement
**Next Step:** Update prompts.py with enhanced AI rules
**Impact:** Transforms "good" AI GM into "unforgettable" AI GM
