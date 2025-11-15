"""
The Arcane Codex - Main Game Controller
Integrates all systems into a cohesive game loop
"""

import json
import logging
import random
import time
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass
from enum import Enum
from datetime import datetime

# Import all game systems
from database import ArcaneDatabase
from ai_gm_auto import AIGameMaster
from battle_system import BattleSystem, CombatAction
from inventory_system import Inventory, LootTable, ItemDatabase
from character_progression import Character, CharacterProgression, CharacterClass
from sensory_system import SensorySystem
from divine_interrogation import DivineInterrogation

logger = logging.getLogger(__name__)

class GamePhase(Enum):
    """Game phases"""
    MENU = "menu"
    CHARACTER_CREATION = "character_creation"
    TOWN = "town"
    EXPLORATION = "exploration"
    COMBAT = "combat"
    DIALOGUE = "dialogue"
    SHOPPING = "shopping"
    QUEST_COMPLETE = "quest_complete"
    GAME_OVER = "game_over"
    VICTORY = "victory"

class QuestStatus(Enum):
    """Quest completion status"""
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"

@dataclass
class Quest:
    """Quest data structure"""
    id: str
    name: str
    description: str
    objectives: List[Dict]
    rewards: Dict
    status: QuestStatus = QuestStatus.NOT_STARTED
    current_objective: int = 0

class GameController:
    """
    Main game controller that manages the complete game loop
    """

    def __init__(self, game_id: str, socketio=None):
        self.game_id = game_id
        self.socketio = socketio

        # Initialize all systems
        self.db = ArcaneDatabase()
        self.ai_gm = AIGameMaster(socketio)
        self.battle_system = BattleSystem(self.db, socketio)
        self.sensory_system = SensorySystem(self.db, socketio)
        self.divine_interrogation = DivineInterrogation(self.db)
        self.item_db = ItemDatabase()
        self.loot_table = LootTable()

        # Game state
        self.phase = GamePhase.MENU
        self.players: Dict[str, Character] = {}
        self.inventories: Dict[str, Inventory] = {}
        self.current_location = "Valdria Town Square"
        self.party_trust = 50
        self.active_quests: List[Quest] = []
        self.completed_quests: List[str] = []
        self.game_flags: Dict[str, Any] = {}
        self.turn_count = 0
        self.session_start = datetime.now()

        # NPCs
        self.npcs = self._initialize_npcs()

        # Town services
        self.shop_inventory = self._initialize_shop()
        self.inn_cost = 10  # Gold per rest

    def _initialize_npcs(self) -> Dict:
        """Initialize game NPCs"""
        return {
            'grimsby': {
                'name': 'Grimsby',
                'title': 'Desperate Father',
                'approval': 50,
                'location': 'Valdria Town Square',
                'dialogue': {
                    'greeting': "Please, you must help me! My daughter is dying!",
                    'quest': "The medicine she needs is in the Duke's warehouse...",
                    'thanks': "You saved her life. I am forever in your debt."
                }
            },
            'renna': {
                'name': 'Renna',
                'title': 'Vengeful Rogue',
                'approval': 50,
                'location': 'Shady Alley',
                'dialogue': {
                    'greeting': "Looking for trouble? You've come to the right place.",
                    'quest': "Help me take down the Thieves Guild leader... my brother.",
                    'thanks': "It's done. I'm finally free."
                }
            },
            'merchant': {
                'name': 'Marcus',
                'title': 'Town Merchant',
                'approval': 75,
                'location': 'Market Square',
                'dialogue': {
                    'greeting': "Welcome! Best goods in Valdria!",
                    'shop': "Take a look at my wares.",
                    'farewell': "Come back anytime!"
                }
            },
            'innkeeper': {
                'name': 'Martha',
                'title': 'Innkeeper',
                'approval': 80,
                'location': 'The Prancing Pony Inn',
                'dialogue': {
                    'greeting': "Welcome to the Prancing Pony! Need a rest?",
                    'rest': f"That'll be {10} gold for the night.",
                    'rumors': "I hear strange things are happening at the old ruins..."
                }
            }
        }

    def _initialize_shop(self) -> List[str]:
        """Initialize shop inventory"""
        return [
            'health_potion',
            'mana_potion',
            'strength_elixir',
            'smoke_bomb',
            'iron_sword',
            'leather_armor',
            'wooden_shield',
            'iron_helmet'
        ]

    async def start_new_game(self, player_data: List[Dict]) -> bool:
        """Start a new game with player data"""
        try:
            # Create characters from player data
            for p_data in player_data:
                character = Character(
                    id=p_data['id'],
                    name=p_data['name'],
                    class_type=p_data['class_type']
                )

                # Set initial stats based on class
                self._apply_class_bonuses(character)

                # Apply divine favor from interrogation
                character.divine_favor = p_data.get('divine_favor', {})

                # Calculate initial stats
                character.stats.calculate_derived_stats(
                    character.class_type,
                    character.level
                )

                self.players[character.id] = character

                # Create inventory
                inventory = Inventory()
                inventory.gold = 50  # Starting gold

                # Add starting items
                self._add_starting_equipment(character, inventory)

                self.inventories[character.id] = inventory

            # Initialize first quest
            self._initialize_starting_quest()

            # Set phase to town
            self.phase = GamePhase.TOWN

            # Broadcast game start
            if self.socketio:
                self.socketio.emit('game_started', {
                    'location': self.current_location,
                    'players': [p.serialize() for p in self.players.values()],
                    'party_trust': self.party_trust
                }, room=self.game_id)

            logger.info(f"Game {self.game_id} started with {len(self.players)} players")
            return True

        except Exception as e:
            logger.error(f"Error starting game: {e}")
            return False

    def _apply_class_bonuses(self, character: Character):
        """Apply initial class bonuses to character"""
        class_bonuses = {
            'Fighter': {'strength': 2, 'constitution': 2},
            'Mage': {'intelligence': 3, 'wisdom': 1},
            'Thief': {'dexterity': 3, 'intelligence': 1},
            'Ranger': {'dexterity': 2, 'wisdom': 2},
            'Cleric': {'wisdom': 2, 'constitution': 2},
            'Bard': {'charisma': 3, 'intelligence': 1}
        }

        bonuses = class_bonuses.get(character.class_type, {})
        for stat, value in bonuses.items():
            current = getattr(character.stats, stat)
            setattr(character.stats, stat, current + value)

    def _add_starting_equipment(self, character: Character, inventory: Inventory):
        """Add class-specific starting equipment"""
        starting_gear = {
            'Fighter': ['rusty_sword', 'wooden_shield', 'health_potion'],
            'Mage': ['mage_staff', 'mana_potion', 'mana_potion'],
            'Thief': ['rusty_sword', 'smoke_bomb', 'health_potion'],
            'Ranger': ['rusty_sword', 'health_potion', 'health_potion'],
            'Cleric': ['rusty_sword', 'health_potion', 'mana_potion'],
            'Bard': ['rusty_sword', 'health_potion', 'silver_ring']
        }

        items = starting_gear.get(character.class_type, ['rusty_sword', 'health_potion'])

        for item_id in items:
            item = self.item_db.get_item(item_id)
            if item:
                inventory.add_item(item, 1)

    def _initialize_starting_quest(self):
        """Initialize the first quest"""
        first_quest = Quest(
            id='save_grimsbys_daughter',
            name="A Father's Plea",
            description="Grimsby's daughter is dying. Find medicine to save her.",
            objectives=[
                {'type': 'talk', 'target': 'grimsby', 'completed': False},
                {'type': 'obtain', 'item': 'medicine', 'completed': False},
                {'type': 'return', 'target': 'grimsby', 'completed': False}
            ],
            rewards={
                'xp': 100,
                'gold': 50,
                'item': 'lucky_charm',
                'reputation': {'grimsby': 20}
            }
        )

        self.active_quests.append(first_quest)

    async def process_town_action(self, player_id: str, action: str,
                                 target: Optional[str] = None) -> Dict:
        """Process actions in town"""
        if self.phase != GamePhase.TOWN:
            return {'success': False, 'message': 'Not in town'}

        player = self.players.get(player_id)
        if not player:
            return {'success': False, 'message': 'Invalid player'}

        if action == 'talk':
            return await self._handle_npc_dialogue(player_id, target)

        elif action == 'shop':
            self.phase = GamePhase.SHOPPING
            return {
                'success': True,
                'shop_inventory': self._get_shop_data(),
                'player_gold': self.inventories[player_id].gold
            }

        elif action == 'rest':
            return self._handle_inn_rest(player_id)

        elif action == 'explore':
            return await self._start_exploration()

        elif action == 'quest_board':
            return {
                'success': True,
                'active_quests': [q.__dict__ for q in self.active_quests],
                'completed_quests': self.completed_quests
            }

        elif action == 'party_status':
            return self._get_party_status()

        return {'success': False, 'message': 'Unknown action'}

    async def _handle_npc_dialogue(self, player_id: str, npc_name: str) -> Dict:
        """Handle talking to NPCs"""
        npc = self.npcs.get(npc_name)
        if not npc:
            return {'success': False, 'message': 'NPC not found'}

        # Check if NPC has quest
        for quest in self.active_quests:
            if quest.status == QuestStatus.NOT_STARTED:
                # Check if this NPC gives this quest
                if npc_name == 'grimsby' and quest.id == 'save_grimsbys_daughter':
                    quest.status = QuestStatus.IN_PROGRESS

                    return {
                        'success': True,
                        'dialogue': npc['dialogue']['quest'],
                        'quest_started': quest.name,
                        'npc_approval': npc['approval']
                    }

        # Default greeting
        return {
            'success': True,
            'dialogue': npc['dialogue']['greeting'],
            'npc_approval': npc['approval']
        }

    def _handle_inn_rest(self, player_id: str) -> Dict:
        """Handle resting at the inn"""
        inventory = self.inventories[player_id]

        if inventory.gold < self.inn_cost:
            return {
                'success': False,
                'message': f'Not enough gold (need {self.inn_cost})'
            }

        # Pay for rest
        inventory.gold -= self.inn_cost

        # Restore HP/MP for all party members
        for p_id, player in self.players.items():
            player.stats.hp = player.stats.max_hp
            player.stats.mp = player.stats.max_mp

        # Time passes
        self.turn_count += 1

        return {
            'success': True,
            'message': 'The party rests and recovers fully',
            'gold_spent': self.inn_cost,
            'party_healed': True
        }

    async def _start_exploration(self) -> Dict:
        """Start exploration/adventure phase"""
        self.phase = GamePhase.EXPLORATION

        # Generate scenario via AI GM
        game_state = self._get_game_state_for_ai()
        scenario = await self.ai_gm.generate_scenario(game_state)

        # Check for combat encounter
        if random.random() < 0.3:  # 30% chance of combat
            return await self._start_combat_encounter()

        # Regular exploration scenario
        return {
            'success': True,
            'phase': 'exploration',
            'scenario': {
                'narration': scenario.public_narration,
                'choices': scenario.choices,
                'whispers': scenario.whispers,
                'sensory': scenario.sensory_data
            }
        }

    async def _start_combat_encounter(self) -> Dict:
        """Start a combat encounter"""
        self.phase = GamePhase.COMBAT

        # Generate enemies based on party level
        avg_level = sum(p.level for p in self.players.values()) // len(self.players)

        enemy_types = ['goblin', 'orc', 'bandit', 'skeleton', 'wolf']
        enemy_count = min(3, len(self.players) + 1)

        enemies = []
        for i in range(enemy_count):
            enemy_type = random.choice(enemy_types)
            enemies.append({
                'name': f'{enemy_type.title()} {i+1}',
                'type': enemy_type,
                'level': max(1, avg_level + random.randint(-1, 1))
            })

        # Convert players to battle format
        battle_players = [
            {
                'id': p.id,
                'name': p.name,
                'class_type': p.class_type,
                'level': p.level
            }
            for p in self.players.values()
        ]

        # Start battle
        battle_state = self.battle_system.start_battle(
            self.game_id,
            battle_players,
            enemies
        )

        return {
            'success': True,
            'phase': 'combat',
            'battle': {
                'enemies': enemies,
                'initiative_order': battle_state['initiative_order'],
                'current_turn': battle_state['initiative_order'][0]
            }
        }

    async def process_combat_action(self, player_id: str,
                                  action_data: Dict) -> Dict:
        """Process combat action"""
        if self.phase != GamePhase.COMBAT:
            return {'success': False, 'message': 'Not in combat'}

        # Create combat action
        action = CombatAction(
            actor_id=player_id,
            action_type=action_data['type'],
            target_id=action_data.get('target'),
            ability_name=action_data.get('ability')
        )

        # Process action
        result = self.battle_system.process_action(self.game_id, action)

        # Check if battle ended
        battle_state = self.battle_system.get_battle_state(self.game_id)

        if battle_state and battle_state['state'].value == 'combat_end':
            # Battle ended
            return await self._handle_battle_end(battle_state)

        return {
            'success': result.success,
            'result': {
                'message': result.message,
                'damage': result.damage,
                'critical': result.critical,
                'dodged': result.dodged
            }
        }

    async def _handle_battle_end(self, battle_state: Dict) -> Dict:
        """Handle end of battle"""
        rewards = battle_state.get('rewards', {})

        if rewards:
            # Victory!
            self.phase = GamePhase.TOWN

            # Distribute rewards
            xp_per_player = rewards['xp'] // len(self.players)
            gold_per_player = rewards['gold'] // len(self.players)

            level_ups = []
            for player in self.players.values():
                # Add XP
                level_up_rewards = player.add_experience(xp_per_player)
                if level_up_rewards:
                    level_ups.append({
                        'player': player.name,
                        'new_level': player.level,
                        'rewards': level_up_rewards
                    })

                # Add gold
                self.inventories[player.id].gold += gold_per_player
                player.gold_earned += gold_per_player

                # Track kills
                player.monsters_killed += len([
                    p for p in battle_state['participants'].values()
                    if p['type'] == 'enemy' and p['stats'].hp <= 0
                ])

            # Generate loot
            loot_items = []
            for participant in battle_state['participants'].values():
                if participant['type'] == 'enemy' and participant['stats'].hp <= 0:
                    enemy_loot = self.loot_table.generate_loot(
                        participant['enemy_type'],
                        participant.get('level', 1)
                    )
                    loot_items.extend(enemy_loot['items'])

            return {
                'success': True,
                'phase': 'victory',
                'rewards': {
                    'xp': xp_per_player,
                    'gold': gold_per_player,
                    'loot': [{'name': i['item'].name, 'quantity': i['quantity']}
                            for i in loot_items],
                    'level_ups': level_ups
                }
            }
        else:
            # Defeat...
            self.phase = GamePhase.GAME_OVER

            # Mark deaths
            for player in self.players.values():
                player.deaths += 1

            return {
                'success': True,
                'phase': 'defeat',
                'message': 'The party has been defeated...'
            }

    def process_shop_transaction(self, player_id: str,
                                action: str, item_id: str,
                                quantity: int = 1) -> Dict:
        """Handle shop buying/selling"""
        if self.phase != GamePhase.SHOPPING:
            return {'success': False, 'message': 'Not in shop'}

        inventory = self.inventories[player_id]

        if action == 'buy':
            if item_id not in self.shop_inventory:
                return {'success': False, 'message': 'Item not in shop'}

            item = self.item_db.get_item(item_id)
            if not item:
                return {'success': False, 'message': 'Invalid item'}

            total_cost = item.value * quantity

            if inventory.gold < total_cost:
                return {'success': False, 'message': 'Not enough gold'}

            if inventory.add_item(item, quantity):
                inventory.gold -= total_cost
                return {
                    'success': True,
                    'message': f'Purchased {quantity}x {item.name}',
                    'gold_spent': total_cost
                }
            else:
                return {'success': False, 'message': 'Inventory full'}

        elif action == 'sell':
            item = None
            for slot in inventory.slots:
                if slot.item and slot.item.id == item_id:
                    item = slot.item
                    break

            if not item:
                return {'success': False, 'message': 'Item not in inventory'}

            if item.type == ItemType.QUEST:
                return {'success': False, 'message': 'Cannot sell quest items'}

            sell_value = (item.value // 2) * quantity  # 50% sell price

            if inventory.remove_item(item_id, quantity):
                inventory.gold += sell_value
                return {
                    'success': True,
                    'message': f'Sold {quantity}x {item.name}',
                    'gold_earned': sell_value
                }
            else:
                return {'success': False, 'message': 'Not enough items'}

        return {'success': False, 'message': 'Invalid action'}

    def check_quest_objectives(self, trigger_type: str,
                              trigger_data: Dict) -> List[Dict]:
        """Check if any quest objectives are completed"""
        completed_quests = []

        for quest in self.active_quests:
            if quest.status != QuestStatus.IN_PROGRESS:
                continue

            objective = quest.objectives[quest.current_objective]

            # Check if objective matches trigger
            if objective['type'] == trigger_type:
                if trigger_type == 'obtain' and trigger_data.get('item') == objective['item']:
                    objective['completed'] = True
                elif trigger_type == 'kill' and trigger_data.get('enemy') == objective['target']:
                    objective['completed'] = True
                elif trigger_type == 'talk' and trigger_data.get('npc') == objective['target']:
                    objective['completed'] = True

                if objective['completed']:
                    quest.current_objective += 1

                    # Check if quest complete
                    if quest.current_objective >= len(quest.objectives):
                        quest.status = QuestStatus.COMPLETED
                        completed_quests.append(quest)

                        # Apply rewards
                        self._apply_quest_rewards(quest)

        return completed_quests

    def _apply_quest_rewards(self, quest: Quest):
        """Apply quest completion rewards"""
        rewards = quest.rewards

        # XP reward
        if 'xp' in rewards:
            xp_per_player = rewards['xp'] // len(self.players)
            for player in self.players.values():
                player.add_experience(xp_per_player)
                player.quests_completed += 1

        # Gold reward
        if 'gold' in rewards:
            gold_per_player = rewards['gold'] // len(self.players)
            for inventory in self.inventories.values():
                inventory.gold += gold_per_player

        # Item reward
        if 'item' in rewards:
            item = self.item_db.get_item(rewards['item'])
            if item:
                # Give to first player with space
                for inventory in self.inventories.values():
                    if inventory.add_item(item, 1):
                        break

        # Reputation changes
        if 'reputation' in rewards:
            for npc_name, change in rewards['reputation'].items():
                if npc_name in self.npcs:
                    self.npcs[npc_name]['approval'] += change

        # Move to completed
        self.completed_quests.append(quest.id)
        self.active_quests.remove(quest)

    def _get_party_status(self) -> Dict:
        """Get complete party status"""
        return {
            'success': True,
            'location': self.current_location,
            'phase': self.phase.value,
            'turn': self.turn_count,
            'party_trust': self.party_trust,
            'players': [
                {
                    'name': p.name,
                    'class': p.class_type,
                    'level': p.level,
                    'hp': p.stats.max_hp,
                    'xp': p.experience
                }
                for p in self.players.values()
            ],
            'active_quests': len(self.active_quests),
            'gold_total': sum(inv.gold for inv in self.inventories.values())
        }

    def _get_shop_data(self) -> List[Dict]:
        """Get shop inventory data"""
        shop_items = []
        for item_id in self.shop_inventory:
            item = self.item_db.get_item(item_id)
            if item:
                shop_items.append({
                    'id': item.id,
                    'name': item.name,
                    'description': item.description,
                    'price': item.value,
                    'type': item.type.value,
                    'icon': item.icon
                })
        return shop_items

    def _get_game_state_for_ai(self) -> Dict:
        """Prepare game state for AI GM"""
        return {
            'game_id': self.game_id,
            'turn': self.turn_count,
            'phase': self.phase.value,
            'location': self.current_location,
            'party_trust': self.party_trust,
            'players': [p.serialize() for p in self.players.values()],
            'npcs': list(self.npcs.values()),
            'active_quests': [q.__dict__ for q in self.active_quests],
            'world_flags': self.game_flags,
            'recent_history': []  # TODO: Track history
        }

    def save_game(self) -> Dict:
        """Save complete game state"""
        return {
            'game_id': self.game_id,
            'phase': self.phase.value,
            'turn_count': self.turn_count,
            'current_location': self.current_location,
            'party_trust': self.party_trust,
            'players': {
                p_id: player.serialize()
                for p_id, player in self.players.items()
            },
            'inventories': {
                p_id: inventory.serialize()
                for p_id, inventory in self.inventories.items()
            },
            'npcs': self.npcs,
            'active_quests': [q.__dict__ for q in self.active_quests],
            'completed_quests': self.completed_quests,
            'game_flags': self.game_flags,
            'save_time': datetime.now().isoformat()
        }

    def load_game(self, save_data: Dict) -> bool:
        """Load game from saved state"""
        try:
            self.game_id = save_data['game_id']
            self.phase = GamePhase(save_data['phase'])
            self.turn_count = save_data['turn_count']
            self.current_location = save_data['current_location']
            self.party_trust = save_data['party_trust']

            # Load players
            self.players = {}
            for p_id, p_data in save_data['players'].items():
                character = Character(
                    id=p_data['id'],
                    name=p_data['name'],
                    class_type=p_data['class_type']
                )
                # Load all character data
                character.level = p_data['level']
                character.experience = p_data['experience']
                character.learned_skills = p_data.get('learned_skills', {})
                character.divine_favor = p_data.get('divine_favor', {})
                # ... load other fields
                self.players[p_id] = character

            # Load inventories
            self.inventories = {}
            for p_id, inv_data in save_data['inventories'].items():
                inventory = Inventory()
                inventory.deserialize(inv_data)
                self.inventories[p_id] = inventory

            # Load other data
            self.npcs = save_data['npcs']
            self.completed_quests = save_data['completed_quests']
            self.game_flags = save_data['game_flags']

            # Recreate quests
            self.active_quests = []
            for q_data in save_data['active_quests']:
                quest = Quest(
                    id=q_data['id'],
                    name=q_data['name'],
                    description=q_data['description'],
                    objectives=q_data['objectives'],
                    rewards=q_data['rewards'],
                    status=QuestStatus(q_data['status']),
                    current_objective=q_data.get('current_objective', 0)
                )
                self.active_quests.append(quest)

            logger.info(f"Game {self.game_id} loaded from save")
            return True

        except Exception as e:
            logger.error(f"Error loading game: {e}")
            return False

# Testing
if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)

    print("Testing Game Controller...")

    # Create game controller
    game = GameController('test_game')

    # Create test players
    test_players = [
        {
            'id': 'p1',
            'name': 'Aldric',
            'class_type': 'Fighter',
            'divine_favor': {'VALDRIS': 30, 'KORVAN': 20}
        },
        {
            'id': 'p2',
            'name': 'Mira',
            'class_type': 'Mage',
            'divine_favor': {'ATHENA': 40, 'SYLARA': 15}
        }
    ]

    # Start game
    import asyncio
    loop = asyncio.new_event_loop()
    success = loop.run_until_complete(game.start_new_game(test_players))

    if success:
        print("✅ Game started successfully!")
        print(f"Location: {game.current_location}")
        print(f"Phase: {game.phase.value}")
        print(f"Players: {len(game.players)}")
        print(f"Active quests: {len(game.active_quests)}")

        # Test saving
        save_data = game.save_game()
        print(f"\n✅ Game saved ({len(save_data)} fields)")

        # Test loading
        new_game = GameController('test_game_2')
        if new_game.load_game(save_data):
            print("✅ Game loaded successfully!")

    print("\nGame controller test complete!")