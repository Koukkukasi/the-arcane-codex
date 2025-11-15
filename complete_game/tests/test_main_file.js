const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1920, height: 1080 });

    console.log('Loading main file: arcane_codex_scenario_ui_enhanced.html');
    await page.goto('file:///C:/Users/ilmiv/ProjectArgent/complete_game/static/arcane_codex_scenario_ui_enhanced.html');
    await page.waitForTimeout(2000);

    // Base UI
    await page.screenshot({ path: 'main_ui_base.png', fullPage: false });

    // Test Inventory
    await page.keyboard.press('i');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'main_ui_inventory.png', fullPage: false });

    console.log('Success! Main file is working with enhanced styles.');
    await browser.close();
})();
