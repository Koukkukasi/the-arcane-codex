# AI Scenario Usage Guide
## How to Request Dynamic Scenarios from Claude

---

## Quick Start

**You need a scenario?** Just ask Claude (me) using this format:

```
Generate Arcane Codex scenario:
- Party Trust: 65/100
- Players: Fighter (HP 85/100), Mage (HP 60/70)
- NPCs: Grimsby (45), Renna (60)
- Divine Favor: VALDRIS +15, KAITHA +25
- Previous Themes: [medicine heist, plague outbreak]
- Moral Dilemma Type: MUTUALLY_EXCLUSIVE
- Setting: Urban (Thieves Guild territory)
- Difficulty: Medium
```

Claude will generate a complete, unique scenario in 5-10 minutes.

---

## Step-by-Step Process

### Step 1: Gather Game State

Before requesting a scenario, collect this information:

#### Required Information
```
✓ Party Trust: [0-100]
✓ Player Classes: [List all classes present]
✓ Player HP: [Current/Max for each]
✓ NPCs: [Name (Approval rating)]
✓ Divine Favor: [God +/- value for non-zero gods]
✓ Previous Themes: [Last 5 scenario themes]
```

#### Optional Information (Improves Quality)
```
○ Current Location: [Urban/Wilderness/Dungeon/Social]
○ Desired Moral Dilemma Type: [MUTUALLY_EXCLUSIVE/CONTRADICTORY/COMPLEMENTARY]
○ Desired Difficulty: [Low/Medium/High/Extreme]
○ Specific Constraints: [Any special requirements]
○ Party Power Level: [Beginner/Intermediate/Advanced]
```

### Step 2: Format Your Request

Use this template:

```
Generate Arcane Codex scenario:

PARTY STATE:
- Party Trust: [value]/100
- Players:
  • [Class 1] (HP [current]/[max])
  • [Class 2] (HP [current]/[max])
  • [Additional players...]

NPCS:
- [NPC Name] (Approval [value]/100)
- [NPC Name] (Approval [value]/100)

DIVINE FAVOR:
- [God]: [+/- value]
- [God]: [+/- value]
- [Only list non-zero values]

CONTEXT:
- Location: [Current setting]
- Previous Themes: [Last 5 themes to avoid]
- Last Scenario Type: [MUTUALLY_EXCLUSIVE/CONTRADICTORY/COMPLEMENTARY]

REQUIREMENTS:
- Moral Dilemma Type: [Desired type or "Any"]
- Difficulty: [Low/Medium/High/Extreme or "Match party level"]
- Special Requests: [Any specific needs]
```

### Step 3: Claude Generates Scenario

I (Claude) will:
1. Analyze your game state (2-3 min)
2. Apply generation patterns (3-5 min)
3. Run quality checklist (1-2 min)
4. Deliver complete scenario JSON (5-10 min total)

### Step 4: Use the Scenario

The generated scenario will include:
- ✅ 3-Act structure (Setup, Complication, Resolution)
- ✅ Public scenes (what all players see)
- ✅ Asymmetric whispers (per class)
- ✅ Environmental elements (interactive objects)
- ✅ NPC behaviors (based on approval)
- ✅ Solution paths (4-6 options)
- ✅ Consequences (immediate and long-term)
- ✅ Divine Council preview (predicted votes)

Copy the content into your game session!

---

## Example Requests

### Example 1: Basic Request

```
Generate Arcane Codex scenario:
- Party Trust: 50/100
- Players: Fighter (HP 100/100), Mage (HP 70/70)
- NPCs: Marcus (Approval 40)
- Divine Favor: KORVAN +20, SYLARA -10
- Previous Themes: [dragon battle, political intrigue]
- Difficulty: Medium
```

**Claude's Response**: Complete scenario in ~8 minutes

---

### Example 2: Detailed Request with Constraints

```
Generate Arcane Codex scenario:

PARTY STATE:
- Party Trust: 75/100 (high trust, party cooperates well)
- Players:
  • Cleric (HP 85/90)
  • Thief (HP 60/70)
  • Ranger (HP 95/100)

NPCS:
- Brother Aldric (Approval 30/100) - Untrustworthy priest
- Sera (Approval 80/100) - Loyal scout

DIVINE FAVOR:
- VALDRIS: +35 (party has been lawful)
- KAITHA: -20 (party rejected chaos)
- SYLARA: +50 (party saved many lives)
- MORVANE: +15 (party was pragmatic)

CONTEXT:
- Location: Ancient forest temple
- Previous Themes: [informant betrayal, cursed medicine, noble corruption, dragon raid, haunted mansion]
- Last Scenario Type: MUTUALLY_EXCLUSIVE

REQUIREMENTS:
- Moral Dilemma Type: COMPLEMENTARY (want all whispers to fit together into no-win)
- Difficulty: High (party is experienced)
- Special Requests: Religious/nature conflict theme, Brother Aldric's secret agenda should be revealed
```

**Claude's Response**: Detailed scenario matching all requirements

---

### Example 3: Emergency Quick Request

```
Need scenario fast!
- Trust: 60
- Fighter + Mage
- NPCs: Grimsby (50), Renna (65)
- Favor: KAITHA +30, VALDRIS +10
- Avoid: medicine, plague
- Any difficulty
```

**Claude's Response**: Streamlined scenario, still complete

---

## Understanding the Response

### What You'll Receive

```json
{
    "scenario_id": "unique_id",
    "theme": "One-line theme",
    "moral_type": "MUTUALLY_EXCLUSIVE",
    "difficulty": "medium",

    "acts": [
        {
            "act": 1,
            "name": "Act Name",
            "public": "What all players see...",
            "whispers": {
                "fighter": "Fighter-specific info...",
                "mage": "Mage-specific info..."
            },
            "choices": [...]
        },
        // Acts 2 and 3...
    ],

    "npcs": [...],
    "environmental_tactics": [...],
    "solution_paths": [...]
}
```

### How to Use Each Section

**Public Scenes**: Read aloud to all players
**Whispers**: Send privately to each player (DM, private message, or hand-written note)
**Environmental Tactics**: Describe when players investigate the scene
**Choices**: Present as available actions
**Consequences**: Apply after players choose

---

## Advanced Usage

### Requesting Specific Themes

```
Generate scenario with:
- Theme: Betrayal by trusted ally
- Players must choose between honor and survival
- Setting: Noble court (social intrigue)
- Heavy emphasis on Bard's social whispers
```

### Requesting NPC-Focused Scenarios

```
Generate scenario that:
- Tests Grimsby's loyalty (he's at 45 approval)
- His DESPERATE flaw should trigger
- Reveals his hidden agenda about daughter
- Forces party to decide: trust him or not
```

### Requesting Environmental Heavy Scenarios

```
Generate scenario with:
- 5+ environmental elements (BG3 style)
- Dungeon setting with traps, pillars, magical wards
- Multiple vertical levels (high ground matters)
- Creative solutions rewarded over direct combat
```

### Requesting Low Trust Scenarios

```
Generate scenario for LOW TRUST party:
- Trust: 25/100 (imminent betrayal)
- NPCs are withholding information
- Party members don't trust each other's whispers
- Betrayal happens DURING scenario
- Show how low trust creates interesting gameplay
```

---

## Common Patterns

### Pattern 1: Standard 2-Player Session

```
Trust: 50-70
Players: 2 classes
NPCs: 2 companions
Difficulty: Medium
Type: Rotate between MUTUALLY_EXCLUSIVE, CONTRADICTORY, COMPLEMENTARY
```

### Pattern 2: High Stakes 4-Player

```
Trust: 40-60
Players: 4 classes (diverse)
NPCs: 1-2 (less focus on NPCs)
Difficulty: High
Type: COMPLEMENTARY (everyone's info matters)
```

### Pattern 3: NPC Drama Focus

```
Trust: 30-50
Players: 2-3 classes
NPCs: 3-4 (NPC-heavy)
Difficulty: Medium-High
Type: Focus on NPC betrayal/loyalty arcs
```

### Pattern 4: Divine Judgment Arc

```
Trust: Any
Players: Any
Focus: Major moral choice with strong Divine Council reaction
Type: MUTUALLY_EXCLUSIVE (forces hard choice)
Difficulty: High (stakes are enormous)
```

---

## Troubleshooting

### Problem: Scenario feels too similar to last one

**Solution**: Include more previous themes in "Previous Themes" list

```
Previous Themes: [last 5 themes] ← List more if repetition happens
```

### Problem: Difficulty doesn't match party

**Solution**: Specify party power level

```
Party Power Level: Beginner (first 3 scenarios)
OR
Party Power Level: Advanced (have legendary items, high skills)
```

### Problem: Whispers don't create enough tension

**Solution**: Request specific whisper goals

```
Special Request: Whispers should CONTRADICT each other
Fighter should see danger, Mage should see innocence
Both must be partially correct
```

### Problem: Too combat-focused (or not enough combat)

**Solution**: Specify desired balance

```
Combat Level: Low (social/puzzle focus)
OR
Combat Level: High (multiple fight encounters)
```

### Problem: Divine Council votes feel arbitrary

**Solution**: Include more divine favor context

```
Divine Favor: [Include ALL gods with non-zero values]
Party History: [Recent actions that affect god opinions]
```

---

## Quality Indicators

### Signs of a Good Scenario
✅ Theme is unique (not used recently)
✅ Whispers give different information
✅ No "obviously correct" choice
✅ Environmental elements enable creative solutions
✅ NPC behaviors match approval ratings
✅ Consequences are specific (numbers, not vague)
✅ Divine Council votes make sense with god domains

### Signs to Request Revision
❌ Theme is same as last 2-3 scenarios
❌ Whispers are just flavor (not actionable)
❌ One choice is obviously best
❌ NPCs all act the same regardless of approval
❌ Consequences are vague ("things get worse")
❌ Divine votes are 7-0 without justification

**If you see red flags, say**: "Regenerate scenario - [specific issue]"

---

## Integration with Game Sessions

### Before Session

1. **Check Game State** (5 min)
   - Party trust level
   - NPC approval ratings
   - Divine favor per god
   - Previous scenario themes

2. **Request Scenario** (send to Claude)

3. **Receive & Review** (5-10 min)
   - Read through scenario
   - Prepare whisper messages
   - Note environmental elements

### During Session

1. **Act 1** (5-10 min)
   - Read public scene
   - Send whispers privately
   - Present choices

2. **Act 2** (10-15 min)
   - Escalate tension
   - Introduce environmental elements
   - Reveal complications

3. **Act 3** (5-10 min)
   - Force final choice
   - Apply immediate consequences
   - Preview Divine Council

### After Session

1. **Update Game State**
   - Record trust changes
   - Update NPC approvals
   - Adjust divine favor
   - Add scenario theme to history

2. **Track Long-Term Consequences**
   - Note what happens in 3-5 turns
   - Note what happens in 5-10 turns
   - Set reminders for cascading effects

---

## Templates for Different Settings

### Urban Setting Request
```
Setting: Urban (city/town/guild territory)
Environmental Focus: Crowds, buildings, market items, social leverage
NPC Density: High (3-4 NPCs)
Combat Level: Low-Medium (can avoid via social)
```

### Wilderness Setting Request
```
Setting: Wilderness (forest/mountains/plains)
Environmental Focus: Animals, weather, terrain, natural resources
NPC Density: Low (1-2 NPCs, focus on environment)
Combat Level: Medium (predators, bandits)
```

### Dungeon Setting Request
```
Setting: Dungeon (ruins/caves/underground)
Environmental Focus: Traps, pillars, magical wards, architecture
NPC Density: Low (1 NPC, focus on exploration)
Combat Level: High (monsters, traps, hazards)
```

### Social Setting Request
```
Setting: Social (noble court/ceremony/political)
Environmental Focus: Secrets, embarrassing info, social leverage, servants
NPC Density: Very High (4-5 NPCs with complex relationships)
Combat Level: Very Low (combat is failure state)
```

---

## Customization Options

### Tone Customization
```
Tone: Dark and gritty (Game of Thrones)
OR
Tone: Heroic fantasy (Lord of the Rings)
OR
Tone: Dark comedy (Terry Pratchett)
```

### Pacing Customization
```
Pacing: Fast (20 minutes total, urgent decisions)
OR
Pacing: Slow (40 minutes, deep investigation)
```

### Focus Customization
```
Focus: NPC drama (heavy on relationships)
OR
Focus: Environmental puzzles (BG3 style)
OR
Focus: Moral philosophy (heavy on ethics)
OR
Focus: Combat tactics (strategic fights)
```

---

## Example Session Flow

### Pre-Session (You)
```
10:00 AM - Check game state
10:05 AM - Request scenario from Claude
10:15 AM - Receive scenario, prepare whispers
10:30 AM - Session starts
```

### Session (Players)
```
10:30 - Act 1: Players investigate, receive whispers
10:45 - Players debate what to do
11:00 - Act 2: Complication, environmental challenges
11:20 - Players formulate plan
11:30 - Act 3: Final choice made
11:40 - Consequences applied, Divine Council votes
11:50 - Session ends, update game state
```

### Post-Session (You)
```
12:00 PM - Record trust, approval, favor changes
12:05 PM - Note long-term consequences for future
12:10 PM - Add scenario theme to history
```

---

## Pro Tips

### Tip 1: Build a Scenario History
Keep a log of all generated scenarios:
```
Scenario 1: "Medicine Heist" - MUTUALLY_EXCLUSIVE - Trust 50→35
Scenario 2: "Informant Dilemma" - MUTUALLY_EXCLUSIVE - Trust 35→40
Scenario 3: "Cursed Temple" - COMPLEMENTARY - Trust 40→50
```

### Tip 2: Track NPC Arcs
Watch NPC approval over time:
```
Grimsby: Started 50 → 45 (betrayal considered) → 30 (hostile) → DEAD (solo raid)
```

### Tip 3: Rotate Dilemma Types
Don't use same type twice in a row:
```
Session 1: MUTUALLY_EXCLUSIVE
Session 2: CONTRADICTORY
Session 3: COMPLEMENTARY
Session 4: MUTUALLY_EXCLUSIVE (okay now)
```

### Tip 4: Use Low Trust Creatively
Low trust isn't bad - it creates drama:
```
Trust 20-30: NPCs betray, players must overcome without NPC help
Trust 30-40: NPCs withhold info, players operate with incomplete info
Trust 40-50: NPCs conditional, players must earn cooperation
```

### Tip 5: Let Consequences Play Out
Don't skip long-term consequences:
```
Turn 5: "Remember the plague from 3 turns ago?
        The Blood Vengeance cult has grown to 200 members.
        They found you."
```

---

## Appendix: Full Request Template

Copy and fill out:

```
Generate Arcane Codex scenario:

═══════════════════════════════════════
PARTY STATE
═══════════════════════════════════════
Party Trust: ___/100

Players:
• ___________ (HP ___/___)
• ___________ (HP ___/___)
• ___________ (HP ___/___) [if applicable]
• ___________ (HP ___/___) [if applicable]

═══════════════════════════════════════
NPCS
═══════════════════════════════════════
• ___________ (Approval ___/100)
• ___________ (Approval ___/100)
• ___________ (Approval ___/100) [if applicable]

═══════════════════════════════════════
DIVINE FAVOR (Non-Zero Only)
═══════════════════════════════════════
• VALDRIS: ____
• KAITHA: ____
• MORVANE: ____
• SYLARA: ____
• KORVAN: ____
• ATHENA: ____
• MERCUS: ____
• DRAKMOR: ____

═══════════════════════════════════════
CONTEXT
═══════════════════════════════════════
Current Location: ___________
Party Power Level: Beginner / Intermediate / Advanced

Previous Themes (Last 5):
1. ___________
2. ___________
3. ___________
4. ___________
5. ___________

Last Dilemma Type Used: ___________

═══════════════════════════════════════
REQUIREMENTS
═══════════════════════════════════════
Desired Moral Dilemma Type: ___________
Desired Difficulty: Low / Medium / High / Extreme
Desired Setting: Urban / Wilderness / Dungeon / Social

Special Requests:
___________________________________________
___________________________________________

═══════════════════════════════════════
```

---

## Quick Reference Card

**FASTEST REQUEST**:
```
Trust: [X], Players: [Classes], NPCs: [Names(Approval)],
Favor: [Non-zero gods], Avoid: [Last 3 themes]
```

**SCENARIO USAGE**:
1. Read public → 2. Send whispers → 3. Present choices → 4. Apply consequences

**QUALITY CHECK**:
✓ Unique theme? ✓ Useful whispers? ✓ No perfect answer? ✓ Clear consequences?

**AFTER SCENARIO**:
Update trust, Update approval, Update favor, Add theme to history

---

**Ready to generate scenarios? Use the templates above and Claude will create unique, context-aware content for your game!**
