// Final comprehensive test for all fixes
const { chromium } = require('playwright');

(async () => {
    console.log('='.repeat(60));
    console.log('   TESTING ALL FIXES - The Arcane Codex');
    console.log('='.repeat(60));
    console.log('\n');

    const browser = await chromium.launch({ headless: false, slowMo: 800 });
    let passedTests = 0;
    let failedTests = 0;

    try {
        // ===== TEST 1: Create Game Flow =====
        console.log('TEST 1: Create game and check interrogation flow');
        console.log('-'.repeat(60));

        const page1 = await browser.newPage();
        await page1.goto('http://localhost:5000/game');
        await page1.waitForTimeout(2000);

        // Fill in creator name
        await page1.fill('#creator-name', 'TestHero');
        console.log('  ✓ Filled hero name');

        // Click Embark button
        await page1.click('button:has-text("Embark")');
        await page1.waitForTimeout(4000);

        // Check if interrogation screen is visible
        const interrogationVisible = await page1.locator('#interrogation-screen').isVisible();
        if (interrogationVisible) {
            console.log('  ✅ Interrogation screen displayed');
            passedTests++;
        } else {
            console.log('  ❌ Interrogation screen NOT displayed');
            failedTests++;
        }

        // Check for question text (not "Loading question...")
        const questionText = await page1.locator('.question-text').textContent();
        if (questionText && questionText !== 'Loading question...' && questionText.length > 20) {
            console.log('  ✅ Question loaded: ' + questionText.substring(0, 50) + '...');
            passedTests++;
        } else {
            console.log('  ❌ Question NOT loaded properly: ' + questionText);
            failedTests++;
        }

        // Check for answer options
        const answerCount = await page1.locator('.answer-option').count();
        if (answerCount > 0) {
            console.log(`  ✅ Found ${answerCount} answer options`);
            passedTests++;
        } else {
            console.log('  ❌ No answer options found');
            failedTests++;
        }

        // ===== TEST 2: Game Code Display =====
        console.log('\nTEST 2: Game code displays correctly');
        console.log('-'.repeat(60));

        const gameCode = await page1.locator('#game-code').textContent();
        if (gameCode && gameCode !== '------' && gameCode.length === 6) {
            console.log(`  ✅ Game code displayed: ${gameCode}`);
            passedTests++;
        } else {
            console.log(`  ❌ Game code NOT displayed correctly: ${gameCode}`);
            failedTests++;
        }

        // ===== TEST 3: Multi-Color Styling =====
        console.log('\nTEST 3: Divine Interrogation multi-color styling');
        console.log('-'.repeat(60));

        await page1.screenshot({ path: 'test_interrogation_colors.png', fullPage: true });
        console.log('  📸 Screenshot saved: test_interrogation_colors.png');

        // Check if question card has cyan border (not pure green)
        const questionCardBorder = await page1.locator('.question-card').evaluate(el => {
            return window.getComputedStyle(el).borderColor;
        });

        if (questionCardBorder.includes('0, 255, 255') || questionCardBorder.includes('cyan')) {
            console.log('  ✅ Question card uses cyan border (multi-color theme)');
            passedTests++;
        } else {
            console.log(`  ⚠️  Question card border: ${questionCardBorder}`);
            console.log('     (Check screenshot to verify multi-color theme)');
        }

        // Check if answer buttons have orange/copper styling
        const answerButtonBorder = await page1.locator('.answer-option').first().evaluate(el => {
            return window.getComputedStyle(el).borderColor;
        });

        if (answerButtonBorder.includes('204, 136, 0') || answerButtonBorder.includes('rgb(204, 136, 0)')) {
            console.log('  ✅ Answer buttons use orange/copper borders');
            passedTests++;
        } else {
            console.log(`  ⚠️  Answer button border: ${answerButtonBorder}`);
        }

        // ===== TEST 4: Join Game Flow =====
        console.log('\nTEST 4: Join game functionality');
        console.log('-'.repeat(60));

        const page2 = await browser.newPage();
        await page2.goto('http://localhost:5000/game');
        await page2.waitForTimeout(2000);

        // Fill in joiner info
        await page2.fill('#joiner-name', 'Player2');
        await page2.fill('#join-code', gameCode);
        console.log(`  ✓ Filled join info with code: ${gameCode}`);

        // Click Join button
        await page2.click('button:has-text("Join")');
        await page2.waitForTimeout(4000);

        // Check if interrogation screen is visible for joiner
        const joinerInterrogationVisible = await page2.locator('#interrogation-screen').isVisible();
        if (joinerInterrogationVisible) {
            console.log('  ✅ Joiner reached interrogation screen');
            passedTests++;
        } else {
            console.log('  ❌ Joiner did NOT reach interrogation screen');
            failedTests++;
        }

        // Check if joiner sees game code
        const joinerGameCode = await page2.locator('#game-code').textContent();
        if (joinerGameCode === gameCode) {
            console.log(`  ✅ Joiner sees correct game code: ${joinerGameCode}`);
            passedTests++;
        } else {
            console.log(`  ❌ Joiner game code mismatch: ${joinerGameCode} vs ${gameCode}`);
            failedTests++;
        }

        // ===== TEST 5: Progress Bar Multi-Color =====
        console.log('\nTEST 5: Progress bar gradient styling');
        console.log('-'.repeat(60));

        const progressFillBg = await page1.locator('.progress-fill').evaluate(el => {
            return window.getComputedStyle(el).background;
        });

        const bgPreview = progressFillBg.length > 100 ? progressFillBg.substring(0, 100) + '...' : progressFillBg;
        if (progressFillBg.includes('gradient') || progressFillBg.includes('linear')) {
            console.log('  ✅ Progress bar uses gradient (multi-color)');
            passedTests++;
        } else {
            console.log(`  ⚠️  Progress bar background: ${bgPreview}`);
        }

        console.log('\n' + '='.repeat(60));
        console.log('   TEST SUMMARY');
        console.log('='.repeat(60));
        console.log(`   Passed: ${passedTests}`);
        console.log(`   Failed: ${failedTests}`);
        console.log(`   Total:  ${passedTests + failedTests}`);
        console.log('='.repeat(60));

        if (failedTests === 0) {
            console.log('\n   ✅ ALL TESTS PASSED! 🎉\n');
        } else {
            console.log('\n   ⚠️  Some tests failed - check details above\n');
        }

        // Keep browser open for manual inspection
        console.log('\nBrowser will stay open for 10 seconds for inspection...');
        await page1.waitForTimeout(10000);

    } catch (error) {
        console.error('\n❌ TEST ERROR:', error.message);
        await browser.contexts()[0].pages()[0].screenshot({ path: 'test_error.png', fullPage: true });
    }

    await browser.close();
    console.log('\nTest complete!\n');
})();
