/**
 * THE ARCANE CODEX - Battle System Integration Test
 * Tests battle animations with actual game server
 */

const { chromium } = require('playwright');

async function testBattleSystem() {
    console.log('\n╔══════════════════════════════════════════════════════════╗');
    console.log('║   Battle System Integration Test                        ║');
    console.log('╚══════════════════════════════════════════════════════════╝\n');

    const browser = await chromium.launch({ headless: false }); // Show browser
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    const page = await context.newPage();

    try {
        // Step 1: Navigate to game
        console.log('📍 Step 1: Navigating to game...');
        await page.goto('http://localhost:5000');
        await page.waitForLoadState('networkidle');
        console.log('✅ Game loaded');

        // Step 2: Set username
        console.log('\n📝 Step 2: Setting username...');
        await page.fill('#username-input', 'BattleTester');
        await page.click('button:has-text("Continue")');
        await page.waitForTimeout(1000);
        console.log('✅ Username set');

        // Step 3: Create game
        console.log('\n🎮 Step 3: Creating game...');
        await page.click('button:has-text("Create New Game")');
        await page.waitForTimeout(2000);
        console.log('✅ Game created');

        // Step 4: Select player count
        console.log('\n👥 Step 4: Selecting 1 player...');
        const onePlayerBtn = await page.locator('button:has-text("1 Player")');
        if (await onePlayerBtn.isVisible()) {
            await onePlayerBtn.click();
            await page.waitForTimeout(500);
        }
        console.log('✅ Player count selected');

        // Step 5: Enter character name
        console.log('\n⚔️ Step 5: Creating character...');
        await page.fill('input[placeholder*="character" i], input[placeholder*="name" i]', 'TestHero');
        const startBtn = await page.locator('button:has-text("Start")');
        if (await startBtn.isVisible()) {
            await startBtn.click();
            await page.waitForTimeout(2000);
        }
        console.log('✅ Character name entered');

        // Step 6: Complete divine interrogation (skip through quickly)
        console.log('\n✨ Step 6: Completing divine interrogation...');
        for (let i = 0; i < 7; i++) {
            try {
                // Click first choice button
                const choiceBtn = await page.locator('.choice-btn, button[class*="choice"]').first();
                if (await choiceBtn.isVisible({ timeout: 2000 })) {
                    await choiceBtn.click();
                    await page.waitForTimeout(1500);
                    console.log(`  ✓ Question ${i + 1}/7 answered`);
                }
            } catch (e) {
                console.log(`  ⚠ Could not answer question ${i + 1}, continuing...`);
            }
        }
        console.log('✅ Divine interrogation complete');

        // Step 7: Wait for game to be ready
        console.log('\n⏳ Step 7: Waiting for game to load...');
        await page.waitForTimeout(3000);
        console.log('✅ Game ready');

        // Step 8: Open browser console and trigger battle
        console.log('\n⚔️ Step 8: Starting test battle...');

        // Execute battleManager.startTestBattle() in browser context
        const battleStarted = await page.evaluate(() => {
            if (typeof battleManager === 'undefined') {
                return { success: false, error: 'battleManager not found' };
            }

            // Get game code from storage or global
            const gameCode = localStorage.getItem('game_code') || window.gameCode;
            if (!gameCode) {
                return { success: false, error: 'No game code found' };
            }

            // Store game code globally
            window.gameCode = gameCode;

            // Call startTestBattle
            battleManager.startTestBattle();

            return { success: true, gameCode: gameCode };
        });

        if (!battleStarted.success) {
            console.error('❌ Failed to start battle:', battleStarted.error);
            return;
        }

        console.log('✅ Battle started!');
        console.log('  Game Code:', battleStarted.gameCode);

        // Step 9: Wait for animation to complete
        console.log('\n🎬 Step 9: Watching battle animation...');
        await page.waitForTimeout(6000); // Animation takes ~5 seconds

        // Check if battle controls appeared
        const controlsVisible = await page.locator('#battle-controls').isVisible();
        if (controlsVisible) {
            console.log('✅ Battle controls appeared!');

            // Take screenshot
            await page.screenshot({ path: 'test-results/battle-controls.png' });
            console.log('📸 Screenshot saved: test-results/battle-controls.png');
        } else {
            console.log('⚠️  Battle controls not visible');
        }

        // Step 10: Click Attack button
        console.log('\n⚔️ Step 10: Attacking enemy...');
        const attackBtn = await page.locator('button:has-text("Attack")');
        if (await attackBtn.isVisible()) {
            await attackBtn.click();
            console.log('✅ Attack button clicked!');
            await page.waitForTimeout(2000);

            // Check for damage message
            const pageContent = await page.content();
            if (pageContent.includes('damage') || pageContent.includes('strike')) {
                console.log('✅ Damage message appeared!');
            }

            // Take screenshot after attack
            await page.screenshot({ path: 'test-results/after-attack.png' });
            console.log('📸 Screenshot saved: test-results/after-attack.png');

            // Attack again to possibly win
            console.log('\n⚔️ Attacking again...');
            await page.waitForTimeout(1000);
            if (await attackBtn.isVisible()) {
                await attackBtn.click();
                await page.waitForTimeout(2000);
                console.log('✅ Second attack executed');
            }

        } else {
            console.log('❌ Attack button not found');
        }

        // Step 11: Wait for victory or check final state
        console.log('\n🏆 Step 11: Checking battle outcome...');
        await page.waitForTimeout(2000);

        // Check if victory message appeared
        const finalContent = await page.content();
        if (finalContent.includes('Victory') || finalContent.includes('victory')) {
            console.log('✅ VICTORY! Battle won!');
        } else if (finalContent.includes('gold') || finalContent.includes('XP')) {
            console.log('✅ Rewards message detected!');
        }

        // Final screenshot
        await page.screenshot({ path: 'test-results/battle-final.png' });
        console.log('📸 Final screenshot saved: test-results/battle-final.png');

        console.log('\n╔══════════════════════════════════════════════════════════╗');
        console.log('║   TEST COMPLETE ✅                                       ║');
        console.log('╚══════════════════════════════════════════════════════════╝\n');

        console.log('Check screenshots in test-results/ folder');
        console.log('Browser will stay open for 10 seconds for manual inspection...');

        await page.waitForTimeout(10000);

    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        console.error(error.stack);

        // Screenshot on error
        await page.screenshot({ path: 'test-results/battle-error.png' });
        console.log('📸 Error screenshot saved: test-results/battle-error.png');

    } finally {
        await browser.close();
    }
}

// Run test
testBattleSystem().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
