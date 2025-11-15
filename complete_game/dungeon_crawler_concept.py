"""
ASCII DUNGEON CRAWLER CONCEPT - The Arcane Codex
A proof-of-concept for real-time ASCII dungeon exploration
SEPARATE FROM MAIN PROJECT - Just for fun!
"""

import random
from typing import Dict, List, Tuple, Optional
import time

class DungeonCrawlerConcept:
    """
    Imagine combining The Arcane Codex's asymmetric information system
    with classic ASCII dungeon crawling!
    """

    def __init__(self):
        self.player_pos = [5, 5]
        self.dungeon_width = 15
        self.dungeon_height = 15
        self.visibility_range = 3
        self.discovered_map = set()

        # Different classes see different things!
        self.player_class = "rogue"  # Could be warrior, mage, rogue, paladin

        # Dungeon elements
        self.walls = set()
        self.doors = {}
        self.treasures = {}
        self.monsters = {}
        self.traps = {}
        self.secrets = {}

        self.generate_dungeon()

    def generate_dungeon(self):
        """Generate a simple dungeon with asymmetric elements"""

        # Create outer walls
        for x in range(self.dungeon_width):
            self.walls.add((x, 0))
            self.walls.add((x, self.dungeon_height - 1))
        for y in range(self.dungeon_height):
            self.walls.add((0, y))
            self.walls.add((self.dungeon_width - 1, y))

        # Add some interior walls
        for _ in range(10):
            x = random.randint(2, self.dungeon_width - 3)
            y = random.randint(2, self.dungeon_height - 3)
            for i in range(random.randint(2, 4)):
                if random.choice([True, False]):
                    self.walls.add((x + i, y))
                else:
                    self.walls.add((x, y + i))

        # Add doors (visible to all)
        self.doors[(7, 3)] = "wooden"
        self.doors[(4, 8)] = "iron"

        # Add treasures (rogues see glints)
        self.treasures[(10, 10)] = "gold"
        self.treasures[(3, 12)] = "gems"

        # Add monsters (rangers sense them earlier)
        self.monsters[(8, 8)] = "goblin"
        self.monsters[(12, 4)] = "skeleton"

        # Add traps (rogues detect them)
        self.traps[(6, 6)] = "spike"
        self.traps[(9, 11)] = "pit"

        # Add secret doors (mages sense magic)
        self.secrets[(5, 1)] = "magical"
        self.secrets[(13, 7)] = "hidden"

    def render_dungeon(self) -> str:
        """
        Render the dungeon with class-specific whispers!
        Different classes see different hints
        """

        display = """
╔═══════════════════════════════════════════════════════════════╗
║         🏰 DUNGEON CRAWLER MODE - {class_name} 🏰            ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
""".format(class_name=self.player_class.upper())

        # Main dungeon view
        for y in range(self.dungeon_height):
            row = "║  "
            for x in range(self.dungeon_width):
                pos = (x, y)
                px, py = self.player_pos

                # Calculate distance for fog of war
                dist = abs(x - px) + abs(y - py)

                # Player position
                if [x, y] == self.player_pos:
                    row += "@ "
                    self.discovered_map.add(pos)

                # Within visibility range
                elif dist <= self.visibility_range:
                    self.discovered_map.add(pos)
                    row += self.get_tile_display(pos)

                # Previously discovered
                elif pos in self.discovered_map:
                    if pos in self.walls:
                        row += "▓ "
                    else:
                        row += "· "

                # Undiscovered
                else:
                    row += "  "

            row += " ║"
            display += row + "\n"

        display += "║                                                               ║\n"
        display += self.get_class_whispers()
        display += """╚═══════════════════════════════════════════════════════════════╝

Controls: [W/A/S/D] Move  [E] Interact  [TAB] Inventory  [Q] Quit

Position: ({x}, {y})  Class: {cls}  Vision: {vis}
""".format(x=self.player_pos[0], y=self.player_pos[1],
           cls=self.player_class.title(), vis=self.visibility_range)

        return display

    def get_tile_display(self, pos: Tuple[int, int]) -> str:
        """Get display character for a tile based on class perception"""

        # Walls are visible to all
        if pos in self.walls:
            return "█ "

        # Doors visible to all
        if pos in self.doors:
            return "🚪"

        # Monsters - visible to all when close
        if pos in self.monsters:
            monster = self.monsters[pos]
            if monster == "goblin":
                return "g "
            elif monster == "skeleton":
                return "s "

        # Class-specific perceptions!

        # ROGUE abilities
        if self.player_class == "rogue":
            # Rogues detect traps
            if pos in self.traps:
                return "⚠️"
            # Rogues see treasure glints
            if pos in self.treasures:
                return "✨"

        # MAGE abilities
        elif self.player_class == "mage":
            # Mages sense magical auras
            if pos in self.secrets:
                return "🔮"
            # Mages see magical energies
            px, py = self.player_pos
            if abs(pos[0] - px) + abs(pos[1] - py) <= 2:
                if pos in self.treasures and self.treasures[pos] == "gems":
                    return "💎"

        # WARRIOR abilities
        elif self.player_class == "warrior":
            # Warriors sense combat threats
            for monster_pos in self.monsters:
                mx, my = monster_pos
                if abs(pos[0] - mx) <= 1 and abs(pos[1] - my) <= 1:
                    return "! "

        # PALADIN abilities
        elif self.player_class == "paladin":
            # Paladins sense evil
            for monster_pos in self.monsters:
                mx, my = monster_pos
                if abs(pos[0] - mx) <= 2 and abs(pos[1] - my) <= 2:
                    return "† "

        # Default floor
        return ". "

    def get_class_whispers(self) -> str:
        """Generate class-specific whispers about the environment"""

        whispers = "║ "
        px, py = self.player_pos

        if self.player_class == "rogue":
            # Check for nearby traps
            for trap_pos, trap_type in self.traps.items():
                tx, ty = trap_pos
                if abs(tx - px) + abs(ty - py) <= 4:
                    whispers += f"👁️ WHISPER: You sense a {trap_type} trap nearby..."
                    break
            else:
                # Check for treasure
                for treasure_pos in self.treasures:
                    tx, ty = treasure_pos
                    if abs(tx - px) + abs(ty - py) <= 5:
                        whispers += "👁️ WHISPER: Something glimmers in the darkness..."
                        break
                else:
                    whispers += "👁️ WHISPER: Your keen eyes scan for hidden dangers..."

        elif self.player_class == "mage":
            # Sense magical energies
            for secret_pos in self.secrets:
                sx, sy = secret_pos
                if abs(sx - px) + abs(sy - py) <= 4:
                    whispers += "🔮 WHISPER: You feel magical energies pulsing nearby..."
                    break
            else:
                whispers += "🔮 WHISPER: The arcane energies here are dormant..."

        elif self.player_class == "warrior":
            # Sense combat
            enemy_count = sum(1 for m in self.monsters if abs(m[0] - px) + abs(m[1] - py) <= 5)
            if enemy_count > 0:
                whispers += f"⚔️ WHISPER: Your battle instincts detect {enemy_count} foe(s) nearby!"
            else:
                whispers += "⚔️ WHISPER: Your sword hand is steady. No threats detected."

        elif self.player_class == "paladin":
            # Sense evil
            for monster_pos, monster_type in self.monsters.items():
                mx, my = monster_pos
                if abs(mx - px) + abs(my - py) <= 6:
                    whispers += f"✝️ WHISPER: You sense the presence of evil... a {monster_type}!"
                    break
            else:
                whispers += "✝️ WHISPER: The light guides your path forward..."

        # Pad the whisper line
        whispers = whispers[:61] + " " * (61 - len(whispers)) + " ║\n"
        return whispers

    def move_player(self, dx: int, dy: int) -> bool:
        """Move the player if possible"""
        new_x = self.player_pos[0] + dx
        new_y = self.player_pos[1] + dy

        # Check boundaries
        if (new_x, new_y) not in self.walls:
            if 0 <= new_x < self.dungeon_width and 0 <= new_y < self.dungeon_height:
                self.player_pos = [new_x, new_y]
                return True
        return False

    def render_split_party_view(self) -> str:
        """
        ULTIMATE CONCEPT: Multiple players see different things!
        This would be the real magic - asymmetric dungeon crawling
        """

        display = """
╔═══════════════════════════════════════════════════════════════╗
║           🎮 ASYMMETRIC DUNGEON CRAWLING 🎮                  ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║  WARRIOR's View:          │  MAGE's View:                    ║
║  ████..!..████           │  ████.....████                   ║
║  █....!g!....█           │  █....🔮....█                    ║
║  █..@.!.!....█           │  █..@......█                     ║
║  █...........█           │  █....💎....█                     ║
║  █████████████           │  █████████████                   ║
║                          │                                   ║
║  Sees: Combat threats    │  Sees: Magic & gems              ║
║                          │                                   ║
║  ROGUE's View:           │  PALADIN's View:                 ║
║  ████..⚠..████           │  ████..†..████                   ║
║  █......g....█           │  █....†g†....█                    ║
║  █..@.⚠.✨...█           │  █..@.†.†....█                    ║
║  █......✨...█           │  █...........█                    ║
║  █████🚪██████           │  ████████████                    ║
║                          │                                   ║
║  Sees: Traps & treasure  │  Sees: Evil auras                ║
║                                                               ║
║  Each player experiences the SAME dungeon DIFFERENTLY!       ║
║  Cooperation is KEY to survival!                             ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝

Imagine: "Rogue, check for traps!" "Mage, any magic doors?"
"Warrior, how many enemies?" "Paladin, sense any bosses?"

This would add a WHOLE new dimension to dungeon crawling!
"""
        return display

def demo_concept():
    """Demo the dungeon crawler concept"""

    print("""
    ╔═══════════════════════════════════════════════════════════════╗
    ║                                                               ║
    ║       🏰 DUNGEON CRAWLER CONCEPT - THE ARCANE CODEX 🏰       ║
    ║                                                               ║
    ║   Imagine: Real-time ASCII dungeon exploration where...      ║
    ║                                                               ║
    ║   • Each class sees DIFFERENT things in the same dungeon     ║
    ║   • Rogues detect traps, Mages sense magic                   ║
    ║   • Warriors feel threats, Paladins sense evil               ║
    ║   • Players must COMMUNICATE to survive!                     ║
    ║                                                               ║
    ║   "Hey Rogue, is that corridor safe?"                        ║
    ║   "Mage, I think there's a secret door here!"                ║
    ║   "Warrior, how many enemies ahead?"                         ║
    ║                                                               ║
    ║   The asymmetric information would make dungeon              ║
    ║   crawling a TRUE cooperative experience!                    ║
    ║                                                               ║
    ╚═══════════════════════════════════════════════════════════════╝
    """)

    # Create instances for different classes
    rogue_dungeon = DungeonCrawlerConcept()
    rogue_dungeon.player_class = "rogue"

    mage_dungeon = DungeonCrawlerConcept()
    mage_dungeon.player_class = "mage"

    # Show how different classes see the same dungeon
    print("\n" + "="*65)
    print("ROGUE'S PERSPECTIVE - Sees traps and treasure:")
    print("="*65)
    print(rogue_dungeon.render_dungeon())

    print("\n" + "="*65)
    print("MAGE'S PERSPECTIVE - Senses magical energies:")
    print("="*65)
    print(mage_dungeon.render_dungeon())

    # Show the ultimate vision
    print("\n" + "="*65)
    print("THE ULTIMATE VISION:")
    print("="*65)
    print(rogue_dungeon.render_split_party_view())

if __name__ == "__main__":
    demo_concept()

    # Quick interactive demo
    print("\nWant to try moving around? (y/n): ", end="")
    # Uncomment for interactive mode:
    # if input().lower() == 'y':
    #     crawler = DungeonCrawlerConcept()
    #     while True:
    #         print(crawler.render_dungeon())
    #         move = input("Move (w/a/s/d) or q to quit: ").lower()
    #         if move == 'q':
    #             break
    #         elif move == 'w':
    #             crawler.move_player(0, -1)
    #         elif move == 's':
    #             crawler.move_player(0, 1)
    #         elif move == 'a':
    #             crawler.move_player(-1, 0)
    #         elif move == 'd':
    #             crawler.move_player(1, 0)