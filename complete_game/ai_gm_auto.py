"""
The Arcane Codex - Automated AI Game Master
Fully autonomous game master using Claude Desktop via MCP
Phase 2: AI GM Automation
"""

import asyncio
import json
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime
from dataclasses import dataclass
from threading import Thread
import time

from database import ArcaneDatabase
from mcp_client import MCPClient, SyncMCPClient

logger = logging.getLogger(__name__)

@dataclass
class ScenarioData:
    """Structured scenario data"""
    theme: str
    public_narration: str
    whispers: Dict[str, str]
    sensory_data: Dict[str, Dict]
    choices: List[Dict]
    npc_reactions: List[Dict]
    trigger_council: bool
    council_reason: Optional[str]

class AIGameMaster:
    """
    Fully automated AI Game Master that runs games without human intervention
    Uses Claude Desktop via MCP for all content generation
    """

    def __init__(self, socketio=None):
        self.db = ArcaneDatabase()
        self.mcp_client = SyncMCPClient()
        self.socketio = socketio
        self.running = False
        self.active_games = {}
        self.processing = {}  # Track which games are being processed

        # Connect to Claude Desktop on init
        self.connect_to_claude()

    def connect_to_claude(self):
        """Initialize connection to Claude Desktop via MCP"""
        try:
            if self.mcp_client.connect():
                logger.info("✅ AI GM connected to Claude Desktop")
                return True
        except Exception as e:
            logger.error(f"❌ Failed to connect to Claude: {e}")
            return False

    async def start(self):
        """Start the AI GM main loop"""
        self.running = True
        logger.info("🤖 AI Game Master starting...")

        while self.running:
            try:
                # Get all active games
                with self.db.get_connection() as conn:
                    games = conn.execute("""
                        SELECT id, code, phase, turn
                        FROM games
                        WHERE phase IN ('playing', 'interrogation')
                    """).fetchall()

                for game in games:
                    game_id = game['id']

                    # Skip if already processing
                    if game_id in self.processing:
                        continue

                    # Check if game needs processing
                    if self.needs_processing(game_id):
                        self.processing[game_id] = True
                        asyncio.create_task(self.process_game_turn(game_id))

                await asyncio.sleep(2)  # Check every 2 seconds

            except Exception as e:
                logger.error(f"Error in AI GM main loop: {e}")
                await asyncio.sleep(5)

    def needs_processing(self, game_id: str) -> bool:
        """Check if a game needs AI GM processing"""
        # Check if all players have acted
        if self.db.all_players_acted(game_id):
            return True

        # Check for other triggers (timeouts, events, etc)
        # TODO: Add more triggers as needed

        return False

    async def process_game_turn(self, game_id: str):
        """Process a complete game turn"""
        try:
            logger.info(f"Processing turn for game {game_id}")

            # Get game state
            game_state = self.get_complete_game_state(game_id)

            # Generate scenario via Claude Desktop
            scenario = await self.generate_scenario(game_state)

            # Validate scenario
            if not self.validate_scenario(scenario):
                logger.error(f"Invalid scenario generated for game {game_id}")
                return

            # Process the scenario
            await self.execute_scenario(game_id, scenario)

            # Check for Divine Council trigger
            if scenario.trigger_council:
                await self.convene_divine_council(game_id, scenario.council_reason)

            # Process NPC reactions
            await self.process_npc_reactions(game_id, scenario.npc_reactions)

            # Update game state
            self.update_game_after_turn(game_id, scenario)

            # Clear pending actions and advance turn
            self.db.clear_pending_actions(game_id)
            self.db.advance_turn(game_id)

            logger.info(f"✅ Turn processed for game {game_id}")

        except Exception as e:
            logger.error(f"Error processing turn for game {game_id}: {e}")

        finally:
            # Remove from processing
            if game_id in self.processing:
                del self.processing[game_id]

    def get_complete_game_state(self, game_id: str) -> Dict:
        """Get complete game state for AI processing"""
        with self.db.get_connection() as conn:
            # Get game info
            game = conn.execute("""
                SELECT * FROM games WHERE id = ?
            """, (game_id,)).fetchone()

            if not game:
                return {}

            game_data = dict(game)
            game_data['state'] = json.loads(game_data['state'])

        # Get players
        players = self.db.get_players_in_game(game_id)

        # Get NPCs
        npcs = self.db.get_npcs_for_game(game_id)

        # Get recent history
        history = self.db.get_recent_history(game_id, limit=5)

        # Get pending actions
        actions = self.db.get_pending_actions(game_id)

        # Build complete state
        return {
            'game_id': game_id,
            'turn': game_data['turn'],
            'phase': game_data['phase'],
            'location': game_data['location'],
            'party_trust': game_data['party_trust'],
            'players': players,
            'npcs': npcs,
            'recent_history': history,
            'pending_actions': actions,
            'world_flags': game_data['state'].get('world_flags', {}),
            'scenario_history': game_data['state'].get('scenario_history', [])
        }

    async def generate_scenario(self, game_state: Dict) -> ScenarioData:
        """Generate scenario using Claude Desktop via MCP"""
        try:
            # Call Claude via MCP
            raw_scenario = self.mcp_client.generate_scenario(game_state)

            # Parse and structure the scenario
            scenario = ScenarioData(
                theme=raw_scenario.get('theme', 'exploration'),
                public_narration=raw_scenario.get('public', 'The adventure continues...'),
                whispers=raw_scenario.get('whispers', {}),
                sensory_data=raw_scenario.get('sensory', {}),
                choices=raw_scenario.get('choices', []),
                npc_reactions=raw_scenario.get('npc_reactions', []),
                trigger_council=raw_scenario.get('trigger_council', False),
                council_reason=raw_scenario.get('council_reason')
            )

            # Generate class-specific whispers if missing
            if not scenario.whispers:
                scenario.whispers = self.generate_default_whispers(game_state)

            return scenario

        except Exception as e:
            logger.error(f"Error generating scenario: {e}")
            # Return a fallback scenario
            return self.get_fallback_scenario(game_state)

    def generate_default_whispers(self, game_state: Dict) -> Dict[str, str]:
        """Generate default whispers based on player classes"""
        whispers = {}

        for player in game_state.get('players', []):
            player_id = player['id']
            class_type = player.get('class_type', 'Unknown')

            if class_type == 'Fighter':
                whispers[player_id] = "Your combat instincts detect danger ahead. The formation of dust suggests recent movement."
            elif class_type == 'Mage':
                whispers[player_id] = "Magical energies swirl in the air. Someone or something has cast powerful spells here recently."
            elif class_type == 'Thief':
                whispers[player_id] = "Your trained eye spots subtle signs - hidden compartments and secret passages await discovery."
            elif class_type == 'Ranger':
                whispers[player_id] = "Nature speaks to you here. Animal tracks lead in multiple directions, each telling a different story."
            elif class_type == 'Cleric':
                whispers[player_id] = "Divine presence lingers here. The gods are watching this place with interest."
            elif class_type == 'Bard':
                whispers[player_id] = "You sense the emotional echoes of this place. Great joy and terrible sorrow have both touched these grounds."
            else:
                whispers[player_id] = "Something about this place feels significant, though you can't quite place what."

        return whispers

    def validate_scenario(self, scenario: ScenarioData) -> bool:
        """Validate that scenario has required components"""
        if not scenario.public_narration:
            return False
        if not scenario.choices:
            return False
        return True

    async def execute_scenario(self, game_id: str, scenario: ScenarioData):
        """Execute the scenario - send to players"""
        try:
            # Save scenario to database
            with self.db.get_connection() as conn:
                game = conn.execute("SELECT turn FROM games WHERE id = ?", (game_id,)).fetchone()
                turn = game['turn'] if game else 0

                conn.execute("""
                    INSERT INTO scenarios (game_id, turn, theme, public_scene, whispers, sensory_data, choices)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (game_id, turn, scenario.theme, scenario.public_narration,
                     json.dumps(scenario.whispers), json.dumps(scenario.sensory_data),
                     json.dumps(scenario.choices)))

            # Broadcast via SocketIO if available
            if self.socketio:
                # Public narration to all
                self.socketio.emit('scenario_update', {
                    'public': scenario.public_narration,
                    'choices': scenario.choices,
                    'theme': scenario.theme
                }, room=game_id)

                # Private whispers
                for player_id, whisper in scenario.whispers.items():
                    self.socketio.emit('private_whisper', {
                        'content': whisper,
                        'type': 'visual'
                    }, room=f"player_{player_id}")

                # Sensory data (Phase 3)
                for player_id, senses in scenario.sensory_data.items():
                    self.socketio.emit('sensory_data', senses,
                                     room=f"player_{player_id}")

            # Add to history
            self.db.add_history_event(game_id, turn, 'scenario', {
                'theme': scenario.theme,
                'choices_presented': len(scenario.choices)
            })

        except Exception as e:
            logger.error(f"Error executing scenario: {e}")

    async def convene_divine_council(self, game_id: str, reason: str):
        """Run Divine Council judgment"""
        try:
            # Get context
            game_state = self.get_complete_game_state(game_id)

            # Generate council verdict via MCP
            council_result = self.mcp_client.run_divine_council(reason, game_state)

            # Save to database
            with self.db.get_connection() as conn:
                game = conn.execute("SELECT turn FROM games WHERE id = ?", (game_id,)).fetchone()
                turn = game['turn'] if game else 0

                conn.execute("""
                    INSERT INTO divine_councils
                    (game_id, turn, action_judged, votes, testimonies, outcome, impact)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (game_id, turn, reason,
                     json.dumps(council_result.get('votes', {})),
                     json.dumps(council_result.get('testimonies', [])),
                     council_result.get('outcome', 'undecided'),
                     json.dumps(council_result.get('impact', {}))))

            # Broadcast result
            if self.socketio:
                self.socketio.emit('divine_council', council_result, room=game_id)

            # Apply divine favor changes
            self.apply_divine_favor_changes(game_id, council_result.get('impact', {}))

        except Exception as e:
            logger.error(f"Error in Divine Council: {e}")

    async def process_npc_reactions(self, game_id: str, reactions: List[Dict]):
        """Process NPC reactions based on approval"""
        for reaction in reactions:
            try:
                npc_name = reaction.get('npc')
                action = reaction.get('action')
                approval_change = reaction.get('approval_change', 0)

                # Get NPC
                npcs = self.db.get_npcs_for_game(game_id)
                npc = next((n for n in npcs if n['name'] == npc_name), None)

                if npc:
                    # Update approval
                    if approval_change:
                        self.db.update_npc_approval(npc['id'], approval_change)

                    # Broadcast NPC action
                    if self.socketio and action:
                        self.socketio.emit('npc_action', {
                            'npc': npc_name,
                            'action': action,
                            'approval': npc['approval'] + approval_change
                        }, room=game_id)

            except Exception as e:
                logger.error(f"Error processing NPC reaction: {e}")

    def update_game_after_turn(self, game_id: str, scenario: ScenarioData):
        """Update game state after turn processing"""
        try:
            # Add theme to history
            with self.db.get_connection() as conn:
                game = conn.execute("""
                    SELECT state FROM games WHERE id = ?
                """, (game_id,)).fetchone()

                if game:
                    state = json.loads(game['state'])
                    state['scenario_history'].append(scenario.theme)

                    # Keep only last 10 themes
                    if len(state['scenario_history']) > 10:
                        state['scenario_history'] = state['scenario_history'][-10:]

                    conn.execute("""
                        UPDATE games SET state = ?, updated_at = CURRENT_TIMESTAMP
                        WHERE id = ?
                    """, (json.dumps(state), game_id))

        except Exception as e:
            logger.error(f"Error updating game after turn: {e}")

    def apply_divine_favor_changes(self, game_id: str, impact: Dict):
        """Apply divine favor changes from council"""
        try:
            for player_id, changes in impact.get('favor_changes', {}).items():
                player = self.db.get_player(player_id)
                if player:
                    divine_favor = player['divine_favor']
                    for god, change in changes.items():
                        divine_favor[god] = divine_favor.get(god, 0) + change

                    # Update player
                    with self.db.get_connection() as conn:
                        conn.execute("""
                            UPDATE players SET divine_favor = ?
                            WHERE id = ?
                        """, (json.dumps(divine_favor), player_id))

        except Exception as e:
            logger.error(f"Error applying divine favor changes: {e}")

    def get_fallback_scenario(self, game_state: Dict) -> ScenarioData:
        """Generate a fallback scenario if Claude connection fails"""
        location = game_state.get('location', 'unknown location')
        turn = game_state.get('turn', 0)

        return ScenarioData(
            theme='exploration',
            public_narration=f"Turn {turn}: You find yourselves at {location}. The air is thick with anticipation. What will you do?",
            whispers=self.generate_default_whispers(game_state),
            sensory_data={},
            choices=[
                {"id": 1, "text": "Investigate the area carefully", "skill": "perception"},
                {"id": 2, "text": "Move forward boldly", "skill": "strength"},
                {"id": 3, "text": "Search for hidden paths", "skill": "stealth"},
                {"id": 4, "text": "Use magic to reveal secrets", "skill": "arcana"}
            ],
            npc_reactions=[],
            trigger_council=False,
            council_reason=None
        )

    def stop(self):
        """Stop the AI GM"""
        self.running = False
        logger.info("AI Game Master stopping...")

# Async wrapper for running in thread
def run_ai_gm_async(socketio):
    """Run AI GM in async loop"""
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)

    gm = AIGameMaster(socketio)
    loop.run_until_complete(gm.start())

def start_ai_gm_thread(socketio):
    """Start AI GM in background thread"""
    gm_thread = Thread(target=run_ai_gm_async, args=(socketio,), daemon=True)
    gm_thread.start()
    logger.info("AI GM thread started")
    return gm_thread

# Testing
if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)

    print("Testing AI Game Master...")
    gm = AIGameMaster()

    # Test connection to Claude
    if gm.connect_to_claude():
        print("✅ Connected to Claude Desktop")

        # Test scenario generation
        test_state = {
            'game_id': 'test_game',
            'turn': 1,
            'location': 'Valdria Town Square',
            'party_trust': 50,
            'players': [
                {'id': 'p1', 'name': 'TestFighter', 'class_type': 'Fighter'},
                {'id': 'p2', 'name': 'TestMage', 'class_type': 'Mage'}
            ],
            'npcs': [
                {'name': 'Grimsby', 'approval': 50}
            ],
            'recent_history': [],
            'pending_actions': {},
            'scenario_history': []
        }

        loop = asyncio.new_event_loop()
        scenario = loop.run_until_complete(gm.generate_scenario(test_state))

        print(f"Generated scenario:")
        print(f"Theme: {scenario.theme}")
        print(f"Public: {scenario.public_narration[:100]}...")
        print(f"Whispers: {len(scenario.whispers)}")
        print(f"Choices: {len(scenario.choices)}")
    else:
        print("❌ Failed to connect to Claude Desktop")
        print("Make sure Claude Desktop is running and MCP is configured")