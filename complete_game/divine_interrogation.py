"""
The Arcane Codex - Divine Interrogation & Council System
Phase 4: Character creation through moral choices and divine judgment
"""

import json
import random
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, field
import logging

from database import ArcaneDatabase
from mcp_client import SyncMCPClient

logger = logging.getLogger(__name__)

# The Eight Gods
GODS = {
    "VALDRIS": {
        "name": "Valdris",
        "domain": "Order, Law, Justice",
        "personality": "Stern, uncompromising, values consistency",
        "symbol": "⚖️",
        "color": "#FFD700"  # Gold
    },
    "KAITHA": {
        "name": "Kaitha",
        "domain": "Chaos, Freedom, Change",
        "personality": "Rebellious, unpredictable, hates conformity",
        "symbol": "🔥",
        "color": "#FF4500"  # Red-orange
    },
    "MORVANE": {
        "name": "Morvane",
        "domain": "Survival, Pragmatism, Harsh Truths",
        "personality": "Cold realist, ends justify means",
        "symbol": "💀",
        "color": "#800080"  # Purple
    },
    "SYLARA": {
        "name": "Sylara",
        "domain": "Nature, Balance, Growth",
        "personality": "Patient, sees long-term, values harmony",
        "symbol": "🌿",
        "color": "#228B22"  # Green
    },
    "KORVAN": {
        "name": "Korvan",
        "domain": "War, Honor, Glory",
        "personality": "Fierce warrior, respects courage",
        "symbol": "⚔️",
        "color": "#DC143C"  # Crimson
    },
    "ATHENA": {
        "name": "Athena",
        "domain": "Wisdom, Knowledge, Strategy",
        "personality": "Thoughtful, values learning over action",
        "symbol": "📚",
        "color": "#4169E1"  # Blue
    },
    "MERCUS": {
        "name": "Mercus",
        "domain": "Commerce, Wealth, Ambition",
        "personality": "Opportunistic, everything has a price",
        "symbol": "💰",
        "color": "#FFD700"  # Gold
    },
    "DRAKMOR": {
        "name": "Drakmor",
        "domain": "Freedom, Fury, Transformation",
        "personality": "Primal, values independence above all",
        "symbol": "🐉",
        "color": "#8B0000"  # Dark red
    }
}

# Core moral questions
BASE_QUESTIONS = [
    {
        "id": 1,
        "god": "VALDRIS",
        "question": """A starving mother steals bread from a wealthy baker.
The baker demands her hand as punishment - the law of this land.
A crowd watches. They wait for YOUR judgment.

What do you do?""",
        "options": [
            {
                "text": "Uphold the law. Cut off her hand. Law is absolute.",
                "favor": {"VALDRIS": 30, "KORVAN": 10, "SYLARA": -20, "KAITHA": -25, "MORVANE": 5}
            },
            {
                "text": "She pays double the bread's value. Gold solves this.",
                "favor": {"MERCUS": 30, "MORVANE": 15, "VALDRIS": 5, "KAITHA": -10, "SYLARA": -5}
            },
            {
                "text": "Burn the baker's shop. Hoarding while others starve is the true crime.",
                "favor": {"KAITHA": 35, "DRAKMOR": 20, "VALDRIS": -30, "MERCUS": -25}
            },
            {
                "text": "Force them to negotiate. She works to repay the debt.",
                "favor": {"ATHENA": 25, "MERCUS": 15, "VALDRIS": 10, "SYLARA": 10}
            },
            {
                "text": "Trial by combat. Let strength decide justice.",
                "favor": {"KORVAN": 30, "DRAKMOR": 15, "MORVANE": 10, "VALDRIS": -20, "ATHENA": -15}
            }
        ]
    },
    {
        "id": 2,
        "god": "KAITHA",
        "question": """You discover forbidden magic - powerful, dangerous, ILLEGAL.
The Academy says all forbidden magic must be destroyed.
This spell could save thousands... or kill millions.

What do you do?""",
        "options": [
            {
                "text": "Learn it secretly. Rules are chains. Knowledge should be free.",
                "favor": {"KAITHA": 35, "ATHENA": 20, "DRAKMOR": 15, "VALDRIS": -30}
            },
            {
                "text": "Study it carefully first. Understand before deciding.",
                "favor": {"ATHENA": 30, "KAITHA": 10, "VALDRIS": -15, "MORVANE": 15}
            },
            {
                "text": "Destroy it immediately. Some knowledge is too dangerous.",
                "favor": {"VALDRIS": 25, "SYLARA": 15, "KAITHA": -30, "ATHENA": -20}
            },
            {
                "text": "Sell it to the highest bidder. Let them bear the risk.",
                "favor": {"MERCUS": 30, "MORVANE": 20, "VALDRIS": -25, "ATHENA": -15}
            },
            {
                "text": "Master it, then control who can use it. Power needs guardians.",
                "favor": {"KORVAN": 25, "VALDRIS": 10, "DRAKMOR": -15, "KAITHA": -20}
            }
        ]
    },
    {
        "id": 3,
        "god": "MORVANE",
        "question": """Your party of 5 is trapped. Starving. You find food for 3.
Two must die for the others to live.
The weak? The troublesome? The ones you don't like?

Who dies?""",
        "options": [
            {
                "text": "The weakest die. Natural selection. This is reality.",
                "favor": {"MORVANE": 35, "KORVAN": 15, "SYLARA": -25, "VALDRIS": -20}
            },
            {
                "text": "Draw lots. Let fate decide. Fair and impartial.",
                "favor": {"KAITHA": 25, "VALDRIS": 20, "ATHENA": 15, "MORVANE": -10}
            },
            {
                "text": "I don't eat. Save the others. Heroes sacrifice.",
                "favor": {"VALDRIS": 30, "SYLARA": 25, "KORVAN": 35, "MORVANE": -30}
            },
            {
                "text": "The most skilled survive. We need healers and warriors.",
                "favor": {"MORVANE": 30, "ATHENA": 20, "MERCUS": 15, "SYLARA": -20}
            },
            {
                "text": "Split equally. All get less. Maybe all survive, maybe none.",
                "favor": {"SYLARA": 30, "VALDRIS": 15, "MORVANE": -25, "KORVAN": -10}
            }
        ]
    },
    # Questions 4-10 would follow similar pattern...
]

@dataclass
class InterrogationQuestion:
    """Single Divine Interrogation question"""
    number: int
    god: str
    text: str
    options: List[Dict]
    player_answer: Optional[int] = None
    favor_changes: Dict[str, int] = field(default_factory=dict)

@dataclass
class CharacterProfile:
    """Result of Divine Interrogation"""
    player_id: str
    player_name: str
    assigned_class: str
    divine_favor: Dict[str, int]
    primary_god: str
    secondary_god: str
    archetype: str
    answers: List[int]
    creation_story: str

class DivineInterrogation:
    """
    Character creation through moral choices
    8 gods ask 10 questions to determine class and divine favor
    """

    def __init__(self, db: ArcaneDatabase, mcp_client: Optional[SyncMCPClient] = None):
        self.db = db
        self.mcp_client = mcp_client or SyncMCPClient()
        self.questions = self.load_questions()

    def load_questions(self) -> List[Dict]:
        """Load all interrogation questions"""
        # In production, this would load from a larger question bank
        # For now, using BASE_QUESTIONS and generating more via MCP
        return BASE_QUESTIONS

    async def start_interrogation(self, player_id: str, player_name: str) -> List[InterrogationQuestion]:
        """Start a new Divine Interrogation session"""

        questions = []
        god_rotation = list(GODS.keys())
        random.shuffle(god_rotation)

        for i in range(10):
            god = god_rotation[i % len(god_rotation)]

            # Get or generate question
            if i < len(self.questions):
                q_data = self.questions[i]
            else:
                # Generate unique question via MCP
                q_data = await self.generate_question(player_id, i + 1, god)

            question = InterrogationQuestion(
                number=i + 1,
                god=god,
                text=q_data['question'],
                options=q_data['options']
            )

            questions.append(question)

        # Store in session
        self.store_interrogation_session(player_id, questions)

        return questions

    async def generate_question(self, player_id: str, question_number: int, god: str) -> Dict:
        """Generate unique question via MCP/Claude"""

        if self.mcp_client:
            result = self.mcp_client.run_divine_interrogation(player_id, question_number)
            if 'error' not in result:
                return result

        # Fallback question if MCP fails
        return self.get_fallback_question(god)

    def get_fallback_question(self, god: str) -> Dict:
        """Get a fallback question for a god"""

        fallback_questions = {
            "VALDRIS": {
                "question": "A criminal confesses under torture. The confession is likely false. What do you do?",
                "options": [
                    {"text": "The law requires confession. It stands.", "favor": {"VALDRIS": 20, "ATHENA": -15}},
                    {"text": "Investigate further. Truth matters more than process.", "favor": {"ATHENA": 25, "VALDRIS": -10}},
                    {"text": "Free them. Torture invalidates justice.", "favor": {"KAITHA": 20, "VALDRIS": -15}},
                    {"text": "Let them fight for freedom.", "favor": {"KORVAN": 25, "MORVANE": 10}},
                    {"text": "They can buy their freedom.", "favor": {"MERCUS": 25, "VALDRIS": -5}}
                ]
            },
            # Add more fallback questions per god...
        }

        return fallback_questions.get(god, fallback_questions["VALDRIS"])

    def process_answer(self, player_id: str, question_number: int, answer_index: int) -> Dict[str, int]:
        """Process a player's answer and calculate favor changes"""

        # Get the question
        session = self.get_interrogation_session(player_id)
        if not session or question_number > len(session):
            return {}

        question = session[question_number - 1]
        selected_option = question.options[answer_index - 1]

        # Get favor changes
        favor_changes = selected_option.get('favor', {})

        # Store answer
        with self.db.get_connection() as conn:
            conn.execute("""
                INSERT OR REPLACE INTO interrogation_answers
                (player_id, question_number, god, answer_id, favor_changes)
                VALUES (?, ?, ?, ?, ?)
            """, (player_id, question_number, question.god, answer_index,
                 json.dumps(favor_changes)))

        return favor_changes

    def calculate_final_profile(self, player_id: str, player_name: str, answers: List[int]) -> CharacterProfile:
        """Calculate final character profile from all answers"""

        # Initialize divine favor
        divine_favor = {god: 0 for god in GODS.keys()}

        # Sum up all favor changes
        with self.db.get_connection() as conn:
            results = conn.execute("""
                SELECT favor_changes FROM interrogation_answers
                WHERE player_id = ?
                ORDER BY question_number
            """, (player_id,)).fetchall()

            for row in results:
                changes = json.loads(row['favor_changes'])
                for god, change in changes.items():
                    divine_favor[god] = divine_favor.get(god, 0) + change

        # Determine primary and secondary gods
        sorted_gods = sorted(divine_favor.items(), key=lambda x: x[1], reverse=True)
        primary_god = sorted_gods[0][0]
        secondary_god = sorted_gods[1][0]

        # Determine class
        assigned_class = self.determine_class(primary_god, secondary_god, divine_favor)

        # Determine archetype
        archetype = self.determine_archetype(primary_god, secondary_god, assigned_class)

        # Generate character story
        story = self.generate_character_story(archetype, divine_favor, answers)

        # Create profile
        profile = CharacterProfile(
            player_id=player_id,
            player_name=player_name,
            assigned_class=assigned_class,
            divine_favor=divine_favor,
            primary_god=primary_god,
            secondary_god=secondary_god,
            archetype=archetype,
            answers=answers,
            creation_story=story
        )

        # Update player in database
        self.db.update_player_class(player_id, assigned_class, divine_favor)

        return profile

    def determine_class(self, primary_god: str, secondary_god: str, divine_favor: Dict[str, int]) -> str:
        """Determine class based on divine favor"""

        class_matrix = {
            ("VALDRIS", "KORVAN"): "Paladin",
            ("VALDRIS", "ATHENA"): "Inquisitor",
            ("KAITHA", "ATHENA"): "Wild Mage",
            ("KAITHA", "DRAKMOR"): "Chaos Knight",
            ("MORVANE", "MERCUS"): "Assassin",
            ("MORVANE", "KORVAN"): "Mercenary",
            ("SYLARA", "ATHENA"): "Druid",
            ("SYLARA", "DRAKMOR"): "Beast Master",
            ("KORVAN", "VALDRIS"): "Knight",
            ("KORVAN", "DRAKMOR"): "Berserker",
            ("ATHENA", "MERCUS"): "Artificer",
            ("ATHENA", "VALDRIS"): "Scholar",
            ("MERCUS", "KAITHA"): "Smuggler",
            ("MERCUS", "MORVANE"): "Merchant Prince",
            ("DRAKMOR", "KORVAN"): "Dragon Knight",
            ("DRAKMOR", "SYLARA"): "Wolf Shaman"
        }

        # Check specific combination
        combo = (primary_god, secondary_god)
        if combo in class_matrix:
            return class_matrix[combo]

        # Fallback to basic classes based on primary god
        basic_classes = {
            "VALDRIS": "Fighter",
            "KAITHA": "Mage",
            "MORVANE": "Thief",
            "SYLARA": "Ranger",
            "KORVAN": "Fighter",
            "ATHENA": "Mage",
            "MERCUS": "Thief",
            "DRAKMOR": "Ranger"
        }

        return basic_classes.get(primary_god, "Adventurer")

    def determine_archetype(self, primary_god: str, secondary_god: str, assigned_class: str) -> str:
        """Determine character archetype (personality profile)"""

        archetypes = {
            ("VALDRIS", "KORVAN", "Paladin"): "The Righteous Crusader",
            ("KAITHA", "ATHENA", "Wild Mage"): "The Mad Scholar",
            ("MORVANE", "MERCUS", "Assassin"): "The Professional",
            ("SYLARA", "DRAKMOR", "Beast Master"): "The Wild Heart",
            ("KORVAN", "DRAKMOR", "Dragon Knight"): "The Fury Incarnate",
            ("DRAKMOR", "SYLARA", "Wolf Shaman"): "The Pack Leader",
            ("VALDRIS", "ATHENA", "Inquisitor"): "The Truth Seeker",
            ("MERCUS", "KAITHA", "Smuggler"): "The Charming Rogue"
        }

        key = (primary_god, secondary_god, assigned_class)
        return archetypes.get(key, f"The {assigned_class}")

    def generate_character_story(self, archetype: str, divine_favor: Dict[str, int], answers: List[int]) -> str:
        """Generate a character's origin story based on their choices"""

        # Find most opposed god
        opposed_god = min(divine_favor.items(), key=lambda x: x[1])[0]

        story = f"""The gods have judged you, and you are revealed as {archetype}.

Your soul resonates most strongly with {GODS[max(divine_favor, key=divine_favor.get)]['name']},
who sees in you a kindred spirit. But {GODS[opposed_god]['name']} watches you with suspicion,
marking you as one who walks a dangerous path.

Your choices have carved your destiny - neither purely good nor wholly evil, but complex,
like the real world that shaped you. The gods' judgment is not a blessing or curse, but a mirror
reflecting who you truly are.

Now, armed with this self-knowledge, you must decide: Will you embrace what the gods see in you,
or will you forge a different path?"""

        return story

    def store_interrogation_session(self, player_id: str, questions: List[InterrogationQuestion]):
        """Store interrogation session in memory"""
        # In production, this would use Redis or session storage
        # For now, storing in class attribute
        if not hasattr(self, 'sessions'):
            self.sessions = {}
        self.sessions[player_id] = questions

    def get_interrogation_session(self, player_id: str) -> Optional[List[InterrogationQuestion]]:
        """Get interrogation session from memory"""
        if hasattr(self, 'sessions'):
            return self.sessions.get(player_id)
        return None


class DivineCouncil:
    """
    The gods judge player actions in real-time
    Creates dramatic moments of divine intervention
    """

    def __init__(self, db: ArcaneDatabase, mcp_client: Optional[SyncMCPClient] = None):
        self.db = db
        self.mcp_client = mcp_client or SyncMCPClient()

    async def convene_council(self, game_id: str, action: str, context: Dict) -> Dict:
        """Convene the Divine Council to judge an action"""

        # Get NPC testimonies
        testimonies = await self.gather_testimonies(game_id, context)

        # Get each god's vote
        votes = {}
        for god_name, god_info in GODS.items():
            vote = await self.get_god_vote(god_name, action, context, testimonies)
            votes[god_name] = vote

        # Calculate outcome
        outcome = self.calculate_outcome(votes)

        # Determine impact
        impact = self.determine_impact(outcome, votes)

        # Create dramatic narration
        narration = self.create_council_narration(action, votes, outcome, testimonies)

        # Save to database
        self.save_council_verdict(game_id, action, votes, testimonies, outcome, impact)

        return {
            'action_judged': action,
            'votes': votes,
            'testimonies': testimonies,
            'outcome': outcome,
            'impact': impact,
            'narration': narration
        }

    async def gather_testimonies(self, game_id: str, context: Dict) -> List[Dict]:
        """Gather NPC testimonies about the action"""

        testimonies = []
        npcs = self.db.get_npcs_for_game(game_id)

        for npc in npcs:
            if npc['approval'] > 60:
                # Supportive testimony
                testimony = {
                    'npc': npc['name'],
                    'stance': 'support',
                    'text': f"They did what they had to do. I stand with them.",
                    'weight': 1
                }
            elif npc['approval'] < 40:
                # Condemning testimony
                testimony = {
                    'npc': npc['name'],
                    'stance': 'condemn',
                    'text': f"This is exactly what I expected. They cannot be trusted.",
                    'weight': -1
                }
            else:
                # Neutral testimony
                testimony = {
                    'npc': npc['name'],
                    'stance': 'neutral',
                    'text': f"I... I don't know what to think about this.",
                    'weight': 0
                }

            testimonies.append(testimony)

        return testimonies

    async def get_god_vote(self, god_name: str, action: str, context: Dict, testimonies: List[Dict]) -> Dict:
        """Get a specific god's vote on the action"""

        god_info = GODS[god_name]

        # If MCP available, get nuanced vote
        if self.mcp_client:
            vote_data = {
                'god': god_name,
                'domain': god_info['domain'],
                'action': action,
                'context': context,
                'testimonies': testimonies
            }

            # This would call Claude to generate god's reasoning
            # For now, using rule-based system

        # Rule-based voting
        vote = self.calculate_god_vote(god_name, action, context)

        return vote

    def calculate_god_vote(self, god_name: str, action: str, context: Dict) -> Dict:
        """Calculate a god's vote based on their nature"""

        # Simplified voting logic
        action_lower = action.lower()

        vote_patterns = {
            "VALDRIS": {
                'supports': ['law', 'justice', 'order', 'oath', 'honor contract'],
                'opposes': ['chaos', 'broke', 'steal', 'lie', 'betray']
            },
            "KAITHA": {
                'supports': ['freedom', 'rebel', 'break', 'chaos', 'defy'],
                'opposes': ['conform', 'obey', 'surrender', 'submit']
            },
            "MORVANE": {
                'supports': ['survive', 'practical', 'sacrifice few', 'harsh'],
                'opposes': ['idealistic', 'everyone', 'hope', 'trust']
            },
            "SYLARA": {
                'supports': ['nature', 'balance', 'heal', 'grow', 'harmony'],
                'opposes': ['destroy', 'corrupt', 'poison', 'burn']
            },
            "KORVAN": {
                'supports': ['fight', 'combat', 'honor', 'courage', 'strength'],
                'opposes': ['flee', 'surrender', 'coward', 'weak']
            },
            "ATHENA": {
                'supports': ['think', 'plan', 'learn', 'study', 'understand'],
                'opposes': ['ignorant', 'rash', 'destroy knowledge', 'blind']
            },
            "MERCUS": {
                'supports': ['profit', 'trade', 'deal', 'negotiate', 'wealth'],
                'opposes': ['waste', 'destroy value', 'charity', 'free']
            },
            "DRAKMOR": {
                'supports': ['free', 'transform', 'wild', 'independent', 'fury'],
                'opposes': ['cage', 'tame', 'submit', 'civilize']
            }
        }

        patterns = vote_patterns.get(god_name, {})

        # Check if action matches patterns
        supports = any(word in action_lower for word in patterns.get('supports', []))
        opposes = any(word in action_lower for word in patterns.get('opposes', []))

        if supports and not opposes:
            return {
                'vote': 'support',
                'strength': 'strong',
                'reasoning': f"{god_name} sees this as aligned with their domain."
            }
        elif opposes and not supports:
            return {
                'vote': 'oppose',
                'strength': 'strong',
                'reasoning': f"{god_name} finds this action abhorrent."
            }
        else:
            return {
                'vote': 'abstain',
                'strength': 'neutral',
                'reasoning': f"{god_name} is conflicted about this action."
            }

    def calculate_outcome(self, votes: Dict[str, Dict]) -> str:
        """Calculate the overall outcome of the Divine Council"""

        support_count = sum(1 for v in votes.values() if v['vote'] == 'support')
        oppose_count = sum(1 for v in votes.values() if v['vote'] == 'oppose')
        abstain_count = sum(1 for v in votes.values() if v['vote'] == 'abstain')

        total_gods = len(votes)

        if support_count == total_gods:
            return "DIVINE_CONCORDANCE"  # All gods agree (extremely rare)
        elif support_count >= 6:
            return "BLESSED"  # Strong divine support
        elif support_count >= 5:
            return "APPROVED"  # Majority support
        elif support_count == 4 and oppose_count == 4:
            return "DIVINE_SCHISM"  # Gods are split
        elif oppose_count >= 5:
            return "CONDEMNED"  # Majority oppose
        elif oppose_count >= 6:
            return "CURSED"  # Strong divine opposition
        elif oppose_count == total_gods:
            return "DIVINE_ABANDONMENT"  # All gods oppose (catastrophic)
        else:
            return "UNCERTAIN"  # Too many abstentions

    def determine_impact(self, outcome: str, votes: Dict[str, Dict]) -> Dict:
        """Determine the mechanical impact of the Divine Council's verdict"""

        impact = {
            'favor_changes': {},
            'blessings': [],
            'curses': [],
            'immediate_effects': []
        }

        # Calculate favor changes for each god
        for god_name, vote in votes.items():
            if vote['vote'] == 'support':
                if vote['strength'] == 'strong':
                    impact['favor_changes'][god_name] = 15
                else:
                    impact['favor_changes'][god_name] = 10
            elif vote['vote'] == 'oppose':
                if vote['strength'] == 'strong':
                    impact['favor_changes'][god_name] = -15
                else:
                    impact['favor_changes'][god_name] = -10

        # Apply outcome-specific effects
        if outcome == "DIVINE_CONCORDANCE":
            impact['blessings'].append({
                'name': 'Divine Concordance',
                'effect': 'All actions succeed for 5 turns',
                'duration': 5
            })
        elif outcome == "BLESSED":
            impact['blessings'].append({
                'name': 'Divine Blessing',
                'effect': '+20% to all skill checks',
                'duration': 10
            })
        elif outcome == "CURSED":
            impact['curses'].append({
                'name': 'Divine Curse',
                'effect': '-20% to all skill checks',
                'duration': 10
            })
        elif outcome == "DIVINE_ABANDONMENT":
            impact['curses'].append({
                'name': 'Abandoned by the Gods',
                'effect': 'No divine magic works, -30% all checks',
                'duration': 20
            })
        elif outcome == "DIVINE_SCHISM":
            impact['immediate_effects'].append('Reality tears - random magical effects!')

        return impact

    def create_council_narration(self, action: str, votes: Dict, outcome: str, testimonies: List[Dict]) -> str:
        """Create dramatic narration of the Divine Council"""

        narration = f"""
═══════════════════════════════════════
        THE GODS CONVENE
═══════════════════════════════════════

THE ACTION JUDGED:
{action}

THE MORTALS TESTIFY:
"""

        for testimony in testimonies:
            narration += f"\n{testimony['npc']}: \"{testimony['text']}\""

        narration += "\n\nTHE GODS SPEAK:\n"

        for god_name, vote in votes.items():
            god_info = GODS[god_name]
            if vote['vote'] == 'support':
                narration += f"\n{god_info['symbol']} {god_name}: \"This action serves the greater good.\""
            elif vote['vote'] == 'oppose':
                narration += f"\n{god_info['symbol']} {god_name}: \"This cannot be allowed to stand.\""
            else:
                narration += f"\n{god_info['symbol']} {god_name}: \"I am torn. The path is unclear.\""

        narration += f"\n\nDIVINE VERDICT: {outcome.replace('_', ' ')}\n"

        if outcome == "DIVINE_CONCORDANCE":
            narration += "✨ The heavens sing in harmony! Divine power flows through you!"
        elif outcome == "DIVINE_ABANDONMENT":
            narration += "💀 The gods turn their faces away. You are alone in the darkness."
        elif outcome == "DIVINE_SCHISM":
            narration += "⚡ The gods war among themselves! Reality itself cracks!"

        narration += "\n═══════════════════════════════════════\n"

        return narration

    def save_council_verdict(self, game_id: str, action: str, votes: Dict,
                            testimonies: List[Dict], outcome: str, impact: Dict):
        """Save the Divine Council verdict to database"""

        with self.db.get_connection() as conn:
            # Get current turn
            game = conn.execute("SELECT turn FROM games WHERE id = ?", (game_id,)).fetchone()
            turn = game['turn'] if game else 0

            conn.execute("""
                INSERT INTO divine_councils
                (game_id, turn, action_judged, votes, testimonies, outcome, impact)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (game_id, turn, action, json.dumps(votes), json.dumps(testimonies),
                 outcome, json.dumps(impact)))


# Testing functions
if __name__ == "__main__":
    db = ArcaneDatabase()

    # Test Divine Interrogation
    interrogation = DivineInterrogation(db)

    print("=== DIVINE INTERROGATION TEST ===\n")

    # Simulate a player going through interrogation
    test_player_id = "test_player_001"
    test_player_name = "Aldric the Seeker"

    # Get questions (normally async)
    import asyncio
    loop = asyncio.new_event_loop()
    questions = loop.run_until_complete(
        interrogation.start_interrogation(test_player_id, test_player_name)
    )

    print(f"Player: {test_player_name}")
    print(f"Beginning Divine Interrogation...\n")

    # Simulate answering first 3 questions
    test_answers = []
    for i, question in enumerate(questions[:3]):
        print(f"Question {question.number} - {GODS[question.god]['name']} asks:")
        print(f"{question.text}\n")
        print("Options:")
        for j, option in enumerate(question.options):
            print(f"  {j+1}. {option['text']}")

        # Simulate random answer
        answer = random.randint(1, len(question.options))
        test_answers.append(answer)

        # Process answer
        favor_changes = interrogation.process_answer(test_player_id, question.number, answer)
        print(f"\nChosen: Option {answer}")
        print(f"Favor changes: {favor_changes}\n")
        print("-" * 50 + "\n")

    # Test Divine Council
    print("\n=== DIVINE COUNCIL TEST ===\n")

    council = DivineCouncil(db)

    test_action = "The party stole medicine from the Duke but discovered it was poisoned"
    test_context = {
        'location': 'Duke\'s Warehouse',
        'party_trust': 65,
        'turn': 10
    }

    # Convene council
    verdict = loop.run_until_complete(
        council.convene_council("test_game_001", test_action, test_context)
    )

    print(verdict['narration'])
    print(f"\nImpact: {verdict['impact']}")

    print("\n✅ Divine systems test complete!")