const { chromium } = require('playwright');

async function testGameCodeDebug() {
    console.log('\n🔍 Debugging Game Code Display\n');
    console.log('='.repeat(70));

    const browser = await chromium.launch({ headless: false, slowMo: 1000 });
    const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

    // Log ALL console messages
    page.on('console', msg => console.log(`[CONSOLE ${msg.type()}]:`, msg.text()));

    // Log ALL API requests
    page.on('request', req => {
        if (req.url().includes('/api/')) {
            console.log(`[API REQUEST] ${req.method()} ${req.url()}`);
        }
    });

    // Log ALL API responses
    page.on('response', async res => {
        if (res.url().includes('/api/')) {
            console.log(`[API RESPONSE] ${res.status()} ${res.url()}`);
            if (res.status() === 200) {
                try {
                    const data = await res.json();
                    console.log(`[RESPONSE DATA]:`, JSON.stringify(data, null, 2));
                } catch (e) {}
            }
        }
    });

    try {
        console.log('\n1️⃣ Navigate to game...');
        await page.goto('http://localhost:5000', { waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);

        console.log('\n2️⃣ Click "Create Game"...');
        await page.click('button:has-text("Create Game")');
        await page.waitForTimeout(5000); // Wait longer for API call

        console.log('\n3️⃣ Check DOM elements...');

        const gameCodeDisplay = await page.$('#gameCodeDisplay');
        const displayStyle = await gameCodeDisplay.evaluate(el => window.getComputedStyle(el).display);
        console.log(`gameCodeDisplay.style.display: ${displayStyle}`);

        const gameCodeText = await page.$('#gameCodeText');
        const gameCodeContent = await gameCodeText.textContent();
        console.log(`gameCodeText.textContent: "${gameCodeContent}"`);

        const isVisible = displayStyle !== 'none';
        console.log(`\nIs Visible: ${isVisible ? '✅ YES' : '❌ NO'}`);

        if (gameCodeContent && gameCodeContent.trim()) {
            console.log(`\n🎯 GAME CODE FOUND: ${gameCodeContent}`);
        }

        console.log('\n='.repeat(70));
        console.log('\nKeeping browser open for 20 seconds for manual inspection...');
        await page.waitForTimeout(20000);

    } catch (error) {
        console.error('\n❌ ERROR:', error.message);
        console.error(error.stack);
    } finally {
        await browser.close();
    }
}

testGameCodeDebug().catch(console.error);
