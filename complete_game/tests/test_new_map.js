const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1920, height: 1080 });

    // Test the standalone enhanced map
    console.log('Loading enhanced map system...');
    await page.goto('file:///C:/Users/ilmiv/ProjectArgent/complete_game/static/map_system_enhanced.html');
    await page.waitForTimeout(2000);

    await page.screenshot({ path: 'new_map_system.png', fullPage: false });
    console.log('Screenshot 1: Enhanced map system');

    // Click on a location
    console.log('Testing location interaction...');
    await page.mouse.click(400, 350); // Click near center
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'new_map_interaction.png', fullPage: false });
    console.log('Screenshot 2: Map interaction');

    // Test minimap toggle if it exists
    const minimapButton = await page.locator('button:has-text("Minimap"), button:has-text("Toggle")').first();
    if (await minimapButton.isVisible().catch(() => false)) {
        await minimapButton.click();
        await page.waitForTimeout(500);
        await page.screenshot({ path: 'new_map_minimap.png', fullPage: false });
        console.log('Screenshot 3: Minimap view');
    }

    console.log('✅ Map system screenshots complete!');
    await browser.close();
})();
