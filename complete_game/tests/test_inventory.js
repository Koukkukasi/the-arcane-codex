const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1920, height: 1080 });

    // Load the HTML file
    await page.goto('file:///C:/Users/ilmiv/ProjectArgent/complete_game/static/arcane_codex_scenario_ui_enhanced.html');
    await page.waitForTimeout(1000);

    // Try pressing 'i' key
    console.log('Pressing "i" key to open inventory...');
    await page.keyboard.press('i');
    await page.waitForTimeout(1000);

    // Check if inventory overlay is visible
    const inventoryVisible = await page.isVisible('#inventory-overlay.active');
    console.log('Inventory overlay visible:', inventoryVisible);

    // Take screenshot
    await page.screenshot({ path: 'inventory_overlay_test.png', fullPage: false });

    // Try clicking the inventory button instead
    console.log('Trying to click inventory button...');
    await page.keyboard.press('Escape'); // Close any open overlay
    await page.waitForTimeout(500);

    const inventoryButton = await page.locator('button[title*="Inventory"], button:has-text("🎒")').first();
    if (await inventoryButton.isVisible()) {
        await inventoryButton.click();
        await page.waitForTimeout(1000);
        const inventoryVisibleAfterClick = await page.isVisible('#inventory-overlay.active');
        console.log('Inventory overlay visible after button click:', inventoryVisibleAfterClick);
        await page.screenshot({ path: 'inventory_overlay_click_test.png', fullPage: false });
    } else {
        console.log('Inventory button not found');
    }

    await browser.close();
})();
