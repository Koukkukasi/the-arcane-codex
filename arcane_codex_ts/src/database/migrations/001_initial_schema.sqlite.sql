-- SQLite Schema for Arcane Codex
-- Simplified version compatible with SQLite

-- Enable foreign keys
PRAGMA foreign_keys = ON;

-- Players table
CREATE TABLE IF NOT EXISTS players (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_id TEXT UNIQUE NOT NULL,
  username TEXT,
  email TEXT UNIQUE,
  games_played INTEGER DEFAULT 0,
  games_won INTEGER DEFAULT 0,
  total_playtime_minutes INTEGER DEFAULT 0,
  character_data TEXT, -- JSON
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  last_login TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_players_player_id ON players(player_id);
CREATE INDEX IF NOT EXISTS idx_players_username ON players(username);
CREATE INDEX IF NOT EXISTS idx_players_email ON players(email);

-- Parties table
CREATE TABLE IF NOT EXISTS parties (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  party_code TEXT UNIQUE NOT NULL,
  host_player_id TEXT NOT NULL,
  status TEXT DEFAULT 'waiting' CHECK(status IN ('waiting', 'in_progress', 'completed')),
  max_players INTEGER DEFAULT 4,
  current_players INTEGER DEFAULT 1,
  is_private INTEGER DEFAULT 0,
  settings TEXT, -- JSON
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  started_at TEXT,
  completed_at TEXT,
  FOREIGN KEY (host_player_id) REFERENCES players(player_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_parties_code ON parties(party_code);
CREATE INDEX IF NOT EXISTS idx_parties_host ON parties(host_player_id);
CREATE INDEX IF NOT EXISTS idx_parties_status ON parties(status);

-- Party members table
CREATE TABLE IF NOT EXISTS party_members (
  party_id INTEGER NOT NULL,
  player_id TEXT NOT NULL,
  role TEXT DEFAULT 'member' CHECK(role IN ('host', 'member')),
  is_ready INTEGER DEFAULT 0,
  character_data TEXT, -- JSON
  joined_at TEXT DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (party_id, player_id),
  FOREIGN KEY (party_id) REFERENCES parties(id) ON DELETE CASCADE,
  FOREIGN KEY (player_id) REFERENCES players(player_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_party_members_player ON party_members(player_id);

-- Game sessions table
CREATE TABLE IF NOT EXISTS game_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  party_id INTEGER NOT NULL,
  status TEXT DEFAULT 'active' CHECK(status IN ('active', 'paused', 'completed')),
  game_state TEXT, -- JSON
  current_scenario TEXT, -- JSON
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  completed_at TEXT,
  FOREIGN KEY (party_id) REFERENCES parties(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sessions_party ON game_sessions(party_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON game_sessions(status);

-- Chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id INTEGER NOT NULL,
  player_id TEXT NOT NULL,
  message TEXT NOT NULL,
  message_type TEXT DEFAULT 'chat' CHECK(message_type IN ('chat', 'system', 'whisper')),
  metadata TEXT, -- JSON
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES game_sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (player_id) REFERENCES players(player_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_chat_session ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_player ON chat_messages(player_id);

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  details TEXT, -- JSON
  ip_address TEXT,
  user_agent TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES players(player_id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_resource ON audit_logs(resource_type, resource_id);

-- Player achievements table
CREATE TABLE IF NOT EXISTS player_achievements (
  player_id TEXT NOT NULL,
  achievement_id TEXT NOT NULL,
  earned_at TEXT DEFAULT CURRENT_TIMESTAMP,
  metadata TEXT, -- JSON
  PRIMARY KEY (player_id, achievement_id),
  FOREIGN KEY (player_id) REFERENCES players(player_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_achievements_player ON player_achievements(player_id);

-- Triggers for updated_at
CREATE TRIGGER IF NOT EXISTS update_players_timestamp
AFTER UPDATE ON players
BEGIN
  UPDATE players SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_sessions_timestamp
AFTER UPDATE ON game_sessions
BEGIN
  UPDATE game_sessions SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
