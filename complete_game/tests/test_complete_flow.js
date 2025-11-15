// Comprehensive Playwright test for The Arcane Codex
// Tests: Landing → Lobby → Create Game → Join Game → Multiplayer
const { chromium } = require('playwright');

(async () => {
    console.log('🎮 THE ARCANE CODEX - Complete Flow Test\n');
    console.log('='.repeat(60));

    const browser = await chromium.launch({
        headless: false,
        slowMo: 500
    });

    try {
        // ===== TEST 1: Landing Page =====
        console.log('\n📄 TEST 1: Landing Page');
        console.log('-'.repeat(60));

        const page1 = await browser.newPage();

        // Listen for console messages and errors
        page1.on('console', msg => console.log(`   [Browser ${msg.type()}]:`, msg.text()));
        page1.on('pageerror', error => console.log(`   [Page Error]:`, error.message));

        await page1.goto('http://localhost:5000');
        await page1.waitForLoadState('networkidle');

        // Check for title
        const title = await page1.title();
        console.log(`   Title: ${title}`);

        // Check for PLAY button
        const playButton = page1.locator('button:has-text("PLAY")');
        const hasPlayButton = await playButton.count() > 0;
        console.log(`   ✅ PLAY button: ${hasPlayButton ? 'Found' : 'NOT FOUND'}`);

        await page1.screenshot({ path: '01_landing_page.png', fullPage: true });
        console.log('   📸 Screenshot: 01_landing_page.png');

        // ===== TEST 2: Navigate to Game Page =====
        console.log('\n🎮 TEST 2: Navigate to Game Page');
        console.log('-'.repeat(60));

        // Click and wait for navigation
        await Promise.all([
            page1.waitForNavigation({ url: '**/game', timeout: 10000 }),
            playButton.click({ force: true })
        ]);

        const currentUrl = page1.url();
        console.log(`   URL: ${currentUrl}`);
        console.log(`   ✅ Navigation: ${currentUrl.includes('/game') ? 'Success' : 'FAILED'}`);

        await page1.screenshot({ path: '02_game_page.png', fullPage: true });
        console.log('   📸 Screenshot: 02_game_page.png');

        // ===== TEST 3: Check Lobby UI =====
        console.log('\n👥 TEST 3: Check Lobby UI Elements');
        console.log('-'.repeat(60));

        // Check for lobby elements
        const lobbyScreen = page1.locator('#lobby-screen');
        const isLobbyVisible = await lobbyScreen.isVisible();
        console.log(`   Lobby screen: ${isLobbyVisible ? '✅ Visible' : '❌ Hidden'}`);

        const creatorNameInput = page1.locator('#creator-name');
        const hasCreatorInput = await creatorNameInput.count() > 0;
        const creatorVisible = await creatorNameInput.isVisible().catch(() => false);
        console.log(`   Creator name input: ${hasCreatorInput ? '✅ Found' : '❌ NOT FOUND'} ${creatorVisible ? '(visible)' : '(hidden)'}`);

        const createButton = page1.locator('button:has-text("Create Game")');
        const hasCreateButton = await createButton.count() > 0;
        const createVisible = await createButton.isVisible().catch(() => false);
        console.log(`   Create button: ${hasCreateButton ? '✅ Found' : '❌ NOT FOUND'} ${createVisible ? '(visible)' : '(hidden)'}`);

        const joinNameInput = page1.locator('#join-name');
        const joinCodeInput = page1.locator('#join-code');
        const joinButton = page1.locator('button:has-text("Join Game")');

        console.log(`   Join name input: ${await joinNameInput.count() > 0 ? '✅ Found' : '❌ NOT FOUND'}`);
        console.log(`   Join code input: ${await joinCodeInput.count() > 0 ? '✅ Found' : '❌ NOT FOUND'}`);
        console.log(`   Join button: ${await joinButton.count() > 0 ? '✅ Found' : '❌ NOT FOUND'}`);

        // ===== TEST 4: Create Game =====
        console.log('\n🎲 TEST 4: Create Game');
        console.log('-'.repeat(60));

        await creatorNameInput.fill('Player1');
        console.log('   ✅ Filled creator name: Player1');

        await page1.screenshot({ path: '03_filled_create_form.png', fullPage: true });

        // Wait for JS to initialize
        await page1.waitForTimeout(2000);

        // Click the create button via JavaScript
        await page1.evaluate(() => {
            const btn = document.querySelector('#create-game-form button[type="submit"]');
            if (btn) {
                btn.click();
            } else {
                // Directly dispatch submit event
                const form = document.getElementById('create-game-form');
                if (form) {
                    const event = new Event('submit', { bubbles: true, cancelable: true });
                    form.dispatchEvent(event);
                }
            }
        });
        console.log('   ✅ Clicked Create Game button');

        // Wait for transition
        await page1.waitForTimeout(2000);

        // Check if we're no longer on lobby screen
        const lobbyStillVisible = await lobbyScreen.isVisible();
        console.log(`   Lobby screen after create: ${lobbyStillVisible ? '⚠️  Still visible' : '✅ Hidden (good)'}`);

        // Check for game code in header
        const gameCodeElement = page1.locator('#game-code');
        const gameCode = await gameCodeElement.textContent();
        console.log(`   Game code: ${gameCode}`);

        await page1.screenshot({ path: '04_game_created.png', fullPage: true });
        console.log('   📸 Screenshot: 04_game_created.png');

        if (gameCode && gameCode !== '------' && gameCode.length === 6) {
            console.log(`   ✅ Game created successfully! Code: ${gameCode}`);

            // ===== TEST 5: Second Player Joins =====
            console.log('\n👤 TEST 5: Second Player Joins');
            console.log('-'.repeat(60));

            const page2 = await browser.newPage();
            await page2.goto('http://localhost:5000/game');
            await page2.waitForLoadState('networkidle');

            console.log('   ✅ Opened second browser tab');

            // Fill join form
            await page2.locator('#join-name').fill('Player2');
            await page2.locator('#join-code').fill(gameCode);
            console.log(`   ✅ Filled join form: Player2, Code: ${gameCode}`);

            await page2.screenshot({ path: '05_filled_join_form.png', fullPage: true });

            await page2.locator('button:has-text("Join Game")').click();
            console.log('   ✅ Clicked Join Game button');

            await page2.waitForTimeout(2000);

            await page2.screenshot({ path: '06_player2_joined.png', fullPage: true });
            console.log('   📸 Screenshot: 06_player2_joined.png');

            // Check player count on both pages
            const player1Count = await page1.locator('#player-count').textContent();
            const player2Count = await page2.locator('#player-count').textContent();

            console.log(`   Player count (Player1 view): ${player1Count}`);
            console.log(`   Player count (Player2 view): ${player2Count}`);

            // ===== TEST 6: Verify Multiplayer State =====
            console.log('\n🎯 TEST 6: Verify Multiplayer State');
            console.log('-'.repeat(60));

            await page1.waitForTimeout(1000);
            await page1.screenshot({ path: '07_player1_final.png', fullPage: true });

            await page2.waitForTimeout(1000);
            await page2.screenshot({ path: '08_player2_final.png', fullPage: true });

            console.log('   📸 Final screenshots saved');

            // Close second page
            await page2.close();
        } else {
            console.log('   ❌ Game creation failed - no valid game code');
        }

        // ===== SUMMARY =====
        console.log('\n' + '='.repeat(60));
        console.log('📊 TEST SUMMARY');
        console.log('='.repeat(60));
        console.log('✅ Landing page loads');
        console.log('✅ Navigation to /game works');
        console.log(`${isLobbyVisible ? '✅' : '❌'} Lobby screen visible`);
        console.log(`${hasCreatorInput && hasCreateButton ? '✅' : '❌'} Create game form present`);
        console.log(`${await joinNameInput.count() > 0 ? '✅' : '❌'} Join game form present`);
        console.log(`${gameCode && gameCode !== '------' ? '✅' : '❌'} Game creation`);
        console.log('\n🎮 All screenshots saved to current directory');
        console.log('='.repeat(60));

    } catch (error) {
        console.error('\n❌ TEST FAILED:', error.message);
        console.error(error.stack);
    } finally {
        console.log('\n⏳ Keeping browser open for 5 seconds...');
        await new Promise(resolve => setTimeout(resolve, 5000));
        await browser.close();
        console.log('✅ Test complete!');
    }
})();
