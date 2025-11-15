"""
The Arcane Codex - Database Layer
SQLite database for zero-cost, concurrent game state management
"""

import sqlite3
import json
from contextlib import contextmanager
from datetime import datetime
from typing import Dict, List, Optional, Any
import hashlib
import secrets

class ArcaneDatabase:
    """Complete database system for The Arcane Codex"""

    def __init__(self, db_path="arcane_codex.db"):
        self.db_path = db_path
        self.init_database()

    def init_database(self):
        """Create all required tables with proper schema"""
        with self.get_connection() as conn:
            conn.executescript("""
                -- Core game state table
                CREATE TABLE IF NOT EXISTS games (
                    id TEXT PRIMARY KEY,
                    code TEXT UNIQUE NOT NULL,
                    state JSON NOT NULL,
                    turn INTEGER DEFAULT 0,
                    phase TEXT DEFAULT 'waiting', -- waiting, interrogation, playing, completed
                    party_trust INTEGER DEFAULT 50,
                    location TEXT DEFAULT 'Valdria Town Square',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );

                -- Player data with character info
                CREATE TABLE IF NOT EXISTS players (
                    id TEXT PRIMARY KEY,
                    game_id TEXT NOT NULL,
                    name TEXT NOT NULL,
                    class_type TEXT,
                    divine_favor JSON DEFAULT '{}',
                    skills JSON DEFAULT '{}',
                    hp INTEGER DEFAULT 100,
                    stamina INTEGER DEFAULT 100,
                    mana INTEGER DEFAULT 0,
                    status TEXT DEFAULT 'active', -- active, disconnected, dead
                    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (game_id) REFERENCES games(id)
                );

                -- Multi-sensory whispers system
                CREATE TABLE IF NOT EXISTS sensory_whispers (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    game_id TEXT NOT NULL,
                    turn INTEGER NOT NULL,
                    player_id TEXT,
                    sense_type TEXT, -- visual, audio, smell, touch, taste, supernatural, emotional, temporal
                    content TEXT NOT NULL,
                    is_public BOOLEAN DEFAULT FALSE,
                    is_shared BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (game_id) REFERENCES games(id)
                );

                -- Player action queue for async gameplay
                CREATE TABLE IF NOT EXISTS pending_actions (
                    game_id TEXT NOT NULL,
                    player_id TEXT NOT NULL,
                    action TEXT NOT NULL,
                    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    PRIMARY KEY (game_id, player_id),
                    FOREIGN KEY (game_id) REFERENCES games(id)
                );

                -- Game history for AI context
                CREATE TABLE IF NOT EXISTS game_history (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    game_id TEXT NOT NULL,
                    turn INTEGER NOT NULL,
                    event_type TEXT NOT NULL, -- scenario, combat, divine_council, npc_event
                    data JSON NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (game_id) REFERENCES games(id)
                );

                -- Divine Interrogation responses
                CREATE TABLE IF NOT EXISTS interrogation_answers (
                    player_id TEXT NOT NULL,
                    question_number INTEGER NOT NULL,
                    god TEXT NOT NULL,
                    answer_id INTEGER NOT NULL,
                    favor_changes JSON NOT NULL,
                    answered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    PRIMARY KEY (player_id, question_number),
                    FOREIGN KEY (player_id) REFERENCES players(id)
                );

                -- Divine Council votes
                CREATE TABLE IF NOT EXISTS divine_councils (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    game_id TEXT NOT NULL,
                    turn INTEGER NOT NULL,
                    action_judged TEXT NOT NULL,
                    votes JSON NOT NULL, -- {god: {support: bool, reason: str}}
                    testimonies JSON NOT NULL,
                    outcome TEXT NOT NULL, -- unanimous_support, majority_support, etc
                    impact JSON NOT NULL, -- favor changes, blessings, curses
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (game_id) REFERENCES games(id)
                );

                -- NPC state tracking
                CREATE TABLE IF NOT EXISTS npcs (
                    id TEXT PRIMARY KEY,
                    game_id TEXT NOT NULL,
                    name TEXT NOT NULL,
                    approval INTEGER DEFAULT 50,
                    status TEXT DEFAULT 'alive', -- alive, dead, betrayed, fled
                    personality JSON NOT NULL,
                    hidden_agenda TEXT,
                    fatal_flaw TEXT,
                    FOREIGN KEY (game_id) REFERENCES games(id)
                );

                -- Scenario history to prevent repetition
                CREATE TABLE IF NOT EXISTS scenarios (
                    game_id TEXT NOT NULL,
                    turn INTEGER NOT NULL,
                    theme TEXT NOT NULL, -- betrayal, sacrifice, greed, etc
                    public_scene TEXT NOT NULL,
                    whispers JSON NOT NULL,
                    sensory_data JSON,
                    choices JSON NOT NULL,
                    resolution JSON,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    PRIMARY KEY (game_id, turn),
                    FOREIGN KEY (game_id) REFERENCES games(id)
                );

                -- Sensory memory triggers
                CREATE TABLE IF NOT EXISTS sensory_memories (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    player_id TEXT NOT NULL,
                    trigger_sense TEXT NOT NULL,
                    trigger_content TEXT NOT NULL,
                    memory_content TEXT NOT NULL,
                    emotional_impact INTEGER DEFAULT 0, -- -100 to +100
                    times_triggered INTEGER DEFAULT 0,
                    can_overcome BOOLEAN DEFAULT TRUE,
                    FOREIGN KEY (player_id) REFERENCES players(id)
                );

                -- Create indexes for performance
                CREATE INDEX IF NOT EXISTS idx_games_code ON games(code);
                CREATE INDEX IF NOT EXISTS idx_games_phase ON games(phase);
                CREATE INDEX IF NOT EXISTS idx_players_game ON players(game_id);
                CREATE INDEX IF NOT EXISTS idx_whispers_game ON sensory_whispers(game_id, turn);
                CREATE INDEX IF NOT EXISTS idx_history_game ON game_history(game_id, turn);
                CREATE INDEX IF NOT EXISTS idx_npcs_game ON npcs(game_id);
            """)
            conn.commit()

    @contextmanager
    def get_connection(self):
        """Thread-safe connection context manager"""
        conn = sqlite3.connect(self.db_path, timeout=10.0)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA foreign_keys = ON")
        try:
            yield conn
            conn.commit()
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            conn.close()

    # ========== Game Management ==========

    def create_game(self, code: str) -> str:
        """Create a new game session"""
        game_id = f"game_{code}_{secrets.token_hex(4)}"

        initial_state = {
            "players": [],
            "npcs": [],
            "party_trust": 50,
            "location": "Valdria Town Square",
            "scenario_history": [],
            "world_flags": {},
            "turn": 0
        }

        with self.get_connection() as conn:
            conn.execute("""
                INSERT INTO games (id, code, state, phase)
                VALUES (?, ?, ?, 'waiting')
            """, (game_id, code, json.dumps(initial_state)))

            # Create default NPCs
            self.create_default_npcs(game_id)

        return game_id

    def get_game_by_code(self, code: str) -> Optional[Dict]:
        """Get game by join code"""
        with self.get_connection() as conn:
            result = conn.execute("""
                SELECT * FROM games WHERE code = ?
            """, (code,)).fetchone()

            if result:
                game = dict(result)
                game['state'] = json.loads(game['state'])
                return game
            return None

    def update_game_state(self, game_id: str, updates: Dict[str, Any]):
        """Update game state atomically"""
        with self.get_connection() as conn:
            # Get current state
            current = conn.execute("""
                SELECT state, turn FROM games WHERE id = ?
            """, (game_id,)).fetchone()

            if current:
                state = json.loads(current['state'])
                state.update(updates)

                # Update database
                conn.execute("""
                    UPDATE games
                    SET state = ?, updated_at = CURRENT_TIMESTAMP
                    WHERE id = ?
                """, (json.dumps(state), game_id))

    def advance_turn(self, game_id: str):
        """Advance to next turn"""
        with self.get_connection() as conn:
            conn.execute("""
                UPDATE games
                SET turn = turn + 1, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            """, (game_id,))

    # ========== Player Management ==========

    def create_player(self, game_id: str, name: str) -> str:
        """Create a new player"""
        player_id = f"player_{secrets.token_hex(8)}"

        with self.get_connection() as conn:
            conn.execute("""
                INSERT INTO players (id, game_id, name, skills, divine_favor)
                VALUES (?, ?, ?, ?, ?)
            """, (player_id, game_id, name,
                 json.dumps(self.get_default_skills()),
                 json.dumps({})))

        return player_id

    def get_player(self, player_id: str) -> Optional[Dict]:
        """Get player by ID"""
        with self.get_connection() as conn:
            result = conn.execute("""
                SELECT * FROM players WHERE id = ?
            """, (player_id,)).fetchone()

            if result:
                player = dict(result)
                player['skills'] = json.loads(player['skills'])
                player['divine_favor'] = json.loads(player['divine_favor'])
                return player
            return None

    def get_players_in_game(self, game_id: str) -> List[Dict]:
        """Get all players in a game"""
        with self.get_connection() as conn:
            results = conn.execute("""
                SELECT * FROM players
                WHERE game_id = ? AND status = 'active'
            """, (game_id,)).fetchall()

            players = []
            for row in results:
                player = dict(row)
                player['skills'] = json.loads(player['skills'])
                player['divine_favor'] = json.loads(player['divine_favor'])
                players.append(player)

            return players

    def update_player_class(self, player_id: str, class_type: str, divine_favor: Dict):
        """Update player after Divine Interrogation"""
        with self.get_connection() as conn:
            # Update class-specific stats
            hp, stamina, mana = self.get_class_stats(class_type)
            skills = self.get_class_skills(class_type)

            conn.execute("""
                UPDATE players
                SET class_type = ?, divine_favor = ?, skills = ?,
                    hp = ?, stamina = ?, mana = ?
                WHERE id = ?
            """, (class_type, json.dumps(divine_favor), json.dumps(skills),
                 hp, stamina, mana, player_id))

    # ========== Action Management ==========

    def submit_action(self, game_id: str, player_id: str, action: str):
        """Submit player action for current turn"""
        with self.get_connection() as conn:
            conn.execute("""
                INSERT OR REPLACE INTO pending_actions (game_id, player_id, action)
                VALUES (?, ?, ?)
            """, (game_id, player_id, action))

    def get_pending_actions(self, game_id: str) -> Dict[str, str]:
        """Get all pending actions for a game"""
        with self.get_connection() as conn:
            results = conn.execute("""
                SELECT player_id, action
                FROM pending_actions
                WHERE game_id = ?
            """, (game_id,)).fetchall()

            return {row['player_id']: row['action'] for row in results}

    def clear_pending_actions(self, game_id: str):
        """Clear actions after turn processing"""
        with self.get_connection() as conn:
            conn.execute("""
                DELETE FROM pending_actions WHERE game_id = ?
            """, (game_id,))

    def all_players_acted(self, game_id: str) -> bool:
        """Check if all active players have submitted actions"""
        with self.get_connection() as conn:
            player_count = conn.execute("""
                SELECT COUNT(*) as count FROM players
                WHERE game_id = ? AND status = 'active'
            """, (game_id,)).fetchone()['count']

            action_count = conn.execute("""
                SELECT COUNT(*) as count FROM pending_actions
                WHERE game_id = ?
            """, (game_id,)).fetchone()['count']

            return player_count > 0 and action_count >= player_count

    # ========== Whisper Management ==========

    def save_whisper(self, game_id: str, turn: int, player_id: Optional[str],
                    sense_type: str, content: str, is_public: bool = False):
        """Save a sensory whisper"""
        with self.get_connection() as conn:
            conn.execute("""
                INSERT INTO sensory_whispers
                (game_id, turn, player_id, sense_type, content, is_public)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (game_id, turn, player_id, sense_type, content, is_public))

    def get_whispers_for_turn(self, game_id: str, turn: int) -> List[Dict]:
        """Get all whispers for a specific turn"""
        with self.get_connection() as conn:
            results = conn.execute("""
                SELECT * FROM sensory_whispers
                WHERE game_id = ? AND turn = ?
                ORDER BY created_at
            """, (game_id, turn)).fetchall()

            return [dict(row) for row in results]

    def share_whisper(self, whisper_id: int):
        """Mark a whisper as shared with party"""
        with self.get_connection() as conn:
            conn.execute("""
                UPDATE sensory_whispers
                SET is_shared = TRUE
                WHERE id = ?
            """, (whisper_id,))

    # ========== NPC Management ==========

    def create_default_npcs(self, game_id: str):
        """Create default NPCs for a new game"""
        npcs = [
            {
                "id": f"{game_id}_grimsby",
                "name": "Grimsby",
                "approval": 50,
                "personality": {"traits": ["desperate", "protective", "honest"]},
                "hidden_agenda": "Save daughter at any cost",
                "fatal_flaw": "Will betray anyone for his daughter"
            },
            {
                "id": f"{game_id}_renna",
                "name": "Renna",
                "approval": 50,
                "personality": {"traits": ["vengeful", "skilled", "impulsive"]},
                "hidden_agenda": "Kill brother who leads Thieves Guild",
                "fatal_flaw": "Acts without thinking when family mentioned"
            }
        ]

        with self.get_connection() as conn:
            for npc in npcs:
                conn.execute("""
                    INSERT INTO npcs (id, game_id, name, approval, personality, hidden_agenda, fatal_flaw)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (npc["id"], game_id, npc["name"], npc["approval"],
                     json.dumps(npc["personality"]), npc["hidden_agenda"], npc["fatal_flaw"]))

    def update_npc_approval(self, npc_id: str, change: int, reason: str = ""):
        """Update NPC approval rating"""
        with self.get_connection() as conn:
            conn.execute("""
                UPDATE npcs
                SET approval = MIN(100, MAX(0, approval + ?))
                WHERE id = ?
            """, (change, npc_id))

    def get_npcs_for_game(self, game_id: str) -> List[Dict]:
        """Get all NPCs in a game"""
        with self.get_connection() as conn:
            results = conn.execute("""
                SELECT * FROM npcs
                WHERE game_id = ? AND status = 'alive'
            """, (game_id,)).fetchall()

            npcs = []
            for row in results:
                npc = dict(row)
                npc['personality'] = json.loads(npc['personality'])
                npcs.append(npc)

            return npcs

    # ========== History & Context ==========

    def add_history_event(self, game_id: str, turn: int, event_type: str, data: Dict):
        """Add event to game history"""
        with self.get_connection() as conn:
            conn.execute("""
                INSERT INTO game_history (game_id, turn, event_type, data)
                VALUES (?, ?, ?, ?)
            """, (game_id, turn, event_type, json.dumps(data)))

    def get_recent_history(self, game_id: str, limit: int = 10) -> List[Dict]:
        """Get recent game history for context"""
        with self.get_connection() as conn:
            results = conn.execute("""
                SELECT * FROM game_history
                WHERE game_id = ?
                ORDER BY turn DESC, created_at DESC
                LIMIT ?
            """, (game_id, limit)).fetchall()

            history = []
            for row in results:
                event = dict(row)
                event['data'] = json.loads(event['data'])
                history.append(event)

            return history

    # ========== Helper Methods ==========

    def get_default_skills(self) -> Dict[str, int]:
        """Get default skill values"""
        return {
            "strength": 10,
            "archery": 10,
            "arcana": 10,
            "research": 10,
            "lockpicking": 10,
            "stealth": 10,
            "sleight_of_hand": 10,
            "persuasion": 10,
            "intimidation": 10,
            "deception": 10,
            "perception": 10,
            "survival": 10,
            "medicine": 10
        }

    def get_class_stats(self, class_type: str) -> tuple:
        """Get HP, Stamina, Mana for class"""
        stats = {
            "Fighter": (100, 100, 0),
            "Mage": (60, 60, 100),
            "Thief": (80, 100, 0),
            "Ranger": (80, 120, 0),
            "Cleric": (70, 80, 80),
            "Bard": (70, 90, 50)
        }
        return stats.get(class_type, (80, 80, 0))

    def get_class_skills(self, class_type: str) -> Dict[str, int]:
        """Get class-specific skill bonuses"""
        skills = self.get_default_skills()

        bonuses = {
            "Fighter": {"strength": 15, "intimidation": 10},
            "Mage": {"arcana": 20, "research": 15},
            "Thief": {"lockpicking": 20, "stealth": 15, "sleight_of_hand": 15},
            "Ranger": {"archery": 15, "survival": 20, "perception": 10},
            "Cleric": {"medicine": 20, "persuasion": 10, "arcana": 10},
            "Bard": {"persuasion": 20, "deception": 15, "perception": 10}
        }

        if class_type in bonuses:
            for skill, bonus in bonuses[class_type].items():
                skills[skill] += bonus

        return skills