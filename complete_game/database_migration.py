"""
Database Migration Script for The Arcane Codex
Adds new tables for inventory, quests, achievements, battle pass, and daily rewards
"""

import sqlite3
import os
from datetime import datetime, timedelta

def migrate_database(db_path="arcane_codex.db"):
    """
    Apply database migrations to add new tables
    """
    print(f"Starting database migration for {db_path}...")

    # Backup the database first
    if os.path.exists(db_path):
        backup_path = f"{db_path}.backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        import shutil
        shutil.copy2(db_path, backup_path)
        print(f"[OK] Database backed up to {backup_path}")

    # Connect to database
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    try:
        # Enable foreign keys
        cursor.execute("PRAGMA foreign_keys = ON")

        print("\nApplying migrations...")

        # ========== INVENTORY TABLES ==========
        print("  • Creating items table...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS items (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT NOT NULL,
                type TEXT NOT NULL,
                rarity TEXT NOT NULL,
                value INTEGER DEFAULT 0,
                level_requirement INTEGER DEFAULT 1,
                class_requirement TEXT,
                stackable BOOLEAN DEFAULT FALSE,
                max_stack INTEGER DEFAULT 1,
                icon TEXT DEFAULT '📦',
                slot TEXT,
                durability INTEGER,
                max_durability INTEGER,
                stats JSON DEFAULT '{}',
                effects JSON DEFAULT '{}',
                enchantments JSON DEFAULT '[]',
                effect_type TEXT,
                effect_value INTEGER,
                effect_duration INTEGER,
                cooldown INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        print("  • Creating player_inventory table...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS player_inventory (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                player_id TEXT NOT NULL,
                item_id TEXT NOT NULL,
                quantity INTEGER DEFAULT 1,
                slot_index INTEGER,
                custom_name TEXT,
                current_durability INTEGER,
                bound_to_player BOOLEAN DEFAULT FALSE,
                acquired_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
                FOREIGN KEY (item_id) REFERENCES items(id)
            )
        """)

        print("  • Creating player_equipment table...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS player_equipment (
                player_id TEXT NOT NULL,
                slot TEXT NOT NULL,
                item_id TEXT NOT NULL,
                inventory_id INTEGER NOT NULL,
                equipped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (player_id, slot),
                FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
                FOREIGN KEY (item_id) REFERENCES items(id),
                FOREIGN KEY (inventory_id) REFERENCES player_inventory(id) ON DELETE CASCADE
            )
        """)

        print("  • Creating loot_tables table...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS loot_tables (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                enemy_type TEXT NOT NULL,
                item_id TEXT NOT NULL,
                drop_chance REAL NOT NULL,
                min_quantity INTEGER DEFAULT 1,
                max_quantity INTEGER DEFAULT 1,
                min_level INTEGER DEFAULT 1,
                max_level INTEGER,
                FOREIGN KEY (item_id) REFERENCES items(id)
            )
        """)

        # ========== QUEST TABLES ==========
        print("  • Creating quests table...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS quests (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT NOT NULL,
                category TEXT NOT NULL,
                difficulty TEXT NOT NULL,
                min_level INTEGER DEFAULT 1,
                max_level INTEGER,
                prerequisite_quests JSON DEFAULT '[]',
                required_items JSON DEFAULT '[]',
                reward_xp INTEGER DEFAULT 0,
                reward_gold INTEGER DEFAULT 0,
                reward_items JSON DEFAULT '[]',
                reward_divine_favor JSON DEFAULT '{}',
                objectives JSON NOT NULL,
                story_text TEXT,
                npc_involved TEXT,
                location TEXT,
                repeatable BOOLEAN DEFAULT FALSE,
                cooldown_hours INTEGER,
                time_limit_hours INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        print("  • Creating player_quests table...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS player_quests (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                player_id TEXT NOT NULL,
                quest_id TEXT NOT NULL,
                status TEXT DEFAULT 'active',
                objectives_completed JSON DEFAULT '[]',
                current_objective TEXT,
                progress_data JSON DEFAULT '{}',
                accepted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                completed_at TIMESTAMP,
                expires_at TIMESTAMP,
                FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
                FOREIGN KEY (quest_id) REFERENCES quests(id)
            )
        """)

        print("  • Creating quest_objectives table...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS quest_objectives (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                player_quest_id INTEGER NOT NULL,
                objective_id TEXT NOT NULL,
                objective_type TEXT NOT NULL,
                target TEXT NOT NULL,
                required_amount INTEGER DEFAULT 1,
                current_amount INTEGER DEFAULT 0,
                completed BOOLEAN DEFAULT FALSE,
                completed_at TIMESTAMP,
                FOREIGN KEY (player_quest_id) REFERENCES player_quests(id) ON DELETE CASCADE
            )
        """)

        # ========== ACHIEVEMENT TABLES ==========
        print("  • Creating achievements table...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS achievements (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT NOT NULL,
                category TEXT NOT NULL,
                tier TEXT DEFAULT 'bronze',
                points INTEGER DEFAULT 10,
                requirement_type TEXT NOT NULL,
                requirement_data JSON NOT NULL,
                reward_xp INTEGER DEFAULT 0,
                reward_gold INTEGER DEFAULT 0,
                reward_items JSON DEFAULT '[]',
                reward_title TEXT,
                hidden BOOLEAN DEFAULT FALSE,
                icon TEXT DEFAULT '🏆',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        print("  • Creating player_achievements table...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS player_achievements (
                player_id TEXT NOT NULL,
                achievement_id TEXT NOT NULL,
                progress INTEGER DEFAULT 0,
                completed BOOLEAN DEFAULT FALSE,
                completed_at TIMESTAMP,
                PRIMARY KEY (player_id, achievement_id),
                FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
                FOREIGN KEY (achievement_id) REFERENCES achievements(id)
            )
        """)

        # ========== BATTLE PASS TABLES ==========
        print("  • Creating battle_pass_seasons table...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS battle_pass_seasons (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                description TEXT,
                start_date TIMESTAMP NOT NULL,
                end_date TIMESTAMP NOT NULL,
                max_level INTEGER DEFAULT 50,
                free_track BOOLEAN DEFAULT TRUE,
                premium_track BOOLEAN DEFAULT TRUE,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        print("  • Creating battle_pass_rewards table...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS battle_pass_rewards (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                season_id INTEGER NOT NULL,
                tier_level INTEGER NOT NULL,
                track TEXT NOT NULL,
                reward_type TEXT NOT NULL,
                reward_data JSON NOT NULL,
                FOREIGN KEY (season_id) REFERENCES battle_pass_seasons(id) ON DELETE CASCADE
            )
        """)

        print("  • Creating player_battle_pass table...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS player_battle_pass (
                player_id TEXT NOT NULL,
                season_id INTEGER NOT NULL,
                current_level INTEGER DEFAULT 1,
                current_xp INTEGER DEFAULT 0,
                has_premium BOOLEAN DEFAULT FALSE,
                claimed_rewards JSON DEFAULT '[]',
                started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (player_id, season_id),
                FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
                FOREIGN KEY (season_id) REFERENCES battle_pass_seasons(id) ON DELETE CASCADE
            )
        """)

        # ========== DAILY REWARD TABLES ==========
        print("  • Creating daily_reward_calendars table...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS daily_reward_calendars (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                duration_days INTEGER NOT NULL,
                repeats BOOLEAN DEFAULT TRUE,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        print("  • Creating daily_rewards table...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS daily_rewards (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                calendar_id INTEGER NOT NULL,
                day_number INTEGER NOT NULL,
                reward_type TEXT NOT NULL,
                reward_data JSON NOT NULL,
                is_bonus_day BOOLEAN DEFAULT FALSE,
                FOREIGN KEY (calendar_id) REFERENCES daily_reward_calendars(id) ON DELETE CASCADE
            )
        """)

        print("  • Creating player_daily_rewards table...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS player_daily_rewards (
                player_id TEXT NOT NULL,
                calendar_id INTEGER NOT NULL,
                current_day INTEGER DEFAULT 1,
                total_days_claimed INTEGER DEFAULT 0,
                streak_days INTEGER DEFAULT 0,
                longest_streak INTEGER DEFAULT 0,
                last_claimed_at TIMESTAMP,
                streak_broken_at TIMESTAMP,
                PRIMARY KEY (player_id, calendar_id),
                FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
                FOREIGN KEY (calendar_id) REFERENCES daily_reward_calendars(id) ON DELETE CASCADE
            )
        """)

        # ========== STATISTICS TABLES ==========
        print("  • Creating player_statistics table...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS player_statistics (
                player_id TEXT PRIMARY KEY,
                monsters_killed INTEGER DEFAULT 0,
                bosses_defeated INTEGER DEFAULT 0,
                damage_dealt INTEGER DEFAULT 0,
                damage_taken INTEGER DEFAULT 0,
                deaths INTEGER DEFAULT 0,
                total_quests_completed INTEGER DEFAULT 0,
                main_quests_completed INTEGER DEFAULT 0,
                side_quests_completed INTEGER DEFAULT 0,
                daily_quests_completed INTEGER DEFAULT 0,
                total_gold_earned INTEGER DEFAULT 0,
                total_gold_spent INTEGER DEFAULT 0,
                items_looted INTEGER DEFAULT 0,
                items_crafted INTEGER DEFAULT 0,
                items_sold INTEGER DEFAULT 0,
                npcs_befriended INTEGER DEFAULT 0,
                npcs_betrayed INTEGER DEFAULT 0,
                divine_councils_attended INTEGER DEFAULT 0,
                total_play_time_minutes INTEGER DEFAULT 0,
                sessions_played INTEGER DEFAULT 0,
                locations_discovered INTEGER DEFAULT 0,
                secrets_found INTEGER DEFAULT 0,
                FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
            )
        """)

        # ========== TITLES TABLES ==========
        print("  • Creating titles table...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS titles (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT,
                rarity TEXT DEFAULT 'common',
                source TEXT,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        print("  • Creating player_titles table...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS player_titles (
                player_id TEXT NOT NULL,
                title_id TEXT NOT NULL,
                is_equipped BOOLEAN DEFAULT FALSE,
                unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (player_id, title_id),
                FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
                FOREIGN KEY (title_id) REFERENCES titles(id)
            )
        """)

        # ========== CREATE INDEXES ==========
        print("\nCreating indexes for performance...")

        indexes = [
            # Inventory indexes
            ("idx_inventory_player", "player_inventory(player_id)"),
            ("idx_inventory_item", "player_inventory(item_id)"),
            ("idx_equipment_player", "player_equipment(player_id)"),
            ("idx_loot_enemy", "loot_tables(enemy_type)"),

            # Quest indexes
            ("idx_quests_category", "quests(category)"),
            ("idx_player_quests_status", "player_quests(status)"),
            ("idx_player_quests_player", "player_quests(player_id)"),

            # Achievement indexes
            ("idx_achievements_category", "achievements(category)"),
            ("idx_player_achievements_player", "player_achievements(player_id)"),
            ("idx_player_achievements_completed", "player_achievements(completed)"),

            # Battle pass indexes
            ("idx_battle_pass_seasons_active", "battle_pass_seasons(is_active)"),
            ("idx_player_battle_pass_player", "player_battle_pass(player_id)"),

            # Daily reward indexes
            ("idx_daily_rewards_calendar", "daily_rewards(calendar_id, day_number)"),
            ("idx_player_daily_rewards_player", "player_daily_rewards(player_id)"),
        ]

        for index_name, index_def in indexes:
            cursor.execute(f"CREATE INDEX IF NOT EXISTS {index_name} ON {index_def}")
            print(f"  - Created index: {index_name}")

        # Commit all changes
        conn.commit()
        print("\n[OK] Migration completed successfully!")

        # Display table count
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
        tables = cursor.fetchall()
        print(f"\nTotal tables in database: {len(tables)}")
        for table in tables:
            print(f"  - {table[0]}")

        return True

    except Exception as e:
        print(f"\n[ERROR] Migration failed: {e}")
        conn.rollback()
        return False

    finally:
        conn.close()

if __name__ == "__main__":
    # Run migration
    success = migrate_database("arcane_codex.db")

    if success:
        print("\n" + "="*60)
        print("Database migration completed successfully!")
        print("="*60)
    else:
        print("\n" + "="*60)
        print("Database migration failed. Check error messages above.")
        print("="*60)
