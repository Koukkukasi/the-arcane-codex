const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1920, height: 1080 });

    // Listen for console messages
    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));

    // Listen for errors
    page.on('pageerror', error => console.log('BROWSER ERROR:', error.message));

    // Load the HTML file
    await page.goto('file:///C:/Users/ilmiv/ProjectArgent/complete_game/static/arcane_codex_scenario_ui_enhanced.html');
    await page.waitForTimeout(2000);

    // Check if overlay exists in DOM
    const overlayExists = await page.evaluate(() => {
        const overlay = document.getElementById('inventory-overlay');
        if (!overlay) return 'Overlay element not found in DOM';

        const computedStyle = window.getComputedStyle(overlay);
        return {
            exists: true,
            classes: overlay.className,
            display: computedStyle.display,
            visibility: computedStyle.visibility,
            opacity: computedStyle.opacity,
            zIndex: computedStyle.zIndex
        };
    });

    console.log('Overlay check:', JSON.stringify(overlayExists, null, 2));

    // Try pressing 'i' key
    console.log('Pressing "i" key...');
    await page.keyboard.press('i');
    await page.waitForTimeout(1000);

    // Check overlay state after keypress
    const overlayAfterKey = await page.evaluate(() => {
        const overlay = document.getElementById('inventory-overlay');
        if (!overlay) return 'Overlay not found';

        const computedStyle = window.getComputedStyle(overlay);
        return {
            classes: overlay.className,
            display: computedStyle.display,
            visibility: computedStyle.visibility,
            opacity: computedStyle.opacity,
            hasActive: overlay.classList.contains('active')
        };
    });

    console.log('Overlay after key press:', JSON.stringify(overlayAfterKey, null, 2));

    // Take screenshot
    await page.screenshot({ path: 'inventory_debug.png', fullPage: false });

    await browser.close();
})();
