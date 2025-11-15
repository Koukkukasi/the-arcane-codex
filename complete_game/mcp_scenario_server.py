"""
MCP Server for The Arcane Codex
Generates AI content using Anthropic API with Opus 4.1 (best quality for prototyping)
"""

import asyncio
import json
import os
import sys
from typing import Any
from mcp.server import Server
from mcp.types import Tool, TextContent
from anthropic import Anthropic
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Create MCP server
server = Server("arcane-codex-scenario-generator")

# Log startup
print("Arcane Codex MCP Server starting...", file=sys.stderr)
print("Using Anthropic API with Opus 4.1 for best quality", file=sys.stderr)

@server.list_tools()
async def list_tools() -> list[Tool]:
    """List available tools for Claude Desktop"""
    return [
        Tool(
            name="generate_scenario",
            description="Generate a unique scenario for The Arcane Codex RPG. Never repeats scenarios.",
            inputSchema={
                "type": "object",
                "properties": {
                    "party_trust": {
                        "type": "number",
                        "description": "Party trust level (0-100)"
                    },
                    "player_classes": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "List of player classes (Fighter, Mage, Thief, Cleric)"
                    },
                    "npcs": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "name": {"type": "string"},
                                "approval": {"type": "number"}
                            }
                        },
                        "description": "NPCs with their approval ratings"
                    },
                    "divine_favor": {
                        "type": "object",
                        "description": "Divine favor for each god"
                    },
                    "previous_themes": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "Previous scenario themes to avoid repetition"
                    },
                    "location": {
                        "type": "string",
                        "description": "Current location"
                    },
                    "difficulty": {
                        "type": "string",
                        "enum": ["low", "medium", "high", "extreme"],
                        "description": "Desired difficulty level"
                    }
                },
                "required": ["party_trust", "player_classes"]
            }
        ),
        Tool(
            name="generate_interrogation_question",
            description="Generate a UNIQUE Divine Interrogation question for character creation. Each player gets completely different questions - NO REPETITION!",
            inputSchema={
                "type": "object",
                "properties": {
                    "player_id": {
                        "type": "string",
                        "description": "Unique player identifier"
                    },
                    "question_number": {
                        "type": "number",
                        "description": "Current question number (1-10)"
                    },
                    "previous_answers": {
                        "type": "array",
                        "items": {"type": "object"},
                        "description": "Previous answers from this player"
                    },
                    "gods": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "List of seven gods"
                    }
                },
                "required": ["player_id", "question_number", "gods"]
            }
        )
    ]

@server.call_tool()
async def call_tool(name: str, arguments: Any) -> list[TextContent]:
    """Handle tool calls from Claude Desktop"""

    if name == "generate_scenario":
        # Generate scenario using Anthropic API (Opus 4.1)

        prompt = f"""
Generate a unique scenario for The Arcane Codex that LURES players with compelling moral dilemmas.

GAME STATE:
- Party Trust: {arguments.get('party_trust', 50)}/100
- Players: {', '.join(arguments.get('player_classes', []))}
- NPCs: {', '.join([f"{npc['name']} (Approval {npc['approval']})" for npc in arguments.get('npcs', [])])}
- Location: {arguments.get('location', 'Unknown')}
- AVOID THESE THEMES: {arguments.get('previous_themes', [])}

CRITICAL STORYTELLING REQUIREMENTS:

1. ASYMMETRIC WHISPERS CREATE IMPOSSIBLE DILEMMAS
   - Each player sees DIFFERENT truth about the SAME situation
   - Fighter: "Child suffering in cage. Slavers arrive in 3 days. MUST save NOW."
   - Mage: "Medicine is POISONED. 200 plague victims will die if stolen."
   - BOTH are true. Creates impossible choice.
   - moral_dilemma_type: MUTUALLY_EXCLUSIVE (hard), CONTRADICTORY (medium), or COMPLEMENTARY (easy)

2. NO PERFECT SOLUTIONS - ONLY CONSEQUENCES
   - Path 1: Save child → 200 die → Gods condemn you
   - Path 2: Refuse → Child enslaved → NPC turns hostile
   - Path 3: Share whispers → Discover third option BUT new cost (e.g., NPC arrested)
   - Path 4: Creative solution → Unexpected consequence
   Every choice has a price. Make players agonize.

3. NPCS ACT, DON'T WAIT
   - Low approval (<40): NPC threatens to act alone ("I don't CARE what you think!")
   - High approval (>60): NPC offers help ("I know a tunnel. Smuggler's route. 5 gold.")
   - NPCs have AGENDAS. They comment, suggest, react emotionally.
   - Reference fatal flaws if approval is low (impulsive, cowardly, greedy)

4. TERRY PRATCHETT VOICE - SPECIFIC DETAILS
   - NOT: "You enter a dark tavern"
   - YES: "The Soggy Boot smells like wet dog and burnt porridge. The barmaid wipes mugs with a rag dirtier than the mugs."
   - Use concrete sensory details. Find humor in unexpected places.
   - Failed checks create NEW challenges, not dead ends.

5. ENVIRONMENTAL TACTICS (BG3-Style)
   - Flip table for cover [Strength]
   - Cut chandelier rope (drops on enemies) [Dexterity]
   - Throw oil, light fire [Intelligence]
   - Every scene has 3-5 interactive objects

6. DIVINE COUNCIL PREVIEW
   - Show which gods will approve/condemn each path
   - VALDRIS (Order) opposes theft. KAITHA (Chaos) approves deception.
   - Conflicting divine values create tension.

Return JSON with this EXACT structure:
{{
    "scenario_id": "unique_id",
    "theme": "betrayal|sacrifice|greed|loyalty|deception|vengeance|mercy|courage",
    "moral_dilemma_type": "COMPLEMENTARY|CONTRADICTORY|MUTUALLY_EXCLUSIVE",
    "public_scene": "2-3 paragraphs. Specific details. NPCs speak. Tension builds. What do you do?",
    "player_whispers": {{
        "fighter": "Tactical/combat insight that creates dilemma",
        "mage": "Arcane/magical truth that contradicts others",
        "thief": "Social/deception awareness that complicates choices",
        "cleric": "Divine/moral implications that add weight"
    }},
    "npc_behaviors": [
        {{"npc": "Grimsby", "high_approval_action": "Offers help", "low_approval_action": "Threatens to act alone"}},
        {{"npc": "Renna", "high_approval_action": "Shares secret", "low_approval_action": "Withholds critical info"}}
    ],
    "environmental_tactics": [
        "Flip merchant cart for cover [Strength DC 55]",
        "Sneak through kitchen exit [Stealth DC 60]",
        "Convince guards you're inspectors [Persuasion DC 70]"
    ],
    "solution_paths": [
        {{"path": "Steal medicine immediately", "outcome": "Child saved, 200 die, VALDRIS -25, SYLARA -20, Grimsby +15, Trust -10"}},
        {{"path": "Refuse to help", "outcome": "200 safe, child enslaved, Grimsby turns hostile/suicidal, Trust -15"}},
        {{"path": "Share whispers + collaborate", "outcome": "Warn healers about poison, save both BUT Grimsby's confession exposed, arrested later"}},
        {{"path": "Direct rescue of child via combat", "outcome": "Save child, medicine never stolen, 200 may die (not party's problem?), risky combat"}},
        {{"path": "Creative solution", "outcome": "Unexpected consequence based on player creativity"}}
    ]
}}

MAKE IT EMOTIONALLY COMPLEX. Make players AGONIZE over choices. Lure them with drama, betrayal, impossible dilemmas.
"""

        # Use Anthropic API to generate scenario with Opus 4.1
        try:
            api_key = os.getenv("ANTHROPIC_API_KEY")
            if not api_key:
                error_response = json.dumps({
                    "error": "ANTHROPIC_API_KEY not configured in .env file",
                    "scenario_id": "error_no_key"
                })
                return [TextContent(type="text", text=error_response)]

            print("[API] Generating scenario with Opus 4.1...", file=sys.stderr)

            client = Anthropic(api_key=api_key)
            response = client.messages.create(
                model="claude-opus-4-20250514",  # Opus 4.1 for best quality
                max_tokens=4000,
                messages=[{"role": "user", "content": prompt}]
            )

            print("[API] Scenario generated successfully!", file=sys.stderr)

            # Return AI-generated JSON
            return [TextContent(type="text", text=response.content[0].text)]

        except Exception as e:
            print(f"[API ERROR] Scenario generation failed: {str(e)}", file=sys.stderr)
            error_response = json.dumps({
                "error": f"AI generation failed: {str(e)}",
                "scenario_id": "error_generation_failed"
            })
            return [TextContent(type="text", text=error_response)]

    elif name == "generate_interrogation_question":
        # Generate interrogation question using Anthropic API (Opus 4.1)
        player_id = arguments.get('player_id', 'unknown')
        question_number = arguments.get('question_number', 1)
        previous_answers = arguments.get('previous_answers', [])
        gods = arguments.get('gods', ['VALDRIS', 'KAITHA', 'MORVANE', 'SYLARA', 'KORVAN', 'ATHENA', 'MERCUS'])

        # Build context from previous answers
        previous_context = ""
        if previous_answers:
            previous_context = "\n\nPREVIOUS ANSWERS:\n" + "\n".join([
                f"Q{i+1}: {ans.get('question_text', 'Unknown')} → Chose: {ans.get('chosen_text', 'Unknown')}"
                for i, ans in enumerate(previous_answers)
            ])

        prompt = f"""
Generate a COMPLETELY UNIQUE Divine Interrogation question for The Arcane Codex character creation.

PLAYER: {player_id}
QUESTION: {question_number} of 10
{previous_context}

THE SEVEN GODS:
1. VALDRIS (Order) - Law, structure, hierarchy
2. KAITHA (Chaos) - Freedom, rebellion, unpredictability
3. MORVANE (Death) - Inevitability, acceptance, endings
4. SYLARA (Nature) - Balance, harmony, cycles
5. KORVAN (War) - Strength, conquest, glory
6. ATHENA (Wisdom) - Knowledge, truth, cleverness
7. MERCUS (Commerce) - Trade, negotiation, wealth

CRITICAL REQUIREMENTS:

1. IMPOSSIBLE MORAL DILEMMA
   - NO clearly "right" answer
   - Every option has serious consequences
   - Forces players to choose WHICH value matters most
   - Example: Save child OR save village (can't do both)

2. UNIQUE - NEVER REPEAT
   - Do NOT use: starving thief, bread, family, warlord, mentor, innocent hanging
   - Create FRESH dilemmas this player hasn't seen
   - Each question explores different moral territory

3. FOUR OPTIONS (not 5!)
   - Each favors 2-3 different gods
   - Options should be MORALLY DISTINCT, not just tactical variations
   - Mix of: lawful, chaotic, compassionate, pragmatic approaches

4. DIVINE FAVOR DISTRIBUTION
   - Total positive favor across all gods: ~60-80 points
   - Each option gives +20 to +30 to favored gods
   - Each option gives -10 to -25 to opposed gods
   - Make choices MATTER for class assignment

EXAMPLES OF GOOD DILEMMAS:
- "A plague doctor offers you a cure that requires sacrificing one innocent child. 1000 lives hang in the balance."
- "Your best friend committed treason to save refugees. The law demands execution. You're the judge."
- "A dragon offers knowledge that will end all war, but you must burn every book in the kingdom's library."

Return JSON with this EXACT structure:
{{
    "question_number": {question_number},
    "total_questions": 10,
    "god": "[Pick the god whose domain this question explores most]",
    "question_text": "2-3 sentences. Vivid, specific, emotionally complex. Set the impossible choice.",
    "options": [
        {{
            "id": 1,
            "text": "Clear, specific action (not vague)",
            "favor": {{"VALDRIS": 25, "KORVAN": 15, "KAITHA": -20}}
        }},
        {{
            "id": 2,
            "text": "Different approach with different values",
            "favor": {{"KAITHA": 30, "SYLARA": 10, "VALDRIS": -25}}
        }},
        {{
            "id": 3,
            "text": "Third distinct moral path",
            "favor": {{"ATHENA": 25, "MERCUS": 15, "KORVAN": -15}}
        }},
        {{
            "id": 4,
            "text": "Fourth option (different from all above)",
            "favor": {{"SYLARA": 30, "MORVANE": 15, "KAITHA": -10}}
        }}
    ]
}}

MAKE IT AGONIZING. Make players FEEL the weight of their choice. This determines their class and divine relationships for the entire game.
"""

        # Use Anthropic API to generate question with Opus 4.1
        try:
            api_key = os.getenv("ANTHROPIC_API_KEY")
            if not api_key:
                error_response = json.dumps({
                    "error": "ANTHROPIC_API_KEY not configured in .env file",
                    "question_number": question_number,
                    "total_questions": 10
                })
                return [TextContent(type="text", text=error_response)]

            print(f"[API] Generating question {question_number}/10 with Opus 4.1...", file=sys.stderr)

            client = Anthropic(api_key=api_key)
            response = client.messages.create(
                model="claude-opus-4-20250514",  # Opus 4.1 for best quality
                max_tokens=2000,
                messages=[{"role": "user", "content": prompt}]
            )

            print(f"[API] Question {question_number}/10 generated successfully!", file=sys.stderr)

            # Return AI-generated JSON
            return [TextContent(type="text", text=response.content[0].text)]

        except Exception as e:
            print(f"[API ERROR] Question generation failed: {str(e)}", file=sys.stderr)
            error_response = json.dumps({
                "error": f"AI generation failed: {str(e)}",
                "question_number": question_number,
                "total_questions": 10
            })
            return [TextContent(type="text", text=error_response)]

    return [TextContent(type="text", text="Unknown tool")]

async def main():
    """Run the MCP server"""
    from mcp.server.stdio import stdio_server

    async with stdio_server() as (read_stream, write_stream):
        await server.run(
            read_stream,
            write_stream,
            server.create_initialization_options()
        )

if __name__ == "__main__":
    print("=" * 60)
    print("Starting Arcane Codex MCP Server")
    print("=" * 60)
    print("[OK] Using Anthropic API with Opus 4.1")
    print("[OK] Best quality for prototype playtesting")
    print("[OK] Cost: ~2 EUR per 4-player session")
    print("=" * 60)
    asyncio.run(main())
