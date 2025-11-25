import { defineConfig } from '@playwright/test';

/**
 * Playwright Configuration for Unit Tests
 * No server required - tests run against service modules directly
 */
export default defineConfig({
  testDir: './tests',
  testMatch: ['**/battle/*.test.ts', '**/aigm/*.test.ts'],
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'playwright-report/unit' }],
    ['list']
  ],
  outputDir: 'test-results/unit',
  use: {
    trace: 'on-first-retry'
  }
  // No webServer needed for unit tests
});
