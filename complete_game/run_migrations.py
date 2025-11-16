#!/usr/bin/env python3
"""
Database Migration Runner for The Arcane Codex
Manages database schema migrations for production deployments
"""
import os
import sys
import sqlite3
import logging
from pathlib import Path
from datetime import datetime
from typing import List, Tuple

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)


class MigrationManager:
    """Manages database migrations"""

    def __init__(self, db_path: str, migrations_dir: str = 'migrations'):
        self.db_path = db_path
        self.migrations_dir = Path(migrations_dir)
        self.migrations_dir.mkdir(exist_ok=True)

    def get_connection(self) -> sqlite3.Connection:
        """Get database connection"""
        return sqlite3.connect(self.db_path)

    def initialize_migrations_table(self):
        """Create migrations tracking table if it doesn't exist"""
        conn = self.get_connection()
        cursor = conn.cursor()

        try:
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS schema_migrations (
                    migration_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    version TEXT UNIQUE NOT NULL,
                    name TEXT NOT NULL,
                    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    checksum TEXT
                )
            """)
            conn.commit()
            logger.info("Migrations table initialized")
        except Exception as e:
            logger.error(f"Error initializing migrations table: {e}")
            conn.rollback()
            raise
        finally:
            conn.close()

    def get_applied_migrations(self) -> List[str]:
        """Get list of applied migration versions"""
        conn = self.get_connection()
        cursor = conn.cursor()

        try:
            cursor.execute("SELECT version FROM schema_migrations ORDER BY version")
            return [row[0] for row in cursor.fetchall()]
        except sqlite3.OperationalError:
            # Table doesn't exist yet
            return []
        finally:
            conn.close()

    def get_pending_migrations(self) -> List[Tuple[str, Path]]:
        """Get list of pending migrations to apply"""
        applied = set(self.get_applied_migrations())
        all_migrations = []

        # Find all .sql files in migrations directory
        for migration_file in sorted(self.migrations_dir.glob('*.sql')):
            version = migration_file.stem
            if version not in applied:
                all_migrations.append((version, migration_file))

        return all_migrations

    def apply_migration(self, version: str, migration_file: Path) -> bool:
        """Apply a single migration"""
        logger.info(f"Applying migration: {version}")

        conn = self.get_connection()
        cursor = conn.cursor()

        try:
            # Read migration file
            with open(migration_file, 'r') as f:
                migration_sql = f.read()

            # Calculate checksum
            import hashlib
            checksum = hashlib.sha256(migration_sql.encode()).hexdigest()

            # Apply migration
            cursor.executescript(migration_sql)

            # Record migration
            cursor.execute(
                "INSERT INTO schema_migrations (version, name, checksum) VALUES (?, ?, ?)",
                (version, migration_file.name, checksum)
            )

            conn.commit()
            logger.info(f"Successfully applied migration: {version}")
            return True

        except Exception as e:
            logger.error(f"Error applying migration {version}: {e}")
            conn.rollback()
            return False
        finally:
            conn.close()

    def rollback_migration(self, version: str) -> bool:
        """Rollback a migration (if rollback file exists)"""
        rollback_file = self.migrations_dir / f"{version}.rollback.sql"

        if not rollback_file.exists():
            logger.error(f"No rollback file found for migration {version}")
            return False

        logger.info(f"Rolling back migration: {version}")

        conn = self.get_connection()
        cursor = conn.cursor()

        try:
            # Read rollback file
            with open(rollback_file, 'r') as f:
                rollback_sql = f.read()

            # Apply rollback
            cursor.executescript(rollback_sql)

            # Remove migration record
            cursor.execute("DELETE FROM schema_migrations WHERE version = ?", (version,))

            conn.commit()
            logger.info(f"Successfully rolled back migration: {version}")
            return True

        except Exception as e:
            logger.error(f"Error rolling back migration {version}: {e}")
            conn.rollback()
            return False
        finally:
            conn.close()

    def create_migration(self, name: str) -> Path:
        """Create a new migration file template"""
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        version = f"{timestamp}_{name}"
        migration_file = self.migrations_dir / f"{version}.sql"
        rollback_file = self.migrations_dir / f"{version}.rollback.sql"

        # Migration template
        migration_template = f"""-- Migration: {name}
-- Created: {datetime.now().isoformat()}
-- Version: {version}

-- Add your migration SQL here
-- Example:
-- CREATE TABLE new_table (
--     id INTEGER PRIMARY KEY,
--     name TEXT NOT NULL
-- );

-- CREATE INDEX idx_new_table_name ON new_table(name);
"""

        # Rollback template
        rollback_template = f"""-- Rollback for migration: {name}
-- Version: {version}

-- Add rollback SQL here (reverse of migration)
-- Example:
-- DROP INDEX IF EXISTS idx_new_table_name;
-- DROP TABLE IF EXISTS new_table;
"""

        with open(migration_file, 'w') as f:
            f.write(migration_template)

        with open(rollback_file, 'w') as f:
            f.write(rollback_template)

        logger.info(f"Created migration files:")
        logger.info(f"  Migration: {migration_file}")
        logger.info(f"  Rollback:  {rollback_file}")

        return migration_file

    def status(self):
        """Show migration status"""
        applied = self.get_applied_migrations()
        pending = self.get_pending_migrations()

        logger.info("=" * 80)
        logger.info("Migration Status")
        logger.info("=" * 80)

        logger.info(f"\nApplied migrations: {len(applied)}")
        for version in applied:
            logger.info(f"  ✓ {version}")

        logger.info(f"\nPending migrations: {len(pending)}")
        for version, path in pending:
            logger.info(f"  ○ {version}")

        logger.info("\n" + "=" * 80)

    def migrate(self) -> bool:
        """Run all pending migrations"""
        pending = self.get_pending_migrations()

        if not pending:
            logger.info("No pending migrations")
            return True

        logger.info(f"Found {len(pending)} pending migration(s)")

        for version, migration_file in pending:
            if not self.apply_migration(version, migration_file):
                logger.error("Migration failed, stopping")
                return False

        logger.info("All migrations applied successfully")
        return True


def main():
    """Main entry point"""
    import argparse

    parser = argparse.ArgumentParser(description='Database Migration Manager')
    parser.add_argument(
        '--db',
        default=os.getenv('DB_PATH', 'arcane_codex.db'),
        help='Database path'
    )
    parser.add_argument(
        '--migrations-dir',
        default='migrations',
        help='Migrations directory'
    )

    subparsers = parser.add_subparsers(dest='command', help='Command to run')

    # migrate command
    subparsers.add_parser('migrate', help='Run pending migrations')

    # status command
    subparsers.add_parser('status', help='Show migration status')

    # create command
    create_parser = subparsers.add_parser('create', help='Create new migration')
    create_parser.add_argument('name', help='Migration name')

    # rollback command
    rollback_parser = subparsers.add_parser('rollback', help='Rollback last migration')
    rollback_parser.add_argument('--version', help='Specific version to rollback')

    args = parser.parse_args()

    # Initialize manager
    manager = MigrationManager(args.db, args.migrations_dir)
    manager.initialize_migrations_table()

    # Execute command
    if args.command == 'migrate':
        success = manager.migrate()
        sys.exit(0 if success else 1)

    elif args.command == 'status':
        manager.status()
        sys.exit(0)

    elif args.command == 'create':
        manager.create_migration(args.name)
        sys.exit(0)

    elif args.command == 'rollback':
        if args.version:
            success = manager.rollback_migration(args.version)
        else:
            applied = manager.get_applied_migrations()
            if not applied:
                logger.error("No migrations to rollback")
                sys.exit(1)
            success = manager.rollback_migration(applied[-1])

        sys.exit(0 if success else 1)

    else:
        parser.print_help()
        sys.exit(1)


if __name__ == '__main__':
    main()
