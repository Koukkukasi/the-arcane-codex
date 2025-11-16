#!/usr/bin/env python3
"""
Database initialization script for production deployment of The Arcane Codex
This script sets up the database with proper schema, indexes, and initial data
"""
import os
import sys
import sqlite3
import logging
from pathlib import Path
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('/var/log/arcane-codex/db_init.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)


def get_db_path():
    """Get database path from environment or use default"""
    db_path = os.getenv('DB_PATH', '/var/lib/arcane-codex/arcane_codex.db')
    # Ensure directory exists
    Path(db_path).parent.mkdir(parents=True, exist_ok=True)
    return db_path


def check_database_exists(db_path):
    """Check if database already exists"""
    return Path(db_path).exists()


def backup_existing_database(db_path):
    """Create backup of existing database before modification"""
    if not check_database_exists(db_path):
        return None

    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    backup_path = f"{db_path}.backup_{timestamp}"

    import shutil
    shutil.copy2(db_path, backup_path)
    logger.info(f"Created backup at: {backup_path}")
    return backup_path


def initialize_database(db_path):
    """Initialize database with schema"""
    logger.info(f"Initializing database at: {db_path}")

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    try:
        # Read schema from database_schema.sql if it exists
        schema_file = Path(__file__).parent / 'database_schema.sql'
        if schema_file.exists():
            logger.info("Loading schema from database_schema.sql")
            with open(schema_file, 'r') as f:
                schema_sql = f.read()
            cursor.executescript(schema_sql)
        else:
            # Create basic schema if schema file doesn't exist
            logger.info("Creating basic schema")
            cursor.executescript("""
                -- Game sessions table
                CREATE TABLE IF NOT EXISTS game_sessions (
                    session_id TEXT PRIMARY KEY,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    game_state TEXT,
                    player_count INTEGER DEFAULT 0,
                    status TEXT DEFAULT 'active'
                );

                -- Players table
                CREATE TABLE IF NOT EXISTS players (
                    player_id TEXT PRIMARY KEY,
                    session_id TEXT,
                    username TEXT NOT NULL,
                    character_data TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (session_id) REFERENCES game_sessions(session_id)
                );

                -- Game events log
                CREATE TABLE IF NOT EXISTS game_events (
                    event_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    session_id TEXT,
                    event_type TEXT NOT NULL,
                    event_data TEXT,
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (session_id) REFERENCES game_sessions(session_id)
                );

                -- Character inventory
                CREATE TABLE IF NOT EXISTS character_inventory (
                    inventory_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    player_id TEXT,
                    item_data TEXT,
                    quantity INTEGER DEFAULT 1,
                    acquired_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (player_id) REFERENCES players(player_id)
                );

                -- Quests and objectives
                CREATE TABLE IF NOT EXISTS player_quests (
                    quest_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    player_id TEXT,
                    quest_data TEXT,
                    status TEXT DEFAULT 'active',
                    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    completed_at TIMESTAMP,
                    FOREIGN KEY (player_id) REFERENCES players(player_id)
                );
            """)

        # Create indexes for performance
        logger.info("Creating database indexes")
        cursor.executescript("""
            CREATE INDEX IF NOT EXISTS idx_sessions_status ON game_sessions(status);
            CREATE INDEX IF NOT EXISTS idx_sessions_last_active ON game_sessions(last_active);
            CREATE INDEX IF NOT EXISTS idx_players_session ON players(session_id);
            CREATE INDEX IF NOT EXISTS idx_players_last_seen ON players(last_seen);
            CREATE INDEX IF NOT EXISTS idx_events_session ON game_events(session_id);
            CREATE INDEX IF NOT EXISTS idx_events_timestamp ON game_events(timestamp);
            CREATE INDEX IF NOT EXISTS idx_inventory_player ON character_inventory(player_id);
            CREATE INDEX IF NOT EXISTS idx_quests_player ON player_quests(player_id);
            CREATE INDEX IF NOT EXISTS idx_quests_status ON player_quests(status);
        """)

        conn.commit()
        logger.info("Database schema created successfully")

        # Verify tables were created
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = cursor.fetchall()
        logger.info(f"Created tables: {', '.join([t[0] for t in tables])}")

        return True

    except Exception as e:
        logger.error(f"Error initializing database: {e}")
        conn.rollback()
        return False
    finally:
        conn.close()


def optimize_database(db_path):
    """Optimize database for production use"""
    logger.info("Optimizing database for production")

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    try:
        # Set production-optimized PRAGMA settings
        cursor.executescript("""
            PRAGMA journal_mode = WAL;
            PRAGMA synchronous = NORMAL;
            PRAGMA cache_size = -64000;
            PRAGMA temp_store = MEMORY;
            PRAGMA mmap_size = 30000000000;
            PRAGMA page_size = 4096;
            PRAGMA auto_vacuum = INCREMENTAL;
        """)

        # Run VACUUM to optimize storage
        cursor.execute("VACUUM")
        cursor.execute("ANALYZE")

        conn.commit()
        logger.info("Database optimization complete")
        return True

    except Exception as e:
        logger.error(f"Error optimizing database: {e}")
        return False
    finally:
        conn.close()


def verify_database(db_path):
    """Verify database integrity"""
    logger.info("Verifying database integrity")

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    try:
        # Check integrity
        cursor.execute("PRAGMA integrity_check")
        result = cursor.fetchone()

        if result[0] == 'ok':
            logger.info("Database integrity check: OK")
            return True
        else:
            logger.error(f"Database integrity check failed: {result[0]}")
            return False

    except Exception as e:
        logger.error(f"Error verifying database: {e}")
        return False
    finally:
        conn.close()


def main():
    """Main initialization process"""
    logger.info("=" * 80)
    logger.info("The Arcane Codex - Production Database Initialization")
    logger.info("=" * 80)

    # Get database path
    db_path = get_db_path()
    logger.info(f"Database path: {db_path}")

    # Check if database exists
    db_exists = check_database_exists(db_path)

    if db_exists:
        logger.warning("Database already exists!")
        response = input("Do you want to backup and reinitialize? (yes/no): ")
        if response.lower() != 'yes':
            logger.info("Initialization cancelled")
            return 0

        # Backup existing database
        backup_path = backup_existing_database(db_path)
        if backup_path:
            logger.info(f"Backup created: {backup_path}")

    # Initialize database
    if not initialize_database(db_path):
        logger.error("Database initialization failed")
        return 1

    # Optimize database
    if not optimize_database(db_path):
        logger.warning("Database optimization failed (non-critical)")

    # Verify database
    if not verify_database(db_path):
        logger.error("Database verification failed")
        return 1

    # Set proper permissions (Unix-like systems)
    if os.name != 'nt':  # Not Windows
        try:
            os.chmod(db_path, 0o660)
            logger.info("Database permissions set to 660")
        except Exception as e:
            logger.warning(f"Could not set permissions: {e}")

    logger.info("=" * 80)
    logger.info("Database initialization completed successfully!")
    logger.info("=" * 80)
    return 0


if __name__ == '__main__':
    sys.exit(main())
