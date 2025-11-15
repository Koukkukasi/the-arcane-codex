# THE ARCANE CODEX - Quest System Design
## Phase K: Quest System Expansion

---

## Table of Contents
1. [Quest System Overview](#quest-system-overview)
2. [Quest Data Structure](#quest-data-structure)
3. [Quest Categories](#quest-categories)
4. [Quest Triggers & Progression](#quest-triggers--progression)
5. [Rewards System](#rewards-system)
6. [Integration Points](#integration-points)
7. [Backend API Specification](#backend-api-specification)
8. [Example Quest Implementations](#example-quest-implementations)
9. [UI/UX Flow](#uiux-flow)

---

## Quest System Overview

The Arcane Codex quest system is designed to integrate deeply with:
- Divine Favor mechanics (7 gods)
- NPC Companion approval ratings
- Party Trust system
- Character progression
- Location-based gameplay
- Moral choice consequences

### Core Principles
1. **Meaningful Choices**: Every quest affects divine favor, NPC approval, or party trust
2. **Multi-Path Design**: Quests support multiple completion methods (combat, stealth, diplomacy, magic)
3. **Consequence Tracking**: Quest outcomes influence future quest availability
4. **Progressive Reveal**: Hidden objectives appear based on player actions
5. **Dynamic Scaling**: Quest difficulty adapts to party level and composition

---

## Quest Data Structure

### Primary Quest Object

```json
{
  "quest_id": "save_grimsbys_daughter",
  "category": "npc_request",
  "tier": 1,
  "name": "A Father's Plea",
  "description": "Grimsby's young daughter lies dying from a rare illness. Only a specific medicine can save her, but it's locked in Duke Aldric's warehouse.",
  "quest_giver": {
    "npc_id": "grimsby",
    "location": "valdria_town_square"
  },
  "requirements": {
    "min_level": 1,
    "required_quests_completed": [],
    "divine_favor_threshold": null,
    "npc_approval_threshold": null,
    "location_unlocked": ["valdria"]
  },
  "objectives": [
    {
      "id": "obj_1",
      "type": "talk",
      "target": "grimsby",
      "description": "Speak to Grimsby about his daughter",
      "required": true,
      "hidden": false,
      "completed": false,
      "progress": 0,
      "progress_max": 1
    },
    {
      "id": "obj_2",
      "type": "choice_branch",
      "description": "Decide how to obtain the medicine",
      "required": true,
      "hidden": false,
      "completed": false,
      "branches": [
        {
          "branch_id": "steal",
          "description": "Steal the medicine from Duke's warehouse",
          "objectives": [
            {
              "id": "obj_2a_1",
              "type": "location",
              "target": "dukes_warehouse",
              "description": "Infiltrate Duke Aldric's warehouse",
              "required": true
            },
            {
              "id": "obj_2a_2",
              "type": "obtain",
              "target": "rare_medicine",
              "quantity": 1,
              "description": "Acquire the medicine",
              "required": true
            }
          ],
          "consequences": {
            "divine_favor": {"KAITHA": 10, "VALDRIS": -10},
            "npc_approval": {"grimsby": 15, "duke_aldric": -20},
            "party_trust": -5,
            "reputation": {"valdria": -10}
          }
        },
        {
          "branch_id": "negotiate",
          "description": "Negotiate with the Duke for the medicine",
          "objectives": [
            {
              "id": "obj_2b_1",
              "type": "talk",
              "target": "duke_aldric",
              "description": "Convince Duke Aldric to release the medicine",
              "required": true,
              "skill_check": {
                "type": "charisma",
                "difficulty": 12
              }
            }
          ],
          "consequences": {
            "divine_favor": {"VALDRIS": 10, "ATHENA": 5},
            "npc_approval": {"grimsby": 10, "duke_aldric": 5},
            "party_trust": 5,
            "reputation": {"valdria": 5}
          }
        },
        {
          "branch_id": "purchase",
          "description": "Purchase the medicine from the Duke",
          "objectives": [
            {
              "id": "obj_2c_1",
              "type": "payment",
              "target": "duke_aldric",
              "gold_required": 200,
              "description": "Pay Duke Aldric 200 gold for the medicine",
              "required": true
            }
          ],
          "consequences": {
            "divine_favor": {"MERCUS": 10, "MORVANE": 5},
            "npc_approval": {"grimsby": 12, "duke_aldric": 10},
            "party_trust": 0,
            "reputation": {"valdria": 10}
          }
        }
      ]
    },
    {
      "id": "obj_3",
      "type": "deliver",
      "target": "grimsby",
      "item": "rare_medicine",
      "description": "Return the medicine to Grimsby",
      "required": true,
      "hidden": false,
      "completed": false
    },
    {
      "id": "obj_4_hidden",
      "type": "optional",
      "description": "HIDDEN: Discover the Duke is hoarding medicine to drive up prices",
      "required": false,
      "hidden": true,
      "reveal_condition": {
        "type": "location_search",
        "location": "dukes_warehouse",
        "skill_check": {
          "type": "intelligence",
          "difficulty": 10
        }
      },
      "reward_bonus": {
        "xp": 50,
        "divine_favor": {"ATHENA": 5, "KAITHA": 5}
      }
    }
  ],
  "rewards": {
    "base": {
      "xp": 150,
      "gold": 75,
      "items": [
        {
          "item_id": "lucky_charm",
          "quantity": 1
        }
      ],
      "divine_favor": {},
      "npc_approval": {
        "grimsby": 25
      },
      "reputation": {},
      "unlocks": ["quest_grimsbys_revenge"]
    },
    "optional_bonuses": {
      "speed_completion": {
        "condition": "completed_in_turns < 3",
        "xp_bonus": 50,
        "divine_favor": {"KORVAN": 5}
      },
      "all_objectives": {
        "condition": "all_optional_completed",
        "xp_bonus": 75,
        "item": "grimsbys_blessing"
      }
    },
    "failure_consequences": {
      "grimsby_daughter_dies": {
        "trigger": "timeout > 5 turns",
        "npc_approval": {"grimsby": -50},
        "divine_favor": {"SYLARA": -10},
        "quest_chain_blocked": ["grimsbys_revenge"],
        "permanent_consequence": true
      }
    }
  },
  "time_limit": {
    "type": "turn_based",
    "max_turns": 5,
    "warning_turn": 4
  },
  "status": "not_started",
  "current_objective_index": 0,
  "chosen_branch": null,
  "started_turn": null,
  "completed_turn": null,
  "failed": false,
  "abandoned": false
}
```

### Supporting Data Structures

```python
from enum import Enum
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Any
from datetime import datetime

class QuestCategory(Enum):
    MAIN_STORY = "main_story"
    SIDE_QUEST = "side_quest"
    DIVINE_TRIAL = "divine_trial"
    NPC_REQUEST = "npc_request"
    TIME_LIMITED = "time_limited"
    RANDOM_ENCOUNTER = "random_encounter"

class QuestStatus(Enum):
    NOT_STARTED = "not_started"
    AVAILABLE = "available"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"
    ABANDONED = "abandoned"

class ObjectiveType(Enum):
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

@dataclass
class QuestRewards:
    xp: int = 0
    gold: int = 0
    items: List[Dict] = field(default_factory=list)
    divine_favor: Dict[str, int] = field(default_factory=dict)
    npc_approval: Dict[str, int] = field(default_factory=dict)
    reputation: Dict[str, int] = field(default_factory=dict)
    unlocks: List[str] = field(default_factory=list)
    skills: List[str] = field(default_factory=list)

@dataclass
class Quest:
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
```

---

## Quest Categories

### 1. Main Story Quests

**Purpose**: Drive the primary narrative arc
**Characteristics**:
- Cannot be abandoned
- Unlock major game regions/features
- Affect overall game ending
- Progressive difficulty scaling

**Example**: "The Codex Awakens"
- Tier: 1-10 progression
- Unlocks: New regions, divine council powers
- Consequences: Determines final confrontation options

```python
MAIN_STORY_PROGRESSION = {
    "act_1": [
        "the_codex_awakens",      # Tutorial quest
        "gathering_the_party",     # Recruit NPCs
        "first_divine_trial"       # Introduction to gods
    ],
    "act_2": [
        "shadows_of_valdria",      # Town corruption
        "the_betrayal",            # Major plot twist
        "divine_council_crisis"    # Gods conflict
    ],
    "act_3": [
        "the_final_choice",        # Moral climax
        "battle_for_the_codex",    # Endgame
        "epilogue"                 # Conclusion
    ]
}
```

### 2. Side Quests

**Purpose**: Character development, world-building, optional rewards
**Characteristics**:
- Can be completed in any order
- Often tied to specific NPCs
- May have time windows (not strict deadlines)
- Provide unique items/abilities

**Subtypes**:
- **Character Quests**: Deep dive into NPC backstories
- **Faction Quests**: Align with different groups
- **Exploration Quests**: Discover hidden locations
- **Collection Quests**: Gather rare items

### 3. Divine Trials

**Purpose**: Test alignment with specific gods, unlock divine powers
**Characteristics**:
- One per god (7 total)
- Require specific divine favor threshold
- Test god's core virtue
- Grant unique divine abilities

**Structure**:
```python
DIVINE_TRIAL_TEMPLATE = {
    "VALDRIS": {
        "name": "Trial of Justice",
        "favor_required": 50,
        "challenge_type": "moral_judgment",
        "reward": "Valdris_Verdict"  # Divine ability
    },
    "KAITHA": {
        "name": "Trial of Freedom",
        "favor_required": 50,
        "challenge_type": "rebellion",
        "reward": "Kaitha_Liberation"
    },
    "KORVAN": {
        "name": "Trial of Courage",
        "favor_required": 50,
        "challenge_type": "impossible_combat",
        "reward": "Korvan_Valor"
    }
    # ... etc for all 7 gods
}
```

### 4. NPC Requests

**Purpose**: Build relationships, affect companion approval
**Characteristics**:
- Given by companion NPCs
- Success/failure affects approval rating
- May lead to companion loyalty quests
- Can trigger companion-specific endings

**Example**: Renna's Revenge Arc
```json
{
  "quest_chain": [
    {
      "id": "rennas_secret",
      "approval_required": 20,
      "reveals": "Brother is Thieves Guild leader"
    },
    {
      "id": "rennas_choice",
      "approval_required": 50,
      "player_influence": true,
      "outcomes": ["kill_brother", "redeem_brother", "join_brother"]
    },
    {
      "id": "rennas_aftermath",
      "approval_required": 75,
      "loyalty_quest": true,
      "reward": "Renna becomes permanent loyal companion"
    }
  ]
}
```

### 5. Time-Limited Events

**Purpose**: Create urgency, special rewards
**Characteristics**:
- Real-world time OR turn-based countdown
- Unique rewards not obtainable elsewhere
- Often tied to special events/seasons
- May be generated by AI GM dynamically

**Types**:
- **Emergency Quests**: "Dragon attack in 3 turns!"
- **Seasonal Events**: "Winter Festival (7 days)"
- **One-Time Opportunities**: "Merchant leaves tomorrow"

---

## Quest Triggers & Progression

### Quest Triggering System

```python
class QuestTrigger:
    """Determines when a quest becomes available"""

    TRIGGER_TYPES = {
        "level": {
            "check": lambda player, value: player.level >= value,
            "example": {"type": "level", "value": 5}
        },
        "location": {
            "check": lambda game_state, value: game_state.current_location == value,
            "example": {"type": "location", "value": "valdria_town_square"}
        },
        "npc_approval": {
            "check": lambda game_state, params: game_state.npcs[params["npc"]].approval >= params["threshold"],
            "example": {"type": "npc_approval", "npc": "grimsby", "threshold": 50}
        },
        "divine_favor": {
            "check": lambda character, params: character.divine_favor[params["god"]] >= params["threshold"],
            "example": {"type": "divine_favor", "god": "VALDRIS", "threshold": 30}
        },
        "quest_completed": {
            "check": lambda game_state, value: value in game_state.completed_quests,
            "example": {"type": "quest_completed", "value": "save_grimsbys_daughter"}
        },
        "party_trust": {
            "check": lambda game_state, params: game_state.party_trust >= params["threshold"],
            "example": {"type": "party_trust", "threshold": 60}
        },
        "turn_count": {
            "check": lambda game_state, value: game_state.turn_count >= value,
            "example": {"type": "turn_count", "value": 10}
        },
        "item_possession": {
            "check": lambda inventory, value: inventory.has_item(value),
            "example": {"type": "item_possession", "value": "ancient_key"}
        },
        "story_flag": {
            "check": lambda game_state, params: game_state.flags.get(params["flag"]) == params["value"],
            "example": {"type": "story_flag", "flag": "duke_exposed", "value": True}
        },
        "random_encounter": {
            "check": lambda: random.random() < 0.1,  # 10% chance
            "example": {"type": "random_encounter", "probability": 0.1}
        }
    }
```

### Objective Progression Logic

```python
class QuestProgressionEngine:
    """Handles objective updates and quest advancement"""

    def update_objective(self, quest: Quest, trigger_type: str, trigger_data: Dict) -> Dict:
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
            "rewards_earned": {}
        }

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
                result["rewards_earned"] = self._calculate_rewards(quest)

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
                self._apply_failure_consequences(quest)

        return result

    def _objective_matches_trigger(self, objective: QuestObjective,
                                   trigger_type: str, trigger_data: Dict) -> bool:
        """Check if objective is satisfied by trigger"""

        if objective.type.value != trigger_type:
            return False

        match trigger_type:
            case "talk":
                return objective.target == trigger_data.get("npc_id")

            case "kill":
                if objective.target == trigger_data.get("enemy_type"):
                    objective.progress += trigger_data.get("count", 1)
                    return objective.progress >= objective.progress_max
                return False

            case "obtain":
                if objective.item == trigger_data.get("item_id"):
                    objective.progress += trigger_data.get("quantity", 1)
                    return objective.progress >= objective.quantity
                return False

            case "location":
                return objective.location == trigger_data.get("location_id")

            case "deliver":
                return (objective.target == trigger_data.get("npc_id") and
                       objective.item == trigger_data.get("item_id"))

            case "skill_check":
                if objective.skill_check:
                    roll = trigger_data.get("roll")
                    modifier = trigger_data.get("modifier", 0)
                    return (roll + modifier) >= objective.skill_check["difficulty"]
                return False

        return False
```

### Branch Selection Logic

```python
def choose_quest_branch(quest: Quest, branch_id: str) -> Dict:
    """
    Player chooses a quest branch (e.g., steal vs negotiate)

    Returns branch consequences and updates quest objectives
    """
    current_obj = quest.objectives[quest.current_objective_index]

    if current_obj.type != ObjectiveType.CHOICE_BRANCH:
        return {"error": "Current objective is not a branch point"}

    # Find selected branch
    selected_branch = None
    for branch in current_obj.branches:
        if branch["branch_id"] == branch_id:
            selected_branch = branch
            break

    if not selected_branch:
        return {"error": "Invalid branch ID"}

    # Record choice
    quest.chosen_branch = branch_id
    quest.metadata["branch_choices"] = quest.metadata.get("branch_choices", [])
    quest.metadata["branch_choices"].append({
        "objective_id": current_obj.id,
        "branch_chosen": branch_id,
        "turn": quest.metadata.get("current_turn")
    })

    # Replace current objective with branch objectives
    insert_index = quest.current_objective_index + 1
    for branch_obj_data in selected_branch["objectives"]:
        branch_obj = QuestObjective(**branch_obj_data)
        quest.objectives.insert(insert_index, branch_obj)
        insert_index += 1

    # Mark branch objective as complete
    current_obj.completed = True
    quest.current_objective_index += 1

    # Apply immediate consequences
    consequences = selected_branch.get("consequences", {})

    return {
        "success": True,
        "branch_chosen": branch_id,
        "new_objectives": selected_branch["objectives"],
        "consequences": consequences,
        "divine_favor_changes": consequences.get("divine_favor", {}),
        "npc_approval_changes": consequences.get("npc_approval", {}),
        "party_trust_change": consequences.get("party_trust", 0)
    }
```

---

## Rewards System

### Base Reward Calculation

```python
class QuestRewardCalculator:
    """Calculate quest rewards based on multiple factors"""

    # XP scaling by quest tier
    XP_BASE_BY_TIER = {
        1: 100,
        2: 250,
        3: 500,
        4: 1000,
        5: 2000,
        6: 4000,
        7: 7500,
        8: 12000,
        9: 18000,
        10: 25000
    }

    # Gold scaling by tier
    GOLD_BASE_BY_TIER = {
        1: 50,
        2: 125,
        3: 250,
        4: 500,
        5: 1000,
        6: 2000,
        7: 3750,
        8: 6000,
        9: 9000,
        10: 15000
    }

    def calculate_xp_reward(self, quest: Quest, party_size: int,
                           completion_data: Dict) -> int:
        """
        Calculate XP reward with bonuses

        Factors:
        - Quest tier (base)
        - Party size (divided among players)
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
        """
        Adjust rewards based on difficulty factors

        Higher rewards for:
        - Solo/small party completion
        - Under-leveled party
        - Hard mode quests
        """
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
```

### Reward Distribution

```python
def distribute_quest_rewards(quest: Quest, party: List[Character],
                            game_state: Any) -> Dict:
    """
    Apply quest rewards to party members and game state

    Returns summary of all rewards granted
    """
    calculator = QuestRewardCalculator()

    # Calculate rewards
    completion_data = {
        "turns_used": game_state.turn_count - quest.started_turn,
        "party_size": len(party)
    }

    total_xp = calculator.calculate_xp_reward(quest, len(party), completion_data)
    total_gold = calculator.calculate_gold_reward(quest, quest.chosen_branch)
    divine_favor_changes = calculator.calculate_divine_favor_rewards(quest)

    # XP distribution (split among party)
    xp_per_player = total_xp // len(party)
    level_ups = []

    for character in party:
        old_level = character.level
        character.add_experience(xp_per_player)
        if character.level > old_level:
            level_ups.append({
                "character": character.name,
                "old_level": old_level,
                "new_level": character.level
            })

    # Gold distribution (to party inventory)
    gold_per_player = total_gold // len(party)
    for character in party:
        character.gold += gold_per_player

    # Divine favor (individual)
    for character in party:
        for god, favor_change in divine_favor_changes.items():
            character.divine_favor[god] = character.divine_favor.get(god, 0) + favor_change

    # NPC approval changes
    npc_approval_changes = {}
    if quest.rewards.npc_approval:
        for npc_id, approval_change in quest.rewards.npc_approval.items():
            if npc_id in game_state.npcs:
                game_state.npcs[npc_id].approval += approval_change
                npc_approval_changes[npc_id] = approval_change

    # Item rewards (distributed to party leader or first available inventory)
    items_granted = []
    if quest.rewards.items:
        for item_data in quest.rewards.items:
            item = game_state.item_db.get_item(item_data["item_id"])
            if item:
                # Try to give to party leader first
                for character in party:
                    if character.inventory.add_item(item, item_data.get("quantity", 1)):
                        items_granted.append({
                            "item": item.name,
                            "quantity": item_data.get("quantity", 1),
                            "recipient": character.name
                        })
                        break

    # Unlock new quests
    unlocked_quests = []
    if quest.rewards.unlocks:
        for quest_id in quest.rewards.unlocks:
            if quest_id in game_state.quest_database:
                game_state.available_quests.append(quest_id)
                unlocked_quests.append(quest_id)

    # Reputation changes
    reputation_changes = quest.rewards.reputation
    for faction, rep_change in reputation_changes.items():
        game_state.reputation[faction] = game_state.reputation.get(faction, 0) + rep_change

    return {
        "quest_name": quest.name,
        "xp_total": total_xp,
        "xp_per_player": xp_per_player,
        "level_ups": level_ups,
        "gold_total": total_gold,
        "gold_per_player": gold_per_player,
        "divine_favor_changes": divine_favor_changes,
        "npc_approval_changes": npc_approval_changes,
        "items_granted": items_granted,
        "unlocked_quests": unlocked_quests,
        "reputation_changes": reputation_changes
    }
```

---

## Integration Points

### 1. Map System Integration

```python
class QuestMapIntegration:
    """Link quests to map markers and location triggers"""

    def get_quest_markers(self, active_quests: List[Quest]) -> List[Dict]:
        """
        Generate map markers for active quest objectives

        Returns list of marker data for frontend map
        """
        markers = []

        for quest in active_quests:
            if quest.status != QuestStatus.IN_PROGRESS:
                continue

            current_obj = quest.objectives[quest.current_objective_index]

            # Create marker for current objective
            marker = {
                "id": f"{quest.quest_id}_{current_obj.id}",
                "quest_id": quest.quest_id,
                "quest_name": quest.name,
                "objective_description": current_obj.description,
                "marker_type": self._get_marker_type(current_obj.type),
                "location": self._get_objective_location(current_obj),
                "icon": self._get_marker_icon(quest.category, current_obj.type),
                "priority": self._get_marker_priority(quest.category)
            }

            if marker["location"]:
                markers.append(marker)

        return markers

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

    def _get_marker_icon(self, category: QuestCategory, obj_type: ObjectiveType) -> str:
        """Get icon for map marker"""
        if category == QuestCategory.MAIN_STORY:
            return "⭐"
        elif category == QuestCategory.DIVINE_TRIAL:
            return "✨"
        elif category == QuestCategory.TIME_LIMITED:
            return "⏰"
        elif obj_type == ObjectiveType.TALK:
            return "💬"
        elif obj_type == ObjectiveType.KILL:
            return "⚔️"
        else:
            return "📍"

    def _get_marker_priority(self, category: QuestCategory) -> int:
        """Determine marker display priority (higher = more important)"""
        priorities = {
            QuestCategory.MAIN_STORY: 100,
            QuestCategory.DIVINE_TRIAL: 90,
            QuestCategory.TIME_LIMITED: 80,
            QuestCategory.NPC_REQUEST: 70,
            QuestCategory.SIDE_QUEST: 60,
            QuestCategory.RANDOM_ENCOUNTER: 50
        }
        return priorities.get(category, 50)
```

### 2. NPC Dialogue Integration

```python
class QuestDialogueSystem:
    """Generate dynamic NPC dialogue based on quest state"""

    def get_npc_dialogue(self, npc_id: str, game_state: Any) -> Dict:
        """
        Get NPC dialogue options based on active quests

        Returns dialogue tree with quest-related options
        """
        dialogue = {
            "npc_id": npc_id,
            "npc_name": game_state.npcs[npc_id].name,
            "greeting": self._get_greeting(npc_id, game_state),
            "options": []
        }

        # Check for quest availability
        for quest_id in game_state.available_quests:
            quest = game_state.quest_database[quest_id]
            if quest.quest_giver and quest.quest_giver["npc_id"] == npc_id:
                if quest.status == QuestStatus.AVAILABLE:
                    dialogue["options"].append({
                        "type": "start_quest",
                        "text": f"[QUEST] {quest.name}",
                        "quest_id": quest_id,
                        "preview": quest.description[:100] + "..."
                    })

        # Check for active quest objectives
        for quest in game_state.active_quests:
            current_obj = quest.objectives[quest.current_objective_index]
            if current_obj.type == ObjectiveType.TALK and current_obj.target == npc_id:
                dialogue["options"].append({
                    "type": "quest_objective",
                    "text": f"[{quest.name}] {current_obj.description}",
                    "quest_id": quest.quest_id,
                    "objective_id": current_obj.id
                })

            # Check for delivery objectives
            elif current_obj.type == ObjectiveType.DELIVER and current_obj.target == npc_id:
                dialogue["options"].append({
                    "type": "deliver_item",
                    "text": f"[{quest.name}] Deliver {current_obj.item}",
                    "quest_id": quest.quest_id,
                    "objective_id": current_obj.id,
                    "requires_item": current_obj.item
                })

        # Generic NPC interaction
        dialogue["options"].append({
            "type": "chat",
            "text": "Just chat",
            "responses": game_state.npcs[npc_id].dialogue.get("chat", [])
        })

        return dialogue
```

### 3. Divine Council Integration

```python
def trigger_divine_council_vote(quest: Quest, decision_point: str,
                                game_state: Any) -> Dict:
    """
    Trigger Divine Council voting on quest-related decisions

    Used for:
    - Major moral choices in quests
    - Quest failure judgments
    - Divine trial evaluations
    """
    council_vote = {
        "triggered_by": quest.quest_id,
        "decision_point": decision_point,
        "player_choice": quest.metadata.get("player_choice"),
        "god_votes": {}
    }

    # Each god votes based on their favor and the decision
    for god in SEVEN_GODS:
        favor = game_state.players[0].divine_favor.get(god, 0)

        # AI GM generates god's stance
        god_vote = game_state.ai_gm.generate_divine_vote(
            god=god,
            favor=favor,
            quest=quest,
            decision=decision_point
        )

        council_vote["god_votes"][god] = {
            "stance": god_vote["stance"],  # "approve", "condemn", "neutral"
            "reasoning": god_vote["reasoning"],
            "favor_change": god_vote["favor_change"]
        }

    # Calculate verdict
    approval_count = sum(1 for v in council_vote["god_votes"].values()
                        if v["stance"] == "approve")
    condemnation_count = sum(1 for v in council_vote["god_votes"].values()
                             if v["stance"] == "condemn")

    if approval_count > condemnation_count:
        council_vote["verdict"] = "approved"
        council_vote["outcome"] = "The Divine Council approves of your actions."
    elif condemnation_count > approval_count:
        council_vote["verdict"] = "condemned"
        council_vote["outcome"] = "The Divine Council condemns your choice."
    else:
        council_vote["verdict"] = "divided"
        council_vote["outcome"] = "The Divine Council is divided on your actions."

    return council_vote
```

### 4. Character Progression Integration

```python
def unlock_skill_from_quest(character: Character, quest: Quest) -> Optional[str]:
    """
    Unlock character skills based on quest completion

    Certain quests grant unique skills/abilities
    """
    if not quest.rewards.skills:
        return None

    for skill_id in quest.rewards.skills:
        skill = character.skill_tree.get_skill(skill_id)
        if skill and not character.has_skill(skill_id):
            character.learn_skill(skill_id)
            return skill.name

    return None
```

---

## Backend API Specification

### Quest Endpoints

```python
# ============================================================================
# QUEST API ENDPOINTS
# ============================================================================

@app.route('/api/quests/available', methods=['GET'])
def get_available_quests():
    """
    Get all quests available to start

    Filters based on:
    - Player level
    - Quest requirements met
    - Prerequisites completed
    """
    game_code = session.get('game_code')
    player_id = get_player_id()

    if not game_code:
        return jsonify({'error': 'Not in game'}), 400

    game_session = get_game_session(game_code)
    if not game_session:
        return jsonify({'error': 'Game not found'}), 404

    character = game_session.game.get_character(player_id)
    if not character:
        return jsonify({'error': 'Character not found'}), 404

    # Get all quests
    quest_manager = game_session.game.quest_manager
    available = quest_manager.get_available_quests(character, game_session.game.game_state)

    return jsonify({
        'quests': [
            {
                'quest_id': q.quest_id,
                'name': q.name,
                'description': q.description,
                'category': q.category.value,
                'tier': q.tier,
                'quest_giver': q.quest_giver,
                'rewards_preview': {
                    'xp': q.rewards.xp,
                    'gold': q.rewards.gold,
                    'items': [item['item_id'] for item in q.rewards.items]
                }
            }
            for q in available
        ]
    })


@app.route('/api/quests/active', methods=['GET'])
def get_active_quests():
    """Get all quests currently in progress"""
    game_code = session.get('game_code')
    player_id = get_player_id()

    if not game_code:
        return jsonify({'error': 'Not in game'}), 400

    game_session = get_game_session(game_code)
    if not game_session:
        return jsonify({'error': 'Game not found'}), 404

    quest_manager = game_session.game.quest_manager
    active_quests = quest_manager.get_active_quests()

    return jsonify({
        'quests': [
            {
                'quest_id': q.quest_id,
                'name': q.name,
                'description': q.description,
                'category': q.category.value,
                'tier': q.tier,
                'current_objective': {
                    'description': q.objectives[q.current_objective_index].description,
                    'progress': q.objectives[q.current_objective_index].progress,
                    'progress_max': q.objectives[q.current_objective_index].progress_max
                },
                'time_limit': q.time_limit,
                'turns_remaining': quest_manager.calculate_turns_remaining(q),
                'all_objectives': [
                    {
                        'id': obj.id,
                        'description': obj.description,
                        'completed': obj.completed,
                        'hidden': obj.hidden,
                        'optional': not obj.required
                    }
                    for obj in q.objectives
                    if not obj.hidden or obj.revealed
                ]
            }
            for q in active_quests
        ]
    })


@app.route('/api/quests/completed', methods=['GET'])
def get_completed_quests():
    """Get all completed quests"""
    game_code = session.get('game_code')

    if not game_code:
        return jsonify({'error': 'Not in game'}), 400

    game_session = get_game_session(game_code)
    if not game_session:
        return jsonify({'error': 'Game not found'}), 404

    quest_manager = game_session.game.quest_manager
    completed = quest_manager.get_completed_quests()

    return jsonify({
        'quests': [
            {
                'quest_id': q.quest_id,
                'name': q.name,
                'category': q.category.value,
                'tier': q.tier,
                'completed_turn': q.completed_turn,
                'rewards_earned': quest_manager.get_quest_rewards_summary(q.quest_id)
            }
            for q in completed
        ]
    })


@app.route('/api/quests/start', methods=['POST'])
def start_quest():
    """
    Start a quest

    Request body:
    {
        "quest_id": "save_grimsbys_daughter"
    }
    """
    game_code = session.get('game_code')
    player_id = get_player_id()

    if not game_code:
        return jsonify({'error': 'Not in game'}), 400

    data = request.json
    quest_id = data.get('quest_id')

    if not quest_id:
        return jsonify({'error': 'quest_id required'}), 400

    game_session = get_game_session(game_code)
    quest_manager = game_session.game.quest_manager
    character = game_session.game.get_character(player_id)

    # Check if quest can be started
    result = quest_manager.start_quest(quest_id, character, game_session.game.game_state)

    if not result['success']:
        return jsonify({'error': result['message']}), 400

    return jsonify({
        'success': True,
        'quest': {
            'quest_id': result['quest'].quest_id,
            'name': result['quest'].name,
            'description': result['quest'].description,
            'first_objective': result['quest'].objectives[0].description
        },
        'message': result['message']
    })


@app.route('/api/quests/<quest_id>/details', methods=['GET'])
def get_quest_details(quest_id: str):
    """Get detailed information about a specific quest"""
    game_code = session.get('game_code')

    if not game_code:
        return jsonify({'error': 'Not in game'}), 400

    game_session = get_game_session(game_code)
    quest_manager = game_session.game.quest_manager

    quest = quest_manager.get_quest(quest_id)
    if not quest:
        return jsonify({'error': 'Quest not found'}), 404

    return jsonify({
        'quest_id': quest.quest_id,
        'name': quest.name,
        'description': quest.description,
        'category': quest.category.value,
        'tier': quest.tier,
        'status': quest.status.value,
        'quest_giver': quest.quest_giver,
        'objectives': [
            {
                'id': obj.id,
                'type': obj.type.value,
                'description': obj.description,
                'required': obj.required,
                'hidden': obj.hidden,
                'revealed': getattr(obj, 'revealed', not obj.hidden),
                'completed': obj.completed,
                'progress': obj.progress,
                'progress_max': obj.progress_max
            }
            for obj in quest.objectives
            if not obj.hidden or getattr(obj, 'revealed', False)
        ],
        'rewards': {
            'xp': quest.rewards.xp,
            'gold': quest.rewards.gold,
            'items': quest.rewards.items,
            'divine_favor': quest.rewards.divine_favor,
            'unlocks': quest.rewards.unlocks
        },
        'time_limit': quest.time_limit,
        'metadata': quest.metadata
    })


@app.route('/api/quests/<quest_id>/choose_branch', methods=['POST'])
def choose_quest_branch_endpoint(quest_id: str):
    """
    Choose a branch in a quest decision point

    Request body:
    {
        "branch_id": "steal"  // or "negotiate", "purchase", etc.
    }
    """
    game_code = session.get('game_code')

    if not game_code:
        return jsonify({'error': 'Not in game'}), 400

    data = request.json
    branch_id = data.get('branch_id')

    if not branch_id:
        return jsonify({'error': 'branch_id required'}), 400

    game_session = get_game_session(game_code)
    quest_manager = game_session.game.quest_manager

    result = quest_manager.choose_branch(quest_id, branch_id, game_session.game.game_state)

    if not result['success']:
        return jsonify({'error': result['message']}), 400

    return jsonify(result)


@app.route('/api/quests/<quest_id>/abandon', methods=['POST'])
def abandon_quest(quest_id: str):
    """
    Abandon a quest (if allowed)

    Main story quests cannot be abandoned
    """
    game_code = session.get('game_code')

    if not game_code:
        return jsonify({'error': 'Not in game'}), 400

    game_session = get_game_session(game_code)
    quest_manager = game_session.game.quest_manager

    result = quest_manager.abandon_quest(quest_id)

    if not result['success']:
        return jsonify({'error': result['message']}), 400

    return jsonify({
        'success': True,
        'message': result['message'],
        'consequences': result.get('consequences', {})
    })


@app.route('/api/quests/map_markers', methods=['GET'])
def get_quest_map_markers():
    """Get all quest-related map markers for active quests"""
    game_code = session.get('game_code')

    if not game_code:
        return jsonify({'error': 'Not in game'}), 400

    game_session = get_game_session(game_code)
    quest_manager = game_session.game.quest_manager

    active_quests = quest_manager.get_active_quests()
    map_integration = QuestMapIntegration()
    markers = map_integration.get_quest_markers(active_quests)

    return jsonify({
        'markers': markers
    })


@app.route('/api/quests/track/<quest_id>', methods=['POST'])
def track_quest(quest_id: str):
    """
    Set a quest as tracked (primary quest display)

    Tracked quest shows:
    - In main HUD
    - Highlighted on map
    - Navigation assistance
    """
    game_code = session.get('game_code')
    player_id = get_player_id()

    if not game_code:
        return jsonify({'error': 'Not in game'}), 400

    game_session = get_game_session(game_code)

    # Store in player's session data
    if not hasattr(game_session, 'player_tracked_quests'):
        game_session.player_tracked_quests = {}

    game_session.player_tracked_quests[player_id] = quest_id

    return jsonify({
        'success': True,
        'tracked_quest': quest_id
    })
```

---

## Example Quest Implementations

### Example 1: Main Story Quest - "The Codex Awakens"

```json
{
  "quest_id": "codex_awakens",
  "category": "main_story",
  "tier": 1,
  "name": "The Codex Awakens",
  "description": "You've been chosen by the Seven Gods to wield the Arcane Codex, an ancient tome of immense power. But first, you must prove yourself worthy.",
  "quest_giver": {
    "npc_id": "oracle",
    "location": "temple_of_seven"
  },
  "requirements": {
    "min_level": 1,
    "required_quests_completed": []
  },
  "objectives": [
    {
      "id": "obj_1",
      "type": "talk",
      "target": "oracle",
      "description": "Speak with the Oracle in the Temple of Seven",
      "required": true,
      "hidden": false
    },
    {
      "id": "obj_2",
      "type": "location",
      "target": "shrine_of_valdris",
      "description": "Visit the Shrine of Valdris",
      "required": true,
      "hidden": false
    },
    {
      "id": "obj_3",
      "type": "kill",
      "target": "corrupted_guardian",
      "quantity": 1,
      "description": "Defeat the Corrupted Guardian",
      "required": true,
      "hidden": false,
      "progress_max": 1
    },
    {
      "id": "obj_4",
      "type": "obtain",
      "item": "codex_fragment_1",
      "quantity": 1,
      "description": "Retrieve the first Codex Fragment",
      "required": true,
      "hidden": false
    },
    {
      "id": "obj_5",
      "type": "deliver",
      "target": "oracle",
      "item": "codex_fragment_1",
      "description": "Return the fragment to the Oracle",
      "required": true,
      "hidden": false
    }
  ],
  "rewards": {
    "base": {
      "xp": 200,
      "gold": 100,
      "items": [
        {
          "item_id": "arcane_codex_level_1",
          "quantity": 1
        }
      ],
      "divine_favor": {
        "VALDRIS": 5,
        "KAITHA": 5,
        "MORVANE": 5,
        "SYLARA": 5,
        "KORVAN": 5,
        "ATHENA": 5,
        "MERCUS": 5
      },
      "unlocks": ["quest_grimsbys_daughter", "quest_thieves_guild"]
    }
  },
  "status": "not_started",
  "time_limit": null
}
```

### Example 2: Divine Trial - "Valdris' Trial of Justice"

```json
{
  "quest_id": "valdris_trial_justice",
  "category": "divine_trial",
  "tier": 5,
  "name": "Valdris' Trial of Justice",
  "description": "Valdris, God of Law and Order, tests your understanding of true justice. A town has sentenced an innocent man to death. The evidence is fabricated, but the law demands execution. What will you do?",
  "quest_giver": {
    "npc_id": "valdris_avatar",
    "location": "celestial_court"
  },
  "requirements": {
    "min_level": 8,
    "divine_favor_threshold": {
      "god": "VALDRIS",
      "threshold": 50
    }
  },
  "objectives": [
    {
      "id": "obj_1",
      "type": "choice_branch",
      "description": "Valdris presents you with a moral dilemma",
      "required": true,
      "branches": [
        {
          "branch_id": "uphold_law",
          "description": "Uphold the law, even if unjust. The man must die.",
          "objectives": [
            {
              "id": "obj_1a",
              "type": "talk",
              "target": "executioner",
              "description": "Authorize the execution"
            }
          ],
          "consequences": {
            "divine_favor": {
              "VALDRIS": 30,
              "KORVAN": 10,
              "SYLARA": -20,
              "KAITHA": -30
            },
            "alignment_shift": "lawful"
          }
        },
        {
          "branch_id": "seek_truth",
          "description": "Investigate and prove his innocence",
          "objectives": [
            {
              "id": "obj_1b_1",
              "type": "obtain",
              "item": "fabricated_evidence",
              "description": "Find the fabricated evidence"
            },
            {
              "id": "obj_1b_2",
              "type": "talk",
              "target": "real_culprit",
              "description": "Expose the real culprit"
            }
          ],
          "consequences": {
            "divine_favor": {
              "VALDRIS": 50,
              "ATHENA": 30,
              "SYLARA": 10
            },
            "alignment_shift": "good"
          }
        },
        {
          "branch_id": "break_law",
          "description": "Free the prisoner by force, damn the law",
          "objectives": [
            {
              "id": "obj_1c_1",
              "type": "kill",
              "target": "town_guard",
              "quantity": 5,
              "description": "Fight through the guards"
            },
            {
              "id": "obj_1c_2",
              "type": "escort",
              "target": "innocent_prisoner",
              "description": "Escort the prisoner to safety"
            }
          ],
          "consequences": {
            "divine_favor": {
              "KAITHA": 40,
              "KORVAN": 20,
              "VALDRIS": -60
            },
            "alignment_shift": "chaotic",
            "reputation": {
              "law_enforcement": -50
            }
          }
        }
      ]
    },
    {
      "id": "obj_2",
      "type": "talk",
      "target": "valdris_avatar",
      "description": "Face Valdris' judgment",
      "required": true
    }
  ],
  "rewards": {
    "base": {
      "xp": 3000,
      "divine_favor": {},
      "skills": ["valdris_verdict"],
      "unlocks": ["divine_champion_valdris"]
    }
  },
  "status": "not_started"
}
```

### Example 3: Time-Limited Event - "The Midnight Auction"

```json
{
  "quest_id": "midnight_auction",
  "category": "time_limited",
  "tier": 3,
  "name": "The Midnight Auction",
  "description": "A mysterious merchant is holding a secret auction at midnight. Rare artifacts will be sold to the highest bidder. The auction happens tonight only.",
  "quest_giver": {
    "npc_id": "mysterious_messenger",
    "location": "valdria_tavern"
  },
  "requirements": {
    "min_level": 5,
    "gold_minimum": 500
  },
  "objectives": [
    {
      "id": "obj_1",
      "type": "location",
      "target": "secret_auction_house",
      "description": "Find the secret auction house before midnight",
      "required": true
    },
    {
      "id": "obj_2",
      "type": "choice_branch",
      "description": "Choose how to participate in the auction",
      "required": true,
      "branches": [
        {
          "branch_id": "bid",
          "description": "Bid on items legitimately",
          "objectives": [
            {
              "id": "obj_2a",
              "type": "payment",
              "gold_required": 1000,
              "description": "Win the auction bid"
            }
          ],
          "consequences": {
            "divine_favor": {"MERCUS": 15},
            "items_won": ["legendary_artifact"]
          }
        },
        {
          "branch_id": "steal",
          "description": "Steal the artifacts during the chaos",
          "objectives": [
            {
              "id": "obj_2b_1",
              "type": "skill_check",
              "skill": "dexterity",
              "difficulty": 15,
              "description": "Steal artifacts without being caught"
            }
          ],
          "consequences": {
            "divine_favor": {"KAITHA": 20, "VALDRIS": -15},
            "reputation": {"black_market": 20}
          }
        },
        {
          "branch_id": "expose",
          "description": "Expose the auction as a front for illegal trade",
          "objectives": [
            {
              "id": "obj_2c_1",
              "type": "obtain",
              "item": "auction_ledger",
              "description": "Obtain evidence of illegal dealings"
            },
            {
              "id": "obj_2c_2",
              "type": "talk",
              "target": "town_guard_captain",
              "description": "Report to authorities"
            }
          ],
          "consequences": {
            "divine_favor": {"VALDRIS": 25, "ATHENA": 15},
            "reputation": {"valdria": 30, "black_market": -50}
          }
        }
      ]
    }
  ],
  "rewards": {
    "base": {
      "xp": 750,
      "gold": 0
    }
  },
  "time_limit": {
    "type": "turn_based",
    "max_turns": 2,
    "warning_turn": 1,
    "failure_message": "The auction has ended. The opportunity is lost forever."
  },
  "status": "not_started"
}
```

### Example 4: NPC Request - "Renna's Revenge"

```json
{
  "quest_id": "rennas_revenge",
  "category": "npc_request",
  "tier": 4,
  "name": "Blood and Brotherhood",
  "description": "Renna has revealed the truth: her brother leads the Thieves Guild that has terrorized Valdria for years. She wants your help to confront him, but she's torn between justice and family.",
  "quest_giver": {
    "npc_id": "renna",
    "location": "shady_alley"
  },
  "requirements": {
    "min_level": 6,
    "npc_approval_threshold": {
      "npc": "renna",
      "threshold": 50
    }
  },
  "objectives": [
    {
      "id": "obj_1",
      "type": "talk",
      "target": "renna",
      "description": "Discuss the plan with Renna",
      "required": true
    },
    {
      "id": "obj_2",
      "type": "location",
      "target": "thieves_guild_hideout",
      "description": "Infiltrate the Thieves Guild hideout",
      "required": true
    },
    {
      "id": "obj_3",
      "type": "choice_branch",
      "description": "Confront Renna's brother",
      "required": true,
      "branches": [
        {
          "branch_id": "kill_brother",
          "description": "Support Renna in killing her brother",
          "objectives": [
            {
              "id": "obj_3a",
              "type": "kill",
              "target": "rennas_brother",
              "quantity": 1,
              "description": "Defeat Renna's brother"
            }
          ],
          "consequences": {
            "divine_favor": {"KORVAN": 15, "VALDRIS": 10, "SYLARA": -10},
            "npc_approval": {"renna": -20},
            "npc_state": {
              "renna": "grief_stricken",
              "leaves_party_in": 3
            },
            "reputation": {"thieves_guild": -100}
          }
        },
        {
          "branch_id": "redeem_brother",
          "description": "Try to redeem him and disband the guild",
          "objectives": [
            {
              "id": "obj_3b_1",
              "type": "skill_check",
              "skill": "charisma",
              "difficulty": 18,
              "description": "Convince him to surrender"
            },
            {
              "id": "obj_3b_2",
              "type": "escort",
              "target": "rennas_brother",
              "description": "Escort him to authorities"
            }
          ],
          "consequences": {
            "divine_favor": {"VALDRIS": 20, "ATHENA": 15, "SYLARA": 10},
            "npc_approval": {"renna": 40},
            "npc_state": {
              "renna": "grateful",
              "loyalty_increased": true
            },
            "reputation": {"valdria": 40}
          }
        },
        {
          "branch_id": "join_brother",
          "description": "Betray Renna and join the Thieves Guild",
          "objectives": [
            {
              "id": "obj_3c",
              "type": "kill",
              "target": "renna",
              "quantity": 1,
              "description": "Betray Renna"
            }
          ],
          "consequences": {
            "divine_favor": {"KAITHA": 25, "MERCUS": 20, "VALDRIS": -40, "KORVAN": -30},
            "npc_approval": {"renna": -100},
            "npc_state": {
              "renna": "dead",
              "removed_from_party": true
            },
            "party_trust": -30,
            "reputation": {"thieves_guild": 100, "valdria": -50},
            "unlocks": ["thieves_guild_questline"]
          }
        }
      ]
    }
  ],
  "rewards": {
    "base": {
      "xp": 1500,
      "gold": 500,
      "items": []
    }
  },
  "failure_consequences": {
    "renna_dies": {
      "trigger": "party_wipe",
      "npc_state": {"renna": "dead"}
    }
  },
  "status": "not_started"
}
```

---

## UI/UX Flow

### Quest Log Interface

```
┌─────────────────────────────────────────────────────────┐
│ QUEST LOG                                    [X]        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ ┌─ FILTERS ─────────────────────────────────┐          │
│ │ [Active] [Available] [Completed]          │          │
│ │ [Main] [Side] [Divine] [NPC] [Limited]    │          │
│ └───────────────────────────────────────────┘          │
│                                                         │
│ ┌─ ACTIVE QUESTS (3) ──────────────────────────────┐   │
│ │                                                   │   │
│ │ ⭐ The Codex Awakens                    [TRACK]  │   │
│ │    Main Story • Tier 1                           │   │
│ │    ▓▓▓▓▓░░░ 5/8 objectives                       │   │
│ │    └─ Current: Retrieve Codex Fragment           │   │
│ │    └─ Location: Ancient Ruins                    │   │
│ │                                   [SHOW ON MAP]  │   │
│ │                                                   │   │
│ │ 💬 A Father's Plea                      [TRACK]  │   │
│ │    NPC Request • Tier 1                          │   │
│ │    ▓▓░░░░░░ 2/3 objectives                       │   │
│ │    └─ Current: Obtain rare medicine              │   │
│ │    └─ Decide: [Steal] [Negotiate] [Purchase]    │   │
│ │    └─ ⏰ 3 turns remaining                        │   │
│ │                                   [SHOW ON MAP]  │   │
│ │                                                   │   │
│ │ ✨ Valdris' Trial of Justice           [TRACK]  │   │
│ │    Divine Trial • Tier 5                         │   │
│ │    ▓░░░░░░░ 1/2 objectives                       │   │
│ │    └─ Current: Make your judgment                │   │
│ │                                   [SHOW ON MAP]  │   │
│ │                                                   │   │
│ └───────────────────────────────────────────────────┘   │
│                                                         │
│ [AVAILABLE QUESTS] [COMPLETED QUESTS]                  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Quest Detail View

```
┌─────────────────────────────────────────────────────────┐
│ 💬 A FATHER'S PLEA                          [X]         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ NPC Request • Tier 1 • In Progress                     │
│ Quest Giver: Grimsby (Valdria Town Square)             │
│                                                         │
│ ┌─ DESCRIPTION ────────────────────────────────────┐   │
│ │ Grimsby's young daughter lies dying from a rare  │   │
│ │ illness. Only a specific medicine can save her,  │   │
│ │ but it's locked in Duke Aldric's warehouse.      │   │
│ └──────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─ OBJECTIVES ─────────────────────────────────────┐   │
│ │ ✅ Speak to Grimsby about his daughter           │   │
│ │ ⏳ Decide how to obtain the medicine             │   │
│ │    Choose one approach:                          │   │
│ │    • [Steal] from Duke's warehouse               │   │
│ │      └─ Divine: +KAITHA, -VALDRIS                │   │
│ │    • [Negotiate] with Duke Aldric                │   │
│ │      └─ Divine: +VALDRIS, +ATHENA                │   │
│ │    • [Purchase] for 200 gold                     │   │
│ │      └─ Divine: +MERCUS                          │   │
│ │ ⬜ Return medicine to Grimsby                    │   │
│ │ ⭐ Hidden: Discover the truth (Optional)         │   │
│ └──────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─ REWARDS ───────────────────────────────────────┐   │
│ │ XP: 150 • Gold: 75                              │   │
│ │ Items: Lucky Charm                              │   │
│ │ Divine Favor: Varies by choice                  │   │
│ │ NPC Approval: Grimsby +25                       │   │
│ │ Unlocks: Grimsby's Revenge                      │   │
│ └──────────────────────────────────────────────────┘   │
│                                                         │
│ ⏰ Time Remaining: 3 turns                              │
│                                                         │
│ [SHOW ON MAP]  [TRACK QUEST]  [ABANDON]               │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Quest Completion Screen

```
┌─────────────────────────────────────────────────────────┐
│                 QUEST COMPLETE!                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│               💬 A FATHER'S PLEA                        │
│                                                         │
│ ┌───────────────────────────────────────────────────┐  │
│ │  "You saved my daughter's life. I can never       │  │
│ │   repay you for what you've done."                │  │
│ │                                    — Grimsby      │  │
│ └───────────────────────────────────────────────────┘  │
│                                                         │
│ ┌─ REWARDS EARNED ─────────────────────────────────┐   │
│ │                                                   │   │
│ │ ⭐ +150 XP (party shared)                         │   │
│ │ 💰 +75 Gold (party shared)                        │   │
│ │ 🎁 Lucky Charm (received)                         │   │
│ │                                                   │   │
│ │ ✨ DIVINE FAVOR                                   │   │
│ │    VALDRIS: +10 (Lawful solution)                │   │
│ │    ATHENA: +5 (Wise choice)                      │   │
│ │                                                   │   │
│ │ 👥 NPC APPROVAL                                   │   │
│ │    Grimsby: +25 (now 75/100)                     │   │
│ │    Duke Aldric: +5 (now 55/100)                  │   │
│ │                                                   │   │
│ │ 🔓 UNLOCKED                                       │   │
│ │    New Quest: "Grimsby's Revenge"                │   │
│ │                                                   │   │
│ └───────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─ COMPLETION BONUSES ─────────────────────────────┐   │
│ │ ⚡ Speed Bonus: +50 XP (completed in 2 turns)     │   │
│ │ ⭐ All Objectives: +75 XP (found hidden truth)    │   │
│ └───────────────────────────────────────────────────┘   │
│                                                         │
│                   [CONTINUE]                            │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Implementation Priority

### Phase 1: Core Quest System (Week 1)
1. Quest data structures and Quest class
2. QuestManager class
3. Basic objective tracking (talk, location, obtain, deliver)
4. Quest API endpoints (available, active, completed, start)
5. Simple rewards distribution

### Phase 2: Advanced Features (Week 2)
1. Branch choice system
2. Hidden objectives and reveal conditions
3. Time-limited quests
4. Skill checks in quests
5. Quest failure consequences

### Phase 3: Integration (Week 3)
1. Map marker integration
2. NPC dialogue integration
3. Divine Council voting integration
4. Character progression integration
5. Party trust integration

### Phase 4: Content Creation (Week 4)
1. Create 10 main story quests
2. Create 20 side quests
3. Create 7 divine trial quests
4. Create 15 NPC request quests
5. Create quest chains and dependencies

### Phase 5: Polish & Testing (Week 5)
1. UI/UX implementation
2. Quest balancing
3. Reward tuning
4. Bug fixes
5. Player testing and feedback

---

## Database Schema Addition

```sql
-- Quest tables for persistence

CREATE TABLE quests (
    quest_id VARCHAR(100) PRIMARY KEY,
    category VARCHAR(50) NOT NULL,
    tier INTEGER NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    quest_data JSON NOT NULL,  -- Full quest definition
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE player_quests (
    id SERIAL PRIMARY KEY,
    game_code VARCHAR(20) NOT NULL,
    player_id VARCHAR(100) NOT NULL,
    quest_id VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL,
    current_objective_index INTEGER DEFAULT 0,
    chosen_branch VARCHAR(100),
    started_turn INTEGER,
    completed_turn INTEGER,
    quest_state JSON,  -- Progress data
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (quest_id) REFERENCES quests(quest_id)
);

CREATE TABLE quest_objectives_progress (
    id SERIAL PRIMARY KEY,
    player_quest_id INTEGER NOT NULL,
    objective_id VARCHAR(100) NOT NULL,
    progress INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    revealed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP,
    FOREIGN KEY (player_quest_id) REFERENCES player_quests(id)
);

CREATE INDEX idx_player_quests_status ON player_quests(game_code, player_id, status);
CREATE INDEX idx_quest_objectives ON quest_objectives_progress(player_quest_id, objective_id);
```

---

## Summary

This quest system design provides:

1. **Flexible Structure**: Supports all quest types (main, side, divine, NPC, limited)
2. **Deep Integration**: Connects to divine favor, NPC approval, party trust, map, dialogue
3. **Meaningful Choices**: Branch system with real consequences
4. **Progressive Complexity**: Hidden objectives, skill checks, time limits
5. **Scalable Rewards**: Dynamic calculation based on multiple factors
6. **Complete API**: Full REST API for frontend integration
7. **Rich Examples**: 4 detailed quest implementations covering different types
8. **Clear UI/UX**: Wireframes for quest interfaces

The system is designed to work seamlessly with The Arcane Codex's existing mechanics while providing compelling gameplay progression.
