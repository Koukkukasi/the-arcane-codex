const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1920, height: 1080 });

    page.on('console', msg => console.log('BROWSER:', msg.text()));
    page.on('pageerror', error => console.log('ERROR:', error.message));

    console.log('Loading main game with new map...');
    await page.goto('file:///C:/Users/ilmiv/ProjectArgent/complete_game/static/arcane_codex_scenario_ui_enhanced.html');
    await page.waitForTimeout(2000);

    // Base UI
    await page.screenshot({ path: 'integrated_map_base.png', fullPage: false });
    console.log('Screenshot 1: Base UI');

    // Open map with M key
    console.log('Opening map overlay with M...');
    await page.keyboard.press('m');
    await page.waitForTimeout(2000);

    const mapOpen = await page.evaluate(() => {
        const overlay = document.getElementById('map-overlay');
        return overlay ? overlay.classList.contains('active') : false;
    });
    console.log('Map overlay open:', mapOpen);

    await page.screenshot({ path: 'integrated_map_open.png', fullPage: false });
    console.log('Screenshot 2: Map overlay');

    // Try closing with M
    console.log('Closing map with M...');
    await page.keyboard.press('m');
    await page.waitForTimeout(1000);

    const mapClosed = await page.evaluate(() => {
        const overlay = document.getElementById('map-overlay');
        return overlay ? !overlay.classList.contains('active') : true;
    });
    console.log('Map closed:', mapClosed);

    console.log('✅ Map integration test complete!');
    await browser.close();
})();
