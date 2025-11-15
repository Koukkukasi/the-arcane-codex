const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1920, height: 1080 });

    await page.goto('file:///C:/Users/ilmiv/ProjectArgent/complete_game/static/arcane_codex_scenario_ui_enhanced.html');
    await page.waitForTimeout(2000);

    const overlays = [
        { key: 'c', name: 'Character', id: 'character-overlay' },
        { key: 'i', name: 'Inventory', id: 'inventory-overlay' },
        { key: 'k', name: 'Skills', id: 'skills-overlay' },
        { key: 'j', name: 'Quests', id: 'quests-overlay' },
        { key: 'm', name: 'Map', id: 'map-overlay' },
    ];

    for (const overlay of overlays) {
        console.log(`\nTesting ${overlay.name} overlay...`);

        // Open
        await page.keyboard.press(overlay.key);
        await page.waitForTimeout(500);

        const isOpen = await page.evaluate((id) => {
            const el = document.getElementById(id);
            return el ? el.classList.contains('active') : false;
        }, overlay.id);

        console.log(`  ✓ Opens: ${isOpen ? 'YES' : 'NO'}`);

        // Close with same key
        await page.keyboard.press(overlay.key);
        await page.waitForTimeout(500);

        const isClosed = await page.evaluate((id) => {
            const el = document.getElementById(id);
            return el ? !el.classList.contains('active') : true;
        }, overlay.id);

        console.log(`  ✓ Closes with key: ${isClosed ? 'YES' : 'NO'}`);
    }

    console.log('\n✅ All overlays tested!');
    await browser.close();
})();
