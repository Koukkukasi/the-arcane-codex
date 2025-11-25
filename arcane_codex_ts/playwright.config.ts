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
  globalSetup: require.resolve('./tests/setup.ts'),
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },

  projects: [
    {
      name: 'database-tests',
      testMatch: '**/database/*.test.ts',
      use: {
        // Database tests don't need browser or web server
      },
      // Don't start webServer for database tests
      webServer: undefined
    },
    {
      name: 'api-tests',
      testMatch: '**/api/*.test.ts',
      use: {
        // API tests use request context
      }
    },
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

  // Start server before tests (only for tests that need it)
  webServer: process.env.SKIP_SERVER ? undefined : {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI
  }
});
