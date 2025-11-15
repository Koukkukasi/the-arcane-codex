// UI/UX Analysis Test
const { chromium } = require('playwright');

(async () => {
    console.log('\n🎨 UI/UX Analysis Test\n');
    console.log('='.repeat(60));

    const browser = await chromium.launch({ headless: false, slowMo: 800 });
    const page = await browser.newPage();

    const issues = [];
    const successes = [];

    try {
        // Test 1: Landing Page
        console.log('\n📄 Test 1: Landing Page Analysis');
        console.log('-'.repeat(60));
        await page.goto('http://localhost:5000');
        await page.waitForTimeout(2000);

        // Check for rune particles
        const runeCount = await page.locator('.rune-particle').count();
        if (runeCount > 0) {
            successes.push(`✓ Rune particles present (${runeCount} visible)`);
        } else {
            issues.push('✗ Rune particles NOT visible');
        }

        // Check title styling
        const titleColor = await page.locator('.title').evaluate(el =>
            window.getComputedStyle(el).textShadow
        );
        if (titleColor.includes('0, 255, 0') || titleColor.includes('rgb(0, 255, 0)')) {
            successes.push('✓ Title has green glow effect');
        } else {
            issues.push('✗ Title missing green glow');
        }

        console.log('\n' + successes.join('\n'));
        if (issues.length > 0) console.log('\n' + issues.join('\n'));

        // Take screenshot
        await page.screenshot({ path: 'landing_ui_analysis.png', fullPage: true });
        console.log('\n📸 Screenshot: landing_ui_analysis.png');

        // Test 2: Game Page
        console.log('\n\n🎮 Test 2: Game Page Analysis');
        console.log('-'.repeat(60));
        successes.length = 0;
        issues.length = 0;

        await page.click('button:has-text("PLAY")');
        await page.waitForTimeout(3000);

        // Check for rune particles on game page
        const gameRuneCount = await page.locator('.rune-particle').count();
        if (gameRuneCount > 0) {
            successes.push(`✓ Rune particles on game page (${gameRuneCount} visible)`);
        } else {
            issues.push('✗ Rune particles NOT visible on game page');
        }

        // Check lobby UI
        const hasNameInput = await page.locator('#creator-name').count() > 0;
        const hasEmbarkButton = await page.locator('button:has-text("Embark")').count() > 0;

        if (hasNameInput) {
            successes.push('✓ Player name input present');
        } else {
            issues.push('✗ Player name input missing');
        }

        if (hasEmbarkButton) {
            successes.push('✓ Embark button present');
        } else {
            issues.push('✗ Embark button missing');
        }

        console.log('\n' + successes.join('\n'));
        if (issues.length > 0) console.log('\n' + issues.join('\n'));

        await page.screenshot({ path: 'game_lobby_ui_analysis.png', fullPage: true });
        console.log('\n📸 Screenshot: game_lobby_ui_analysis.png');

        // Test 3: Create Game and Check Interrogation UI
        console.log('\n\n🔮 Test 3: Interrogation Screen Analysis');
        console.log('-'.repeat(60));
        successes.length = 0;
        issues.length = 0;

        await page.fill('#creator-name', 'UITester');
        await page.click('button:has-text("Embark")');
        console.log('⏳ Creating game...');
        await page.waitForTimeout(6000);

        // Check multi-color elements
        const questionText = await page.locator('.question-text').first();
        if (await questionText.count() > 0) {
            const questionColor = await questionText.evaluate(el =>
                window.getComputedStyle(el).color
            );

            if (questionColor.includes('255, 255') || questionColor.includes('cyan')) {
                successes.push('✓ Question text has cyan color');
            } else {
                issues.push(`✗ Question text color: ${questionColor} (should be cyan)`);
            }
        }

        // Check answer buttons
        const answerButtons = await page.locator('.answer-option');
        const answerCount = await answerButtons.count();
        if (answerCount > 0) {
            successes.push(`✓ Answer buttons present (${answerCount})`);

            const answerBorder = await answerButtons.first().evaluate(el =>
                window.getComputedStyle(el).borderColor
            );

            if (answerBorder.includes('204, 136, 0') || answerBorder.includes('copper') || answerBorder.includes('orange')) {
                successes.push('✓ Answer buttons have orange/copper borders');
            } else {
                issues.push(`✗ Answer border color: ${answerBorder} (should be orange/copper)`);
            }
        } else {
            issues.push('✗ No answer buttons visible');
        }

        // Check title gradient
        const screenTitle = await page.locator('#interrogation-screen .screen-title').first();
        if (await screenTitle.count() > 0) {
            const bgImage = await screenTitle.evaluate(el =>
                window.getComputedStyle(el).backgroundImage
            );

            if (bgImage.includes('gradient') || bgImage !== 'none') {
                successes.push('✓ Title has gradient effect');
            } else {
                issues.push('✗ Title missing gradient effect');
            }
        }

        console.log('\n' + successes.join('\n'));
        if (issues.length > 0) console.log('\n' + issues.join('\n'));

        await page.screenshot({ path: 'interrogation_ui_analysis.png', fullPage: true });
        console.log('\n📸 Screenshot: interrogation_ui_analysis.png');

        // Test 4: Answer Interaction
        console.log('\n\n💫 Test 4: User Interaction Analysis');
        console.log('-'.repeat(60));

        const firstAnswer = answerButtons.first();

        // Check hover effect
        await firstAnswer.hover();
        await page.waitForTimeout(500);
        console.log('✓ Tested hover effect on answer button');

        // Click and check response
        await firstAnswer.click();
        console.log('✓ Clicked answer');
        await page.waitForTimeout(4000);

        // Check if new question loaded
        const newQuestionText = await page.locator('.question-text').first().textContent();
        if (newQuestionText && !newQuestionText.includes('Loading')) {
            successes.push('✓ New question loaded after answer');
        } else {
            issues.push('✗ Question did not progress after answer');
        }

        console.log('\n' + successes.join('\n'));
        if (issues.length > 0) console.log('\n' + issues.join('\n'));

        await page.screenshot({ path: 'after_answer_ui_analysis.png', fullPage: true });
        console.log('\n📸 Screenshot: after_answer_ui_analysis.png');

        // Final Summary
        console.log('\n\n' + '='.repeat(60));
        console.log('UI/UX ANALYSIS SUMMARY');
        console.log('='.repeat(60));
        console.log('\nAll screenshots saved for review.');
        console.log('\nKeeping browser open for 15 seconds...');
        await page.waitForTimeout(15000);

    } catch (error) {
        console.error('\n❌ Error during testing:', error.message);
        await page.screenshot({ path: 'ui_test_error.png' });
    }

    await browser.close();
    console.log('\n✅ UI/UX analysis complete!\n');
})();
