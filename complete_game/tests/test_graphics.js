// Test graphics and complete game flow
const { chromium } = require('playwright');

(async () => {
    console.log('🎮 THE ARCANE CODEX - GRAPHICS TEST\n');

    const browser = await chromium.launch({
        headless: false,
        slowMo: 800
    });

    const page = await browser.newPage();

    try {
        // TEST 1: Landing Page Graphics
        console.log('📄 TEST 1: Landing Page Graphics');
        await page.goto('http://localhost:5000', { waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);

        await page.screenshot({ path: 'test_1_landing_graphics.png', fullPage: true });
        console.log('✅ Landing page screenshot saved');

        // TEST 2: Game Page Graphics
        console.log('\n🎮 TEST 2: Game Page Graphics');
        await page.click('button:has-text("PLAY")');
        await page.waitForTimeout(3000);

        const currentUrl = page.url();
        console.log('Current URL:', currentUrl);

        if (currentUrl.includes('/game')) {
            await page.screenshot({ path: 'test_2_game_graphics.png', fullPage: true });
            console.log('✅ Game page screenshot saved');

            // Check CSS files
            const cssLinks = await page.$$eval('link[rel="stylesheet"]', links =>
                links.map(link => link.href)
            );
            console.log('\nCSS Files:');
            cssLinks.forEach(css => console.log('  -', css));

            // Check lobby visibility
            const lobbyVisible = await page.locator('#lobby-screen').isVisible();
            console.log('\nLobby visible:', lobbyVisible);

        } else {
            console.log('❌ Did not navigate to /game');
        }

        console.log('\n✅ Check screenshots to compare graphics');
        console.log('   test_1_landing_graphics.png - Should have Medieval Fantasy CRT');
        console.log('   test_2_game_graphics.png - Should match landing page style');

        await page.waitForTimeout(20000);

    } catch (error) {
        console.error('❌ Error:', error.message);
        await page.screenshot({ path: 'test_error.png', fullPage: true });
    } finally {
        await browser.close();
    }
})();
