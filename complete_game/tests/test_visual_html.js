const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1920, height: 1080 });

    // Listen for console messages and errors
    page.on('console', msg => console.log('BROWSER:', msg.text()));
    page.on('pageerror', error => console.log('ERROR:', error.message));

    console.log('Attempting to load arcane_codex_scenario_ui_enhanced_visual.html...');
    try {
        await page.goto('file:///C:/Users/ilmiv/ProjectArgent/complete_game/static/arcane_codex_scenario_ui_enhanced_visual.html', {
            waitUntil: 'domcontentloaded',
            timeout: 10000
        });
        console.log('Page loaded successfully');
        await page.waitForTimeout(2000);
        await page.screenshot({ path: 'visual_html_test.png' });
        console.log('Screenshot saved');
    } catch (error) {
        console.log('Failed to load:', error.message);
    }

    await browser.close();
})();
