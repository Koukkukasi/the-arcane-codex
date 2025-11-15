// ============================================================================
// Playwright Configuration for The Arcane Codex
// ============================================================================

const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
    testDir: './tests',

    // Longer timeout for AI generation
    timeout: 120000,
    expect: {
        timeout: 30000
    },

    // Fail fast if a test fails
    fullyParallel: false,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : 2,

    // Reporter
    reporter: [
        ['html', { outputFolder: 'test-results/html' }],
        ['list']
    ],

    use: {
        // Base URL
        baseURL: 'http://localhost:5000',

        // Artifacts
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',

        // Viewport
        viewport: { width: 1280, height: 720 },

        // Ignore HTTPS errors (for local dev)
        ignoreHTTPSErrors: true,
    },

    // Test projects for different browsers
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },

        // Uncomment to test on Firefox and WebKit
        // {
        //     name: 'firefox',
        //     use: { ...devices['Desktop Firefox'] },
        // },
        // {
        //     name: 'webkit',
        //     use: { ...devices['Desktop Safari'] },
        // },

        // Test on mobile viewports
        // {
        //     name: 'Mobile Chrome',
        //     use: { ...devices['Pixel 5'] },
        // },
        // {
        //     name: 'Mobile Safari',
        //     use: { ...devices['iPhone 12'] },
        // },
    ],

    // Web server
    webServer: {
        command: 'python web_game.py',
        url: 'http://localhost:5000',
        reuseExistingServer: !process.env.CI,
        timeout: 30000,
        stdout: 'pipe',
        stderr: 'pipe',
    },
});
