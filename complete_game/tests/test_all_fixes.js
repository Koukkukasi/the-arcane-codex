// Comprehensive test for all fixes
const { chromium } = require('playwright');

(async () => {
    console.log('\n🧪 Testing All Fixes\n');
    console.log('='.repeat(70));
    console.log('Fix 1: Auto-resume disabled (always show lobby)');
    console.log('Fix 2: Falling rune symbols visible');
    console.log('Fix 3: Question progression working');
    console.log('='.repeat(70));

    const browser = await chromium.launch({ headless: false, slowMo: 800 });
    const page = await browser.newPage();

    const results = {
        passed: [],
        failed: []
    };

    try {
        // TEST 1: Check lobby shows even with saved session
        console.log('\n\n📋 TEST 1: Lobby shows even with saved session');
        console.log('-'.repeat(70));

        await page.goto('http://localhost:5000/game');
        await page.waitForTimeout(2000);

        const lobbyVisible = await page.locator('#lobby-screen').isVisible().catch(() => false);
        if (lobbyVisible) {
            results.passed.push('✅ Lobby screen is visible (no auto-resume)');
            console.log('✅ PASS: Lobby screen is visible');
        } else {
            results.failed.push('❌ Lobby screen is NOT visible');
            console.log('❌ FAIL: Lobby screen is NOT visible');
        }

        await page.screenshot({ path: 'test_lobby_visible.png' });
        console.log('📸 Screenshot: test_lobby_visible.png');


        // TEST 2: Check for falling rune symbols
        console.log('\n\n🔮 TEST 2: Falling rune symbols present');
        console.log('-'.repeat(70));

        await page.waitForTimeout(3000); // Wait for runes to be created

        const runeCount = await page.locator('.rune-particle').count();
        if (runeCount > 0) {
            results.passed.push(`✅ Falling runes present (${runeCount} visible)`);
            console.log(`✅ PASS: ${runeCount} falling rune symbols detected`);
        } else {
            results.failed.push('❌ No falling runes visible');
            console.log('❌ FAIL: No falling rune symbols detected');
        }

        // Check if runes-container exists
        const containerExists = await page.locator('#runes-container').count() > 0;
        if (containerExists) {
            results.passed.push('✅ Runes container div exists');
            console.log('✅ Runes container exists in DOM');
        } else {
            results.failed.push('❌ Runes container missing');
            console.log('❌ Runes container missing from DOM');
        }

        await page.screenshot({ path: 'test_runes_visible.png' });
        console.log('📸 Screenshot: test_runes_visible.png');


        // TEST 3: Create game and check question progression
        console.log('\n\n🎮 TEST 3: Question progression test');
        console.log('-'.repeat(70));

        // Set username if needed
        const usernameFormVisible = await page.locator('#username-form').isVisible().catch(() => false);
        if (usernameFormVisible) {
            await page.fill('#username-form input[name="username"]', 'TestPlayer');
            await page.click('#username-form button[type="submit"]');
            await page.waitForTimeout(1500);
        }

        // Create game
        await page.fill('#creator-name', 'QuestionTest');
        await page.click('button:has-text("Embark")');
        console.log('⏳ Creating game and waiting for interrogation...');
        await page.waitForTimeout(6000);

        // Get first question
        const question1 = await page.locator('.question-text').textContent().catch(() => 'ERROR');
        console.log(`📋 Question 1: ${question1.substring(0, 60)}...`);

        if (question1 && question1 !== 'ERROR' && !question1.includes('Loading')) {
            results.passed.push('✅ First question loaded');
        } else {
            results.failed.push('❌ First question failed to load');
        }

        // Answer first question
        await page.locator('.answer-option').first().click();
        console.log('⏳ Selecting first answer...');
        await page.waitForTimeout(5000);

        // Get second question
        const question2 = await page.locator('.question-text').textContent().catch(() => 'ERROR');
        console.log(`📋 Question 2: ${question2.substring(0, 60)}...`);

        if (question1 !== question2 && question2 !== 'ERROR' && !question2.includes('Loading')) {
            results.passed.push('✅ Question progression works (questions are different)');
            console.log('✅ PASS: Questions progressed correctly');
        } else if (question1 === question2) {
            results.failed.push('❌ Same question shown twice');
            console.log('❌ FAIL: Same question repeated');
        } else {
            results.failed.push('❌ Second question failed to load');
            console.log('❌ FAIL: Second question failed');
        }

        await page.screenshot({ path: 'test_question_progression.png' });
        console.log('📸 Screenshot: test_question_progression.png');


        // FINAL SUMMARY
        console.log('\n\n' + '='.repeat(70));
        console.log('📊 TEST RESULTS SUMMARY');
        console.log('='.repeat(70));

        console.log(`\n✅ PASSED (${results.passed.length}):`);
        results.passed.forEach(item => console.log(`   ${item}`));

        if (results.failed.length > 0) {
            console.log(`\n❌ FAILED (${results.failed.length}):`);
            results.failed.forEach(item => console.log(`   ${item}`));
        } else {
            console.log('\n🎉 ALL TESTS PASSED!');
        }

        console.log('\n' + '='.repeat(70));
        console.log('Keeping browser open for 20 seconds...');
        await page.waitForTimeout(20000);

    } catch (error) {
        console.error('\n❌ Test Error:', error.message);
        await page.screenshot({ path: 'test_error.png' });
    }

    await browser.close();
    console.log('\n✅ Tests complete!\n');
})();
