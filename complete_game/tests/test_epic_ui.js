// Test Epic UI and AI GM functionality
const { chromium } = require('playwright');

(async () => {
    console.log('⚔️  Testing Epic UI & AI GM...\n');

    const browser = await chromium.launch({ headless: false, slowMo: 500 });
    const page = await browser.newPage();

    // Capture console messages
    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.log('❌ Browser error:', msg.text());
        }
    });

    try {
        // Test 1: Navigate to game page
        console.log('📍 Test 1: Loading game page...');
        await page.goto('http://localhost:5000/game');
        await page.waitForTimeout(2000);

        // Take screenshot of epic lobby
        await page.screenshot({ path: 'epic_lobby_ui.png', fullPage: true });
        console.log('✅ Epic lobby screenshot saved: epic_lobby_ui.png\n');

        // Check for epic UI elements
        const hasEpicTitle = await page.locator('text=/⚔.*Arcane Codex.*⚔/i').count();
        const hasGoldenButtons = await page.locator('.btn-primary').count();
        const hasCreateForm = await page.locator('#create-game-form').count();

        console.log('🎨 Epic UI Check:');
        console.log(`   Epic title: ${hasEpicTitle > 0 ? '✅' : '❌'}`);
        console.log(`   Golden buttons: ${hasGoldenButtons > 0 ? '✅' : '❌'}`);
        console.log(`   Create form: ${hasCreateForm > 0 ? '✅' : '❌'}\n`);

        // Test 2: Create a game
        console.log('🎮 Test 2: Creating game...');
        await page.fill('#creator-name', 'TestHero');
        await page.waitForTimeout(500);

        // Take screenshot of filled form
        await page.screenshot({ path: 'epic_lobby_filled.png' });
        console.log('📸 Filled form screenshot saved\n');

        await page.click('button:has-text("Embark")');
        await page.waitForTimeout(3000);

        // Check if interrogation started
        const interrogationVisible = await page.locator('#interrogation-screen').isVisible();
        console.log(`   Interrogation screen: ${interrogationVisible ? '✅' : '❌'}\n`);

        if (interrogationVisible) {
            // Wait for AI question to load
            console.log('🤖 Test 3: Waiting for AI-generated question...');
            await page.waitForTimeout(5000);

            // Take screenshot of interrogation
            await page.screenshot({ path: 'epic_interrogation.png', fullPage: true });
            console.log('✅ Interrogation screenshot saved: epic_interrogation.png\n');

            // Check for question text
            const questionText = await page.locator('#question-text').textContent();
            const hasOptions = await page.locator('.answer-options button').count();

            console.log('📝 AI Question Check:');
            console.log(`   Question loaded: ${questionText.length > 20 ? '✅' : '❌'}`);
            console.log(`   Options available: ${hasOptions >= 4 ? '✅' : '❌'}`);
            console.log(`   Question preview: "${questionText.substring(0, 100)}..."\n`);

            if (hasOptions >= 4) {
                console.log('✅ AI GM is working! Questions generated successfully!\n');
            } else {
                console.log('❌ No options found - check MCP connection\n');
            }
        } else {
            console.log('❌ Interrogation screen not visible\n');
        }

        console.log('━'.repeat(60));
        console.log('✅ TEST COMPLETE - Check screenshots:');
        console.log('   1. epic_lobby_ui.png - Epic lobby styling');
        console.log('   2. epic_lobby_filled.png - Form filled in');
        console.log('   3. epic_interrogation.png - AI-generated question');
        console.log('━'.repeat(60));

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        await page.screenshot({ path: 'epic_ui_error.png' });
        console.log('📸 Error screenshot saved: epic_ui_error.png');
    } finally {
        await page.waitForTimeout(5000); // Let user see the UI
        await browser.close();
    }
})();
