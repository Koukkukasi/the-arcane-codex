/**
 * THE ARCANE CODEX - Direct Battle System Test
 * Tests battle system by directly loading actual_game.html
 */

const { chromium } = require('playwright');
const fs = require('fs');

// Ensure test-results directory exists
if (!fs.existsSync('test-results')) {
    fs.mkdirSync('test-results');
}

async function testBattle() {
    console.log('\n╔══════════════════════════════════════════════════════════╗');
    console.log('║   Battle System Direct Test                             ║');
    console.log('╚══════════════════════════════════════════════════════════╝\n');

    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

    // Collect console logs
    const consoleLogs = [];
    page.on('console', msg => {
        const text = msg.text();
        consoleLogs.push(text);
        if (text.includes('[Battle]') || text.includes('⚔️') || text.includes('💥') || text.includes('Victory')) {
            console.log(`  🖥️  ${text}`);
        }
    });

    try {
        // Load actual_game.html directly
        console.log('📍 Step 1: Loading game page...');
        await page.goto('http://localhost:5000/static/actual_game.html');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);
        console.log('✅ Game page loaded\n');

        // Set up game code in localStorage
        console.log('🔑 Step 2: Setting up game session...');
        await page.evaluate(() => {
            const gameCode = 'TEST_' + Math.random().toString(36).substr(2, 6).toUpperCase();
            localStorage.setItem('game_code', gameCode);
            window.gameCode = gameCode;
            console.log('[Test] Game code set:', gameCode);
        });
        console.log('✅ Session configured\n');

        // Verify battleManager loaded
        console.log('🔍 Step 3: Verifying battle manager...');
        const battleManagerExists = await page.evaluate(() => {
            return typeof battleManager !== 'undefined' && typeof battleManager.startTestBattle === 'function';
        });

        if (!battleManagerExists) {
            console.error('❌ BattleManager not found!');
            console.log('\nAvailable global objects:');
            const globals = await page.evaluate(() => {
                return Object.keys(window).filter(k => k.includes('battle') || k.includes('Battle'));
            });
            console.log(globals);
            return;
        }

        console.log('✅ BattleManager loaded\n');

        // Take screenshot before battle
        await page.screenshot({ path: 'test-results/direct-before-battle.png' });
        console.log('📸 Screenshot: test-results/direct-before-battle.png\n');

        // Start test battle
        console.log('⚔️ Step 4: Starting test battle...\n');
        const startResult = await page.evaluate(() => {
            try {
                battleManager.startTestBattle();
                return { success: true };
            } catch (error) {
                return { success: false, error: error.message };
            }
        });

        if (!startResult.success) {
            console.error('❌ Failed to start battle:', startResult.error);
            return;
        }

        console.log('✅ Battle started!\n');

        // Wait for animation
        console.log('🎬 Step 5: Watching battle animation (7 seconds)...');
        await page.waitForTimeout(7000);

        // Screenshot during/after animation
        await page.screenshot({ path: 'test-results/direct-after-animation.png' });
        console.log('📸 Screenshot: test-results/direct-after-animation.png\n');

        // Check for battle controls
        console.log('🎮 Step 6: Checking for battle controls...');
        const controlsVisible = await page.locator('#battle-controls').isVisible({ timeout: 2000 }).catch(() => false);

        if (!controlsVisible) {
            console.error('❌ Battle controls NOT visible');
            console.log('\nPage content check:');
            const hasGoblin = await page.evaluate(() => document.body.textContent.includes('Goblin'));
            const hasBattle = await page.evaluate(() => document.body.textContent.includes('Battle'));
            console.log(`  Goblin mentioned: ${hasGoblin}`);
            console.log(`  Battle mentioned: ${hasBattle}`);

            console.log('\nRecent console logs:');
            consoleLogs.slice(-10).forEach(log => console.log(`  ${log}`));
            return;
        }

        console.log('✅ Battle controls visible!\n');
        await page.screenshot({ path: 'test-results/direct-controls-visible.png' });
        console.log('📸 Screenshot: test-results/direct-controls-visible.png\n');

        // Attack multiple times
        console.log('⚔️ Step 7: Attacking enemy...\n');
        const attackBtn = page.locator('button:has-text("Attack")');

        for (let i = 0; i < 5; i++) {
            const btnVisible = await attackBtn.isVisible({ timeout: 1000 }).catch(() => false);
            if (!btnVisible) {
                console.log(`  Battle ended after ${i} attacks\n`);
                break;
            }

            await attackBtn.click();
            console.log(`  ${i + 1}. Attack executed`);
            await page.waitForTimeout(1500);

            // Check for victory
            const bodyText = await page.evaluate(() => document.body.textContent);
            if (bodyText.includes('Victory') || bodyText.includes('victory')) {
                console.log(`  🏆 Victory achieved after ${i + 1} attacks!\n`);
                break;
            }
        }

        // Final screenshot
        await page.screenshot({ path: 'test-results/direct-final.png' });
        console.log('📸 Screenshot: test-results/direct-final.png\n');

        // Check results
        console.log('🏆 Step 8: Verifying battle results...');
        const results = await page.evaluate(() => {
            const text = document.body.textContent;
            return {
                hasVictory: text.includes('Victory') || text.includes('victory'),
                hasRewards: text.includes('XP') || text.includes('Gold') || text.includes('gold'),
                controlsRemoved: !document.getElementById('battle-controls'),
                battleManagerState: {
                    isInBattle: battleManager.isInBattle,
                    enemyHp: battleManager.enemyHp
                }
            };
        });

        console.log(`  Victory message: ${results.hasVictory ? '✅' : '❌'}`);
        console.log(`  Rewards shown: ${results.hasRewards ? '✅' : '❌'}`);
        console.log(`  Controls cleaned up: ${results.controlsRemoved ? '✅' : '❌'}`);
        console.log(`  Battle state: InBattle=${results.battleManagerState.isInBattle}, EnemyHP=${results.battleManagerState.enemyHp}\n`);

        // Test summary
        console.log('╔══════════════════════════════════════════════════════════╗');
        console.log('║   TEST SUMMARY                                           ║');
        console.log('╚══════════════════════════════════════════════════════════╝\n');

        const tests = {
            'Page loaded': true,
            'BattleManager exists': battleManagerExists,
            'Battle started': startResult.success,
            'Controls appeared': controlsVisible,
            'Victory achieved': results.hasVictory,
            'Rewards shown': results.hasRewards,
            'Cleanup successful': results.controlsRemoved
        };

        Object.entries(tests).forEach(([name, passed]) => {
            console.log(`${passed ? '✅' : '❌'} ${name}`);
        });

        const passed = Object.values(tests).filter(Boolean).length;
        const total = Object.keys(tests).length;
        const percentage = Math.round((passed / total) * 100);

        console.log(`\n📊 Score: ${passed}/${total} (${percentage}%)\n`);

        if (passed === total) {
            console.log('🎉 ALL TESTS PASSED! Battle system working perfectly!\n');
        } else if (passed >= total * 0.7) {
            console.log('⚠️  Most tests passed, minor issues found.\n');
        } else {
            console.log('❌ Multiple tests failed. Check logs and screenshots.\n');
        }

        console.log('📁 Check test-results/ for screenshots');
        console.log('📋 Console logs captured: ' + consoleLogs.length + ' messages');
        console.log('\n⏳ Browser will stay open for 10 seconds...\n');
        await page.waitForTimeout(10000);

    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        console.error(error.stack);

        await page.screenshot({ path: 'test-results/direct-error.png' });
        console.log('\n📸 Error screenshot saved\n');

        console.log('Recent console logs:');
        consoleLogs.slice(-15).forEach(log => console.log(`  ${log}`));

    } finally {
        await browser.close();
    }
}

testBattle().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
