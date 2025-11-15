"""
The Arcane Codex - Battle System
Turn-based combat with dice mechanics and class abilities
"""

import random
import json
import logging
from typing import Dict, List, Optional, Tuple, Any
from dataclasses import dataclass, field
from enum import Enum
from datetime import datetime

logger = logging.getLogger(__name__)

class CombatState(Enum):
    """Combat states"""
    INITIALIZING = "initializing"
    ROLLING_INITIATIVE = "rolling_initiative"
    PLAYER_TURN = "player_turn"
    ENEMY_TURN = "enemy_turn"
    RESOLVING_ACTION = "resolving_action"
    COMBAT_END = "combat_end"

class DamageType(Enum):
    """Damage types"""
    PHYSICAL = "physical"
    MAGICAL = "magical"
    DIVINE = "divine"
    POISON = "poison"
    FIRE = "fire"
    ICE = "ice"
    SHADOW = "shadow"

class StatusEffect(Enum):
    """Status effects"""
    NONE = "none"
    POISONED = "poisoned"      # -2 HP per turn
    STUNNED = "stunned"        # Skip turn
    BLESSED = "blessed"        # +2 to all rolls
    CURSED = "cursed"         # -2 to all rolls
    BURNING = "burning"        # -3 HP per turn
    FROZEN = "frozen"          # 50% chance to skip turn
    INVISIBLE = "invisible"    # Harder to hit
    ENRAGED = "enraged"       # +4 damage, -2 defense
    SHIELDED = "shielded"     # Absorb next 10 damage
    REGENERATING = "regenerating"  # +2 HP per turn

@dataclass
class CombatStats:
    """Combat statistics for a character"""
    hp: int
    max_hp: int
    attack: int
    defense: int
    magic: int
    speed: int
    critical_chance: float = 0.1
    dodge_chance: float = 0.1
    damage_reduction: float = 0.0
    status_effects: List[StatusEffect] = field(default_factory=list)
    status_durations: Dict[StatusEffect, int] = field(default_factory=dict)

@dataclass
class CombatAction:
    """A combat action"""
    actor_id: str
    action_type: str  # attack, defend, ability, item, flee
    target_id: Optional[str] = None
    ability_name: Optional[str] = None
    dice_modifier: int = 0

@dataclass
class CombatResult:
    """Result of a combat action"""
    success: bool
    damage: int = 0
    healing: int = 0
    status_applied: Optional[StatusEffect] = None
    critical: bool = False
    dodged: bool = False
    message: str = ""
    dice_rolls: List[int] = field(default_factory=list)

class DiceRoller:
    """Dice rolling system with D&D style mechanics"""

    @staticmethod
    def roll(dice_count: int = 1, dice_sides: int = 20,
             modifier: int = 0, advantage: bool = False,
             disadvantage: bool = False) -> Tuple[int, List[int]]:
        """
        Roll dice with D&D mechanics
        Returns (total, individual_rolls)
        """
        rolls = []

        # Roll the dice
        for _ in range(dice_count):
            if advantage:
                # Roll twice, take higher
                roll1 = random.randint(1, dice_sides)
                roll2 = random.randint(1, dice_sides)
                rolls.append(max(roll1, roll2))
            elif disadvantage:
                # Roll twice, take lower
                roll1 = random.randint(1, dice_sides)
                roll2 = random.randint(1, dice_sides)
                rolls.append(min(roll1, roll2))
            else:
                rolls.append(random.randint(1, dice_sides))

        total = sum(rolls) + modifier
        return total, rolls

    @staticmethod
    def roll_initiative(speed: int) -> int:
        """Roll for initiative order"""
        total, _ = DiceRoller.roll(1, 20, speed)
        return total

    @staticmethod
    def roll_attack(attack_bonus: int, advantage: bool = False) -> Tuple[int, bool]:
        """Roll to hit, check for critical (nat 20)"""
        total, rolls = DiceRoller.roll(1, 20, attack_bonus, advantage)
        critical = rolls[0] == 20
        return total, critical

    @staticmethod
    def roll_damage(damage_dice: int, dice_sides: int,
                    modifier: int, critical: bool = False) -> int:
        """Roll damage dice, double dice on critical"""
        dice_count = damage_dice * 2 if critical else damage_dice
        total, _ = DiceRoller.roll(dice_count, dice_sides, modifier)
        return max(1, total)  # Minimum 1 damage

class ClassAbilities:
    """Class-specific combat abilities"""

    ABILITIES = {
        "Fighter": {
            "power_strike": {
                "name": "Power Strike",
                "cost": 0,
                "cooldown": 2,
                "description": "Double damage on next attack",
                "effect": lambda stats: {"damage_multiplier": 2.0}
            },
            "defensive_stance": {
                "name": "Defensive Stance",
                "cost": 0,
                "cooldown": 3,
                "description": "+5 defense for 3 turns",
                "effect": lambda stats: {"defense_bonus": 5, "duration": 3}
            },
            "rallying_cry": {
                "name": "Rallying Cry",
                "cost": 0,
                "cooldown": 5,
                "description": "Party gains +2 attack for 2 turns",
                "effect": lambda stats: {"party_attack_bonus": 2, "duration": 2}
            }
        },
        "Mage": {
            "fireball": {
                "name": "Fireball",
                "cost": 3,
                "cooldown": 1,
                "description": "3d6 fire damage to all enemies",
                "effect": lambda stats: {"damage": DiceRoller.roll(3, 6, stats.magic)[0],
                                        "damage_type": DamageType.FIRE,
                                        "aoe": True}
            },
            "ice_shard": {
                "name": "Ice Shard",
                "cost": 2,
                "cooldown": 1,
                "description": "2d8 ice damage + chance to freeze",
                "effect": lambda stats: {"damage": DiceRoller.roll(2, 8, stats.magic)[0],
                                        "damage_type": DamageType.ICE,
                                        "status": StatusEffect.FROZEN,
                                        "status_chance": 0.5}
            },
            "arcane_shield": {
                "name": "Arcane Shield",
                "cost": 2,
                "cooldown": 3,
                "description": "Absorb next 15 damage",
                "effect": lambda stats: {"shield": 15}
            }
        },
        "Thief": {
            "sneak_attack": {
                "name": "Sneak Attack",
                "cost": 0,
                "cooldown": 2,
                "description": "Attack with advantage + 2d6 bonus damage",
                "effect": lambda stats: {"advantage": True,
                                        "bonus_damage": DiceRoller.roll(2, 6, 0)[0]}
            },
            "smoke_bomb": {
                "name": "Smoke Bomb",
                "cost": 0,
                "cooldown": 4,
                "description": "Party gains invisibility for 1 turn",
                "effect": lambda stats: {"party_status": StatusEffect.INVISIBLE, "duration": 1}
            },
            "poison_blade": {
                "name": "Poison Blade",
                "cost": 0,
                "cooldown": 3,
                "description": "Next attack inflicts poison",
                "effect": lambda stats: {"apply_status": StatusEffect.POISONED, "duration": 3}
            }
        },
        "Ranger": {
            "aimed_shot": {
                "name": "Aimed Shot",
                "cost": 0,
                "cooldown": 2,
                "description": "Always hits, +1d8 damage",
                "effect": lambda stats: {"auto_hit": True,
                                        "bonus_damage": DiceRoller.roll(1, 8, stats.attack)[0]}
            },
            "animal_companion": {
                "name": "Animal Companion",
                "cost": 0,
                "cooldown": 5,
                "description": "Summon wolf companion (10 HP, 1d6 damage)",
                "effect": lambda stats: {"summon": "wolf", "summon_hp": 10, "summon_damage": "1d6"}
            },
            "hunters_mark": {
                "name": "Hunter's Mark",
                "cost": 0,
                "cooldown": 3,
                "description": "Mark target, +3 damage against it",
                "effect": lambda stats: {"mark_target": True, "mark_bonus": 3, "duration": 999}
            }
        },
        "Cleric": {
            "heal": {
                "name": "Heal",
                "cost": 2,
                "cooldown": 1,
                "description": "Restore 2d8+3 HP to ally",
                "effect": lambda stats: {"healing": DiceRoller.roll(2, 8, 3 + stats.magic)[0]}
            },
            "divine_strike": {
                "name": "Divine Strike",
                "cost": 3,
                "cooldown": 2,
                "description": "2d10 divine damage, double vs undead",
                "effect": lambda stats: {"damage": DiceRoller.roll(2, 10, stats.magic)[0],
                                        "damage_type": DamageType.DIVINE}
            },
            "blessing": {
                "name": "Blessing",
                "cost": 1,
                "cooldown": 3,
                "description": "Ally gains blessed status (+2 all rolls)",
                "effect": lambda stats: {"apply_status": StatusEffect.BLESSED, "duration": 3}
            }
        },
        "Bard": {
            "inspire": {
                "name": "Inspire",
                "cost": 0,
                "cooldown": 2,
                "description": "Ally gains advantage on next roll",
                "effect": lambda stats: {"grant_advantage": True, "duration": 1}
            },
            "vicious_mockery": {
                "name": "Vicious Mockery",
                "cost": 0,
                "cooldown": 1,
                "description": "1d4 psychic damage + disadvantage",
                "effect": lambda stats: {"damage": DiceRoller.roll(1, 4, stats.magic)[0],
                                        "damage_type": DamageType.MAGICAL,
                                        "apply_disadvantage": True}
            },
            "song_of_rest": {
                "name": "Song of Rest",
                "cost": 0,
                "cooldown": 5,
                "description": "Party regenerates 2 HP per turn",
                "effect": lambda stats: {"party_status": StatusEffect.REGENERATING, "duration": 3}
            }
        }
    }

class BattleSystem:
    """
    Main battle system controller
    """

    def __init__(self, db=None, socketio=None):
        self.db = db
        self.socketio = socketio
        self.active_battles = {}  # game_id -> battle_state
        self.dice_roller = DiceRoller()
        self.abilities = ClassAbilities()

    def start_battle(self, game_id: str, players: List[Dict],
                    enemies: List[Dict]) -> Dict:
        """Initialize a new battle"""
        battle_id = f"battle_{game_id}_{int(datetime.now().timestamp())}"

        # Create combat stats for all participants
        participants = {}

        # Initialize players
        for player in players:
            stats = self._create_combat_stats(player['class_type'], player['level'])
            participants[player['id']] = {
                'name': player['name'],
                'type': 'player',
                'class': player['class_type'],
                'stats': stats,
                'abilities': self.abilities.ABILITIES.get(player['class_type'], {}),
                'cooldowns': {}
            }

        # Initialize enemies
        for i, enemy in enumerate(enemies):
            enemy_id = f"enemy_{i}"
            stats = self._create_enemy_stats(enemy['type'], enemy.get('level', 1))
            participants[enemy_id] = {
                'name': enemy['name'],
                'type': 'enemy',
                'enemy_type': enemy['type'],
                'stats': stats,
                'abilities': enemy.get('abilities', {})
            }

        # Roll initiative
        initiative_order = self._roll_initiative(participants)

        # Create battle state
        battle_state = {
            'id': battle_id,
            'game_id': game_id,
            'state': CombatState.PLAYER_TURN,
            'round': 1,
            'participants': participants,
            'initiative_order': initiative_order,
            'current_turn': 0,
            'action_queue': [],
            'battle_log': [],
            'rewards': None
        }

        self.active_battles[game_id] = battle_state

        # Broadcast battle start
        if self.socketio:
            self.socketio.emit('battle_start', {
                'battle_id': battle_id,
                'participants': self._serialize_participants(participants),
                'initiative_order': initiative_order
            }, room=game_id)

        return battle_state

    def _create_combat_stats(self, class_type: str, level: int = 1) -> CombatStats:
        """Create combat stats based on class"""
        base_stats = {
            "Fighter": {"hp": 12, "attack": 3, "defense": 2, "magic": 0, "speed": 1},
            "Mage": {"hp": 6, "attack": 0, "defense": 0, "magic": 4, "speed": 2},
            "Thief": {"hp": 8, "attack": 2, "defense": 1, "magic": 0, "speed": 4},
            "Ranger": {"hp": 10, "attack": 2, "defense": 1, "magic": 1, "speed": 3},
            "Cleric": {"hp": 10, "attack": 1, "defense": 2, "magic": 3, "speed": 1},
            "Bard": {"hp": 8, "attack": 1, "defense": 1, "magic": 2, "speed": 2}
        }

        stats = base_stats.get(class_type, base_stats["Fighter"])

        # Scale with level
        hp = stats["hp"] + (level - 1) * 4

        return CombatStats(
            hp=hp,
            max_hp=hp,
            attack=stats["attack"] + (level - 1),
            defense=stats["defense"] + (level - 1) // 2,
            magic=stats["magic"] + (level - 1),
            speed=stats["speed"]
        )

    def _create_enemy_stats(self, enemy_type: str, level: int = 1) -> CombatStats:
        """Create enemy combat stats"""
        enemy_templates = {
            "goblin": {"hp": 6, "attack": 1, "defense": 0, "speed": 2},
            "orc": {"hp": 15, "attack": 3, "defense": 1, "speed": 1},
            "skeleton": {"hp": 8, "attack": 2, "defense": 0, "speed": 1},
            "bandit": {"hp": 10, "attack": 2, "defense": 1, "speed": 2},
            "wolf": {"hp": 8, "attack": 2, "defense": 0, "speed": 3},
            "ogre": {"hp": 25, "attack": 4, "defense": 2, "speed": 0},
            "dark_mage": {"hp": 12, "attack": 1, "defense": 1, "speed": 2},
            "boss": {"hp": 50, "attack": 5, "defense": 3, "speed": 1}
        }

        template = enemy_templates.get(enemy_type, enemy_templates["goblin"])

        # Scale with level
        hp = template["hp"] + (level - 1) * 3

        return CombatStats(
            hp=hp,
            max_hp=hp,
            attack=template["attack"] + (level - 1) // 2,
            defense=template["defense"],
            magic=0,
            speed=template["speed"],
            critical_chance=0.05,
            dodge_chance=0.05
        )

    def _roll_initiative(self, participants: Dict) -> List[str]:
        """Roll initiative for turn order"""
        initiative_rolls = []

        for participant_id, participant in participants.items():
            roll = self.dice_roller.roll_initiative(participant['stats'].speed)
            initiative_rolls.append((participant_id, roll))

        # Sort by roll (highest first)
        initiative_rolls.sort(key=lambda x: x[1], reverse=True)

        return [participant_id for participant_id, _ in initiative_rolls]

    def process_action(self, game_id: str, action: CombatAction) -> CombatResult:
        """Process a combat action"""
        if game_id not in self.active_battles:
            return CombatResult(False, message="No active battle")

        battle = self.active_battles[game_id]
        actor = battle['participants'].get(action.actor_id)

        if not actor:
            return CombatResult(False, message="Invalid actor")

        # Process based on action type
        if action.action_type == "attack":
            return self._process_attack(battle, action)
        elif action.action_type == "defend":
            return self._process_defend(battle, action)
        elif action.action_type == "ability":
            return self._process_ability(battle, action)
        elif action.action_type == "item":
            return self._process_item(battle, action)
        elif action.action_type == "flee":
            return self._process_flee(battle, action)

        return CombatResult(False, message="Unknown action type")

    def _process_attack(self, battle: Dict, action: CombatAction) -> CombatResult:
        """Process a basic attack"""
        actor = battle['participants'][action.actor_id]
        target = battle['participants'].get(action.target_id)

        if not target:
            return CombatResult(False, message="Invalid target")

        # Roll to hit
        attack_roll, critical = self.dice_roller.roll_attack(
            actor['stats'].attack,
            advantage=StatusEffect.BLESSED in actor['stats'].status_effects
        )

        # Check dodge
        dodge_roll = random.random()
        if dodge_roll < target['stats'].dodge_chance:
            return CombatResult(
                success=True,
                dodged=True,
                message=f"{actor['name']} attacks but {target['name']} dodges!"
            )

        # Check if hit beats defense
        target_defense = target['stats'].defense
        if StatusEffect.INVISIBLE in target['stats'].status_effects:
            target_defense += 3

        if attack_roll < 10 + target_defense:
            return CombatResult(
                success=False,
                message=f"{actor['name']} misses {target['name']}!"
            )

        # Roll damage
        damage_dice = 1
        dice_sides = 8 if actor['class'] in ['Fighter', 'Ranger'] else 6
        damage = self.dice_roller.roll_damage(
            damage_dice, dice_sides, actor['stats'].attack, critical
        )

        # Apply damage reduction
        damage = int(damage * (1 - target['stats'].damage_reduction))

        # Apply damage
        target['stats'].hp -= damage

        # Add to battle log
        battle['battle_log'].append({
            'round': battle['round'],
            'actor': action.actor_id,
            'action': 'attack',
            'target': action.target_id,
            'damage': damage,
            'critical': critical
        })

        # Check if target defeated
        if target['stats'].hp <= 0:
            self._handle_defeat(battle, action.target_id)

        # Broadcast result
        if self.socketio:
            self.socketio.emit('combat_action', {
                'result': {
                    'actor': actor['name'],
                    'action': 'attack',
                    'target': target['name'],
                    'damage': damage,
                    'critical': critical,
                    'target_hp': max(0, target['stats'].hp)
                }
            }, room=battle['game_id'])

        return CombatResult(
            success=True,
            damage=damage,
            critical=critical,
            message=f"{actor['name']} hits {target['name']} for {damage} damage{'! CRITICAL!' if critical else ''}",
            dice_rolls=[attack_roll]
        )

    def _process_ability(self, battle: Dict, action: CombatAction) -> CombatResult:
        """Process a class ability"""
        actor = battle['participants'][action.actor_id]
        ability = actor['abilities'].get(action.ability_name)

        if not ability:
            return CombatResult(False, message="Unknown ability")

        # Check cooldown
        cooldown_remaining = actor.get('cooldowns', {}).get(action.ability_name, 0)
        if cooldown_remaining > 0:
            return CombatResult(False, message=f"Ability on cooldown ({cooldown_remaining} turns)")

        # Apply ability effect
        effect = ability['effect'](actor['stats'])

        # Set cooldown
        if 'cooldowns' not in actor:
            actor['cooldowns'] = {}
        actor['cooldowns'][action.ability_name] = ability['cooldown']

        # Process effect
        result_message = f"{actor['name']} uses {ability['name']}!"

        if 'damage' in effect:
            # Apply damage to target(s)
            if effect.get('aoe'):
                # Damage all enemies
                total_damage = 0
                for participant_id, participant in battle['participants'].items():
                    if participant['type'] == 'enemy':
                        participant['stats'].hp -= effect['damage']
                        total_damage += effect['damage']
                result_message += f" Deals {total_damage} total damage!"
            else:
                # Single target damage
                target = battle['participants'].get(action.target_id)
                if target:
                    target['stats'].hp -= effect['damage']
                    result_message += f" Deals {effect['damage']} damage to {target['name']}!"

        if 'healing' in effect:
            # Apply healing
            target = battle['participants'].get(action.target_id, actor)
            healed = min(effect['healing'], target['stats'].max_hp - target['stats'].hp)
            target['stats'].hp += healed
            result_message += f" Heals {target['name']} for {healed} HP!"

        if 'apply_status' in effect:
            # Apply status effect
            target = battle['participants'].get(action.target_id)
            if target:
                target['stats'].status_effects.append(effect['apply_status'])
                target['stats'].status_durations[effect['apply_status']] = effect.get('duration', 3)
                result_message += f" {target['name']} is now {effect['apply_status'].value}!"

        # Broadcast ability use
        if self.socketio:
            self.socketio.emit('ability_used', {
                'actor': actor['name'],
                'ability': ability['name'],
                'effect': result_message
            }, room=battle['game_id'])

        return CombatResult(
            success=True,
            message=result_message
        )

    def _process_defend(self, battle: Dict, action: CombatAction) -> CombatResult:
        """Process defend action"""
        actor = battle['participants'][action.actor_id]

        # Temporary defense boost
        actor['stats'].defense += 2
        actor['stats'].damage_reduction = min(0.5, actor['stats'].damage_reduction + 0.25)

        return CombatResult(
            success=True,
            message=f"{actor['name']} takes a defensive stance (+2 defense, 25% damage reduction)"
        )

    def _process_item(self, battle: Dict, action: CombatAction) -> CombatResult:
        """Process item use (health potion, etc.)"""
        actor = battle['participants'][action.actor_id]

        # Simple health potion for now
        healing = DiceRoller.roll(2, 4, 2)[0]  # 2d4+2 healing
        actor['stats'].hp = min(actor['stats'].max_hp, actor['stats'].hp + healing)

        return CombatResult(
            success=True,
            healing=healing,
            message=f"{actor['name']} uses a health potion and recovers {healing} HP"
        )

    def _process_flee(self, battle: Dict, action: CombatAction) -> CombatResult:
        """Process flee attempt"""
        actor = battle['participants'][action.actor_id]

        # Roll for flee success (speed check)
        flee_roll = DiceRoller.roll(1, 20, actor['stats'].speed)[0]

        if flee_roll >= 15:
            # Successful flee
            battle['state'] = CombatState.COMBAT_END
            return CombatResult(
                success=True,
                message=f"{actor['name']} successfully flees from battle!"
            )
        else:
            return CombatResult(
                success=False,
                message=f"{actor['name']} fails to flee! (rolled {flee_roll}, needed 15+)"
            )

    def _handle_defeat(self, battle: Dict, defeated_id: str):
        """Handle character defeat"""
        defeated = battle['participants'][defeated_id]
        defeated['stats'].hp = 0

        # Check if all enemies or all players defeated
        enemies_alive = any(
            p['stats'].hp > 0 for p in battle['participants'].values()
            if p['type'] == 'enemy'
        )
        players_alive = any(
            p['stats'].hp > 0 for p in battle['participants'].values()
            if p['type'] == 'player'
        )

        if not enemies_alive:
            # Victory!
            self._handle_victory(battle)
        elif not players_alive:
            # Defeat...
            self._handle_party_defeat(battle)

    def _handle_victory(self, battle: Dict):
        """Handle battle victory"""
        battle['state'] = CombatState.COMBAT_END

        # Calculate rewards
        xp_reward = sum(10 * (i + 1) for i in range(len([
            p for p in battle['participants'].values() if p['type'] == 'enemy'
        ])))

        gold_reward = DiceRoller.roll(2, 20, 10)[0]  # 2d20+10 gold

        battle['rewards'] = {
            'xp': xp_reward,
            'gold': gold_reward,
            'items': []  # TODO: Add loot system
        }

        # Broadcast victory
        if self.socketio:
            self.socketio.emit('battle_victory', {
                'message': 'Victory!',
                'rewards': battle['rewards']
            }, room=battle['game_id'])

    def _handle_party_defeat(self, battle: Dict):
        """Handle party defeat"""
        battle['state'] = CombatState.COMBAT_END

        # Broadcast defeat
        if self.socketio:
            self.socketio.emit('battle_defeat', {
                'message': 'The party has been defeated...'
            }, room=battle['game_id'])

    def apply_status_effects(self, game_id: str):
        """Apply status effects at turn start"""
        if game_id not in self.active_battles:
            return

        battle = self.active_battles[game_id]

        for participant_id, participant in battle['participants'].items():
            stats = participant['stats']

            # Process each status effect
            for status in list(stats.status_effects):
                if status == StatusEffect.POISONED:
                    stats.hp -= 2
                elif status == StatusEffect.BURNING:
                    stats.hp -= 3
                elif status == StatusEffect.REGENERATING:
                    stats.hp = min(stats.max_hp, stats.hp + 2)
                elif status == StatusEffect.STUNNED:
                    # Skip turn handled elsewhere
                    pass
                elif status == StatusEffect.FROZEN:
                    # 50% chance to skip turn handled elsewhere
                    pass

                # Reduce duration
                if status in stats.status_durations:
                    stats.status_durations[status] -= 1
                    if stats.status_durations[status] <= 0:
                        stats.status_effects.remove(status)
                        del stats.status_durations[status]

    def reduce_cooldowns(self, game_id: str):
        """Reduce ability cooldowns at turn end"""
        if game_id not in self.active_battles:
            return

        battle = self.active_battles[game_id]

        for participant in battle['participants'].values():
            if 'cooldowns' in participant:
                for ability_name in list(participant['cooldowns'].keys()):
                    participant['cooldowns'][ability_name] -= 1
                    if participant['cooldowns'][ability_name] <= 0:
                        del participant['cooldowns'][ability_name]

    def get_battle_state(self, game_id: str) -> Optional[Dict]:
        """Get current battle state"""
        return self.active_battles.get(game_id)

    def _serialize_participants(self, participants: Dict) -> Dict:
        """Serialize participants for client"""
        serialized = {}
        for pid, participant in participants.items():
            serialized[pid] = {
                'name': participant['name'],
                'type': participant['type'],
                'class': participant.get('class'),
                'hp': participant['stats'].hp,
                'max_hp': participant['stats'].max_hp,
                'status_effects': [s.value for s in participant['stats'].status_effects],
                'abilities': list(participant.get('abilities', {}).keys())
            }
        return serialized

    def end_battle(self, game_id: str):
        """Clean up battle state"""
        if game_id in self.active_battles:
            del self.active_battles[game_id]

# Testing
if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)

    print("Testing Battle System...")

    # Create battle system
    battle_system = BattleSystem()

    # Create test players
    players = [
        {'id': 'p1', 'name': 'Aldric', 'class_type': 'Fighter', 'level': 1},
        {'id': 'p2', 'name': 'Mira', 'class_type': 'Mage', 'level': 1}
    ]

    # Create test enemies
    enemies = [
        {'name': 'Goblin Warrior', 'type': 'goblin', 'level': 1},
        {'name': 'Goblin Archer', 'type': 'goblin', 'level': 1}
    ]

    # Start battle
    battle_state = battle_system.start_battle('test_game', players, enemies)
    print(f"Battle started: {battle_state['id']}")
    print(f"Initiative order: {battle_state['initiative_order']}")

    # Test combat action
    action = CombatAction(
        actor_id='p1',
        action_type='attack',
        target_id='enemy_0'
    )

    result = battle_system.process_action('test_game', action)
    print(f"\nAttack result: {result.message}")

    # Test ability
    ability_action = CombatAction(
        actor_id='p2',
        action_type='ability',
        ability_name='fireball'
    )

    ability_result = battle_system.process_action('test_game', ability_action)
    print(f"Ability result: {ability_result.message}")

    print("\nBattle system test complete!")