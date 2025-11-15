// Test answering questions to verify fix
const { chromium } = require('playwright');

(async () => {
    console.log('\n🧪 Testing answer submission flow...\n');

    const browser = await chromium.launch({ headless: false, slowMo: 800 });
    const page = await browser.newPage();

    // Monitor console for errors
    page.on('console', msg => {
        const text = msg.text();
        if (text.includes('400') || text.includes('error') || text.includes('Error')) {
            console.log('❌ Console Error:', text);
        }
    });

    try {
        // Go to game page
        await page.goto('http://localhost:5000/game');
        await page.waitForTimeout(2000);

        // Create game
        await page.fill('#creator-name', 'TestPlayer');
        await page.click('button:has-text("Embark")');
        console.log('✓ Creating game...');
        await page.waitForTimeout(5000);

        // Get first question text
        const question1 = await page.locator('.question-text').textContent();
        console.log('\n📋 Question 1:', question1.substring(0, 60) + '...');

        // Click first answer
        console.log('⏳ Selecting first answer...');
        await page.locator('.answer-option').first().click();
        await page.waitForTimeout(4000);

        // Get second question text
        const question2 = await page.locator('.question-text').textContent();
        console.log('\n📋 Question 2:', question2.substring(0, 60) + '...');

        // Compare questions
        if (question1 === question2) {
            console.log('\n❌ PROBLEM: Same question shown twice!');
            console.log('   The fix is not working or browser cache is stale.');
            console.log('   Try hard refresh (Ctrl+Shift+R)');
        } else {
            console.log('\n✅ SUCCESS: New question displayed!');

            // Try one more
            await page.locator('.answer-option').first().click();
            await page.waitForTimeout(4000);

            const question3 = await page.locator('.question-text').textContent();
            console.log('\n📋 Question 3:', question3.substring(0, 60) + '...');

            if (question3 !== question2) {
                console.log('✅ Question progression working correctly!');
            }
        }

        console.log('\nBrowser will stay open for 20 seconds...');
        await page.waitForTimeout(20000);

    } catch (error) {
        console.error('Error:', error.message);
        await page.screenshot({ path: 'error_answer_test.png' });
    }

    await browser.close();
})();
