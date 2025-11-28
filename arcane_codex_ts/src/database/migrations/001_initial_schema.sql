-- Migration 001: Initial Schema
-- Creates all tables for The Arcane Codex multiplayer system

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";  -- For gen_random_uuid()

-- ====================================
-- PLAYERS TABLE
-- ====================================
CREATE TABLE IF NOT EXISTS players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id VARCHAR(50) UNIQUE NOT NULL,
    username VARCHAR(30) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255),  -- For JWT authentication (bcrypt hash)

    -- Stats
    total_sessions INTEGER DEFAULT 0,
    total_playtime_minutes INTEGER DEFAULT 0,
    victories INTEGER DEFAULT 0,
    defeats INTEGER DEFAULT 0,

    -- Preferences
    preferred_role VARCHAR(20),
    avatar_url TEXT,
    theme VARCHAR(20) DEFAULT 'default',

    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_seen TIMESTAMP DEFAULT NOW(),

    -- Constraints
    CHECK (total_sessions >= 0),
    CHECK (total_playtime_minutes >= 0),
    CHECK (victories >= 0),
    CHECK (defeats >= 0),
    CHECK (preferred_role IN ('tank', 'dps', 'healer', 'support') OR preferred_role IS NULL)
);

CREATE INDEX idx_players_player_id ON players(player_id);
CREATE INDEX idx_players_username ON players(username);
CREATE INDEX idx_players_email ON players(email);

-- ====================================
-- PARTIES TABLE
-- ====================================
CREATE TABLE IF NOT EXISTS parties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(8) UNIQUE NOT NULL,
    name VARCHAR(30) NOT NULL,

    -- Settings
    host_player_id VARCHAR(50) NOT NULL,
    max_players INTEGER NOT NULL CHECK (max_players BETWEEN 2 AND 6),
    is_public BOOLEAN DEFAULT FALSE,

    -- State
    status VARCHAR(20) DEFAULT 'lobby',
    current_phase VARCHAR(20) DEFAULT 'LOBBY',

    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    started_at TIMESTAMP,
    completed_at TIMESTAMP,

    -- Constraints
    CHECK (status IN ('lobby', 'active', 'completed', 'disbanded')),
    CHECK (current_phase IN ('LOBBY', 'INTERROGATION', 'EXPLORATION', 'BATTLE', 'SCENARIO', 'VICTORY'))
);

CREATE INDEX idx_parties_code ON parties(code);
CREATE INDEX idx_parties_host ON parties(host_player_id);
CREATE INDEX idx_parties_status ON parties(status);
CREATE INDEX idx_parties_public ON parties(is_public) WHERE is_public = TRUE;

-- ====================================
-- PARTY MEMBERS TABLE
-- ====================================
CREATE TABLE IF NOT EXISTS party_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    party_id UUID NOT NULL REFERENCES parties(id) ON DELETE CASCADE,
    player_id VARCHAR(50) NOT NULL,

    -- Member details
    role VARCHAR(20),
    is_ready BOOLEAN DEFAULT FALSE,
    is_connected BOOLEAN DEFAULT TRUE,

    -- Metadata
    joined_at TIMESTAMP DEFAULT NOW(),
    left_at TIMESTAMP,

    -- Constraints
    UNIQUE(party_id, player_id),
    CHECK (role IN ('tank', 'dps', 'healer', 'support') OR role IS NULL)
);

CREATE INDEX idx_party_members_party ON party_members(party_id);
CREATE INDEX idx_party_members_player ON party_members(player_id);
CREATE INDEX idx_party_members_active ON party_members(party_id, player_id) WHERE left_at IS NULL;

-- ====================================
-- GAME SESSIONS TABLE
-- ====================================
CREATE TABLE IF NOT EXISTS game_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    party_id UUID NOT NULL REFERENCES parties(id),

    -- Session data (JSONB for flexible storage)
    session_state JSONB NOT NULL DEFAULT '{}',
    current_phase VARCHAR(20) NOT NULL,
    phase_data JSONB DEFAULT '{}',

    -- Results
    outcome VARCHAR(20),
    final_score INTEGER,
    duration_minutes INTEGER,

    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,

    -- Constraints
    CHECK (current_phase IN ('LOBBY', 'INTERROGATION', 'EXPLORATION', 'BATTLE', 'SCENARIO', 'VICTORY')),
    CHECK (outcome IN ('victory', 'defeat', 'abandoned') OR outcome IS NULL),
    CHECK (duration_minutes >= 0 OR duration_minutes IS NULL)
);

CREATE INDEX idx_game_sessions_party ON game_sessions(party_id);
CREATE INDEX idx_game_sessions_outcome ON game_sessions(outcome);
CREATE INDEX idx_game_sessions_created ON game_sessions(created_at);

-- GIN index for JSONB queries
CREATE INDEX idx_game_sessions_state ON game_sessions USING GIN (session_state);
CREATE INDEX idx_game_sessions_phase_data ON game_sessions USING GIN (phase_data);

-- ====================================
-- CHAT MESSAGES TABLE
-- ====================================
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    party_id UUID NOT NULL REFERENCES parties(id) ON DELETE CASCADE,
    player_id VARCHAR(50) NOT NULL,

    -- Message data
    message_type VARCHAR(20) DEFAULT 'chat',
    content TEXT NOT NULL,

    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),

    -- Constraints
    CHECK (message_type IN ('chat', 'system', 'action')),
    CHECK (LENGTH(content) <= 500)
);

CREATE INDEX idx_chat_messages_party ON chat_messages(party_id);
CREATE INDEX idx_chat_messages_player ON chat_messages(player_id);
CREATE INDEX idx_chat_messages_created ON chat_messages(created_at);
CREATE INDEX idx_chat_messages_party_created ON chat_messages(party_id, created_at DESC);

-- ====================================
-- PLAYER ACHIEVEMENTS TABLE
-- ====================================
CREATE TABLE IF NOT EXISTS player_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id VARCHAR(50) NOT NULL,

    -- Achievement data
    achievement_id VARCHAR(50) NOT NULL,
    achievement_name VARCHAR(100) NOT NULL,
    description TEXT,

    -- Progress
    progress INTEGER DEFAULT 0,
    target INTEGER DEFAULT 1,
    completed BOOLEAN DEFAULT FALSE,

    -- Metadata
    unlocked_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),

    -- Constraints
    UNIQUE(player_id, achievement_id),
    CHECK (progress >= 0),
    CHECK (target > 0),
    CHECK (progress <= target)
);

CREATE INDEX idx_achievements_player ON player_achievements(player_id);
CREATE INDEX idx_achievements_completed ON player_achievements(completed);
CREATE INDEX idx_achievements_id ON player_achievements(achievement_id);

-- ====================================
-- AUDIT LOGS TABLE
-- ====================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Event details
    event_type VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50),
    entity_id VARCHAR(100),

    -- Actor
    actor_id VARCHAR(50),
    actor_type VARCHAR(20),

    -- Data (JSONB for flexible event data)
    event_data JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',

    -- Context
    ip_address INET,
    user_agent TEXT,

    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),

    -- Constraints
    CHECK (actor_type IN ('player', 'system') OR actor_type IS NULL)
);

CREATE INDEX idx_audit_logs_event ON audit_logs(event_type);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_actor ON audit_logs(actor_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);

-- GIN indexes for JSONB queries
CREATE INDEX idx_audit_logs_event_data ON audit_logs USING GIN (event_data);
CREATE INDEX idx_audit_logs_metadata ON audit_logs USING GIN (metadata);

-- ====================================
-- TRIGGERS FOR UPDATED_AT
-- ====================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_players_updated_at
    BEFORE UPDATE ON players
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_parties_updated_at
    BEFORE UPDATE ON parties
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_game_sessions_updated_at
    BEFORE UPDATE ON game_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ====================================
-- VIEWS FOR COMMON QUERIES
-- ====================================

-- Active parties with member count
CREATE OR REPLACE VIEW active_parties_summary AS
SELECT
    p.*,
    COUNT(pm.id) FILTER (WHERE pm.left_at IS NULL) as current_members,
    COUNT(pm.id) FILTER (WHERE pm.is_ready = TRUE AND pm.left_at IS NULL) as ready_members
FROM parties p
LEFT JOIN party_members pm ON p.id = pm.party_id
WHERE p.status IN ('lobby', 'active')
GROUP BY p.id;

-- Player statistics view
CREATE OR REPLACE VIEW player_statistics AS
SELECT
    p.*,
    CASE
        WHEN (p.victories + p.defeats) > 0
        THEN ROUND((p.victories::NUMERIC / (p.victories + p.defeats)) * 100, 2)
        ELSE 0
    END as win_rate_percentage,
    CASE
        WHEN p.total_sessions > 0
        THEN ROUND(p.total_playtime_minutes::NUMERIC / p.total_sessions, 2)
        ELSE 0
    END as avg_session_minutes
FROM players p;

-- ====================================
-- SAMPLE DATA (for development/testing)
-- ====================================
-- Uncomment to insert sample data

-- INSERT INTO players (player_id, username, email, preferred_role) VALUES
-- ('player_dev_1', 'TestWarrior', 'warrior@test.com', 'tank'),
-- ('player_dev_2', 'TestMage', 'mage@test.com', 'dps'),
-- ('player_dev_3', 'TestHealer', 'healer@test.com', 'healer');

-- INSERT INTO parties (code, name, host_player_id, max_players, is_public) VALUES
-- ('TEST01', 'Test Party', 'player_dev_1', 4, true);

-- ====================================
-- PERMISSIONS (adjust for your setup)
-- ====================================
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO arcane_codex_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO arcane_codex_user;

COMMENT ON TABLE players IS 'Player accounts with stats and preferences';
COMMENT ON TABLE parties IS 'Multiplayer party information and settings';
COMMENT ON TABLE party_members IS 'Party membership with roles and status';
COMMENT ON TABLE game_sessions IS 'Complete game session state and results';
COMMENT ON TABLE chat_messages IS 'Party chat history';
COMMENT ON TABLE player_achievements IS 'Player achievement tracking';
COMMENT ON TABLE audit_logs IS 'Audit trail for debugging and security';
