"""
Divine Council Voting System
Core voting mechanics for The Arcane Codex
"""

from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass
import random
import logging

from .god_personalities import GOD_PERSONALITIES, SPEECH_TEMPLATES

logger = logging.getLogger(__name__)

@dataclass
class Vote:
    god_name: str
    position: int  # -1 (oppose), 0 (abstain), 1 (support)
    weight: float
    reasoning: str
    favor_before: int
    favor_after: int

@dataclass
class VoteOutcome:
    raw_count: Tuple[int, int, int]  # (support, oppose, abstain)
    weighted_score: float
    outcome: str
    margin: float
    decisive_gods: List[str]
    swing_gods: List[str]
    vote_breakdown: Dict[str, float]

class VotingSystem:
    """Core voting calculation engine"""

    def __init__(self, db, god_personalities: Dict = None):
        self.db = db
        self.gods = god_personalities or GOD_PERSONALITIES

    def calculate_vote_weight(self, favor: int, base_vote: int) -> float:
        """
        Calculate weighted vote based on favor

        Args:
            favor: -100 to +100
            base_vote: -1, 0, or 1

        Returns:
            Weighted vote (0.5x to 2.0x multiplier applied)
        """
        if base_vote == 0:
            return 0.0  # Abstain has no weight

        # Favor modifier: -100 = 0.5x, 0 = 1.0x, +100 = 2.0x
        # Formula: weight = 1.0 + (favor / 100) * 0.5
        # This gives: -100 -> 0.5, 0 -> 1.0, +100 -> 1.5
        # But we want -100 -> 0.5, 0 -> 1.0, +100 -> 2.0
        # So: weight = 1.0 + (favor / 100) * 1.0
        # Simplified: weight = (200 + favor * 2) / 200
        weight = (200 + favor * 2) / 200.0

        # Clamp between 0.5 and 2.0
        weight = max(0.5, min(2.0, weight))

        # Apply to base vote
        weighted_vote = base_vote * weight

        return weighted_vote

    def calculate_action_alignment(self, god_name: str, action: str, context: Dict) -> int:
        """
        Calculate how aligned an action is with a god's values

        Returns: -100 (completely opposed) to +100 (perfectly aligned)
        """
        god = self.gods[god_name]
        alignment_score = 0

        action_lower = action.lower()

        # Check core values (positive alignment)
        for value in god.get('core_values', []):
            if value.lower() in action_lower:
                alignment_score += 20

        # Check opposed values (negative alignment)
        for opposed in god.get('opposed_to', []):
            if opposed.lower() in action_lower:
                alignment_score -= 25

        # Context modifiers
        if context.get('involves_oath') and god_name == "VALDRIS":
            alignment_score += 30

        if context.get('involves_combat') and god_name == "KORVAN":
            alignment_score += 25

        if context.get('involves_trade') and god_name == "MERCUS":
            alignment_score += 20

        if context.get('breaks_law') and god_name == "VALDRIS":
            alignment_score -= 40

        if context.get('restricts_freedom') and god_name == "KAITHA":
            alignment_score -= 35

        if context.get('preserves_nature') and god_name == "SYLARA":
            alignment_score += 30

        if context.get('destroys_nature') and god_name == "SYLARA":
            alignment_score -= 35

        if context.get('seeks_knowledge') and god_name == "ATHENA":
            alignment_score += 30

        if context.get('destroys_knowledge') and god_name == "ATHENA":
            alignment_score -= 40

        if context.get('pragmatic_survival') and god_name == "MORVANE":
            alignment_score += 30

        # Clamp to -100, +100
        return max(-100, min(100, alignment_score))

    def determine_god_vote(self, god_name: str, action: str, context: Dict, current_favor: int) -> int:
        """
        Determine how a god votes

        Returns: -1 (oppose), 0 (abstain), +1 (support)
        """
        # Calculate action alignment
        alignment = self.calculate_action_alignment(god_name, action, context)

        # Factor in current favor (makes gods more lenient/harsh)
        favor_adjustment = current_favor * 0.3

        # Combined tendency
        vote_tendency = alignment + favor_adjustment

        # Get god personality
        god = self.gods[god_name]
        abstain_chance = god.get('abstain_likelihood', 0.15)

        # Determine vote
        if vote_tendency >= 30:
            return 1  # Strong support
        elif vote_tendency <= -30:
            return -1  # Strong opposition
        elif -10 <= vote_tendency <= 10:
            # Ambiguous - might abstain
            if random.random() < abstain_chance:
                return 0
            else:
                # Lean toward favor
                return 1 if current_favor > 0 else -1
        else:
            # Moderate zone
            return 1 if vote_tendency > 0 else -1

    def generate_speech(self, god_name: str, vote_position: int, action: str, context: Dict) -> str:
        """
        Generate a speech for a god based on their vote

        Args:
            god_name: Which god is speaking
            vote_position: -1 (oppose), 0 (abstain), 1 (support)
            action: The action being judged
            context: Additional context

        Returns:
            Speech text
        """
        templates = SPEECH_TEMPLATES.get(god_name, {})

        if vote_position == 1:
            options = templates.get('support', ["I support this action."])
        elif vote_position == -1:
            options = templates.get('oppose', ["I oppose this action."])
        else:
            options = templates.get('abstain', ["I abstain from judgment."])

        return random.choice(options)

    def calculate_outcome(self, votes: Dict[str, int], favor_levels: Dict[str, int]) -> VoteOutcome:
        """
        Calculate weighted vote outcome

        Args:
            votes: {god_name: vote_value} (-1, 0, 1)
            favor_levels: {god_name: favor} (-100 to +100)

        Returns:
            VoteOutcome with all calculated values
        """
        # 1. Count raw votes
        raw_support = sum(1 for v in votes.values() if v == 1)
        raw_oppose = sum(1 for v in votes.values() if v == -1)
        raw_abstain = sum(1 for v in votes.values() if v == 0)

        # 2. Calculate weighted votes
        weighted_votes = {}
        total_score = 0

        for god_name, vote in votes.items():
            favor = favor_levels.get(god_name, 0)
            weighted = self.calculate_vote_weight(favor, vote)
            weighted_votes[god_name] = weighted
            total_score += weighted

        # 3. Determine outcome
        if raw_support == 7:
            outcome = "UNANIMOUS_BLESSING"
        elif raw_oppose == 7:
            outcome = "UNANIMOUS_CURSE"
        elif total_score >= 5.0:
            outcome = "STRONG_SUPPORT"
        elif total_score >= 2.0:
            outcome = "NARROW_SUPPORT"
        elif total_score > -2.0:
            outcome = "DEADLOCK"
        elif total_score > -5.0:
            outcome = "NARROW_OPPOSITION"
        else:
            outcome = "STRONG_OPPOSITION"

        # 4. Find decisive gods (highest weighted influence)
        sorted_weights = sorted(weighted_votes.items(), key=lambda x: abs(x[1]), reverse=True)
        decisive_gods = [god for god, weight in sorted_weights[:2]]

        # 5. Find swing gods (abstained with high favor)
        swing_gods = [
            god for god, vote in votes.items()
            if vote == 0 and abs(favor_levels.get(god, 0)) >= 50
        ]

        # 6. Calculate margin
        margin = abs(total_score)

        return VoteOutcome(
            raw_count=(raw_support, raw_oppose, raw_abstain),
            weighted_score=total_score,
            outcome=outcome,
            margin=margin,
            decisive_gods=decisive_gods,
            swing_gods=swing_gods,
            vote_breakdown=weighted_votes
        )

    def convene_council(self, player_id: str, game_id: str, action: str, context: Dict = None) -> Dict:
        """
        Full council voting process

        Returns: Complete vote result for UI display
        """
        if context is None:
            context = {}

        # 1. Get current favor levels
        favor_levels = self.db.get_all_favor(player_id)

        # 2. Determine each god's vote
        votes = {}
        vote_objects = []

        for god_name in self.gods.keys():
            current_favor = favor_levels.get(god_name, 0)
            vote_position = self.determine_god_vote(god_name, action, context, current_favor)
            votes[god_name] = vote_position

            # Generate speech
            speech = self.generate_speech(god_name, vote_position, action, context)

            # Create vote object
            vote_obj = Vote(
                god_name=god_name,
                position=vote_position,
                weight=self.calculate_vote_weight(current_favor, vote_position),
                reasoning=speech,
                favor_before=current_favor,
                favor_after=current_favor  # Updated after consequence application
            )
            vote_objects.append(vote_obj)

        # 3. Calculate outcome
        outcome = self.calculate_outcome(votes, favor_levels)

        logger.info(f"[DIVINE_COUNCIL] Outcome: {outcome.outcome}, Weighted Score: {outcome.weighted_score:.2f}")

        # 4. Return result (consequences applied separately)
        return {
            'votes': vote_objects,
            'outcome': outcome,
            'favor_levels': favor_levels
        }
