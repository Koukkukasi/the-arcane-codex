// Test color consistency between landing and game pages
const { chromium } = require('playwright');

(async () => {
    console.log('🎨 Testing color consistency...\n');

    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();

    // Screenshot landing page
    await page.goto('http://localhost:5000');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'landing_colors.png', fullPage: true });
    console.log('✅ Landing page screenshot saved');

    // Screenshot game page
    await page.goto('http://localhost:5000/game');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'game_colors.png', fullPage: true });
    console.log('✅ Game page screenshot saved');

    console.log('\n📸 Screenshots saved:');
    console.log('   - landing_colors.png');
    console.log('   - game_colors.png');
    console.log('\nBoth should now use consistent #ffd700 gold!');

    await page.waitForTimeout(2000);
    await browser.close();
})();
