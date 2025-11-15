"""
The Arcane Codex - ASCII Art Agent
Dynamic ASCII art generation system for immersive game visuals
"""

import random
from typing import Dict, List, Optional
from datetime import datetime

class ASCIIArtAgent:
    """Intelligent ASCII art generator that creates dynamic visuals based on game state"""

    def __init__(self):
        self.style_preference = "epic"  # epic, minimal, retro, fantasy
        self.animation_frames = {}
        self.dynamic_scenes = {}

    def generate_character_portrait(self, character_class: str, level: int) -> str:
        """Generate dynamic character portraits based on class and level"""

        portraits = {
            'warrior': [
                """
                   ⚔️
                  ╱█╲
                 ╱███╲
                ▐█████▌
                ╱█████╲
               ╱ ╲███╱ ╲
              ╱   ╲█╱   ╲
                """,
                """
                 ⚔️ ⚔️
                ╱█████╲
               ▐███████▌
               ███[⚔]███
              ╱█████████╲
             ╱  ╲█████╱  ╲
            ╱    ╲███╱    ╲
                """ if level >= 10 else None,
                """
               👑⚔️ ⚔️👑
              ╱█████████╲
             ▐███[⚔️]███▌
             ████[👑]████
            ╱█████████████╲
           ╱ ╲███████████╱ ╲
          ╱   ╲█████████╱   ╲
                """ if level >= 20 else None
            ],
            'mage': [
                """
                   🔮
                  ╱ ╲
                 ╱✨✨╲
                │ 👁️ │
                │╲ ╱│
                │ ╲╱ │
               ╱│    │╲
                """,
                """
                 ✨🔮✨
                ╱═══════╲
               │ 👁️ 👁️ │
               │  ═══  │
              ╱│ ╲✨╱ │╲
             ╱ │  ╲╱  │ ╲
            ✨ └──────┘ ✨
                """ if level >= 10 else None
            ],
            'rogue': [
                """
                   🗡️
                  ╱│╲
                 ╱ │ ╲
                │ └┘ │
                │╲  ╱│
                └╲ ╱┘
                 ╲█╱
                """,
                """
                🗡️   🗡️
               ╱│ ╲ ╱ │╲
              ╱ │ ╲╱ │ ╲
             │  └──┘  │
             │╲  💀  ╱│
             └─╲ ╱─┘
               ╲█╱
                """ if level >= 10 else None
            ],
            'paladin': [
                """
                   ✝️
                  ╱🛡️╲
                 ╱███╲
                │█✨█│
                │█████│
               ╱│█████│╲
              ╱ └─────┘ ╲
                """,
                """
                 ✝️⚔️✝️
                ╱══🛡️══╲
               ╱███████╲
              │█✨💫✨█│
              │█████████│
             ╱│█████████│╲
            ╱ └─────────┘ ╲
                """ if level >= 10 else None
            ]
        }

        class_portraits = portraits.get(character_class.lower(), portraits['warrior'])
        valid_portraits = [p for p in class_portraits if p is not None]

        if valid_portraits:
            return valid_portraits[-1]  # Return highest level portrait available
        return class_portraits[0]

    def generate_monster(self, monster_type: str, difficulty: int = 1) -> str:
        """Generate ASCII art for different monster types"""

        monsters = {
            'goblin': """
            ╱◣_◢╲
           │ ⚫ ⚫ │
           │  ▼  │
           │╲▼▼▼╱│
           ╱ ╲ ╱ ╲
            """,
            'dragon': """
                    🔥
                 ╱═══╲🔥
                ╱ ⚫ ⚫ ╲
               ╱   ═══   ╲
              │ ╲▼▼▼▼▼╱ │
             ╱│  ╲═══╱  │╲
            ╱ └───╱ ╲───┘ ╲
           🔥  ╱     ╲  🔥
              ╱       ╲
            """,
            'skeleton': """
              💀
             ╱│╲
            ╱ │ ╲
           │  │  │
           │  │  │
            ╲ │ ╱
             ╲│╱
            """,
            'orc': """
            ╱═══╲
           │ ⚫⚫ │
           │ ╲▼╱ │
           │▼▼▼▼▼│
          ╱│     │╲
         ╱ │     │ ╲
            """,
            'slime': """
            ╱═══╲
           │ ⚫ ⚫ │
           │  ~~~  │
           ╲~~~~~~~╱
            ╲~~~~/
            """,
            'demon': """
             👹
            ╱║╲
           ╱ ║ ╲
          │ ║║║ │
         ╱│ ║║║ │╲
        🔥└─║║║─┘🔥
            ║║║
            """
        }

        base_monster = monsters.get(monster_type.lower(), monsters['goblin'])

        # Add difficulty indicators
        if difficulty >= 3:
            base_monster = f"⚠️ ELITE ⚠️\n{base_monster}"
        elif difficulty >= 5:
            base_monster = f"💀 BOSS 💀\n{base_monster}"

        return base_monster

    def generate_spell_effect(self, spell_name: str) -> str:
        """Generate animated ASCII effects for spells"""

        spell_effects = {
            'fireball': """
                  🔥
                 ╱ ╲
                │🔥🔥│
                 ╲ ╱
                  V
            """,
            'lightning': """
                  ⚡
                  │
                 ╱│╲
                ╱ │ ╲
               ⚡ │ ⚡
                 ⚡
            """,
            'heal': """
                 ✨
                ╱ │ ╲
               │ ✝️ │
                ╲ │ ╱
                 ✨
                 💚
            """,
            'ice_shard': """
                  ❄️
                  ╱╲
                 ╱❄️╲
                ╱════╲
               ╱  ❄️  ╲
                  ╲╱
            """,
            'shadow_bolt': """
                 💀
                ╱██╲
               │████│
                ╲██╱
                 ╲╱
            """,
            'divine_light': """
               ✨✨✨
              ╱  │  ╲
             │ ☀️ │
              ╲  │  ╱
               ✨✨✨
            """
        }

        return spell_effects.get(spell_name.lower(), spell_effects['fireball'])

    def generate_dynamic_battle_scene(self, hero_hp: int, hero_max: int,
                                     enemy_hp: int, enemy_max: int,
                                     enemy_name: str) -> str:
        """Generate a dynamic battle scene with health bars"""

        hero_bar = self._create_health_bar(hero_hp, hero_max, 20)
        enemy_bar = self._create_health_bar(enemy_hp, enemy_max, 20)

        scene = f"""
╔══════════════════════════════════════════════════════════════╗
║                    ⚔️ BATTLE IN PROGRESS ⚔️                 ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║   HERO                            {enemy_name.upper():^20}     ║
║   {hero_bar}    VS    {enemy_bar}     ║
║                                                              ║
║       O                                    👹               ║
║      /|\\                                   /|\\              ║
║      / \\                                   / \\              ║
║   ════⚔️════                          ════⚔️════           ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
        """
        return scene

    def _create_health_bar(self, current: int, maximum: int, width: int = 20) -> str:
        """Create an ASCII health bar with color coding"""
        if maximum == 0:
            return "💀 [" + "░" * width + "] DEAD"

        percentage = current / maximum
        filled = int(percentage * width)
        empty = width - filled

        bar = "█" * filled + "░" * empty

        if percentage > 0.66:
            icon = "💚"
        elif percentage > 0.33:
            icon = "💛"
        else:
            icon = "💔"

        return f"{icon} [{bar}] {current}/{maximum}"

    def generate_location_banner(self, location: str, weather: str = "clear") -> str:
        """Generate location entrance banners with weather effects"""

        weather_effects = {
            'rain': "🌧️ ☔ 🌧️",
            'storm': "⛈️ ⚡ ⛈️",
            'snow': "❄️ ☃️ ❄️",
            'fog': "🌫️ 👻 🌫️",
            'clear': "☀️ 🌤️ ☀️",
            'night': "🌙 ⭐ 🌙"
        }

        weather_line = weather_effects.get(weather, weather_effects['clear'])

        locations = {
            'forest': f"""
╔══════════════════════════════════════════════════════════════╗
║                     {weather_line}                           ║
║                  🌲 ENCHANTED FOREST 🌲                      ║
║                                                              ║
║     🌲   🌲   🌲   🦌   🌲   🌲   🌲                       ║
║       🌲   🍄   🌲   🌲   🦋   🌲                           ║
║     🌲   🌲   🐿️   🌲   🌲   🌲   🌲                       ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
            """,
            'dungeon': f"""
╔══════════════════════════════════════════════════════════════╗
║                     💀 DARK DUNGEON 💀                       ║
║                                                              ║
║     🔦 ──┐  ┌── 🕸️ ──┐  ┌── ⚰️ ──┐  ┌── 💀              ║
║          │  │         │  │        │  │                      ║
║     🦇 ──┘  └── 🗝️ ──┘  └── 👻 ──┘  └── 🕯️              ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
            """,
            'castle': f"""
╔══════════════════════════════════════════════════════════════╗
║                     {weather_line}                           ║
║                    🏰 ROYAL CASTLE 🏰                        ║
║                                                              ║
║         🚩     ┌─────┐     🚩                               ║
║               │ 👑 │                                        ║
║         ┌─────┼─────┼─────┐                                ║
║         │  ⚔️  │  🛡️  │  ⚔️  │                               ║
║         └─────┴─────┴─────┘                                ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
            """,
            'tavern': f"""
╔══════════════════════════════════════════════════════════════╗
║                    🍺 THE MERRY TAVERN 🍺                   ║
║                                                              ║
║     🍻 ♪ ♫ ♪ 🎵  🎭  🎵 ♪ ♫ ♪ 🍻                        ║
║                                                              ║
║     🪑 🍖  🪑 🍗  🪑 🧀  🪑 🍞  🪑                        ║
║                                                              ║
║              🎹 🎸 🥁 🎺 🎻                                 ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
            """
        }

        return locations.get(location.lower(), locations['forest'])

    def generate_treasure_chest(self, rarity: str = "common") -> str:
        """Generate treasure chest ASCII based on rarity"""

        chests = {
            'common': """
            ┌─────────┐
            │ COMMON  │
            │   📦   │
            └─────────┘
            """,
            'rare': """
            ╔═════════╗
            ║  RARE   ║
            ║   💎    ║
            ║ ┌─────┐ ║
            ╚═╧═════╧═╝
            """,
            'epic': """
            ╔═✨═✨═✨═╗
            ║  EPIC!  ║
            ║  💎💰💎 ║
            ║ ┌─────┐ ║
            ╚═╧═🔑═╧═╝
            """,
            'legendary': """
            🌟╔═══════════╗🌟
            ✨║ LEGENDARY! ║✨
            ✨║  👑💎🏆  ║✨
            ✨║ ┌───────┐ ║✨
            🌟╚═╧═══🗝️══╧═╝🌟
            """
        }

        return chests.get(rarity.lower(), chests['common'])

    def generate_skill_tree(self, class_name: str, unlocked_skills: List[str]) -> str:
        """Generate visual skill tree"""

        skill_trees = {
            'warrior': """
╔══════════════════════════════════════════════════════════════╗
║                    ⚔️ WARRIOR SKILL TREE ⚔️                ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║                        [BERSERKER]                          ║
║                            ╱╲                               ║
║                           ╱  ╲                              ║
║                    [RAGE] ── [CLEAVE]                       ║
║                        ╲      ╱                             ║
║                         ╲    ╱                              ║
║                    [WHIRLWIND] ── [EXECUTE]                 ║
║                            │                                ║
║                    [BLADE MASTERY]                          ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
            """,
            'mage': """
╔══════════════════════════════════════════════════════════════╗
║                    🔮 MAGE SKILL TREE 🔮                    ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║          [FIRE]          [ICE]          [ARCANE]           ║
║            │              │                │                ║
║        [FIREBALL]    [ICE SHARD]     [ARCANE BOLT]         ║
║            │              │                │                ║
║         [METEOR]      [BLIZZARD]      [TIME WARP]          ║
║            ╲              │                ╱                ║
║             ╲             │               ╱                 ║
║              ╲            │              ╱                  ║
║               ╲     [ELEMENTAL]        ╱                   ║
║                ╲     [MASTERY]       ╱                     ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
            """
        }

        tree = skill_trees.get(class_name.lower(), skill_trees['warrior'])

        # Highlight unlocked skills
        for skill in unlocked_skills:
            tree = tree.replace(f"[{skill.upper()}]", f"✅[{skill.upper()}]✅")

        return tree

    def generate_dice_animation(self) -> List[str]:
        """Generate dice rolling animation frames"""

        frames = [
            """
            ┌───────┐
            │       │
            │   ⚀   │
            │       │
            └───────┘
            """,
            """
            ┌───────┐
            │   ⚁   │
            │       │
            │       │
            └───────┘
            """,
            """
            ┌───────┐
            │ ⚂     │
            │       │
            │       │
            └───────┘
            """,
            """
            ┌───────┐
            │ ⚃  ⚃ │
            │       │
            │       │
            └───────┘
            """,
            """
            ┌───────┐
            │ ⚄  ⚄ │
            │   ⚄   │
            │       │
            └───────┘
            """,
            """
            ┌───────┐
            │ ⚅  ⚅ │
            │ ⚅  ⚅ │
            │ ⚅  ⚅ │
            └───────┘
            """
        ]

        return frames

    def generate_quest_scroll(self, quest_name: str, quest_text: str,
                             reward: str, difficulty: int) -> str:
        """Generate a quest scroll with details"""

        difficulty_stars = "⭐" * min(difficulty, 5)

        return f"""
╔══════════════════════════════════════════════════════════════╗
║                      📜 NEW QUEST 📜                        ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  Quest: {quest_name:^48} ║
║                                                              ║
║  {quest_text[:58]:<58} ║
║  {quest_text[58:116] if len(quest_text) > 58 else '':<58} ║
║                                                              ║
║  Difficulty: {difficulty_stars:<44} ║
║  Reward: {reward:^48} ║
║                                                              ║
║              [Accept]          [Decline]                    ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
        """

    def generate_party_status(self, party_members: List[Dict]) -> str:
        """Generate party status display"""

        display = """
╔══════════════════════════════════════════════════════════════╗
║                    👥 PARTY STATUS 👥                       ║
╠══════════════════════════════════════════════════════════════╣
"""

        for member in party_members[:4]:  # Max 4 party members
            name = member.get('name', 'Unknown')[:12]
            hp = member.get('hp', 0)
            max_hp = member.get('max_hp', 100)
            mp = member.get('mp', 0)
            max_mp = member.get('max_mp', 50)
            class_icon = CLASS_ICONS.get(member.get('class', 'warrior'), '❓')

            hp_bar = self._create_mini_bar(hp, max_hp, 10)
            mp_bar = self._create_mini_bar(mp, max_mp, 10, is_mana=True)

            display += f"║ {class_icon} {name:<12} HP:{hp_bar} MP:{mp_bar}    ║\n"

        display += """║                                                              ║
╚══════════════════════════════════════════════════════════════╝
"""
        return display

    def _create_mini_bar(self, current: int, maximum: int, width: int = 10, is_mana: bool = False) -> str:
        """Create a mini health/mana bar"""
        if maximum == 0:
            return "░" * width

        percentage = current / maximum
        filled = int(percentage * width)
        empty = width - filled

        if is_mana:
            return "🔵" + "▰" * filled + "▱" * empty
        else:
            return "❤️" + "▰" * filled + "▱" * empty

    def generate_dialogue_box(self, npc_name: str, dialogue: str,
                             npc_type: str = "merchant") -> str:
        """Generate NPC dialogue boxes"""

        npc_icons = {
            'merchant': '🧔',
            'guard': '💂',
            'wizard': '🧙',
            'innkeeper': '👨‍🍳',
            'blacksmith': '⚒️',
            'king': '👑',
            'peasant': '👨‍🌾',
            'thief': '🦹',
            'priest': '✝️'
        }

        icon = npc_icons.get(npc_type.lower(), '🧑')

        return f"""
╔══════════════════════════════════════════════════════════════╗
║ {icon} {npc_name.upper():^56} {icon} ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║ "{dialogue[:56]:<56}" ║
║ "{dialogue[56:112] if len(dialogue) > 56 else '':<56}" ║
║ "{dialogue[112:168] if len(dialogue) > 112 else '':<56}" ║
║                                                              ║
║        [1. Yes]     [2. No]     [3. Tell me more]          ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
        """

    def generate_achievement_unlock(self, achievement_name: str,
                                   description: str, points: int = 10) -> str:
        """Generate achievement unlock notification"""

        return f"""
    ╔══════════════════════════════════════════════════════╗
    ║                 🏆 ACHIEVEMENT UNLOCKED! 🏆          ║
    ╠══════════════════════════════════════════════════════╣
    ║                                                      ║
    ║              ⭐ {achievement_name:^30} ⭐        ║
    ║                                                      ║
    ║         {description:^42}        ║
    ║                                                      ║
    ║                   +{points} Achievement Points              ║
    ║                                                      ║
    ╚══════════════════════════════════════════════════════╝
        """

    def generate_loading_animation(self) -> List[str]:
        """Generate loading animation frames"""

        frames = []
        base = "╔══════════════════════════════════════════════════════════════╗\n"
        base += "║                  🔮 LOADING THE ARCANE CODEX 🔮             ║\n"
        base += "║                                                              ║\n"

        loading_bars = [
            "║     ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░         ║",
            "║     ████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░         ║",
            "║     ████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░         ║",
            "║     ████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░         ║",
            "║     ████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░         ║",
            "║     ████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░         ║",
            "║     ████████████████████████░░░░░░░░░░░░░░░░░░░░░         ║",
            "║     ████████████████████████████░░░░░░░░░░░░░░░░░         ║",
            "║     ████████████████████████████████░░░░░░░░░░░░░         ║",
            "║     ████████████████████████████████████░░░░░░░░░         ║",
            "║     ████████████████████████████████████████░░░░░         ║",
            "║     ████████████████████████████████████████████░         ║"
        ]

        tips = [
            "║          Tip: Every class sees different whispers           ║",
            "║          Tip: Your choices shape your destiny               ║",
            "║          Tip: Work together to uncover the truth            ║",
            "║          Tip: Some secrets are hidden in plain sight        ║",
            "║          Tip: The gods are always watching                  ║"
        ]

        for i, bar in enumerate(loading_bars):
            frame = base
            frame += bar + "\n"
            percentage = int((i + 1) / len(loading_bars) * 100)
            frame += f"║                         {percentage:3d}%                                 ║\n"
            frame += "║                                                              ║\n"
            frame += random.choice(tips) + "\n"
            frame += "╚══════════════════════════════════════════════════════════════╝"
            frames.append(frame)

        return frames


# Singleton instance
ascii_agent = ASCIIArtAgent()


def test_ascii_agent():
    """Test the ASCII Art Agent functionality"""
    agent = ASCIIArtAgent()

    print("=" * 70)
    print("TESTING ASCII ART AGENT")
    print("=" * 70)

    # Test character portraits
    print("\n1. CHARACTER PORTRAITS:")
    print(agent.generate_character_portrait('warrior', 15))

    # Test monster generation
    print("\n2. MONSTER GENERATION:")
    print(agent.generate_monster('dragon', 5))

    # Test spell effects
    print("\n3. SPELL EFFECTS:")
    print(agent.generate_spell_effect('lightning'))

    # Test battle scene
    print("\n4. DYNAMIC BATTLE SCENE:")
    print(agent.generate_dynamic_battle_scene(75, 100, 45, 80, "Dragon"))

    # Test location banner
    print("\n5. LOCATION BANNER:")
    print(agent.generate_location_banner('castle', 'storm'))

    # Test treasure chest
    print("\n6. TREASURE CHEST:")
    print(agent.generate_treasure_chest('legendary'))

    # Test quest scroll
    print("\n7. QUEST SCROLL:")
    print(agent.generate_quest_scroll(
        "The Lost Crown",
        "Find the ancient crown hidden in the depths of the forgotten dungeon.",
        "1000 gold + Legendary Sword",
        4
    ))

    # Test party status
    print("\n8. PARTY STATUS:")
    party = [
        {'name': 'Aragorn', 'hp': 80, 'max_hp': 100, 'mp': 30, 'max_mp': 50, 'class': 'warrior'},
        {'name': 'Gandalf', 'hp': 60, 'max_hp': 80, 'mp': 90, 'max_mp': 100, 'class': 'mage'},
        {'name': 'Legolas', 'hp': 70, 'max_hp': 90, 'mp': 40, 'max_mp': 60, 'class': 'ranger'},
        {'name': 'Gimli', 'hp': 100, 'max_hp': 120, 'mp': 10, 'max_mp': 30, 'class': 'warrior'}
    ]
    print(agent.generate_party_status(party))

    # Test dialogue box
    print("\n9. DIALOGUE BOX:")
    print(agent.generate_dialogue_box(
        "Old Merchant",
        "Ah, a brave adventurer! I have rare items that might interest you. Care to take a look?",
        "merchant"
    ))

    # Test achievement unlock
    print("\n10. ACHIEVEMENT UNLOCK:")
    print(agent.generate_achievement_unlock(
        "Dragon Slayer",
        "Defeat your first dragon",
        100
    ))


if __name__ == "__main__":
    test_ascii_agent()