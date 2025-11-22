const { chromium } = require('playwright');

async function captureConsoleErrors() {
    console.log('\n🔍 Capturing ALL Console Messages and Errors\n');
    console.log('='.repeat(70));

    const browser = await chromium.launch({
        headless: false,
        slowMo: 1000,
        args: ['--auto-open-devtools-for-tabs']
    });

    const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

    const allMessages = [];
    const errors = [];
    const warnings = [];
    const apiCalls = [];

    // Capture ALL console messages
    page.on('console', msg => {
        const type = msg.type();
        const text = msg.text();
        const message = `[${type.toUpperCase()}] ${text}`;

        allMessages.push({ type, text, timestamp: new Date().toISOString() });

        if (type === 'error') {
            errors.push(text);
            console.log(`\n❌ ERROR: ${text}`);
        } else if (type === 'warning') {
            warnings.push(text);
            console.log(`\n⚠️  WARNING: ${text}`);
        } else {
            console.log(`   ${message}`);
        }
    });

    // Capture page errors
    page.on('pageerror', error => {
        console.log(`\n💥 PAGE ERROR: ${error.message}`);
        console.log(`   Stack: ${error.stack}`);
        errors.push(`PAGE ERROR: ${error.message}`);
    });

    // Capture failed requests
    page.on('requestfailed', request => {
        console.log(`\n🔴 REQUEST FAILED: ${request.url()}`);
        console.log(`   Failure: ${request.failure()?.errorText}`);
        errors.push(`REQUEST FAILED: ${request.url()}`);
    });

    // Track API calls
    page.on('response', async response => {
        if (response.url().includes('/api/')) {
            const status = response.status();
            const url = response.url();
            apiCalls.push({ url, status });

            if (status >= 400) {
                console.log(`\n🔴 API ERROR: ${status} ${url}`);
                try {
                    const data = await response.text();
                    console.log(`   Response: ${data}`);
                } catch (e) {}
            }
        }
    });

    try {
        console.log('\n📍 STEP 1: Loading page...');
        console.log('-'.repeat(70));
        await page.goto('http://localhost:5000', {
            waitUntil: 'networkidle',
            timeout: 30000
        });
        await page.waitForTimeout(3000);

        console.log('\n📍 STEP 2: Clicking "Create Game"...');
        console.log('-'.repeat(70));
        await page.click('button:has-text("Create Game")');
        await page.waitForTimeout(2000);

        console.log('\n📍 STEP 3: Entering name...');
        console.log('-'.repeat(70));
        await page.fill('#playerNameInput', 'ErrorTester');
        await page.waitForTimeout(1000);

        console.log('\n📍 STEP 4: Clicking "Face the Gods"...');
        console.log('-'.repeat(70));
        await page.click('button:has-text("Face the Gods")');
        await page.waitForTimeout(5000);

        console.log('\n📍 STEP 5: Trying to answer a question...');
        console.log('-'.repeat(70));

        const buttons = await page.$$('.option-button:not([disabled])');
        if (buttons.length > 0) {
            console.log(`   Found ${buttons.length} option buttons`);
            await buttons[0].click();
            await page.waitForTimeout(3000);
        } else {
            console.log(`   ❌ No option buttons found`);
        }

        console.log('\n' + '='.repeat(70));
        console.log('📊 SUMMARY');
        console.log('='.repeat(70));
        console.log(`\nTotal Console Messages: ${allMessages.length}`);
        console.log(`Errors: ${errors.length}`);
        console.log(`Warnings: ${warnings.length}`);
        console.log(`API Calls: ${apiCalls.length}`);

        if (errors.length > 0) {
            console.log('\n❌ ALL ERRORS:');
            errors.forEach((err, i) => {
                console.log(`   ${i + 1}. ${err}`);
            });
        } else {
            console.log('\n✅ NO ERRORS FOUND!');
        }

        if (warnings.length > 0) {
            console.log('\n⚠️  ALL WARNINGS:');
            warnings.forEach((warn, i) => {
                console.log(`   ${i + 1}. ${warn}`);
            });
        }

        console.log('\n📡 API CALLS:');
        apiCalls.forEach((call, i) => {
            const status = call.status >= 400 ? '❌' : '✅';
            console.log(`   ${status} ${call.status} ${call.url}`);
        });

        console.log('\n' + '='.repeat(70));
        console.log('\n⏳ Keeping browser open for 60 seconds for manual inspection...');
        console.log('   Check the DevTools Console for additional details');
        await page.waitForTimeout(60000);

    } catch (error) {
        console.error('\n💥 TEST ERROR:', error.message);
        console.error(error.stack);
        await page.waitForTimeout(30000);
    } finally {
        await browser.close();
    }
}

captureConsoleErrors().catch(console.error);
