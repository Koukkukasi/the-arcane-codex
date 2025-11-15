"""
Divine Consequence Engine
Applies blessings, curses, and favor changes based on council votes
"""

from typing import Dict, List
from dataclasses import dataclass
import logging

logger = logging.getLogger(__name__)

@dataclass
class ConsequenceTier:
    outcome_type: str
    favor_changes: Dict[str, int]
    effects: List[Dict]
    narrative_impact: str
    rarity: str = "common"

class ConsequenceEngine:
    """Applies divine consequences to players"""

    def __init__(self, db):
        self.db = db
        self.consequence_tiers = self._define_tiers()

    def _define_tiers(self) -> Dict[str, ConsequenceTier]:
        """Define all consequence tiers"""
        return {
            "UNANIMOUS_BLESSING": ConsequenceTier(
                outcome_type="UNANIMOUS_BLESSING",
                favor_changes={god: 20 for god in ['VALDRIS', 'KAITHA', 'MORVANE', 'SYLARA', 'KORVAN', 'ATHENA', 'MERCUS']},
                effects=[{
                    "effect_type": "blessing",
                    "effect_name": "Divine Concordance",
                    "effect_description": "The gods sing in perfect harmony. Your path is blessed.",
                    "mechanical_effects": {
                        "all_checks": 20,
                        "divine_interventions": 1,
                        "reputation": 50
                    },
                    "duration_turns": 25
                }],
                narrative_impact="legendary",
                rarity="extremely_rare"
            ),

            "STRONG_SUPPORT": ConsequenceTier(
                outcome_type="STRONG_SUPPORT",
                favor_changes={},  # Calculated dynamically
                effects=[{
                    "effect_type": "blessing",
                    "effect_name": "Divine Favor",
                    "effect_description": "The gods approve your path. Their blessings flow through you.",
                    "mechanical_effects": {
                        "all_checks": 12,
                        "npc_reactions": 15,
                        "heal": 30
                    },
                    "duration_turns": 15
                }],
                narrative_impact="major_positive"
            ),

            "NARROW_SUPPORT": ConsequenceTier(
                outcome_type="NARROW_SUPPORT",
                favor_changes={},
                effects=[{
                    "effect_type": "blessing",
                    "effect_name": "Contested Blessing",
                    "effect_description": "Some gods smile upon you, others frown. The balance is delicate.",
                    "mechanical_effects": {
                        "all_checks": 6,
                        "npc_reactions": 5
                    },
                    "duration_turns": 8
                }],
                narrative_impact="minor_positive"
            ),

            "DEADLOCK": ConsequenceTier(
                outcome_type="DEADLOCK",
                favor_changes={},
                effects=[{
                    "effect_type": "neutral",
                    "effect_name": "Divine Schism",
                    "effect_description": "The gods war among themselves. Reality cracks.",
                    "mechanical_effects": {
                        "random_events": True,
                        "reality_distortion": True
                    },
                    "duration_turns": 5
                }],
                narrative_impact="chaotic_neutral"
            ),

            "NARROW_OPPOSITION": ConsequenceTier(
                outcome_type="NARROW_OPPOSITION",
                favor_changes={},
                effects=[{
                    "effect_type": "curse",
                    "effect_name": "Divine Disfavor",
                    "effect_description": "The gods are displeased. Their judgment weighs heavy.",
                    "mechanical_effects": {
                        "all_checks": -8,
                        "npc_reactions": -10
                    },
                    "duration_turns": 10
                }],
                narrative_impact="minor_negative"
            ),

            "STRONG_OPPOSITION": ConsequenceTier(
                outcome_type="STRONG_OPPOSITION",
                favor_changes={},
                effects=[{
                    "effect_type": "curse",
                    "effect_name": "Divine Condemnation",
                    "effect_description": "The gods have judged you and found you wanting.",
                    "mechanical_effects": {
                        "all_checks": -15,
                        "npc_reactions": -20,
                        "stamina_drain": 20
                    },
                    "duration_turns": 15
                }],
                narrative_impact="major_negative"
            ),

            "UNANIMOUS_CURSE": ConsequenceTier(
                outcome_type="UNANIMOUS_CURSE",
                favor_changes={god: -25 for god in ['VALDRIS', 'KAITHA', 'MORVANE', 'SYLARA', 'KORVAN', 'ATHENA', 'MERCUS']},
                effects=[{
                    "effect_type": "curse",
                    "effect_name": "Divine Abandonment",
                    "effect_description": "All gods turn their faces from you. You walk alone in darkness.",
                    "mechanical_effects": {
                        "all_checks": -25,
                        "no_divine_magic": True,
                        "max_hp_reduction": -30,
                        "npc_reactions": -50
                    },
                    "duration_turns": 30
                }],
                narrative_impact="catastrophic",
                rarity="extremely_rare"
            )
        }

    def calculate_favor_changes(self, outcome_type: str, votes: Dict[str, int]) -> Dict[str, int]:
        """Calculate favor changes based on outcome and votes"""

        if outcome_type in ["UNANIMOUS_BLESSING", "UNANIMOUS_CURSE"]:
            # Fixed favor changes
            tier = self.consequence_tiers[outcome_type]
            return tier.favor_changes

        # Dynamic favor changes based on votes
        favor_changes = {}

        for god_name, vote in votes.items():
            if outcome_type == "STRONG_SUPPORT":
                favor_changes[god_name] = 15 if vote == 1 else (5 if vote == 0 else -5)
            elif outcome_type == "NARROW_SUPPORT":
                favor_changes[god_name] = 10 if vote == 1 else (0 if vote == 0 else -8)
            elif outcome_type == "DEADLOCK":
                favor_changes[god_name] = 5 if vote == 1 else (-5 if vote == -1 else 0)
            elif outcome_type == "NARROW_OPPOSITION":
                favor_changes[god_name] = 8 if vote == 1 else (0 if vote == 0 else -10)
            elif outcome_type == "STRONG_OPPOSITION":
                favor_changes[god_name] = 5 if vote == 1 else (-5 if vote == 0 else -15)

        return favor_changes

    def apply_consequences(self, player_id: str, game_id: str, outcome_type: str, votes: Dict[str, int]) -> Dict:
        """
        Apply all consequences of a divine council vote

        Returns: Applied effects and narrative
        """
        tier = self.consequence_tiers[outcome_type]

        # 1. Calculate and apply favor changes
        favor_changes = self.calculate_favor_changes(outcome_type, votes)

        for god_name, change in favor_changes.items():
            new_favor = self.db.update_divine_favor(player_id, game_id, god_name, change)
            logger.info(f"[DIVINE_COUNCIL] {god_name} favor: {new_favor} ({change:+d})")

        # 2. Apply divine effects
        applied_effects = []

        for effect_data in tier.effects:
            effect_id = self.db.apply_divine_effect(player_id, game_id, effect_data)
            applied_effects.append({
                'id': effect_id,
                'name': effect_data['effect_name'],
                'description': effect_data['effect_description'],
                'duration': effect_data['duration_turns'],
                'type': effect_data['effect_type']
            })

        logger.info(f"[DIVINE_COUNCIL] Applied {len(applied_effects)} effects for outcome {outcome_type}")

        return {
            'favor_changes': favor_changes,
            'applied_effects': applied_effects,
            'impact_level': tier.narrative_impact
        }
