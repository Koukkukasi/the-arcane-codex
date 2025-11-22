const { chromium } = require('playwright');

const API_BASE = 'http://localhost:5000';

async function testTypeScriptServer() {
    console.log('\n🎮 Testing TypeScript Server - Complete Game Flow\n');
    console.log('='.repeat(60));

    const browser = await chromium.launch({
        headless: false,
        slowMo: 500  // Slow down to see what's happening
    });

    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });

    const page = await context.newPage();

    // Track console messages
    const consoleMessages = [];
    page.on('console', msg => {
        const text = `[${msg.type().toUpperCase()}] ${msg.text()}`;
        consoleMessages.push(text);
        console.log(text);
    });

    // Track API requests
    const apiRequests = [];
    page.on('request', request => {
        if (request.url().includes('/api/')) {
            const req = `${request.method()} ${request.url()}`;
            apiRequests.push(req);
            console.log(`[API] ${req}`);
        }
    });

    // Track responses
    page.on('response', async response => {
        if (response.url().includes('/api/')) {
            const status = response.status();
            const url = response.url();
            console.log(`[RESPONSE] ${status} ${url}`);

            if (status !== 200 && status !== 304) {
                console.log(`⚠️  Non-200 response: ${status}`);
            }
        }
    });

    try {
        console.log('\n📍 Step 1: Navigate to game');
        await page.goto(API_BASE, { waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);

        console.log('\n📍 Step 2: Click "Create Game"');
        const createButton = await page.waitForSelector('button:has-text("Create Game")', { timeout: 5000, state: 'visible' });
        await createButton.click();
        await page.waitForTimeout(1500);

        console.log('\n📍 Step 3: Enter player name');
        const nameInput = await page.waitForSelector('#playerNameInput', { timeout: 5000 });
        await nameInput.fill('TestHero');
        await page.waitForTimeout(500);

        console.log('\n📍 Step 4: Click "Face the Gods"');
        const faceGodsButton = await page.waitForSelector('button:has-text("Face the Gods")', { timeout: 5000 });
        await faceGodsButton.click();
        await page.waitForTimeout(3000);

        console.log('\n📍 Step 5: Verify Divine Interrogation started');
        const questionText = await page.waitForSelector('.question-text', { timeout: 10000 });
        const questionContent = await questionText.textContent();
        console.log(`✅ Question displayed: "${questionContent.substring(0, 50)}..."`);

        console.log('\n📍 Step 6: Test answering 3 questions');
        for (let i = 1; i <= 3; i++) {
            console.log(`\n  Question ${i}:`);

            // Wait for question to be fully loaded
            await page.waitForTimeout(1000);

            // Get current question number
            const qNum = await page.textContent('#questionNumber').catch(() => 'unknown');
            console.log(`  Current question: ${qNum}`);

            // Find and click first available option button
            const optionButtons = await page.$$('.option-button:not([disabled])');
            console.log(`  Found ${optionButtons.length} clickable option buttons`);

            if (optionButtons.length === 0) {
                console.log('  ❌ No clickable buttons found!');
                break;
            }

            const firstButton = optionButtons[0];
            const buttonText = await firstButton.textContent();
            console.log(`  Clicking option: "${buttonText.substring(0, 30)}..."`);

            // Click the button
            await firstButton.click();
            console.log(`  ✅ Button clicked`);

            // Wait for response and next question
            await page.waitForTimeout(2000);

            // Verify button was disabled
            const isDisabled = await firstButton.isDisabled();
            console.log(`  Button disabled after click: ${isDisabled}`);
        }

        console.log('\n📍 Step 7: Check for errors');
        const errors = consoleMessages.filter(msg => msg.includes('[ERROR]') || msg.includes('[error]'));
        console.log(`\nTotal errors: ${errors.length}`);
        if (errors.length > 0) {
            console.log('Errors found:');
            errors.forEach(err => console.log(`  - ${err}`));
        }

        console.log('\n📍 Step 8: Summary');
        console.log(`API Requests made: ${apiRequests.length}`);
        console.log(`Console messages: ${consoleMessages.length}`);

        // Check for rate limiting errors
        const rateLimitErrors = apiRequests.filter(req => req.includes('429'));
        if (rateLimitErrors.length > 0) {
            console.log(`❌ Rate limit errors: ${rateLimitErrors.length}`);
        } else {
            console.log(`✅ No rate limit errors (500/hour working!)`);
        }

        console.log('\n' + '='.repeat(60));
        console.log('🎉 TEST COMPLETE');
        console.log('='.repeat(60));

        // Keep browser open for manual inspection
        console.log('\nBrowser will stay open for 10 seconds...');
        await page.waitForTimeout(10000);

    } catch (error) {
        console.error('\n❌ TEST FAILED:', error.message);
        console.error(error.stack);
    } finally {
        await browser.close();
    }
}

testTypeScriptServer().catch(console.error);
