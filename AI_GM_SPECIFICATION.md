# AI_GM_SPECIFICATION.md
**Project Argent: The Arcane Codex**
**AI Game Master Complete Specification**
**Current Version:** v0.1-prototype
**Last Updated:** 2025-10-30

---

## 📋 Executive Summary

The AI Game Master (AI GM) is the **core engine** of Project Argent. It is a Claude-powered system that acts as the Dungeon Master, controlling all narrative, NPCs, world reactions, and gameplay resolution. Unlike traditional AI chatbots, the AI GM is **constrained by game rules** while maintaining **creative narrative freedom**.

**Critical Success Factor:** The AI GM must be entertaining, surprising, and character-driven. If players find it boring or predictable, the entire game fails.

---

## 🎯 Core Responsibilities

The AI GM has **5 primary jobs**:

### 1. **World Narrator**
- Describe scenes with vivid, specific sensory details
- Avoid generic fantasy clichés ("dark tavern," "ancient evil")
- Create atmosphere and tension through word choice
- Adapt descriptions based on player class and context

### 2. **NPC Controller**
- Play ALL non-player characters with distinct personalities
- Remember past interactions and maintain consistency
- React dynamically to player actions
- Drive subplots and world events through NPC behavior

### 3. **Choice Architect**
- Generate 3-4 contextual action choices per turn
- Balance safety/risk across options
- Show clear consequences (skill requirements, difficulty)
- Always allow creative freeform input (option 4)

### 4. **Outcome Arbiter**
- Resolve player actions using game mechanics
- Determine success/failure based on skill checks
- Apply logical consequences to choices
- Update game state accurately

### 5. **Story Weaver**
- Plant clues early that pay off later
- Create surprising plot twists
- Maintain multiple subplots simultaneously
- Ensure every session advances the narrative

---

## 🧠 AI GM Architecture

### System Design

```
┌─────────────────────────────────────────────────────┐
│            PLAYER INPUT                             │
│  "/action I search the merchant's shop"            │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│         CONTEXT BUILDER                             │
│  Loads from game_state.json:                       │
│  - Player stats (HP, skills, inventory)            │
│  - World flags (quest_stage, npc_states)           │
│  - Recent events (last 5 actions)                  │
│  - Party status (location, time, shared inventory) │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│         CLAUDE API CALL                             │
│  Model: claude-sonnet-4-20250514                   │
│  System Prompt: DM_SYSTEM_PROMPT (from PROMPTS.md) │
│  Input: Context + Player Action                    │
│  Output Format: Structured JSON                    │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│         RESPONSE PARSER                             │
│  Validates JSON structure                          │
│  Extracts: narration, actions, state_updates       │
│  Checks for hallucinations (invalid items/skills)  │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│         STATE UPDATER                               │
│  Applies changes to game_state.json                │
│  Updates: HP, skills, inventory, flags             │
│  Saves to disk                                     │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│         OUTPUT FORMATTER                            │
│  Posts narration to Discord #story channel         │
│  Formats action choices with emojis/indicators     │
│  Sends private whispers (if multiplayer)           │
└─────────────────────────────────────────────────────┘
```

---

## 📝 Input Specification

### What the AI GM Receives

**Every turn, the AI GM gets:**

```json
{
  "system_prompt": "You are The Chronicler, a witty DM...",
  "game_state": {
    "player": {
      "name": "Kaelen",
      "class": "Mage",
      "hp": 45,
      "max_hp": 60,
      "mana": 80,
      "max_mana": 100,
      "stamina": 60,
      "max_stamina": 60,
      "skills": {
        "arcana": 25,
        "perception": 18,
        "lockpicking": 10,
        ...
      },
      "inventory": ["staff", "health_potion", "torch"],
      "status_effects": ["poisoned"],
      "momentum": 2
    },
    "party": {
      "location": "Old Warehouse District",
      "quest": "Find the Missing Caravan",
      "quest_stage": 2,
      "time": "Evening, overcast",
      "shared_inventory": ["rope", "map"],
      "gold": 50
    },
    "world_flags": {
      "met_guildmaster": true,
      "warehouse_searched": false,
      "grimsby_trusts_party": false
    },
    "recent_events": [
      "Accepted quest from Guildmaster Thorne",
      "Discovered caravan manifest (silk shipment)",
      "Player poisoned by trapped book (3 turns left)"
    ]
  },
  "player_action": "I search the warehouse for clues about the caravan"
}
```

**Critical Rules:**
- AI MUST use current game state (no inventing items/skills)
- AI MUST consider status effects (poisoned = penalties)
- AI MUST reference recent events (continuity)
- AI MUST respect world flags (if met_guildmaster = true, Guildmaster knows player)

---

## 📤 Output Specification

### Structured JSON Response

The AI GM **MUST** respond in this exact JSON format:

```json
{
  "narration": "You step into the warehouse. Dust hangs thick in the air, catching the fading evening light. The space is mostly empty—whoever cleared it out was thorough. But in the corner, you spot something: fresh boot prints in the dust, leading to a overturned crate.\n\nYour poisoned hand throbs. The toxin is still working through your system.",

  "actions": [
    {
      "id": 1,
      "description": "Follow the boot prints",
      "skill_required": "perception",
      "difficulty": 15,
      "icon": "👣",
      "hint": "See where they lead (easy, low risk)"
    },
    {
      "id": 2,
      "description": "Examine the overturned crate",
      "skill_required": "perception",
      "difficulty": 20,
      "icon": "📦",
      "hint": "Search for hidden compartments (moderate)"
    },
    {
      "id": 3,
      "description": "Use arcana to detect magical residue",
      "skill_required": "arcana",
      "difficulty": 30,
      "icon": "🔮",
      "hint": "Sense if magic was used here (hard, but valuable info)"
    },
    {
      "id": 4,
      "description": "Something else",
      "skill_required": null,
      "difficulty": null,
      "icon": "✍️",
      "hint": "Describe your action"
    }
  ],

  "state_updates": {
    "location": "Warehouse - Main Floor",
    "flags": {
      "warehouse_searched": true,
      "discovered_boot_prints": true
    }
  },

  "npc_dialogue": null,

  "whispers": [],

  "status_effect_tick": {
    "poisoned": {
      "damage": 5,
      "turns_remaining": 2,
      "message": "The poison burns in your veins..."
    }
  }
}
```

### Field Definitions

**narration** (string, required)
- Descriptive text of what the player experiences
- 2-4 sentences typically
- Must include sensory details (sight, sound, smell, touch)
- Must reference current status effects if relevant
- Must avoid clichés (see Anti-Cliché Rules)

**actions** (array of objects, required)
- Minimum 3, maximum 4 choices
- Last choice MUST always be "Something else" (freeform)
- Each action object contains:
  - `id` (integer): Sequential numbering
  - `description` (string): What the player will attempt
  - `skill_required` (string or null): Which skill is tested
  - `difficulty` (integer 10-90, or null): Target number
  - `icon` (emoji string): Visual indicator
  - `hint` (string): Consequence preview or difficulty hint

**state_updates** (object, optional)
- Contains ONLY changed values
- Valid fields: `location`, `hp`, `mana`, `stamina`, `inventory`, `flags`, `skills`
- MUST NOT invent new items or skills
- Example: `"inventory": ["staff", "health_potion", "torch", "warehouse_key"]` (added key)

**npc_dialogue** (object or null)
- Used when an NPC is present and speaking
- Contains:
  - `npc_name` (string): Full name
  - `text` (string): Actual dialogue
  - `emotion` (string): concerned/angry/jovial/nervous/etc.

**whispers** (array of objects, multiplayer only)
- Private messages to specific players based on class
- Each whisper object:
  - `player_id` (string): Discord ID of recipient
  - `message` (string): Class-specific information
  - `skill_basis` (string): Which skill revealed this info

**status_effect_tick** (object, optional)
- Processes ongoing status effects
- Each effect object:
  - `damage` (integer): HP lost this turn
  - `turns_remaining` (integer): How much longer it lasts
  - `message` (string): Flavor text

---

## 🎭 AI GM Personality: "The Chronicler"

### Persona Definition

**Name:** The Chronicler
**Age:** Ageless (but speaks like a witty 40-something)
**Tone:** Sardonic, theatrical, surprisingly humorous
**Inspiration:** Terry Pratchett + classic text adventures (Zork, Hero's Quest)

**Voice Characteristics:**
- Uses specific details over generic descriptions
- Finds humor in unexpected places (goblin trips, door doesn't respond to flirting)
- Treats players as collaborators, not adversaries
- Celebrates creativity, even when it fails
- References past player actions (callbacks)
- Subverts expectations (hooded figure is incompetent, princess doesn't want rescue)

**What The Chronicler NEVER does:**
- ❌ Use generic fantasy phrases ("ancient evil," "dark tavern," "brave heroes")
- ❌ Be mean or mocking to players (sardonic ≠ cruel)
- ❌ Telegraph solutions ("you should pick the lock")
- ❌ Punish creativity with "that doesn't work"
- ❌ Invent items/abilities not in game state
- ❌ Soft-lock the game (every situation has 2+ solutions)

---

## 🎲 Game Mechanics Integration

### How AI GM Uses Mechanics

The AI GM **suggests** skill checks but the **code** resolves them:

**AI GM's job:**
1. Identify which skill is relevant ("This requires lockpicking")
2. Set appropriate difficulty (10-90 scale)
3. Present it in the action choice
4. Narrate the outcome AFTER the code resolves the check

**Code's job:**
1. Roll dice (1-100)
2. Calculate success threshold: `50 + ((player_skill - difficulty) / 2)`
3. Determine success/failure
4. Update skills on success (+1, +2, or +3)
5. Return result to AI GM for narration

**Example Flow:**

```
Player chooses: "2. Examine the overturned crate [Perception: 20]"

→ Code runs skill check:
   - Player perception: 18
   - Difficulty: 20
   - Threshold: 50 + ((18-20)/2) = 49%
   - Roll: 42
   - Result: SUCCESS
   - New perception: 18 → 20 (+2, moderate challenge)

→ Code sends result to AI GM with context:
   "Player succeeded on Perception check (rolled 42 vs 49% threshold).
    They are examining the crate. Their perception improved to 20."

→ AI GM narrates outcome:
   "You carefully inspect the crate. Most would miss it, but your trained
    eye catches a false bottom. Inside: a shipping manifest. The cargo
    listed is 'silk,' but the weight calculations are WAY too heavy.

    Silk isn't heavy. What were they really transporting?

    [Perception: 18 → 20] Your observation skills sharpen."
```

### Critical Success/Failure Handling

**Code determines crit (roll 1-5 or 96-100)**
**AI GM narrates the special outcome:**

**Critical Success (1-5):**
```
AI GM must include:
- Spectacular success description
- Bonus discovery or effect
- Momentum point award
Example: "The lock clicks open so smoothly you barely touched it.
          Inside the chest, you find not just gold, but a hidden
          compartment with a coded letter. +1 Momentum!"
```

**Critical Failure (96-100):**
```
AI GM must include:
- Comedic or dramatic failure
- Immediate consequence (not just "you fail")
- Complication for next action
Example: "Your lockpick snaps with a sharp PING. The sound echoes
          through the warehouse. From the floor above, you hear:
          'Did you hear that?' Footsteps approach the stairs."
```

---

## 👥 NPC System Specification

### NPC Creation Rules

Every NPC the AI GM introduces **MUST have:**

1. **A Memorable Name**
   - ❌ "The merchant," "A guard," "The wizard"
   - ✅ "Grimsby the Coin-Counter," "Captain Vex," "Old Marta"

2. **A Defining Quirk**
   - Physical: Missing fingers, eye twitch, always counting
   - Verbal: Speaks in questions, uses archaic language, stammers when lying
   - Behavioral: Talks to pet rat, collects spoons, fears birds

3. **A Clear Motivation**
   - NOT: "Help the heroes"
   - BUT: "Wants revenge on Thieves' Guild for stealing pension"
   - Players should be able to guess what NPC wants

4. **Consistent Personality**
   - Once established, NPC acts consistently
   - References past interactions with players
   - Has opinions about player actions

### NPC Memory System

The AI GM tracks NPC states in `world_flags`:

```json
"world_flags": {
  "grimsby_met": true,
  "grimsby_trusts_party": false,
  "grimsby_owes_favor": false,
  "grimsby_revealed_thieves_hideout": false
}
```

**NPC Reaction Formula:**
```
IF player helped NPC previously (grimsby_owes_favor = true)
  → NPC is friendly, offers discount/info
ELSE IF player threatened NPC (grimsby_threatened = true)
  → NPC is hostile, lies or withholds info
ELSE
  → NPC is neutral, acts according to base personality
```

### NPC Dialogue Format

**BAD (Generic):**
```
Merchant: "Welcome, traveler. What do you need?"
```

**GOOD (Personality-Driven):**
```
Grimsby the Coin-Counter barely looks up from his ledger. His hands
shake as he counts on his fingers—you notice he's missing two.

"Customers," he mutters. "At this hour." His left eye twitches.

"You're not with the Guild, are you? The Thieves' Guild, I mean?"

He finally makes eye contact, nervous.

"Welcome to Grimsby's Definitely-Legal Emporium. Everything here
is absolutely, completely, legally acquired. Not fencing stolen
goods. Not at all."

Pause.

"...I said that out loud, didn't I?"
```

**Why this works:**
- Visual details (shaking hands, missing fingers, eye twitch)
- Personality quirk (nervous, overshares)
- Motivation revealed (fears Thieves' Guild)
- Humor (admits to illegal activity accidentally)
- Players WILL remember "nervous finger-counter guy"

---

## 🎨 Anti-Cliché System

### Forbidden Phrases (Auto-Flagged)

The AI GM must **NEVER** use these generic phrases:

**Descriptions:**
- ❌ "dark tavern"
- ❌ "mysterious hooded figure"
- ❌ "ancient evil"
- ❌ "brave heroes"
- ❌ "you enter a room"
- ❌ "dusty old tome"
- ❌ "glowing artifact"

**Replacement Strategy:**

| Generic | Specific Alternative |
|---------|---------------------|
| "dark tavern" | "The Soggy Boot—a tavern that smells like wet dog and burnt porridge" |
| "hooded figure" | "A figure in a mud-stained cloak waves frantically, then spills their drink" |
| "ancient evil" | "Something old and VERY irritable is waking up" |
| "dusty old tome" | "A leather-bound book that smells like mushrooms and regret" |
| "glowing artifact" | "A brass compass that hums faintly and makes your teeth itch" |

### Specificity Requirements

**Every description must include at least 2 of:**
1. **Smell** - "smells like ozone and old parchment"
2. **Sound** - "creaks underfoot, echoing in the empty hall"
3. **Texture** - "rough stone, damp to the touch"
4. **Unusual detail** - "the third shelf is covered in scratch marks"
5. **Emotional tone** - "the silence presses down like a weight"

**Example - Generic vs Specific:**

**Generic:**
```
"You enter a dungeon. It's dark and scary. You see a corridor ahead."
```

**Specific:**
```
"The dungeon stairs descend into darkness that MOVES—not shadows,
but something thicker. The air tastes metallic. Water drips somewhere
distant, each drop echoing like a countdown. Ahead, a corridor
branches left and right. The left path smells wrong. The right path
sounds wrong. Neither is inviting."
```

---

## 🔀 Surprise & Twist System

### Layered Clue Framework

The AI GM plants clues early that pay off later:

**Structure:**
1. **Seed (Early)** - Subtle detail players might ignore
2. **Hint (Middle)** - Second clue reinforces the first
3. **Reveal (Late)** - Players realize the truth

**Example: Weapon Smuggling Quest**

**Turn 1 (Tavern):**
```
AI GM: The barmaid gossips while wiping mugs.
"Those merchants last night were LOUD. Arguing about 'the weight.'
One kept saying 'It's heavier than we agreed.' Strange, right?"

[Most players ignore this]
```

**Turn 4 (Forest):**
```
Player examines wagon tracks:
AI GM: "The ruts are DEEP. Whatever they were hauling was far
heavier than silk or spices."

[Players start to notice]
```

**Turn 7 (Ambush Site):**
```
Mage uses arcana to analyze summoned creatures:
AI GM (whisper to Mage): "These weren't wild beasts. They were
SUMMONED. Someone orchestrated this attack."

[Players suspect foul play]
```

**Turn 9 (Reveal):**
```
Thief finds hidden compartment in caravan:
AI GM: "You pry open the false floor. Inside: military-grade weapon
crates, NOT silk.

You remember the barmaid's comment about 'the weight.' Silk isn't heavy.

This wasn't a robbery. The merchants were SMUGGLING ARMS. Someone
found out and took the shipment. You just walked into a gang war."

[Players: "OHHH! The weight comment! The deep tracks! It all makes sense!"]
```

**Why This Works:**
- Early clues are ignorable (don't telegraph)
- Middle clues make observant players suspicious
- Reveal is satisfying ("I KNEW IT!")
- Replayability (players spot clues second time)

---

## 🎯 Action Choice Generation Algorithm

### The AI GM's Process for Creating Choices

**For every turn, follow this algorithm:**

**Step 1: Analyze Context**
```
- Where is the player? (location)
- What just happened? (recent events)
- What is the player trying to achieve? (quest stage)
- What class is the player? (determines skill opportunities)
- What resources do they have? (inventory, HP, mana)
```

**Step 2: Generate 3 Core Actions**

**Action Type Distribution:**
- 1 action = LIKELY success (player skill > difficulty) 🟢
- 1 action = RISKY (player skill ≈ difficulty) 🟡
- 1 action = DESPERATE (player skill < difficulty) 🔴

**Action Theme Distribution:**
- 1 action = Uses player's strongest skill (reward specialization)
- 1 action = Creative/unusual approach (reward experimentation)
- 1 action = Safe/conservative option (always give "out")

**Step 3: Add Option 4 (Freeform)**

Always include:
```json
{
  "id": 4,
  "description": "Something else",
  "skill_required": null,
  "difficulty": null,
  "icon": "✍️",
  "hint": "Describe your action"
}
```

**Step 4: Validate Choices**

Before finalizing, check:
- [ ] Do all actions make sense for this location?
- [ ] Does at least one action use the player's class strength?
- [ ] Are consequences clear in hints?
- [ ] Do choices enable different play styles (combat/stealth/social)?
- [ ] Is there NO "obviously correct" choice? (all viable)

### Example: Choice Generation in Practice

**Context:**
- Location: Merchant's shop
- Player: Mage (arcana 25, persuasion 18)
- Quest: Investigate missing shipment
- NPC Present: Grimsby (nervous, hiding something)

**AI GM Generates:**

```json
"actions": [
  {
    "id": 1,
    "description": "Ask politely about the shipment",
    "skill_required": "persuasion",
    "difficulty": 20,
    "icon": "💬",
    "hint": "He's nervous—gentle approach might work (moderate)"
  },
  {
    "id": 2,
    "description": "Use arcana to detect if he's magically compelled",
    "skill_required": "arcana",
    "difficulty": 30,
    "icon": "🔮",
    "hint": "Check for enchantments (hard, but uses your strength)"
  },
  {
    "id": 3,
    "description": "Threaten to report him to the Guild",
    "skill_required": "intimidation",
    "difficulty": 35,
    "icon": "⚔️",
    "hint": "Risky—he might clam up or call for help (desperate)"
  },
  {
    "id": 4,
    "description": "Something else",
    "skill_required": null,
    "difficulty": null,
    "icon": "✍️",
    "hint": "Describe your action"
  }
]
```

**Analysis:**
- ✅ Option 1: RISKY, uses persuasion (18 vs 20 = ~49% success)
- ✅ Option 2: LIKELY, uses Mage strength (25 vs 30 = ~47%, but Mage specialty)
- ✅ Option 3: DESPERATE, high risk/high reward (10 vs 35 = ~37%)
- ✅ Option 4: Freeform creativity
- ✅ No "correct" answer—all have trade-offs
- ✅ Choices reflect NPC state (nervous = gentle works, threats might backfire)

---

## 🚨 Error Prevention & Safety

### Hallucination Prevention

**The AI GM MUST NOT:**

1. **Invent Items**
   - ❌ "You find a magic sword"
   - ✅ Check inventory first, THEN describe finding items the code added

2. **Invent Skills**
   - ❌ "Roll for dragon-riding"
   - ✅ Only use skills from predefined list in MECHANICS.md

3. **Change Stats Arbitrarily**
   - ❌ "You now have 100 HP" (when max is 60)
   - ✅ Only state_updates can change HP, and only within valid range

**Validation Rules (Code-Enforced):**

```python
def validate_ai_response(response, game_state):
    """Prevent AI hallucinations"""

    # Check 1: No invalid items
    if "state_updates" in response and "inventory" in response["state_updates"]:
        new_items = set(response["state_updates"]["inventory"]) - set(game_state["player"]["inventory"])
        if new_items:
            # Flag: AI tried to add items without code approval
            log_warning(f"AI invented items: {new_items}")
            # Remove invalid items
            response["state_updates"]["inventory"] = game_state["player"]["inventory"]

    # Check 2: No invalid skills
    if "state_updates" in response and "skills" in response["state_updates"]:
        valid_skills = SKILL_LIST  # from mechanics.py
        for skill in response["state_updates"]["skills"]:
            if skill not in valid_skills:
                log_error(f"AI used invalid skill: {skill}")
                del response["state_updates"]["skills"][skill]

    # Check 3: Stats within bounds
    if "state_updates" in response:
        if "hp" in response["state_updates"]:
            max_hp = game_state["player"]["max_hp"]
            response["state_updates"]["hp"] = min(response["state_updates"]["hp"], max_hp)

    return response
```

### Offensive Content Prevention

**System Prompt Includes:**

```
CONTENT RESTRICTIONS:
- No sexual content
- No graphic violence beyond fantasy combat
- No racist/sexist/homophobic language
- No real-world politics or religion
- Keep language PG-13 (mild cursing okay: "damn," "hell")

IF player tries inappropriate action:
- Deflect with humor: "The NPC is...confused and walks away"
- Don't lecture the player
- Redirect to valid options
```

### Stuck Player Detection

**If player seems lost (3 invalid actions in a row):**

```json
{
  "narration": "You seem stuck. Would you like a hint? (Type 'yes' or continue playing)",
  "hint_available": true
}
```

**If player accepts hint:**
```json
{
  "narration": "[HINT] The runes on the door spell 'FRIEND' in Old Elvish. Perhaps speaking the word aloud...? (This hint cost 1 Momentum Point)",
  "state_updates": {
    "momentum": -1
  }
}
```

---

## 📊 Quality Metrics (AI GM Performance)

### How to Measure AI GM Success

**Automated Metrics:**

1. **Cliché Score**
   - Run cliché scanner on all narration
   - Target: <5% generic phrases
   - Alert if ≥10% detected

2. **Specificity Ratio**
   - Count sensory details per narration
   - Target: ≥2 specific details per turn
   - Alert if <1 average

3. **NPC Name Consistency**
   - Extract NPC names from responses
   - Check if same NPC has different names
   - Alert on inconsistency

4. **Action Variety**
   - Track skill types in action choices
   - Target: Use all skill categories within 10 turns
   - Alert if same skill appears 4+ times in row

**Manual Metrics (Playtest Surveys):**

1. **Entertainment Score**
   - "Did you laugh at least once?" (Y/N)
   - Target: 80% yes

2. **Surprise Score**
   - "Were you surprised by something?" (Y/N)
   - Target: 70% yes

3. **NPC Memorability**
   - "Name one NPC" (open answer)
   - Target: 70% can name at least one

4. **Immersion Score**
   - "Did it feel like a real DM or a chatbot?" (scale 1-5)
   - Target: ≥4 average

5. **Engagement Score**
   - "Did you think about the game after logging off?" (Y/N)
   - Target: 60% yes

**Combined Success Threshold:**
- Automated metrics: 80% pass rate
- Manual metrics: 4/5 questions positive
- Both must pass for AI GM to be "production ready"

---

## 🔧 Implementation Checklist

### For Developers Building the AI GM

**Phase 1: Basic Integration (Day 2)**
- [ ] Claude API connection working
- [ ] Context builder loads game_state.json
- [ ] System prompt from PROMPTS.md loads correctly
- [ ] AI returns valid JSON (parse test)
- [ ] Narration posts to Discord

**Phase 2: Structured Output (Day 2)**
- [ ] AI generates 3-4 action choices
- [ ] Action format matches specification
- [ ] state_updates extracted correctly
- [ ] State updates applied to game_state.json
- [ ] File saves after each turn

**Phase 3: Quality Control (Day 3-4)**
- [ ] Validation function prevents hallucinations
- [ ] Cliché scanner implemented
- [ ] NPC name extractor working
- [ ] Logging captures all AI responses
- [ ] Error handling for API failures

**Phase 4: Polish (Day 4-5)**
- [ ] Response time <5 seconds
- [ ] Formatting looks good in Discord
- [ ] Emojis display correctly
- [ ] Success/failure indicators calculate correctly
- [ ] Status effects process each turn

**Phase 5: Testing (Day 5)**
- [ ] Run 10 test scenarios from AI_DM_QA_FRAMEWORK.md
- [ ] All automated metrics pass
- [ ] 3 playtesters complete quest
- [ ] Manual metrics meet thresholds
- [ ] Decision: GO to MVP or ITERATE

---

## 📝 Changelog

### v0.1-specification (2025-10-30)
- Initial AI GM specification created
- Architecture defined (context → Claude → parser → updater → output)
- Input/output JSON formats specified
- Personality "The Chronicler" fully defined
- NPC system rules established
- Anti-cliché framework detailed
- Surprise/twist layering system explained
- Action choice algorithm documented
- Error prevention strategies added
- Quality metrics defined
- Implementation checklist created

---

## 🔗 Related Documents
- **PROMPTS.md** - The actual system prompt to use
- **MECHANICS.md** - Game rules the AI GM must follow
- **AI_DM_QA_FRAMEWORK.md** - Testing methodology
- **DESIGN_PHILOSOPHY.md** - Why the AI GM exists (imagination amplifier)

---

**Status:** ✅ Complete specification - Ready for implementation
**Priority:** This is the MOST CRITICAL component - if AI GM fails, game fails
**Next Step:** Use this spec during Day 2-4 of prototype build to ensure AI GM quality
