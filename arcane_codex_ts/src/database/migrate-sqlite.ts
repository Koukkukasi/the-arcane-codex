/**
 * SQLite Migration Runner
 * Applies migrations to SQLite database
 */
import { SQLiteConnection } from './sqlite-connection';
import fs from 'fs';
import path from 'path';

async function runMigrations() {
  console.log('🔄 Running SQLite migrations...');

  const db = SQLiteConnection.getInstance();
  await db.connect();

  // Migration files in order
  const migrationFiles = [
    '001_initial_schema.sqlite.sql',
    '002_refresh_tokens.sqlite.sql'
  ];

  const connection = db.getRawDb();

  for (const filename of migrationFiles) {
    console.log(`  Running migration: ${filename}`);
    const migrationFile = path.join(__dirname, 'migrations', filename);

    if (!fs.existsSync(migrationFile)) {
      console.log(`  ⚠️  Migration file not found: ${filename}, skipping...`);
      continue;
    }

    const sql = fs.readFileSync(migrationFile, 'utf-8');

    // Execute entire SQL file at once (SQLite supports this)
    try {
      // Better-sqlite3 can execute multiple statements with exec
      if (connection && connection.exec) {
        connection.exec(sql);
      } else {
        // Fallback: split carefully and execute
        const statements = sql
          .split(/;\s*\n/)
          .map(s => s.trim())
          .filter(s => s.length > 0 && !s.match(/^(--|PRAGMA)/));

        for (const statement of statements) {
          try {
            await db.query(statement + ';');
          } catch (error: any) {
            if (!error.message.includes('already exists')) {
              console.error('Migration error:', statement.substring(0, 100));
              throw error;
            }
          }
        }
      }
      console.log(`  ✅ ${filename} applied`);
    } catch (error: any) {
      if (!error.message.includes('already exists')) {
        throw error;
      }
      console.log(`  ✅ ${filename} already applied`);
    }
  }

  console.log('✅ All SQLite migrations complete!');
  await db.disconnect();
}

if (require.main === module) {
  runMigrations().catch(error => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  });
}

export { runMigrations };
