const { chromium } = require('playwright');

const API_BASE = 'http://localhost:5000';

async function testFinalTypeScript() {
    console.log('\n🎮 FINAL TypeScript Server Test\n');
    console.log('='.repeat(70));

    const browser = await chromium.launch({
        headless: false,
        slowMo: 1000  // Slow down to see actions
    });

    const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

    // Track ALL console messages
    page.on('console', msg => {
        console.log(`[PAGE ${msg.type().toUpperCase()}]:`, msg.text());
    });

    // Track ALL API calls with request data
    page.on('request', request => {
        if (request.url().includes('/api/')) {
            console.log(`\n[API REQUEST] ${request.method()} ${request.url()}`);
            if (request.method() === 'POST') {
                try {
                    const postData = request.postDataJSON();
                    console.log(`[POST DATA]:`, JSON.stringify(postData, null, 2));
                } catch (e) {
                    // ignore
                }
            }
        }
    });

    // Track ALL responses with data
    page.on('response', async response => {
        if (response.url().includes('/api/')) {
            const status = response.status();
            console.log(`[API RESPONSE] ${status} ${response.url()}`);

            if (status === 200) {
                try {
                    const data = await response.json();
                    console.log(`[RESPONSE DATA]:`, JSON.stringify(data, null, 2));
                } catch (e) {
                    // ignore
                }
            }
        }
    });

    try {
        console.log('\n📍 STEP 1: Navigate to game');
        console.log('-'.repeat(70));
        await page.goto(API_BASE, { waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);

        console.log('\n📍 STEP 2: Click "Create Game"');
        console.log('-'.repeat(70));
        await page.click('button:has-text("Create Game")');
        await page.waitForTimeout(2000);

        console.log('\n📍 STEP 3: Enter player name "TestWarrior"');
        console.log('-'.repeat(70));
        await page.fill('#playerNameInput', 'TestWarrior');
        await page.waitForTimeout(1000);

        console.log('\n📍 STEP 4: Click "Face the Gods"');
        console.log('-'.repeat(70));
        await page.click('button:has-text("Face the Gods")');
        await page.waitForTimeout(5000); // Wait longer for interrogation to start

        console.log('\n📍 STEP 5: Check current screen');
        console.log('-'.repeat(70));
        const activeScreen = await page.$('.screen.active');
        if (activeScreen) {
            const screenId = await activeScreen.getAttribute('id');
            console.log(`✅ Active screen: ${screenId}`);
        } else {
            console.log(`❌ No active screen found`);
        }

        // Check if divine interrogation screen is visible
        const divineScreen = await page.$('#divineInterrogation');
        const isVisible = await divineScreen.isVisible();
        console.log(`Divine Interrogation visible: ${isVisible}`);

        if (isVisible) {
            console.log('\n📍 STEP 6: Answer first question');
            console.log('-'.repeat(70));

            const questionText = await page.textContent('.question-text');
            console.log(`Question: ${questionText.substring(0, 100)}...`);

            const optionButtons = await page.$$('.option-button:not([disabled])');
            console.log(`Found ${optionButtons.length} option buttons`);

            if (optionButtons.length > 0) {
                const firstButton = optionButtons[0];
                const btnText = await firstButton.textContent();
                console.log(`Clicking option: "${btnText.substring(0, 50)}..."`);

                await firstButton.click();
                await page.waitForTimeout(3000);

                console.log('✅ Answer submitted successfully!');
            }
        } else {
            console.log('❌ Divine Interrogation screen not visible');
        }

        console.log('\n📍 FINAL CHECK: Get all visible elements');
        console.log('-'.repeat(70));
        const visibleButtons = await page.$$('button:visible');
        console.log(`Visible buttons: ${visibleButtons.length}`);
        for (let i = 0; i < Math.min(5, visibleButtons.length); i++) {
            const text = await visibleButtons[i].textContent();
            console.log(`  ${i + 1}. "${text.trim()}"`);
        }

        console.log('\n' + '='.repeat(70));
        console.log('🎉 TEST COMPLETE');
        console.log('='.repeat(70));

        console.log('\nKeeping browser open for 20 seconds for manual inspection...');
        await page.waitForTimeout(20000);

    } catch (error) {
        console.error('\n❌ TEST FAILED:', error.message);
        console.error(error.stack);
    } finally {
        await browser.close();
    }
}

testFinalTypeScript().catch(console.error);
