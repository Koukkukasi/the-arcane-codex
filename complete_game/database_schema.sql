-- ============================================================================
-- THE ARCANE CODEX - COMPLETE DATABASE SCHEMA
-- ============================================================================
-- Database: SQLite 3
-- Purpose: Fantasy RPG with quests, characters, inventory, and progression
-- Author: Database Schema Design
-- Date: 2025-11-15
-- ============================================================================

-- ============================================================================
-- CORE GAME TABLES (Already existing, documented here for completeness)
-- ============================================================================

-- Game sessions with state management
CREATE TABLE IF NOT EXISTS games (
    id TEXT PRIMARY KEY,                          -- Unique game session ID
    code TEXT UNIQUE NOT NULL,                    -- 4-character join code
    state JSON NOT NULL,                          -- Game state as JSON blob
    turn INTEGER DEFAULT 0,                       -- Current turn number
    phase TEXT DEFAULT 'waiting',                 -- waiting, interrogation, playing, completed
    party_trust INTEGER DEFAULT 50,               -- Party cohesion (0-100)
    location TEXT DEFAULT 'Valdria Town Square',  -- Current location
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Player/Character data
CREATE TABLE IF NOT EXISTS players (
    id TEXT PRIMARY KEY,                          -- Unique player ID
    game_id TEXT NOT NULL,                        -- Foreign key to games
    name TEXT NOT NULL,                           -- Character name
    class_type TEXT,                              -- Fighter, Mage, Thief, Ranger, Cleric, Bard
    divine_favor JSON DEFAULT '{}',               -- Divine favor scores {god: score}
    skills JSON DEFAULT '{}',                     -- Skill levels {skill: level}
    hp INTEGER DEFAULT 100,                       -- Current hit points
    hp_max INTEGER DEFAULT 100,                   -- Maximum hit points
    stamina INTEGER DEFAULT 100,                  -- Current stamina
    stamina_max INTEGER DEFAULT 100,              -- Maximum stamina
    mana INTEGER DEFAULT 0,                       -- Current mana
    mana_max INTEGER DEFAULT 0,                   -- Maximum mana
    level INTEGER DEFAULT 1,                      -- Character level
    experience INTEGER DEFAULT 0,                 -- Current XP
    total_experience INTEGER DEFAULT 0,           -- Lifetime XP earned
    gold INTEGER DEFAULT 50,                      -- Currency
    status TEXT DEFAULT 'active',                 -- active, disconnected, dead
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
);

-- Multi-sensory whispers system
CREATE TABLE IF NOT EXISTS sensory_whispers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    game_id TEXT NOT NULL,
    turn INTEGER NOT NULL,
    player_id TEXT,                               -- NULL for public whispers
    sense_type TEXT,                              -- visual, audio, smell, touch, taste, supernatural, emotional, temporal
    content TEXT NOT NULL,                        -- The whisper text
    is_public BOOLEAN DEFAULT FALSE,              -- Visible to all players
    is_shared BOOLEAN DEFAULT FALSE,              -- Player shared with party
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
);

-- Player action queue for async gameplay
CREATE TABLE IF NOT EXISTS pending_actions (
    game_id TEXT NOT NULL,
    player_id TEXT NOT NULL,
    action TEXT NOT NULL,                         -- Player's chosen action
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (game_id, player_id),
    FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
);

-- Game history for AI context
CREATE TABLE IF NOT EXISTS game_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    game_id TEXT NOT NULL,
    turn INTEGER NOT NULL,
    event_type TEXT NOT NULL,                     -- scenario, combat, divine_council, npc_event, quest_complete
    data JSON NOT NULL,                           -- Event data as JSON
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
);

-- Divine Interrogation responses
CREATE TABLE IF NOT EXISTS interrogation_answers (
    player_id TEXT NOT NULL,
    question_number INTEGER NOT NULL,
    god TEXT NOT NULL,                            -- Which god asked the question
    answer_id INTEGER NOT NULL,                   -- Selected answer option
    favor_changes JSON NOT NULL,                  -- Favor changes from this answer
    answered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (player_id, question_number),
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
);

-- Divine Council votes
CREATE TABLE IF NOT EXISTS divine_councils (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    game_id TEXT NOT NULL,
    turn INTEGER NOT NULL,
    action_judged TEXT NOT NULL,                  -- The action being judged
    votes JSON NOT NULL,                          -- {god: {support: bool, reason: str}}
    testimonies JSON NOT NULL,                    -- Testimony from each god
    outcome TEXT NOT NULL,                        -- unanimous_support, majority_support, etc
    impact JSON NOT NULL,                         -- favor changes, blessings, curses
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
);

-- NPC state tracking
CREATE TABLE IF NOT EXISTS npcs (
    id TEXT PRIMARY KEY,
    game_id TEXT NOT NULL,
    name TEXT NOT NULL,
    approval INTEGER DEFAULT 50,                  -- Approval rating (0-100)
    status TEXT DEFAULT 'alive',                  -- alive, dead, betrayed, fled
    personality JSON NOT NULL,                    -- Personality traits
    hidden_agenda TEXT,                           -- Secret motivation
    fatal_flaw TEXT,                              -- Character weakness
    FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
);

-- Scenario history to prevent repetition
CREATE TABLE IF NOT EXISTS scenarios (
    game_id TEXT NOT NULL,
    turn INTEGER NOT NULL,
    theme TEXT NOT NULL,                          -- betrayal, sacrifice, greed, etc
    public_scene TEXT NOT NULL,                   -- Public narrative
    whispers JSON NOT NULL,                       -- Private whispers by class
    sensory_data JSON,                            -- Sensory details
    choices JSON NOT NULL,                        -- Available choices
    resolution JSON,                              -- How it was resolved
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (game_id, turn),
    FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
);

-- Sensory memory triggers
CREATE TABLE IF NOT EXISTS sensory_memories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_id TEXT NOT NULL,
    trigger_sense TEXT NOT NULL,                  -- Which sense triggers this
    trigger_content TEXT NOT NULL,                -- What triggers it
    memory_content TEXT NOT NULL,                 -- The memory revealed
    emotional_impact INTEGER DEFAULT 0,           -- -100 to +100
    times_triggered INTEGER DEFAULT 0,            -- How many times activated
    can_overcome BOOLEAN DEFAULT TRUE,            -- Can be conquered
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
);

-- ============================================================================
-- NEW TABLES - INVENTORY & ITEMS
-- ============================================================================

-- Item definitions (master item catalog)
CREATE TABLE IF NOT EXISTS items (
    id TEXT PRIMARY KEY,                          -- Unique item identifier
    name TEXT NOT NULL,                           -- Display name
    description TEXT NOT NULL,                    -- Item description
    type TEXT NOT NULL,                           -- weapon, armor, accessory, consumable, quest, material, treasure
    rarity TEXT NOT NULL,                         -- common, uncommon, rare, epic, legendary, divine
    value INTEGER DEFAULT 0,                      -- Gold value
    level_requirement INTEGER DEFAULT 1,          -- Minimum level to use
    class_requirement TEXT,                       -- Required class (NULL = any)
    stackable BOOLEAN DEFAULT FALSE,              -- Can be stacked
    max_stack INTEGER DEFAULT 1,                  -- Max stack size
    icon TEXT DEFAULT '📦',                       -- Display icon/emoji

    -- Equipment specific (NULL for non-equipment)
    slot TEXT,                                    -- Equipment slot (weapon type or armor slot)
    durability INTEGER,                           -- Current durability
    max_durability INTEGER,                       -- Maximum durability

    -- Stats (JSON for flexibility)
    stats JSON DEFAULT '{}',                      -- {attack: 5, defense: 3, etc}
    effects JSON DEFAULT '{}',                    -- Special effects
    enchantments JSON DEFAULT '[]',               -- List of enchantments

    -- Consumable specific
    effect_type TEXT,                             -- healing, buff, damage, utility
    effect_value INTEGER,                         -- Numeric effect
    effect_duration INTEGER,                      -- Turns (for buffs)
    cooldown INTEGER,                             -- Cooldown turns

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Player inventory (instance of items owned by player)
CREATE TABLE IF NOT EXISTS player_inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_id TEXT NOT NULL,                      -- Owner
    item_id TEXT NOT NULL,                        -- Reference to items table
    quantity INTEGER DEFAULT 1,                   -- Stack size
    slot_index INTEGER,                           -- Inventory position

    -- Instance-specific data (for unique items)
    custom_name TEXT,                             -- Custom item name
    current_durability INTEGER,                   -- Current durability (for this instance)
    bound_to_player BOOLEAN DEFAULT FALSE,        -- Cannot be traded

    acquired_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES items(id)
);

-- Equipped items (what player has equipped)
CREATE TABLE IF NOT EXISTS player_equipment (
    player_id TEXT NOT NULL,
    slot TEXT NOT NULL,                           -- weapon, head, chest, legs, feet, hands, shield, accessory_1, accessory_2
    item_id TEXT NOT NULL,                        -- Reference to items table
    inventory_id INTEGER NOT NULL,                -- Reference to specific inventory instance
    equipped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (player_id, slot),
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES items(id),
    FOREIGN KEY (inventory_id) REFERENCES player_inventory(id) ON DELETE CASCADE
);

-- Loot tables for enemies
CREATE TABLE IF NOT EXISTS loot_tables (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    enemy_type TEXT NOT NULL,                     -- goblin, orc, skeleton, bandit, boss, etc
    item_id TEXT NOT NULL,                        -- Item that can drop
    drop_chance REAL NOT NULL,                    -- 0.0 to 1.0 (0% to 100%)
    min_quantity INTEGER DEFAULT 1,               -- Minimum drop quantity
    max_quantity INTEGER DEFAULT 1,               -- Maximum drop quantity
    min_level INTEGER DEFAULT 1,                  -- Minimum enemy level for this drop
    max_level INTEGER,                            -- Maximum enemy level (NULL = no max)
    FOREIGN KEY (item_id) REFERENCES items(id)
);

-- ============================================================================
-- NEW TABLES - QUESTS & OBJECTIVES
-- ============================================================================

-- Quest definitions (master quest catalog)
CREATE TABLE IF NOT EXISTS quests (
    id TEXT PRIMARY KEY,                          -- Unique quest identifier
    name TEXT NOT NULL,                           -- Quest name
    description TEXT NOT NULL,                    -- Quest description
    category TEXT NOT NULL,                       -- main, side, daily, event
    difficulty TEXT NOT NULL,                     -- easy, medium, hard, legendary
    min_level INTEGER DEFAULT 1,                  -- Minimum recommended level
    max_level INTEGER,                            -- Maximum recommended level (NULL = no max)

    -- Requirements
    prerequisite_quests JSON DEFAULT '[]',        -- List of required quest IDs
    required_items JSON DEFAULT '[]',             -- Items needed to start

    -- Rewards
    reward_xp INTEGER DEFAULT 0,                  -- Experience reward
    reward_gold INTEGER DEFAULT 0,                -- Gold reward
    reward_items JSON DEFAULT '[]',               -- Item rewards [{item_id, quantity}]
    reward_divine_favor JSON DEFAULT '{}',        -- Divine favor changes {god: amount}

    -- Quest content
    objectives JSON NOT NULL,                     -- List of objectives
    story_text TEXT,                              -- Quest narrative
    npc_involved TEXT,                            -- Quest giver/related NPC
    location TEXT,                                -- Quest location

    repeatable BOOLEAN DEFAULT FALSE,             -- Can be repeated
    cooldown_hours INTEGER,                       -- Hours before can repeat (NULL = no cooldown)
    time_limit_hours INTEGER,                     -- Hours to complete (NULL = no limit)

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Player quest progress
CREATE TABLE IF NOT EXISTS player_quests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_id TEXT NOT NULL,
    quest_id TEXT NOT NULL,
    status TEXT DEFAULT 'active',                 -- active, completed, failed, abandoned

    -- Progress tracking
    objectives_completed JSON DEFAULT '[]',       -- List of completed objective IDs
    current_objective TEXT,                       -- Current active objective
    progress_data JSON DEFAULT '{}',              -- Quest-specific progress data

    -- Timestamps
    accepted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    expires_at TIMESTAMP,                         -- For timed quests

    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
    FOREIGN KEY (quest_id) REFERENCES quests(id)
);

-- Quest objective tracking
CREATE TABLE IF NOT EXISTS quest_objectives (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_quest_id INTEGER NOT NULL,
    objective_id TEXT NOT NULL,                   -- Objective identifier within quest
    objective_type TEXT NOT NULL,                 -- kill, collect, talk, explore, escort, etc
    target TEXT NOT NULL,                         -- What to do (enemy name, item id, location, etc)
    required_amount INTEGER DEFAULT 1,            -- How many needed
    current_amount INTEGER DEFAULT 0,             -- Current progress
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP,
    FOREIGN KEY (player_quest_id) REFERENCES player_quests(id) ON DELETE CASCADE
);

-- ============================================================================
-- NEW TABLES - ACHIEVEMENTS
-- ============================================================================

-- Achievement definitions
CREATE TABLE IF NOT EXISTS achievements (
    id TEXT PRIMARY KEY,                          -- Unique achievement identifier
    name TEXT NOT NULL,                           -- Achievement name
    description TEXT NOT NULL,                    -- What you need to do
    category TEXT NOT NULL,                       -- combat, exploration, social, progression, collection, special
    tier TEXT DEFAULT 'bronze',                   -- bronze, silver, gold, platinum, divine
    points INTEGER DEFAULT 10,                    -- Achievement points

    -- Requirements (checked programmatically)
    requirement_type TEXT NOT NULL,               -- stat_threshold, quest_complete, kill_count, collection, etc
    requirement_data JSON NOT NULL,               -- Specific requirements

    -- Rewards
    reward_xp INTEGER DEFAULT 0,
    reward_gold INTEGER DEFAULT 0,
    reward_items JSON DEFAULT '[]',               -- Item rewards
    reward_title TEXT,                            -- Title granted

    hidden BOOLEAN DEFAULT FALSE,                 -- Hidden until unlocked
    icon TEXT DEFAULT '🏆',                       -- Display icon
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Player achievements
CREATE TABLE IF NOT EXISTS player_achievements (
    player_id TEXT NOT NULL,
    achievement_id TEXT NOT NULL,
    progress INTEGER DEFAULT 0,                   -- Progress towards achievement
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP,
    PRIMARY KEY (player_id, achievement_id),
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
    FOREIGN KEY (achievement_id) REFERENCES achievements(id)
);

-- ============================================================================
-- NEW TABLES - BATTLE PASS / SEASON PASS
-- ============================================================================

-- Battle Pass seasons
CREATE TABLE IF NOT EXISTS battle_pass_seasons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,                           -- Season name (e.g., "Season 1: Divine Awakening")
    description TEXT,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    max_level INTEGER DEFAULT 50,                 -- Maximum battle pass level
    free_track BOOLEAN DEFAULT TRUE,              -- Has free rewards
    premium_track BOOLEAN DEFAULT TRUE,           -- Has premium rewards
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Battle Pass tier rewards
CREATE TABLE IF NOT EXISTS battle_pass_rewards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    season_id INTEGER NOT NULL,
    tier_level INTEGER NOT NULL,                  -- Which level unlocks this
    track TEXT NOT NULL,                          -- free or premium
    reward_type TEXT NOT NULL,                    -- xp, gold, item, cosmetic, title
    reward_data JSON NOT NULL,                    -- {item_id, quantity} or {title: "name"}
    FOREIGN KEY (season_id) REFERENCES battle_pass_seasons(id) ON DELETE CASCADE
);

-- Player battle pass progress
CREATE TABLE IF NOT EXISTS player_battle_pass (
    player_id TEXT NOT NULL,
    season_id INTEGER NOT NULL,
    current_level INTEGER DEFAULT 1,              -- Current battle pass level
    current_xp INTEGER DEFAULT 0,                 -- XP toward next level
    has_premium BOOLEAN DEFAULT FALSE,            -- Purchased premium track

    -- Rewards claimed
    claimed_rewards JSON DEFAULT '[]',            -- List of reward IDs claimed

    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (player_id, season_id),
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
    FOREIGN KEY (season_id) REFERENCES battle_pass_seasons(id) ON DELETE CASCADE
);

-- ============================================================================
-- NEW TABLES - DAILY REWARDS & LOGIN BONUSES
-- ============================================================================

-- Daily reward calendar definitions
CREATE TABLE IF NOT EXISTS daily_reward_calendars (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,                           -- Calendar name
    duration_days INTEGER NOT NULL,               -- How many days in the cycle
    repeats BOOLEAN DEFAULT TRUE,                 -- Repeats after completion
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Daily reward tier definitions
CREATE TABLE IF NOT EXISTS daily_rewards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    calendar_id INTEGER NOT NULL,
    day_number INTEGER NOT NULL,                  -- Day 1, 2, 3, etc
    reward_type TEXT NOT NULL,                    -- xp, gold, item, random_item
    reward_data JSON NOT NULL,                    -- Reward details
    is_bonus_day BOOLEAN DEFAULT FALSE,           -- Special bonus (day 7, etc)
    FOREIGN KEY (calendar_id) REFERENCES daily_reward_calendars(id) ON DELETE CASCADE
);

-- Player daily reward tracking
CREATE TABLE IF NOT EXISTS player_daily_rewards (
    player_id TEXT NOT NULL,
    calendar_id INTEGER NOT NULL,
    current_day INTEGER DEFAULT 1,                -- Current day in sequence
    total_days_claimed INTEGER DEFAULT 0,         -- Lifetime days claimed
    streak_days INTEGER DEFAULT 0,                -- Current login streak
    longest_streak INTEGER DEFAULT 0,             -- Best streak

    last_claimed_at TIMESTAMP,                    -- When last reward was claimed
    streak_broken_at TIMESTAMP,                   -- When streak was broken (if applicable)

    PRIMARY KEY (player_id, calendar_id),
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
    FOREIGN KEY (calendar_id) REFERENCES daily_reward_calendars(id) ON DELETE CASCADE
);

-- ============================================================================
-- NEW TABLES - PLAYER STATISTICS & TRACKING
-- ============================================================================

-- Player statistics (lifetime tracking)
CREATE TABLE IF NOT EXISTS player_statistics (
    player_id TEXT PRIMARY KEY,

    -- Combat stats
    monsters_killed INTEGER DEFAULT 0,
    bosses_defeated INTEGER DEFAULT 0,
    damage_dealt INTEGER DEFAULT 0,
    damage_taken INTEGER DEFAULT 0,
    deaths INTEGER DEFAULT 0,

    -- Progression stats
    total_quests_completed INTEGER DEFAULT 0,
    main_quests_completed INTEGER DEFAULT 0,
    side_quests_completed INTEGER DEFAULT 0,
    daily_quests_completed INTEGER DEFAULT 0,

    -- Economic stats
    total_gold_earned INTEGER DEFAULT 0,
    total_gold_spent INTEGER DEFAULT 0,
    items_looted INTEGER DEFAULT 0,
    items_crafted INTEGER DEFAULT 0,
    items_sold INTEGER DEFAULT 0,

    -- Social stats
    npcs_befriended INTEGER DEFAULT 0,
    npcs_betrayed INTEGER DEFAULT 0,
    divine_councils_attended INTEGER DEFAULT 0,

    -- Time stats
    total_play_time_minutes INTEGER DEFAULT 0,
    sessions_played INTEGER DEFAULT 0,

    -- Misc stats
    locations_discovered INTEGER DEFAULT 0,
    secrets_found INTEGER DEFAULT 0,

    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
);

-- ============================================================================
-- NEW TABLES - TITLES & COSMETICS
-- ============================================================================

-- Available titles
CREATE TABLE IF NOT EXISTS titles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,                           -- Title text
    description TEXT,                             -- How to earn it
    rarity TEXT DEFAULT 'common',                 -- common, rare, epic, legendary
    source TEXT,                                  -- achievement, quest, event, purchase
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Player titles
CREATE TABLE IF NOT EXISTS player_titles (
    player_id TEXT NOT NULL,
    title_id TEXT NOT NULL,
    is_equipped BOOLEAN DEFAULT FALSE,            -- Currently displayed
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (player_id, title_id),
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
    FOREIGN KEY (title_id) REFERENCES titles(id)
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Existing indexes
CREATE INDEX IF NOT EXISTS idx_games_code ON games(code);
CREATE INDEX IF NOT EXISTS idx_games_phase ON games(phase);
CREATE INDEX IF NOT EXISTS idx_players_game ON players(game_id);
CREATE INDEX IF NOT EXISTS idx_players_status ON players(status);
CREATE INDEX IF NOT EXISTS idx_whispers_game ON sensory_whispers(game_id, turn);
CREATE INDEX IF NOT EXISTS idx_history_game ON game_history(game_id, turn);
CREATE INDEX IF NOT EXISTS idx_npcs_game ON npcs(game_id);

-- New indexes for inventory
CREATE INDEX IF NOT EXISTS idx_inventory_player ON player_inventory(player_id);
CREATE INDEX IF NOT EXISTS idx_inventory_item ON player_inventory(item_id);
CREATE INDEX IF NOT EXISTS idx_equipment_player ON player_equipment(player_id);
CREATE INDEX IF NOT EXISTS idx_loot_enemy ON loot_tables(enemy_type);

-- New indexes for quests
CREATE INDEX IF NOT EXISTS idx_quests_category ON quests(category);
CREATE INDEX IF NOT EXISTS idx_player_quests_status ON player_quests(status);
CREATE INDEX IF NOT EXISTS idx_player_quests_player ON player_quests(player_id);

-- New indexes for achievements
CREATE INDEX IF NOT EXISTS idx_achievements_category ON achievements(category);
CREATE INDEX IF NOT EXISTS idx_player_achievements_player ON player_achievements(player_id);
CREATE INDEX IF NOT EXISTS idx_player_achievements_completed ON player_achievements(completed);

-- New indexes for battle pass
CREATE INDEX IF NOT EXISTS idx_battle_pass_seasons_active ON battle_pass_seasons(is_active);
CREATE INDEX IF NOT EXISTS idx_player_battle_pass_player ON player_battle_pass(player_id);

-- New indexes for daily rewards
CREATE INDEX IF NOT EXISTS idx_daily_rewards_calendar ON daily_rewards(calendar_id, day_number);
CREATE INDEX IF NOT EXISTS idx_player_daily_rewards_player ON player_daily_rewards(player_id);

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
