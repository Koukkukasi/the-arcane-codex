"""
The Arcane Codex - Multi-Sensory Whisper System
Phase 3: Rich sensory experiences for immersive gameplay
"""

import json
import random
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, field
from datetime import datetime
import logging

from database import ArcaneDatabase

logger = logging.getLogger(__name__)

@dataclass
class SensoryWhisper:
    """Individual sensory whisper"""
    sense_type: str  # visual, audio, smell, touch, taste, supernatural, emotional, temporal
    content: str
    is_private: bool
    player_id: Optional[str]
    intensity: int = 5  # 1-10 scale
    triggers_memory: bool = False
    memory_content: Optional[str] = None
    emotional_impact: int = 0  # -100 to +100

@dataclass
class SensoryScene:
    """Complete sensory scene for a turn"""
    turn: int
    location: str
    public_senses: Dict[str, str]
    private_senses: Dict[str, Dict[str, str]]
    progressive_revelation: Dict[str, Dict]
    triggered_senses: Dict[str, str]
    ambient_atmosphere: str

class SensorySystem:
    """
    Manages all sensory whispers and environmental perceptions
    Creates rich, multi-layered sensory experiences
    """

    def __init__(self, db: ArcaneDatabase):
        self.db = db
        self.sense_icons = {
            'visual': '👁️',
            'audio': '👂',
            'smell': '👃',
            'touch': '✋',
            'taste': '👅',
            'supernatural': '🔮',
            'emotional': '💭',
            'temporal': '⏳',
            'life_force': '💚',
            'danger': '⚠️'
        }

    def generate_sensory_scene(self, game_state: Dict) -> SensoryScene:
        """Generate complete sensory experience for current scene"""

        location = game_state.get('location', 'Unknown')
        turn = game_state.get('turn', 0)
        players = game_state.get('players', [])
        environment = game_state.get('environment', {})

        # Generate base public senses
        public_senses = self.generate_public_senses(location, environment)

        # Generate private senses for each player
        private_senses = {}
        for player in players:
            private_senses[player['id']] = self.generate_private_senses(
                player, location, environment
            )

        # Generate progressive revelations
        progressive = self.generate_progressive_revelation(location, turn)

        # Generate triggered senses
        triggered = self.generate_triggered_senses(location)

        # Generate ambient atmosphere
        atmosphere = self.generate_atmosphere(location, environment)

        return SensoryScene(
            turn=turn,
            location=location,
            public_senses=public_senses,
            private_senses=private_senses,
            progressive_revelation=progressive,
            triggered_senses=triggered,
            ambient_atmosphere=atmosphere
        )

    def generate_public_senses(self, location: str, environment: Dict) -> Dict[str, str]:
        """Generate senses everyone experiences"""

        # Base sensory templates by location type
        location_senses = {
            'warehouse': {
                'visual': "Dust motes dance in shafts of light filtering through broken windows. Shadows pool in corners like spilled ink.",
                'audio': "The building groans with age. Somewhere, water drips with metronomic persistence.",
                'smell': "Mildew and rust compete with the ghost of old grain. Something died here, long ago.",
                'touch': "The air is thick and clammy, clinging to your skin like invisible cobwebs."
            },
            'forest': {
                'visual': "Ancient trees form a living cathedral. Light filters green through the canopy.",
                'audio': "The forest breathes around you - rustling leaves, creaking wood, distant bird calls.",
                'smell': "Rich earth and decomposing leaves. The green smell of growing things.",
                'touch': "Cool air kisses your skin. The ground is soft with centuries of fallen needles."
            },
            'dungeon': {
                'visual': "Torchlight flickers against wet stone walls. Your shadows dance like living things.",
                'audio': "Echoes of your footsteps return changed, as if something else walks with you.",
                'smell': "Stone and stagnant water. Beneath it, something organic and wrong.",
                'touch': "The walls are slick with moisture that isn't quite water. The air is oppressively close."
            },
            'town_square': {
                'visual': "Cobblestones gleam with recent rain. Market stalls stand empty, canvas flapping.",
                'audio': "Distant voices carry on the wind. A dog barks. A door slams.",
                'smell': "Wood smoke, horse dung, and baking bread create a uniquely civilized bouquet.",
                'touch': "The breeze carries both warmth from hearth fires and the bite of approaching night."
            }
        }

        # Get base senses or generate generic ones
        base_location = location.lower().replace(' ', '_')
        for key in location_senses:
            if key in base_location:
                return location_senses[key]

        # Default senses if location not found
        return {
            'visual': f"You find yourself in {location}. Details emerge as your eyes adjust.",
            'audio': "Various sounds fill the air, creating an ambient symphony of place.",
            'smell': "The scent of this place is distinctive, though hard to describe.",
            'touch': "The environment presses against your senses, demanding attention."
        }

    def generate_private_senses(self, player: Dict, location: str, environment: Dict) -> Dict[str, str]:
        """Generate class-specific private sensory whispers"""

        class_type = player.get('class_type', 'Unknown')
        senses = {}

        # Class-specific sensory abilities
        class_senses = {
            'Fighter': {
                'visual': "Your trained eye catalogues defensive positions and potential ambush points.",
                'audio': "You recognize the distinctive scrape of metal on leather - weapons being drawn quietly.",
                'touch': "Floor vibrations tell you there are three... no, four people moving above you.",
                'danger': "Every instinct screams danger. Your hand moves unconsciously to your weapon."
            },
            'Mage': {
                'visual': "Arcane energies shimmer at the edge of perception, revealing hidden wards and magical traces.",
                'supernatural': "The Weave is torn here. Something powerful and wrong happened in this place.",
                'taste': "Magic tastes of copper and burnt ozone. A spell was cast moments ago.",
                'temporal': "You glimpse an echo - translucent figures performing a ritual that hasn't happened yet."
            },
            'Thief': {
                'visual': "Your practiced gaze finds the hidden: a seam in the wall, scratches near the lock, footprints in dust.",
                'audio': "You hear what others miss - breathing behind the door, the tick of a mechanical trap arming.",
                'touch': "Your fingers detect the minute temperature difference where a secret panel hides.",
                'emotional': "You read the room's nervous energy. Someone here is lying, and badly."
            },
            'Ranger': {
                'smell': "Your nose parses a complex story: three different creatures passed here, one bleeding.",
                'audio': "Nature's warning signs are clear - no birdsong means predators near.",
                'life_force': "You sense seven heartbeats in the room, but see only three people.",
                'visual': "Tiny details tell tales: bent grass, disturbed dust, a single scale caught on wood."
            },
            'Cleric': {
                'supernatural': "Divine presence burns bright here. Your god's attention is focused on this moment.",
                'emotional': "You feel the psychic weight of suffering. Many died here, and not peacefully.",
                'life_force': "That one has no soul. The body moves, but nothing dwells within.",
                'visual': "In your sight, auras reveal truth: the green of lies, the gold of pure intent."
            },
            'Bard': {
                'emotional': "The emotional resonance is overwhelming: betrayal, rage, and underneath, desperate love.",
                'audio': "You hear the subtle music of social dynamics - who leads, who follows, who plans betrayal.",
                'supernatural': "Stories cling to this place like cobwebs. You could pluck them and make them sing.",
                'visual': "Micro-expressions reveal everything: the guard's fear, the merchant's greed, the child's hope."
            }
        }

        # Get class-specific senses or generate generic ones
        if class_type in class_senses:
            senses = class_senses[class_type]
        else:
            senses = {
                'visual': "You notice details others might miss.",
                'audio': "Something in the soundscape catches your attention.",
                'intuition': "A feeling nags at you - something isn't right here."
            }

        # Add random personal memory triggers
        if random.random() < 0.2:  # 20% chance
            senses['memory'] = self.generate_memory_trigger(player, location)

        return senses

    def generate_memory_trigger(self, player: Dict, location: str) -> str:
        """Generate a sensory memory trigger"""

        memories = [
            "The smell reminds you of your childhood home, just before it burned.",
            "This sound - you heard it the night your mentor died.",
            "The temperature, the light - exactly like the day you lost everything.",
            "Your mother used to hum that tune. She's been dead for ten years.",
            "This taste... the poison that nearly killed you. Your hand trembles.",
            "You've been here before. In a dream. Or was it a prophecy?",
            "The texture under your fingers - same as the rope that couldn't hold your friend.",
            "This particular shade of shadow - you saw it the day you first killed.",
        ]

        return random.choice(memories)

    def generate_progressive_revelation(self, location: str, turn: int) -> Dict[str, Dict]:
        """Generate senses that reveal over time"""

        revelations = {
            'immediate': {
                'description': "What you notice right away",
                'senses': {
                    'visual': "The obvious details present themselves.",
                    'audio': "The loudest sounds demand attention."
                }
            },
            'after_observation': {
                'description': "What careful observation reveals",
                'requirement': "Spend time investigating",
                'senses': {
                    'visual': "Patterns emerge. What seemed random has structure.",
                    'smell': "Under the obvious scents, something else. Older. Wronger."
                }
            },
            'after_time': {
                'description': "What time reveals",
                'requirement': f"After turn {turn + 3}",
                'senses': {
                    'audio': "You've been here long enough to notice it - breathing. In the walls.",
                    'supernatural': "The longer you stay, the thinner reality becomes."
                }
            }
        }

        return revelations

    def generate_triggered_senses(self, location: str) -> Dict[str, str]:
        """Generate conditional sensory triggers"""

        triggers = {
            'if_touch_door': "The door is warm. Body temperature. It pulses slightly under your hand.",
            'if_cast_detect_magic': "The illusion shatters. The 'guests' are corpses, puppeted by invisible strings.",
            'if_stay_silent': "In the silence, you hear it - something massive breathing, very slowly, below you.",
            'if_examine_blood': "It's not red. In direct light, it's slightly purple. Not human blood.",
            'if_speak_loudly': "Your voice echoes back wrong. There are words in the echo you didn't speak.",
            'if_use_fire': "The shadows flee from your flame, but one shadow moves against the light.",
            'if_pray': "Your prayer is answered by two voices. One is your god. The other... isn't.",
            'if_taste_food': "Bitter almonds. Your training kicks in - cyanide. You have minutes.",
        }

        return triggers

    def generate_atmosphere(self, location: str, environment: Dict) -> str:
        """Generate overall atmospheric description"""

        time_of_day = environment.get('time', 'unknown')
        weather = environment.get('weather', 'clear')
        danger_level = environment.get('danger', 'moderate')

        atmospheres = {
            'safe': "Despite everything, this place feels secure. You could rest here.",
            'tense': "The air itself seems to hold its breath. Something is about to happen.",
            'dangerous': "Every sense screams danger. Your body prepares for fight or flight.",
            'mysterious': "Reality feels negotiable here. The rules might be different.",
            'oppressive': "The weight of this place presses down. Each breath is an effort.",
            'energizing': "Power thrums through this place. You feel more capable, more alive.",
            'wrong': "This place should not exist. Your mind recoils from impossible angles.",
            'sacred': "Holiness saturates the very air. The profane cannot endure here.",
            'cursed': "Malevolence seeps from every surface. This place hates the living."
        }

        # Select based on danger level
        if danger_level == 'extreme':
            return atmospheres['wrong']
        elif danger_level == 'high':
            return atmospheres['dangerous']
        elif danger_level == 'low':
            return atmospheres['safe']
        else:
            return random.choice(list(atmospheres.values()))

    def create_sensory_puzzle(self, puzzle_type: str) -> Dict[str, Any]:
        """Create a puzzle that requires multiple senses to solve"""

        puzzles = {
            'impostor': {
                'setup': "Five identical figures claim to be your ally.",
                'public': "They look exactly the same, sound the same.",
                'solution_senses': {
                    'smell': "Only one has the right scent - leather and pipe smoke.",
                    'supernatural': "Only one has a soul.",
                    'emotional': "Only one radiates genuine concern for you.",
                    'audio': "Only one's heartbeat is calm."
                },
                'false_senses': {
                    'visual': "They're all perfect copies visually.",
                    'voice': "Voice mimicry is flawless."
                }
            },
            'poisoned_feast': {
                'setup': "A lavish banquet, but something is wrong.",
                'public': "Delicious aromas, beautiful presentation.",
                'solution_senses': {
                    'smell': "Bitter almonds on the third dish.",
                    'supernatural': "Death aura on the wine.",
                    'visual': "Shimmer of poison on the soup.",
                    'life_force': "The servant serving it has no life signs."
                }
            },
            'hidden_door': {
                'setup': "The way forward is hidden.",
                'public': "Solid stone walls on all sides.",
                'solution_senses': {
                    'touch': "Temperature difference on one section.",
                    'audio': "Hollow sound when tapped here.",
                    'smell': "Fresh air from this crack.",
                    'visual': "Worn stone where many hands touched."
                }
            }
        }

        return puzzles.get(puzzle_type, puzzles['impostor'])

    def apply_sensory_deprivation(self, player_id: str, sense_type: str, duration: int):
        """Remove a sense from a player temporarily"""

        logger.info(f"Player {player_id} lost sense: {sense_type} for {duration} turns")

        # Store in database
        with self.db.get_connection() as conn:
            conn.execute("""
                INSERT INTO sensory_memories
                (player_id, trigger_sense, trigger_content, memory_content, emotional_impact)
                VALUES (?, ?, ?, ?, ?)
            """, (player_id, sense_type, 'deprived',
                 f'Lost {sense_type} for {duration} turns', -50))

    def enhance_sense(self, player_id: str, sense_type: str, bonus: int):
        """Temporarily enhance a player's sense"""

        logger.info(f"Player {player_id} enhanced sense: {sense_type} +{bonus}")

        # This would affect future sense checks
        # Store the enhancement for later use

    def create_synesthesia_effect(self, player_id: str) -> Dict[str, str]:
        """Create synesthetic sensory confusion"""

        effects = {
            'visual': "Colors have flavors. Red tastes of iron, blue of winter.",
            'audio': "Sounds have textures. Voices feel like sandpaper on your mind.",
            'smell': "Scents have colors. Danger smells purple, safety smells green.",
            'touch': "Textures sing. Rough surfaces scream, smooth ones whisper.",
            'taste': "Flavors have shapes. Sweet is round, bitter is jagged.",
            'all': "Your senses blend into incomprehensible symphony. Reality becomes jazz."
        }

        return effects

    def generate_horror_progression(self, turn: int) -> Dict[str, str]:
        """Generate progressive horror through senses"""

        progression = {
            1: {
                'visual': "Something moves in peripheral vision.",
                'audio': "Was that a footstep?",
                'atmosphere': "Unease"
            },
            2: {
                'smell': "Rot. Faint but unmistakable.",
                'touch': "The walls are slightly warm. And soft.",
                'atmosphere': "Dread"
            },
            3: {
                'audio': "Breathing. Not yours. Close.",
                'visual': "The walls are definitely moving.",
                'atmosphere': "Fear"
            },
            4: {
                'all': "You're inside something. Something alive. Something hungry.",
                'atmosphere': "Terror"
            }
        }

        stage = min(turn, 4)
        return progression.get(stage, progression[4])

    def save_sensory_scene(self, game_id: str, scene: SensoryScene):
        """Save sensory scene to database"""

        # Save public senses
        for sense_type, content in scene.public_senses.items():
            self.db.save_whisper(
                game_id, scene.turn, None,
                sense_type, content, is_public=True
            )

        # Save private senses
        for player_id, senses in scene.private_senses.items():
            for sense_type, content in senses.items():
                self.db.save_whisper(
                    game_id, scene.turn, player_id,
                    sense_type, content, is_public=False
                )

    def distribute_senses(self, game_id: str, scene: SensoryScene, socketio):
        """Distribute sensory information via SocketIO"""

        # Public senses to everyone
        socketio.emit('public_senses', {
            'senses': scene.public_senses,
            'atmosphere': scene.ambient_atmosphere,
            'turn': scene.turn
        }, room=game_id)

        # Private senses to individuals
        for player_id, senses in scene.private_senses.items():
            socketio.emit('private_senses', {
                'senses': senses,
                'location': scene.location,
                'instructions': 'These sensory whispers are yours alone. Share or keep secret?'
            }, room=f"player_{player_id}")

        # Send progressive revelation hints
        socketio.emit('progressive_hints', {
            'revelations': scene.progressive_revelation
        }, room=game_id)


# Sensory prompt templates for MCP
SENSORY_PROMPTS = {
    'base': """Generate rich sensory details for: {location}

Requirements:
1. PUBLIC senses (everyone experiences)
   - Visual: Lighting, colors, movement
   - Audio: Ambient sounds, voices, silence
   - Smell: Dominant scents, underlying notes
   - Touch: Temperature, humidity, textures

2. PRIVATE senses per class:
   - Fighter: Tactical, danger, structural
   - Mage: Magical, supernatural, temporal
   - Thief: Hidden, valuable, social cues
   - Ranger: Natural, tracks, life signs
   - Cleric: Divine, souls, emotional
   - Bard: Emotional, social, story

3. Make senses CONTRADICT for drama
4. Hide critical info in specific senses
5. Use specific, evocative details

Return as JSON with structure defined above.""",

    'horror': """Generate escalating sensory horror for: {location}

Build dread through:
1. Subtle wrongness (turn 1-2)
2. Growing unease (turn 3-4)
3. Horrible revelation (turn 5+)

Focus on:
- Things that shouldn't be warm being warm
- Wrong number of shadows/heartbeats
- Smells that tell terrible stories
- Sounds that don't match sources
- Touch revealing awful truths

Make players realize the horror slowly.""",

    'puzzle': """Generate sensory puzzle requiring collaboration:

Setup: {puzzle_setup}

Requirements:
1. Each player class gets different critical clue
2. No single sense reveals whole truth
3. Some senses deliberately mislead
4. Solution requires sharing all info
5. Red herrings in obvious senses

Make players debate what to trust."""
}

# Testing
if __name__ == "__main__":
    db = ArcaneDatabase()
    sensory = SensorySystem(db)

    # Test scene generation
    test_state = {
        'location': 'Abandoned Warehouse',
        'turn': 5,
        'players': [
            {'id': 'p1', 'name': 'Aldric', 'class_type': 'Fighter'},
            {'id': 'p2', 'name': 'Mystra', 'class_type': 'Mage'}
        ],
        'environment': {
            'time': 'midnight',
            'weather': 'storm',
            'danger': 'high'
        }
    }

    scene = sensory.generate_sensory_scene(test_state)

    print("=== SENSORY SCENE ===")
    print(f"Location: {scene.location}")
    print(f"Atmosphere: {scene.ambient_atmosphere}")
    print("\nPublic Senses:")
    for sense, description in scene.public_senses.items():
        print(f"  {sensory.sense_icons.get(sense, '❓')} {sense.upper()}: {description}")

    print("\nPrivate Senses:")
    for player_id, senses in scene.private_senses.items():
        print(f"\n  Player {player_id}:")
        for sense, description in senses.items():
            print(f"    {sensory.sense_icons.get(sense, '❓')} {sense}: {description[:80]}...")

    print("\n✅ Sensory system test complete!")