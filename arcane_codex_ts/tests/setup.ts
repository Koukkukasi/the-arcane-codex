/**
 * Test Setup
 * Loads environment variables before tests run
 */
import { config } from 'dotenv';
import { resolve } from 'path';

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
}
