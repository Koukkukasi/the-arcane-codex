"""
The Arcane Codex - ULTIMATE ASCII Integration
Puts the FLASHIEST, most DYNAMIC art in exactly the right places!
"""

import time
import random
from typing import Dict, List, Optional
from ascii_agent import ASCIIArtAgent
from ascii_showcase import ASCIIShowcase
import ascii_art

class UltimateASCIIIntegration:
    """
    Integrates all three ASCII systems for MAXIMUM IMPACT!
    """

    def __init__(self):
        self.agent = ASCIIArtAgent()
        self.showcase = ASCIIShowcase()
        self.current_animations = {}

    # ==================== BATTLE SCENES ====================
    def epic_battle_intro(self, enemy_type: str, enemy_level: int):
        """ANIMATED entrance for battles - SUPER FLASHY!"""

        # First - dramatic enemy reveal animation
        if enemy_type.lower() == "dragon":
            frames = self.showcase.epic_dragon_animation()
            return {
                'type': 'animated',
                'frames': frames,
                'delay': 0.3,
                'sound': 'dragon_roar.mp3'
            }

        # Generate dynamic monster based on difficulty
        monster_art = self.agent.generate_monster(enemy_type, enemy_level)

        # Add dramatic reveal effect
        reveal_frames = [
            f"""
╔══════════════════════════════════════════════════════════════╗
║                    ⚠️ DANGER APPROACHES! ⚠️                  ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║                         ???                                 ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
            """,
            f"""
╔══════════════════════════════════════════════════════════════╗
║                    ⚔️ ENEMY REVEALED! ⚔️                    ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
{monster_art}
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
            """
        ]

        return {
            'type': 'animated',
            'frames': reveal_frames,
            'delay': 0.5
        }

    def dynamic_battle_scene(self, player_data: Dict, enemy_data: Dict,
                            action: Optional[str] = None):
        """DYNAMIC battle that updates with EVERY action!"""

        # Real-time health bars that change!
        scene = self.agent.generate_dynamic_battle_scene(
            player_data['hp'], player_data['max_hp'],
            enemy_data['hp'], enemy_data['max_hp'],
            enemy_data['name']
        )

        # Add spell effects if action was taken
        if action:
            spell_effect = self.agent.generate_spell_effect(action)
            scene = self._merge_spell_into_scene(scene, spell_effect)

        return {
            'type': 'dynamic',
            'content': scene,
            'updates_realtime': True
        }

    # ==================== LEVEL UP CELEBRATION ====================
    def legendary_level_up(self, character_class: str, new_level: int,
                          stats_gained: Dict):
        """THE MOST EPIC LEVEL UP ANIMATION EVER!"""

        frames = []

        # Frame 1 - Power gathering
        frames.append(f"""
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║                    ✨ POWER SURGES! ✨                      ║
║                                                              ║
║                         · · ·                               ║
║                       · · @ · ·                             ║
║                         · · ·                               ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
        """)

        # Frame 2 - Energy explosion
        frames.append(f"""
╔══════════════════════════════════════════════════════════════╗
║               💫 ✨ ⭐ 🌟 ⚡ 🌟 ⭐ ✨ 💫               ║
║                                                              ║
║                    🎆 LEVEL {new_level}! 🎆                 ║
║                                                              ║
║               💫 ✨ ⭐ 🌟 ⚡ 🌟 ⭐ ✨ 💫               ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
        """)

        # Frame 3 - New portrait reveal
        new_portrait = self.agent.generate_character_portrait(character_class, new_level)
        frames.append(f"""
╔══════════════════════════════════════════════════════════════╗
║                 🌟 EVOLUTION COMPLETE! 🌟                   ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
{new_portrait}
║                                                              ║
║  HP: +{stats_gained.get('hp', 0):3}  MP: +{stats_gained.get('mp', 0):3}  STR: +{stats_gained.get('str', 0):3}  DEF: +{stats_gained.get('def', 0):3}  ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
        """)

        # Frame 4 - Skill tree update
        frames.append(self.agent.generate_skill_tree(
            character_class,
            stats_gained.get('new_skills', [])
        ))

        return {
            'type': 'animated_sequence',
            'frames': frames,
            'delays': [0.5, 1.0, 1.5, 2.0],
            'epic': True
        }

    # ==================== LOCATION TRANSITIONS ====================
    def dramatic_location_entry(self, location: str, first_time: bool = False):
        """ANIMATED location reveals with weather effects!"""

        if first_time:
            # Extra dramatic first-time reveal
            weather = random.choice(['storm', 'fog', 'clear', 'night'])

            frames = []

            # Approach animation
            frames.append(f"""
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║                  Approaching {location.upper()}...          ║
║                                                              ║
║                         ...                                 ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
            """)

            # Dramatic reveal
            frames.append(self.agent.generate_location_banner(location, weather))

            return {
                'type': 'animated',
                'frames': frames,
                'delay': 1.0
            }
        else:
            # Quick dynamic generation
            return {
                'type': 'dynamic',
                'content': self.agent.generate_location_banner(location, 'clear')
            }

    # ==================== TREASURE & LOOT ====================
    def epic_treasure_discovery(self, rarity: str, contents: List[str]):
        """ANIMATED treasure chest opening!"""

        frames = []

        # Chest appears
        frames.append("""
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║                    You discovered a chest!                   ║
║                                                              ║
║                         ┌─────┐                             ║
║                         │ ??? │                             ║
║                         └─────┘                             ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
        """)

        # Chest glows
        frames.append(f"""
╔══════════════════════════════════════════════════════════════╗
║                    ✨ ✨ ✨ ✨ ✨                          ║
║                                                              ║
║                 The chest begins to glow!                    ║
║                                                              ║
{self.agent.generate_treasure_chest(rarity)}
║                                                              ║
║                    ✨ ✨ ✨ ✨ ✨                          ║
╚══════════════════════════════════════════════════════════════╝
        """)

        # Contents revealed
        loot_display = "\n".join([f"  • {item}" for item in contents[:5]])
        frames.append(f"""
╔══════════════════════════════════════════════════════════════╗
║                  🎉 TREASURE OBTAINED! 🎉                   ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  You found:                                                 ║
{loot_display}
║                                                              ║
║              Press any key to continue...                    ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
        """)

        return {
            'type': 'animated',
            'frames': frames,
            'delays': [0.5, 1.0, 2.0]
        }

    # ==================== QUEST SYSTEM ====================
    def dramatic_quest_reveal(self, quest_name: str, quest_description: str,
                             difficulty: int, reward: str):
        """DYNAMIC quest scroll with dramatic reveal!"""

        # First show mysterious scroll
        intro = """
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║              A mysterious scroll unfurls...                  ║
║                         📜                                  ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
        """

        # Then reveal the quest with dynamic content
        quest_scroll = self.agent.generate_quest_scroll(
            quest_name, quest_description, reward, difficulty
        )

        return {
            'type': 'animated',
            'frames': [intro, quest_scroll],
            'delay': 1.0
        }

    # ==================== VICTORY & DEFEAT ====================
    def ultimate_victory_sequence(self, battle_stats: Dict):
        """THE MOST EPIC VICTORY ANIMATION!"""

        frames = []

        # Enemy defeat
        frames.append("""
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║                    The enemy falls!                          ║
║                         💀                                  ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
        """)

        # Victory explosion
        frames.append("""
╔══════════════════════════════════════════════════════════════╗
║  🎆 🎆 🎆 🎆 🎆 🎆 🎆 🎆 🎆 🎆 🎆 🎆 🎆 🎆 🎆 🎆        ║
║                                                              ║
║                    ⚔️ VICTORY! ⚔️                           ║
║                                                              ║
║  🎆 🎆 🎆 🎆 🎆 🎆 🎆 🎆 🎆 🎆 🎆 🎆 🎆 🎆 🎆 🎆        ║
╚══════════════════════════════════════════════════════════════╝
        """)

        # Stats and rewards
        frames.append(f"""
╔══════════════════════════════════════════════════════════════╗
║                   🏆 BATTLE COMPLETE! 🏆                    ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  Experience Gained: {battle_stats.get('exp', 0):5} XP                       ║
║  Gold Earned:       {battle_stats.get('gold', 0):5} 💰                      ║
║  Items Found:       {battle_stats.get('items', 'None'):20}          ║
║                                                              ║
║  Performance Rating: {self._get_performance_stars(battle_stats)}              ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
        """)

        return {
            'type': 'animated',
            'frames': frames,
            'delays': [0.5, 1.0, 2.0],
            'epic': True
        }

    def dramatic_defeat_sequence(self):
        """Even defeat looks epic!"""

        frames = []

        # Falling animation
        frames.append("""
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║                      You stumble...                          ║
║                         o                                    ║
║                        /|\\                                   ║
║                        / \\                                   ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
        """)

        frames.append("""
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║                                                              ║
║                      You fall...                             ║
║                        ___                                   ║
║                       o___\\                                  ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
        """)

        frames.append(ascii_art.GAME_OVER)

        return {
            'type': 'animated',
            'frames': frames,
            'delays': [0.5, 0.5, 2.0]
        }

    # ==================== SPECIAL EFFECTS ====================
    def spell_casting_animation(self, spell_name: str, caster_class: str):
        """ANIMATED spell casting with class-specific flair!"""

        # Generate spell effect
        spell_effect = self.agent.generate_spell_effect(spell_name)

        # Add casting animation based on class
        if caster_class.lower() == "mage":
            casting_frames = [
                "Gathering arcane energy... 🔮",
                "Weaving the spell... ✨🔮✨",
                "CASTING! 💥🔮💥"
            ]
        elif caster_class.lower() == "paladin":
            casting_frames = [
                "Invoking divine power... ✝️",
                "Channeling holy light... ✨✝️✨",
                "SMITE! ⚡✝️⚡"
            ]
        else:
            casting_frames = [
                "Preparing ability...",
                "Focusing power...",
                "EXECUTE!"
            ]

        full_frames = []
        for text in casting_frames:
            full_frames.append(f"""
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║                    {text:^42}                    ║
║                                                              ║
{spell_effect}
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
            """)

        return {
            'type': 'animated',
            'frames': full_frames,
            'delays': [0.3, 0.3, 0.5]
        }

    def critical_hit_effect(self):
        """FLASHY critical hit animation!"""

        return {
            'type': 'instant',
            'content': """
    💥💥💥 CRITICAL HIT! 💥💥💥
           2x DAMAGE!
            """
        }

    # ==================== BOSS ENCOUNTERS ====================
    def legendary_boss_entrance(self, boss_name: str, boss_title: str):
        """THE MOST EPIC BOSS ENTRANCE EVER!"""

        frames = []

        # Ominous approach
        frames.append("""
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║           The ground trembles...                             ║
║                                                              ║
║           Something powerful approaches...                   ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
        """)

        # Screen shakes (simulated with text)
        frames.append("""
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║     T H E   G R O U N D   S H A K E S ! !              ║
║                                                         ║
║         E A R T H Q U A K E ! !                      ║
║                                                     ║
╚═════════════════════════════════════════════════════╝
        """)

        # Boss reveal
        frames.append(f"""
╔══════════════════════════════════════════════════════════════╗
║                  ⚠️ ⚠️ BOSS BATTLE ⚠️ ⚠️                   ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║                    {boss_name.upper():^30}                  ║
║                    {boss_title:^30}                         ║
║                                                              ║
║                         👹                                  ║
║                        ╱█╲                                  ║
║                       ╱███╲                                 ║
║                      ▐█████▌                                ║
║                      ███████                                ║
║                     ╱███████╲                               ║
║                    ╱█████████╲                              ║
║                                                              ║
║              "PREPARE TO MEET YOUR DOOM!"                    ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
        """)

        return {
            'type': 'animated',
            'frames': frames,
            'delays': [1.0, 0.5, 2.0],
            'epic': True,
            'shake_screen': True
        }

    # ==================== HELPER METHODS ====================
    def _merge_spell_into_scene(self, scene: str, spell: str) -> str:
        """Merges spell effect into battle scene"""
        # Implementation to overlay spell graphics
        return scene  # Simplified for now

    def _get_performance_stars(self, stats: Dict) -> str:
        """Generate performance rating stars"""
        score = stats.get('performance', 50)
        if score >= 90:
            return "⭐⭐⭐⭐⭐ PERFECT!"
        elif score >= 70:
            return "⭐⭐⭐⭐ EXCELLENT!"
        elif score >= 50:
            return "⭐⭐⭐ GOOD!"
        else:
            return "⭐⭐ NICE TRY!"

# Singleton instance
ascii_integration = UltimateASCIIIntegration()

def demo_integration():
    """Demo the integrated ASCII systems"""

    integration = UltimateASCIIIntegration()

    print("INTEGRATED ASCII DEMO - Maximum Impact!")
    print("="*60)

    # Demo battle intro
    print("\n1. EPIC BATTLE INTRO:")
    result = integration.epic_battle_intro("dragon", 10)
    print(f"Animation type: {result['type']}")
    print(f"Frames: {len(result.get('frames', []))}")

    # Demo level up
    print("\n2. LEGENDARY LEVEL UP:")
    result = integration.legendary_level_up(
        "warrior", 10,
        {'hp': 15, 'str': 3, 'new_skills': ['Whirlwind']}
    )
    print(f"Animation type: {result['type']}")
    print(f"Epic: {result.get('epic', False)}")

    # Demo boss entrance
    print("\n3. BOSS ENTRANCE:")
    result = integration.legendary_boss_entrance(
        "Dracolich", "The Undead Dragon King"
    )
    print(f"Shake screen: {result.get('shake_screen', False)}")

if __name__ == "__main__":
    demo_integration()