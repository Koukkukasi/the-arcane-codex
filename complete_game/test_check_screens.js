const { chromium } = require('playwright');

async function checkScreens() {
    console.log('\n🔍 Checking Screen Visibility\n');

    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();

    page.on('console', msg => console.log(`[CONSOLE]:`, msg.text()));

    try {
        await page.goto('http://localhost:5000', { waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);

        console.log('\nChecking which screens are active/visible...\n');

        // Check for all screen divs
        const screens = await page.$$('.screen');
        console.log(`Found ${screens.length} .screen elements`);

        for (let i = 0; i < screens.length; i++) {
            const screen = screens[i];
            const id = await screen.getAttribute('id');
            const isVisible = await screen.isVisible();
            const hasActiveClass = await screen.evaluate(el => el.classList.contains('active'));
            const display = await screen.evaluate(el => window.getComputedStyle(el).display);

            console.log(`Screen #${i + 1}:`);
            console.log(`  ID: ${id}`);
            console.log(`  Visible: ${isVisible}`);
            console.log(`  Has 'active' class: ${hasActiveClass}`);
            console.log(`  Display style: ${display}`);
        }

        console.log('\n Checking all visible buttons...\n');
        const visibleButtons = await page.$$('button:visible');
        console.log(`Found ${visibleButtons.length} visible buttons`);

        for (let i = 0; i < Math.min(10, visibleButtons.length); i++) {
            const btn = visibleButtons[i];
            const text = await btn.textContent();
            const onclick = await btn.getAttribute('onclick');
            console.log(`${i + 1}. "${text.trim()}" (onclick: ${onclick ? onclick.substring(0, 40) : 'none'}...)`);
        }

        console.log('\nKeeping browser open for 15 seconds...');
        await page.waitForTimeout(15000);

    } catch (error) {
        console.error('ERROR:', error);
    } finally {
        await browser.close();
    }
}

checkScreens().catch(console.error);
