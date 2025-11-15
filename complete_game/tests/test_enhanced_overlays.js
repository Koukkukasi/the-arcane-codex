const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1920, height: 1080 });

    // Test enhanced visual HTML
    console.log('Loading enhanced UI...');
    await page.goto('file:///C:/Users/ilmiv/ProjectArgent/complete_game/static/arcane_codex_scenario_ui_enhanced_visual.html');
    await page.waitForTimeout(2000);

    // Base UI
    console.log('Screenshot 1: Base UI');
    await page.screenshot({ path: 'enhanced_ui_base.png', fullPage: false });

    // Test Inventory overlay
    console.log('Opening inventory...');
    await page.keyboard.press('i');
    await page.waitForTimeout(1000);
    console.log('Screenshot 2: Inventory Overlay');
    await page.screenshot({ path: 'enhanced_ui_inventory.png', fullPage: false });
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    // Test Character overlay
    console.log('Opening character...');
    await page.keyboard.press('c');
    await page.waitForTimeout(1000);
    console.log('Screenshot 3: Character Overlay');
    await page.screenshot({ path: 'enhanced_ui_character.png', fullPage: false });
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    // Test Skills overlay
    console.log('Opening skills...');
    await page.keyboard.press('k');
    await page.waitForTimeout(1000);
    console.log('Screenshot 4: Skills Overlay');
    await page.screenshot({ path: 'enhanced_ui_skills.png', fullPage: false });
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    // Test Quest overlay
    console.log('Opening quests...');
    await page.keyboard.press('j');
    await page.waitForTimeout(1000);
    console.log('Screenshot 5: Quest Overlay');
    await page.screenshot({ path: 'enhanced_ui_quests.png', fullPage: false });
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    // Test Map overlay
    console.log('Opening map...');
    await page.keyboard.press('m');
    await page.waitForTimeout(1000);
    console.log('Screenshot 6: Map Overlay');
    await page.screenshot({ path: 'enhanced_ui_map.png', fullPage: false });

    console.log('All screenshots captured!');
    await browser.close();
})();
