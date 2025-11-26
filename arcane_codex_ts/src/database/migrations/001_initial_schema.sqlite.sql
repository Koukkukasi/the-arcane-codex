-- SQLite Schema for Arcane Codex
-- Compatible with PostgreSQL schema structure

-- Enable foreign keys
PRAGMA foreign_keys = ON;

-- Drop existing tables to ensure clean schema
DROP TABLE IF EXISTS player_achievements;
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS chat_messages;
DROP TABLE IF EXISTS game_sessions;
DROP TABLE IF EXISTS party_members;
DROP TABLE IF EXISTS parties;
DROP TABLE IF EXISTS players;

-- Players table (matches PostgreSQL schema)
CREATE TABLE IF NOT EXISTS players (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  player_id TEXT UNIQUE NOT NULL,
  username TEXT NOT NULL,
  email TEXT UNIQUE,

  -- Stats
  total_sessions INTEGER DEFAULT 0,
  total_playtime_minutes INTEGER DEFAULT 0,
  victories INTEGER DEFAULT 0,
  defeats INTEGER DEFAULT 0,

  -- Preferences
  preferred_role TEXT CHECK(preferred_role IN ('tank', 'dps', 'healer', 'support') OR preferred_role IS NULL),
  avatar_url TEXT,
  theme TEXT DEFAULT 'default',

  -- Metadata
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  last_seen TEXT DEFAULT CURRENT_TIMESTAMP,

  -- Constraints
  CHECK (total_sessions >= 0),
  CHECK (total_playtime_minutes >= 0),
  CHECK (victories >= 0),
  CHECK (defeats >= 0)
);

CREATE INDEX IF NOT EXISTS idx_players_player_id ON players(player_id);
CREATE INDEX IF NOT EXISTS idx_players_username ON players(username);
CREATE INDEX IF NOT EXISTS idx_players_email ON players(email);

-- Parties table (party_code to match PostgreSQL)
CREATE TABLE IF NOT EXISTS parties (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  party_code TEXT UNIQUE NOT NULL,
  host_player_id TEXT NOT NULL,
  name TEXT,
  max_players INTEGER DEFAULT 4,
  is_public INTEGER DEFAULT 1,
  status TEXT DEFAULT 'waiting' CHECK(status IN ('waiting', 'in_progress', 'completed')),
  member_count INTEGER DEFAULT 0,
  settings TEXT, -- JSON
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (host_player_id) REFERENCES players(player_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_parties_party_code ON parties(party_code);
CREATE INDEX IF NOT EXISTS idx_parties_host ON parties(host_player_id);
CREATE INDEX IF NOT EXISTS idx_parties_status ON parties(status);

-- Party members table
CREATE TABLE IF NOT EXISTS party_members (
  party_id TEXT NOT NULL,
  player_id TEXT NOT NULL,
  role TEXT DEFAULT 'player' CHECK(role IN ('host', 'player')),
  is_ready INTEGER DEFAULT 0,
  character_data TEXT, -- JSON
  joined_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (party_id, player_id),
  FOREIGN KEY (party_id) REFERENCES parties(id) ON DELETE CASCADE,
  FOREIGN KEY (player_id) REFERENCES players(player_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_party_members_player ON party_members(player_id);
CREATE INDEX IF NOT EXISTS idx_party_members_party ON party_members(party_id);

-- Game sessions table
CREATE TABLE IF NOT EXISTS game_sessions (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  session_code TEXT UNIQUE NOT NULL,
  party_id TEXT NOT NULL,
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
CREATE INDEX IF NOT EXISTS idx_sessions_code ON game_sessions(session_code);

-- Chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  session_id TEXT NOT NULL,
  player_id TEXT,
  message_type TEXT DEFAULT 'player' CHECK(message_type IN ('player', 'system', 'gm', 'whisper')),
  content TEXT NOT NULL,
  metadata TEXT, -- JSON
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES game_sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (player_id) REFERENCES players(player_id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_chat_session ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_player ON chat_messages(player_id);
CREATE INDEX IF NOT EXISTS idx_chat_created ON chat_messages(created_at);

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  action TEXT NOT NULL,
  player_id TEXT,
  changes TEXT, -- JSON
  metadata TEXT, -- JSON
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_player ON audit_logs(player_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at);

-- Player achievements table
CREATE TABLE IF NOT EXISTS player_achievements (
  player_id TEXT NOT NULL,
  achievement_id TEXT NOT NULL,
  unlocked_at TEXT DEFAULT CURRENT_TIMESTAMP,
  progress INTEGER DEFAULT 100,
  metadata TEXT, -- JSON
  PRIMARY KEY (player_id, achievement_id),
  FOREIGN KEY (player_id) REFERENCES players(player_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_achievements_player ON player_achievements(player_id);
CREATE INDEX IF NOT EXISTS idx_achievements_unlocked ON player_achievements(unlocked_at);
