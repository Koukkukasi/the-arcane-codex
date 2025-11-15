"""
REAL-TIME ASCII RTS SYSTEM - The Arcane Codex
Live updating battlefield with units, movements, and battles!
"""

import time
import random
import threading
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass
from enum import Enum

class UnitType(Enum):
    WARRIOR = "⚔"
    ARCHER = "🏹"
    MAGE = "🔮"
    CAVALRY = "🐎"
    DRAGON = "🐉"
    TOWER = "🏰"

@dataclass
class Unit:
    id: int
    type: UnitType
    team: int  # 1 or 2
    x: int
    y: int
    hp: int
    max_hp: int
    damage: int
    range: int
    speed: float
    target: Optional['Unit'] = None
    attack_cooldown: float = 0

class RealTimeASCIIBattlefield:
    """
    REAL-TIME ASCII GRAPHICS that update 30+ times per second!
    Units move, fight, cast spells - all in beautiful ASCII!
    """

    def __init__(self, width: int = 80, height: int = 25):
        self.width = width
        self.height = height
        self.units: List[Unit] = []
        self.projectiles: List[Dict] = []
        self.effects: List[Dict] = []
        self.terrain = [[' ' for _ in range(width)] for _ in range(height)]
        self.frame_count = 0
        self.running = False

        # Performance tracking
        self.fps = 0
        self.last_frame_time = time.time()

        # Unit ID counter
        self.next_unit_id = 1

    def spawn_unit(self, unit_type: UnitType, team: int, x: int, y: int) -> Unit:
        """Spawn a unit on the battlefield"""

        stats = {
            UnitType.WARRIOR: {'hp': 100, 'damage': 15, 'range': 1, 'speed': 1.0},
            UnitType.ARCHER: {'hp': 60, 'damage': 20, 'range': 5, 'speed': 0.8},
            UnitType.MAGE: {'hp': 50, 'damage': 30, 'range': 4, 'speed': 0.7},
            UnitType.CAVALRY: {'hp': 120, 'damage': 25, 'range': 1, 'speed': 2.0},
            UnitType.DRAGON: {'hp': 500, 'damage': 50, 'range': 3, 'speed': 1.5},
            UnitType.TOWER: {'hp': 300, 'damage': 35, 'range': 6, 'speed': 0},
        }

        unit_stats = stats[unit_type]
        unit = Unit(
            id=self.next_unit_id,
            type=unit_type,
            team=team,
            x=x,
            y=y,
            hp=unit_stats['hp'],
            max_hp=unit_stats['hp'],
            damage=unit_stats['damage'],
            range=unit_stats['range'],
            speed=unit_stats['speed']
        )

        self.next_unit_id += 1
        self.units.append(unit)
        return unit

    def update(self, delta_time: float):
        """UPDATE EVERYTHING IN REAL-TIME!"""

        # Update all units
        for unit in self.units[:]:
            if unit.hp <= 0:
                self.units.remove(unit)
                self.create_death_effect(unit.x, unit.y)
                continue

            # Find nearest enemy
            if not unit.target or unit.target.hp <= 0:
                unit.target = self.find_nearest_enemy(unit)

            if unit.target:
                distance = self.get_distance(unit, unit.target)

                # Attack if in range
                if distance <= unit.range:
                    if unit.attack_cooldown <= 0:
                        self.attack(unit, unit.target)
                        unit.attack_cooldown = 1.0
                else:
                    # Move towards target
                    if unit.speed > 0:
                        self.move_unit_towards(unit, unit.target, delta_time)

            # Update attack cooldown
            if unit.attack_cooldown > 0:
                unit.attack_cooldown -= delta_time

        # Update projectiles
        for proj in self.projectiles[:]:
            proj['x'] += proj['vx'] * delta_time * 10
            proj['y'] += proj['vy'] * delta_time * 10
            proj['lifetime'] -= delta_time

            if proj['lifetime'] <= 0:
                self.projectiles.remove(proj)

        # Update effects
        for effect in self.effects[:]:
            effect['lifetime'] -= delta_time
            if effect['lifetime'] <= 0:
                self.effects.remove(effect)

        self.frame_count += 1

    def attack(self, attacker: Unit, target: Unit):
        """Execute an attack with visual effects!"""

        if attacker.type == UnitType.ARCHER:
            # Create arrow projectile
            self.create_projectile(attacker.x, attacker.y, target.x, target.y, '→')
        elif attacker.type == UnitType.MAGE:
            # Create magic projectile
            self.create_projectile(attacker.x, attacker.y, target.x, target.y, '✦')
            self.create_spell_effect(target.x, target.y)
        else:
            # Melee attack effect
            self.create_melee_effect(target.x, target.y)

        # Deal damage
        target.hp -= attacker.damage

    def create_projectile(self, x1: int, y1: int, x2: int, y2: int, symbol: str):
        """Create a flying projectile"""
        dx = x2 - x1
        dy = y2 - y1
        dist = max(abs(dx), abs(dy), 1)

        self.projectiles.append({
            'x': float(x1),
            'y': float(y1),
            'vx': dx / dist,
            'vy': dy / dist,
            'symbol': symbol,
            'lifetime': 0.5
        })

    def create_spell_effect(self, x: int, y: int):
        """Create a spell impact effect"""
        self.effects.append({
            'x': x,
            'y': y,
            'type': 'spell',
            'lifetime': 0.3,
            'symbol': '💥'
        })

    def create_melee_effect(self, x: int, y: int):
        """Create a melee hit effect"""
        self.effects.append({
            'x': x,
            'y': y,
            'type': 'melee',
            'lifetime': 0.2,
            'symbol': '⚡'
        })

    def create_death_effect(self, x: int, y: int):
        """Create a death animation"""
        self.effects.append({
            'x': x,
            'y': y,
            'type': 'death',
            'lifetime': 0.5,
            'symbol': '💀'
        })

    def move_unit_towards(self, unit: Unit, target: Unit, delta_time: float):
        """Move a unit towards its target"""
        dx = target.x - unit.x
        dy = target.y - unit.y
        dist = max(abs(dx), abs(dy), 1)

        if dist > 0:
            move_x = (dx / dist) * unit.speed * delta_time * 5
            move_y = (dy / dist) * unit.speed * delta_time * 5

            new_x = max(0, min(self.width - 1, unit.x + int(move_x)))
            new_y = max(0, min(self.height - 1, unit.y + int(move_y)))

            # Check collision
            if not self.is_occupied(new_x, new_y, unit):
                unit.x = new_x
                unit.y = new_y

    def find_nearest_enemy(self, unit: Unit) -> Optional[Unit]:
        """Find the nearest enemy unit"""
        nearest = None
        min_dist = float('inf')

        for other in self.units:
            if other.team != unit.team:
                dist = self.get_distance(unit, other)
                if dist < min_dist:
                    min_dist = dist
                    nearest = other

        return nearest

    def get_distance(self, unit1: Unit, unit2: Unit) -> float:
        """Calculate distance between two units"""
        return ((unit2.x - unit1.x) ** 2 + (unit2.y - unit1.y) ** 2) ** 0.5

    def is_occupied(self, x: int, y: int, excluding: Unit = None) -> bool:
        """Check if a position is occupied"""
        for unit in self.units:
            if unit != excluding and unit.x == x and unit.y == y:
                return True
        return False

    def render(self) -> str:
        """RENDER THE BATTLEFIELD IN REAL-TIME ASCII!"""

        # Create empty battlefield
        display = [[' ' for _ in range(self.width)] for _ in range(self.height)]

        # Draw terrain (simplified for demo)
        for y in range(self.height):
            display[y][0] = '║'
            display[y][self.width-1] = '║'
        for x in range(self.width):
            display[0][x] = '═'
            display[self.height-1][x] = '═'
        display[0][0] = '╔'
        display[0][self.width-1] = '╗'
        display[self.height-1][0] = '╚'
        display[self.height-1][self.width-1] = '╝'

        # Draw projectiles
        for proj in self.projectiles:
            x, y = int(proj['x']), int(proj['y'])
            if 0 < x < self.width-1 and 0 < y < self.height-1:
                display[y][x] = proj['symbol']

        # Draw effects
        for effect in self.effects:
            x, y = effect['x'], effect['y']
            if 0 < x < self.width-1 and 0 < y < self.height-1:
                display[y][x] = effect['symbol']

        # Draw units with health bars
        for unit in self.units:
            if 0 < unit.x < self.width-1 and 0 < unit.y < self.height-1:
                # Unit symbol
                display[unit.y][unit.x] = unit.type.value

                # Mini health bar above unit
                if unit.y > 1:
                    hp_percent = unit.hp / unit.max_hp
                    if hp_percent > 0.66:
                        hp_symbol = '▰'
                    elif hp_percent > 0.33:
                        hp_symbol = '▱'
                    else:
                        hp_symbol = '░'

                    if unit.x > 0:
                        display[unit.y-1][unit.x-1] = hp_symbol
                    display[unit.y-1][unit.x] = hp_symbol
                    if unit.x < self.width-2:
                        display[unit.y-1][unit.x+1] = hp_symbol

        # Convert to string
        output = ""
        for row in display:
            output += ''.join(row) + '\n'

        # Add status bar
        output += f"\nFPS: {self.fps:.1f} | Units: {len(self.units)} | "
        output += f"Frame: {self.frame_count} | "
        output += f"Team 1: {sum(1 for u in self.units if u.team == 1)} | "
        output += f"Team 2: {sum(1 for u in self.units if u.team == 2)}"

        return output

    def run_battle_simulation(self):
        """Run a complete real-time battle!"""

        # Spawn armies
        # Team 1 (left side)
        for i in range(5):
            self.spawn_unit(UnitType.WARRIOR, 1, 5, 5 + i * 3)
        for i in range(3):
            self.spawn_unit(UnitType.ARCHER, 1, 3, 7 + i * 3)
        self.spawn_unit(UnitType.MAGE, 1, 4, 12)

        # Team 2 (right side)
        for i in range(5):
            self.spawn_unit(UnitType.WARRIOR, 2, self.width - 6, 5 + i * 3)
        for i in range(3):
            self.spawn_unit(UnitType.ARCHER, 2, self.width - 4, 7 + i * 3)
        self.spawn_unit(UnitType.DRAGON, 2, self.width - 5, 12)

        self.running = True
        last_time = time.time()

        while self.running:
            current_time = time.time()
            delta_time = current_time - last_time
            last_time = current_time

            # Update FPS
            self.fps = 1.0 / max(delta_time, 0.001)

            # Update battle
            self.update(delta_time)

            # Clear screen (simplified for demo)
            print("\033[H\033[J")  # ANSI clear screen

            # Render and print
            print(self.render())

            # Check victory
            team1_alive = any(u.team == 1 for u in self.units)
            team2_alive = any(u.team == 2 for u in self.units)

            if not team1_alive:
                print("\n🏆 TEAM 2 WINS! 🏆")
                break
            elif not team2_alive:
                print("\n🏆 TEAM 1 WINS! 🏆")
                break

            # Control frame rate (30 FPS)
            time.sleep(max(0, 1/30 - delta_time))

def demo_realtime_rts():
    """Demo the real-time RTS system"""

    print("""
╔══════════════════════════════════════════════════════════════╗
║           🎮 REAL-TIME ASCII RTS DEMO 🎮                    ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  This demonstrates REAL-TIME ASCII graphics where:          ║
║                                                              ║
║  • Units move smoothly across the battlefield               ║
║  • Projectiles fly in real-time (arrows, spells)            ║
║  • Health bars update as damage is dealt                    ║
║  • Death animations play when units fall                    ║
║  • Everything updates 30+ times per second!                 ║
║                                                              ║
║  Imagine this in The Arcane Codex:                          ║
║  • Party members moving in formation                        ║
║  • Spells flying across the screen                          ║
║  • Monsters approaching from multiple directions            ║
║  • Real-time tactical combat!                               ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
    """)

    # Create battlefield
    battlefield = RealTimeASCIIBattlefield(60, 20)

    # Show static example
    print("\nEXAMPLE BATTLEFIELD STATE:")
    print("="*60)

    # Spawn some units for display
    battlefield.spawn_unit(UnitType.WARRIOR, 1, 10, 10)
    battlefield.spawn_unit(UnitType.ARCHER, 1, 8, 12)
    battlefield.spawn_unit(UnitType.MAGE, 1, 12, 11)
    battlefield.spawn_unit(UnitType.DRAGON, 2, 45, 10)
    battlefield.spawn_unit(UnitType.WARRIOR, 2, 43, 12)

    print(battlefield.render())

    print("\nIn actual gameplay, this would UPDATE 30 TIMES PER SECOND!")
    print("Units would move, fight, cast spells - all in smooth ASCII!")

if __name__ == "__main__":
    demo_realtime_rts()

    # Uncomment to run actual real-time simulation
    # battlefield = RealTimeASCIIBattlefield(80, 25)
    # battlefield.run_battle_simulation()