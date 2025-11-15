# Divine Council Implementation Guide
**Quick Reference for Phase F Development**
**Companion to: DIVINE_COUNCIL_VOTING_MECHANICS.md**

---

## QUICK START: 5-Minute Implementation Overview

### What You're Building

A voting system where 7 gods debate player actions, cast weighted votes based on divine favor, and impose blessings or curses.

### Core Files to Create

```
1. divine_council/voting_system.py      - Vote calculation engine
2. divine_council/god_personalities.py  - God behavior logic
3. divine_council/consequence_engine.py - Apply effects
4. static/js/divine_council_ui.js       - Frontend visualization
5. Database migration                   - Add council tables
```

### Implementation Timeline

- **Week 1**: Backend voting logic + database
- **Week 2**: Speeches + consequences
- **Week 3**: Frontend UI + integration
- **Week 4**: Polish + advanced features

---

## PHASE 1: DATABASE SETUP (Day 1)

### Step 1.1: Add Divine Council Tables

Add to `database.py` in the `init_database()` method:

```python
# In database.py -> init_database() -> executescript()

# Divine Council Votes (already exists, verify structure)
CREATE TABLE IF NOT EXISTS divine_councils (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    game_id TEXT NOT NULL,
    turn INTEGER NOT NULL,
    player_id TEXT NOT NULL,
    action_judged TEXT NOT NULL,
    votes JSON NOT NULL,           -- {god: {position, weight, reasoning}}
    testimonies JSON,               -- NPC opinions
    outcome TEXT NOT NULL,          -- "STRONG_SUPPORT", etc.
    weighted_score REAL NOT NULL,
    impact JSON NOT NULL,           -- favor changes, effects
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (game_id) REFERENCES games(id)
);

-- Divine Favor Tracking (NEW - add this)
CREATE TABLE IF NOT EXISTS divine_favor (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_id TEXT NOT NULL,
    game_id TEXT NOT NULL,
    god_name TEXT NOT NULL,
    favor_amount INTEGER DEFAULT 0,  -- -100 to +100
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(player_id, game_id, god_name)
);

-- Divine Effects (blessings/curses)
CREATE TABLE IF NOT EXISTS divine_effects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_id TEXT NOT NULL,
    game_id TEXT NOT NULL,
    effect_type TEXT NOT NULL,      -- "blessing", "curse"
    effect_name TEXT NOT NULL,      -- "DIVINE CONCORDANCE"
    effect_description TEXT,
    mechanical_effects JSON NOT NULL,
    duration_turns INTEGER,          -- -1 for permanent
    turns_remaining INTEGER,
    is_active BOOLEAN DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_favor_player ON divine_favor(player_id, god_name);
CREATE INDEX IF NOT EXISTS idx_effects_player ON divine_effects(player_id, is_active);
CREATE INDEX IF NOT EXISTS idx_councils_game ON divine_councils(game_id, turn);
```

### Step 1.2: Add Favor Management Methods to Database Class

Add these methods to `ArcaneDatabase` class:

```python
# In database.py -> ArcaneDatabase class

def get_divine_favor(self, player_id: str, god_name: str) -> int:
    """Get current favor with a specific god"""
    with self.get_connection() as conn:
        result = conn.execute("""
            SELECT favor_amount FROM divine_favor
            WHERE player_id = ? AND god_name = ?
        """, (player_id, god_name)).fetchone()

        return result['favor_amount'] if result else 0

def update_divine_favor(self, player_id: str, game_id: str, god_name: str, change: int):
    """Update favor with a god (clamped to -100/+100)"""
    current = self.get_divine_favor(player_id, god_name)
    new_favor = max(-100, min(100, current + change))

    with self.get_connection() as conn:
        conn.execute("""
            INSERT INTO divine_favor (player_id, game_id, god_name, favor_amount)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(player_id, game_id, god_name)
            DO UPDATE SET favor_amount = ?, last_updated = CURRENT_TIMESTAMP
        """, (player_id, game_id, god_name, new_favor, new_favor))

    return new_favor

def get_all_favor(self, player_id: str) -> Dict[str, int]:
    """Get favor with all gods"""
    with self.get_connection() as conn:
        results = conn.execute("""
            SELECT god_name, favor_amount FROM divine_favor
            WHERE player_id = ?
        """, (player_id,)).fetchall()

        favor_dict = {row['god_name']: row['favor_amount'] for row in results}

        # Ensure all 7 gods are represented
        for god in ['VALDRIS', 'KAITHA', 'MORVANE', 'SYLARA', 'KORVAN', 'ATHENA', 'MERCUS']:
            if god not in favor_dict:
                favor_dict[god] = 0

        return favor_dict

def apply_divine_effect(self, player_id: str, game_id: str, effect_data: Dict) -> int:
    """Apply a divine blessing or curse"""
    with self.get_connection() as conn:
        cursor = conn.execute("""
            INSERT INTO divine_effects
            (player_id, game_id, effect_type, effect_name, effect_description,
             mechanical_effects, duration_turns, turns_remaining)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            player_id,
            game_id,
            effect_data['effect_type'],
            effect_data['effect_name'],
            effect_data['effect_description'],
            json.dumps(effect_data['mechanical_effects']),
            effect_data['duration_turns'],
            effect_data['duration_turns']
        ))

        return cursor.lastrowid

def get_active_effects(self, player_id: str) -> List[Dict]:
    """Get all active divine effects for a player"""
    with self.get_connection() as conn:
        results = conn.execute("""
            SELECT * FROM divine_effects
            WHERE player_id = ? AND is_active = 1
            ORDER BY created_at DESC
        """, (player_id,)).fetchall()

        return [dict(row) for row in results]

def tick_divine_effects(self, player_id: str):
    """Reduce duration of all active effects by 1 turn"""
    with self.get_connection() as conn:
        # Decrement turns_remaining
        conn.execute("""
            UPDATE divine_effects
            SET turns_remaining = turns_remaining - 1
            WHERE player_id = ? AND is_active = 1 AND turns_remaining > 0
        """, (player_id,))

        # Deactivate expired effects
        conn.execute("""
            UPDATE divine_effects
            SET is_active = 0
            WHERE player_id = ? AND turns_remaining <= 0
        """, (player_id,))
```

---

## PHASE 2: CORE VOTING SYSTEM (Days 2-4)

### Step 2.1: Create `divine_council/voting_system.py`

```python
"""
Divine Council Voting System
Core voting mechanics for The Arcane Codex
"""

from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass
import random
import logging

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

    def __init__(self, db, god_personalities: Dict):
        self.db = db
        self.gods = god_personalities

    def calculate_vote_weight(self, favor: int, base_vote: int) -> float:
        """
        Calculate weighted vote based on favor

        Args:
            favor: -100 to +100
            base_vote: -1, 0, or 1

        Returns:
            Weighted vote (0.5x to 2.0x multiplier applied)
        """
        # Favor modifier: -100 = 0.5x, 0 = 1.0x, +100 = 2.0x
        favor_multiplier = 1.0 + (favor / 200)

        # Clamp between 0.5 and 2.0
        weight = max(0.5, min(2.0, favor_multiplier))

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

    def convene_council(self, player_id: str, game_id: str, action: str, context: Dict) -> Dict:
        """
        Full council voting process

        Returns: Complete vote result for UI display
        """
        # 1. Get current favor levels
        favor_levels = self.db.get_all_favor(player_id)

        # 2. Determine each god's vote
        votes = {}
        vote_objects = []

        for god_name in self.gods.keys():
            current_favor = favor_levels[god_name]
            vote_position = self.determine_god_vote(god_name, action, context, current_favor)
            votes[god_name] = vote_position

            # Create vote object (reasoning will be added by speech generator)
            vote_obj = Vote(
                god_name=god_name,
                position=vote_position,
                weight=self.calculate_vote_weight(current_favor, vote_position),
                reasoning="",  # Filled by speech generator
                favor_before=current_favor,
                favor_after=current_favor  # Updated after consequence application
            )
            vote_objects.append(vote_obj)

        # 3. Calculate outcome
        outcome = self.calculate_outcome(votes, favor_levels)

        # 4. Return result (consequences applied separately)
        return {
            'votes': vote_objects,
            'outcome': outcome,
            'favor_levels': favor_levels
        }
```

### Step 2.2: Create `divine_council/god_personalities.py`

```python
"""
God Personality Definitions
Behavioral patterns for all 7 gods
"""

GOD_PERSONALITIES = {
    "VALDRIS": {
        "name": "Valdris",
        "domain": "Order, Law, Justice",
        "symbol": "⚖️",
        "color": "#FFD700",  # Gold
        "core_values": ["order", "law", "justice", "consistency", "oaths", "honor contract"],
        "opposed_to": ["chaos", "lawbreaking", "oath-breaking", "anarchy", "lying"],
        "voting_style": "principled",
        "coalition_affinity": ["KORVAN", "ATHENA"],
        "coalition_rivalry": ["KAITHA", "MORVANE"],
        "abstain_likelihood": 0.1,
        "speech_tone": "stern, formal, judicial"
    },

    "KAITHA": {
        "name": "Kaitha",
        "domain": "Chaos, Freedom, Change",
        "symbol": "🔥",
        "color": "#FF4500",  # Red-orange
        "core_values": ["freedom", "chaos", "change", "rebellion", "individuality"],
        "opposed_to": ["tyranny", "conformity", "stagnation", "oppression"],
        "voting_style": "passionate",
        "coalition_affinity": ["MERCUS"],
        "coalition_rivalry": ["VALDRIS", "KORVAN"],
        "abstain_likelihood": 0.05,
        "speech_tone": "fiery, defiant, provocative"
    },

    "MORVANE": {
        "name": "Morvane",
        "domain": "Survival, Pragmatism, Harsh Truths",
        "symbol": "💀",
        "color": "#800080",  # Purple
        "core_values": ["survival", "pragmatism", "harsh truth", "efficiency", "sacrifice few"],
        "opposed_to": ["idealism", "waste", "sentiment", "weakness"],
        "voting_style": "calculated",
        "coalition_affinity": ["MERCUS", "ATHENA"],
        "coalition_rivalry": ["SYLARA", "KORVAN"],
        "abstain_likelihood": 0.15,
        "speech_tone": "cold, blunt, realistic"
    },

    "SYLARA": {
        "name": "Sylara",
        "domain": "Nature, Balance, Growth",
        "symbol": "🌿",
        "color": "#228B22",  # Green
        "core_values": ["balance", "nature", "growth", "harmony", "cycles"],
        "opposed_to": ["corruption", "destruction", "imbalance", "poison"],
        "voting_style": "patient",
        "coalition_affinity": ["ATHENA", "VALDRIS"],
        "coalition_rivalry": ["MORVANE", "KORVAN"],
        "abstain_likelihood": 0.25,
        "speech_tone": "calm, measured, philosophical"
    },

    "KORVAN": {
        "name": "Korvan",
        "domain": "War, Honor, Glory",
        "symbol": "⚔️",
        "color": "#DC143C",  # Crimson
        "core_values": ["honor", "courage", "strength", "glory", "combat", "fight"],
        "opposed_to": ["cowardice", "dishonor", "weakness", "pacifism", "flee"],
        "voting_style": "direct",
        "coalition_affinity": ["VALDRIS"],
        "coalition_rivalry": ["KAITHA", "SYLARA"],
        "abstain_likelihood": 0.08,
        "speech_tone": "fierce, commanding, martial"
    },

    "ATHENA": {
        "name": "Athena",
        "domain": "Wisdom, Knowledge, Strategy",
        "symbol": "📚",
        "color": "#4169E1",  # Blue
        "core_values": ["wisdom", "knowledge", "strategy", "learning", "truth", "think"],
        "opposed_to": ["ignorance", "recklessness", "destroy knowledge", "blind"],
        "voting_style": "analytical",
        "coalition_affinity": ["VALDRIS", "SYLARA"],
        "coalition_rivalry": ["KAITHA", "KORVAN"],
        "abstain_likelihood": 0.20,
        "speech_tone": "thoughtful, precise, scholarly"
    },

    "MERCUS": {
        "name": "Mercus",
        "domain": "Commerce, Wealth, Ambition",
        "symbol": "💰",
        "color": "#FFD700",  # Gold
        "core_values": ["commerce", "wealth", "ambition", "negotiation", "value", "profit"],
        "opposed_to": ["waste", "destroy value", "foolish deals"],
        "voting_style": "transactional",
        "coalition_affinity": ["MORVANE", "KAITHA"],
        "coalition_rivalry": ["VALDRIS", "SYLARA"],
        "abstain_likelihood": 0.12,
        "speech_tone": "shrewd, persuasive, opportunistic"
    }
}

# Export for easy import
GODS = GOD_PERSONALITIES
```

---

## PHASE 3: CONSEQUENCE ENGINE (Days 5-6)

### Step 3.1: Create `divine_council/consequence_engine.py`

```python
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
            logger.info(f"{god_name} favor: {new_favor} ({change:+d})")

        # 2. Apply divine effects
        applied_effects = []

        for effect_data in tier.effects:
            effect_id = self.db.apply_divine_effect(player_id, game_id, effect_data)
            applied_effects.append({
                'id': effect_id,
                'name': effect_data['effect_name'],
                'description': effect_data['effect_description'],
                'duration': effect_data['duration_turns']
            })

        return {
            'favor_changes': favor_changes,
            'applied_effects': applied_effects,
            'impact_level': tier.narrative_impact
        }
```

---

## PHASE 4: INTEGRATION WITH GAME FLOW (Day 7)

### Step 4.1: Add Council Endpoint to `web_game.py`

```python
# In web_game.py

from divine_council.voting_system import VotingSystem
from divine_council.god_personalities import GOD_PERSONALITIES
from divine_council.consequence_engine import ConsequenceEngine

# Initialize systems
voting_system = VotingSystem(db, GOD_PERSONALITIES)
consequence_engine = ConsequenceEngine(db)

@app.route('/api/divine_council/convene', methods=['POST'])
def convene_divine_council():
    """
    Trigger a divine council vote

    Request: {
        "action": "Player broke oath to village elder",
        "context": {
            "involves_oath": true,
            "breaks_law": false
        }
    }

    Response: {
        "votes": [...],
        "outcome": {...},
        "consequences": {...}
    }
    """
    try:
        data = request.json
        player_id = session.get('player_id')
        game_code = session.get('game_code')

        if not player_id or not game_code:
            return jsonify({'success': False, 'error': 'Not in game'}), 401

        game = db.get_game_by_code(game_code)
        if not game:
            return jsonify({'success': False, 'error': 'Game not found'}), 404

        action = data.get('action')
        context = data.get('context', {})

        # 1. Convene council and get votes
        vote_result = voting_system.convene_council(player_id, game['id'], action, context)

        # 2. Apply consequences
        consequences = consequence_engine.apply_consequences(
            player_id,
            game['id'],
            vote_result['outcome'].outcome,
            {v.god_name: v.position for v in vote_result['votes']}
        )

        # 3. Save vote to database
        save_council_vote(game['id'], player_id, action, vote_result, consequences)

        # 4. Return result for UI
        return jsonify({
            'success': True,
            'votes': [
                {
                    'god_name': v.god_name,
                    'position': v.position,
                    'weight': v.weight,
                    'reasoning': v.reasoning
                }
                for v in vote_result['votes']
            ],
            'outcome': {
                'type': vote_result['outcome'].outcome,
                'raw_count': vote_result['outcome'].raw_count,
                'weighted_score': vote_result['outcome'].weighted_score,
                'decisive_gods': vote_result['outcome'].decisive_gods
            },
            'consequences': consequences
        })

    except Exception as e:
        logger.error(f"Divine council error: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

def save_council_vote(game_id: str, player_id: str, action: str, vote_result: Dict, consequences: Dict):
    """Save council vote to database"""
    with db.get_connection() as conn:
        conn.execute("""
            INSERT INTO divine_councils
            (game_id, player_id, turn, action_judged, votes, outcome, weighted_score, impact)
            VALUES (?, ?, (SELECT turn FROM games WHERE id = ?), ?, ?, ?, ?, ?)
        """, (
            game_id,
            player_id,
            game_id,
            action,
            json.dumps({v.god_name: {'position': v.position, 'weight': v.weight} for v in vote_result['votes']}),
            vote_result['outcome'].outcome,
            vote_result['outcome'].weighted_score,
            json.dumps(consequences)
        ))
```

---

## PHASE 5: FRONTEND VISUALIZATION (Days 8-10)

### Step 5.1: Create `static/js/divine_council_ui.js`

```javascript
/**
 * Divine Council UI
 * Handles animated vote reveals and consequence display
 */

class DivineCouncilUI {
    constructor() {
        this.container = document.getElementById('divine-council-container');
        this.animationSpeed = 800; // ms per vote reveal
    }

    async showCouncilVote(voteData) {
        // Phase 1: Convene (2 seconds)
        await this.showConveneAnimation();

        // Phase 2: Present action (3 seconds)
        await this.showAction(voteData.action);

        // Phase 3: Reveal votes sequentially
        await this.revealVotes(voteData.votes);

        // Phase 4: Show outcome
        await this.showOutcome(voteData.outcome);

        // Phase 5: Display consequences
        await this.showConsequences(voteData.consequences);
    }

    async showConveneAnimation() {
        const html = `
            <div class="council-convene" id="council-convene">
                <div class="divine-title">THE GODS CONVENE</div>
                <div class="divine-symbols">
                    <span class="god-symbol">⚖️</span>
                    <span class="god-symbol">🔥</span>
                    <span class="god-symbol">💀</span>
                    <span class="god-symbol">🌿</span>
                    <span class="god-symbol">⚔️</span>
                    <span class="god-symbol">📚</span>
                    <span class="god-symbol">💰</span>
                </div>
            </div>
        `;

        this.container.innerHTML = html;
        this.container.classList.add('active');

        await this.pause(2000);
        document.getElementById('council-convene').classList.add('fade-out');
        await this.pause(500);
    }

    async showAction(action) {
        const html = `
            <div class="action-judged" id="action-judged">
                <h3>THE ACTION JUDGED</h3>
                <p>${action}</p>
            </div>
        `;

        this.container.innerHTML = html;
        await this.pause(3000);
    }

    async revealVotes(votes) {
        const html = `
            <div class="votes-container" id="votes-container">
                <div class="vote-tally">
                    <div class="tally-bar" id="tally-bar"></div>
                    <div class="tally-score" id="tally-score">0.0</div>
                </div>
                <div class="votes-list" id="votes-list"></div>
            </div>
        `;

        this.container.innerHTML = html;

        const votesList = document.getElementById('votes-list');
        const tallyBar = document.getElementById('tally-bar');
        const tallyScore = document.getElementById('tally-score');

        let runningScore = 0;

        for (let vote of votes) {
            // Add vote card
            const voteCard = this.createVoteCard(vote);
            votesList.appendChild(voteCard);

            // Animate entrance
            await this.pause(100);
            voteCard.classList.add('visible');

            // Update tally
            runningScore += vote.weight;
            this.updateTally(tallyBar, tallyScore, runningScore);

            await this.pause(this.animationSpeed);
        }
    }

    createVoteCard(vote) {
        const div = document.createElement('div');
        div.className = 'vote-card';

        const positionClass = vote.position === 1 ? 'support' :
                            vote.position === -1 ? 'oppose' : 'abstain';

        const positionText = vote.position === 1 ? '✅ SUPPORT' :
                           vote.position === -1 ? '❌ OPPOSE' : '⏸️ ABSTAIN';

        div.innerHTML = `
            <div class="vote-god">${this.getGodSymbol(vote.god_name)} ${vote.god_name}</div>
            <div class="vote-position ${positionClass}">${positionText}</div>
            <div class="vote-weight">Weight: ${vote.weight.toFixed(2)}x</div>
        `;

        return div;
    }

    updateTally(tallyBar, tallyScore, score) {
        // Update score text
        tallyScore.textContent = score.toFixed(1);

        // Update bar position (-14 to +14 range)
        const percentage = ((score + 14) / 28) * 100;
        tallyBar.style.left = `${percentage}%`;

        // Color based on score
        if (score >= 5) {
            tallyBar.style.backgroundColor = '#FFD700'; // Gold
        } else if (score >= 2) {
            tallyBar.style.backgroundColor = '#90EE90'; // Light green
        } else if (score > -2) {
            tallyBar.style.backgroundColor = '#9370DB'; // Purple
        } else if (score > -5) {
            tallyBar.style.backgroundColor = '#FF6B6B'; // Light red
        } else {
            tallyBar.style.backgroundColor = '#8B0000'; // Dark red
        }
    }

    async showOutcome(outcome) {
        const html = `
            <div class="outcome-screen" id="outcome-screen">
                <h2 class="outcome-title ${this.getOutcomeClass(outcome.type)}">
                    ${this.getOutcomeTitle(outcome.type)}
                </h2>
                <div class="outcome-details">
                    <p>Raw Votes: ${outcome.raw_count[0]} Support - ${outcome.raw_count[1]} Oppose - ${outcome.raw_count[2]} Abstain</p>
                    <p>Weighted Score: ${outcome.weighted_score.toFixed(1)} / 14.0</p>
                </div>
            </div>
        `;

        this.container.innerHTML = html;
        await this.pause(4000);
    }

    async showConsequences(consequences) {
        let html = '<div class="consequences-screen"><h3>DIVINE JUDGMENT</h3>';

        // Favor changes
        html += '<div class="favor-changes"><h4>Favor Changes</h4>';
        for (let [god, change] of Object.entries(consequences.favor_changes)) {
            const sign = change > 0 ? '+' : '';
            const colorClass = change > 0 ? 'positive' : 'negative';
            html += `<p class="${colorClass}">${god}: ${sign}${change}</p>`;
        }
        html += '</div>';

        // Effects
        html += '<div class="divine-effects"><h4>Divine Effects</h4>';
        for (let effect of consequences.applied_effects) {
            html += `
                <div class="effect-card">
                    <h5>${effect.name}</h5>
                    <p>${effect.description}</p>
                    <p class="duration">Duration: ${effect.duration} turns</p>
                </div>
            `;
        }
        html += '</div>';

        html += '<button onclick="divineCouncilUI.close()">Continue</button></div>';

        this.container.innerHTML = html;
    }

    getGodSymbol(godName) {
        const symbols = {
            'VALDRIS': '⚖️',
            'KAITHA': '🔥',
            'MORVANE': '💀',
            'SYLARA': '🌿',
            'KORVAN': '⚔️',
            'ATHENA': '📚',
            'MERCUS': '💰'
        };
        return symbols[godName] || '❓';
    }

    getOutcomeTitle(type) {
        const titles = {
            'UNANIMOUS_BLESSING': '✨ DIVINE CONCORDANCE ✨',
            'STRONG_SUPPORT': '⭐ BLESSED ⭐',
            'NARROW_SUPPORT': '👍 APPROVED 👍',
            'DEADLOCK': '⚡ DIVINE SCHISM ⚡',
            'NARROW_OPPOSITION': '👎 CONDEMNED 👎',
            'STRONG_OPPOSITION': '⚠️ CURSED ⚠️',
            'UNANIMOUS_CURSE': '💀 DIVINE ABANDONMENT 💀'
        };
        return titles[type] || type;
    }

    getOutcomeClass(type) {
        if (type.includes('BLESSING') || type.includes('SUPPORT')) return 'outcome-positive';
        if (type.includes('CURSE') || type.includes('OPPOSITION')) return 'outcome-negative';
        return 'outcome-neutral';
    }

    pause(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    close() {
        this.container.classList.remove('active');
        this.container.innerHTML = '';
    }
}

// Initialize
const divineCouncilUI = new DivineCouncilUI();

// Trigger council vote
async function triggerDivineCouncil(action, context) {
    const response = await fetch('/api/divine_council/convene', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({action, context})
    });

    const data = await response.json();

    if (data.success) {
        await divineCouncilUI.showCouncilVote({
            action: action,
            votes: data.votes,
            outcome: data.outcome,
            consequences: data.consequences
        });
    }
}
```

---

## TESTING CHECKLIST

### Unit Tests
- [ ] Vote weight calculation (favor -100, 0, +100)
- [ ] Action alignment calculation
- [ ] Vote determination logic
- [ ] Outcome calculation (all 7 tiers)
- [ ] Favor change formulas

### Integration Tests
- [ ] Full council convening flow
- [ ] Database persistence
- [ ] Effect application
- [ ] Favor tracking over time

### UI Tests
- [ ] Vote reveal animations
- [ ] Tally bar updates
- [ ] Mobile responsiveness
- [ ] Accessibility (keyboard navigation)

---

## NEXT STEPS

1. **Today**: Set up database tables, create file structure
2. **Tomorrow**: Implement voting system core logic
3. **Day 3**: Add god personalities and consequence engine
4. **Day 4**: Integrate with web_game.py
5. **Day 5-7**: Build frontend UI
6. **Day 8-10**: Test, polish, deploy

---

**This implementation guide provides everything needed to build the Divine Council voting system. Start with Phase 1 (database) and proceed sequentially.**
