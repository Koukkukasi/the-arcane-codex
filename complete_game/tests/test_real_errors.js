const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();

    const consoleErrors = [];

    // Capture ALL console messages
    page.on('console', msg => {
        const type = msg.type();
        const text = msg.text();
        console.log(`[${type.toUpperCase()}] ${text}`);
        if (type === 'error') {
            consoleErrors.push(text);
        }
    });

    // Capture page errors
    page.on('pageerror', error => {
        console.log(`[PAGE ERROR] ${error.message}`);
        consoleErrors.push(error.message);
    });

    console.log('\n🔍 Loading page and checking for console errors...\n');

    try {
        await page.goto('http://localhost:5000');
        await page.waitForTimeout(3000);

        console.log('\n📊 CONSOLE ERRORS FOUND:');
        if (consoleErrors.length === 0) {
            console.log('✅ NO CONSOLE ERRORS!');
        } else {
            consoleErrors.forEach((err, i) => {
                console.log(`${i + 1}. ${err}`);
            });
        }

        await page.waitForTimeout(2000);

    } catch (error) {
        console.error('Test failed:', error);
    } finally {
        await browser.close();
    }
})();
