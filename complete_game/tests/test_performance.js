// Performance test to identify slow points
const { chromium } = require('playwright');

(async () => {
    console.log('\n⚡ Performance Analysis\n');
    console.log('='.repeat(70));

    const browser = await chromium.launch({ headless: false, slowMo: 500 });
    const page = await browser.newPage();

    const timings = {};

    try {
        // Measure page load
        console.log('\n📊 Measuring page load time...');
        const loadStart = Date.now();
        await page.goto('http://localhost:5000/game');
        timings.pageLoad = Date.now() - loadStart;
        console.log(`✓ Page loaded in ${timings.pageLoad}ms`);

        await page.waitForTimeout(1000);

        // Measure username submission
        console.log('\n📊 Measuring username submission...');
        const usernameFormVisible = await page.locator('#username-form').isVisible().catch(() => false);

        if (usernameFormVisible) {
            const usernameStart = Date.now();
            await page.fill('#username-form input[name="username"]', 'PerfTest');
            await page.click('#username-form button[type="submit"]');
            await page.waitForTimeout(2000);
            timings.usernameSubmit = Date.now() - usernameStart;
            console.log(`✓ Username submitted in ${timings.usernameSubmit}ms`);
        }

        // Measure game creation
        console.log('\n📊 Measuring game creation...');
        const createStart = Date.now();
        await page.fill('#creator-name', 'PerfTest');
        await page.click('button:has-text("Embark")');

        // Wait for interrogation to start
        await page.waitForSelector('.question-text', { timeout: 15000 });
        timings.gameCreate = Date.now() - createStart;
        console.log(`✓ Game created and interrogation started in ${timings.gameCreate}ms`);

        // Measure question loading
        console.log('\n📊 Measuring question response time...');
        const questionText1 = await page.locator('.question-text').textContent();
        console.log(`Question 1: ${questionText1.substring(0, 50)}...`);

        // Measure answer submission
        console.log('\n📊 Measuring answer submission time...');
        const answerStart = Date.now();
        await page.locator('.answer-option').first().click();

        // Wait for next question
        await page.waitForTimeout(1000);
        let newQuestion = await page.locator('.question-text').textContent();
        let attempts = 0;
        while (newQuestion === questionText1 && attempts < 10) {
            await page.waitForTimeout(1000);
            newQuestion = await page.locator('.question-text').textContent();
            attempts++;
        }

        timings.answerSubmit = Date.now() - answerStart;
        console.log(`✓ Answer processed and new question loaded in ${timings.answerSubmit}ms`);
        console.log(`Question 2: ${newQuestion.substring(0, 50)}...`);

        // Summary
        console.log('\n\n' + '='.repeat(70));
        console.log('⚡ PERFORMANCE SUMMARY');
        console.log('='.repeat(70));
        console.log(`\nPage Load:           ${timings.pageLoad}ms`);
        if (timings.usernameSubmit) {
            console.log(`Username Submit:     ${timings.usernameSubmit}ms`);
        }
        console.log(`Game Creation:       ${timings.gameCreate}ms ${timings.gameCreate > 5000 ? '⚠️ SLOW' : '✅'}`);
        console.log(`Answer Submit:       ${timings.answerSubmit}ms ${timings.answerSubmit > 3000 ? '⚠️ SLOW' : '✅'}`);

        console.log('\n' + '='.repeat(70));
        console.log('ANALYSIS:');
        console.log('='.repeat(70));

        if (timings.gameCreate > 5000) {
            console.log('\n⚠️  Game creation is SLOW (>5s)');
            console.log('   This is likely due to:');
            console.log('   1. OpenAI API call to generate first question');
            console.log('   2. Initial game state setup on backend');
            console.log('   Suggestion: Add better loading states');
        }

        if (timings.answerSubmit > 3000) {
            console.log('\n⚠️  Answer submission is SLOW (>3s)');
            console.log('   This is likely due to:');
            console.log('   1. OpenAI API call to generate next question');
            console.log('   2. Backend processing answer');
            console.log('   Suggestion: Consider caching or pre-generating questions');
        }

        console.log('\nKeeping browser open for 10 seconds...');
        await page.waitForTimeout(10000);

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        await page.screenshot({ path: 'perf_error.png' });
    }

    await browser.close();
    console.log('\n✅ Performance analysis complete!\n');
})();
