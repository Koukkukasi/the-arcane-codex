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
    ['html', { outputFolder: 'playwright-report' }],
    ['list']
  ],
  outputDir: 'test-results',
  use: {
    baseURL: 'http://localhost:5000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },

  projects: [
    {
      name: 'unit-tests',
      testMatch: '**/battle/*.test.ts',
      use: {
        // No browser or server needed for unit tests
      }
    },
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
    },
    {
      name: 'multiplayer-ui',
      testMatch: '**/ui/*.test.ts',
      use: {
        ...devices['Desktop Chrome']
      }
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
