// Screenshot the epic sidebar
const { chromium } = require('playwright');

(async () => {
    console.log('📸 Capturing epic sidebar...\n');

    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();

    await page.goto('http://localhost:5000/game');
    await page.waitForTimeout(2000);

    // Take full page screenshot
    await page.screenshot({ path: 'epic_sidebar_new.png', fullPage: true });
    console.log('✅ Screenshot saved: epic_sidebar_new.png');

    await page.waitForTimeout(2000);
    await browser.close();
})();
