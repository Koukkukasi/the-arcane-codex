# Phase 8: Database Schema Design

**Date:** 2025-11-23
**Status:** 🔄 **IN PROGRESS**

---

## 🎯 Overview

Database persistence layer for The Arcane Codex multiplayer system, enabling:
- Party and player persistence across server restarts
- Game session state recovery
- Player profiles and statistics
- Achievement and progression tracking
- Audit logging for debugging

---

## 🗄️ Database Choice: PostgreSQL

**Why PostgreSQL:**
- ACID compliance for transaction safety
- JSON/JSONB support for flexible game state
- Excellent TypeScript integration (pg, TypeORM)
- Scalable for multiplayer games
- Open source and free

---

## 📊 Database Schema

### **Table: players**

Stores player account information and statistics.

```sql
CREATE TABLE players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id VARCHAR(50) UNIQUE NOT NULL,  -- External player ID
    username VARCHAR(30) NOT NULL,
    email VARCHAR(255) UNIQUE,

    -- Stats
    total_sessions INTEGER DEFAULT 0,
    total_playtime_minutes INTEGER DEFAULT 0,
    victories INTEGER DEFAULT 0,
    defeats INTEGER DEFAULT 0,

    -- Preferences
    preferred_role VARCHAR(20),  -- tank, dps, healer, support
    avatar_url TEXT,
    theme VARCHAR(20) DEFAULT 'default',

    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_seen TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_players_player_id ON players(player_id);
CREATE INDEX idx_players_username ON players(username);
```

### **Table: parties**

Stores party information and settings.

```sql
CREATE TABLE parties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(8) UNIQUE NOT NULL,  -- Party join code
    name VARCHAR(30) NOT NULL,

    -- Settings
    host_player_id VARCHAR(50) NOT NULL REFERENCES players(player_id),
    max_players INTEGER NOT NULL CHECK (max_players BETWEEN 2 AND 6),
    is_public BOOLEAN DEFAULT FALSE,

    -- State
    status VARCHAR(20) DEFAULT 'lobby',  -- lobby, active, completed, disbanded
    current_phase VARCHAR(20) DEFAULT 'LOBBY',

    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    started_at TIMESTAMP,
    completed_at TIMESTAMP
);

CREATE INDEX idx_parties_code ON parties(code);
CREATE INDEX idx_parties_host ON parties(host_player_id);
CREATE INDEX idx_parties_status ON parties(status);
```

### **Table: party_members**

Junction table for party membership with role assignments.

```sql
CREATE TABLE party_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    party_id UUID NOT NULL REFERENCES parties(id) ON DELETE CASCADE,
    player_id VARCHAR(50) NOT NULL REFERENCES players(player_id),

    -- Member details
    role VARCHAR(20),  -- tank, dps, healer, support
    is_ready BOOLEAN DEFAULT FALSE,
    is_connected BOOLEAN DEFAULT TRUE,

    -- Metadata
    joined_at TIMESTAMP DEFAULT NOW(),
    left_at TIMESTAMP,

    UNIQUE(party_id, player_id)
);

CREATE INDEX idx_party_members_party ON party_members(party_id);
CREATE INDEX idx_party_members_player ON party_members(player_id);
```

### **Table: game_sessions**

Stores complete game session data for replay and analysis.

```sql
CREATE TABLE game_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    party_id UUID NOT NULL REFERENCES parties(id),

    -- Session data
    session_state JSONB NOT NULL,  -- Complete game state snapshot
    current_phase VARCHAR(20) NOT NULL,
    phase_data JSONB,  -- Phase-specific data

    -- Results
    outcome VARCHAR(20),  -- victory, defeat, abandoned
    final_score INTEGER,
    duration_minutes INTEGER,

    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP
);

CREATE INDEX idx_game_sessions_party ON game_sessions(party_id);
CREATE INDEX idx_game_sessions_outcome ON game_sessions(outcome);
```

### **Table: chat_messages**

Stores chat history for moderation and audit.

```sql
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    party_id UUID NOT NULL REFERENCES parties(id) ON DELETE CASCADE,
    player_id VARCHAR(50) NOT NULL REFERENCES players(player_id),

    -- Message data
    message_type VARCHAR(20) DEFAULT 'chat',  -- chat, system, action
    content TEXT NOT NULL,

    -- Metadata
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_chat_messages_party ON chat_messages(party_id);
CREATE INDEX idx_chat_messages_player ON chat_messages(player_id);
CREATE INDEX idx_chat_messages_created ON chat_messages(created_at);
```

### **Table: player_achievements**

Tracks player achievements and unlocks.

```sql
CREATE TABLE player_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id VARCHAR(50) NOT NULL REFERENCES players(player_id),

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

    UNIQUE(player_id, achievement_id)
);

CREATE INDEX idx_achievements_player ON player_achievements(player_id);
CREATE INDEX idx_achievements_completed ON player_achievements(completed);
```

### **Table: audit_logs**

Comprehensive audit trail for debugging and security.

```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Event details
    event_type VARCHAR(50) NOT NULL,  -- party_created, player_joined, etc.
    entity_type VARCHAR(50),  -- party, player, session
    entity_id VARCHAR(100),

    -- Actor
    actor_id VARCHAR(50),
    actor_type VARCHAR(20),  -- player, system

    -- Data
    event_data JSONB,
    metadata JSONB,

    -- Context
    ip_address INET,
    user_agent TEXT,

    -- Metadata
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_event ON audit_logs(event_type);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_actor ON audit_logs(actor_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);
```

---

## 🔗 Relationships

```
players (1) ----< (N) party_members
parties (1) ----< (N) party_members
parties (1) ----< (N) game_sessions
parties (1) ----< (N) chat_messages
players (1) ----< (N) player_achievements
```

---

## 📝 Sample Data

### **Player Record**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "player_id": "player_1732382400000",
  "username": "ArcaneWarrior",
  "email": "warrior@example.com",
  "total_sessions": 15,
  "total_playtime_minutes": 450,
  "victories": 10,
  "defeats": 5,
  "preferred_role": "tank",
  "created_at": "2025-11-23T10:00:00Z"
}
```

### **Party Record**
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "code": "ABC123",
  "name": "Epic Adventure Party",
  "host_player_id": "player_1732382400000",
  "max_players": 4,
  "is_public": false,
  "status": "active",
  "current_phase": "BATTLE",
  "created_at": "2025-11-23T14:30:00Z",
  "started_at": "2025-11-23T14:35:00Z"
}
```

### **Game Session Record**
```json
{
  "id": "770e8400-e29b-41d4-a716-446655440002",
  "party_id": "660e8400-e29b-41d4-a716-446655440001",
  "session_state": {
    "players": [...],
    "current_scenario": {...},
    "battle_state": {...}
  },
  "current_phase": "BATTLE",
  "phase_data": {
    "turn": 3,
    "enemies": [...]
  },
  "outcome": null,
  "created_at": "2025-11-23T14:35:00Z"
}
```

---

## 🔐 Security Considerations

### **Data Protection**
- Passwords will be hashed with bcrypt (if implementing auth)
- Sensitive data encrypted at rest
- GDPR compliance (data deletion on request)

### **SQL Injection Prevention**
- Parameterized queries only
- TypeORM query builder for safety
- Input validation at API layer

### **Rate Limiting**
- Prevent spam in chat_messages
- Limit party creation per IP
- Throttle API endpoints

---

## 🚀 Migration Strategy

### **Phase 1: Schema Creation**
1. Create development database
2. Run migration scripts
3. Seed test data

### **Phase 2: Integration**
1. Update PartyManager to use database
2. Update MultiplayerService for persistence
3. Add session recovery logic

### **Phase 3: Testing**
1. Unit tests for repositories
2. Integration tests for CRUD
3. E2E tests for full flow

---

## 📊 Performance Optimization

### **Indexes**
- Primary keys on all tables
- Foreign key indexes for joins
- Composite indexes for frequent queries

### **JSONB Advantages**
- Flexible game state storage
- Queryable with GIN indexes
- Smaller storage than TEXT

### **Connection Pooling**
- Use pg pool for performance
- Max 20 connections for development
- Max 100 connections for production

---

## 🔄 Future Enhancements

1. **Read Replicas** - Scale read operations
2. **Partitioning** - Archive old sessions
3. **Caching** - Redis for hot data
4. **Sharding** - Distribute by region
5. **Backup** - Automated daily backups

---

**Last Updated:** 2025-11-23
**Database:** PostgreSQL 14+
**ORM:** TypeORM or pg native
**Status:** 🔄 Schema Design Complete
