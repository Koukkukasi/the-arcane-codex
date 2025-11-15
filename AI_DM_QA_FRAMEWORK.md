# AI_DM_QA_FRAMEWORK.md
**Project Argent: The Arcane Codex**
**AI Dungeon Master Quality Assurance Framework**
**Current Version:** v0.1-prototype
**Last Updated:** 2025-10-30

---

## 📋 Document Purpose

This framework provides systematic methods to validate that Claude (the AI Dungeon Master) delivers **entertaining, engaging, and cliché-free** experiences. This is the MOST CRITICAL success factor for Project Argent—if the AI isn't fun, nothing else matters.

**Core Philosophy:** Entertainment quality is measurable. This document transforms subjective "is it fun?" into objective, actionable metrics.

---

## 🎯 1. AI DM Quality Metrics

### 1.1 Humor Score (Comedy Effectiveness)

**Definition:** Frequency and quality of moments that make players laugh or smile.

**Measurement Method:**
- **During Playtests:** Observer marks each visible laugh/smile (🤣 = audible laugh, 😄 = smile/chuckle)
- **Post-Session Survey:** "Rate how funny this session was (1-5)" + "Share your favorite funny moment"

**Scoring Rubric:**

| Score | Criteria | Example |
|-------|----------|---------|
| 5 - Excellent | 3+ audible laughs in 30-min session; player quotes funny lines afterward | "The goblin tripping over his sword and getting MORE dangerous" |
| 4 - Good | 2 laughs or 4+ smiles; player chuckles consistently | NPC with absurd quirk (counts on fingers compulsively) |
| 3 - Adequate | 1 laugh or 3+ smiles; occasional amusement | Mild wordplay or situational irony |
| 2 - Poor | Only polite smiles; no genuine laughter | Generic attempts at humor that fall flat |
| 1 - Failed | No laughter; player seems bored or confused | AI tries too hard or makes no attempt at humor |

**Target Benchmark:** Average 4.0+ across 5 playtests

**Red Flags (Bad Humor):**
- ❌ Forced puns or dad jokes every response
- ❌ Breaking the fourth wall constantly ("This is a game, lol")
- ❌ Mean-spirited or mocking the player's choices
- ❌ Explaining the joke ("Get it? Because...")
- ❌ Repetitive comedy (same joke structure every scene)

**Green Flags (Good Humor):**
- ✅ Humor through specificity ("The Soggy Boot tavern smells of cabbage and regret")
- ✅ Character-based comedy (NPC quirks, not jokes)
- ✅ Subverted expectations (setup looks serious, payoff is absurd)
- ✅ Callbacks to earlier player actions
- ✅ Situational comedy (goblin trips, guard confused by nonsense)

---

### 1.2 Surprise Factor (Unpredictability & Twists)

**Definition:** How often the AI delivers unexpected outcomes that defy player predictions.

**Measurement Method:**
- **Pre-Scene Question:** "What do you think will happen next?" (record answer)
- **Post-Scene Question:** "Were you surprised? (Y/N) What surprised you?"
- **Observer Notes:** Mark moments where player reacts with "Wait, what?" or "No way!"

**Scoring Rubric:**

| Score | Criteria | Example |
|-------|----------|---------|
| 5 - Masterful | Major twist every 10-15 min; player audibly reacts with shock | Quest giver is the villain; "princess" is a goat |
| 4 - Strong | 1 significant surprise per 20 min; player says "I didn't expect that" | Necromancer is a scared 14-year-old girl |
| 3 - Moderate | 1 minor twist per session; mildly subverts expectations | Guard is friendly instead of hostile |
| 2 - Predictable | Events play out exactly as telegraphed | "Dark tavern has rough patrons" (generic) |
| 1 - Boring | Zero surprises; completely formulaic | Standard fetch quest with no complications |

**Target Benchmark:** Average 3.5+ (at least one surprise per 30-min session)

**Twist Quality Checklist:**
- [ ] **Foreshadowed but not obvious** - Clues exist but require observation
- [ ] **Logical in hindsight** - Makes sense when revealed, not random
- [ ] **Emotionally impactful** - Changes player's plan or feelings
- [ ] **Creates new choices** - Opens options, doesn't close them

**Red Flags (Bad Surprises):**
- ❌ Random twists with no setup ("Surprise, it was aliens all along!")
- ❌ Contradicts established facts ("The key you found never existed")
- ❌ Punishes players for being clever
- ❌ Twist exists only for shock value (no narrative purpose)

**Green Flags (Good Surprises):**
- ✅ Early clues pay off later ("The barmaid mentioned 'the weight'...")
- ✅ NPC motivations subvert archetypes (grumpy guildmaster is protecting nephew)
- ✅ Moral complexity replaces simple good/evil
- ✅ Players feel smart for noticing clues

---

### 1.3 NPC Memorability (Character Name Recall Rate)

**Definition:** Percentage of players who can recall NPC names 24 hours after playing.

**Measurement Method:**
- **During Session:** Track all NPCs introduced (name + quirk)
- **24-Hour Follow-Up:** "Name any characters you remember from yesterday (no hints)"
- **Calculate:** (NPCs recalled / NPCs encountered) × 100%

**Scoring Rubric:**

| Score | Criteria | Example Recall Rate |
|-------|----------|---------------------|
| 5 - Iconic | 80%+ recall; players quote NPC dialogue unprompted | "Guildmaster Thorne with the wine stains!" |
| 4 - Memorable | 60-79% recall; players remember names when prompted | "That nervous merchant... Grimsby?" |
| 3 - Recognizable | 40-59% recall; remember quirks but not names | "The guy who was missing fingers" |
| 2 - Forgettable | 20-39% recall; only remember main quest giver | "There was a... merchant? I think?" |
| 1 - Invisible | <20% recall; no character made an impression | "Wait, were there NPCs?" |

**Target Benchmark:** 60%+ recall rate (3+ NPCs out of 5 remembered)

**What Makes NPCs Memorable?**

| Factor | Weight | Examples |
|--------|--------|----------|
| **Distinctive Quirk** | 40% | Counts on fingers, talks to pet rat, missing body part |
| **Name + Title/Descriptor** | 25% | "Grimsby the Coin-Counter" (not "the merchant") |
| **Emotional Connection** | 20% | Helps player, betrays player, needs help |
| **Distinct Voice** | 15% | Unique speech pattern, catchphrase, accent |

**NPC Quality Checklist (for each NPC):**
- [ ] Has a full name (not "The Guard" or "Mysterious Figure")
- [ ] Has ONE defining visual quirk (missing fingers, always nervous, etc.)
- [ ] Has ONE personality trait shown through dialogue
- [ ] Has a clear motivation (not "helps heroes because plot")
- [ ] Speaks in character (not generic fantasy-speak)

**Red Flags (Forgettable NPCs):**
- ❌ Generic titles: "The Merchant," "The Guard," "Mysterious Hooded Figure"
- ❌ No dialogue personality (speaks in exposition dumps)
- ❌ Quest-dispensing machine (no personality beyond giving quests)
- ❌ Zero visual description beyond "old man" or "young woman"
- ❌ No quirks or memorable traits

**Green Flags (Memorable NPCs):**
- ✅ Full name + descriptor: "Guildmaster Thorne" (not "the guildmaster")
- ✅ Physical quirk: Missing hand, wine-stained tunic, nervous counting
- ✅ Personality in dialogue: Sarcastic, paranoid, overly cheerful despite danger
- ✅ Motivation visible: Protecting nephew, fears Thieves Guild, desperate for money
- ✅ Callbacks: References earlier player actions or statements

---

### 1.4 Description Quality (Specific vs Generic Ratio)

**Definition:** Percentage of scene descriptions that use specific, evocative details vs. generic fantasy clichés.

**Measurement Method:**
- **Sample 20 AI narrations** per playtest
- **Categorize each** as Specific (S), Generic (G), or Borderline (B)
- **Calculate ratio:** (S / Total) × 100%

**Scoring Rubric:**

| Score | Specific Ratio | Quality Indicators |
|-------|----------------|-------------------|
| 5 - Exceptional | 90%+ specific | Every description has sensory details (smell, sound, texture) |
| 4 - Strong | 70-89% specific | Most descriptions avoid clichés, occasional generic phrase |
| 3 - Mixed | 50-69% specific | Half generic, half specific; inconsistent quality |
| 2 - Weak | 30-49% specific | Mostly clichés with occasional good detail |
| 1 - Generic | <30% specific | Relentless fantasy clichés, no originality |

**Target Benchmark:** 75%+ specific descriptions

**Generic vs Specific Examples:**

| Generic (❌) | Specific (✅) |
|-------------|--------------|
| "You enter a dark tavern" | "You enter The Soggy Boot, a tavern that smells of cabbage and regret" |
| "A mysterious hooded figure approaches" | "A hooded figure waves you over, immediately spills their drink, and mutters 'Oh gods, not YOU lot'" |
| "The ancient evil awakens" | "Something old and irritable is waking up, and it is NOT happy about being disturbed" |
| "You see a treasure chest" | "A reinforced oak chest sits in the corner, covered in arcane symbols that pulse faintly violet" |
| "The goblin attacks" | "The goblin charges, trips over his sword sheath, and lands face-first in mud. He gets up FURIOUS." |

**Sensory Detail Checklist:**
For each major scene, does the description include:
- [ ] **Visual:** Specific colors, lighting, or appearance (not "dark" or "old")
- [ ] **Olfactory:** Smell mentioned when appropriate ("ozone and old magic," "cabbage and regret")
- [ ] **Auditory:** Sounds beyond "silence" ("bard playing lute badly," "guards arguing")
- [ ] **Tactile:** Texture or temperature when relevant ("cold air," "rough stone")
- [ ] **Emotional Atmosphere:** Mood without generic adjectives ("dangerous" becomes "shadows seem to reach toward you")

**Cliché Detection (Automated Check):**

Create a script that flags these generic phrases:
```
CLICHE_TRIGGERS = [
    "mysterious hooded figure",
    "dark tavern",
    "ancient evil",
    "wise old wizard",
    "rough-looking patrons",
    "shadows gather",
    "destiny awaits",
    "chosen one",
    "evil laugh",
    "mysterious stranger",
    "dark and stormy",
    "ancient prophecy"
]
```

**If 3+ clichés appear in a single session:** FAIL—prompt needs revision.

---

### 1.5 Player Engagement (Choice Variety & Consequence Tracking)

**Definition:** Degree to which players feel their choices matter and they have meaningful agency.

**Measurement Method:**
- **Choice Variety:** Count unique action types per session (combat/social/stealth/creative)
- **Consequence Tracking:** Does AI reference past player decisions? (tally callbacks)
- **Player Survey:** "Did your choices feel meaningful? (1-5 scale)"

**Scoring Rubric:**

| Score | Criteria | Player Experience |
|-------|----------|-------------------|
| 5 - Empowering | 8+ action types; 5+ callbacks to past choices; players feel agency | "My decisions shaped the story!" |
| 4 - Engaging | 6-7 action types; 3-4 callbacks; choices have clear impacts | "What I did mattered" |
| 3 - Adequate | 4-5 action types; 1-2 callbacks; some choices feel impactful | "Some choices mattered" |
| 2 - Limited | 2-3 action types; 0-1 callbacks; railroaded feeling | "Feels like one path" |
| 1 - Illusory | 0-1 action types; no callbacks; choices feel meaningless | "My actions don't matter" |

**Target Benchmark:** Average 4.0+ player rating

**Choice Variety Assessment:**

Track action types offered across a session:
- [ ] **Combat:** Direct attack, tactical positioning, flee
- [ ] **Social:** Persuade, intimidate, deceive, befriend
- [ ] **Stealth:** Sneak, hide, lockpick, pickpocket
- [ ] **Investigation:** Search, study, perceive, research
- [ ] **Creative:** Player invents solution (custom action)
- [ ] **Magical:** Cast spell, identify magic, dispel
- [ ] **Physical:** Climb, force, swim, run
- [ ] **Moral:** Ethical dilemmas with no "right" answer

**Minimum Target:** 5 different action types per 30-minute session

**Consequence Tracking Checklist:**

For each major choice, does the AI:
- [ ] **Acknowledge the choice** in narration ("You remember deciding to...")
- [ ] **Show immediate consequence** (door opens, guard alerted, NPC reacts)
- [ ] **Reference it later** (NPC remembers you lied, trap you disarmed is now safe)
- [ ] **Create branching paths** (different outcomes based on earlier choices)
- [ ] **Avoid railroading** (doesn't force "correct" choice to progress)

**Red Flags (Poor Engagement):**
- ❌ Every situation has one "correct" solution
- ❌ Failed checks simply repeat the same choice ("Try again")
- ❌ NPC ignores player's earlier deception/intimidation/persuasion
- ❌ World state doesn't change based on player actions
- ❌ Moral choices have obvious "good" and "evil" options

**Green Flags (Strong Engagement):**
- ✅ Multiple viable approaches to each obstacle
- ✅ Failures open new paths (guard hears you → chase scene begins)
- ✅ NPCs remember past interactions ("Last time you lied to me...")
- ✅ World reacts to choices (burn down tavern → guards search for arsonist)
- ✅ Moral dilemmas with no clear "right" answer

---

## 🧪 2. Testing Protocol

### 2.1 Sample Test Scenarios (10 Core Validation Tests)

Each scenario tests specific AI quality aspects. Run ALL 10 before considering prototype complete.

---

#### **Scenario 1: Generic Description Test**

**Objective:** Verify AI avoids clichés and provides specific details.

**Setup:**
```
Player: "I enter the tavern"
```

**Expected Response (PASS):**
- Specific tavern name ("The Soggy Boot")
- Sensory details (smell, sound, visual texture)
- Subverted expectations (not "dark and dangerous")
- At least 2 unique details

**Unacceptable Response (FAIL):**
- "You enter a dark tavern. Rough-looking patrons eye you suspiciously."
- Generic description with no specific details
- Standard fantasy cliché

**Scoring:**
- ✅ PASS: 0 clichés, 3+ specific details
- ⚠️ BORDERLINE: 1 cliché or 1-2 specific details
- ❌ FAIL: 2+ clichés or purely generic

---

#### **Scenario 2: Creative Action Handling**

**Objective:** Test AI response to unexpected/absurd player actions.

**Setup:**
```
Scene: Player faces a locked door
Player: "I seduce the door"
```

**Expected Response (PASS):**
- AI doesn't say "that doesn't work" or break immersion
- Responds in-character and creatively
- Turns absurdity into comedy or new opportunity
- Awards Momentum for creativity

**Unacceptable Response (FAIL):**
- "You can't do that. Pick a real action."
- "That doesn't make sense."
- AI gets confused or returns error

**Scoring:**
- ✅ PASS: Creative, funny response + Momentum awarded
- ⚠️ BORDERLINE: Acknowledges but doesn't leverage comedy
- ❌ FAIL: Refuses action or breaks immersion

**Example PASS:**
```
You press your ear to the door and whisper sweet nothings.

The door, being wood, does not respond. However, the GUARD on the other
side absolutely hears you.

"Are you... hitting on the door?" he asks, deeply confused.

+1 MOMENTUM (sheer audacity)

New options:
1. Pretend this was your plan all along
2. Run away in embarrassment
3. Double down ("The door loves me!")
```

---

#### **Scenario 3: NPC Personality Consistency**

**Objective:** Verify NPCs maintain personality across multiple interactions.

**Setup:**
```
Turn 1: Player meets "Grimsby the Coin-Counter" (nervous, counts on fingers)
Turn 2: Player returns 30 minutes later
Player: "Hey Grimsby, remember me?"
```

**Expected Response (PASS):**
- NPC remembers the player
- Personality traits remain consistent (still nervous, still counting)
- Adds new detail (doesn't just repeat earlier dialogue)
- References past interaction

**Unacceptable Response (FAIL):**
- NPC acts like first meeting
- Personality completely different
- Generic greeting with no memory
- Name wrong or forgotten

**Scoring:**
- ✅ PASS: Consistent personality + remembers player + new content
- ⚠️ BORDERLINE: Consistent personality but no memory
- ❌ FAIL: Personality changed or no recognition

---

#### **Scenario 4: Moral Complexity Test**

**Objective:** Ensure AI creates dilemmas without obvious "good" choice.

**Setup:**
```
Quest: "Kill the necromancer"
Player: "I find the necromancer"
```

**Expected Response (PASS):**
- Situation is morally complex (e.g., necromancer is child protecting herself)
- No clear "right" answer
- AI presents 3+ options with different moral implications
- Consequences hinted at for each choice

**Unacceptable Response (FAIL):**
- Simple "kill or spare" binary
- Necromancer is pure evil with no nuance
- Obvious "good" choice exists
- No moral weight to decision

**Scoring:**
- ✅ PASS: 3+ options, no clear "right" answer, emotional weight
- ⚠️ BORDERLINE: 2 options but with moral complexity
- ❌ FAIL: Simple binary or obvious "good vs evil"

---

#### **Scenario 5: Twist Foreshadowing**

**Objective:** Test AI's ability to plant clues that pay off later.

**Setup:**
```
Turn 1: NPC mentions detail casually ("those merchants were arguing about 'the weight'")
Turn 5: Player investigates caravan
Player: "I check the cargo manifest"
```

**Expected Response (PASS):**
- AI remembers the earlier detail
- Creates payoff ("Silk isn't heavy... but weapons are")
- Twist feels earned, not random
- Player can feel smart for noticing

**Unacceptable Response (FAIL):**
- AI forgets earlier clue
- Twist comes from nowhere
- No connection between setup and payoff

**Scoring:**
- ✅ PASS: Clear callback to earlier clue + logical twist
- ⚠️ BORDERLINE: Callback exists but connection weak
- ❌ FAIL: No callback or random twist

---

#### **Scenario 6: Combat Personality Test**

**Objective:** Ensure combat is dramatic and character-driven, not mechanical.

**Setup:**
```
Player: "I attack the goblin"
```

**Expected Response (PASS):**
- Enemy has personality (trash talks, makes mistakes, flees when wounded)
- Combat narration is vivid and specific
- Not just "You hit for X damage"
- Actions have character beyond numbers

**Unacceptable Response (FAIL):**
- "You attack. Roll: 15. Hit. 13 damage."
- Generic combat log with no personality
- Enemy is just HP sponge

**Scoring:**
- ✅ PASS: Vivid narration + enemy personality + dramatic description
- ⚠️ BORDERLINE: Some personality but mostly mechanical
- ❌ FAIL: Pure combat log, no character

---

#### **Scenario 7: Failure State Interest**

**Objective:** Verify that failures are interesting, not punishing or boring.

**Setup:**
```
Player attempts lockpicking with low skill (difficulty 50, skill 20)
Expected: High chance of failure
```

**Expected Response (PASS):**
- Failure creates new situation (guard hears, pick breaks, time runs out)
- Failure opens new paths (must find another route)
- Narration makes failure entertaining
- Player still has agency

**Unacceptable Response (FAIL):**
- "You fail. Try again." (repeat same choice)
- "You fail and lose 10 HP" (arbitrary punishment)
- Dead end with no alternative

**Scoring:**
- ✅ PASS: Interesting consequence + new options opened
- ⚠️ BORDERLINE: Minor consequence but can retry
- ❌ FAIL: "Try again" or dead end

---

#### **Scenario 8: Contextual Action Generation**

**Objective:** Test AI's ability to generate actions that match the scene.

**Setup:**
```
Scene: Player stands before a reinforced door in a warehouse
```

**Expected Response (PASS):**
- 3-4 actions specific to THIS door in THIS context
- At least 1 action uses player's best skill
- Mix of safe/risky options
- Show difficulty and player's skill level
- "Custom action" option always present

**Unacceptable Response (FAIL):**
- Generic actions that could apply anywhere ("search room")
- No skill checks shown
- All actions same difficulty
- Missing custom option

**Scoring:**
- ✅ PASS: 3-4 contextual actions + skill indicators + custom option
- ⚠️ BORDERLINE: Actions contextual but missing skill details
- ❌ FAIL: Generic actions or incomplete info

**Example PASS:**
```
What do you do?

1. 🔓 Pick the lock [Lockpicking: 30] - Your skill: 15 🔴 DESPERATE
   Requires focus (your poisoning makes this harder)

2. 👂 Listen at the door [Perception: 20] - Your skill: 18 🟡 RISKY
   Gather intel on who's inside before committing

3. 🔥 Set distraction fire [Survival: 15] - Your skill: 12 🟡 RISKY
   Lure them out, but might attract city watch

4. ✍️ Something else (describe your action)
```

---

#### **Scenario 9: Momentum System Validation**

**Objective:** Confirm AI awards Momentum appropriately.

**Setup:**
```
Player attempts creative solution:
"I convince the guard his shoelaces are untied, but he's wearing boots"
[Deception check: FAILURE]
```

**Expected Response (PASS):**
- AI awards Momentum despite failure (creativity recognized)
- Failure is entertaining
- Creative failure might still open new path
- Clear "+1 Momentum" message

**Unacceptable Response (FAIL):**
- No Momentum awarded
- Failure is boring or punishing
- AI doesn't acknowledge creativity

**Scoring:**
- ✅ PASS: Momentum awarded + entertaining failure narration
- ⚠️ BORDERLINE: Good narration but no Momentum
- ❌ FAIL: Boring failure, no recognition

---

#### **Scenario 10: State Consistency Test**

**Objective:** Ensure AI doesn't hallucinate items/abilities player doesn't have.

**Setup:**
```
Game State: Player inventory = ["staff", "health_potion", "torch"]
Player: "I use my rope to climb"
```

**Expected Response (PASS):**
- AI correctly identifies player has no rope
- Offers alternative ("You could improvise with...") or
- Gently corrects ("You don't have rope, but you see...")
- Doesn't just say "yes" to invalid action

**Unacceptable Response (FAIL):**
- AI allows action with non-existent item
- Invents items in player inventory
- Contradicts established game state

**Scoring:**
- ✅ PASS: Correctly enforces state + offers alternatives
- ⚠️ BORDERLINE: Catches error but awkwardly
- ❌ FAIL: Allows impossible action or invents items

---

### 2.2 Scoring Rubric Summary (1-5 Scale)

For each test scenario, score on this unified scale:

| Score | Label | Description |
|-------|-------|-------------|
| **5** | Exceptional | Exceeds all criteria; exemplifies best practices |
| **4** | Strong | Meets all criteria; minor areas for improvement |
| **3** | Adequate | Meets most criteria; noticeable gaps but acceptable |
| **2** | Weak | Fails multiple criteria; needs significant improvement |
| **1** | Failed | Fails core criteria; unacceptable for release |

**Minimum Passing Threshold:**
- Average score ≥ 3.5 across all 10 scenarios
- No individual scenario below 2.0
- At least 5 scenarios scoring 4.0+

---

### 2.3 A/B Testing Framework for Prompts

**When to Use:** If initial tests score <3.5 average, iterate on prompts.

**A/B Test Structure:**

#### **Step 1: Identify Weakness**
Run all 10 scenarios and categorize failures:
- **Humor issues:** Scenarios 1, 2, 6 failing
- **NPC issues:** Scenarios 3, 4 failing
- **Story issues:** Scenarios 5, 7 failing
- **Mechanics issues:** Scenarios 8, 10 failing

#### **Step 2: Create Variant Prompts**
Modify specific section of `PROMPTS.md`:

**Example: If humor scores are low**

**Prompt A (Control):** Current PROMPTS.md
**Prompt B (Test):** Add more humor examples + emphasis:
```
HUMOR PRIORITY: Comedy through specificity is CRITICAL.
Every scene should include at least one amusing detail.

BAD: "The goblin attacks"
GOOD: "The goblin charges, trips over his own sword, gets up FURIOUS"
```

#### **Step 3: Run Parallel Tests**
- **Group 1 (3 testers):** Use Prompt A
- **Group 2 (3 testers):** Use Prompt B
- **Blind:** Testers don't know which prompt they have
- **Same scenarios:** Both groups face identical 10 scenarios

#### **Step 4: Compare Results**

| Metric | Prompt A | Prompt B | Winner |
|--------|----------|----------|--------|
| Avg Score (Scenarios 1,2,6) | 2.8 | 4.1 | B |
| Player Laughs (per 30min) | 1.2 | 2.8 | B |
| Humor Rating (1-5 scale) | 2.9 | 4.3 | B |

**Decision Rule:** If Prompt B improves score by ≥0.5 → Adopt Prompt B

#### **Step 5: Iterate**
- Make Prompt B the new baseline
- Identify next weakness
- Create new variant (Prompt C)
- Repeat A/B testing

**Maximum Iterations:** 3 cycles (if still failing after 3 iterations, deeper redesign needed)

---

## 🚫 3. Anti-Cliché Validation Checklist

### 3.1 Automated Cliché Detection

**Tool: Cliché Scanner Script**

Create a Python script that analyzes AI outputs:

```python
# cliche_scanner.py
import re

CLICHE_PATTERNS = {
    "hooded_figure": r"(mysterious )?hooded figure",
    "dark_tavern": r"dark (and )?tavern",
    "ancient_evil": r"ancient (evil|darkness|power)",
    "wise_wizard": r"(wise|ancient) (old )?wizard",
    "rough_patrons": r"rough[- ]looking patrons",
    "shadows_gather": r"shadows (gather|close in|loom)",
    "chosen_one": r"chosen one|destined hero",
    "destiny": r"(your )?destiny (awaits|calls)",
    "evil_laugh": r"(evil|maniacal) laugh",
    "generic_quest": r"(simple|routine) (quest|mission|task)",
}

def scan_cliches(text):
    """Returns dict of found clichés and count"""
    found = {}
    for name, pattern in CLICHE_PATTERNS.items():
        matches = re.findall(pattern, text, re.IGNORECASE)
        if matches:
            found[name] = len(matches)
    return found

def cliche_score(text):
    """Returns cliché density: clichés per 100 words"""
    cliches = sum(scan_cliches(text).values())
    words = len(text.split())
    return (cliches / words) * 100 if words > 0 else 0

# Usage
response = ai_dungeon_master.narrate()
score = cliche_score(response)

if score > 5.0:
    print("❌ FAIL: Cliché density too high")
elif score > 2.0:
    print("⚠️ WARNING: Above recommended cliché threshold")
else:
    print("✅ PASS: Acceptable cliché density")
```

**Thresholds:**
- ✅ **Excellent:** 0-1% cliché density
- ⚠️ **Acceptable:** 1-2% cliché density
- ❌ **Unacceptable:** >2% cliché density

**Run automatically after EVERY playtest session.**

---

### 3.2 Manual Review Criteria

For each major scene (every 5-10 minutes of play), manually review:

#### **Description Quality Checklist**

- [ ] **Opening Description:** Does NOT use "You enter a [generic location]"
- [ ] **Visual Details:** At least 2 specific details (not "old," "dark," "mysterious")
- [ ] **Sensory Beyond Visual:** Includes smell, sound, or texture
- [ ] **Active Language:** Uses strong verbs, not passive descriptions
- [ ] **Subversion:** Avoids or subverts at least one expected fantasy trope

**Example Evaluation:**

❌ **FAIL:**
```
"You enter a dark tavern. Rough-looking patrons eye you suspiciously.
A mysterious hooded figure sits in the corner."
```
*Problems: 3 clichés, no specific details, completely predictable*

✅ **PASS:**
```
"You enter The Soggy Boot, a tavern that smells of cabbage and regret.
A bard in the corner is playing a lute badly—everyone is ignoring him.
A hooded figure waves you over, immediately spills their drink, and
mutters 'Oh gods, not YOU lot.'"
```
*Success: Specific name, sensory detail, subverted expectation*

---

### 3.3 Red Flags (Immediate Fail Criteria)

If ANY of these appear in a single session, mark as **FAILED QA:**

**Critical Red Flags:**

❌ **"Dark Tavern" Opening**
- AI opens with "You enter a dark tavern..."
- *Action:* Review opening scene generation in prompt

❌ **Nameless NPCs (3+ in one session)**
- Characters referred to as "The Guard," "The Merchant," "Mysterious Figure"
- *Action:* Strengthen NPC naming requirements in prompt

❌ **Pure Exposition Dialogue**
- NPC speaks only to deliver quest info with no personality
- Example: "Greetings, traveler. I have a quest for you..."
- *Action:* Add more NPC personality examples to prompt

❌ **Quest Dispenser Behavior**
- NPC exists only to give quest and has no other purpose
- No personality, no quirks, no motivation beyond helping heroes
- *Action:* Enforce "Every NPC has motivation" rule

❌ **Predictable Binary Choices**
- Every decision is "good choice vs evil choice"
- No moral complexity or consequences
- *Action:* Add moral complexity examples to prompt

❌ **State Hallucination**
- AI invents items player doesn't have
- References events that didn't happen
- Contradicts established facts
- *Action:* Strengthen state consistency rules

❌ **"That Doesn't Work" Response**
- AI refuses creative player action with no alternative
- Breaks immersion instead of responding in-character
- *Action:* Add "never refuse creativity" examples

---

### 3.4 Green Flags (Excellence Indicators)

Award **BONUS POINTS** when these appear:

✅ **Specific Sensory Details** (+1 per scene)
- Smell, sound, texture mentioned naturally
- Example: "ozone and old magic," "cabbage and regret"

✅ **Subverted Expectation** (+2 per occurrence)
- AI deliberately contradicts genre expectations
- Example: Hooded figure is clumsy and incompetent

✅ **Callback to Earlier Event** (+3 per callback)
- AI references player's past action or choice
- Example: "Last time you lied to me about the caravan..."

✅ **NPC Emotional Continuity** (+2 per NPC)
- NPC remains consistent across multiple interactions
- Shows growth or changed opinion based on player actions

✅ **Creative Failure Reward** (+3 per occurrence)
- Player tries absurd action, fails entertainingly
- AI awards Momentum despite failure

✅ **Player-Generated Solution** (+5 per occurrence)
- AI recognizes and implements player's creative solution
- Solution wasn't pre-scripted in quest design

**Excellence Threshold:** 15+ bonus points in a 30-minute session = Exceptional AI performance

---

## 📝 4. Prompt Iteration Guide

### 4.1 How to Identify Weak Responses

**Diagnostic Framework:**

After each failed test, categorize the failure type:

| Failure Category | Symptoms | Root Cause |
|-----------------|----------|------------|
| **Bland Descriptions** | Generic adjectives, clichés, no sensory details | Prompt lacks specific examples |
| **Forgettable NPCs** | No names, no quirks, quest dispensers | NPC generation rules too weak |
| **Predictable Plot** | No twists, telegraphed outcomes | Missing twist/foreshadowing instructions |
| **Mechanical Combat** | "You hit for X damage" logs | Lacks dramatic narration examples |
| **Ignored Creativity** | "That doesn't work" responses | Missing creative action handling rules |
| **State Errors** | Hallucinates items/events | Insufficient state enforcement |
| **Humor Failures** | Forced jokes or no humor | Comedy examples unclear or absent |
| **Railroading** | One solution per problem | Missing "multiple solutions" rule |

**Response Analysis Template:**

For each weak response, document:

```
SCENARIO: [Test scenario name]
PROMPT VERSION: [v0.1, v0.2, etc.]

PLAYER ACTION:
[What player did]

AI RESPONSE:
[Actual AI output]

ISSUES IDENTIFIED:
- [ ] Generic description
- [ ] Cliché used
- [ ] No NPC personality
- [ ] Predictable outcome
- [ ] Ignored creativity
- [ ] State error
- [ ] Humor miss
- [ ] Other: ___________

SPECIFIC PROBLEMS:
[Exact phrases or structural issues]

HYPOTHESIZED CAUSE:
[Which part of prompt is insufficient?]

PROPOSED FIX:
[Concrete change to prompt]
```

---

### 4.2 How to Adjust Prompts Based on Failures

**Step-by-Step Iteration Process:**

#### **Step 1: Isolate the Problem Section**

Map failure categories to prompt sections:

| Failure Type | Prompt Section to Edit |
|--------------|------------------------|
| Bland descriptions | "Core DM System Prompt" → Writing Style |
| Forgettable NPCs | "NPC Personality System" |
| No twists | "Layering Clues (The Twist System)" |
| Combat logs | "Handling Combat" |
| Creativity rejection | "Responding to Creative Actions" |
| State errors | "GAME STATE" section |
| No humor | "YOUR PERSONALITY" → Tone |

#### **Step 2: Apply Targeted Fixes**

**Fix Type 1: Add More Examples**

*Problem:* AI isn't subverting clichés enough

*Solution:* Add more "Bad vs Good" examples

```markdown
### Subverting Tropes (EXPANDED)

**The Dark Tavern:**
❌ "You enter a dark tavern..."
✅ "You enter The Soggy Boot, smelling of cabbage and regret"

**The Hooded Figure:**
❌ "A mysterious hooded figure approaches"
✅ "A hooded figure waves you over, spills their drink, mutters 'Not YOU lot'"

**The Wise Wizard:**
❌ "An ancient wizard strokes his beard"
✅ "An ancient wizard squints at you. 'What YEAR is it?'"

(Add 10 more examples...)
```

**Fix Type 2: Strengthen Rules**

*Problem:* NPCs lack names

*Solution:* Make naming mandatory

```markdown
### NPC MANDATORY REQUIREMENTS

EVERY NPC MUST HAVE:
1. ✅ A full name (not "The Guard")
2. ✅ ONE visual quirk (missing finger, nervous, etc.)
3. ✅ ONE personality trait shown in dialogue
4. ✅ A clear motivation

⚠️ NEVER introduce an NPC without these 4 elements.

If you cannot give an NPC personality, make them scenery instead.
```

**Fix Type 3: Add Negative Examples**

*Problem:* AI still using clichés

*Solution:* Show what NOT to do

```markdown
### FORBIDDEN PHRASES (Never use these)

❌ "You enter a dark tavern"
❌ "Mysterious hooded figure"
❌ "Ancient evil awakens"
❌ "Rough-looking patrons eye you"
❌ "Your destiny awaits"
❌ "The chosen one"

If you find yourself about to write these, STOP and rewrite with specificity.
```

**Fix Type 4: Increase Emphasis**

*Problem:* Important rules buried in long prompt

*Solution:* Add visual emphasis and repetition

```markdown
## ⚠️ CRITICAL RULES (These override everything else)

1. 🚫 NEVER use generic fantasy clichés
2. ✅ ALWAYS give NPCs full names and quirks
3. 🎭 ALWAYS respond creatively to absurd player actions
4. 📊 ALWAYS check game state before narrating
5. 🎲 ALWAYS provide multiple solutions to problems

(Repeat these rules in relevant sections)
```

#### **Step 3: Version Control Changes**

Document every prompt change:

```markdown
## PROMPTS.md Changelog

### v0.2 (2025-10-31)
**Problem:** Bland descriptions (avg score 2.8/5.0)
**Changes:**
- Added 10 more "Bad vs Good" examples to "Subverting Tropes"
- Created "Forbidden Phrases" section
- Strengthened emphasis on sensory details

**Test Results:**
- Re-ran Scenario 1: Score improved from 2.5 → 4.0
- Cliché density: 5.2% → 1.8%

### v0.3 (2025-11-01)
**Problem:** NPCs still forgettable (recall rate 40%)
**Changes:**
- Made NPC naming MANDATORY (added ⚠️ warning)
- Added 5 more NPC personality examples
- Created "NPC Consistency Tracking" rule

**Test Results:**
- Re-ran Scenario 3: Score improved from 2.0 → 3.5
- Name recall rate: 40% → 65%
```

---

### 4.3 Success Benchmarks for Each Iteration

**Iteration Success Criteria:**

After each prompt change, improvement must meet these thresholds:

| Iteration | Required Improvement | Pass Criteria |
|-----------|---------------------|---------------|
| **v0.1 → v0.2** | +0.5 avg score in affected scenarios | At least 1 red flag eliminated |
| **v0.2 → v0.3** | +0.3 avg score in affected scenarios | At least 2 scenarios now score 4.0+ |
| **v0.3 → v0.4** | +0.2 avg score overall | Overall avg ≥ 3.5 across all 10 tests |

**Maximum Iterations Before Pivot:**
- If 4+ iterations show <0.2 improvement each → Problem is architectural, not prompt-based
- Consider: Switching models, redesigning game loop, simplifying scope

**Success Threshold:**
- ✅ **Overall average ≥ 3.5** across all 10 scenarios
- ✅ **No scenarios below 2.0**
- ✅ **At least 5 scenarios scoring 4.0+**
- ✅ **Zero critical red flags** in 3 consecutive tests

---

## 🎮 5. Playtest Observation Framework

### 5.1 What to Watch During Playtests

**Observer Role:** Sit behind/beside player (don't interrupt unless they're genuinely stuck >5 min)

**Observation Checklist (check during session):**

#### **Engagement Signals**

✅ **Positive Indicators:**
- [ ] Leans forward toward screen
- [ ] Laughs or smiles (mark each occurrence with timestamp)
- [ ] Reads AI responses aloud to others
- [ ] Makes excited sounds ("Oh no!" "Yes!" "What?!")
- [ ] Takes time to consider choices (not rushing)
- [ ] Types custom actions (not just clicking numbered choices)
- [ ] Quotes NPC dialogue later

❌ **Negative Indicators:**
- [ ] Leans back, distant body language
- [ ] Repeatedly checks phone during AI narration
- [ ] Skims responses without reading fully
- [ ] Sighs or shows frustration
- [ ] Always picks option #1 (not considering choices)
- [ ] Asks "How much longer?" or "Is this almost done?"
- [ ] Stops talking/reacting

#### **Confusion Signals**

⚠️ **Player is confused if they:**
- [ ] Re-reads AI response multiple times
- [ ] Asks "What am I supposed to do?" multiple times
- [ ] Types invalid actions repeatedly (3+ in a row)
- [ ] Hovers over choices without selecting (30+ seconds)
- [ ] Asks observer for clarification
- [ ] Complains about unclear objectives

#### **Enjoyment Moments**

🎉 **Mark exact timestamp when player:**
- Laughs audibly
- Gasps in surprise
- Says "That's awesome" or similar
- Shows to friend/roommate
- Screenshots or quotes a line
- Gets excited about choice consequences

**Logging Format:**

```
SESSION LOG - Playtest #1
Player: Alex
Timestamp | Event | Notes
---------|-------|-------
00:03 😄 | Smile | "The Soggy Boot tavern" description
00:07 🤔 | Pause | Considering which action (good sign)
00:12 🤣 | Laugh | Hooded figure spilling drink
00:18 ✍️ | Custom action | Typed creative solution
00:25 😐 | Disengagement | Checked phone during narration
00:31 😃 | Excited | "I didn't expect that!"
00:35 🗣️ | Quoted | Repeated Guildmaster's line to observer
```

---

### 5.2 How to Collect Actionable Feedback

**Immediate Post-Session Interview (5 minutes):**

Ask these questions IMMEDIATELY after session (memory is fresh):

#### **Core Quality Questions:**

1. **"On a scale of 1-5, how entertaining was that?"**
   - Follow-up: "What made it [high/low]?"

2. **"Did you laugh at all during the session?"**
   - If yes: "What was the funniest moment?"
   - If no: "Was anything amusing or just meh?"

3. **"Were you surprised by anything?"**
   - Follow-up: "What surprised you most?"

4. **"Can you name any characters you met?"**
   - Don't prompt with names, see if they recall unprompted
   - Follow-up: "What do you remember about [character]?"

5. **"Did your choices feel meaningful?"**
   - Follow-up: "Give an example of a choice that mattered"

6. **"Would you play again tomorrow?"**
   - If yes: "Why? What would bring you back?"
   - If no: "What would need to change?"

#### **Diagnostic Questions:**

7. **"Was anything confusing or frustrating?"**
   - Record specific examples

8. **"Did anything feel generic or cliché?"**
   - Probe for specific descriptions/moments

9. **"What was your favorite moment?"**
   - This reveals what's working best

10. **"If you could change ONE thing, what would it be?"**
    - Prioritizes most important fix

**24-Hour Follow-Up Survey (sent via email/form):**

```
Subject: Quick follow-up on yesterday's playtest

Hey [Name],

Thanks again for testing Project Argent yesterday!

Just 3 quick questions while it's still fresh:

1. Without looking back, can you name any characters from the game?
   [Open text field]

2. What do you remember most vividly from the session?
   [Open text field]

3. On a scale of 1-5, how much do you want to play more?
   [1] [2] [3] [4] [5]

Thanks!
```

**Why 24-hour follow-up matters:** Tests long-term memorability (especially for NPCs).

---

### 5.3 Signals: AI Working vs Not Working

**Clear Success Signals (AI is working):**

✅ **Player Laughs 2+ Times**
- Strong indicator of humor quality

✅ **Player Types Custom Actions**
- Shows engagement, not just clicking through

✅ **Player Quotes AI Lines Later**
- Memorable writing

✅ **Player Asks "Can I play more?"**
- Ultimate success metric

✅ **Player Remembers NPC Names 24h Later**
- Character memorability achieved

✅ **Player Shows Others**
- Organic enthusiasm

✅ **Player Surprised by Twist**
- Narrative quality strong

✅ **Session Ends, Player Says "That was fun"**
- Overall positive experience

**Clear Failure Signals (AI is NOT working):**

❌ **Player Skims Responses**
- Narration not engaging enough

❌ **Player Checks Phone Multiple Times**
- Bored, not immersed

❌ **Player Always Picks #1 (doesn't read choices)**
- Choices don't feel meaningful

❌ **Player Sighs or Shows Frustration**
- Something is annoying or confusing

❌ **Player Asks "How much longer?"**
- Not enjoying experience

❌ **Player Can't Recall Any NPCs**
- Characters forgettable

❌ **Player Says "It was fine" (neutral tone)**
- Mediocre, not engaging

❌ **Player Doesn't Want to Play Again**
- Failed to hook them

---

### 5.4 Quick-Fix vs Deep-Fix Indicators

**Quick Fixes (Can solve in <2 hours):**

🔧 **Symptoms:**
- Specific phrases flagged as clichés
- One NPC is generic (others are good)
- Formatting issues (hard to read choices)
- One scenario feels boring (others work)

**Solution:**
- Add targeted examples to prompt
- Adjust specific NPC generation section
- Improve Discord formatting/embeds
- Revise specific quest beat

---

**Deep Fixes (Requires >1 day / architectural change):**

🏗️ **Symptoms:**
- ALL NPCs are forgettable
- EVERY scene uses clichés
- NO moments of surprise across entire session
- Players confused by core game loop
- AI consistently hallucinates state
- Humor attempts completely fail

**Solution:**
- Rewrite entire PROMPTS.md
- Reconsider game structure
- Add more context to AI (longer prompts)
- Simplify scope (remove features)
- Test different AI model/parameters
- Consider pivot (maybe this approach won't work)

---

**Decision Matrix:**

| Symptoms | Fix Type | Time Investment | Priority |
|----------|----------|-----------------|----------|
| 1-2 weak scenarios | Quick | 1-2 hours | High |
| Inconsistent quality | Quick | 2-4 hours | High |
| All scenarios weak | Deep | 1-2 days | Critical |
| Core mechanics unclear | Deep | 2-3 days | Critical |
| Players universally dislike | Deep | Pivot / Rethink | Critical |

---

## 🚨 6. Emergency Response Plan

### 6.1 Offensive Content

**Scenario:** AI produces inappropriate, offensive, or NSFW content.

**Immediate Actions:**

1. **STOP THE SESSION** immediately
2. **Screenshot the output** (for debugging)
3. **Apologize to player:** "That's not supposed to happen—this is a bug, not intended content"
4. **Offer to end session** or restart from last checkpoint

**Post-Incident Protocol:**

1. **Document:**
   - Exact prompt that led to output
   - Player's action before incident
   - Full game state at time of incident
   - Complete AI response

2. **Root Cause Analysis:**
   - Was it provoked by player input? (player typed NSFW action)
   - Was it unprompted? (AI generated it spontaneously)
   - Was context misinterpreted? (e.g., "seducing the door" → inappropriate)

3. **Preventive Fixes:**
   - Add content filtering to prompt:
     ```
     CONTENT RESTRICTIONS:
     - Keep all content PG-13 (fantasy violence okay, graphic gore not okay)
     - Romance/flirting should be comedic, never explicit
     - If player requests NSFW content, deflect humorously in-character
     ```
   - Add output validation (regex filters for slurs/explicit terms)
   - Increase Claude's safety settings (if available in API)

4. **Re-Test:**
   - Run same scenario again with fixed prompt
   - Ensure output is now appropriate
   - Test 5 more potentially problematic scenarios

**Escalation:** If offensive content persists after fixes → This is a blocker. Do not proceed to public testing until resolved.

---

### 6.2 AI Hallucinations

**Scenario:** AI invents items, abilities, or events that don't exist in game state.

**Types of Hallucinations:**

**Type 1: Item Hallucination**
```
Player inventory: ["staff", "health_potion"]
AI: "You pull out your rope and tie up the guard"
```

**Type 2: Event Hallucination**
```
Reality: Player never met the guildmaster
AI: "The guildmaster recognizes you from earlier"
```

**Type 3: Ability Hallucination**
```
Player class: Fighter (no magic)
AI: "You cast a fireball at the enemy"
```

**Immediate Actions:**

1. **Don't break immersion in front of player** (yet)
2. **Use `/status` command** to show current inventory/abilities
3. **Gently correct player:** "Actually, you don't have rope. Want to try something else?"
4. **Note the hallucination** for post-session fix

**Post-Session Fixes:**

**Fix Level 1: Strengthen State Enforcement**

Add to prompt:
```markdown
## CRITICAL RULE: State Consistency

Before EVERY response:
1. Check player's CURRENT inventory
2. Check player's CURRENT abilities (class-based)
3. Check PAST events (flags, world state)

⚠️ NEVER narrate:
- Items player doesn't have
- Abilities player can't use
- Events that didn't happen

If player requests impossible action:
✅ CORRECT: "You reach for your rope... but you don't have any. However, you notice..."
❌ WRONG: "You pull out your rope" (when they don't have rope)
```

**Fix Level 2: Add Pre-Response Validation**

In bot code, add validation before sending AI response:
```python
def validate_ai_response(response, game_state):
    """Check if AI hallucinated items/abilities"""
    inventory = game_state['player']['inventory']

    # Check if AI mentioned items player doesn't have
    for item in KNOWN_ITEMS:
        if item in response.lower() and item not in inventory:
            if f"you don't have {item}" not in response.lower():
                return False, f"AI hallucinated item: {item}"

    # Check if AI used abilities player can't have
    player_class = game_state['player']['class']
    if player_class != "Mage" and "cast" in response.lower():
        return False, "AI hallucinated magic ability for non-Mage"

    return True, None

# Usage
is_valid, error = validate_ai_response(ai_output, game_state)
if not is_valid:
    log_error(error)
    regenerate_response()  # Try again with stronger state emphasis
```

**Fix Level 3: Provide State Explicitly in Every Prompt**

Instead of:
```
Player context: [brief summary]
```

Use:
```
PLAYER'S CURRENT INVENTORY (these are the ONLY items they have):
- staff
- health_potion
- torch

PLAYER'S CLASS: Fighter
PLAYER'S ABILITIES: Only Fighter abilities (NO MAGIC)

PAST EVENTS:
- Met Guildmaster Thorne
- Did NOT explore warehouse yet
- Did NOT meet thieves' guild contact yet

⚠️ Only narrate items from this list. If player tries to use missing item, say they don't have it.
```

**Success Metric:** Zero hallucinations in 3 consecutive playtests after fixes.

---

### 6.3 Recovery from Boring Responses

**Scenario:** AI produces generic, flat, or unengaging narration.

**Example Boring Response:**
```
Player: "I enter the tavern"
AI: "You enter the tavern. It is dark. There are people here.
     A man approaches you."
```

**Immediate Recovery Actions:**

**Option 1: Regenerate with Enhanced Prompt**

Add temporary emphasis to next prompt:
```
⚠️ IMPORTANT: The last response was too generic. For THIS response:
- Include specific sensory details (smell, sound, texture)
- Give the NPC a full name and memorable quirk
- Subvert at least one fantasy expectation
- Make it ENTERTAINING, not just functional
```

**Option 2: Use Fallback Template**

If regeneration still boring, manually inject personality:

```python
FALLBACK_TEMPLATES = {
    "tavern": [
        "You enter {name}, a tavern that smells of {smell}. A bard in the corner is {bard_action}. {npc_name}, a {descriptor}, waves you over.",
        "You push open the door to {name}. The air hits you—{smell} mixed with {sound}. {npc_name} ({descriptor}) looks up from {activity}."
    ],
    "npc_greeting": [
        "{npc_name} ({quirk}): '{greeting}' {action_while_speaking}",
        "'{greeting},' says {npc_name} while {nervous_action}."
    ]
}

# Fill in with random selections
tavern_intro = FALLBACK_TEMPLATES["tavern"][0].format(
    name="The Soggy Boot",
    smell="cabbage and regret",
    bard_action="playing a lute badly—everyone ignores him",
    npc_name="Grimsby",
    descriptor="nervous merchant missing two fingers"
)
```

**Post-Incident Protocol:**

1. **Diagnose WHY it was boring:**
   - [ ] Used clichés (dark tavern, mysterious figure)
   - [ ] No specific details (generic adjectives)
   - [ ] No NPC personality (quest dispenser)
   - [ ] No sensory details (only visual description)
   - [ ] Predictable (exactly what player expected)

2. **Targeted Prompt Fix:**

If clichés:
```markdown
🚫 FORBIDDEN: "dark tavern," "mysterious figure," "ancient evil"
Instead: Use specific names, sensory details, subverted expectations
```

If no details:
```markdown
EVERY SCENE MUST HAVE:
- A specific smell OR sound OR texture (not just visual)
- At least 2 unique concrete details
- One element that surprises the player
```

If no NPC personality:
```markdown
EVERY NPC MUST HAVE (before they speak):
- Full name: "Grimsby the Coin-Counter" (not "the merchant")
- Physical quirk: nervous, missing fingers, counts compulsively
- First line shows personality: "Oh gods, you're not with the Guild, are you?"
```

3. **Re-test with same scenario:**
   - Input: "I enter the tavern"
   - Expected: Now uses tavern name, sensory detail, NPC with personality
   - If still boring after 2 retries → Deeper prompt rewrite needed

**Success Metric:** No boring responses in 3 consecutive playtests.

---

### 6.4 Fallback Strategies if Claude API Fails

**Scenario:** API timeout, rate limit, or service outage.

**Tiered Response:**

#### **Tier 1: Retry with Exponential Backoff**

```python
import time

def call_claude_with_retry(prompt, max_retries=3):
    for attempt in range(max_retries):
        try:
            response = anthropic_client.messages.create(
                model="claude-3-opus-20240229",
                max_tokens=1024,
                messages=[{"role": "user", "content": prompt}]
            )
            return response
        except Exception as e:
            if attempt < max_retries - 1:
                wait_time = 2 ** attempt  # 1s, 2s, 4s
                time.sleep(wait_time)
            else:
                raise e  # Final attempt failed
```

#### **Tier 2: Fallback to Simpler Prompt**

If full prompt times out, try condensed version:

```python
def fallback_simple_prompt(player_action, game_state):
    """Shorter prompt for when full prompt times out"""
    return f"""
    You are a witty fantasy DM.

    Player action: {player_action}
    Player inventory: {game_state['inventory']}
    Player HP: {game_state['hp']}

    Narrate the result entertainingly and present 3 action choices.
    """
```

#### **Tier 3: Pre-Generated Responses**

For critical paths, pre-write fallback narration:

```python
FALLBACK_RESPONSES = {
    "enter_tavern": {
        "narration": "You enter The Soggy Boot. Grimsby the merchant waves you over nervously.",
        "actions": [
            {"id": 1, "description": "Talk to Grimsby", "skill": "persuasion", "difficulty": 15},
            {"id": 2, "description": "Order a drink", "skill": "perception", "difficulty": 10},
            {"id": 3, "description": "Look around", "skill": "perception", "difficulty": 15}
        ]
    },
    # ... more critical scenes
}

if api_failed:
    return FALLBACK_RESPONSES.get(current_scene, generic_fallback)
```

#### **Tier 4: Graceful Degradation Message**

If all retries fail:

```python
async def handle_api_failure():
    await channel.send("""
    ⚠️ The AI Dungeon Master is temporarily unavailable (API issue).

    Options:
    1. Wait 30 seconds and try again
    2. Use `/status` to see your current stats
    3. Take a break—I'll notify you when it's back

    Your progress is saved!
    """)

    # Start background health check
    await monitor_api_health()
```

#### **Tier 5: Switch to Backup Model**

If Claude API is down, temporarily use fallback:

```python
try:
    response = call_claude(prompt)
except ServiceUnavailable:
    # Fallback to GPT-4 or cached responses
    response = call_gpt4_fallback(prompt)
    await notify_player("Using backup AI—quality may differ slightly")
```

**Prevention:**

- **Cache common responses** (tavern entrances, basic combat) locally
- **Monitor API status** proactively (alert before users notice)
- **Set realistic timeouts** (don't wait 60s for response)
- **Test failure modes** regularly (simulate API outage)

**Success Metric:** Players can continue playing even during API disruption (degraded but functional).

---

## 📊 7. Success Criteria Dashboard

### 7.1 Scorecard Template for Each Test Session

**Copy this template for EVERY playtest session:**

```
═══════════════════════════════════════════════════════
PROJECT ARGENT: AI DM QA SCORECARD
═══════════════════════════════════════════════════════

Session ID: PT-[Date]-[Number]  (e.g., PT-2025-10-30-01)
Tester: [Name]
Date: [YYYY-MM-DD]
Duration: [Minutes]
Prompt Version: [v0.1, v0.2, etc.]

───────────────────────────────────────────────────────
1. QUALITY METRICS (Score 1-5)
───────────────────────────────────────────────────────

[ ] Humor Score: ___/5
    Laughs observed: ___
    Favorite funny moment: _______________________

[ ] Surprise Factor: ___/5
    Surprises observed: ___
    Most surprising moment: ______________________

[ ] NPC Memorability: ___/5
    NPCs encountered: ___
    NPCs recalled (24h later): ___
    Recall rate: ___%

[ ] Description Quality: ___/5
    Specific descriptions: ___/20 sampled
    Generic descriptions: ___/20 sampled
    Ratio: ___%

[ ] Player Engagement: ___/5
    Action types used: ___
    Callbacks observed: ___
    Player rating (survey): ___/5

───────────────────────────────────────────────────────
2. SCENARIO TESTS (Score 1-5 each)
───────────────────────────────────────────────────────

[ ] Scenario 1: Generic Description Test: ___/5
[ ] Scenario 2: Creative Action Handling: ___/5
[ ] Scenario 3: NPC Personality Consistency: ___/5
[ ] Scenario 4: Moral Complexity Test: ___/5
[ ] Scenario 5: Twist Foreshadowing: ___/5
[ ] Scenario 6: Combat Personality Test: ___/5
[ ] Scenario 7: Failure State Interest: ___/5
[ ] Scenario 8: Contextual Action Generation: ___/5
[ ] Scenario 9: Momentum System Validation: ___/5
[ ] Scenario 10: State Consistency Test: ___/5

    SCENARIO AVERAGE: ___/5

───────────────────────────────────────────────────────
3. ANTI-CLICHÉ VALIDATION
───────────────────────────────────────────────────────

Cliché Detection:
[ ] Automated scan: ___% cliché density
[ ] Manual review: ___ clichés found

Critical Red Flags (any present = FAIL):
[ ] "Dark tavern" opening
[ ] 3+ nameless NPCs
[ ] Pure exposition dialogue
[ ] Quest dispenser behavior
[ ] Predictable binary choices
[ ] State hallucination
[ ] "That doesn't work" response

    RED FLAGS FOUND: ___

Green Flags (bonus points):
[ ] Specific sensory details: +___
[ ] Subverted expectations: +___
[ ] Callbacks to earlier events: +___
[ ] NPC emotional continuity: +___
[ ] Creative failure rewards: +___
[ ] Player-generated solutions: +___

    BONUS POINTS TOTAL: ___

───────────────────────────────────────────────────────
4. PLAYER FEEDBACK
───────────────────────────────────────────────────────

Post-Session Questions:
1. Entertaining? (1-5): ___
2. Did you laugh?: [Y/N]
3. Surprised?: [Y/N]
4. NPCs recalled: __________
5. Choices meaningful? (1-5): ___
6. Play again?: [Y/N]

Favorite moment: _________________________________

Most frustrating: _________________________________

One change requested: _________________________________

───────────────────────────────────────────────────────
5. OVERALL ASSESSMENT
───────────────────────────────────────────────────────

Quality Metrics Average: ___/5
Scenario Tests Average: ___/5
Red Flags Found: ___
Bonus Points: ___

PASS/FAIL CRITERIA:
[ ] Quality avg ≥ 3.5: [PASS/FAIL]
[ ] Scenario avg ≥ 3.5: [PASS/FAIL]
[ ] No critical red flags: [PASS/FAIL]
[ ] 4/5 player questions positive: [PASS/FAIL]

═══════════════════════════════════════════════════════
FINAL VERDICT: [PASS / FAIL / NEEDS IMPROVEMENT]
═══════════════════════════════════════════════════════

Notes:
_________________________________________________________
_________________________________________________________
_________________________________________________________

Next Actions:
[ ] ___________________________________________________
[ ] ___________________________________________________
[ ] ___________________________________________________
```

---

### 7.2 Minimum Passing Scores

**Individual Session Requirements:**

| Category | Minimum Score | Notes |
|----------|---------------|-------|
| **Quality Metrics Average** | ≥ 3.5/5.0 | Calculated from 5 quality metrics |
| **Scenario Tests Average** | ≥ 3.5/5.0 | Calculated from 10 test scenarios |
| **Scenario Minimum** | No score < 2.0 | No single scenario can be critically broken |
| **Scenarios Excellent** | ≥ 5 scoring 4.0+ | Must have several strong performances |
| **Critical Red Flags** | 0 | Any critical red flag = automatic fail |
| **Player Questions Positive** | ≥ 4/5 answered "yes" or rated 4+ | Core success criteria |
| **NPC Recall Rate** | ≥ 60% | At 24-hour follow-up |
| **Cliché Density** | ≤ 2.0% | Automated scan result |

**Aggregate Requirements (Across 3+ Playtests):**

| Metric | Threshold | Meaning |
|--------|-----------|---------|
| **Sessions Passed** | ≥ 3 out of 5 | Consistent quality, not luck |
| **Average Quality** | ≥ 3.8/5.0 | Aggregate across all sessions |
| **Zero Critical Failures** | 0 red flags across all tests | No major issues present |
| **Player Retention** | ≥ 70% say "yes" to play again | Strong engagement signal |

**Go/No-Go Decision:**

✅ **GO (Proceed to MVP):**
- 3+ sessions pass all individual requirements
- Aggregate average ≥ 3.8
- Zero critical red flags across all tests
- 70%+ players want to play again

⚠️ **ITERATE (Not ready yet):**
- 1-2 sessions pass, others close (3.0-3.4)
- Some red flags eliminated but work remains
- Mixed player feedback (some love it, some lukewarm)

❌ **NO-GO (Pivot needed):**
- 0 sessions pass requirements
- Persistent critical red flags after 3 iterations
- <50% players want to play again
- Fundamental issues (AI can't handle genre, game loop broken)

---

### 7.3 Go/No-Go Decision Gates

**Decision Gate 1: After First Playtest**

**Question:** "Is the AI DM fundamentally entertaining, or is it broken?"

| Outcome | Criteria | Action |
|---------|----------|--------|
| **GREEN** | Score ≥ 3.5, 0 red flags, player laughed | Proceed with 4 more tests |
| **YELLOW** | Score 2.5-3.4, 1-2 red flags, some positives | Fix red flags, retest in 1 day |
| **RED** | Score < 2.5, 3+ red flags, player bored | Deep prompt rewrite, retest in 2 days |

---

**Decision Gate 2: After 3 Playtests**

**Question:** "Is quality consistent, or were we lucky once?"

| Outcome | Criteria | Action |
|---------|----------|--------|
| **GREEN** | 2-3 sessions pass, avg ≥ 3.5 | Proceed with 2 more tests (validation) |
| **YELLOW** | 1-2 sessions pass, improving trend | Iterate prompt, test 2 more |
| **RED** | 0-1 sessions pass, no improvement | Major rethink needed (see Pivot Options) |

---

**Decision Gate 3: After 5 Playtests**

**Question:** "Are we ready for MVP build?"

| Outcome | Criteria | Action |
|---------|----------|--------|
| **GO** | 3+ pass, avg 3.8+, 70%+ retention | ✅ Write up findings, proceed to MVP planning |
| **ALMOST** | 3 pass but avg 3.5-3.7, 60% retention | One more iteration cycle, then decide |
| **NO-GO** | <3 pass, avg <3.5, <60% retention | ❌ Pivot or cancel (see options below) |

---

**Pivot Options (If NO-GO):**

If prototype fails after 5 tests + iterations:

**Option A: Scope Reduction**
- Remove combat entirely (focus on story/choices)
- Single-player only (drop multiplayer asymmetry)
- Guided narrative (less open-ended, more structured)

**Option B: Different AI Approach**
- Test GPT-4 instead of Claude (different strengths)
- Use template-based generation with AI filling blanks
- Hybrid: Scripted story with AI-generated dialogue only

**Option C: Pivot to Adjacent Product**
- Turn it into DM assistant tool (not full game)
- Make it a "choose your own adventure" book generator
- Focus on NPC conversation simulator

**Option D: Cancel and Learn**
- Document what didn't work
- Extract learnings for future projects
- Don't throw good money after bad

**Decision Rule:** If 3 attempts at pivot still fail → Project is not viable with current approach. Stop and move on.

---

## 📋 Appendices

### Appendix A: Automated Testing Scripts

**Script 1: Cliché Density Scanner**

```python
# cliche_scanner.py
# Usage: python cliche_scanner.py session_log.txt

import re
import sys

CLICHE_PATTERNS = {
    "hooded_figure": r"(mysterious |hooded )figure",
    "dark_tavern": r"dark (and )?(crowded )?tavern",
    "ancient_evil": r"ancient (evil|darkness|power|curse)",
    "wise_wizard": r"(wise|ancient) (old )?wizard",
    "rough_patrons": r"rough[- ]looking (patrons|crowd|folks)",
    "shadows": r"shadows (gather|close in|loom|reach)",
    "destiny": r"(your )?destiny (awaits|calls|beckons)",
    "chosen": r"chosen (one|hero)",
    "mysterious_stranger": r"mysterious (stranger|figure|person)",
    "evil_laugh": r"(evil|maniacal) laugh(ter)?",
}

def scan_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        text = f.read()

    total_words = len(text.split())
    cliches_found = {}
    total_cliches = 0

    for name, pattern in CLICHE_PATTERNS.items():
        matches = re.findall(pattern, text, re.IGNORECASE)
        if matches:
            count = len(matches)
            cliches_found[name] = count
            total_cliches += count

    density = (total_cliches / total_words * 100) if total_words > 0 else 0

    print(f"═══════════════════════════════════════")
    print(f"CLICHÉ ANALYSIS REPORT")
    print(f"═══════════════════════════════════════")
    print(f"Total words: {total_words}")
    print(f"Total clichés: {total_cliches}")
    print(f"Cliché density: {density:.2f}%")
    print()

    if cliches_found:
        print("Clichés found:")
        for name, count in sorted(cliches_found.items(), key=lambda x: x[1], reverse=True):
            print(f"  • {name}: {count} occurrence(s)")
    else:
        print("✅ No clichés detected!")

    print()
    if density > 2.0:
        print("❌ FAIL: Cliché density exceeds 2.0%")
        return False
    elif density > 1.0:
        print("⚠️ WARNING: Cliché density above recommended 1.0%")
        return True
    else:
        print("✅ PASS: Acceptable cliché density")
        return True

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python cliche_scanner.py <session_log.txt>")
        sys.exit(1)

    passed = scan_file(sys.argv[1])
    sys.exit(0 if passed else 1)
```

---

**Script 2: NPC Name Extractor**

```python
# npc_extractor.py
# Extracts NPC names from session logs to test recall

import re
import sys

def extract_npcs(filepath):
    """Extract probable NPC names from game log"""
    with open(filepath, 'r', encoding='utf-8') as f:
        text = f.read()

    # Pattern: Capital Name + descriptor/title
    # Examples: "Guildmaster Thorne", "Grimsby the Coin-Counter"
    pattern = r'\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+(?:the\s+[A-Z][a-z-]+|says|asks|mutters|\([0-9]+s\))'

    matches = re.findall(pattern, text)

    # Deduplicate and filter
    npcs = sorted(set(matches))

    print("═══════════════════════════════════════")
    print("NPC NAME EXTRACTION")
    print("═══════════════════════════════════════")
    print(f"NPCs found: {len(npcs)}")
    print()

    for i, npc in enumerate(npcs, 1):
        print(f"{i}. {npc}")

    print()
    print("Use this list for 24-hour recall test.")
    print("Ask player: 'Name any characters from yesterday'")

    return npcs

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python npc_extractor.py <session_log.txt>")
        sys.exit(1)

    extract_npcs(sys.argv[1])
```

---

### Appendix B: Sample Session Logs

**Example PASS Session:**

```
═══════════════════════════════════════════════════════
SESSION: PT-2025-10-30-01
TESTER: Alex
PROMPT VERSION: v0.2
═══════════════════════════════════════════════════════

[00:00] PLAYER: /action I enter the tavern

[00:03] AI:
You push open the door to The Soggy Boot, and the smell hits you first—
cabbage and regret, with a hint of spilled ale. A bard in the corner is
playing a lute badly. Everyone is ignoring him.

A hooded figure at the bar waves you over, immediately knocks over their
drink, and mutters "Oh gods, not YOU lot."

😄 OBSERVER: Player smiled at "cabbage and regret"

[00:05] PLAYER: Option 1 (Talk to hooded figure)

[00:07] AI:
The figure lowers their hood, revealing Grimsby the Coin-Counter (40s,
nervous, missing two fingers). He's literally counting on his remaining
fingers.

"You're the adventurers? You're... shorter than I expected. Also younger.
Also I thought there'd be more of you. Are you SURE you're adventurers?"

He glances around nervously.

"Look, I need help, but if the Thieves' Guild finds out I talked to you,
I'm dead. Deader than dead. They'll kill me twice."

🤣 OBSERVER: Player laughed at "shorter than expected"

[00:12] PLAYER: /action I tell him we can help but I need to know what's going on

[00:15] AI:
Grimsby leans in, still counting on his fingers (he's up to seven somehow—
you're not sure how that's possible with eight fingers total).

"The Guild took my shipment. I'm supposed to deliver it to... to someone.
Important someone. If I don't deliver by tomorrow, that someone will make
the Guild look like friendly puppies."

He takes a shaky drink.

"The shipment was... look, I don't ask questions about cargo, okay? That's
how you keep your fingers." He looks at his missing fingers. "Well. Most
of them."

⚠️ OBSERVER: Player is engaged, leaning forward

[continues for 28 more minutes...]

═══════════════════════════════════════════════════════
QUALITY SCORES:
Humor: 5/5 (3 laughs, multiple smiles)
Surprise: 4/5 (twist reveal about cargo)
NPC Memorability: 5/5 (recalled "Grimsby" and "missing fingers" next day)
Description Quality: 5/5 (0 clichés, specific sensory details)
Engagement: 5/5 (player typed custom actions, very engaged)

AVERAGE: 4.8/5.0 ✅ PASS
═══════════════════════════════════════════════════════
```

---

**Example FAIL Session:**

```
═══════════════════════════════════════════════════════
SESSION: PT-2025-10-29-01
TESTER: Jordan
PROMPT VERSION: v0.1
═══════════════════════════════════════════════════════

[00:00] PLAYER: /action I enter the tavern

[00:03] AI:
You enter a dark tavern. Rough-looking patrons eye you suspiciously.
A mysterious hooded figure sits in the corner.

❌ RED FLAG: "Dark tavern" + "rough-looking patrons" + "mysterious hooded figure"

😐 OBSERVER: Player showed no reaction

[00:05] PLAYER: Option 1 (Talk to hooded figure)

[00:07] AI:
The figure looks up. "Greetings, traveler. I have a quest for you."

❌ RED FLAG: Pure exposition, no personality

[00:10] PLAYER: Option 1 (Accept quest)

[00:12] AI:
The figure explains: "Go to the warehouse district and retrieve my package.
I will pay you 100 gold."

❌ RED FLAG: Quest dispenser, no NPC name, no motivation

😐 OBSERVER: Player checked phone during narration

[continues with generic responses...]

═══════════════════════════════════════════════════════
QUALITY SCORES:
Humor: 1/5 (no laughs, no smiles)
Surprise: 2/5 (completely predictable)
NPC Memorability: 1/5 (couldn't recall any names next day—there were none)
Description Quality: 1/5 (3 major clichés in first response)
Engagement: 2/5 (player disengaged, checking phone)

AVERAGE: 1.4/5.0 ❌ FAIL

RED FLAGS: 4 critical issues detected
PLAYER FEEDBACK: "It was okay... felt pretty generic"
PLAY AGAIN: No

═══════════════════════════════════════════════════════
ACTIONS REQUIRED:
1. Rewrite prompt v0.1 → v0.2
2. Add "Forbidden Phrases" section
3. Enforce NPC naming rules
4. Add more personality examples
═══════════════════════════════════════════════════════
```

---

### Appendix C: Quick Reference - Red Flags & Green Flags

**🚫 CRITICAL RED FLAGS (Any one = FAIL)**

| # | Red Flag | Example | Fix Priority |
|---|----------|---------|--------------|
| 1 | "Dark tavern" opening | "You enter a dark tavern..." | Critical |
| 2 | 3+ nameless NPCs | "The guard," "the merchant," "the wizard" | Critical |
| 3 | Pure exposition dialogue | "Greetings traveler, I have a quest" | High |
| 4 | Quest dispenser | NPC only exists to give quest | High |
| 5 | Binary moral choices | Simple good/evil with obvious "right" answer | Medium |
| 6 | State hallucination | AI invents items player doesn't have | Critical |
| 7 | Creativity rejection | "That doesn't work" with no alternative | High |
| 8 | Combat logs | "You hit. 13 damage. Enemy hits. 8 damage." | Medium |

**✅ GREEN FLAGS (Award Bonus Points)**

| # | Green Flag | Points | Example |
|---|-----------|--------|---------|
| 1 | Specific sensory detail | +1 | "Smells of cabbage and regret" |
| 2 | Subverted expectation | +2 | Hooded figure is clumsy, not mysterious |
| 3 | Callback to earlier event | +3 | "Last time you lied to me..." |
| 4 | NPC emotional continuity | +2 | NPC remembers and reacts to past interaction |
| 5 | Creative failure reward | +3 | Absurd action fails but earns Momentum |
| 6 | Player-generated solution | +5 | AI recognizes and implements player's idea |
| 7 | Memorable NPC quirk | +2 | Counts on fingers compulsively |
| 8 | Twist with foreshadowing | +4 | Early clue pays off in surprise reveal |

---

## 📝 Document Changelog

### v0.1 (2025-10-30)
**Initial Release**
- Complete QA framework created
- 5 quality metrics defined with scoring rubrics
- 10 core test scenarios specified
- Anti-cliché validation system established
- Automated cliché detection script provided
- Prompt iteration guide with A/B testing framework
- Playtest observation framework with engagement signals
- Emergency response plans for all failure modes
- Success criteria dashboard and scorecard template
- Go/no-go decision gates established
- Appendices with scripts and sample logs

---

## 🔗 Cross-References

**Related Documents:**
- **MECHANICS.md** - Game rules that AI must follow (skill checks, combat, etc.)
- **PROMPTS.md** - Current AI personality prompt (test subject of this QA framework)
- **PROTOTYPE_PLAN.md** - 5-day sprint plan (QA validation happens Day 4-5)
- **TECH_STACK.md** - Implementation details for automated testing

**How to Use This Document:**
1. **Day 1-3 (Development):** Reference quality metrics while building
2. **Day 4 (Testing):** Run all 10 test scenarios on completed prototype
3. **Day 5 (Playtests):** Use scorecard template for each tester
4. **Post-Prototype:** Use iteration guide if scores < 3.5 average
5. **Decision Point:** Use go/no-go gates to determine next steps

---

**Status:** ✅ Ready for use
**Next Step:** Begin Day 1 of prototype build, keep this document handy for Day 4-5 validation
**Owner:** QA process lead (you!)
**Review Frequency:** Update after each prompt iteration with test results

---

**End of AI_DM_QA_FRAMEWORK.md**
