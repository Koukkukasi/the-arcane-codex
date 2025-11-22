const { chromium } = require('playwright');

async function testGameCreationDetailed() {
    console.log('\n🔍 DETAILED Game Creation Test\n');
    console.log('='.repeat(70));

    const browser = await chromium.launch({ headless: false, slowMo: 1500 });
    const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

    // Log ALL console messages
    page.on('console', msg => {
        const type = msg.type();
        const text = msg.text();
        console.log(`[BROWSER ${type.toUpperCase()}]: ${text}`);
    });

    // Log ALL API requests and responses
    page.on('request', req => {
        if (req.url().includes('/api/')) {
            console.log(`\n[API REQUEST] ${req.method()} ${req.url()}`);
            if (req.method() === 'POST') {
                try {
                    const data = req.postDataJSON();
                    console.log(`[POST DATA]: ${JSON.stringify(data)}`);
                } catch (e) {}
            }
        }
    });

    page.on('response', async res => {
        if (res.url().includes('/api/')) {
            console.log(`[API RESPONSE] ${res.status()} ${res.url()}`);
            if (res.status() !== 200) {
                try {
                    const data = await res.text();
                    console.log(`[ERROR DATA]: ${data}`);
                } catch (e) {}
            } else {
                try {
                    const data = await res.json();
                    console.log(`[SUCCESS DATA]: ${JSON.stringify(data, null, 2)}`);
                } catch (e) {}
            }
        }
    });

    try {
        console.log('\n📍 STEP 1: Navigate to game');
        console.log('-'.repeat(70));
        await page.goto('http://localhost:5000', { waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);

        console.log('\n📍 STEP 2: Click "Create Game"');
        console.log('-'.repeat(70));
        await page.click('button:has-text("Create Game")');
        await page.waitForTimeout(2000);

        // Check if we're on character creation screen
        const charCreationVisible = await page.$eval('#characterCreation', el =>
            window.getComputedStyle(el).display !== 'none'
        );
        console.log(`Character Creation Screen Visible: ${charCreationVisible ? '✅ YES' : '❌ NO'}`);

        if (!charCreationVisible) {
            console.log('❌ FAILED: Not on character creation screen!');
            console.log('Keeping browser open for inspection...');
            await page.waitForTimeout(30000);
            return;
        }

        console.log('\n📍 STEP 3: Enter player name "TestHero"');
        console.log('-'.repeat(70));
        await page.fill('#playerNameInput', 'TestHero');
        console.log('✅ Name entered');

        console.log('\n📍 STEP 4: Click "Face the Gods"');
        console.log('-'.repeat(70));
        await page.click('button:has-text("Face the Gods")');

        console.log('\nWaiting 8 seconds for all API calls to complete...');
        await page.waitForTimeout(8000);

        console.log('\n📍 STEP 5: Check final state');
        console.log('-'.repeat(70));

        // Check which screen we're on
        const screens = ['mainMenu', 'characterCreation', 'divineInterrogation', 'gameScreen'];
        for (const screenId of screens) {
            const isActive = await page.$eval(`#${screenId}`, el =>
                window.getComputedStyle(el).display !== 'none'
            );
            if (isActive) {
                console.log(`Current Screen: ${screenId}`);
            }
        }

        // Check for game code
        const codeVisible = await page.$eval('#interrogationGameCodeDisplay', el =>
            window.getComputedStyle(el).display !== 'none'
        ).catch(() => false);

        if (codeVisible) {
            const code = await page.textContent('#interrogationGameCodeText');
            console.log(`✅ Game Code Visible: ${code.trim()}`);
        } else {
            console.log(`❌ Game Code NOT Visible`);
        }

        // Check for question
        const questionVisible = await page.$eval('.question-text', el =>
            el.offsetParent !== null
        ).catch(() => false);

        if (questionVisible) {
            const question = await page.textContent('.question-text');
            console.log(`✅ Question Visible: "${question.substring(0, 50)}..."`);
        } else {
            console.log(`❌ Question NOT Visible`);
        }

        console.log('\n' + '='.repeat(70));
        console.log('Keeping browser open for 30 seconds for manual inspection...');
        await page.waitForTimeout(30000);

    } catch (error) {
        console.error('\n❌ ERROR:', error.message);
        console.error(error.stack);
        await page.waitForTimeout(30000);
    } finally {
        await browser.close();
    }
}

testGameCreationDetailed().catch(console.error);
