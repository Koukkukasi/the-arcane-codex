const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1920, height: 1080 });

    // Listen for console and errors
    page.on('console', msg => console.log('BROWSER:', msg.text()));
    page.on('pageerror', error => console.log('ERROR:', error.message));

    await page.goto('file:///C:/Users/ilmiv/ProjectArgent/complete_game/static/arcane_codex_scenario_ui_enhanced.html');
    await page.waitForTimeout(2000);

    console.log('Opening skills overlay with K...');
    await page.keyboard.press('k');
    await page.waitForTimeout(1000);

    const skillsOpen = await page.evaluate(() => {
        const overlay = document.getElementById('skills-overlay');
        return overlay ? overlay.classList.contains('active') : false;
    });
    console.log('Skills overlay open:', skillsOpen);

    await page.screenshot({ path: 'skills_opened.png' });

    // Try pressing K again to close
    console.log('Pressing K again to close...');
    await page.keyboard.press('k');
    await page.waitForTimeout(1000);

    const skillsClosed1 = await page.evaluate(() => {
        const overlay = document.getElementById('skills-overlay');
        return overlay ? !overlay.classList.contains('active') : true;
    });
    console.log('Skills closed after K:', skillsClosed1);

    // If not closed, try ESC
    if (!skillsClosed1) {
        console.log('K didnt work, trying ESC...');
        await page.keyboard.press('Escape');
        await page.waitForTimeout(1000);

        const skillsClosed2 = await page.evaluate(() => {
            const overlay = document.getElementById('skills-overlay');
            return overlay ? !overlay.classList.contains('active') : true;
        });
        console.log('Skills closed after ESC:', skillsClosed2);
    }

    // Check if close button exists
    const closeButtonExists = await page.evaluate(() => {
        const overlay = document.getElementById('skills-overlay');
        if (!overlay) return false;
        const closeBtn = overlay.querySelector('.close-btn');
        return closeBtn !== null;
    });
    console.log('Close button exists:', closeButtonExists);

    await page.screenshot({ path: 'skills_close_test.png' });
    await browser.close();
})();
