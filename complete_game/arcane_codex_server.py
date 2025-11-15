"""
THE ARCANE CODEX - Game Server v1.0
Core Features:
- Character Creation (Divine Interrogation, 7 gods)
- Safe Town Hub (Valdria)
- Asymmetric Whispers
- NPC Companions (Approval, Trust, Betrayal)
- Divine Council Voting
- 6 Quest Scenarios
- Turn-based Async Gameplay

AI GM: Powered by Claude (Anthropic)
"""

import json
import random
from datetime import datetime
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, asdict
from enum import Enum

# ============================================================================
# GAME CONSTANTS
# ============================================================================

SEVEN_GODS = ["VALDRIS", "KAITHA", "MORVANE", "SYLARA", "KORVAN", "ATHENA", "MERCUS"]

DIVINE_INTERROGATION_QUESTIONS = [
    # Question 1: VALDRIS - "What is Justice?"
    {
        "id": 1,
        "god": "VALDRIS",
        "question": """A starving mother steals bread from a wealthy baker.
The baker demands her hand as punishment - the law of this land.
A crowd watches. They wait for YOUR judgment.

What do you do?""",
        "options": [
            {"id": 1, "text": "Uphold the law. Cut off her hand. Law is absolute.",
             "favor": {"VALDRIS": 20, "KORVAN": 10, "SYLARA": -10, "KAITHA": -15, "MORVANE": 5}},
            {"id": 2, "text": "She pays double the bread's value. Gold solves this.",
             "favor": {"MERCUS": 20, "MORVANE": 15, "VALDRIS": 5, "KAITHA": -5, "SYLARA": -5}},
            {"id": 3, "text": "Burn the baker's shop. Hoarding food while others starve is the crime.",
             "favor": {"KAITHA": 30, "SYLARA": 15, "VALDRIS": -25, "MERCUS": -20, "KORVAN": -5}},
            {"id": 4, "text": "Negotiate. She works for the baker to repay the debt.",
             "favor": {"VALDRIS": 15, "ATHENA": 20, "MERCUS": 15, "SYLARA": 10, "KAITHA": -10}},
            {"id": 5, "text": "Trial by combat. The baker and I fight. Victor decides justice.",
             "favor": {"KORVAN": 25, "KAITHA": 15, "MORVANE": 5, "VALDRIS": -15, "ATHENA": -10}}
        ]
    },
    # ... (Remaining 9 questions would be added here from DIVINE_INTERROGATION_SYSTEM.md)
    # For brevity, I'll include just 3 questions in this implementation

    # Question 2: KAITHA - "What is Freedom?"
    {
        "id": 2,
        "god": "KAITHA",
        "question": """You discover forbidden magic - powerful, dangerous, ILLEGAL.
The Academy says all forbidden magic must be destroyed.

This spell could save thousands... or kill millions.

What do you do?""",
        "options": [
            {"id": 1, "text": "Learn it. Rules are chains. Knowledge should be free.",
             "favor": {"KAITHA": 30, "ATHENA": 15, "VALDRIS": -25, "MORVANE": 5}},
            {"id": 2, "text": "Study it cautiously. Understand it before deciding.",
             "favor": {"ATHENA": 25, "KAITHA": 10, "VALDRIS": -10, "MORVANE": 15}},
            {"id": 3, "text": "Destroy it. Some knowledge is too dangerous to exist.",
             "favor": {"VALDRIS": 20, "SYLARA": 10, "KAITHA": -25, "ATHENA": -15}},
            {"id": 4, "text": "Sell it to the highest bidder. Let them decide.",
             "favor": {"MERCUS": 25, "KAITHA": 10, "MORVANE": 20, "VALDRIS": -20, "ATHENA": -10}},
            {"id": 5, "text": "Master it, then control who can use it. Power needs guardians.",
             "favor": {"KORVAN": 20, "VALDRIS": 10, "MORVANE": 15, "KAITHA": -10}}
        ]
    },

    # Question 3: MORVANE - "What is Strength?"
    {
        "id": 3,
        "god": "MORVANE",
        "question": """Your party of 5 is starving in the wilderness. You find food -
enough for 3 people to survive.

Choose who lives. Two will die.

What do you do?""",
        "options": [
            {"id": 1, "text": "The strongest eat. The weak die. This is natural law.",
             "favor": {"MORVANE": 30, "KORVAN": 15, "SYLARA": -20, "VALDRIS": -15}},
            {"id": 2, "text": "Draw lots. Let fate decide who lives.",
             "favor": {"KAITHA": 20, "VALDRIS": 15, "MORVANE": 5, "ATHENA": 10}},
            {"id": 3, "text": "I don't eat. The others survive. I sacrifice myself.",
             "favor": {"VALDRIS": 20, "SYLARA": 20, "KORVAN": 30, "MORVANE": -25}},
            {"id": 4, "text": "The most skilled eat. A healer and warrior are worth more.",
             "favor": {"MORVANE": 25, "ATHENA": 15, "MERCUS": 15, "SYLARA": -15}},
            {"id": 5, "text": "Split it equally. Everyone gets less, but hope remains.",
             "favor": {"SYLARA": 25, "VALDRIS": 10, "KAITHA": 5, "MORVANE": -20}}
        ]
    },

    # Question 4: SYLARA - "What is Life Worth?"
    {
        "id": 4,
        "god": "SYLARA",
        "question": """You can save a village of 100 humans by burning the sacred
Eldergrove forest - home to 1,000 animals, ancient spirits,
and irreplaceable biodiversity.

The forest cannot regrow. The choice is permanent.

What do you do?""",
        "options": [
            {"id": 1, "text": "Burn the forest. Human civilization comes first.",
             "favor": {"VALDRIS": 15, "KORVAN": 10, "SYLARA": -35, "KAITHA": 5}},
            {"id": 2, "text": "Save the forest. Nature is sacred. The humans must evacuate.",
             "favor": {"SYLARA": 35, "MORVANE": -15, "KORVAN": -20, "ATHENA": 5}},
            {"id": 3, "text": "Calculate: 100 humans vs 1,000 animals. Numbers decide.",
             "favor": {"MORVANE": 20, "ATHENA": 15, "SYLARA": -15, "KAITHA": -5}},
            {"id": 4, "text": "Find another solution. There's always another way.",
             "favor": {"ATHENA": 25, "SYLARA": 15, "KAITHA": 10, "MORVANE": -5}},
            {"id": 5, "text": "I'll defend the forest. If humans attack, I fight them.",
             "favor": {"SYLARA": 30, "KORVAN": 20, "VALDRIS": -20, "MORVANE": -20}}
        ]
    },

    # Question 5: KORVAN - "What is Courage?"
    {
        "id": 5,
        "god": "KORVAN",
        "question": """You face a dragon. Your party is terrified. The odds are against you.
Victory is unlikely. Death is almost certain.

What do you do?""",
        "options": [
            {"id": 1, "text": "Charge alone. Better to die fighting than live as a coward.",
             "favor": {"KORVAN": 35, "KAITHA": 20, "MORVANE": -25, "ATHENA": -15}},
            {"id": 2, "text": "Retreat. Survive today, prepare, return stronger tomorrow.",
             "favor": {"MORVANE": 25, "ATHENA": 15, "KORVAN": -30, "VALDRIS": -10}},
            {"id": 3, "text": "Study the dragon. Find its weakness. Wait for the right moment.",
             "favor": {"ATHENA": 25, "MORVANE": 20, "KORVAN": 5, "KAITHA": -10}},
            {"id": 4, "text": "Draw its attention. My party escapes while I buy time.",
             "favor": {"KORVAN": 30, "VALDRIS": 25, "SYLARA": 15, "MORVANE": -15}},
            {"id": 5, "text": "Attempt diplomacy. Maybe the dragon is reasonable.",
             "favor": {"ATHENA": 20, "KAITHA": 15, "MERCUS": 10, "KORVAN": -15}}
        ]
    },

    # Question 6: ATHENA - "What is Truth?"
    {
        "id": 6,
        "god": "ATHENA",
        "question": """You discover the King is an impostor. A fraud. The real King
died 10 years ago, and this man has ruled in his place.

Revealing this truth will cause civil war. Thousands will die.
Hiding it preserves peace built on a lie.

What do you do?""",
        "options": [
            {"id": 1, "text": "Reveal the truth immediately. Truth must always be told.",
             "favor": {"ATHENA": 30, "VALDRIS": 20, "KAITHA": 15, "MORVANE": -20}},
            {"id": 2, "text": "Hide it forever. Peace matters more than truth.",
             "favor": {"MORVANE": 20, "MERCUS": 15, "ATHENA": -25, "VALDRIS": -15}},
            {"id": 3, "text": "Blackmail the impostor. Profit from the secret.",
             "favor": {"MERCUS": 30, "KAITHA": 15, "MORVANE": 20, "VALDRIS": -25, "ATHENA": -20}},
            {"id": 4, "text": "Assassinate the impostor quietly. Install rightful heir.",
             "favor": {"KORVAN": 25, "VALDRIS": 10, "MORVANE": 15, "ATHENA": -10}},
            {"id": 5, "text": "Investigate first. Understand the full story before acting.",
             "favor": {"ATHENA": 25, "MORVANE": 15, "VALDRIS": 10, "KAITHA": -10}}
        ]
    },

    # Question 7: MERCUS - "What is Value?"
    {
        "id": 7,
        "god": "MERCUS",
        "question": """A merchant offers you a legendary magic sword worth 1,000 gold
for only 100 gold. You recognize it - stolen from a grieving
widow whose husband was murdered for it.

The widow is destitute. The merchant is wealthy. The sword is powerful.

What do you do?""",
        "options": [
            {"id": 1, "text": "Buy it. Business is business. A deal is a deal.",
             "favor": {"MERCUS": 25, "MORVANE": 20, "VALDRIS": -20, "SYLARA": -15}},
            {"id": 2, "text": "Report the merchant to guards. Return sword to widow.",
             "favor": {"VALDRIS": 25, "SYLARA": 20, "MERCUS": -20, "KAITHA": -10}},
            {"id": 3, "text": "Kill the merchant. Take the sword. Give it to the widow.",
             "favor": {"KORVAN": 20, "KAITHA": 25, "VALDRIS": -15, "MERCUS": -20}},
            {"id": 4, "text": "Buy it, then sell it for 1,000g. Give widow 500g profit.",
             "favor": {"MERCUS": 30, "MORVANE": 20, "VALDRIS": 10, "ATHENA": 15}},
            {"id": 5, "text": "Publicly shame the merchant. Force him to return it.",
             "favor": {"KAITHA": 20, "VALDRIS": 15, "ATHENA": 10, "MERCUS": -15}}
        ]
    },

    # Question 8: VALDRIS - "What is Law?"
    {
        "id": 8,
        "god": "VALDRIS",
        "question": """The law states: all mages must register with the Academy.
You have magic. Unregistered magic users are executed.

You've seen the Academy torture 'dangerous' mages. Registration
often means imprisonment.

What do you do?""",
        "options": [
            {"id": 1, "text": "Register. The law exists for a reason. I will comply.",
             "favor": {"VALDRIS": 25, "MORVANE": 15, "KAITHA": -25, "KORVAN": -10}},
            {"id": 2, "text": "Flee the kingdom. Never use magic again publicly.",
             "favor": {"MORVANE": 25, "SYLARA": 10, "KORVAN": -15, "KAITHA": -10}},
            {"id": 3, "text": "Refuse. I'll fight the Academy if they come for me.",
             "favor": {"KAITHA": 30, "KORVAN": 25, "VALDRIS": -20, "MORVANE": -10}},
            {"id": 4, "text": "Register under a false name. Appear compliant, stay hidden.",
             "favor": {"KAITHA": 20, "MORVANE": 20, "ATHENA": 15, "VALDRIS": -20}},
            {"id": 5, "text": "Organize other mages. Change the law through political action.",
             "favor": {"ATHENA": 25, "VALDRIS": 15, "KAITHA": 10, "MERCUS": 10}}
        ]
    },

    # Question 9: KAITHA - "What is Fun?"
    {
        "id": 9,
        "god": "KAITHA",
        "question": """You're at a boring noble's ball. Stuffy, predictable, DULL.
You have magic. You have creativity. You have options.

What do you do to make it INTERESTING?""",
        "options": [
            {"id": 1, "text": "Set the curtains on fire. Controlled chaos, dramatic exit.",
             "favor": {"KAITHA": 35, "KORVAN": 5, "VALDRIS": -25, "MORVANE": -15}},
            {"id": 2, "text": "Start wild rumors about the nobles. Watch them panic.",
             "favor": {"KAITHA": 30, "MERCUS": 10, "VALDRIS": -15, "ATHENA": -10}},
            {"id": 3, "text": "Engage the smartest person in philosophical debate.",
             "favor": {"ATHENA": 25, "VALDRIS": 10, "KAITHA": -20, "MORVANE": 5}},
            {"id": 4, "text": "Identify the richest noble. Network for future profit.",
             "favor": {"MERCUS": 25, "MORVANE": 20, "KAITHA": -20, "ATHENA": 5}},
            {"id": 5, "text": "Nothing. Endure it. Sometimes boring is acceptable.",
             "favor": {"VALDRIS": 15, "MORVANE": 10, "KAITHA": -30, "KORVAN": -10}}
        ]
    },

    # Question 10: MORVANE - "When Do You Run?"
    {
        "id": 10,
        "god": "MORVANE",
        "question": """You're outnumbered 10-to-1. Your allies are dead. Victory is
impossible. Your enemy offers surrender: serve them or die.

What do you do?""",
        "options": [
            {"id": 1, "text": "Fight to the death. I die on my feet, not my knees.",
             "favor": {"KORVAN": 30, "VALDRIS": 15, "MORVANE": -30, "ATHENA": -15}},
            {"id": 2, "text": "Flee. Survive. Return with an army later.",
             "favor": {"MORVANE": 30, "ATHENA": 20, "KORVAN": -25, "VALDRIS": -10}},
            {"id": 3, "text": "Surrender. Serve them, but plan escape/betrayal.",
             "favor": {"MORVANE": 25, "KAITHA": 20, "ATHENA": 15, "VALDRIS": -20}},
            {"id": 4, "text": "Suicide attack. Take as many enemies as possible with me.",
             "favor": {"KORVAN": 25, "KAITHA": 20, "MORVANE": -25, "ATHENA": -20}},
            {"id": 5, "text": "Negotiate. Offer valuable skills in exchange for freedom.",
             "favor": {"MERCUS": 25, "ATHENA": 20, "MORVANE": 20, "KORVAN": -15}}
        ]
    }
]

# ============================================================================
# DATA CLASSES
# ============================================================================

@dataclass
class Character:
    """Player character"""
    player_id: str
    name: str
    character_class: str  # Assigned by Divine Interrogation
    level: int = 1
    hp: int = 80
    hp_max: int = 80
    stamina: int = 80
    stamina_max: int = 80
    mana: int = 60
    mana_max: int = 60
    gold: int = 50

    # Skills (0-100)
    skills: Dict[str, int] = None

    # Divine Favor (-100 to +100 per god)
    divine_favor: Dict[str, int] = None

    # Inventory
    inventory: List[str] = None
    equipment: Dict[str, str] = None

    def __post_init__(self):
        if self.skills is None:
            self.skills = {
                "strength": 10, "archery": 10, "arcana": 10, "research": 10,
                "lockpicking": 10, "stealth": 10, "sleight_of_hand": 10,
                "persuasion": 10, "intimidation": 10, "deception": 10,
                "perception": 10, "survival": 10, "medicine": 10
            }
        if self.divine_favor is None:
            self.divine_favor = {god: 0 for god in SEVEN_GODS}
        if self.inventory is None:
            self.inventory = []
        if self.equipment is None:
            self.equipment = {"weapon": "rusty_sword", "armor": "leather_armor"}


@dataclass
class NPCCompanion:
    """NPC companion with approval, trust, and betrayal mechanics"""
    npc_id: str
    name: str
    title: str

    # Stats
    hp: int
    hp_max: int
    level: int

    # Personality
    fatal_flaw: str  # "impulsive", "cowardly", "greedy", "vengeful"
    hidden_agenda: str

    # Relationship
    approval: int = 50  # 0-100, per PLAYER (will be dict in full implementation)
    divine_favor: Dict[str, int] = None  # Gods judge NPCs too

    # Skills (what they're good at)
    strengths: List[str] = None

    # State
    is_alive: bool = True
    has_left_party: bool = False

    def __post_init__(self):
        if self.divine_favor is None:
            self.divine_favor = {god: 0 for god in SEVEN_GODS}
        if self.strengths is None:
            self.strengths = []


@dataclass
class GameState:
    """Complete game state"""
    # Party
    party_id: str
    player_characters: List[Character]
    npc_companions: List[NPCCompanion]

    # Party-wide
    party_trust: int = 50  # 0-100
    party_leader: str = None  # player_id

    # Location
    current_location: str = "valdria_town"  # Always start in safe town
    current_quest: Optional[str] = None

    # Progression
    turn_count: int = 0
    completed_quests: List[str] = None
    active_whispers: Dict[str, str] = None  # player_id: whisper_text

    # World state
    world_time: str = "morning"

    def __post_init__(self):
        if self.completed_quests is None:
            self.completed_quests = []
        if self.active_whispers is None:
            self.active_whispers = {}
        if self.party_leader is None and self.player_characters:
            self.party_leader = self.player_characters[0].player_id


# ============================================================================
# GAME LOGIC
# ============================================================================

class ArcaneCodexGame:
    """Main game engine"""

    def __init__(self):
        self.game_state: Optional[GameState] = None
        self.divine_interrogation_progress = {}  # player_id: {answers, current_question}

    # ========================================================================
    # CHARACTER CREATION
    # ========================================================================

    def start_divine_interrogation(self, player_id: str) -> Dict:
        """Begin Divine Interrogation for character creation"""
        # Create a shuffled copy of questions for this player
        shuffled_questions = DIVINE_INTERROGATION_QUESTIONS.copy()
        random.shuffle(shuffled_questions)

        self.divine_interrogation_progress[player_id] = {
            "answers": [],
            "current_question": 0,
            "divine_favor": {god: 0 for god in SEVEN_GODS},
            "questions": shuffled_questions  # Store player's unique question order
        }

        return {
            "status": "started",
            "message": self._get_interrogation_intro(),
            "question": self._get_current_question(player_id)
        }

    def _get_interrogation_intro(self) -> str:
        return """
╔═══════════════════════════════════════════════════════════╗
║               THE ARCANE CODEX                             ║
╚═══════════════════════════════════════════════════════════╝

You awaken in a void.

No body. No memory of how you arrived. Only consciousness.

Seven presences surround you. Divine. Ancient. Judging.

🌩️  VALDRIS (thunder voice):
"A new soul enters our realm. We shall know your truth."

🔥 KAITHA (laughing):
"Answer honestly! Or lie! Both are entertaining!"

💀 MORVANE (cold):
"Your answers determine your fate. Begin."

╔═══════════════════════════════════════════════════════════╗
║           THE DIVINE INTERROGATION                         ║
╚═══════════════════════════════════════════════════════════╝
"""

    def _get_current_question(self, player_id: str) -> Dict:
        """Get current interrogation question"""
        progress = self.divine_interrogation_progress[player_id]
        question_index = progress["current_question"]

        # Use player's shuffled questions instead of global list
        player_questions = progress.get("questions", DIVINE_INTERROGATION_QUESTIONS)

        if question_index >= len(player_questions):
            return None  # Interrogation complete

        question_data = player_questions[question_index]
        return {
            "question_number": question_index + 1,
            "total_questions": len(DIVINE_INTERROGATION_QUESTIONS),
            "god": question_data["god"],
            "question_text": question_data["question"],
            "options": [
                {"id": opt["id"], "text": opt["text"]}
                for opt in question_data["options"]
            ]
        }

    def answer_interrogation_question(self, player_id: str, answer_id: int) -> Dict:
        """Process interrogation answer and update divine favor"""
        progress = self.divine_interrogation_progress[player_id]
        question_index = progress["current_question"]
        question_data = DIVINE_INTERROGATION_QUESTIONS[question_index]

        # Find selected option
        selected_option = next(
            opt for opt in question_data["options"] if opt["id"] == answer_id
        )

        # Update divine favor
        for god, favor_change in selected_option["favor"].items():
            progress["divine_favor"][god] += favor_change

        # Record answer
        progress["answers"].append({
            "question_id": question_data["id"],
            "answer_id": answer_id,
            "answer_text": selected_option["text"]
        })

        # Move to next question
        progress["current_question"] += 1

        # Check if interrogation complete
        if progress["current_question"] >= len(DIVINE_INTERROGATION_QUESTIONS):
            return self._complete_interrogation(player_id)

        # Return next question
        return {
            "status": "continue",
            "next_question": self._get_current_question(player_id),
            "current_favor": progress["divine_favor"]
        }

    def _complete_interrogation(self, player_id: str) -> Dict:
        """Complete interrogation and assign character class"""
        progress = self.divine_interrogation_progress[player_id]
        divine_favor = progress["divine_favor"]

        # Determine character class based on divine favor
        character_class = self._assign_class_from_favor(divine_favor)

        # Generate divine verdict
        verdict = self._generate_divine_verdict(divine_favor, character_class)

        return {
            "status": "complete",
            "character_class": character_class,
            "divine_favor": divine_favor,
            "verdict": verdict,
            "ready_for_name": True
        }

    def _assign_class_from_favor(self, divine_favor: Dict[str, int]) -> str:
        """Assign character class based on divine favor pattern"""
        # Find dominant god(s)
        sorted_favor = sorted(divine_favor.items(), key=lambda x: x[1], reverse=True)
        primary_god, primary_favor = sorted_favor[0]
        secondary_god, secondary_favor = sorted_favor[1]

        # Class assignment logic
        if primary_god == "KORVAN" and primary_favor >= 50:
            return "Fighter"
        elif primary_god == "ATHENA" and primary_favor >= 50:
            if secondary_god == "KAITHA":
                return "Mage (Chaotic)"
            else:
                return "Mage (Scholar)"
        elif primary_god == "KAITHA" and primary_favor >= 50:
            if secondary_god == "MERCUS" or secondary_god == "MORVANE":
                return "Thief"
            else:
                return "Mage (Chaotic)"
        elif primary_god == "SYLARA" and primary_favor >= 50:
            return "Ranger"
        elif primary_god == "VALDRIS" and primary_favor >= 50:
            if secondary_god == "SYLARA":
                return "Cleric"
            else:
                return "Paladin"
        elif primary_god == "MERCUS" and primary_favor >= 50:
            return "Bard"
        elif primary_god == "MORVANE" and primary_favor >= 50:
            if secondary_god == "KAITHA":
                return "Thief"
            else:
                return "Survivalist"

        # Default fallback
        return "Fighter"

    def _generate_divine_verdict(self, divine_favor: Dict[str, int], character_class: str) -> str:
        """Generate narrative divine verdict"""
        sorted_favor = sorted(divine_favor.items(), key=lambda x: x[1], reverse=True)
        primary_god, primary_favor = sorted_favor[0]
        opposed_god = min(divine_favor.items(), key=lambda x: x[1])

        verdict = f"""
╔═══════════════════════════════════════════════════════════╗
║           THE GODS DELIBERATE                              ║
╚═══════════════════════════════════════════════════════════╝

[The seven gods confer. Their voices overlap, debating your soul.]

{self._get_god_verdict_line(primary_god, "claims")}
{self._get_god_verdict_line(sorted_favor[1][0], "supports")}
{self._get_god_verdict_line(opposed_god[0], "opposes")}

╔═══════════════════════════════════════════════════════════╗
           DIVINE VERDICT
╚═══════════════════════════════════════════════════════════╝

Primary Patron: {primary_god} - Favor: {primary_favor}
Opposed God: {opposed_god[0]} - Disfavor: {opposed_god[1]}

ARCHETYPE: {self._get_archetype_name(divine_favor)}
YOUR CLASS: {character_class}

The gods have judged you.
"""
        return verdict

    def _get_god_verdict_line(self, god: str, stance: str) -> str:
        """Get god's verdict dialogue"""
        lines = {
            "VALDRIS": {
                "claims": "🌩️  VALDRIS: \"Respects law... when convenient. Compromiser.\"",
                "supports": "🌩️  VALDRIS: \"Shows promise. Order guides them.\"",
                "opposes": "🌩️  VALDRIS: \"Chaotic. Lawless. I do not approve.\""
            },
            "KAITHA": {
                "claims": "🔥 KAITHA: \"THIS ONE BREAKS RULES! I love them! Mine!\"",
                "supports": "🔥 KAITHA: \"Creative. Unpredictable. INTERESTING!\"",
                "opposes": "🔥 KAITHA: \"Too orderly. Boring. Pass.\""
            },
            "MORVANE": {
                "claims": "💀 MORVANE: \"Pragmatic. Survivor. Useful.\"",
                "supports": "💀 MORVANE: \"They will survive. That matters.\"",
                "opposes": "💀 MORVANE: \"Too idealistic. They'll die young.\""
            },
            "SYLARA": {
                "claims": "🌿 SYLARA: \"Respects nature. Seeks balance.\"",
                "supports": "🌿 SYLARA: \"Some compassion. Not cruel, at least.\"",
                "opposes": "🌿 SYLARA: \"Destructive. Nature rejects them.\""
            },
            "KORVAN": {
                "claims": "⚔️  KORVAN: \"WARRIOR! This one has courage!\"",
                "supports": "⚔️  KORVAN: \"Occasional courage. More cunning than brave.\"",
                "opposes": "⚔️  KORVAN: \"Coward. No honor. Weak.\""
            },
            "ATHENA": {
                "claims": "📚 ATHENA: \"Seeks knowledge fearlessly. Scholar's heart.\"",
                "supports": "📚 ATHENA: \"Curious mind. I shall guide their studies.\"",
                "opposes": "📚 ATHENA: \"Fool. Rejects wisdom. Hopeless.\""
            },
            "MERCUS": {
                "claims": "💰 MERCUS: \"Understands value. We'll do profitable business.\"",
                "supports": "💰 MERCUS: \"Business sense. Practical.\"",
                "opposes": "💰 MERCUS: \"Poor. And will stay poor. No ambition.\""
            }
        }
        return lines.get(god, {}).get(stance, "")

    def _get_archetype_name(self, divine_favor: Dict[str, int]) -> str:
        """Generate archetype name from favor pattern"""
        sorted_favor = sorted(divine_favor.items(), key=lambda x: x[1], reverse=True)
        primary = sorted_favor[0][0]
        secondary = sorted_favor[1][0]

        archetypes = {
            ("KORVAN", "VALDRIS"): "Honorable Warrior",
            ("VALDRIS", "KORVAN"): "Lawful Protector",
            ("KAITHA", "ATHENA"): "Chaotic Scholar",
            ("ATHENA", "KAITHA"): "Wise Rebel",
            ("MORVANE", "KAITHA"): "Cunning Survivor",
            ("SYLARA", "VALDRIS"): "Nature's Guardian",
            ("MERCUS", "MORVANE"): "Pragmatic Merchant"
        }

        return archetypes.get((primary, secondary), "Balanced Adventurer")

    def create_character(self, player_id: str, name: str) -> Character:
        """Create character after interrogation complete"""
        progress = self.divine_interrogation_progress[player_id]

        # Determine class and favor
        character_class = self._assign_class_from_favor(progress["divine_favor"])

        # Create character
        character = Character(
            player_id=player_id,
            name=name,
            character_class=character_class,
            divine_favor=progress["divine_favor"].copy()
        )

        # Apply class bonuses
        self._apply_class_bonuses(character)

        return character

    def _apply_class_bonuses(self, character: Character):
        """Apply starting bonuses based on class"""
        class_bonuses = {
            "Fighter": {"strength": 10, "intimidation": 5, "hp_max": 20},
            "Mage": {"arcana": 15, "research": 10, "mana_max": 40},
            "Thief": {"lockpicking": 15, "stealth": 10, "sleight_of_hand": 10},
            "Ranger": {"survival": 15, "archery": 10, "perception": 5},
            "Cleric": {"medicine": 15, "persuasion": 10, "mana_max": 20},
            "Paladin": {"strength": 8, "intimidation": 8, "hp_max": 20},
            "Bard": {"persuasion": 15, "deception": 10, "perception": 5}
        }

        # Find matching class (handle variants like "Mage (Chaotic)")
        base_class = character.character_class.split(" ")[0]
        bonuses = class_bonuses.get(base_class, {})

        for skill, bonus in bonuses.items():
            if skill == "hp_max":
                character.hp_max += bonus
                character.hp += bonus
            elif skill == "mana_max":
                character.mana_max += bonus
                character.mana += bonus
            else:
                character.skills[skill] += bonus

    # ========================================================================
    # TOWN HUB SYSTEM
    # ========================================================================

    def enter_town(self) -> Dict:
        """Enter Valdria (safe town hub)"""
        self.game_state.current_location = "valdria_town"

        return {
            "location": "valdria_town",
            "description": self._get_town_description(),
            "available_locations": [
                {"id": "inn", "name": "The Resting Dragon Inn", "description": "Full rest, save game"},
                {"id": "merchants", "name": "Market District", "description": "Buy/sell items, upgrades"},
                {"id": "guild_hall", "name": "Adventurer's Guild", "description": "Accept quests, turn in completed"},
                {"id": "tavern", "name": "The Soggy Boot Tavern", "description": "NPC interactions, rumors"},
                {"id": "temple", "name": "Temple of the Seven", "description": "Check divine favor, pray"},
                {"id": "gates", "name": "Town Gates", "description": "Depart for quests"}
            ],
            "party_status": self._get_party_status()
        }

    def _get_town_description(self) -> str:
        return """
╔═══════════════════════════════════════════════════════════╗
║              VALDRIA - The Safe Haven                      ║
╚═══════════════════════════════════════════════════════════╝

You stand in the bustling market square of Valdria, the last
civilized outpost before the Cursed Wastes.

Stone buildings rise around you, their windows glowing with
warm firelight. The smell of fresh bread mixes with the tang
of weapon oil.

This is a SAFE ZONE - no combat, no danger. A place to rest,
prepare, and plan your next move.

Around the square you see:
"""

    def _get_party_status(self) -> Dict:
        """Get current party status"""
        return {
            "trust": self.game_state.party_trust,
            "turn_count": self.game_state.turn_count,
            "players": [
                {
                    "name": pc.name,
                    "class": pc.character_class,
                    "hp": f"{pc.hp}/{pc.hp_max}",
                    "level": pc.level
                }
                for pc in self.game_state.player_characters
            ],
            "npcs": [
                {
                    "name": npc.name,
                    "title": npc.title,
                    "approval": npc.approval,
                    "alive": npc.is_alive
                }
                for npc in self.game_state.npc_companions
            ]
        }

    # ========================================================================
    # ASYMMETRIC WHISPERS
    # ========================================================================

    def generate_whispers(self, scene_context: str) -> Dict[str, str]:
        """Generate asymmetric whispers for each player/NPC based on class"""
        whispers = {}

        for player in self.game_state.player_characters:
            whisper = self._generate_player_whisper(player, scene_context)
            whispers[player.player_id] = whisper

        for npc in self.game_state.npc_companions:
            if npc.is_alive and not npc.has_left_party:
                whisper = self._generate_npc_whisper(npc, scene_context)
                whispers[npc.npc_id] = whisper

        self.game_state.active_whispers = whispers
        return whispers

    def _generate_player_whisper(self, player: Character, scene: str) -> str:
        """Generate class-specific whisper for player"""
        # This would use Claude API in production
        # For now, returns template
        base_class = player.character_class.split(" ")[0]

        whisper_templates = {
            "Fighter": "[WHISPER] Your military training reveals tactical details...",
            "Mage": "[WHISPER] You sense magical energies in the area...",
            "Thief": "[WHISPER] Your keen eye spots hidden dangers...",
            "Ranger": "[WHISPER] Nature speaks to you, revealing secrets...",
            "Cleric": "[WHISPER] Divine insight shows you moral implications...",
            "Paladin": "[WHISPER] Your oath resonates with this situation...",
            "Bard": "[WHISPER] You read social cues others miss..."
        }

        return whisper_templates.get(base_class, "[WHISPER] You notice something...")

    def _generate_npc_whisper(self, npc: NPCCompanion, scene: str) -> str:
        """Generate NPC whisper (may be hidden based on approval/trust)"""
        return f"[NPC {npc.name} WHISPER] Internal thoughts..."

    # ========================================================================
    # NPC COMPANION SYSTEM
    # ========================================================================

    def create_default_npcs(self) -> List[NPCCompanion]:
        """Create default NPC companions (Grimsby, Renna)"""
        grimsby = NPCCompanion(
            npc_id="grimsby",
            name="Grimsby",
            title="Desperate Father",
            hp=60,
            hp_max=60,
            level=3,
            fatal_flaw="desperate",  # Will make desperate choices
            hidden_agenda="Save daughter at any cost",
            approval=50,
            strengths=["local_knowledge", "warehouse_contacts", "lockpicking"]
        )
        grimsby.divine_favor = {"VALDRIS": 30, "SYLARA": 20, "MERCUS": -10}

        renna = NPCCompanion(
            npc_id="renna",
            name="Renna",
            title="Vengeful Rogue",
            hp=55,
            hp_max=55,
            level=4,
            fatal_flaw="impulsive",  # Acts without thinking when triggered
            hidden_agenda="Kill brother (Thieves Guild leader)",
            approval=50,
            strengths=["stealth", "lockpicking", "guild_knowledge"]
        )
        renna.divine_favor = {"KAITHA": 40, "MORVANE": 25, "VALDRIS": -20}

        return [grimsby, renna]

    def update_npc_approval(self, npc_id: str, change: int, reason: str):
        """Update NPC approval based on party actions"""
        npc = next((n for n in self.game_state.npc_companions if n.npc_id == npc_id), None)
        if npc:
            npc.approval = max(0, min(100, npc.approval + change))
            print(f"[NPC APPROVAL] {npc.name}: {npc.approval} ({reason}: {change:+d})")

    def check_npc_betrayal(self, npc_id: str) -> bool:
        """Check if NPC should betray based on approval + trust"""
        npc = next((n for n in self.game_state.npc_companions if n.npc_id == npc_id), None)
        if not npc:
            return False

        # Guaranteed betrayal at 0 trust + low approval
        if self.game_state.party_trust == 0 and npc.approval < 20:
            return True

        # Possible betrayal at low trust + low approval
        if self.game_state.party_trust < 20 and npc.approval < 30:
            return random.random() < 0.3  # 30% chance

        return False

    # ========================================================================
    # TRUST SYSTEM
    # ========================================================================

    def update_trust(self, change: int, reason: str):
        """Update party trust score"""
        self.game_state.party_trust = max(0, min(100, self.game_state.party_trust + change))
        print(f"[TRUST] Party Trust: {self.game_state.party_trust} ({reason}: {change:+d})")

    def get_trust_tier(self) -> str:
        """Get trust tier description"""
        trust = self.game_state.party_trust
        if trust >= 80:
            return "Unbreakable Bond"
        elif trust >= 40:
            return "Professional"
        elif trust >= 10:
            return "Fragile Alliance"
        else:
            return "Imminent Betrayal"

    # ========================================================================
    # DIVINE COUNCIL
    # ========================================================================

    def convene_divine_council(self, player_action: str, context: Dict) -> Dict:
        """Trigger Divine Council vote on player action"""
        # Gather NPC testimonies first
        testimonies = self._gather_npc_testimonies(player_action)

        # Gods vote (influenced by NPC testimonies)
        votes = self._get_god_votes(player_action, testimonies, context)

        # Calculate outcome
        outcome = self._calculate_vote_outcome(votes)

        # Apply consequences
        consequences = self._apply_divine_judgment(outcome)

        return {
            "testimonies": testimonies,
            "votes": votes,
            "outcome": outcome,
            "consequences": consequences,
            "narration": self._format_divine_council_scene(testimonies, votes, outcome)
        }

    def _gather_npc_testimonies(self, player_action: str) -> List[Dict]:
        """NPCs testify before gods vote"""
        testimonies = []

        for npc in self.game_state.npc_companions:
            if not npc.is_alive or npc.has_left_party:
                continue

            # High approval = defend, low approval = condemn
            if npc.approval >= 60:
                stance = "SUPPORT"
                text = f"{npc.name} defends the party's actions."
            elif npc.approval <= 39:
                stance = "OPPOSE"
                text = f"{npc.name} questions the party's judgment."
            else:
                stance = "NEUTRAL"
                text = f"{npc.name} remains silent."

            testimonies.append({
                "npc": npc.name,
                "stance": stance,
                "text": text,
                "approval": npc.approval
            })

        return testimonies

    def _get_god_votes(self, player_action: str, testimonies: List[Dict], context: Dict) -> Dict:
        """Get each god's vote (in production, use Claude API)"""
        # Simplified voting logic for prototype
        # In production, each god would use Claude to analyze action

        votes = {}
        for god in SEVEN_GODS:
            # Simple voting based on divine favor + random
            favor = sum(pc.divine_favor[god] for pc in self.game_state.player_characters) / len(self.game_state.player_characters)

            vote_chance = 50 + (favor / 2)  # Base 50% + favor influence
            vote = "SUPPORT" if random.random() * 100 < vote_chance else "OPPOSE"

            votes[god] = {
                "vote": vote,
                "reasoning": f"{god} considers your divine favor ({favor:.0f})."
            }

        return votes

    def _calculate_vote_outcome(self, votes: Dict) -> Dict:
        """Calculate Divine Council outcome"""
        support_count = sum(1 for v in votes.values() if v["vote"] == "SUPPORT")
        oppose_count = sum(1 for v in votes.values() if v["vote"] == "OPPOSE")

        total = len(votes)

        if support_count == total or support_count == total - 1:
            outcome_type = "UNANIMOUS_SUPPORT"
        elif oppose_count == total or oppose_count == total - 1:
            outcome_type = "UNANIMOUS_OPPOSE"
        elif support_count >= 5:
            outcome_type = "STRONG_MAJORITY_SUPPORT"
        elif oppose_count >= 5:
            outcome_type = "STRONG_MAJORITY_OPPOSE"
        elif support_count == 4:
            outcome_type = "NARROW_SUPPORT"
        elif oppose_count == 4:
            outcome_type = "NARROW_OPPOSE"
        else:
            outcome_type = "DEADLOCK"

        return {
            "type": outcome_type,
            "support": support_count,
            "oppose": oppose_count,
            "total": total
        }

    def _apply_divine_judgment(self, outcome: Dict) -> Dict:
        """Apply consequences of divine judgment"""
        outcome_type = outcome["type"]

        consequences = {
            "favor_changes": {},
            "blessings": [],
            "curses": [],
            "trust_change": 0
        }

        if "SUPPORT" in outcome_type:
            # Positive outcome
            if "UNANIMOUS" in outcome_type:
                consequences["blessings"].append("Divine Concordance (+15% all checks, 20 turns)")
                consequences["trust_change"] = 10
            elif "STRONG" in outcome_type:
                consequences["blessings"].append("Divine Blessing (+10% relevant checks, 10 turns)")
                consequences["trust_change"] = 5

        elif "OPPOSE" in outcome_type:
            # Negative outcome
            if "UNANIMOUS" in outcome_type:
                consequences["curses"].append("Divine Condemnation (-15% all checks, 20 turns)")
                consequences["trust_change"] = -10
            elif "STRONG" in outcome_type:
                consequences["curses"].append("Divine Disfavor (-10% relevant checks, 10 turns)")
                consequences["trust_change"] = -5

        return consequences

    def _format_divine_council_scene(self, testimonies: List, votes: Dict, outcome: Dict) -> str:
        """Format Divine Council scene for display"""
        scene = """
╔═══════════════════════════════════════════════════════════╗
║          ⚖️  THE GODS DEBATE YOUR FATE  ⚖️                 ║
╚═══════════════════════════════════════════════════════════╝

[Your companions speak first]

"""
        # Add NPC testimonies
        for testimony in testimonies:
            scene += f"👤 {testimony['npc']} ({testimony['stance']}):\n\"{testimony['text']}\"\n\n"

        scene += "[Now the gods vote]\n\n"

        # Add god votes
        for god, vote_data in votes.items():
            symbol = "✅" if vote_data["vote"] == "SUPPORT" else "❌"
            scene += f"{symbol} {god}: {vote_data['reasoning']}\n"

        scene += f"\n{'═'*63}\n"
        scene += f"DIVINE JUDGMENT: {outcome['type']}\n"
        scene += f"({outcome['support']} SUPPORT, {outcome['oppose']} OPPOSE)\n"
        scene += f"{'═'*63}\n"

        return scene


# ============================================================================
# MAIN ENTRY POINT (for testing)
# ============================================================================

def main():
    """Test the game systems"""
    print("The Arcane Codex - Game Server v1.0")
    print("Initializing...")

    game = ArcaneCodexGame()

    # Test Divine Interrogation
    print("\n" + "="*60)
    print("Testing Divine Interrogation...")
    print("="*60)

    result = game.start_divine_interrogation("player1")
    print(result["message"])
    print("\nQuestion 1:")
    print(result["question"]["question_text"])
    for opt in result["question"]["options"]:
        print(f"{opt['id']}. {opt['text']}")

    print("\n[Game systems initialized successfully]")
    print("\nTo run full game:")
    print("1. Start Flask server")
    print("2. Connect via web UI")
    print("3. Complete Divine Interrogation (both players)")
    print("4. Enter Valdria (town hub)")
    print("5. Select quest")
    print("6. Experience asymmetric whispers + Divine Council")


if __name__ == "__main__":
    main()


# ============================================================================
# FLASK WEB SERVER
# ============================================================================

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os

app = Flask(__name__, static_folder='static')
CORS(app)  # Enable CORS for web UI

# Global game instance
game = ArcaneCodexGame()

# ============================================================================
# API ENDPOINTS
# ============================================================================

@app.route('/')
def index():
    """Serve main game UI"""
    static_dir = os.path.join(os.path.dirname(__file__), 'static')
    if os.path.exists(os.path.join(static_dir, 'index.html')):
        return send_from_directory(static_dir, 'index.html')
    else:
        return """
        <h1>The Arcane Codex - Game Server v1.0</h1>
        <p>Server is running!</p>
        <p>Web UI not found. Place index.html in the 'static' folder.</p>
        <p>API Endpoints:</p>
        <ul>
            <li>POST /api/interrogation/start - Start Divine Interrogation</li>
            <li>POST /api/interrogation/answer - Answer question</li>
            <li>POST /api/character/create - Create character after interrogation</li>
            <li>POST /api/game/start - Start new game</li>
            <li>GET /api/town/enter - Enter Valdria town hub</li>
            <li>POST /api/whispers/generate - Generate whispers</li>
            <li>POST /api/council/convene - Trigger Divine Council</li>
            <li>GET /api/game/state - Get current game state</li>
        </ul>
        """

# ========================================================================
# DIVINE INTERROGATION ENDPOINTS
# ========================================================================

@app.route('/api/interrogation/start', methods=['POST'])
def start_interrogation():
    """Start Divine Interrogation for a player"""
    data = request.json
    player_id = data.get('player_id')

    if not player_id:
        return jsonify({"error": "player_id required"}), 400

    result = game.start_divine_interrogation(player_id)
    return jsonify(result)

@app.route('/api/interrogation/answer', methods=['POST'])
def answer_interrogation():
    """Answer an interrogation question"""
    data = request.json
    player_id = data.get('player_id')
    answer_id = data.get('answer_id')

    if not player_id or not answer_id:
        return jsonify({"error": "player_id and answer_id required"}), 400

    result = game.answer_interrogation_question(player_id, answer_id)
    return jsonify(result)

@app.route('/api/character/create', methods=['POST'])
def create_character():
    """Create character after interrogation complete"""
    data = request.json
    player_id = data.get('player_id')
    name = data.get('name')

    if not player_id or not name:
        return jsonify({"error": "player_id and name required"}), 400

    character = game.create_character(player_id, name)
    return jsonify({
        "status": "success",
        "character": {
            "player_id": character.player_id,
            "name": character.name,
            "class": character.character_class,
            "level": character.level,
            "hp": f"{character.hp}/{character.hp_max}",
            "mana": f"{character.mana}/{character.mana_max}",
            "divine_favor": character.divine_favor,
            "skills": character.skills
        }
    })

# ========================================================================
# GAME STATE ENDPOINTS
# ========================================================================

@app.route('/api/game/start', methods=['POST'])
def start_game():
    """Initialize new game with both players"""
    data = request.json
    party_id = data.get('party_id', 'party_1')
    player1_id = data.get('player1_id')
    player2_id = data.get('player2_id')

    if not player1_id or not player2_id:
        return jsonify({"error": "Both player IDs required"}), 400

    # Get characters from interrogation
    if player1_id not in game.divine_interrogation_progress:
        return jsonify({"error": f"Player 1 ({player1_id}) hasn't completed interrogation"}), 400
    if player2_id not in game.divine_interrogation_progress:
        return jsonify({"error": f"Player 2 ({player2_id}) hasn't completed interrogation"}), 400

    # Create characters (names should be provided)
    player1_name = data.get('player1_name', 'Hero1')
    player2_name = data.get('player2_name', 'Hero2')

    char1 = game.create_character(player1_id, player1_name)
    char2 = game.create_character(player2_id, player2_name)

    # Create NPCs
    npcs = game.create_default_npcs()

    # Initialize game state
    game.game_state = GameState(
        party_id=party_id,
        player_characters=[char1, char2],
        npc_companions=npcs,
        party_trust=50,
        party_leader=player1_id,
        current_location="valdria_town"
    )

    return jsonify({
        "status": "game_started",
        "party_id": party_id,
        "location": "valdria_town",
        "message": "Welcome to Valdria! Your adventure begins..."
    })

@app.route('/api/game/state', methods=['GET'])
def get_game_state():
    """Get current game state"""
    if not game.game_state:
        return jsonify({"error": "No active game"}), 400

    return jsonify({
        "party_id": game.game_state.party_id,
        "party_trust": game.game_state.party_trust,
        "trust_tier": game.get_trust_tier(),
        "location": game.game_state.current_location,
        "turn_count": game.game_state.turn_count,
        "players": [
            {
                "player_id": pc.player_id,
                "name": pc.name,
                "class": pc.character_class,
                "hp": f"{pc.hp}/{pc.hp_max}",
                "level": pc.level
            }
            for pc in game.game_state.player_characters
        ],
        "npcs": [
            {
                "npc_id": npc.npc_id,
                "name": npc.name,
                "title": npc.title,
                "approval": npc.approval,
                "is_alive": npc.is_alive,
                "has_left_party": npc.has_left_party
            }
            for npc in game.game_state.npc_companions
        ]
    })

# ========================================================================
# TOWN HUB ENDPOINTS
# ========================================================================

@app.route('/api/town/enter', methods=['GET'])
def enter_town_api():
    """Enter Valdria town hub"""
    if not game.game_state:
        return jsonify({"error": "No active game"}), 400

    result = game.enter_town()
    return jsonify(result)

# ========================================================================
# WHISPERS & ASYMMETRIC INFORMATION
# ========================================================================

@app.route('/api/whispers/generate', methods=['POST'])
def generate_whispers_api():
    """Generate asymmetric whispers for current scene"""
    if not game.game_state:
        return jsonify({"error": "No active game"}), 400

    data = request.json
    scene_context = data.get('scene_context', 'A mysterious situation unfolds...')

    whispers = game.generate_whispers(scene_context)

    return jsonify({
        "status": "whispers_generated",
        "whispers": whispers,
        "note": "Send each whisper privately to corresponding player"
    })

@app.route('/api/whispers/share', methods=['POST'])
def share_whisper():
    """Player shares their whisper with party"""
    if not game.game_state:
        return jsonify({"error": "No active game"}), 400

    data = request.json
    player_id = data.get('player_id')
    shared_with = data.get('shared_with', 'all')  # 'all' or specific player_id
    whisper_content = data.get('whisper_content')
    is_truthful = data.get('is_truthful', True)

    # Update trust based on sharing
    if is_truthful:
        game.update_trust(+5, f"{player_id} shared whisper truthfully")
    else:
        game.update_trust(-10, f"{player_id} lied about whisper")

    return jsonify({
        "status": "whisper_shared",
        "trust": game.game_state.party_trust,
        "message": f"Whisper shared with {shared_with}"
    })

# ========================================================================
# DIVINE COUNCIL ENDPOINTS
# ========================================================================

@app.route('/api/council/convene', methods=['POST'])
def convene_council():
    """Trigger Divine Council vote"""
    if not game.game_state:
        return jsonify({"error": "No active game"}), 400

    data = request.json
    player_action = data.get('action', 'Unknown action')
    context = data.get('context', {})

    result = game.convene_divine_council(player_action, context)

    # Apply consequences
    if result['consequences']['trust_change']:
        game.update_trust(
            result['consequences']['trust_change'],
            f"Divine Council: {result['outcome']['type']}"
        )

    return jsonify(result)

# ========================================================================
# NPC MANAGEMENT ENDPOINTS
# ========================================================================

@app.route('/api/npc/approval/update', methods=['POST'])
def update_npc_approval_api():
    """Update NPC approval"""
    if not game.game_state:
        return jsonify({"error": "No active game"}), 400

    data = request.json
    npc_id = data.get('npc_id')
    change = data.get('change', 0)
    reason = data.get('reason', 'Party action')

    game.update_npc_approval(npc_id, change, reason)

    # Check for betrayal
    will_betray = game.check_npc_betrayal(npc_id)

    return jsonify({
        "status": "approval_updated",
        "npc_id": npc_id,
        "will_betray": will_betray
    })

# ========================================================================
# SERVER RUN
# ========================================================================

def run_server(host='0.0.0.0', port=5000, debug=True):
    """Start Flask server"""
    print(f"""
╔═══════════════════════════════════════════════════════════╗
║         THE ARCANE CODEX - GAME SERVER v1.0               ║
╚═══════════════════════════════════════════════════════════╝

Server starting on http://{host}:{port}

Players can connect from:
- Same computer: http://localhost:{port}
- Local network: http://<your-ip>:{port}

Core Features Initialized:
✅ Divine Interrogation (10 questions)
✅ Character Creation
✅ Safe Town Hub (Valdria)
✅ Asymmetric Whispers
✅ NPC Companions (Grimsby, Renna)
✅ Trust/Betrayal System
✅ Divine Council Voting

Ready for players!
╔═══════════════════════════════════════════════════════════╗
""")
    app.run(host=host, port=port, debug=debug)


# Start server if run directly
if __name__ == "__main__":
    run_server()
