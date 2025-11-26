require('dotenv').config();
const Database = require('better-sqlite3');
const path = require('path');

async function testConnection() {
  console.log('Testing SQLite database connection...');
  console.log('DB_TYPE:', process.env.DB_TYPE || 'sqlite');

  const dbPath = path.join(process.cwd(), 'arcane_codex.db');
  console.log('DB_PATH:', dbPath);

  try {
    const db = new Database(dbPath);
    console.log('✅ Connection successful!');

    // Test query
    const result = db.prepare('SELECT 1 as test').get();
    console.log('Result:', result);

    // Check tables
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    console.log('Tables:', tables.map(t => t.name).join(', '));

    db.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();
