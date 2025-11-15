"""
THE ARCANE CODEX - Quest Management System
Handles quest triggering, progression, and rewards
"""

import json
import logging
import random
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, field, asdict
from enum import Enum
from datetime import datetime

logger = logging.getLogger(__name__)

# ============================================================================
# QUEST ENUMS AND DATA STRUCTURES
# ============================================================================

class QuestCategory(Enum):
    """Quest categories"""
    MAIN_STORY = "main_story"
    SIDE_QUEST = "side_quest"
    DIVINE_TRIAL = "divine_trial"
    NPC_REQUEST = "npc_request"
    TIME_LIMITED = "time_limited"
    RANDOM_ENCOUNTER = "random_encounter"

class QuestStatus(Enum):
    """Quest completion status"""
    NOT_STARTED = "not_started"
    AVAILABLE = "available"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"
    ABANDONED = "abandoned"

class ObjectiveType(Enum):
    """Types of quest objectives"""
    TALK = "talk"
    KILL = "kill"
    OBTAIN = "obtain"
    DELIVER = "deliver"
    LOCATION = "location"
    ESCORT = "escort"
    DEFEND = "defend"
    CHOICE_BRANCH = "choice_branch"
    PAYMENT = "payment"
    SKILL_CHECK = "skill_check"
    OPTIONAL = "optional"

@dataclass
class QuestObjective:
    """Individual quest objective"""
    id: str
    type: ObjectiveType
    description: str
    required: bool = True
    hidden: bool = False
    completed: bool = False
    progress: int = 0
    progress_max: int = 1
    target: Optional[str] = None
    item: Optional[str] = None
    quantity: int = 1
    location: Optional[str] = None
    skill_check: Optional[Dict] = None
    reveal_condition: Optional[Dict] = None
    reward_bonus: Optional[Dict] = None
    branches: Optional[List[Dict]] = None
    revealed: bool = False

    def to_dict(self) -> Dict:
        """Convert to dictionary for JSON serialization"""
        data = asdict(self)
        data['type'] = self.type.value
        return data

    @classmethod
    def from_dict(cls, data: Dict) -> 'QuestObjective':
        """Create from dictionary"""
        data = data.copy()
        if isinstance(data.get('type'), str):
            data['type'] = ObjectiveType(data['type'])
        return cls(**data)

@dataclass
class QuestRewards:
    """Quest reward structure"""
    xp: int = 0
    gold: int = 0
    items: List[Dict] = field(default_factory=list)
    divine_favor: Dict[str, int] = field(default_factory=dict)
    npc_approval: Dict[str, int] = field(default_factory=dict)
    reputation: Dict[str, int] = field(default_factory=dict)
    unlocks: List[str] = field(default_factory=list)
    skills: List[str] = field(default_factory=list)

    def to_dict(self) -> Dict:
        """Convert to dictionary"""
        return asdict(self)

    @classmethod
    def from_dict(cls, data: Dict) -> 'QuestRewards':
        """Create from dictionary"""
        return cls(**data)

@dataclass
class Quest:
    """Complete quest definition"""
    quest_id: str
    category: QuestCategory
    tier: int
    name: str
    description: str
    objectives: List[QuestObjective]
    rewards: QuestRewards
    status: QuestStatus = QuestStatus.NOT_STARTED
    quest_giver: Optional[Dict] = None
    requirements: Dict[str, Any] = field(default_factory=dict)
    time_limit: Optional[Dict] = None
    current_objective_index: int = 0
    chosen_branch: Optional[str] = None
    started_turn: Optional[int] = None
    completed_turn: Optional[int] = None
    failed: bool = False
    abandoned: bool = False
    metadata: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict:
        """Convert to dictionary for JSON serialization"""
        return {
            'quest_id': self.quest_id,
            'category': self.category.value,
            'tier': self.tier,
            'name': self.name,
            'description': self.description,
            'objectives': [obj.to_dict() for obj in self.objectives],
            'rewards': self.rewards.to_dict(),
            'status': self.status.value,
            'quest_giver': self.quest_giver,
            'requirements': self.requirements,
            'time_limit': self.time_limit,
            'current_objective_index': self.current_objective_index,
            'chosen_branch': self.chosen_branch,
            'started_turn': self.started_turn,
            'completed_turn': self.completed_turn,
            'failed': self.failed,
            'abandoned': self.abandoned,
            'metadata': self.metadata
        }

    @classmethod
    def from_dict(cls, data: Dict) -> 'Quest':
        """Create from dictionary"""
        data = data.copy()
        data['category'] = QuestCategory(data['category'])
        data['status'] = QuestStatus(data['status'])
        data['objectives'] = [QuestObjective.from_dict(obj) for obj in data['objectives']]
        data['rewards'] = QuestRewards.from_dict(data['rewards'])
        return cls(**data)

# ============================================================================
# QUEST REWARD CALCULATOR
# ============================================================================

class QuestRewardCalculator:
    """Calculate quest rewards based on multiple factors"""

    # XP scaling by quest tier
    XP_BASE_BY_TIER = {
        1: 100, 2: 250, 3: 500, 4: 1000, 5: 2000,
        6: 4000, 7: 7500, 8: 12000, 9: 18000, 10: 25000
    }

    # Gold scaling by tier
    GOLD_BASE_BY_TIER = {
        1: 50, 2: 125, 3: 250, 4: 500, 5: 1000,
        6: 2000, 7: 3750, 8: 6000, 9: 9000, 10: 15000
    }

    def calculate_xp_reward(self, quest: Quest, party_size: int,
                           completion_data: Dict) -> int:
        """
        Calculate XP reward with bonuses

        Factors:
        - Quest tier (base)
        - Completion speed bonus
        - Optional objectives bonus
        - Difficulty modifiers
        """
        base_xp = self.XP_BASE_BY_TIER.get(quest.tier, 100)

        # Speed bonus (completed faster than expected)
        speed_multiplier = 1.0
        if quest.time_limit:
            turns_used = completion_data.get("turns_used", 999)
            max_turns = quest.time_limit.get("max_turns", 999)
            if turns_used <= max_turns / 2:
                speed_multiplier = 1.5  # 50% bonus for speed
            elif turns_used <= max_turns * 0.75:
                speed_multiplier = 1.25  # 25% bonus

        # Optional objectives bonus
        optional_bonus = 0
        completed_optional = sum(1 for obj in quest.objectives
                                if not obj.required and obj.completed)
        total_optional = sum(1 for obj in quest.objectives if not obj.required)
        if total_optional > 0:
            optional_bonus = int(base_xp * 0.5 * (completed_optional / total_optional))

        # Difficulty modifiers from party composition
        difficulty_mult = self._calculate_difficulty_multiplier(quest, party_size)

        total_xp = int((base_xp * speed_multiplier * difficulty_mult) + optional_bonus)

        return total_xp

    def calculate_gold_reward(self, quest: Quest, chosen_branch: Optional[str]) -> int:
        """Calculate gold reward"""
        base_gold = self.GOLD_BASE_BY_TIER.get(quest.tier, 50)

        # Branch modifiers
        if chosen_branch:
            branch_data = self._find_branch_data(quest, chosen_branch)
            if branch_data:
                gold_mult = branch_data.get("gold_multiplier", 1.0)
                base_gold = int(base_gold * gold_mult)

        return base_gold

    def calculate_divine_favor_rewards(self, quest: Quest) -> Dict[str, int]:
        """
        Calculate divine favor changes from quest completion

        Combines:
        - Base quest rewards
        - Branch choice consequences
        - Optional objective bonuses
        """
        total_favor = {}

        # Base rewards
        if quest.rewards.divine_favor:
            for god, favor in quest.rewards.divine_favor.items():
                total_favor[god] = total_favor.get(god, 0) + favor

        # Branch consequences
        if quest.chosen_branch:
            branch_data = self._find_branch_data(quest, quest.chosen_branch)
            if branch_data and "consequences" in branch_data:
                branch_favor = branch_data["consequences"].get("divine_favor", {})
                for god, favor in branch_favor.items():
                    total_favor[god] = total_favor.get(god, 0) + favor

        # Optional objective bonuses
        for obj in quest.objectives:
            if not obj.required and obj.completed and obj.reward_bonus:
                obj_favor = obj.reward_bonus.get("divine_favor", {})
                for god, favor in obj_favor.items():
                    total_favor[god] = total_favor.get(god, 0) + favor

        return total_favor

    def _calculate_difficulty_multiplier(self, quest: Quest, party_size: int) -> float:
        """Adjust rewards based on difficulty factors"""
        multiplier = 1.0

        # Party size modifier (solo = 1.5x, duo = 1.25x)
        if party_size == 1:
            multiplier *= 1.5
        elif party_size == 2:
            multiplier *= 1.25

        # Quest difficulty tier
        if quest.tier >= 7:
            multiplier *= 1.2  # Late-game bonus

        return multiplier

    def _find_branch_data(self, quest: Quest, branch_id: str) -> Optional[Dict]:
        """Find branch data in quest objectives"""
        for obj in quest.objectives:
            if obj.type == ObjectiveType.CHOICE_BRANCH and obj.branches:
                for branch in obj.branches:
                    if branch.get("branch_id") == branch_id:
                        return branch
        return None

# ============================================================================
# QUEST PROGRESSION ENGINE
# ============================================================================

class QuestProgressionEngine:
    """Handles objective updates and quest advancement"""

    def update_objective(self, quest: Quest, trigger_type: str,
                        trigger_data: Dict) -> Dict:
        """
        Update quest objectives based on game events

        Returns:
            {
                "objectives_updated": [...],
                "quest_advanced": bool,
                "quest_completed": bool,
                "hidden_objectives_revealed": [...],
                "rewards_earned": {...}
            }
        """
        result = {
            "objectives_updated": [],
            "quest_advanced": False,
            "quest_completed": False,
            "hidden_objectives_revealed": [],
            "rewards_earned": {},
            "quest_failed": False
        }

        if quest.current_objective_index >= len(quest.objectives):
            return result

        current_objective = quest.objectives[quest.current_objective_index]

        # Check if current objective matches trigger
        if self._objective_matches_trigger(current_objective, trigger_type, trigger_data):
            current_objective.completed = True
            result["objectives_updated"].append(current_objective.id)

            # Advance to next objective
            quest.current_objective_index += 1
            result["quest_advanced"] = True

            # Check if quest complete
            if self._all_required_objectives_complete(quest):
                quest.status = QuestStatus.COMPLETED
                quest.completed_turn = trigger_data.get("current_turn")
                result["quest_completed"] = True

        # Check for hidden objective reveals
        for obj in quest.objectives:
            if obj.hidden and not obj.revealed:
                if self._check_reveal_condition(obj, trigger_data):
                    obj.revealed = True
                    result["hidden_objectives_revealed"].append(obj.id)

        # Check for time limit expiration
        if quest.time_limit:
            if self._check_time_limit_expired(quest, trigger_data):
                quest.status = QuestStatus.FAILED
                quest.failed = True
                result["quest_failed"] = True

        return result

    def _objective_matches_trigger(self, objective: QuestObjective,
                                   trigger_type: str, trigger_data: Dict) -> bool:
        """Check if objective is satisfied by trigger"""

        if objective.type.value != trigger_type:
            return False

        if trigger_type == "talk":
            return objective.target == trigger_data.get("npc_id")

        elif trigger_type == "kill":
            if objective.target == trigger_data.get("enemy_type"):
                objective.progress += trigger_data.get("count", 1)
                return objective.progress >= objective.progress_max
            return False

        elif trigger_type == "obtain":
            if objective.item == trigger_data.get("item_id"):
                objective.progress += trigger_data.get("quantity", 1)
                return objective.progress >= objective.quantity
            return False

        elif trigger_type == "location":
            return objective.location == trigger_data.get("location_id")

        elif trigger_type == "deliver":
            return (objective.target == trigger_data.get("npc_id") and
                   objective.item == trigger_data.get("item_id"))

        elif trigger_type == "payment":
            return trigger_data.get("gold_paid", 0) >= objective.skill_check.get("gold_required", 0)

        elif trigger_type == "skill_check":
            if objective.skill_check:
                roll = trigger_data.get("roll")
                modifier = trigger_data.get("modifier", 0)
                return (roll + modifier) >= objective.skill_check["difficulty"]
            return False

        return False

    def _all_required_objectives_complete(self, quest: Quest) -> bool:
        """Check if all required objectives are complete"""
        for obj in quest.objectives:
            if obj.required and not obj.completed:
                return False
        return True

    def _check_reveal_condition(self, objective: QuestObjective,
                                trigger_data: Dict) -> bool:
        """Check if hidden objective should be revealed"""
        if not objective.reveal_condition:
            return False

        condition = objective.reveal_condition
        cond_type = condition.get("type")

        if cond_type == "location_search":
            if trigger_data.get("location_id") == condition.get("location"):
                if "skill_check" in condition:
                    roll = trigger_data.get("skill_roll", 0)
                    return roll >= condition["skill_check"]["difficulty"]
                return True

        elif cond_type == "item_examined":
            return trigger_data.get("item_id") == condition.get("item")

        elif cond_type == "npc_approval":
            npc_approval = trigger_data.get("npc_approval", {})
            npc = condition.get("npc")
            threshold = condition.get("threshold", 0)
            return npc_approval.get(npc, 0) >= threshold

        return False

    def _check_time_limit_expired(self, quest: Quest, trigger_data: Dict) -> bool:
        """Check if quest time limit has expired"""
        if not quest.time_limit:
            return False

        time_type = quest.time_limit.get("type")
        current_turn = trigger_data.get("current_turn", 0)

        if time_type == "turn_based":
            max_turns = quest.time_limit.get("max_turns")
            turns_elapsed = current_turn - (quest.started_turn or 0)
            return turns_elapsed > max_turns

        return False

# ============================================================================
# QUEST MANAGER
# ============================================================================

class QuestManager:
    """
    Main quest management system

    Handles:
    - Quest availability checking
    - Quest starting and progression
    - Objective tracking
    - Reward distribution
    - Quest state persistence
    """

    def __init__(self):
        self.quests: Dict[str, Quest] = {}
        self.active_quests: List[str] = []
        self.completed_quests: List[str] = []
        self.available_quests: List[str] = []

        self.progression_engine = QuestProgressionEngine()
        self.reward_calculator = QuestRewardCalculator()

        # Load quest database
        self._load_quest_database()

    def _load_quest_database(self):
        """Load all quest definitions"""
        # This would normally load from JSON files or database
        # For now, we'll add quests programmatically
        logger.info("Quest database loaded")

    def add_quest(self, quest: Quest):
        """Add a quest to the database"""
        self.quests[quest.quest_id] = quest
        logger.info(f"Added quest: {quest.quest_id}")

    def get_quest(self, quest_id: str) -> Optional[Quest]:
        """Get quest by ID"""
        return self.quests.get(quest_id)

    def get_available_quests(self, character: Any, game_state: Any) -> List[Quest]:
        """
        Get all quests available to start

        Checks requirements:
        - Level
        - Prerequisites
        - Divine favor
        - NPC approval
        - Location
        """
        available = []

        for quest_id, quest in self.quests.items():
            if quest.status != QuestStatus.NOT_STARTED:
                continue

            if self._check_quest_requirements(quest, character, game_state):
                quest.status = QuestStatus.AVAILABLE
                available.append(quest)

        return available

    def _check_quest_requirements(self, quest: Quest, character: Any,
                                  game_state: Any) -> bool:
        """Check if character meets quest requirements"""
        reqs = quest.requirements

        # Level requirement
        if "min_level" in reqs:
            if character.level < reqs["min_level"]:
                return False

        # Prerequisite quests
        if "required_quests_completed" in reqs:
            for prereq_id in reqs["required_quests_completed"]:
                if prereq_id not in self.completed_quests:
                    return False

        # Divine favor threshold
        if "divine_favor_threshold" in reqs:
            threshold_data = reqs["divine_favor_threshold"]
            god = threshold_data["god"]
            threshold = threshold_data["threshold"]
            if character.divine_favor.get(god, 0) < threshold:
                return False

        # NPC approval threshold
        if "npc_approval_threshold" in reqs:
            threshold_data = reqs["npc_approval_threshold"]
            npc_id = threshold_data["npc"]
            threshold = threshold_data["threshold"]
            npc = game_state.npcs.get(npc_id)
            if not npc or npc.approval < threshold:
                return False

        # Location unlocked
        if "location_unlocked" in reqs:
            for location in reqs["location_unlocked"]:
                if location not in game_state.unlocked_locations:
                    return False

        return True

    def start_quest(self, quest_id: str, character: Any,
                   game_state: Any) -> Dict:
        """
        Start a quest

        Returns:
            {
                "success": bool,
                "message": str,
                "quest": Quest (if successful)
            }
        """
        quest = self.get_quest(quest_id)

        if not quest:
            return {"success": False, "message": "Quest not found"}

        if quest.status == QuestStatus.IN_PROGRESS:
            return {"success": False, "message": "Quest already in progress"}

        if quest.status == QuestStatus.COMPLETED:
            return {"success": False, "message": "Quest already completed"}

        # Check requirements
        if not self._check_quest_requirements(quest, character, game_state):
            return {"success": False, "message": "Requirements not met"}

        # Start quest
        quest.status = QuestStatus.IN_PROGRESS
        quest.started_turn = game_state.turn_count
        self.active_quests.append(quest_id)

        logger.info(f"Quest started: {quest_id} by {character.name}")

        return {
            "success": True,
            "message": f"Quest started: {quest.name}",
            "quest": quest
        }

    def get_active_quests(self) -> List[Quest]:
        """Get all active quests"""
        return [self.quests[qid] for qid in self.active_quests
                if qid in self.quests]

    def get_completed_quests(self) -> List[Quest]:
        """Get all completed quests"""
        return [self.quests[qid] for qid in self.completed_quests
                if qid in self.quests]

    def process_game_event(self, event_type: str, event_data: Dict,
                          game_state: Any) -> List[Dict]:
        """
        Process game event and update relevant quests

        Returns list of quest updates
        """
        updates = []

        for quest_id in self.active_quests:
            quest = self.quests[quest_id]

            result = self.progression_engine.update_objective(
                quest, event_type, event_data
            )

            if result["quest_completed"]:
                self._complete_quest(quest, game_state)
                updates.append({
                    "quest_id": quest_id,
                    "type": "completed",
                    "result": result
                })
            elif result["quest_failed"]:
                self._fail_quest(quest, game_state)
                updates.append({
                    "quest_id": quest_id,
                    "type": "failed",
                    "result": result
                })
            elif result["quest_advanced"]:
                updates.append({
                    "quest_id": quest_id,
                    "type": "advanced",
                    "result": result
                })

        return updates

    def choose_branch(self, quest_id: str, branch_id: str,
                     game_state: Any) -> Dict:
        """
        Choose a quest branch

        Returns branch consequences and updates quest objectives
        """
        quest = self.get_quest(quest_id)

        if not quest:
            return {"success": False, "message": "Quest not found"}

        if quest.status != QuestStatus.IN_PROGRESS:
            return {"success": False, "message": "Quest not in progress"}

        current_obj = quest.objectives[quest.current_objective_index]

        if current_obj.type != ObjectiveType.CHOICE_BRANCH:
            return {"success": False, "message": "Current objective is not a branch point"}

        # Find selected branch
        selected_branch = None
        if current_obj.branches:
            for branch in current_obj.branches:
                if branch["branch_id"] == branch_id:
                    selected_branch = branch
                    break

        if not selected_branch:
            return {"success": False, "message": "Invalid branch ID"}

        # Record choice
        quest.chosen_branch = branch_id
        if "branch_choices" not in quest.metadata:
            quest.metadata["branch_choices"] = []
        quest.metadata["branch_choices"].append({
            "objective_id": current_obj.id,
            "branch_chosen": branch_id,
            "turn": game_state.turn_count
        })

        # Replace current objective with branch objectives
        insert_index = quest.current_objective_index + 1
        for branch_obj_data in selected_branch["objectives"]:
            branch_obj = QuestObjective.from_dict(branch_obj_data)
            quest.objectives.insert(insert_index, branch_obj)
            insert_index += 1

        # Mark branch objective as complete
        current_obj.completed = True
        quest.current_objective_index += 1

        # Apply immediate consequences
        consequences = selected_branch.get("consequences", {})
        self._apply_consequences(consequences, game_state)

        return {
            "success": True,
            "branch_chosen": branch_id,
            "new_objectives": selected_branch["objectives"],
            "consequences": consequences
        }

    def _apply_consequences(self, consequences: Dict, game_state: Any):
        """Apply quest branch consequences"""
        # Divine favor changes
        if "divine_favor" in consequences:
            for god, favor_change in consequences["divine_favor"].items():
                for character in game_state.player_characters:
                    character.divine_favor[god] = \
                        character.divine_favor.get(god, 0) + favor_change

        # NPC approval changes
        if "npc_approval" in consequences:
            for npc_id, approval_change in consequences["npc_approval"].items():
                if npc_id in game_state.npcs:
                    game_state.npcs[npc_id].approval += approval_change

        # Party trust changes
        if "party_trust" in consequences:
            game_state.party_trust += consequences["party_trust"]

        # Reputation changes
        if "reputation" in consequences:
            for faction, rep_change in consequences["reputation"].items():
                game_state.reputation[faction] = \
                    game_state.reputation.get(faction, 0) + rep_change

    def _complete_quest(self, quest: Quest, game_state: Any):
        """Mark quest as complete and distribute rewards"""
        quest.status = QuestStatus.COMPLETED
        self.active_quests.remove(quest.quest_id)
        self.completed_quests.append(quest.quest_id)

        # Distribute rewards
        self._distribute_rewards(quest, game_state)

        # Unlock new quests
        for unlock_id in quest.rewards.unlocks:
            if unlock_id in self.quests:
                self.quests[unlock_id].status = QuestStatus.AVAILABLE

        logger.info(f"Quest completed: {quest.quest_id}")

    def _fail_quest(self, quest: Quest, game_state: Any):
        """Mark quest as failed and apply failure consequences"""
        quest.status = QuestStatus.FAILED
        quest.failed = True
        self.active_quests.remove(quest.quest_id)

        # Apply failure consequences if defined
        if "failure_consequences" in quest.rewards.to_dict():
            # Implementation would go here
            pass

        logger.info(f"Quest failed: {quest.quest_id}")

    def _distribute_rewards(self, quest: Quest, game_state: Any):
        """Distribute quest rewards to party"""
        party = game_state.player_characters
        party_size = len(party)

        # Calculate rewards
        completion_data = {
            "turns_used": game_state.turn_count - (quest.started_turn or 0),
            "party_size": party_size
        }

        total_xp = self.reward_calculator.calculate_xp_reward(
            quest, party_size, completion_data
        )
        total_gold = self.reward_calculator.calculate_gold_reward(
            quest, quest.chosen_branch
        )
        divine_favor_changes = self.reward_calculator.calculate_divine_favor_rewards(quest)

        # XP distribution
        xp_per_player = total_xp // party_size
        for character in party:
            character.add_experience(xp_per_player)

        # Gold distribution
        gold_per_player = total_gold // party_size
        for character in party:
            character.gold += gold_per_player

        # Divine favor distribution
        for character in party:
            for god, favor_change in divine_favor_changes.items():
                character.divine_favor[god] = \
                    character.divine_favor.get(god, 0) + favor_change

        # Item rewards
        # Implementation would distribute items to party inventory

        logger.info(f"Rewards distributed for quest: {quest.quest_id}")

    def abandon_quest(self, quest_id: str) -> Dict:
        """
        Abandon a quest

        Main story quests cannot be abandoned
        """
        quest = self.get_quest(quest_id)

        if not quest:
            return {"success": False, "message": "Quest not found"}

        if quest.category == QuestCategory.MAIN_STORY:
            return {"success": False, "message": "Cannot abandon main story quests"}

        if quest.status != QuestStatus.IN_PROGRESS:
            return {"success": False, "message": "Quest not in progress"}

        quest.status = QuestStatus.ABANDONED
        quest.abandoned = True
        self.active_quests.remove(quest_id)

        logger.info(f"Quest abandoned: {quest_id}")

        return {
            "success": True,
            "message": f"Quest abandoned: {quest.name}",
            "consequences": {}  # Could add abandonment penalties
        }

    def calculate_turns_remaining(self, quest: Quest) -> Optional[int]:
        """Calculate turns remaining for time-limited quest"""
        if not quest.time_limit or quest.time_limit.get("type") != "turn_based":
            return None

        max_turns = quest.time_limit.get("max_turns", 0)
        turns_elapsed = 0  # Would get from game state
        return max(0, max_turns - turns_elapsed)

    def get_quest_rewards_summary(self, quest_id: str) -> Dict:
        """Get summary of rewards earned from completed quest"""
        quest = self.get_quest(quest_id)

        if not quest or quest.status != QuestStatus.COMPLETED:
            return {}

        return {
            "xp": quest.rewards.xp,
            "gold": quest.rewards.gold,
            "items": quest.rewards.items,
            "divine_favor": quest.rewards.divine_favor,
            "npc_approval": quest.rewards.npc_approval
        }

# ============================================================================
# QUEST MAP INTEGRATION
# ============================================================================

class QuestMapIntegration:
    """Link quests to map markers and location triggers"""

    MARKER_ICONS = {
        QuestCategory.MAIN_STORY: "⭐",
        QuestCategory.DIVINE_TRIAL: "✨",
        QuestCategory.TIME_LIMITED: "⏰",
        QuestCategory.NPC_REQUEST: "💬",
        QuestCategory.SIDE_QUEST: "📍",
    }

    MARKER_PRIORITIES = {
        QuestCategory.MAIN_STORY: 100,
        QuestCategory.DIVINE_TRIAL: 90,
        QuestCategory.TIME_LIMITED: 80,
        QuestCategory.NPC_REQUEST: 70,
        QuestCategory.SIDE_QUEST: 60,
    }

    def get_quest_markers(self, active_quests: List[Quest]) -> List[Dict]:
        """Generate map markers for active quest objectives"""
        markers = []

        for quest in active_quests:
            if quest.status != QuestStatus.IN_PROGRESS:
                continue

            if quest.current_objective_index >= len(quest.objectives):
                continue

            current_obj = quest.objectives[quest.current_objective_index]

            # Create marker for current objective
            location = self._get_objective_location(current_obj, quest)

            if location:
                markers.append({
                    "id": f"{quest.quest_id}_{current_obj.id}",
                    "quest_id": quest.quest_id,
                    "quest_name": quest.name,
                    "objective_description": current_obj.description,
                    "marker_type": self._get_marker_type(current_obj.type),
                    "location": location,
                    "icon": self.MARKER_ICONS.get(quest.category, "📍"),
                    "priority": self.MARKER_PRIORITIES.get(quest.category, 50)
                })

        return markers

    def _get_objective_location(self, objective: QuestObjective,
                                quest: Quest) -> Optional[str]:
        """Get location for objective marker"""
        if objective.location:
            return objective.location

        if objective.target:
            # Look up NPC location
            if quest.quest_giver and objective.target == quest.quest_giver.get("npc_id"):
                return quest.quest_giver.get("location")

        return None

    def _get_marker_type(self, obj_type: ObjectiveType) -> str:
        """Map objective type to marker appearance"""
        marker_types = {
            ObjectiveType.TALK: "npc_dialogue",
            ObjectiveType.KILL: "combat",
            ObjectiveType.OBTAIN: "collect",
            ObjectiveType.DELIVER: "delivery",
            ObjectiveType.LOCATION: "explore",
            ObjectiveType.ESCORT: "protect",
            ObjectiveType.DEFEND: "defend"
        }
        return marker_types.get(obj_type, "generic")

# Testing
if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)

    print("Testing Quest Manager...")

    # Create quest manager
    qm = QuestManager()

    # Create test quest
    test_quest = Quest(
        quest_id="test_quest",
        category=QuestCategory.SIDE_QUEST,
        tier=1,
        name="Test Quest",
        description="A test quest",
        objectives=[
            QuestObjective(
                id="obj_1",
                type=ObjectiveType.TALK,
                description="Talk to NPC",
                target="test_npc"
            )
        ],
        rewards=QuestRewards(
            xp=100,
            gold=50
        )
    )

    qm.add_quest(test_quest)

    print(f"✅ Quest added: {test_quest.quest_id}")
    print(f"   Name: {test_quest.name}")
    print(f"   Objectives: {len(test_quest.objectives)}")
    print(f"   Rewards: {test_quest.rewards.xp} XP, {test_quest.rewards.gold} Gold")

    print("\n✅ Quest Manager ready!")
