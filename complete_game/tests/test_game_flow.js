// Test the complete game flow with Playwright
const { chromium } = require('playwright');

(async () => {
    console.log('🚀 Starting game flow test...\n');

    // Launch browser
    const browser = await chromium.launch({ headless: false, slowMo: 1000 });

    // Test 1: Landing page loads
    console.log('📄 Test 1: Loading landing page...');
    const page = await browser.newPage();
    await page.goto('http://localhost:5000');
    await page.waitForTimeout(2000);
    console.log('✅ Landing page loaded\n');

    // Test 2: Click PLAY button
    console.log('🎮 Test 2: Clicking PLAY button...');
    await page.click('button:has-text("PLAY")');
    await page.waitForTimeout(3000);

    // Check what URL we're on
    const currentUrl = page.url();
    console.log(`📍 Current URL: ${currentUrl}\n`);

    // Test 3: Check if game page loaded
    if (currentUrl.includes('/game')) {
        console.log('✅ Navigated to /game page\n');

        // Check for errors
        const hasError = await page.locator('text=/error|Error|400|404/i').count();
        if (hasError > 0) {
            console.log('❌ Found error on page!');
            const errorText = await page.locator('text=/error|Error/i').first().textContent();
            console.log(`   Error: ${errorText}\n`);
        }

        // Check if create/join UI exists
        const hasCreateButton = await page.locator('button:has-text("Create")').count();
        const hasJoinButton = await page.locator('button:has-text("Join")').count();
        const hasGameCodeInput = await page.locator('input[placeholder*="code" i]').count();

        console.log('🔍 Checking for lobby UI elements:');
        console.log(`   Create button: ${hasCreateButton > 0 ? '✅' : '❌'}`);
        console.log(`   Join button: ${hasJoinButton > 0 ? '✅' : '❌'}`);
        console.log(`   Game code input: ${hasGameCodeInput > 0 ? '✅' : '❌'}\n`);

        if (hasCreateButton === 0 && hasJoinButton === 0) {
            console.log('⚠️  ISSUE FOUND: No create/join UI on /game page!');
            console.log('   The page needs a lobby screen with:');
            console.log('   1. Button to CREATE new game');
            console.log('   2. Input + button to JOIN existing game\n');
        }

        // Take screenshot
        await page.screenshot({ path: 'game_page_state.png' });
        console.log('📸 Screenshot saved: game_page_state.png\n');

    } else {
        console.log(`❌ Did not navigate to /game (ended up at ${currentUrl})\n`);
    }

    console.log('\n📊 Test Summary:');
    console.log('='.repeat(50));
    console.log('ISSUE: /game page expects existing session');
    console.log('NEEDED: Add lobby screen with create/join buttons');
    console.log('='.repeat(50));

    await browser.close();
    console.log('\n✅ Test complete!');
})();
