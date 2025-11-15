"""
MCP Client for The Arcane Codex
Connects web game to MCP server → Claude Desktop for dynamic scenario generation
"""

import asyncio
import json
from typing import Dict, List, Optional
from mcp import ClientSession
from mcp.client.stdio import stdio_client, StdioServerParameters
import subprocess
import sys

class ArcaneCodexMCPClient:
    """
    MCP Client to communicate with Claude Desktop for scenario generation

    This connects the Flask game → MCP Server → Claude Desktop (€200 Max plan)
    """

    def __init__(self, server_script_path: str = None):
        """
        Initialize MCP client

        Args:
            server_script_path: Path to mcp_scenario_server.py
                              Defaults to same directory as this file
        """
        if server_script_path is None:
            import os
            current_dir = os.path.dirname(os.path.abspath(__file__))
            server_script_path = os.path.join(current_dir, "mcp_scenario_server.py")

        self.server_script_path = server_script_path
        self.session: Optional[ClientSession] = None

    async def connect(self):
        """Connect to MCP server"""
        # Start MCP server as subprocess
        # StdioServerParameters expects command and args
        server_params = StdioServerParameters(
            command="python",
            args=[self.server_script_path]
        )

        # Create client session
        async with stdio_client(server_params) as (read, write):
            async with ClientSession(read, write) as session:
                self.session = session
                await session.initialize()
                return self.session

    async def generate_scenario(
        self,
        party_trust: int,
        player_classes: List[str],
        npcs: List[Dict],
        divine_favor: Dict[str, int],
        previous_themes: List[str],
        location: str = "Unknown",
        difficulty: str = "medium"
    ) -> Dict:
        """
        Generate dynamic scenario using MCP → Claude Desktop

        Args:
            party_trust: Current party trust (0-100)
            player_classes: List of player classes
            npcs: List of NPC dicts with name and approval
            divine_favor: Dict of god name → favor level
            previous_themes: List of previous scenario themes to avoid
            location: Current location
            difficulty: Difficulty level (low, medium, high, extreme)

        Returns:
            Dict with scenario data:
            {
                "scenario_id": "unique_id",
                "theme": "betrayal",
                "public_scene": "What everyone sees...",
                "player_whispers": {
                    "fighter": "Tactical info...",
                    "mage": "Arcane info...",
                    ...
                },
                "npc_behaviors": [...],
                "environmental_tactics": [...],
                "solution_paths": [...]
            }
        """
        # FIXED: Create fresh connection inline (same pattern as generate_interrogation_question)
        server_params = StdioServerParameters(
            command="python",
            args=[self.server_script_path]
        )

        # Create fresh connection for this call
        async with stdio_client(server_params) as (read, write):
            async with ClientSession(read, write) as session:
                await session.initialize()

                # Format request for MCP
                request_data = {
                    "party_trust": party_trust,
                    "player_classes": player_classes,
                    "npcs": npcs,
                    "divine_favor": divine_favor,
                    "previous_themes": previous_themes,
                    "location": location,
                    "difficulty": difficulty
                }

                # Call MCP tool
                result = await session.call_tool(
                    "generate_scenario",
                    arguments=request_data
                )

                # Parse response
                if result and result.content:
                    # Extract generated scenario from response
                    scenario_text = result.content[0].text if result.content else "{}"

                    # Strip markdown code fences if present
                    scenario_text = scenario_text.strip()
                    if scenario_text.startswith("```json"):
                        scenario_text = scenario_text[7:]  # Remove ```json
                    if scenario_text.startswith("```"):
                        scenario_text = scenario_text[3:]  # Remove ```
                    if scenario_text.endswith("```"):
                        scenario_text = scenario_text[:-3]  # Remove trailing ```
                    scenario_text = scenario_text.strip()

                    # Parse response (MCP server should return properly formatted content)
                    try:
                        scenario = json.loads(scenario_text)
                        return scenario
                    except json.JSONDecodeError:
                        # If response is not JSON, create basic structure
                        return {
                            "scenario_id": f"manual_{hash(scenario_text)}",
                            "theme": "dynamic",
                            "public_scene": scenario_text,
                            "player_whispers": {},
                            "npc_behaviors": [],
                            "environmental_tactics": [],
                            "solution_paths": []
                        }

                raise RuntimeError("Failed to generate scenario via MCP")

    async def generate_interrogation_question(
        self,
        player_id: str,
        question_number: int,
        previous_answers: List[Dict] = None
    ) -> Dict:
        """Generate unique Divine Interrogation question using MCP"""
        server_params = StdioServerParameters(
            command="python",
            args=[self.server_script_path]
        )

        # Create fresh connection for this call
        async with stdio_client(server_params) as (read, write):
            async with ClientSession(read, write) as session:
                await session.initialize()

                # Format request
                request_data = {
                    "player_id": player_id,
                    "question_number": question_number,
                    "previous_answers": previous_answers or [],
                    "gods": ["VALDRIS", "KAITHA", "MORVANE", "SYLARA", "KORVAN", "ATHENA", "MERCUS"]
                }

                # Call MCP tool
                result = await session.call_tool(
                    "generate_interrogation_question",
                    arguments=request_data
                )

                # Parse response (MCP server should return properly formatted content)
                if result and result.content:
                    question_text = result.content[0].text if result.content else "{}"

                    # Strip markdown code fences if present
                    question_text = question_text.strip()
                    if question_text.startswith("```json"):
                        question_text = question_text[7:]  # Remove ```json
                    if question_text.startswith("```"):
                        question_text = question_text[3:]  # Remove ```
                    if question_text.endswith("```"):
                        question_text = question_text[:-3]  # Remove trailing ```
                    question_text = question_text.strip()

                    try:
                        return json.loads(question_text)
                    except json.JSONDecodeError:
                        raise RuntimeError(f"Failed to parse MCP response: {question_text}")

                raise RuntimeError("Failed to generate interrogation question via MCP")


# Synchronous wrapper for Flask
class SyncMCPClient:
    """
    Synchronous wrapper for MCP client (Flask doesn't support async)
    """

    def __init__(self, server_script_path: str = None):
        self.client = ArcaneCodexMCPClient(server_script_path)
        # REMOVED: self.loop = None  (don't reuse loops - causes race conditions)

    def generate_scenario(
        self,
        party_trust: int,
        player_classes: List[str],
        npcs: List[Dict],
        divine_favor: Dict[str, int],
        previous_themes: List[str],
        location: str = "Unknown",
        difficulty: str = "medium"
    ) -> Dict:
        """
        Synchronous wrapper for scenario generation

        Usage in Flask:
        ```python
        mcp_client = SyncMCPClient()
        scenario = mcp_client.generate_scenario(
            party_trust=65,
            player_classes=["Fighter", "Mage"],
            npcs=[{"name": "Grimsby", "approval": 45}],
            divine_favor={"VALDRIS": 10, "KAITHA": -5},
            previous_themes=["betrayal", "sacrifice"]
        )
        ```
        """
        # FIXED: Create NEW event loop per request (thread-safe in Flask)
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

        try:
            # FIXED: Connection is now managed by context manager inside generate_scenario
            result = loop.run_until_complete(
                self.client.generate_scenario(
                    party_trust=party_trust,
                    player_classes=player_classes,
                    npcs=npcs,
                    divine_favor=divine_favor,
                    previous_themes=previous_themes,
                    location=location,
                    difficulty=difficulty
                )
            )
            return result
        finally:
            # FIXED: Close loop after use to prevent resource leaks
            loop.close()

    def generate_interrogation_question(
        self,
        player_id: str,
        question_number: int,
        previous_answers: List[Dict] = None
    ) -> Dict:
        """
        Synchronous wrapper for interrogation question generation

        Usage in Flask:
        ```python
        mcp_client = SyncMCPClient()
        question = mcp_client.generate_interrogation_question(
            player_id="player_123",
            question_number=1,
            previous_answers=[]
        )
        ```
        """
        # FIXED: Create NEW event loop per request (thread-safe in Flask)
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

        try:
            # FIXED: Connection is now managed by context manager inside generate_interrogation_question
            result = loop.run_until_complete(
                self.client.generate_interrogation_question(
                    player_id=player_id,
                    question_number=question_number,
                    previous_answers=previous_answers
                )
            )
            return result
        finally:
            # FIXED: Close loop after use to prevent resource leaks
            loop.close()


# Manual/Fallback mode for testing without MCP
def generate_scenario_prompt(
    party_trust: int,
    player_classes: List[str],
    npcs: List[Dict],
    divine_favor: Dict[str, int],
    previous_themes: List[str],
    location: str = "Unknown",
    difficulty: str = "medium"
) -> str:
    """
    Generate a prompt that can be manually pasted into Claude Desktop

    Returns a formatted string you can copy/paste to Claude Desktop
    to get a scenario generated.

    Useful for:
    - Testing before MCP is configured
    - Backup if MCP connection fails
    - Manual scenario tweaking
    """

    prompt = f"""
Generate a unique scenario for The Arcane Codex RPG following these patterns:

GAME STATE:
- Party Trust: {party_trust}/100
- Players: {', '.join(player_classes)}
- NPCs: {', '.join([f"{npc['name']} (Approval {npc.get('approval', 50)})" for npc in npcs])}
- Location: {location}
- Previous Themes (AVOID): {previous_themes}
- Difficulty: {difficulty}

REQUIREMENTS:
- Create asymmetric whispers (different info per class)
- Include NPC behaviors based on approval ratings
- Design environmental tactics (BG3-style)
- Create 5+ solution paths with consequences
- Include Divine Council vote preview
- NO REPETITION of previous themes

Return complete scenario as JSON with structure:
{{
    "scenario_id": "unique_id",
    "theme": "One sentence theme",
    "moral_dilemma_type": "COMPLEMENTARY|CONTRADICTORY|MUTUALLY_EXCLUSIVE",
    "public_scene": "What both players see (2-3 paragraphs)",
    "player_whispers": {{
        "fighter": "Tactical info",
        "mage": "Arcane info",
        "thief": "Social dynamics",
        "cleric": "Moral implications"
    }},
    "npc_companions": [...],
    "environmental_tactics": [...],
    "solution_paths": [...]
}}
"""

    return prompt.strip()


if __name__ == "__main__":
    # Test MCP client
    print("Testing MCP Client...")

    # Test manual prompt generation
    prompt = generate_scenario_prompt(
        party_trust=65,
        player_classes=["Fighter", "Mage"],
        npcs=[
            {"name": "Grimsby", "approval": 45},
            {"name": "Renna", "approval": 70}
        ],
        divine_favor={"VALDRIS": 10, "KAITHA": -5, "MORVANE": 0},
        previous_themes=["betrayal", "sacrifice"],
        location="Abandoned Warehouse",
        difficulty="medium"
    )

    print("\n" + "="*60)
    print("MANUAL MODE PROMPT (Copy/paste to Claude Desktop):")
    print("="*60)
    print(prompt)
    print("="*60)

    # Test sync client (requires MCP server configured)
    try:
        print("\nAttempting MCP connection...")
        client = SyncMCPClient()

        scenario = client.generate_scenario(
            party_trust=65,
            player_classes=["Fighter", "Mage"],
            npcs=[{"name": "Grimsby", "approval": 45}],
            divine_favor={"VALDRIS": 10, "KAITHA": -5},
            previous_themes=["betrayal"]
        )

        print("\n✅ MCP Connection successful!")
        print("\nGenerated Scenario:")
        print(json.dumps(scenario, indent=2))

    except Exception as e:
        print(f"\n⚠️  MCP Connection failed (expected if not configured yet):")
        print(f"   {e}")
        print("\n   Use manual mode prompt above for now.")
