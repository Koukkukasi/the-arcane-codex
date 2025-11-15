# DYNAMIC SCENARIO GENERATION - How It Works

## Core Concept

Since you're using Claude Code, **I (Claude) generate all scenarios dynamically**.

## How To Generate A New Scenario

1. **You ask me**: "Generate a new scenario for The Arcane Codex"
2. **I analyze**:
   - Current party trust level
   - Player classes (Fighter, Mage, Thief, Cleric)
   - NPC approval ratings
   - Divine favor with each god
   - Previous scenario themes (to avoid repetition)
3. **I generate**:
   - Unique public scene (what both players see)
   - Asymmetric whispers (different for Fighter vs Mage vs Thief vs Cleric)
   - NPC companions with fatal flaws
   - Environmental tactics (BG3-style)
   - Multiple solution paths
   - Divine Council preview

## Scenario Generation Request Format

When you want a new scenario, say:

```
Generate a new Arcane Codex scenario with:
- Party Trust: 65/100
- Player Classes: Fighter, Mage
- NPCs: Grimsby (approval 45), Renna (approval 60)
- Previous themes: [list recent themes]
- Moral dilemma type: MUTUALLY_EXCLUSIVE
```

I will then create a complete, unique scenario following all GDD patterns.

## Example Output Structure

I will provide:

```python
{
    "theme": "Unique one-sentence theme",
    "public_scene": "What BOTH players see (2-3 paragraphs)",
    "whispers": {
        "fighter": "Tactical information only fighter notices",
        "mage": "Arcane detection only mage notices"
    },
    "npcs": [
        {
            "name": "Unique NPC name",
            "fatal_flaw": "IMPULSIVE",
            "hidden_agenda": "What they secretly want",
            "betrayal_trigger": "What causes them to betray"
        }
    ],
    "environmental_tactics": [
        {
            "object": "Explosive barrel",
            "action": "Shoot it",
            "consequence": "Fire spreads, 20 damage AOE"
        }
    ],
    "solution_paths": [
        {
            "name": "Path A",
            "consequences": "Who lives/dies",
            "divine_council_preview": "4 SUPPORT, 3 OPPOSE"
        }
    ]
}
```

## Why This Works

- **NO EXTERNAL API NEEDED**: You're already talking to me (Claude) through Claude Code
- **ALWAYS UNIQUE**: I generate fresh content each time
- **FOLLOWS GDD**: I use the patterns from QUEST_SCENARIOS.md
- **CONTEXT-AWARE**: I adapt to current game state

## Workflow

1. Play game until scenario needed
2. Check game state (trust, approval, classes)
3. Ask me to generate scenario
4. I create unique content
5. You use it in the game
6. Repeat with different context = different scenario

## No Static Content

This eliminates:
- ❌ Hardcoded scenario libraries
- ❌ Predefined whisper text
- ❌ Static NPC dialogue
- ❌ Fixed outcomes

Everything is generated fresh by me based on current context.
