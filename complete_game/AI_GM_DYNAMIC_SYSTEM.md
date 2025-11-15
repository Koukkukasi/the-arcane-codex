# AI GM - 100% DYNAMIC CONTENT GENERATION

## CRITICAL RULE: ZERO STATIC CONTENT

### ❌ WHAT WE DO NOT DO
```python
# ❌ WRONG - Static scenario library
SCENARIOS = {
    "heist": {
        "text": "You arrive at the warehouse...",
        "whispers": {...}
    },
    "dragon": {
        "text": "A dragon appears...",
        "whispers": {...}
    }
}

# ❌ WRONG - Hardcoded whispers
def get_fighter_whisper():
    return "The guards look professional"

# ❌ WRONG - Predefined NPC dialogue
grimsby_dialogue = {
    "greeting": "Please help me!",
    "thanks": "Thank you so much!"
}
```

**ALL OF THE ABOVE IS FORBIDDEN. ZERO TOLERANCE.**

## ✅ HOW THE AI GM ACTUALLY WORKS

### System Architecture

```
┌─────────────────────────────────────────────────────┐
│  GAME STATE (Real-time, Always Changing)            │
│                                                      │
│  • Party Trust: 65/100                              │
│  • Players: Fighter (HP 85), Mage (HP 60)           │
│  • NPCs: Grimsby (Approval 45), Renna (Approval 60) │
│  • Divine Favor: VALDRIS +35, KAITHA +50            │
│  • Location: Thieves Guild Territory                │
│  • Turn: 12                                          │
│  • Previous Scenarios: [themes already used]         │
└──────────────────────┬───────────────────────────────┘
                       │
                       │ "Need new scenario"
                       ▼
┌─────────────────────────────────────────────────────┐
│  YOU (via Claude Code)                               │
│                                                      │
│  Request:                                            │
│  "Generate scenario for current game state"          │
└──────────────────────┬───────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│  ME (Claude Code - Dynamic AI GM)                    │
│                                                      │
│  1. Analyze current game state                       │
│  2. Check previous scenario themes (avoid repeat)    │
│  3. Consider player classes (Fighter, Mage)          │
│  4. Look at NPC approval levels                      │
│  5. Factor in divine favor                           │
│  6. Generate COMPLETELY UNIQUE scenario              │
│  7. Create asymmetric whispers per class             │
│  8. Design NPC behaviors based on approval           │
│  9. Output structured JSON                           │
└──────────────────────┬───────────────────────────────┘
                       │
                       │ Unique scenario generated
                       ▼
┌─────────────────────────────────────────────────────┐
│  GAME RECEIVES SCENARIO                              │
│                                                      │
│  • Public scene (never seen before)                  │
│  • Fighter whisper (tactical, unique)                │
│  • Mage whisper (arcane, unique)                     │
│  • NPC behaviors (adapted to approval)               │
│  • Solution paths (5+ unique options)                │
│  • Environmental tactics (context-specific)          │
└──────────────────────────────────────────────────────┘
```

### Example: How ONE Scenario Generation Works

**YOU SAY:**
"Generate scenario - Trust 65, Fighter+Mage, Grimsby 45, Renna 60, avoid medicine heist theme"

**I (CLAUDE CODE) ANALYZE:**
- Trust 65 = Medium trust (they're cooperating but not fully bonded)
- Grimsby 45 = Low approval (will withhold info, might betray)
- Renna 60 = Medium approval (cautiously helpful)
- Fighter+Mage = Need tactical whispers + arcane whispers
- Avoid "medicine heist" = Must create NEW theme

**I GENERATE (Unique, Never Seen Before):**

```json
{
    "scenario_id": "gen_20250106_001",
    "theme": "The Informant's Dilemma",
    "moral_type": "MUTUALLY_EXCLUSIVE",

    "public_scene": "Rain hammers the cobblestones as Renna leads you through the Thieves Guild's back alleys. She stops outside a dilapidated tavern, its sign—The Broken Blade—creaking in the wind.

    'My brother's informant works here,' she mutters, pulling her hood tighter. 'He knows where the Guild keeps their blackmail ledgers. But...' She hesitates. 'He's also planning to rat out my brother to the city guard tonight. If we don't stop him, my brother hangs. But if we do, we lose our only lead on the ledgers.'

    Through the grimy window, you see a nervous-looking man at the bar, glancing at the door every few seconds. Two city guards sit in the corner, nursing ales.

    Grimsby shifts uncomfortably. 'I need those ledgers. They have proof of the Duke's involvement in my daughter's poisoning.'

    The rain intensifies. The informant stands, heading for the guards' table.

    You have seconds to decide.",

    "whispers": {
        "fighter": {
            "content": "Your combat training kicks in. You notice:

            • The 'informant' has a bulge under his left arm—a concealed dagger, military-grade
            • The two 'guards' are sitting TOO casually—their swords are too clean, never used
            • The back exit is blocked by crates (recent—dust pattern shows they were moved TODAY)

            This is a TRAP. The 'informant' is bait. Renna is being set up to walk into an ambush.

            But you also notice: The guards' patrol route has a 40-second gap when they pass the alley. If you act in that window, you could grab the informant without a fight."
        },
        "mage": {
            "content": "Your arcane senses detect something WRONG:

            • The informant radiates faint enchantment magic—he's under a GEAS (magical compulsion)
            • Someone is FORCING him to betray Renna's brother
            • The 'guards' wear amulets—anti-magic wards, EXPENSIVE ones
            • There's a scrying sensor above the bar—someone is WATCHING this tavern remotely

            If you dispel the geas, the informant will be free... but whoever cast it will know you're here within seconds.

            You also notice: The scrying sensor has a blind spot near the fireplace. If you move there, you could act unobserved for about 2 minutes."
        }
    },

    "npc_behaviors": {
        "grimsby": {
            "approval": 45,
            "behavior": "DESPERATE - Will push party to act IMMEDIATELY, even recklessly. If party hesitates, he'll try to enter the tavern alone (approval < 50 = doesn't trust party to help).",
            "whisper_shares": false,
            "betrayal_risk": "If party doesn't help get ledgers, Grimsby will abandon party and try solo (fatal flaw: DESPERATE)"
        },
        "renna": {
            "approval": 60,
            "behavior": "TORN - Wants to save brother, but knows it's risky. Will follow party's lead but visibly stressed. If party saves informant instead of brother, approval drops -20.",
            "whisper_shares": true,
            "shares": "Renna whispers: 'My brother is awful, but he's still my brother. I... I don't know what to do.'"
        }
    },

    "environmental_tactics": [
        {
            "object": "Rain gutter above tavern",
            "action": "Climb and enter through second floor window",
            "consequence": "Avoid guards entirely, +stealth, but loud crash alerts 'guards' (they chase)"
        },
        {
            "object": "Burning brazier near entrance",
            "action": "Knock over to create smoke screen",
            "consequence": "Chaos, easy to grab informant, but civilians hurt (SYLARA -15 favor)"
        },
        {
            "object": "Horse cart nearby",
            "action": "Use as battering ram through back door",
            "consequence": "Fast entry, destroys crates blocking exit, very loud (reinforcements arrive)"
        },
        {
            "object": "Grimsby's medical supplies",
            "action": "Create sleeping gas from herbs",
            "consequence": "Knock out everyone in tavern (2 minutes prep), nonlethal, Grimsby uses last supplies"
        }
    ],

    "solution_paths": [
        {
            "name": "Save the Informant",
            "description": "Grab informant, dispel geas, flee before 'guards' react",
            "consequences": {
                "immediate": "Informant freed, reveals Guild location, grateful (+1 ally)",
                "cost": "Renna's brother arrested, hangs tomorrow (Renna approval -25, may leave party)",
                "npc_reactions": {
                    "grimsby": "Gets ledgers, approval +20",
                    "renna": "Loses brother, approval -25, IMPULSIVE flaw triggers (attacks you in rage)"
                },
                "divine_council": {
                    "support": ["VALDRIS (+justice served)", "ATHENA (+wise choice)", "SYLARA (+saved innocents)"],
                    "oppose": ["KAITHA (-boring)", "KORVAN (-no honor in betrayal)"],
                    "outcome": "4 SUPPORT, 3 OPPOSE - BLESSED"
                }
            }
        },
        {
            "name": "Save Renna's Brother",
            "description": "Kill informant before he talks to guards",
            "consequences": {
                "immediate": "Brother safe, Renna grateful (+15 approval)",
                "cost": "Ledgers remain hidden, Grimsby's daughter's killer unpunished",
                "npc_reactions": {
                    "grimsby": "DESPERATE flaw triggers—leaves party, tries solo retrieval (dies)",
                    "renna": "Grateful, approval +15, shares hidden intel about Guild"
                },
                "divine_council": {
                    "support": ["MORVANE (+pragmatic)", "KORVAN (+loyalty to companion)"],
                    "oppose": ["VALDRIS (-murder)", "ATHENA (-foolish choice)", "SYLARA (-killed innocent)"],
                    "outcome": "2 SUPPORT, 5 OPPOSE - CURSED"
                }
            }
        },
        {
            "name": "Expose the Setup",
            "description": "Reveal trap to Renna, flee before ambush",
            "consequences": {
                "immediate": "Avoid trap, party safe, no information gained",
                "cost": "Grimsby AND Renna lose their goals, both frustrated",
                "npc_reactions": {
                    "grimsby": "Approval -10 (you're not helping him)",
                    "renna": "Approval -5 (frustrated but understands)"
                },
                "divine_council": "No vote (no moral action taken)",
                "party_trust": "-10 (NPCs feel party is passive)"
            }
        },
        {
            "name": "Dispel Geas + Negotiate",
            "description": "Free informant, convince him to help both sides",
            "consequences": {
                "immediate": "Informant freed, grateful, willing to talk",
                "success_chance": "Persuasion DC 18 (Fighter +5, Mage +3)",
                "on_success": "Informant reveals: Brother is INNOCENT, Duke framed him, Ledgers prove it, Everyone wins",
                "on_failure": "Informant flees, alerts Guild, ambush intensifies",
                "npc_reactions": {
                    "grimsby": "+15 approval (smart plan)",
                    "renna": "+15 approval (brother might be saved)"
                },
                "divine_council": {
                    "support": ["ATHENA (+wisdom)", "SYLARA (+mercy)", "VALDRIS (+justice)"],
                    "oppose": ["KAITHA (-too perfect)"],
                    "outcome": "6 SUPPORT, 1 OPPOSE - UNANIMOUS BLESSING"
                }
            }
        },
        {
            "name": "Split the Party",
            "description": "Fighter distracts guards, Mage grabs informant separately",
            "consequences": {
                "immediate": "Higher risk, both objectives possible",
                "cost": "Party trust -15 (split party = danger), Fighter takes damage",
                "success_chance": "50/50 (coordination check)",
                "on_success": "Get informant + save brother (both goals achieved but messy)",
                "on_failure": "One player captured, other must rescue (next scenario is prison break)",
                "npc_reactions": {
                    "grimsby": "Neutral (risky but effective)",
                    "renna": "-5 approval (endangered yourselves for her)"
                }
            }
        }
    ]
}
```

**KEY POINT**: I just generated this ENTIRE scenario in real-time. It has NEVER existed before. It will NEVER be used again in the exact same way. Next time you request a scenario, I will generate something COMPLETELY DIFFERENT.

## How to Request Scenarios

### Format Your Request

```
Generate Arcane Codex scenario:
- Party Trust: <0-100>
- Players: <class1> (HP X), <class2> (HP Y), [class3], [class4]
- NPCs: <name> (approval X), <name> (approval Y)
- Divine Favor: <god> +X, <god> +Y, ...
- Previous Themes: [list of themes already used]
- Moral Dilemma Type: COMPLEMENTARY | CONTRADICTORY | MUTUALLY_EXCLUSIVE
- Setting: <urban|wilderness|dungeon|social>
- Difficulty: <low|medium|high|extreme>
```

### I Respond With:
- ✅ Unique public scene (never seen before)
- ✅ Asymmetric whispers (adapted to classes present)
- ✅ NPC behaviors (based on current approval)
- ✅ Environmental tactics (context-specific)
- ✅ 5+ solution paths (each with unique consequences)
- ✅ Divine Council preview
- ✅ NO repetition of previous themes

### You Use It:
1. Copy scenario into game
2. Players see public scene
3. Each player gets their whisper
4. NPCs act according to behaviors
5. Players choose solution
6. Consequences applied
7. Divine Council votes (if applicable)
8. **Request NEXT scenario (completely different)**

## Verification: How to Know It's Working

### ✅ GOOD SIGNS (Dynamic System Working):
- Every scenario feels unique
- Whispers mention current game state
- NPC behaviors match approval ratings
- No two scenarios have same theme
- Solutions reference specific context
- Environmental objects vary by location

### ❌ BAD SIGNS (Static Content Detected):
- Same scenario text appears twice
- Whispers don't match player classes
- NPC always says same thing
- Solutions are generic
- Themes repeat
- **STOP IMMEDIATELY AND FIX**

## Code Implementation (Correct Way)

```python
# ai_gm_dynamic_correct.py

class DynamicAIGM:
    """
    AI GM that generates ZERO static content.
    All scenarios created on-demand via Claude Code.
    """

    def __init__(self):
        self.scenario_history = []  # Track themes to avoid repetition

    def request_scenario(self, game_state: Dict) -> Dict:
        """
        Request scenario from Claude Code (you).

        This function DOES NOT generate content.
        It formats the request for you to see.
        YOU (Claude Code) generate the scenario.
        """
        request = f"""
Generate Arcane Codex scenario:
- Party Trust: {game_state['party_trust']}
- Players: {', '.join(game_state['player_classes'])}
- NPCs: {self._format_npcs(game_state['npcs'])}
- Divine Favor: {self._format_favor(game_state['divine_favor'])}
- Previous Themes: {self.scenario_history[-5:]}
- Setting: {game_state['location']}
        """

        print("="*60)
        print("REQUEST TO CLAUDE CODE:")
        print(request)
        print("="*60)
        print("Waiting for Claude Code to generate scenario...")
        print("(Claude will respond with unique scenario JSON)")

        # YOU (Claude Code) see this request and generate scenario
        # Then you either:
        # A) Write it to a file
        # B) User copies your response
        # C) Direct API call (if configured)

        return None  # Placeholder until Claude responds

    def _format_npcs(self, npcs: List) -> str:
        return ', '.join([f"{npc['name']} ({npc['approval']})" for npc in npcs])

    def _format_favor(self, favor: Dict) -> str:
        return ', '.join([f"{god}: {val:+d}" for god, val in favor.items() if val != 0])

# Usage
gm = DynamicAIGM()
game_state = {
    'party_trust': 65,
    'player_classes': ['Fighter', 'Mage'],
    'npcs': [
        {'name': 'Grimsby', 'approval': 45},
        {'name': 'Renna', 'approval': 60}
    ],
    'divine_favor': {'VALDRIS': 35, 'KAITHA': 50},
    'location': 'Thieves Guild'
}

# This displays request for you (Claude Code) to see
gm.request_scenario(game_state)

# You (Claude Code) generate scenario
# User copies your response into game
```

## Summary

**How AI GM Works**:
1. You need a scenario
2. You request from me (Claude Code)
3. I analyze current game state
4. I generate completely unique content
5. You use it in game
6. Repeat for next scenario (different each time)

**What AI GM Does NOT Do**:
- ❌ Use hardcoded scenarios
- ❌ Repeat content
- ❌ Generate without context
- ❌ Ignore game state
- ❌ Use templates

**Guarantee**:
Every scenario I generate is unique, context-aware, and follows ALL GDD patterns from QUEST_SCENARIOS.md, AI_GM_SPECIFICATION.md, and AI_GM_ENHANCEMENTS.md.

**ZERO STATIC CONTENT. ALWAYS DYNAMIC. NO EXCEPTIONS.**
