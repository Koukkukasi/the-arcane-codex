"""
Divine Council Module
Complete voting system for The Arcane Codex

This module implements the Divine Council where 7 gods vote on player actions
with weighted influence based on divine favor.
"""

from .voting_system import VotingSystem, Vote, VoteOutcome
from .god_personalities import GOD_PERSONALITIES, GODS
from .consequence_engine import ConsequenceEngine, ConsequenceTier

__all__ = [
    'VotingSystem',
    'Vote',
    'VoteOutcome',
    'GOD_PERSONALITIES',
    'GODS',
    'ConsequenceEngine',
    'ConsequenceTier'
]
