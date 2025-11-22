const { chromium } = require('playwright');

async function testSimpleLoad() {
    console.log('\n🔍 Simple Load Test - Check What HTML is Served\n');

    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();

    // Log all console messages
    page.on('console', msg => console.log(`[CONSOLE ${msg.type()}]:`, msg.text()));

    // Log all requests
    page.on('request', req => {
        if (req.url().includes('localhost:5000')) {
            console.log(`[REQUEST] ${req.method()} ${req.url()}`);
        }
    });

    // Log all responses
    page.on('response', async res => {
        if (res.url().includes('localhost:5000')) {
            console.log(`[RESPONSE] ${res.status()} ${res.url()}`);
        }
    });

    try {
        console.log('Navigating to http://localhost:5000...');
        await page.goto('http://localhost:5000', { waitUntil: 'networkidle', timeout: 10000 });

        console.log('\nPage loaded. Getting title and first few elements...\n');

        const title = await page.title();
        console.log(`Title: ${title}`);

        const h1 = await page.$('h1');
        if (h1) {
            const h1Text = await h1.textContent();
            console.log(`H1: ${h1Text}`);
        } else {
            console.log('No H1 found');
        }

        // Check for menu screen
        const menuScreen = await page.$('#menu');
        console.log(`Menu screen found: ${menuScreen !== null}`);

        // Check for buttons
        const buttons = await page.$$('button');
        console.log(`Number of buttons found: ${buttons.length}`);

        if (buttons.length > 0) {
            console.log('\nButton texts:');
            for (let i = 0; i < Math.min(5, buttons.length); i++) {
                const text = await buttons[i].textContent();
                console.log(`  ${i + 1}. "${text}"`);
            }
        }

        // Get page content to check what's being served
        const bodyHTML = await page.evaluate(() => document.body.innerHTML.substring(0, 500));
        console.log('\nFirst 500 chars of body HTML:');
        console.log(bodyHTML);

        console.log('\nKeeping browser open for 10 seconds for manual inspection...');
        await page.waitForTimeout(10000);

    } catch (error) {
        console.error('ERROR:', error.message);
    } finally {
        await browser.close();
    }
}

testSimpleLoad().catch(console.error);
