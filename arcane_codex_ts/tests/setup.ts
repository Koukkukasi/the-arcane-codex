/**
 * Test Setup
 * Loads environment variables and resets database before tests run
 */
import { config } from 'dotenv';
import { resolve } from 'path';
import { execSync } from 'child_process';
import * as fs from 'fs';

export default async function globalSetup() {
  // Load .env from project root
  const envPath = resolve(__dirname, '../.env');
  config({ path: envPath });

  // Verify critical variables are loaded
  if (!process.env.DB_PASSWORD) {
    console.error('WARNING: DB_PASSWORD not loaded from .env');
    console.error('Env path:', envPath);
  }

  console.log('✓ Test setup complete - Environment variables loaded');
  console.log(`✓ DB_PASSWORD: ${process.env.DB_PASSWORD?.substring(0, 10)}...`);

  // Reset SQLite database for clean test run
  const dbPath = resolve(__dirname, '../arcane_codex.db');
  try {
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
      console.log('✓ Deleted old database');
    }
  } catch (error: any) {
    // Database might be locked, try to continue anyway
    console.log('⚠️ Could not delete database (may be locked):', error.message);
  }

  // Run migrations to create fresh database
  try {
    execSync('npx tsx src/database/migrate-sqlite.ts', {
      cwd: resolve(__dirname, '..'),
      stdio: 'inherit'
    });
    console.log('✓ Database recreated with fresh schema');
  } catch (error) {
    console.error('ERROR: Failed to recreate database:', error);
    throw error;
  }
}
