"""
The Arcane Codex - Skills & Abilities System
Complete implementation of active/passive abilities with skill trees
"""

from dataclasses import dataclass, field
from typing import List, Dict, Optional, Any
import json
import time
import logging

logger = logging.getLogger(__name__)


@dataclass
class Ability:
    """
    Represents a single ability/skill that can be unlocked and ranked up
    """
    id: str
    name: str
    description: str
    type: str  # active, passive, toggle
    category: str  # combat, magic, utility, defense, restoration, mobility
    max_rank: int = 3
    current_rank: int = 0
    cost_type: str = "mana"  # mana, stamina, none
    cost: int = 10
    cooldown: float = 0.0  # seconds
    damage: Optional[int] = None
    effects: Dict[str, Any] = field(default_factory=dict)  # {stat: +value}
    requirements: Dict[str, int] = field(default_factory=dict)  # {level: 5, str: 12}
    prerequisites: List[str] = field(default_factory=list)  # ['ability_id']
    unlocked: bool = False
    tier: int = 1  # 1-5 (Foundation, Core, Advanced, Expert, Ultimate)
    icon: str = "⭐"
    lore: str = ""

    def to_dict(self):
        """Serialize ability to dictionary"""
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'type': self.type,
            'category': self.category,
            'max_rank': self.max_rank,
            'current_rank': self.current_rank,
            'cost_type': self.cost_type,
            'cost': self.cost,
            'cooldown': self.cooldown,
            'damage': self.damage,
            'effects': self.effects,
            'requirements': self.requirements,
            'prerequisites': self.prerequisites,
            'unlocked': self.unlocked,
            'tier': self.tier,
            'icon': self.icon,
            'lore': self.lore
        }

    def get_rank_scaling(self, rank: int) -> Dict[str, Any]:
        """Get scaled values for a specific rank"""
        scaling = {
            'cost': self.cost,
            'cooldown': self.cooldown,
            'damage': self.damage,
            'effects': self.effects.copy()
        }

        # Scale damage
        if self.damage:
            scaling['damage'] = int(self.damage * (1 + (rank - 1) * 0.25))

        # Scale effects
        for key, value in self.effects.items():
            if isinstance(value, (int, float)):
                scaling['effects'][key] = value * (1 + (rank - 1) * 0.2)

        return scaling


class SkillsManager:
    """
    Manages character skills, abilities, and hotkeys
    """

    def __init__(self, character):
        """
        Initialize skills manager for a character

        Args:
            character: Character object with class_type, level, skill_points
        """
        self.character = character
        self.active_cooldowns = {}  # {ability_id: timestamp when cooldown ends}
        self.skill_tree = self._init_skill_tree()
        self.hotkeys = {i: None for i in range(1, 9)}  # 1-8

        logger.info(f"SkillsManager initialized for {character.name} ({character.class_type})")

    def unlock_ability(self, ability_id: str) -> dict:
        """
        Unlock an ability (first rank)

        Returns:
            dict: {'success': bool, 'ability': dict, 'error': str}
        """
        ability = self.get_ability(ability_id)
        if not ability:
            return {'success': False, 'error': 'Ability not found'}

        if ability.unlocked:
            return {'success': False, 'error': 'Ability already unlocked'}

        # Check requirements
        if not self._check_requirements(ability):
            return {'success': False, 'error': 'Requirements not met'}

        # Check prerequisites
        if not self._check_prerequisites(ability):
            return {'success': False, 'error': 'Prerequisites not completed'}

        # Check skill points
        if self.character.skill_points < 1:
            return {'success': False, 'error': 'Not enough skill points'}

        # Unlock
        ability.unlocked = True
        ability.current_rank = 1
        self.character.skill_points -= 1

        # Apply passive effects
        if ability.type == 'passive':
            self._apply_passive_effects(ability)

        logger.info(f"{self.character.name} unlocked {ability.name}")

        return {
            'success': True,
            'ability': ability.to_dict(),
            'remaining_skill_points': self.character.skill_points
        }

    def rank_up_ability(self, ability_id: str) -> dict:
        """
        Increase ability rank by 1

        Returns:
            dict: {'success': bool, 'ability': dict, 'error': str}
        """
        ability = self.get_ability(ability_id)
        if not ability or not ability.unlocked:
            return {'success': False, 'error': 'Ability not unlocked'}

        if ability.current_rank >= ability.max_rank:
            return {'success': False, 'error': 'Already max rank'}

        if self.character.skill_points < 1:
            return {'success': False, 'error': 'Not enough skill points'}

        ability.current_rank += 1
        self.character.skill_points -= 1

        # Re-apply passive effects with new rank
        if ability.type == 'passive':
            self._apply_passive_effects(ability)

        logger.info(f"{self.character.name} ranked up {ability.name} to rank {ability.current_rank}")

        return {
            'success': True,
            'ability': ability.to_dict(),
            'remaining_skill_points': self.character.skill_points
        }

    def assign_to_hotkey(self, ability_id: str, hotkey: int) -> dict:
        """
        Assign ability to hotkey 1-8

        Returns:
            dict: {'success': bool, 'hotkey': int, 'ability': dict, 'error': str}
        """
        if hotkey not in range(1, 9):
            return {'success': False, 'error': 'Invalid hotkey (1-8)'}

        ability = self.get_ability(ability_id)
        if not ability or not ability.unlocked:
            return {'success': False, 'error': 'Ability not unlocked'}

        if ability.type != 'active':
            return {'success': False, 'error': 'Only active abilities can be assigned'}

        self.hotkeys[hotkey] = ability_id

        logger.info(f"{self.character.name} assigned {ability.name} to hotkey {hotkey}")

        return {
            'success': True,
            'hotkey': hotkey,
            'ability': ability.to_dict()
        }

    def use_ability(self, ability_id: str, target=None) -> dict:
        """
        Use an active ability

        Returns:
            dict: {'success': bool, 'ability': dict, 'result': dict, 'error': str}
        """
        ability = self.get_ability(ability_id)
        if not ability or not ability.unlocked:
            return {'success': False, 'error': 'Ability not unlocked'}

        if ability.type != 'active':
            return {'success': False, 'error': 'Cannot use passive abilities'}

        # Check cooldown
        if self._is_on_cooldown(ability_id):
            remaining = self._get_cooldown_remaining(ability_id)
            return {'success': False, 'error': f'Ability on cooldown ({remaining:.1f}s remaining)'}

        # Check cost
        if not self._can_afford(ability):
            return {'success': False, 'error': f'Not enough {ability.cost_type}'}

        # Use ability
        self._pay_cost(ability)
        self._set_cooldown(ability_id, ability.cooldown)
        result = self._execute_ability(ability, target)

        logger.info(f"{self.character.name} used {ability.name}")

        return {
            'success': True,
            'ability': ability.to_dict(),
            'result': result,
            'cooldowns': self.get_active_cooldowns()
        }

    def get_skill_tree_data(self) -> dict:
        """
        Get complete skill tree data

        Returns:
            dict: Complete skill tree with abilities, points, hotkeys
        """
        return {
            'abilities': [a.to_dict() for a in self.skill_tree.values()],
            'skill_points': self.character.skill_points,
            'hotkeys': self.hotkeys,
            'active_cooldowns': self.get_active_cooldowns()
        }

    def get_ability(self, ability_id: str) -> Optional[Ability]:
        """Get ability by ID"""
        return self.skill_tree.get(ability_id)

    def get_active_cooldowns(self) -> Dict[str, float]:
        """
        Get active cooldowns with remaining time

        Returns:
            dict: {ability_id: seconds_remaining}
        """
        current_time = time.time()
        active = {}

        for ability_id, end_time in self.active_cooldowns.items():
            remaining = end_time - current_time
            if remaining > 0:
                active[ability_id] = remaining

        return active

    def update_cooldowns(self):
        """Remove expired cooldowns"""
        current_time = time.time()
        expired = [aid for aid, end_time in self.active_cooldowns.items() if end_time <= current_time]
        for aid in expired:
            del self.active_cooldowns[aid]

    def _check_requirements(self, ability: Ability) -> bool:
        """Check if character meets ability requirements"""
        for req, value in ability.requirements.items():
            if req == 'level':
                if self.character.level < value:
                    return False
            elif hasattr(self.character, req):
                if getattr(self.character, req) < value:
                    return False
        return True

    def _check_prerequisites(self, ability: Ability) -> bool:
        """Check if prerequisite abilities are learned"""
        for prereq_id in ability.prerequisites:
            prereq = self.get_ability(prereq_id)
            if not prereq or not prereq.unlocked:
                return False
        return True

    def _is_on_cooldown(self, ability_id: str) -> bool:
        """Check if ability is on cooldown"""
        if ability_id not in self.active_cooldowns:
            return False
        return self.active_cooldowns[ability_id] > time.time()

    def _get_cooldown_remaining(self, ability_id: str) -> float:
        """Get remaining cooldown time in seconds"""
        if ability_id not in self.active_cooldowns:
            return 0.0
        remaining = self.active_cooldowns[ability_id] - time.time()
        return max(0.0, remaining)

    def _set_cooldown(self, ability_id: str, duration: float):
        """Set ability cooldown"""
        if duration > 0:
            self.active_cooldowns[ability_id] = time.time() + duration

    def _can_afford(self, ability: Ability) -> bool:
        """Check if character can afford ability cost"""
        if ability.cost_type == 'none':
            return True

        if ability.cost_type == 'mana':
            return getattr(self.character, 'mp', 0) >= ability.cost
        elif ability.cost_type == 'stamina':
            return getattr(self.character, 'stamina', 100) >= ability.cost

        return True

    def _pay_cost(self, ability: Ability):
        """Deduct ability cost from character resources"""
        if ability.cost_type == 'mana' and hasattr(self.character, 'mp'):
            self.character.mp -= ability.cost
        elif ability.cost_type == 'stamina' and hasattr(self.character, 'stamina'):
            self.character.stamina -= ability.cost

    def _execute_ability(self, ability: Ability, target=None) -> dict:
        """
        Execute ability effects

        Returns:
            dict: Result of ability execution
        """
        result = {
            'ability_name': ability.name,
            'rank': ability.current_rank,
            'effects_applied': []
        }

        # Get scaled values for current rank
        scaling = ability.get_rank_scaling(ability.current_rank)

        # Apply damage
        if scaling['damage']:
            result['damage'] = scaling['damage']
            result['effects_applied'].append(f"Dealt {scaling['damage']} damage")

        # Apply effects
        for effect_name, effect_value in scaling['effects'].items():
            result['effects_applied'].append(f"{effect_name}: {effect_value}")

        return result

    def _apply_passive_effects(self, ability: Ability):
        """Apply passive ability effects to character"""
        scaling = ability.get_rank_scaling(ability.current_rank)

        for effect_name, effect_value in scaling['effects'].items():
            if hasattr(self.character, effect_name):
                current = getattr(self.character, effect_name)
                setattr(self.character, effect_name, current + effect_value)
                logger.info(f"Applied passive: {effect_name} +{effect_value}")

    def _init_skill_tree(self) -> Dict[str, Ability]:
        """
        Initialize skill tree based on character class

        Returns:
            dict: {ability_id: Ability}
        """
        tree = {}

        class_type = self.character.class_type

        if class_type == "Fighter":
            tree.update(self._get_fighter_skills())
        elif class_type == "Mage":
            tree.update(self._get_mage_skills())
        elif class_type == "Thief":
            tree.update(self._get_thief_skills())
        elif class_type == "Ranger":
            tree.update(self._get_ranger_skills())
        elif class_type == "Cleric":
            tree.update(self._get_cleric_skills())
        elif class_type == "Bard":
            tree.update(self._get_bard_skills())

        return tree

    # ========================================================================
    # CLASS-SPECIFIC SKILL TREES
    # ========================================================================

    def _get_fighter_skills(self) -> Dict[str, Ability]:
        """Fighter skill tree - melee combat specialists"""
        return {
            # Tier 1: Foundation
            'basic_combat': Ability(
                id='basic_combat',
                name='Basic Combat',
                description='Master the fundamentals of combat',
                type='passive',
                category='combat',
                max_rank=5,
                cost_type='none',
                effects={'attack_power': 5, 'critical_chance': 0.02},
                tier=1,
                icon='⚔️',
                lore='Every master was once a student. Every legend began with a single strike.'
            ),

            # Tier 2: Core
            'power_attack': Ability(
                id='power_attack',
                name='Power Attack',
                description='A devastating strike dealing 150% damage',
                type='active',
                category='combat',
                max_rank=3,
                cost_type='stamina',
                cost=15,
                cooldown=8.0,
                damage=150,
                requirements={'level': 3},
                prerequisites=['basic_combat'],
                tier=2,
                icon='💥',
                lore='Strike with the force of a falling star.'
            ),

            'shield_bash': Ability(
                id='shield_bash',
                name='Shield Bash',
                description='Stun enemy for 2 seconds',
                type='active',
                category='combat',
                max_rank=3,
                cost_type='stamina',
                cost=10,
                cooldown=12.0,
                damage=80,
                effects={'stun_duration': 2.0},
                requirements={'level': 3},
                prerequisites=['basic_combat'],
                tier=2,
                icon='🛡️',
                lore='The shield is not just for defense.'
            ),

            'weapon_mastery': Ability(
                id='weapon_mastery',
                name='Weapon Mastery',
                description='+20% weapon damage',
                type='passive',
                category='combat',
                max_rank=5,
                cost_type='none',
                effects={'damage_multiplier': 0.20},
                requirements={'level': 5},
                prerequisites=['basic_combat'],
                tier=2,
                icon='🗡️',
                lore='Your weapon becomes an extension of your body.'
            ),

            # Tier 3: Advanced
            'whirlwind': Ability(
                id='whirlwind',
                name='Whirlwind',
                description='AOE attack hitting all nearby enemies',
                type='active',
                category='combat',
                max_rank=3,
                cost_type='stamina',
                cost=25,
                cooldown=15.0,
                damage=120,
                effects={'aoe_radius': 5},
                requirements={'level': 8},
                prerequisites=['power_attack'],
                tier=3,
                icon='🌪️',
                lore='Become a storm of steel and fury.'
            ),

            'defensive_stance': Ability(
                id='defensive_stance',
                name='Defensive Stance',
                description='+50% defense, -30% attack speed',
                type='toggle',
                category='defense',
                max_rank=3,
                cost_type='stamina',
                cost=5,
                effects={'defense_multiplier': 0.50, 'attack_speed_multiplier': -0.30},
                requirements={'level': 7},
                prerequisites=['shield_bash'],
                tier=3,
                icon='🛡️',
                lore='An impenetrable fortress.'
            ),

            # Tier 4: Expert
            'berserker_rage': Ability(
                id='berserker_rage',
                name='Berserker Rage',
                description='Double damage, half defense for 10 seconds',
                type='active',
                category='combat',
                max_rank=3,
                cost_type='stamina',
                cost=40,
                cooldown=30.0,
                effects={'damage_multiplier': 2.0, 'defense_multiplier': 0.5, 'duration': 10},
                requirements={'level': 12, 'strength': 18},
                prerequisites=['power_attack', 'weapon_mastery'],
                tier=4,
                icon='😤',
                lore='Embrace the fury. Become unstoppable.'
            ),

            # Tier 5: Ultimate
            'battle_trance': Ability(
                id='battle_trance',
                name='Battle Trance',
                description='Ultimate combat form: +100% damage, immune to stun',
                type='active',
                category='combat',
                max_rank=1,
                cost_type='stamina',
                cost=50,
                cooldown=60.0,
                effects={'damage_multiplier': 1.0, 'stun_immune': True, 'duration': 15},
                requirements={'level': 20, 'strength': 25},
                prerequisites=['berserker_rage'],
                tier=5,
                icon='⚡',
                lore='The pinnacle of martial prowess. You are war incarnate.'
            )
        }

    def _get_mage_skills(self) -> Dict[str, Ability]:
        """Mage skill tree - arcane magic specialists"""
        return {
            # Tier 1: Foundation
            'arcane_fundamentals': Ability(
                id='arcane_fundamentals',
                name='Arcane Fundamentals',
                description='Master the basics of spellcasting',
                type='passive',
                category='magic',
                max_rank=5,
                cost_type='none',
                effects={'magic_power': 5, 'max_mp': 10},
                tier=1,
                icon='🔮',
                lore='The first step into a world of limitless power.'
            ),

            # Tier 2: Core
            'fireball': Ability(
                id='fireball',
                name='Fireball',
                description='Launch a blazing sphere of fire',
                type='active',
                category='magic',
                max_rank=5,
                cost_type='mana',
                cost=50,
                cooldown=8.0,
                damage=250,
                effects={'element': 'fire', 'splash_radius': 5},
                requirements={'level': 3},
                prerequisites=['arcane_fundamentals'],
                tier=2,
                icon='🔥',
                lore='Fire is the primal element of destruction.'
            ),

            'lightning_bolt': Ability(
                id='lightning_bolt',
                name='Lightning Bolt',
                description='Strike with electrical fury',
                type='active',
                category='magic',
                max_rank=5,
                cost_type='mana',
                cost=40,
                cooldown=6.0,
                damage=180,
                effects={'element': 'lightning', 'chain_targets': 2},
                requirements={'level': 3},
                prerequisites=['arcane_fundamentals'],
                tier=2,
                icon='⚡',
                lore='The speed of thought, the power of the storm.'
            ),

            'mana_shield': Ability(
                id='mana_shield',
                name='Mana Shield',
                description='Use MP to absorb damage',
                type='passive',
                category='magic',
                max_rank=3,
                cost_type='none',
                effects={'damage_to_mana': 0.5},
                requirements={'level': 5},
                prerequisites=['arcane_fundamentals'],
                tier=2,
                icon='💠',
                lore='Your mana becomes armor.'
            ),

            # Tier 3: Advanced
            'spell_weaving': Ability(
                id='spell_weaving',
                name='Spell Weaving',
                description='Cast 2 spells in quick succession',
                type='passive',
                category='magic',
                max_rank=3,
                cost_type='none',
                effects={'double_cast_chance': 0.25},
                requirements={'level': 8},
                prerequisites=['fireball', 'lightning_bolt'],
                tier=3,
                icon='✨',
                lore='Weave the threads of reality itself.'
            ),

            'ice_wall': Ability(
                id='ice_wall',
                name='Ice Wall',
                description='Create a wall of ice blocking enemies',
                type='active',
                category='utility',
                max_rank=3,
                cost_type='mana',
                cost=60,
                cooldown=20.0,
                effects={'duration': 10, 'wall_hp': 500},
                requirements={'level': 7},
                prerequisites=['arcane_fundamentals'],
                tier=3,
                icon='🧊',
                lore='Freeze space itself.'
            ),

            # Tier 4: Expert
            'arcane_explosion': Ability(
                id='arcane_explosion',
                name='Arcane Explosion',
                description='Massive AOE damage to all enemies',
                type='active',
                category='magic',
                max_rank=3,
                cost_type='mana',
                cost=80,
                cooldown=25.0,
                damage=300,
                effects={'aoe_radius': 10},
                requirements={'level': 12, 'intelligence': 20},
                prerequisites=['spell_weaving'],
                tier=4,
                icon='💥',
                lore='Unleash pure magical devastation.'
            ),

            # Tier 5: Ultimate
            'meteor_strike': Ability(
                id='meteor_strike',
                name='Meteor Strike',
                description='Call down a meteor from the heavens',
                type='active',
                category='magic',
                max_rank=1,
                cost_type='mana',
                cost=100,
                cooldown=60.0,
                damage=800,
                effects={'aoe_radius': 15, 'stun_duration': 3},
                requirements={'level': 20, 'intelligence': 25},
                prerequisites=['arcane_explosion', 'fireball'],
                tier=5,
                icon='☄️',
                lore='Bring the wrath of the cosmos upon your foes.'
            )
        }

    def _get_thief_skills(self) -> Dict[str, Ability]:
        """Thief skill tree - stealth and precision"""
        return {
            'stealth_basics': Ability(
                id='stealth_basics',
                name='Stealth Basics',
                description='Learn to move unseen',
                type='passive',
                category='utility',
                max_rank=5,
                cost_type='none',
                effects={'stealth_bonus': 10, 'dodge_chance': 0.05},
                tier=1,
                icon='🥷'
            ),
            'backstab': Ability(
                id='backstab',
                name='Backstab',
                description='Strike from behind for massive damage',
                type='active',
                category='combat',
                max_rank=5,
                cost_type='stamina',
                cost=20,
                cooldown=10.0,
                damage=300,
                requirements={'level': 3},
                prerequisites=['stealth_basics'],
                tier=2,
                icon='🗡️'
            ),
            'poison_blade': Ability(
                id='poison_blade',
                name='Poison Blade',
                description='Attacks apply poison damage over time',
                type='passive',
                category='combat',
                max_rank=3,
                cost_type='none',
                effects={'poison_damage_per_turn': 15, 'duration': 4},
                requirements={'level': 5},
                prerequisites=['backstab'],
                tier=2,
                icon='☠️'
            )
        }

    def _get_ranger_skills(self) -> Dict[str, Ability]:
        """Ranger skill tree - nature and archery"""
        return {
            'hunters_mark': Ability(
                id='hunters_mark',
                name="Hunter's Mark",
                description='Mark target for +50% damage',
                type='active',
                category='combat',
                max_rank=3,
                cost_type='stamina',
                cost=15,
                cooldown=15.0,
                effects={'damage_bonus': 0.5, 'duration': 10},
                tier=1,
                icon='🎯'
            ),
            'rapid_fire': Ability(
                id='rapid_fire',
                name='Rapid Fire',
                description='Fire 5 arrows in rapid succession',
                type='active',
                category='combat',
                max_rank=3,
                cost_type='stamina',
                cost=25,
                cooldown=12.0,
                damage=100,
                effects={'arrow_count': 5},
                requirements={'level': 5},
                tier=2,
                icon='🏹'
            ),
            'beast_companion': Ability(
                id='beast_companion',
                name='Beast Companion',
                description='Summon a wolf companion',
                type='active',
                category='utility',
                max_rank=3,
                cost_type='mana',
                cost=40,
                cooldown=30.0,
                effects={'companion_hp': 200, 'companion_damage': 50},
                requirements={'level': 8},
                tier=3,
                icon='🐺'
            )
        }

    def _get_cleric_skills(self) -> Dict[str, Ability]:
        """Cleric skill tree - divine healing and protection"""
        return {
            'divine_basics': Ability(
                id='divine_basics',
                name='Divine Basics',
                description='Channel the power of the gods',
                type='passive',
                category='magic',
                max_rank=5,
                cost_type='none',
                effects={'healing_power': 5, 'max_mp': 10},
                tier=1,
                icon='✨'
            ),
            'heal': Ability(
                id='heal',
                name='Healing Light',
                description='Restore health to yourself or ally',
                type='active',
                category='restoration',
                max_rank=5,
                cost_type='mana',
                cost=60,
                cooldown=10.0,
                effects={'heal_amount': 150},
                requirements={'level': 2},
                prerequisites=['divine_basics'],
                tier=1,
                icon='💚'
            ),
            'divine_protection': Ability(
                id='divine_protection',
                name='Divine Protection',
                description='Reduce damage taken by 30%',
                type='active',
                category='defense',
                max_rank=3,
                cost_type='mana',
                cost=40,
                cooldown=20.0,
                effects={'damage_reduction': 0.3, 'duration': 8},
                requirements={'level': 5},
                prerequisites=['heal'],
                tier=2,
                icon='🙏'
            ),
            'resurrection': Ability(
                id='resurrection',
                name='Resurrection',
                description='Revive a fallen ally',
                type='active',
                category='restoration',
                max_rank=1,
                cost_type='mana',
                cost=100,
                cooldown=120.0,
                effects={'revive_hp_percent': 0.5},
                requirements={'level': 15, 'wisdom': 20},
                prerequisites=['heal', 'divine_protection'],
                tier=5,
                icon='😇'
            )
        }

    def _get_bard_skills(self) -> Dict[str, Ability]:
        """Bard skill tree - inspiration and support"""
        return {
            'inspiring_presence': Ability(
                id='inspiring_presence',
                name='Inspiring Presence',
                description='Party gains +10% to all stats',
                type='passive',
                category='utility',
                max_rank=5,
                cost_type='none',
                effects={'party_stat_bonus': 0.10},
                tier=1,
                icon='🎵'
            ),
            'battle_song': Ability(
                id='battle_song',
                name='Battle Song',
                description='Boost party attack power by 30%',
                type='active',
                category='utility',
                max_rank=3,
                cost_type='mana',
                cost=50,
                cooldown=20.0,
                effects={'attack_bonus': 0.3, 'duration': 12},
                requirements={'level': 5},
                prerequisites=['inspiring_presence'],
                tier=2,
                icon='⚔️'
            ),
            'healing_melody': Ability(
                id='healing_melody',
                name='Healing Melody',
                description='Party regenerates 10 HP per second',
                type='active',
                category='restoration',
                max_rank=3,
                cost_type='mana',
                cost=40,
                cooldown=25.0,
                effects={'regen_per_second': 10, 'duration': 8},
                requirements={'level': 7},
                prerequisites=['inspiring_presence'],
                tier=2,
                icon='🎶'
            )
        }


# Testing
if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)

    # Mock character for testing
    @dataclass
    class MockCharacter:
        name: str = "Test Hero"
        class_type: str = "Fighter"
        level: int = 5
        skill_points: int = 10
        mp: int = 100
        stamina: int = 100

    print("Testing SkillsManager...")
    char = MockCharacter()
    manager = SkillsManager(char)

    print(f"\n{char.name} - Level {char.level} {char.class_type}")
    print(f"Skill Points: {char.skill_points}")
    print(f"Abilities in tree: {len(manager.skill_tree)}")

    # Test unlocking
    print("\n--- Unlocking Basic Combat ---")
    result = manager.unlock_ability('basic_combat')
    print(f"Success: {result['success']}")
    if result['success']:
        print(f"Remaining points: {result['remaining_skill_points']}")

    # Test ranking up
    print("\n--- Ranking Up Basic Combat ---")
    result = manager.rank_up_ability('basic_combat')
    print(f"Success: {result['success']}")
    if result['success']:
        print(f"Current rank: {result['ability']['current_rank']}")

    # Test hotkey assignment
    print("\n--- Unlocking Power Attack ---")
    manager.unlock_ability('power_attack')

    print("\n--- Assigning Power Attack to Hotkey 1 ---")
    result = manager.assign_to_hotkey('power_attack', 1)
    print(f"Success: {result['success']}")

    # Test using ability
    print("\n--- Using Power Attack ---")
    result = manager.use_ability('power_attack')
    print(f"Success: {result['success']}")
    if result['success']:
        print(f"Result: {result['result']}")
        print(f"Stamina remaining: {char.stamina}")

    # Test cooldown
    print("\n--- Trying to use Power Attack again (should be on cooldown) ---")
    result = manager.use_ability('power_attack')
    print(f"Success: {result['success']}")
    print(f"Error: {result.get('error', 'None')}")

    # Get full tree data
    print("\n--- Skill Tree Data ---")
    tree_data = manager.get_skill_tree_data()
    print(f"Total abilities: {len(tree_data['abilities'])}")
    print(f"Unlocked: {sum(1 for a in tree_data['abilities'] if a['unlocked'])}")
    print(f"Hotkeys assigned: {sum(1 for h in tree_data['hotkeys'].values() if h)}")

    print("\nSkillsManager test complete!")
