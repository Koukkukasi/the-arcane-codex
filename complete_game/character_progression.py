"""
The Arcane Codex - Character Progression System
Experience, leveling, skills, and character development
"""

import json
import math
import logging
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, field
from enum import Enum
from datetime import datetime

logger = logging.getLogger(__name__)

class SkillCategory(Enum):
    """Skill categories"""
    COMBAT = "combat"
    MAGIC = "magic"
    UTILITY = "utility"
    SOCIAL = "social"
    DIVINE = "divine"

@dataclass
class Skill:
    """Individual skill"""
    id: str
    name: str
    description: str
    category: SkillCategory
    max_level: int = 5
    current_level: int = 0
    requirements: Dict[str, int] = field(default_factory=dict)  # stat/level requirements
    effects: List[Dict] = field(default_factory=list)
    icon: str = "⭐"

@dataclass
class CharacterStats:
    """Core character statistics"""
    # Primary attributes
    strength: int = 10      # Physical power
    intelligence: int = 10  # Magical power
    dexterity: int = 10     # Speed and precision
    constitution: int = 10  # Health and stamina
    wisdom: int = 10        # Divine power
    charisma: int = 10      # Social influence

    # Derived stats (calculated)
    max_hp: int = 0
    max_mp: int = 0
    attack_power: int = 0
    magic_power: int = 0
    defense: int = 0
    speed: int = 0
    critical_chance: float = 0.05
    dodge_chance: float = 0.05

    def calculate_derived_stats(self, class_type: str, level: int):
        """Calculate derived stats from attributes"""
        # Base HP = Constitution * 5 + class bonus
        class_hp_bonus = {
            'Fighter': 20,
            'Mage': 0,
            'Thief': 10,
            'Ranger': 15,
            'Cleric': 15,
            'Bard': 10
        }
        self.max_hp = (self.constitution * 5) + class_hp_bonus.get(class_type, 10) + (level * 5)

        # Base MP = Intelligence + Wisdom + class bonus
        class_mp_bonus = {
            'Fighter': 0,
            'Mage': 20,
            'Thief': 5,
            'Ranger': 10,
            'Cleric': 15,
            'Bard': 15
        }
        self.max_mp = self.intelligence + self.wisdom + class_mp_bonus.get(class_type, 5) + (level * 2)

        # Attack power = Strength + Dexterity/2
        self.attack_power = self.strength + (self.dexterity // 2)

        # Magic power = Intelligence + Wisdom/2
        self.magic_power = self.intelligence + (self.wisdom // 2)

        # Defense = Constitution/2 + Dexterity/3
        self.defense = (self.constitution // 2) + (self.dexterity // 3)

        # Speed = Dexterity
        self.speed = self.dexterity

        # Critical chance = 5% base + Dexterity bonus
        self.critical_chance = 0.05 + (self.dexterity * 0.002)

        # Dodge chance = 5% base + Speed bonus
        self.dodge_chance = 0.05 + (self.speed * 0.003)

class CharacterClass:
    """Character class definitions with progression paths"""

    CLASSES = {
        'Fighter': {
            'name': 'Fighter',
            'description': 'Masters of martial combat',
            'primary_stat': 'strength',
            'secondary_stat': 'constitution',
            'hp_per_level': 8,
            'mp_per_level': 1,
            'skill_tree': [
                Skill(
                    id='power_attack',
                    name='Power Attack',
                    description='Deal 150% damage',
                    category=SkillCategory.COMBAT,
                    requirements={'level': 2},
                    effects=[{'damage_multiplier': 1.5}],
                    icon='💪'
                ),
                Skill(
                    id='defensive_mastery',
                    name='Defensive Mastery',
                    description='+2 defense per level',
                    category=SkillCategory.COMBAT,
                    requirements={'level': 3},
                    effects=[{'defense_bonus': 2}],
                    icon='🛡️'
                ),
                Skill(
                    id='berserker_rage',
                    name='Berserker Rage',
                    description='Double damage, half defense for 3 turns',
                    category=SkillCategory.COMBAT,
                    max_level=3,
                    requirements={'level': 5, 'strength': 15},
                    effects=[{'damage_multiplier': 2.0, 'defense_multiplier': 0.5}],
                    icon='😤'
                )
            ]
        },
        'Mage': {
            'name': 'Mage',
            'description': 'Wielders of arcane magic',
            'primary_stat': 'intelligence',
            'secondary_stat': 'wisdom',
            'hp_per_level': 4,
            'mp_per_level': 5,
            'skill_tree': [
                Skill(
                    id='elemental_affinity',
                    name='Elemental Affinity',
                    description='+20% elemental damage',
                    category=SkillCategory.MAGIC,
                    requirements={'level': 2},
                    effects=[{'elemental_damage_bonus': 0.2}],
                    icon='🔥'
                ),
                Skill(
                    id='mana_shield',
                    name='Mana Shield',
                    description='Use MP to absorb damage',
                    category=SkillCategory.MAGIC,
                    requirements={'level': 4, 'intelligence': 15},
                    effects=[{'mana_shield': True}],
                    icon='🔮'
                ),
                Skill(
                    id='arcane_explosion',
                    name='Arcane Explosion',
                    description='AOE damage to all enemies',
                    category=SkillCategory.MAGIC,
                    max_level=3,
                    requirements={'level': 6, 'intelligence': 18},
                    effects=[{'aoe_damage': True}],
                    icon='💥'
                )
            ]
        },
        'Thief': {
            'name': 'Thief',
            'description': 'Masters of stealth and precision',
            'primary_stat': 'dexterity',
            'secondary_stat': 'intelligence',
            'hp_per_level': 5,
            'mp_per_level': 2,
            'skill_tree': [
                Skill(
                    id='stealth_mastery',
                    name='Stealth Mastery',
                    description='+50% dodge chance for 1 turn',
                    category=SkillCategory.UTILITY,
                    requirements={'level': 2},
                    effects=[{'dodge_bonus': 0.5}],
                    icon='🥷'
                ),
                Skill(
                    id='poison_expert',
                    name='Poison Expert',
                    description='Attacks apply poison (2 damage/turn)',
                    category=SkillCategory.COMBAT,
                    requirements={'level': 3, 'dexterity': 14},
                    effects=[{'apply_poison': True}],
                    icon='☠️'
                ),
                Skill(
                    id='assassination',
                    name='Assassination',
                    description='Instant kill if enemy < 20% HP',
                    category=SkillCategory.COMBAT,
                    max_level=1,
                    requirements={'level': 7, 'dexterity': 20},
                    effects=[{'execute_threshold': 0.2}],
                    icon='🗡️'
                )
            ]
        },
        'Ranger': {
            'name': 'Ranger',
            'description': 'Masters of nature and archery',
            'primary_stat': 'dexterity',
            'secondary_stat': 'wisdom',
            'hp_per_level': 6,
            'mp_per_level': 3,
            'skill_tree': [
                Skill(
                    id='eagle_eye',
                    name='Eagle Eye',
                    description='+20% accuracy and critical chance',
                    category=SkillCategory.COMBAT,
                    requirements={'level': 2},
                    effects=[{'accuracy_bonus': 0.2, 'crit_bonus': 0.1}],
                    icon='🦅'
                ),
                Skill(
                    id='beast_taming',
                    name='Beast Taming',
                    description='Summon animal companion',
                    category=SkillCategory.UTILITY,
                    requirements={'level': 4, 'wisdom': 13},
                    effects=[{'summon_companion': True}],
                    icon='🐺'
                ),
                Skill(
                    id='natures_blessing',
                    name="Nature's Blessing",
                    description='Regenerate 5 HP per turn',
                    category=SkillCategory.DIVINE,
                    requirements={'level': 5, 'wisdom': 15},
                    effects=[{'regen_per_turn': 5}],
                    icon='🌿'
                )
            ]
        },
        'Cleric': {
            'name': 'Cleric',
            'description': 'Divine healers and protectors',
            'primary_stat': 'wisdom',
            'secondary_stat': 'constitution',
            'hp_per_level': 6,
            'mp_per_level': 4,
            'skill_tree': [
                Skill(
                    id='healing_aura',
                    name='Healing Aura',
                    description='Party regenerates 3 HP/turn',
                    category=SkillCategory.DIVINE,
                    requirements={'level': 2},
                    effects=[{'party_regen': 3}],
                    icon='✨'
                ),
                Skill(
                    id='divine_protection',
                    name='Divine Protection',
                    description='Party takes 20% less damage',
                    category=SkillCategory.DIVINE,
                    requirements={'level': 4, 'wisdom': 15},
                    effects=[{'damage_reduction': 0.2}],
                    icon='🙏'
                ),
                Skill(
                    id='resurrection',
                    name='Resurrection',
                    description='Revive fallen ally',
                    category=SkillCategory.DIVINE,
                    max_level=1,
                    requirements={'level': 8, 'wisdom': 20},
                    effects=[{'can_resurrect': True}],
                    icon='😇'
                )
            ]
        },
        'Bard': {
            'name': 'Bard',
            'description': 'Inspiring performers and diplomats',
            'primary_stat': 'charisma',
            'secondary_stat': 'intelligence',
            'hp_per_level': 5,
            'mp_per_level': 3,
            'skill_tree': [
                Skill(
                    id='inspiring_presence',
                    name='Inspiring Presence',
                    description='Party gains +2 to all stats',
                    category=SkillCategory.SOCIAL,
                    requirements={'level': 2},
                    effects=[{'party_stat_bonus': 2}],
                    icon='🎵'
                ),
                Skill(
                    id='silver_tongue',
                    name='Silver Tongue',
                    description='+50% gold from quests',
                    category=SkillCategory.SOCIAL,
                    requirements={'level': 3, 'charisma': 14},
                    effects=[{'gold_bonus': 0.5}],
                    icon='💰'
                ),
                Skill(
                    id='legendary_tale',
                    name='Legendary Tale',
                    description='Double XP gain for party',
                    category=SkillCategory.SOCIAL,
                    max_level=1,
                    requirements={'level': 6, 'charisma': 18},
                    effects=[{'xp_multiplier': 2.0}],
                    icon='📖'
                )
            ]
        }
    }

class CharacterProgression:
    """Character progression and leveling system"""

    def __init__(self):
        self.max_level = 20
        self.attribute_points_per_level = 3
        self.skill_points_per_level = 1

    def calculate_xp_required(self, level: int) -> int:
        """Calculate XP required for next level"""
        # Exponential curve: 100 * level^1.5
        return int(100 * math.pow(level, 1.5))

    def calculate_total_xp_for_level(self, level: int) -> int:
        """Calculate total XP needed to reach a level"""
        total = 0
        for lvl in range(1, level):
            total += self.calculate_xp_required(lvl)
        return total

    def check_level_up(self, current_xp: int, current_level: int) -> Tuple[bool, int]:
        """Check if character should level up"""
        xp_needed = self.calculate_xp_required(current_level)

        if current_xp >= xp_needed:
            levels_gained = 0
            remaining_xp = current_xp

            while remaining_xp >= self.calculate_xp_required(current_level + levels_gained):
                remaining_xp -= self.calculate_xp_required(current_level + levels_gained)
                levels_gained += 1

                if current_level + levels_gained >= self.max_level:
                    break

            return True, levels_gained

        return False, 0

    def apply_level_up(self, character: Dict, levels_gained: int = 1) -> Dict:
        """Apply level up bonuses"""
        rewards = {
            'attribute_points': levels_gained * self.attribute_points_per_level,
            'skill_points': levels_gained * self.skill_points_per_level,
            'hp_gained': 0,
            'mp_gained': 0,
            'new_skills_unlocked': []
        }

        # Get class data
        class_data = CharacterClass.CLASSES.get(character['class_type'])
        if class_data:
            # HP/MP gains
            rewards['hp_gained'] = class_data['hp_per_level'] * levels_gained
            rewards['mp_gained'] = class_data['mp_per_level'] * levels_gained

            # Check for newly unlocked skills
            new_level = character['level'] + levels_gained
            for skill in class_data['skill_tree']:
                level_req = skill.requirements.get('level', 1)
                old_level_req = level_req <= character['level']
                new_level_req = level_req <= new_level

                if not old_level_req and new_level_req:
                    rewards['new_skills_unlocked'].append(skill.name)

        return rewards

@dataclass
class Character:
    """Complete character with all progression data"""
    # Identity
    id: str
    name: str
    class_type: str

    # Progression
    level: int = 1
    experience: int = 0
    total_experience: int = 0

    # Stats
    stats: CharacterStats = field(default_factory=CharacterStats)
    unspent_attribute_points: int = 0
    unspent_skill_points: int = 0

    # Skills
    learned_skills: Dict[str, int] = field(default_factory=dict)  # skill_id -> level
    skill_cooldowns: Dict[str, int] = field(default_factory=dict)

    # Divine favor (from interrogation)
    divine_favor: Dict[str, int] = field(default_factory=dict)

    # Achievements
    achievements: List[str] = field(default_factory=list)
    titles: List[str] = field(default_factory=list)

    # Stats tracking
    monsters_killed: int = 0
    quests_completed: int = 0
    gold_earned: int = 0
    deaths: int = 0
    play_time: int = 0  # in minutes

    def add_experience(self, amount: int) -> Optional[Dict]:
        """Add experience and check for level up"""
        self.experience += amount
        self.total_experience += amount

        progression = CharacterProgression()
        should_level_up, levels_gained = progression.check_level_up(
            self.experience, self.level
        )

        if should_level_up:
            # Apply level up
            self.level += levels_gained
            self.experience = 0  # Reset current XP

            rewards = progression.apply_level_up({
                'class_type': self.class_type,
                'level': self.level - levels_gained
            }, levels_gained)

            # Apply rewards
            self.unspent_attribute_points += rewards['attribute_points']
            self.unspent_skill_points += rewards['skill_points']
            self.stats.max_hp += rewards['hp_gained']
            self.stats.max_mp += rewards['mp_gained']

            return rewards

        return None

    def spend_attribute_point(self, attribute: str) -> bool:
        """Spend an attribute point"""
        if self.unspent_attribute_points <= 0:
            return False

        if hasattr(self.stats, attribute):
            current_value = getattr(self.stats, attribute)
            setattr(self.stats, attribute, current_value + 1)
            self.unspent_attribute_points -= 1

            # Recalculate derived stats
            self.stats.calculate_derived_stats(self.class_type, self.level)
            return True

        return False

    def learn_skill(self, skill_id: str) -> bool:
        """Learn or upgrade a skill"""
        if self.unspent_skill_points <= 0:
            return False

        class_data = CharacterClass.CLASSES.get(self.class_type)
        if not class_data:
            return False

        # Find skill in class tree
        skill = None
        for s in class_data['skill_tree']:
            if s.id == skill_id:
                skill = s
                break

        if not skill:
            return False

        # Check requirements
        if skill.requirements.get('level', 0) > self.level:
            return False

        for stat, required in skill.requirements.items():
            if stat != 'level' and getattr(self.stats, stat, 0) < required:
                return False

        # Check current skill level
        current_level = self.learned_skills.get(skill_id, 0)
        if current_level >= skill.max_level:
            return False

        # Learn/upgrade skill
        self.learned_skills[skill_id] = current_level + 1
        self.unspent_skill_points -= 1
        return True

    def check_achievement(self, achievement_id: str) -> bool:
        """Check if achievement conditions are met"""
        achievements = {
            'first_blood': self.monsters_killed >= 1,
            'monster_slayer': self.monsters_killed >= 100,
            'questmaster': self.quests_completed >= 10,
            'wealthy': self.gold_earned >= 1000,
            'survivor': self.deaths == 0 and self.level >= 5,
            'dedicated': self.play_time >= 600,  # 10 hours
            'max_level': self.level >= 20,
            'divine_champion': max(self.divine_favor.values(), default=0) >= 100
        }

        if achievement_id in achievements and achievements[achievement_id]:
            if achievement_id not in self.achievements:
                self.achievements.append(achievement_id)
                return True

        return False

    def get_title(self) -> str:
        """Get character's current title"""
        if 'max_level' in self.achievements:
            return f"{self.name} the Legendary"
        elif self.level >= 15:
            return f"{self.name} the Mighty"
        elif self.level >= 10:
            return f"{self.name} the Veteran"
        elif self.level >= 5:
            return f"{self.name} the Experienced"
        else:
            return f"{self.name} the Novice"

    def serialize(self) -> Dict:
        """Serialize character for storage"""
        return {
            'id': self.id,
            'name': self.name,
            'class_type': self.class_type,
            'level': self.level,
            'experience': self.experience,
            'total_experience': self.total_experience,
            'stats': {
                'strength': self.stats.strength,
                'intelligence': self.stats.intelligence,
                'dexterity': self.stats.dexterity,
                'constitution': self.stats.constitution,
                'wisdom': self.stats.wisdom,
                'charisma': self.stats.charisma
            },
            'unspent_attribute_points': self.unspent_attribute_points,
            'unspent_skill_points': self.unspent_skill_points,
            'learned_skills': self.learned_skills,
            'divine_favor': self.divine_favor,
            'achievements': self.achievements,
            'titles': self.titles,
            'monsters_killed': self.monsters_killed,
            'quests_completed': self.quests_completed,
            'gold_earned': self.gold_earned,
            'deaths': self.deaths,
            'play_time': self.play_time
        }

# Testing
if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)

    print("Testing Character Progression...")

    # Create a character
    character = Character(
        id='test_char_1',
        name='Aldric',
        class_type='Fighter'
    )

    print(f"Created: {character.get_title()}")
    print(f"Level {character.level} {character.class_type}")

    # Calculate stats
    character.stats.calculate_derived_stats('Fighter', 1)
    print(f"HP: {character.stats.max_hp}, Attack: {character.stats.attack_power}")

    # Add experience
    print("\nGaining 150 XP...")
    rewards = character.add_experience(150)
    if rewards:
        print(f"LEVEL UP! Now level {character.level}")
        print(f"Gained: {rewards['attribute_points']} attribute points")
        print(f"Gained: {rewards['skill_points']} skill points")
        print(f"HP increased by {rewards['hp_gained']}")

    # Spend attribute point
    print("\nSpending attribute point on Strength...")
    if character.spend_attribute_point('strength'):
        print(f"Strength is now {character.stats.strength}")

    # Learn a skill
    print("\nLearning Power Attack skill...")
    if character.learn_skill('power_attack'):
        print("Power Attack learned!")

    # Check achievements
    character.monsters_killed = 1
    if character.check_achievement('first_blood'):
        print("Achievement unlocked: First Blood!")

    print(f"\nFinal title: {character.get_title()}")

    # Test XP requirements
    print("\n\nXP Requirements by Level:")
    progression = CharacterProgression()
    for level in range(1, 11):
        xp_needed = progression.calculate_xp_required(level)
        total_xp = progression.calculate_total_xp_for_level(level)
        print(f"Level {level} → {level+1}: {xp_needed} XP (Total: {total_xp})")

    print("\nCharacter progression test complete!")