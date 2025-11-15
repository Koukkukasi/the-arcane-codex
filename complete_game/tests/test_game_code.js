/**
 * Playwright Test - Game Code Display and Join Functionality
 * Tests if game code is visible and join functionality works
 */

const { chromium } = require('playwright');

async function testGameCode() {
    console.log('🔍 Starting Game Code and Join Test...\n');

    const browser = await chromium.launch({
        headless: false,
        slowMo: 1000
    });

    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });

    // Track API calls
    const apiCalls = [];

    try {
        // ========== PLAYER 1: CREATE GAME ==========
        console.log('========== PLAYER 1: CREATE GAME ==========\n');

        const page1 = await context.newPage();

        // Track API calls for Player 1
        page1.on('response', async response => {
            const url = response.url();
            if (url.includes('/api/')) {
                const method = response.request().method();
                const status = response.status();
                let body = null;
                try {
                    body = await response.json();
                } catch (e) {
                    try {
                        body = await response.text();
                    } catch (e2) {
                        body = '<Could not read body>';
                    }
                }
                apiCalls.push({ player: 1, url, method, status, body });
                console.log(`   [P1 API] ${method} ${url.split('/api/')[1]} - Status: ${status}`);
            }
        });

        page1.on('console', msg => {
            if (msg.type() === 'error') {
                console.log(`   [P1 ERROR] ${msg.text()}`);
            }
        });

        console.log('Step 1: Player 1 - Loading landing page...');
        await page1.goto('http://localhost:5000', { waitUntil: 'networkidle' });
        await page1.waitForTimeout(2000);

        // Check if username screen is visible
        const usernameScreenVisible = await page1.evaluate(() => {
            const screen = document.getElementById('username-screen');
            return window.getComputedStyle(screen).display !== 'none';
        });
        console.log(`   Username screen visible: ${usernameScreenVisible ? '✅' : '❌'}\n`);

        console.log('Step 2: Player 1 - Entering username...');
        await page1.fill('#username-input', 'Player1');
        await page1.click('#username-form button[type="submit"]');
        await page1.waitForTimeout(2000);

        // Check if game selection screen is visible
        const gameSelectionVisible = await page1.evaluate(() => {
            const screen = document.getElementById('game-selection-screen');
            return window.getComputedStyle(screen).display !== 'none';
        });
        console.log(`   Game selection screen visible: ${gameSelectionVisible ? '✅' : '❌'}\n`);

        console.log('Step 3: Player 1 - Creating game...');
        await page1.click('#create-game-form button[type="submit"]');
        await page1.waitForTimeout(1000);

        console.log('   Waiting for navigation to /game page...');
        await page1.waitForURL('**/game', { timeout: 10000 });
        console.log('   ✅ Navigated to /game page\n');

        await page1.waitForTimeout(3000);
        await page1.screenshot({ path: 'screenshots/player1_game_screen.png', fullPage: true });

        // Check if game code is displayed
        console.log('Step 4: Player 1 - Checking game code display...');
        const gameCodeInfo = await page1.evaluate(() => {
            const codeElement = document.getElementById('game-code');
            return {
                exists: !!codeElement,
                visible: codeElement ? window.getComputedStyle(codeElement).display !== 'none' : false,
                text: codeElement?.textContent,
                isEmpty: !codeElement?.textContent || codeElement?.textContent === '------'
            };
        });

        console.log('   Game Code Element:');
        console.log(`      Exists: ${gameCodeInfo.exists ? '✅' : '❌'}`);
        console.log(`      Visible: ${gameCodeInfo.visible ? '✅' : '❌'}`);
        console.log(`      Text: "${gameCodeInfo.text}"`);
        console.log(`      Empty/Default: ${gameCodeInfo.isEmpty ? '❌' : '✅'}`);

        // Find the game code from API calls
        let gameCode = null;
        const createGameCall = apiCalls.find(call => call.url.includes('create_game') && call.player === 1);
        if (createGameCall && createGameCall.body && createGameCall.body.game_code) {
            gameCode = createGameCall.body.game_code;
            console.log(`   Game Code from API: "${gameCode}" ✅\n`);
        } else {
            console.log('   ❌ Could not find game code in API response\n');
        }

        if (!gameCode) {
            console.log('⚠️  Cannot continue with join test - no game code found');
            await browser.close();
            return;
        }

        // ========== PLAYER 2: JOIN GAME ==========
        console.log('========== PLAYER 2: JOIN GAME ==========\n');

        const page2 = await context.newPage();

        // Track API calls for Player 2
        page2.on('response', async response => {
            const url = response.url();
            if (url.includes('/api/')) {
                const method = response.request().method();
                const status = response.status();
                let body = null;
                try {
                    body = await response.json();
                } catch (e) {
                    try {
                        body = await response.text();
                    } catch (e2) {
                        body = '<Could not read body>';
                    }
                }
                apiCalls.push({ player: 2, url, method, status, body });
                console.log(`   [P2 API] ${method} ${url.split('/api/')[1]} - Status: ${status}`);
            }
        });

        page2.on('console', msg => {
            if (msg.type() === 'error') {
                console.log(`   [P2 ERROR] ${msg.text()}`);
            }
        });

        console.log('Step 5: Player 2 - Loading landing page...');
        await page2.goto('http://localhost:5000', { waitUntil: 'networkidle' });
        await page2.waitForTimeout(2000);

        console.log('Step 6: Player 2 - Entering username...');
        await page2.fill('#username-input', 'Player2');
        await page2.click('#username-form button[type="submit"]');
        await page2.waitForTimeout(2000);

        // Check if join form is visible
        const joinFormVisible = await page2.evaluate(() => {
            const form = document.getElementById('join-game-form');
            const gameCodeInput = document.getElementById('game-code');
            return {
                formExists: !!form,
                inputExists: !!gameCodeInput,
                inputVisible: gameCodeInput ? window.getComputedStyle(gameCodeInput).display !== 'none' : false
            };
        });
        console.log(`   Join form exists: ${joinFormVisible.formExists ? '✅' : '❌'}`);
        console.log(`   Game code input exists: ${joinFormVisible.inputExists ? '✅' : '❌'}`);
        console.log(`   Game code input visible: ${joinFormVisible.inputVisible ? '✅' : '❌'}\n`);

        console.log(`Step 7: Player 2 - Entering game code "${gameCode}"...`);
        await page2.fill('#game-code', gameCode);
        await page2.screenshot({ path: 'screenshots/player2_code_entered.png', fullPage: true });

        console.log('Step 8: Player 2 - Clicking join button...');
        await page2.click('#join-game-form button[type="submit"]');
        await page2.waitForTimeout(1000);

        console.log('   Waiting for navigation to /game page...');
        try {
            await page2.waitForURL('**/game', { timeout: 10000 });
            console.log('   ✅ Player 2 successfully joined!\n');

            await page2.waitForTimeout(3000);
            await page2.screenshot({ path: 'screenshots/player2_game_screen.png', fullPage: true });

            // Check Player 2's game code display
            const p2GameCodeInfo = await page2.evaluate(() => {
                const codeElement = document.getElementById('game-code');
                return {
                    text: codeElement?.textContent,
                    isEmpty: !codeElement?.textContent || codeElement?.textContent === '------'
                };
            });
            console.log(`   Player 2 Game Code Display: "${p2GameCodeInfo.text}" ${p2GameCodeInfo.isEmpty ? '❌' : '✅'}`);

        } catch (error) {
            console.log('   ❌ Player 2 failed to join game');
            console.log(`   Error: ${error.message}\n`);
            await page2.screenshot({ path: 'screenshots/player2_join_error.png', fullPage: true });
        }

        // Check if both players see each other
        console.log('\nStep 9: Checking if players can see each other...');
        const p1Players = await page1.evaluate(() => {
            const container = document.getElementById('players-container');
            const players = container?.querySelectorAll('.player-item');
            return {
                count: players?.length || 0,
                names: Array.from(players || []).map(p => p.textContent.trim())
            };
        });
        console.log(`   Player 1 sees ${p1Players.count} player(s): ${p1Players.names.join(', ')}`);

        const p2Players = await page2.evaluate(() => {
            const container = document.getElementById('players-container');
            const players = container?.querySelectorAll('.player-item');
            return {
                count: players?.length || 0,
                names: Array.from(players || []).map(p => p.textContent.trim())
            };
        });
        console.log(`   Player 2 sees ${p2Players.count} player(s): ${p2Players.names.join(', ')}`);

        // Summary
        console.log('\n========== TEST SUMMARY ==========');
        console.log(`✅ Player 1 created game: ${!!gameCode}`);
        console.log(`${gameCodeInfo.isEmpty ? '❌' : '✅'} Game code displayed on screen`);
        console.log(`${joinFormVisible.inputExists ? '✅' : '❌'} Join form available`);
        console.log(`${p2Players.count > 0 ? '✅' : '❌'} Player 2 successfully joined`);

        console.log('\n📋 API Calls Summary:');
        apiCalls.forEach((call, index) => {
            console.log(`   ${index + 1}. [P${call.player}] ${call.method} ${call.url.split('/api/')[1]} - ${call.status}`);
        });

        await page1.waitForTimeout(5000);

    } catch (error) {
        console.error('\n💥 Test failed:', error.message);
        console.error(error.stack);
    } finally {
        console.log('\n✅ Test complete! Check screenshots/ folder.');
        await browser.close();
    }
}

// Create screenshots directory if needed
const fs = require('fs');
if (!fs.existsSync('screenshots')) {
    fs.mkdirSync('screenshots');
}

testGameCode().catch(console.error);
