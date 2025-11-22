/**
 * Quick script to inspect the initial game page
 */

const { chromium } = require('playwright');

async function inspectPage() {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

    try {
        await page.goto('http://localhost:5000');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        // Take screenshot
        await page.screenshot({ path: 'test-results/initial-page.png', fullPage: true });
        console.log('📸 Screenshot saved: test-results/initial-page.png');

        // Get all visible buttons
        const buttons = await page.$$eval('button', btns =>
            btns.filter(b => b.offsetParent !== null).map(b => ({
                text: b.textContent.trim(),
                id: b.id,
                className: b.className
            }))
        );

        console.log('\n📋 Visible buttons:');
        buttons.forEach((btn, i) => {
            console.log(`  ${i + 1}. "${btn.text}" (id: ${btn.id || 'none'}, class: ${btn.className || 'none'})`);
        });

        // Get all visible inputs
        const inputs = await page.$$eval('input', inps =>
            inps.filter(i => i.offsetParent !== null).map(i => ({
                type: i.type,
                id: i.id,
                placeholder: i.placeholder
            }))
        );

        console.log('\n📝 Visible inputs:');
        inputs.forEach((inp, i) => {
            console.log(`  ${i + 1}. Type: ${inp.type}, ID: ${inp.id || 'none'}, Placeholder: "${inp.placeholder}"`);
        });

        // Keep browser open for 5 seconds
        console.log('\n⏳ Browser will stay open for 5 seconds...');
        await page.waitForTimeout(5000);

    } finally {
        await browser.close();
    }
}

inspectPage().catch(console.error);
