const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1920, height: 1080 });

    // Test style guide
    console.log('Loading style guide...');
    await page.goto('file:///C:/Users/ilmiv/ProjectArgent/complete_game/static/arcane_codex_style_guide.html');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'style_guide_showcase.png', fullPage: true });

    await browser.close();
})();
