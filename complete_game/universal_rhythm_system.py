"""
UNIVERSAL RHYTHM SYSTEM - Every Entity Dances to Its Own Beat!
The entire world is ALIVE with RHYTHM!
"""

import time
import math
from typing import Dict, List, Tuple
from dataclasses import dataclass
from enum import Enum

@dataclass
class RhythmPattern:
    """Every entity's unique rhythm signature"""
    name: str
    bpm: int
    pattern: str  # e.g., "█.█.█..." for visual representation
    phase_offset: float  # Start at different points
    color: str  # Visual indicator

class EntityRhythms:
    """
    EVERY SINGLE ENTITY HAS ITS OWN RHYTHM!
    When rhythms align = MAGIC HAPPENS!
    """

    # ========== PLAYER CLASS RHYTHMS ==========
    PLAYER_RHYTHMS = {
        'warrior': RhythmPattern(
            name="Heavy Strike",
            bpm=60,  # Slow, powerful
            pattern="████....████....",
            phase_offset=0.0,
            color="RED"
        ),
        'rogue': RhythmPattern(
            name="Quick Steps",
            bpm=180,  # Fast, nimble
            pattern="█.█.█.█.█.█.█.█.",
            phase_offset=0.5,
            color="PURPLE"
        ),
        'mage': RhythmPattern(
            name="Arcane Pulse",
            bpm=90,  # Methodical
            pattern="█...█...█...█...",
            phase_offset=0.25,
            color="BLUE"
        ),
        'archer': RhythmPattern(
            name="Steady Aim",
            bpm=120,  # Balanced
            pattern="█.█...█.█...█.█.",
            phase_offset=0.75,
            color="GREEN"
        )
    }

    # ========== CREATURE RHYTHMS ==========
    CREATURE_RHYTHMS = {
        'goblin': RhythmPattern(
            name="Chaotic Skitter",
            bpm=150,
            pattern="█.██.█..█.██....",
            phase_offset=0.3,
            color="YELLOW"
        ),
        'dragon': RhythmPattern(
            name="Ancient Power",
            bpm=40,  # Slow, devastating
            pattern="████████........",
            phase_offset=0.0,
            color="ORANGE"
        ),
        'skeleton': RhythmPattern(
            name="Bone Rattle",
            bpm=100,
            pattern="█..█..█..█..█...",
            phase_offset=0.6,
            color="WHITE"
        ),
        'wolf': RhythmPattern(
            name="Pack Hunt",
            bpm=140,
            pattern="███...███...███.",
            phase_offset=0.2,
            color="GRAY"
        ),
        'elemental': RhythmPattern(
            name="Elemental Flow",
            bpm=75,
            pattern="█~█~█~█~█~█~█~█~",  # Flowing pattern
            phase_offset=0.0,
            color="CYAN"
        )
    }

    # ========== ENVIRONMENTAL RHYTHMS ==========
    ENVIRONMENT_RHYTHMS = {
        'torch': RhythmPattern(
            name="Flickering Flame",
            bpm=200,
            pattern="█▓▒░▒▓█▓▒░▒▓",
            phase_offset=0.0,
            color="ORANGE"
        ),
        'waterfall': RhythmPattern(
            name="Cascading Water",
            bpm=80,
            pattern="▓▓▓▒▒▒░░░▒▒▒▓▓▓",
            phase_offset=0.0,
            color="BLUE"
        ),
        'wind': RhythmPattern(
            name="Gentle Breeze",
            bpm=30,
            pattern="~~~~............",
            phase_offset=0.0,
            color="WHITE"
        ),
        'crystal': RhythmPattern(
            name="Magical Pulse",
            bpm=60,
            pattern="✦...✦...✦...✦...",
            phase_offset=0.5,
            color="PURPLE"
        ),
        'portal': RhythmPattern(
            name="Dimensional Flux",
            bpm=110,
            pattern="◉○◉○◉○◉○◉○◉○◉○",
            phase_offset=0.0,
            color="MAGENTA"
        )
    }

    # ========== OBJECT RHYTHMS ==========
    OBJECT_RHYTHMS = {
        'treasure_chest': RhythmPattern(
            name="Mysterious Glow",
            bpm=45,
            pattern="✨......✨......",
            phase_offset=0.0,
            color="GOLD"
        ),
        'trap': RhythmPattern(
            name="Hidden Danger",
            bpm=120,
            pattern="!.......!.......",
            phase_offset=0.33,
            color="RED"
        ),
        'healing_fountain': RhythmPattern(
            name="Restoration Flow",
            bpm=50,
            pattern="♥♥♥♥............",
            phase_offset=0.0,
            color="PINK"
        ),
        'magic_sword': RhythmPattern(
            name="Power Surge",
            bpm=100,
            pattern="⚔✦⚔✦⚔✦⚔✦⚔✦⚔✦",
            phase_offset=0.25,
            color="SILVER"
        )
    }

    @staticmethod
    def calculate_rhythm_sync(rhythm1: RhythmPattern, rhythm2: RhythmPattern,
                            current_time: float) -> float:
        """Calculate how synchronized two rhythms are (0-1)"""

        # Calculate current phase for each rhythm
        phase1 = (current_time * rhythm1.bpm / 60.0 + rhythm1.phase_offset) % 1.0
        phase2 = (current_time * rhythm2.bpm / 60.0 + rhythm2.phase_offset) % 1.0

        # Calculate sync (closer phases = higher sync)
        phase_diff = abs(phase1 - phase2)
        sync = 1.0 - min(phase_diff, 1.0 - phase_diff) * 2.0

        return sync

    @staticmethod
    def find_polyrhythm(rhythms: List[RhythmPattern]) -> Tuple[float, str]:
        """Find when multiple rhythms align perfectly!"""

        # Calculate least common multiple of all BPMs
        from math import gcd
        from functools import reduce

        def lcm(a, b):
            return abs(a * b) // gcd(a, b)

        all_bpms = [r.bpm for r in rhythms]
        alignment_bpm = reduce(lcm, all_bpms)
        alignment_time = 60.0 / alignment_bpm

        return alignment_time, f"Perfect alignment every {alignment_time:.2f} seconds!"

    @staticmethod
    def create_rhythm_visualization(entity_name: str, rhythm: RhythmPattern,
                                  current_time: float) -> str:
        """Visualize an entity's rhythm in real-time"""

        # Calculate current position in rhythm
        beat_position = (current_time * rhythm.bpm / 60.0) % len(rhythm.pattern)
        current_index = int(beat_position)

        # Create visualization
        viz = list(rhythm.pattern)
        viz[current_index] = '◆'  # Current beat marker

        return f"{entity_name:15} [{rhythm.bpm:3}bpm]: {''.join(viz)}"

    @staticmethod
    def generate_world_rhythm_display() -> str:
        """Show the ENTIRE WORLD'S RHYTHM!"""

        current_time = time.time()
        er = EntityRhythms()

        display = """
╔══════════════════════════════════════════════════════════════╗
║           🎵 UNIVERSAL RHYTHM SYMPHONY 🎵                   ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  PLAYER RHYTHMS:                                            ║
"""

        # Show player rhythms
        for class_name, rhythm in er.PLAYER_RHYTHMS.items():
            viz = er.create_rhythm_visualization(class_name.title(), rhythm, current_time)
            display += f"║  {viz}   ║\n"

        display += """║                                                              ║
║  CREATURE RHYTHMS:                                          ║
"""

        # Show creature rhythms
        for creature, rhythm in list(er.CREATURE_RHYTHMS.items())[:3]:
            viz = er.create_rhythm_visualization(creature.title(), rhythm, current_time)
            display += f"║  {viz}   ║\n"

        display += """║                                                              ║
║  ENVIRONMENT RHYTHMS:                                       ║
"""

        # Show environment rhythms
        for env, rhythm in list(er.ENVIRONMENT_RHYTHMS.items())[:3]:
            viz = er.create_rhythm_visualization(env.title(), rhythm, current_time)
            display += f"║  {viz}   ║\n"

        display += """║                                                              ║
╚══════════════════════════════════════════════════════════════╝
"""

        return display

    @staticmethod
    def rhythm_harmony_system() -> str:
        """When rhythms align, SPECIAL THINGS HAPPEN!"""

        return """
╔══════════════════════════════════════════════════════════════╗
║              🎵 RHYTHM HARMONY SYSTEM 🎵                    ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  WHEN RHYTHMS ALIGN:                                        ║
║                                                              ║
║  🎵 PLAYER + PLAYER = COMBO ATTACK                          ║
║     Warrior (60bpm) + Mage (90bpm)                         ║
║     = SYNCHRONIZED STRIKE every 2 seconds!                  ║
║                                                              ║
║  🎵 PLAYER + ENVIRONMENT = POWER BOOST                      ║
║     Mage (90bpm) + Crystal (60bpm)                         ║
║     = MANA SURGE when beats align!                         ║
║                                                              ║
║  🎵 CREATURE + CREATURE = PACK TACTICS                      ║
║     Wolf (140bpm) + Wolf (140bpm)                          ║
║     = COORDINATED HUNT when in sync!                       ║
║                                                              ║
║  🎵 OBJECT + ACTION = CRITICAL MOMENT                       ║
║     Trap (120bpm) + Rogue (180bpm)                         ║
║     = PERFECT DODGE window on alignment!                    ║
║                                                              ║
║  THE ENTIRE WORLD IS A LIVING SYMPHONY!                     ║
║                                                              ║
║  Special Events:                                            ║
║  • GRAND HARMONY: All rhythms align (rare!)                ║
║  • CHAOS STORM: No rhythms match (danger!)                 ║
║  • RHYTHM ECLIPSE: Boss disrupts all patterns              ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
"""

    @staticmethod
    def dynamic_rhythm_combat_example() -> str:
        """Show how combat works with individual rhythms!"""

        return """
╔══════════════════════════════════════════════════════════════╗
║         🎵 MULTI-RHYTHM COMBAT EXAMPLE 🎵                   ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  BATTLE: Party vs Dragon                                    ║
║                                                              ║
║  Warrior [60bpm]:  ████....████....  (Heavy hits)          ║
║           ↓               ↓                                 ║
║         CLASH!          CLASH!                              ║
║           ↓               ↓                                 ║
║  Dragon [40bpm]:   ████████........  (Devastating)         ║
║                                                              ║
║  Rogue [180bpm]:   █.█.█.█.█.█.█.█.  (Quick strikes)       ║
║          ↑ ↑ ↑ ↑ ↑ ↑ ↑ ↑                                  ║
║       Can attack 3x per Dragon beat!                        ║
║                                                              ║
║  Mage [90bpm]:     █...█...█...█...  (Spell timing)        ║
║                      ✦   ✦   ✦   ✦                         ║
║                 Charging between beats                       ║
║                                                              ║
║  Environment:                                                ║
║  Torch [200bpm]:   ████████████████  (Flickering)          ║
║  Crystal [60bpm]:  ✦...✦...✦...✦...  (Pulsing)            ║
║                                                              ║
║  HARMONY MOMENTS:                                           ║
║  • 0.5s: Warrior + Crystal ALIGN = POWER SURGE!            ║
║  • 1.0s: Rogue + Torch ALIGN = STEALTH BREAK!              ║
║  • 2.0s: ALL ALIGN = ULTIMATE COMBO OPPORTUNITY!           ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
"""

def demonstrate_universal_rhythm():
    """Show the UNIVERSAL RHYTHM SYSTEM in action!"""

    er = EntityRhythms()

    # Show the world rhythm
    print(er.generate_world_rhythm_display())

    # Show harmony system
    print(er.rhythm_harmony_system())

    # Show combat example
    print(er.dynamic_rhythm_combat_example())

    # Calculate some polyrhythms
    warrior_rhythm = er.PLAYER_RHYTHMS['warrior']
    mage_rhythm = er.PLAYER_RHYTHMS['mage']
    dragon_rhythm = er.CREATURE_RHYTHMS['dragon']

    rhythms = [warrior_rhythm, mage_rhythm, dragon_rhythm]
    alignment_time, message = er.find_polyrhythm(rhythms)

    print(f"\n🎵 POLYRHYTHM DISCOVERY: {message}")
    print(f"   Warrior (60bpm) + Mage (90bpm) + Dragon (40bpm)")
    print(f"   = PERFECT HARMONY every {alignment_time:.2f} seconds!")
    print(f"   Plan your ULTIMATE ATTACKS for these moments!")

if __name__ == "__main__":
    demonstrate_universal_rhythm()