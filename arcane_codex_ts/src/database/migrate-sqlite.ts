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

  const migrationFile = path.join(__dirname, 'migrations', '001_initial_schema.sqlite.sql');
  const sql = fs.readFileSync(migrationFile, 'utf-8');

  // Execute entire SQL file at once (SQLite supports this)
  try {
    // Better-sqlite3 can execute multiple statements with exec
    const connection = db.getRawDb();
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
  } catch (error: any) {
    if (!error.message.includes('already exists')) {
      throw error;
    }
  }

  console.log('✅ SQLite migrations complete!');
  await db.disconnect();
}

if (require.main === module) {
  runMigrations().catch(error => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  });
}

export { runMigrations };
