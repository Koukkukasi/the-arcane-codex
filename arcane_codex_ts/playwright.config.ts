import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration for Arcane Codex Multiplayer Tests
 */
export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.test.ts',
  fullyParallel: false, // Run tests sequentially to avoid conflicts
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Single worker to avoid race conditions
  reporter: [
    ['html', { outputFolder: 'test-results/html' }],
    ['list']
  ],
  use: {
    baseURL: 'http://localhost:5000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },

  projects: [
    {
      name: 'multiplayer-api',
      testMatch: '**/party-api.test.ts'
    },
    {
      name: 'multiplayer-socketio',
      testMatch: '**/socketio-multiplayer.test.ts'
    },
    {
      name: 'multiplayer-e2e',
      testMatch: '**/e2e-multiplayer.test.ts'
    }
  ],

  // Start server before tests
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5000/health',
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI
  }
});
