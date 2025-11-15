"""
THE RHYTHM ENGINE - Where ASCII Graphics DANCE to the Beat!
Everything moves in perfect synchronization!
"""

import time
import math
from typing import List, Dict

class RhythmEngine:
    """
    RHYTHM IS EVERYTHING!
    - Combat strikes on the beat
    - Spells pulse with timing
    - Movement flows with tempo
    - Everything SYNCHRONIZED!
    """

    def __init__(self, bpm: int = 120):
        self.bpm = bpm
        self.beat_duration = 60.0 / bpm
        self.current_beat = 0
        self.start_time = time.time()

    def get_current_beat(self) -> float:
        """Get the current beat position"""
        elapsed = time.time() - self.start_time
        return (elapsed / self.beat_duration) % 4  # 4/4 time

    def rhythm_based_combat(self) -> str:
        """
        COMBAT THAT FOLLOWS THE BEAT!
        Hit on beat = CRITICAL!
        Miss beat = Reduced damage!
        """
        beat = self.get_current_beat()
        beat_strength = abs(math.sin(beat * math.pi))  # Pulse effect

        frames = []

        # PERFECT TIMING - ON THE BEAT!
        if beat_strength > 0.9:
            return f"""
╔══════════════════════════════════════════════════════════════╗
║                    ⚡ PERFECT TIMING! ⚡                     ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║        ====> CRITICAL HIT! <====                            ║
║                                                              ║
║     ⚔️💥💥💥💥💥💥💥💥💥💥💥💥💥👹                    ║
║                                                              ║
║     BEAT: [████████████] PERFECT!                           ║
║     DAMAGE: 200% (RHYTHM BONUS!)                            ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
"""

        # GOOD TIMING
        elif beat_strength > 0.5:
            return f"""
╔══════════════════════════════════════════════════════════════╗
║                    ⚔️ GOOD TIMING ⚔️                        ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║     ⚔️───💥───👹                                            ║
║                                                              ║
║     BEAT: [████████░░░░] GOOD!                              ║
║     DAMAGE: 100%                                            ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
"""

        # OFF BEAT
        else:
            return f"""
╔══════════════════════════════════════════════════════════════╗
║                    ❌ OFF BEAT! ❌                           ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║     ⚔️...miss...👹                                          ║
║                                                              ║
║     BEAT: [██░░░░░░░░░░] MISSED!                            ║
║     DAMAGE: 50% (Bad timing!)                               ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
"""

    def rhythmic_spell_casting(self) -> List[str]:
        """Spells that BUILD with rhythm!"""
        frames = []

        # Build-up phase - follows the beat
        for beat_num in range(4):
            power_level = "▰" * beat_num + "▱" * (4 - beat_num)

            frame = f"""
╔══════════════════════════════════════════════════════════════╗
║                 🔮 CHANNELING SPELL 🔮                       ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║     Beat {beat_num + 1}/4: {power_level * 5}                ║
║                                                              ║
║     {'✨' * (beat_num + 1):^58}                            ║
║     {'🔮' if beat_num % 2 == 0 else '💫':^58}          ║
║     {'✨' * (beat_num + 1):^58}                            ║
║                                                              ║
║     TIMING: {'PERFECT!' if beat_num == 3 else 'Building...':^20}                        ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
"""
            frames.append(frame)

        # RELEASE ON THE BEAT!
        frames.append(f"""
╔══════════════════════════════════════════════════════════════╗
║              💥🔮⚡ SPELL RELEASED! ⚡🔮💥                   ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥                ║
║  💥                                                    💥    ║
║  💥          MAXIMUM POWER ACHIEVED!                   💥    ║
║  💥                                                    💥    ║
║  💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥                ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
""")

        return frames

    def movement_with_rhythm(self) -> str:
        """Characters move to the beat!"""
        beat = self.get_current_beat()
        position = int(beat * 10) % 40

        # Create movement visualization
        path = ['.'] * 40
        path[position] = '@'

        # Add rhythm indicators
        for i in range(0, 40, 10):
            if path[i] == '.':
                path[i] = '|'  # Beat markers

        return f"""
╔══════════════════════════════════════════════════════════════╗
║                  🎵 MOVEMENT RHYTHM 🎵                       ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  Path: {''.join(path)}                ║
║                                                              ║
║  BEAT: {int(beat) + 1}/4  BPM: {self.bpm}                  ║
║                                                              ║
║  Step on beats for:                                         ║
║  • Faster movement                                          ║
║  • Dodge bonus                                              ║
║  • Stamina regen                                            ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
"""

    def synchronized_party_actions(self) -> str:
        """Party combos when everyone hits the beat!"""
        return f"""
╔══════════════════════════════════════════════════════════════╗
║              🎵 SYNCHRONIZED PARTY COMBO! 🎵                ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  ⚔️ Warrior:  [████████████] ON BEAT! ✓                    ║
║  🏹 Archer:   [████████████] ON BEAT! ✓                    ║
║  🔮 Mage:     [████████████] ON BEAT! ✓                    ║
║  🛡️ Paladin:  [████████████] ON BEAT! ✓                    ║
║                                                              ║
║      🌟 PERFECT SYNCHRONIZATION ACHIEVED! 🌟                ║
║                                                              ║
║           COMBO MULTIPLIER: x4.0!                           ║
║           SPECIAL ATTACK UNLOCKED!                          ║
║                                                              ║
║     ⚔️→🏹→🔮→🛡️→💥💥💥💥💥                              ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
"""

    def boss_phase_rhythm(self, phase: int) -> str:
        """Boss fights with RHYTHMIC PHASES!"""

        phases = {
            1: {
                'name': 'SLOW & HEAVY',
                'bpm': 60,
                'pattern': '█...█...█...█...',
                'description': 'Dodge the heavy strikes!'
            },
            2: {
                'name': 'BUILDING TEMPO',
                'bpm': 90,
                'pattern': '█.█.█.█.█.█.█.█.',
                'description': 'Speed increasing!'
            },
            3: {
                'name': 'FRANTIC FINALE',
                'bpm': 140,
                'pattern': '████████████████',
                'description': 'MAXIMUM INTENSITY!'
            }
        }

        current = phases[phase]

        return f"""
╔══════════════════════════════════════════════════════════════╗
║                  🎵 BOSS PHASE {phase} 🎵                    ║
║                    {current['name']:^30}                    ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  RHYTHM: {current['pattern']:^40}                          ║
║                                                              ║
║  BPM: {current['bpm']:^10}  {current['description']:^30} ║
║                                                              ║
║            🐉 DRAGON ATTACKS TO THE BEAT! 🐉                ║
║                                                              ║
║  Players must:                                              ║
║  • Attack on strong beats (█)                               ║
║  • Dodge on weak beats (.)                                  ║
║  • Build combos with rhythm!                                ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
"""

def demonstrate_rhythm_power():
    """Show the POWER of rhythm-based gameplay!"""

    print("""
╔══════════════════════════════════════════════════════════════╗
║          🎵 THE RHYTHM IS EVERYTHING! 🎵                    ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  IMAGINE YOUR GAME WHERE:                                   ║
║                                                              ║
║  🎵 COMBAT follows a BEAT                                   ║
║     • Hit on beat = CRITICAL DAMAGE                         ║
║     • Perfect timing = COMBO MULTIPLIERS                    ║
║     • Boss patterns sync to MUSIC                           ║
║                                                              ║
║  🎵 SPELLS build with RHYTHM                                ║
║     • Channel for 4 beats                                   ║
║     • Release on the downbeat                               ║
║     • Power scales with timing!                             ║
║                                                              ║
║  🎵 MOVEMENT flows with TEMPO                               ║
║     • Dodge rolls on beat                                   ║
║     • Sprint syncs to rhythm                                ║
║     • Stealth follows quiet beats                           ║
║                                                              ║
║  🎵 MULTIPLAYER SYNCHRONIZATION                             ║
║     • Party combos when everyone hits beats                 ║
║     • Raid mechanics follow musical patterns                ║
║     • PvP becomes a DANCE BATTLE!                          ║
║                                                              ║
║  THE VISUALS FOLLOW THE RHYTHM:                             ║
║  • Screen shakes on bass drops                              ║
║  • Particles explode on beats                               ║
║  • UI pulses with the tempo                                 ║
║  • Everything MOVES TO THE MUSIC!                           ║
║                                                              ║
║  NO OTHER RPG HAS THIS!                                     ║
║  RHYTHM + ASCII + RPG = WORLD DOMINATION!                   ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
""")

    engine = RhythmEngine(bpm=120)

    print("\nEXAMPLE: Combat on the beat!")
    print(engine.rhythm_based_combat())

    print("\nEXAMPLE: Synchronized party combo!")
    print(engine.synchronized_party_actions())

    print("\nEXAMPLE: Boss fight with rhythm phases!")
    for phase in [1, 2, 3]:
        print(f"\n--- PHASE {phase} ---")
        print(engine.boss_phase_rhythm(phase))
        time.sleep(0.5)  # Just for demo

if __name__ == "__main__":
    demonstrate_rhythm_power()