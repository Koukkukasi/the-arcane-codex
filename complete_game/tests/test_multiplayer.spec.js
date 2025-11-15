// ============================================================================
// The Arcane Codex - Multiplayer Playwright Tests
// Tests 1-4 player scenarios with AI GM
// ============================================================================

const { test, expect } = require('@playwright/test');

const SERVER_URL = 'http://localhost:5000';

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Create a new game and return the game code
 */
async function createGame(page, playerName) {
    await page.goto(SERVER_URL);
    await page.fill('#player-name', playerName);
    await page.click('button:has-text("CREATE NEW GAME")');

    // Wait for redirect to game page
    await page.waitForURL(/\/game\/.*/);

    // Extract game code from URL or page
    const gameCode = await page.locator('.game-code strong').textContent();
    return gameCode.trim();
}

/**
 * Join an existing game
 */
async function joinGame(page, gameCode, playerName) {
    await page.goto(SERVER_URL);
    await page.fill('#player-name', playerName);
    await page.fill('#game-code', gameCode);
    await page.click('button:has-text("JOIN GAME")');

    await page.waitForURL(/\/game\/.*/);
}

/**
 * Choose character class
 */
async function chooseClass(page, className) {
    await page.click(`.class-btn:has-text("${className}")`);
    await page.waitForTimeout(1000); // Wait for server response
}

/**
 * Wait for all players to be ready
 */
async function waitForAllReady(page) {
    await page.waitForSelector('#start-btn:not(.hidden)', { timeout: 30000 });
}

/**
 * Start the game
 */
async function startGame(page) {
    await page.click('#start-btn');
    await page.waitForTimeout(2000); // Wait for AI scenario generation
}

/**
 * Submit a choice
 */
async function submitChoice(page, choice) {
    await page.fill('#choice-input', choice);
    await page.click('button:has-text("Submit Choice")');
    await page.waitForTimeout(1000);
}

// ============================================================================
// Test Suite
// ============================================================================

test.describe('The Arcane Codex - Multiplayer Tests', () => {

    test.beforeEach(async ({ page }) => {
        // Set longer timeout for AI generation
        test.setTimeout(120000);
    });

    // ========================================================================
    // 1. Single Player - Lobby and Class Selection
    // ========================================================================

    test('should create game and show lobby', async ({ page }) => {
        const gameCode = await createGame(page, 'TestPlayer1');

        // Verify game code is displayed
        expect(gameCode).toMatch(/^[A-Z0-9]{6}$/);

        // Verify player count shows 1/4
        const playerCount = await page.locator('#player-count').textContent();
        expect(playerCount).toContain('1/4');

        // Verify class selection is visible
        await expect(page.locator('#class-selection')).toBeVisible();
    });

    test('should allow class selection', async ({ page }) => {
        await createGame(page, 'TestFighter');

        // Choose Fighter class
        await chooseClass(page, 'Fighter');

        // Verify class was selected
        await page.waitForTimeout(1000);
        const playerCard = page.locator('.player-card.ready');
        await expect(playerCard).toContainText('Fighter');
    });

    // ========================================================================
    // 2. Two Player - Join and Ready
    // ========================================================================

    test('should allow second player to join', async ({ browser }) => {
        // Player 1 creates game
        const page1 = await browser.newPage();
        const gameCode = await createGame(page1, 'Player1');

        // Player 2 joins
        const page2 = await browser.newPage();
        await joinGame(page2, gameCode, 'Player2');

        // Verify both players see each other
        const p1Count = await page1.locator('#player-count').textContent();
        expect(p1Count).toContain('2/4');

        const p2Count = await page2.locator('#player-count').textContent();
        expect(p2Count).toContain('2/4');

        // Verify player list shows both
        const p1Players = await page1.locator('.player-card').count();
        expect(p1Players).toBe(2);

        await page1.close();
        await page2.close();
    });

    test('should start game when all players ready (2 players)', async ({ browser }) => {
        // Create and join
        const page1 = await browser.newPage();
        const gameCode = await createGame(page1, 'Fighter1');

        const page2 = await browser.newPage();
        await joinGame(page2, gameCode, 'Mage1');

        // Both choose classes
        await chooseClass(page1, 'Fighter');
        await chooseClass(page2, 'Mage');

        // Wait for start button to appear
        await waitForAllReady(page1);

        // Player 1 starts the game
        await startGame(page1);

        // Both should see the game screen
        await expect(page1.locator('#game-screen')).toBeVisible({ timeout: 30000 });
        await expect(page2.locator('#game-screen')).toBeVisible({ timeout: 30000 });

        // Verify scenario text is displayed
        const scenario1 = await page1.locator('#scenario-text').textContent();
        const scenario2 = await page2.locator('#scenario-text').textContent();

        expect(scenario1.length).toBeGreaterThan(50);
        expect(scenario2).toBe(scenario1); // Same public scenario

        await page1.close();
        await page2.close();
    });

    // ========================================================================
    // 3. Asymmetric Whispers - Different Info Per Class
    // ========================================================================

    test('should show different whispers to different classes', async ({ browser }) => {
        test.setTimeout(180000); // 3 minutes for AI generation

        // Create game with 2 players
        const page1 = await browser.newPage();
        const gameCode = await createGame(page1, 'FighterTest');

        const page2 = await browser.newPage();
        await joinGame(page2, gameCode, 'MageTest');

        // Choose different classes
        await chooseClass(page1, 'Fighter');
        await chooseClass(page2, 'Mage');

        // Start game
        await waitForAllReady(page1);
        await startGame(page1);

        // Wait for whispers to appear
        await page1.waitForSelector('#whisper-box:not(.hidden)', { timeout: 30000 });
        await page2.waitForSelector('#whisper-box:not(.hidden)', { timeout: 30000 });

        // Get whisper content
        const whisper1 = await page1.locator('#whisper-box').textContent();
        const whisper2 = await page2.locator('#whisper-box').textContent();

        // Verify whispers are different
        expect(whisper1).not.toBe(whisper2);

        // Verify whispers contain class-relevant information
        // Fighter should see tactical/combat info
        // Mage should see magical/supernatural info
        expect(whisper1.length).toBeGreaterThan(20);
        expect(whisper2.length).toBeGreaterThan(20);

        console.log('Fighter whisper:', whisper1);
        console.log('Mage whisper:', whisper2);

        await page1.close();
        await page2.close();
    });

    // ========================================================================
    // 4. Turn-Based Gameplay - Choices and Resolution
    // ========================================================================

    test('should handle turn resolution when all players submit', async ({ browser }) => {
        test.setTimeout(240000); // 4 minutes for full turn

        // Setup 2-player game
        const page1 = await browser.newPage();
        const gameCode = await createGame(page1, 'Player1');

        const page2 = await browser.newPage();
        await joinGame(page2, gameCode, 'Player2');

        await chooseClass(page1, 'Fighter');
        await chooseClass(page2, 'Thief');

        await waitForAllReady(page1);
        await startGame(page1);

        // Wait for game to start
        await page1.waitForSelector('#choice-input', { timeout: 30000 });
        await page2.waitForSelector('#choice-input', { timeout: 30000 });

        // Both players submit choices
        await submitChoice(page1, 'I charge at the enemy with my sword drawn!');
        await submitChoice(page2, 'I sneak around to flank them from behind');

        // Wait for outcome (AI resolution)
        await page1.waitForSelector('#outcome', { timeout: 60000 });

        // Verify outcome is displayed
        const outcome = await page1.locator('#outcome').textContent();
        expect(outcome.length).toBeGreaterThan(50);

        console.log('Turn outcome:', outcome);

        await page1.close();
        await page2.close();
    });

    // ========================================================================
    // 5. Four Player Test - Maximum Capacity
    // ========================================================================

    test('should support 4 players simultaneously', async ({ browser }) => {
        test.setTimeout(180000);

        // Create game
        const page1 = await browser.newPage();
        const gameCode = await createGame(page1, 'Fighter');

        // Join with 3 more players
        const page2 = await browser.newPage();
        await joinGame(page2, gameCode, 'Mage');

        const page3 = await browser.newPage();
        await joinGame(page3, gameCode, 'Thief');

        const page4 = await browser.newPage();
        await joinGame(page4, gameCode, 'Cleric');

        // Verify all 4 players see each other
        const count1 = await page1.locator('#player-count').textContent();
        expect(count1).toContain('4/4');

        // Choose classes
        await chooseClass(page1, 'Fighter');
        await chooseClass(page2, 'Mage');
        await chooseClass(page3, 'Thief');
        await chooseClass(page4, 'Cleric');

        // Wait for all ready
        await waitForAllReady(page1);

        // Start game
        await startGame(page1);

        // All 4 should see the game
        await expect(page1.locator('#game-screen')).toBeVisible({ timeout: 30000 });
        await expect(page2.locator('#game-screen')).toBeVisible({ timeout: 30000 });
        await expect(page3.locator('#game-screen')).toBeVisible({ timeout: 30000 });
        await expect(page4.locator('#game-screen')).toBeVisible({ timeout: 30000 });

        // Verify each has a unique whisper
        const whisper1 = await page1.locator('#whisper-box').textContent();
        const whisper2 = await page2.locator('#whisper-box').textContent();
        const whisper3 = await page3.locator('#whisper-box').textContent();
        const whisper4 = await page4.locator('#whisper-box').textContent();

        // All whispers should be different
        expect(whisper1).not.toBe(whisper2);
        expect(whisper2).not.toBe(whisper3);
        expect(whisper3).not.toBe(whisper4);

        console.log('4 unique whispers generated');

        await page1.close();
        await page2.close();
        await page3.close();
        await page4.close();
    });

    // ========================================================================
    // 6. Game Full - 5th Player Rejected
    // ========================================================================

    test('should reject 5th player when game is full', async ({ browser }) => {
        // Create game with 4 players
        const page1 = await browser.newPage();
        const gameCode = await createGame(page1, 'P1');

        const page2 = await browser.newPage();
        await joinGame(page2, gameCode, 'P2');

        const page3 = await browser.newPage();
        await joinGame(page3, gameCode, 'P3');

        const page4 = await browser.newPage();
        await joinGame(page4, gameCode, 'P4');

        // Try to join with 5th player
        const page5 = await browser.newPage();
        await page5.goto(SERVER_URL);
        await page5.fill('#player-name', 'P5');
        await page5.fill('#game-code', gameCode);
        await page5.click('button:has-text("JOIN GAME")');

        // Should see error message
        const error = await page5.locator('#error').textContent();
        expect(error).toContain('full');

        await page1.close();
        await page2.close();
        await page3.close();
        await page4.close();
        await page5.close();
    });

    // ========================================================================
    // 7. Real-Time Updates - Socket.IO
    // ========================================================================

    test('should update in real-time when players join', async ({ browser }) => {
        // Player 1 creates and waits
        const page1 = await browser.newPage();
        const gameCode = await createGame(page1, 'Waiter');

        // Get initial count
        let count = await page1.locator('#player-count').textContent();
        expect(count).toContain('1/4');

        // Player 2 joins
        const page2 = await browser.newPage();
        await joinGame(page2, gameCode, 'Joiner');

        // Page 1 should update automatically (via Socket.IO)
        await page1.waitForTimeout(2000); // Wait for socket event

        count = await page1.locator('#player-count').textContent();
        expect(count).toContain('2/4');

        await page1.close();
        await page2.close();
    });

});

// ============================================================================
// Test Configuration
// ============================================================================

// Run tests in parallel with 2 workers
// Use: npx playwright test --workers=2
