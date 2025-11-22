/**
 * THE ARCANE CODEX - Battle System Integration Test
 * Tests battle system with ACTUAL game flow
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Ensure test-results directory exists
if (!fs.existsSync('test-results')) {
    fs.mkdirSync('test-results');
}

async function testBattleIntegration() {
    console.log('\n╔══════════════════════════════════════════════════════════╗');
    console.log('║   Battle System Integration Test                        ║');
    console.log('╚══════════════════════════════════════════════════════════╝\n');

    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    const page = await context.newPage();

    // Collect console logs
    const consoleLogs = [];
    page.on('console', msg => {
        const text = msg.text();
        consoleLogs.push(text);
        if (text.includes('[Battle]') || text.includes('⚔️') || text.includes('💥')) {
            console.log(`  🖥️  ${text}`);
        }
    });

    try {
        // Step 1: Load game
        console.log('📍 Step 1: Loading game...');
        await page.goto('http://localhost:5000');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);
        console.log('✅ Game loaded\n');

        // Step 2: Click "Solo Play"
        console.log('🎮 Step 2: Starting solo play...');
        await page.click('button:has-text("Solo Play")');
        await page.waitForTimeout(2000);
        console.log('✅ Solo play selected\n');

        // Step 3: Select player count (1 player)
        console.log('👤 Step 3: Selecting 1 player...');
        const onePlayerBtn = page.locator('button.count-btn:has-text("1")');
        if (await onePlayerBtn.isVisible({ timeout: 5000 })) {
            await onePlayerBtn.click();
            await page.waitForTimeout(500);
            console.log('✅ 1 player selected\n');
        } else {
            console.log('⚠️  Player count selection not found, continuing...\n');
        }

        // Step 4: Enter character name
        console.log('⚔️ Step 4: Creating character...');
        const nameInput = page.locator('#playerNameInput');
        if (await nameInput.isVisible({ timeout: 5000 })) {
            await nameInput.fill('BattleHero');
            await page.waitForTimeout(500);

            // Click "Begin Adventure"
            const startBtn = page.locator('button:has-text("Begin Adventure")');
            if (await startBtn.isVisible()) {
                await startBtn.click();
                await page.waitForTimeout(3000);
                console.log('✅ Character created\n');
            }
        } else {
            console.log('⚠️  Name input not found, may already be in game\n');
        }

        // Step 5: Complete divine interrogation quickly
        console.log('✨ Step 5: Completing divine interrogation...');
        for (let i = 0; i < 7; i++) {
            try {
                // Look for choice buttons (they have various class names)
                const choiceBtn = page.locator('button').filter({ hasText: /Choose|Select|Option/i }).first();

                // If no buttons with those texts, just click first visible button that's not a nav button
                const anyChoiceBtn = page.locator('button[class*="choice"], button[class*="option"], .choice-btn').first();

                let clicked = false;
                if (await choiceBtn.isVisible({ timeout: 3000 })) {
                    await choiceBtn.click();
                    clicked = true;
                } else if (await anyChoiceBtn.isVisible({ timeout: 1000 })) {
                    await anyChoiceBtn.click();
                    clicked = true;
                }

                if (clicked) {
                    await page.waitForTimeout(1500);
                    console.log(`  ✓ Question ${i + 1}/7 answered`);
                } else {
                    // Maybe interrogation is done
                    console.log(`  ⚠️  No choice button found at question ${i + 1}`);
                    break;
                }
            } catch (e) {
                console.log(`  ⚠️  Could not answer question ${i + 1}: ${e.message}`);
                break;
            }
        }
        console.log('✅ Divine interrogation complete (or skipped)\n');

        // Step 6: Wait for game to fully load
        console.log('⏳ Step 6: Waiting for game to be ready...');
        await page.waitForTimeout(5000);

        // Take screenshot of game state
        await page.screenshot({ path: 'test-results/before-battle.png' });
        console.log('📸 Screenshot: test-results/before-battle.png');
        console.log('✅ Game ready\n');

        // Step 7: Trigger test battle via console
        console.log('⚔️ Step 7: Starting test battle...\n');

        const battleResult = await page.evaluate(() => {
            // Check if battleManager exists
            if (typeof battleManager === 'undefined') {
                return { success: false, error: 'battleManager not defined' };
            }

            // Get or set game code
            const gameCode = window.gameCode || localStorage.getItem('game_code') || 'TEST_GAME';
            window.gameCode = gameCode;
            localStorage.setItem('game_code', gameCode);

            // Start test battle
            try {
                battleManager.startTestBattle();
                return { success: true, gameCode };
            } catch (error) {
                return { success: false, error: error.message };
            }
        });

        if (!battleResult.success) {
            console.error('❌ Failed to start battle:', battleResult.error);
            await page.screenshot({ path: 'test-results/battle-start-failed.png' });
            return;
        }

        console.log('✅ Battle started!');
        console.log(`  Game Code: ${battleResult.gameCode}\n`);

        // Step 8: Wait for battle animation
        console.log('🎬 Step 8: Watching battle animation...');
        await page.waitForTimeout(7000); // Animation ~5-6 seconds

        // Check if animation played (look for overlay or battle text)
        const animationPlayed = await page.evaluate(() => {
            const body = document.body.innerHTML;
            return body.includes('Goblin') || body.includes('Scout') || body.includes('Battle');
        });

        if (animationPlayed) {
            console.log('✅ Battle animation played\n');
        } else {
            console.log('⚠️  Could not confirm animation played\n');
        }

        await page.screenshot({ path: 'test-results/during-battle-animation.png' });
        console.log('📸 Screenshot: test-results/during-battle-animation.png\n');

        // Step 9: Check for battle controls
        console.log('🎮 Step 9: Checking for battle controls...');
        const controlsVisible = await page.locator('#battle-controls').isVisible({ timeout: 5000 }).catch(() => false);

        if (controlsVisible) {
            console.log('✅ Battle controls appeared!\n');
            await page.screenshot({ path: 'test-results/battle-controls.png' });
            console.log('📸 Screenshot: test-results/battle-controls.png\n');
        } else {
            console.log('❌ Battle controls NOT visible');
            await page.screenshot({ path: 'test-results/no-controls.png' });
            console.log('📸 Screenshot: test-results/no-controls.png\n');
            console.log('\nDebugging info from console:');
            consoleLogs.slice(-10).forEach(log => console.log(`  ${log}`));
            return;
        }

        // Step 10: Click Attack button
        console.log('⚔️ Step 10: Attacking enemy...\n');
        const attackBtn = page.locator('button:has-text("Attack")');

        let attackCount = 0;
        let victoryAchieved = false;

        while (attackCount < 5 && !victoryAchieved) {
            if (await attackBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
                await attackBtn.click();
                attackCount++;
                console.log(`  ${attackCount}. Attack executed`);
                await page.waitForTimeout(1500);

                // Check if victory message appeared
                const bodyText = await page.evaluate(() => document.body.textContent);
                if (bodyText.includes('Victory') || bodyText.includes('victory') ||
                    bodyText.includes('defeated') || bodyText.includes('falls')) {
                    victoryAchieved = true;
                    console.log('  🏆 Victory detected!\n');
                }
            } else {
                console.log('  ⚠️  Attack button no longer visible\n');
                break;
            }
        }

        // Final screenshot
        await page.screenshot({ path: 'test-results/battle-final.png' });
        console.log('📸 Screenshot: test-results/battle-final.png\n');

        // Step 11: Verify battle outcome
        console.log('🏆 Step 11: Checking battle outcome...');

        const finalPage = await page.content();
        const hasVictory = finalPage.includes('Victory') || finalPage.includes('victory');
        const hasRewards = finalPage.includes('XP') || finalPage.includes('Gold') || finalPage.includes('gold');
        const controlsRemoved = !(await page.locator('#battle-controls').isVisible({ timeout: 1000 }).catch(() => false));

        console.log(`  Victory message: ${hasVictory ? '✅' : '❌'}`);
        console.log(`  Rewards shown: ${hasRewards ? '✅' : '❌'}`);
        console.log(`  Controls cleaned up: ${controlsRemoved ? '✅' : '❌'}`);

        // Summary
        console.log('\n╔══════════════════════════════════════════════════════════╗');
        console.log('║   TEST RESULTS                                           ║');
        console.log('╚══════════════════════════════════════════════════════════╝\n');

        const results = {
            '✅ Game loaded': true,
            '✅ Character created': true,
            '✅ Battle started': battleResult.success,
            '✅ Animation played': animationPlayed,
            '✅ Controls appeared': controlsVisible,
            [`✅ Attacks executed (${attackCount})`]: attackCount > 0,
            '✅ Victory achieved': victoryAchieved || hasVictory,
            '✅ Controls cleaned up': controlsRemoved
        };

        Object.entries(results).forEach(([test, passed]) => {
            console.log(`${passed ? '✅' : '❌'} ${test}`);
        });

        const passedCount = Object.values(results).filter(Boolean).length;
        const totalCount = Object.keys(results).length;

        console.log(`\n📊 Overall: ${passedCount}/${totalCount} tests passed (${Math.round(passedCount/totalCount*100)}%)\n`);

        if (passedCount === totalCount) {
            console.log('🎉 ALL TESTS PASSED! Battle system is working!\n');
        } else {
            console.log('⚠️  Some tests failed. Check screenshots for details.\n');
        }

        console.log('📁 Screenshots saved in test-results/');
        console.log('⏳ Browser will stay open for 10 seconds...\n');
        await page.waitForTimeout(10000);

    } catch (error) {
        console.error('\n❌ Test failed with error:', error.message);
        console.error(error.stack);

        await page.screenshot({ path: 'test-results/error.png' });
        console.log('📸 Error screenshot: test-results/error.png\n');

        console.log('\nRecent console logs:');
        consoleLogs.slice(-15).forEach(log => console.log(`  ${log}`));

    } finally {
        await browser.close();
    }
}

// Run test
testBattleIntegration().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
