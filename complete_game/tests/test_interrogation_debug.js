/**
 * Playwright Debug Test - Divine Interrogation
 * Shows detailed console logs and network responses
 */

const { chromium } = require('playwright');

async function debugInterrogation() {
    console.log('🔍 Starting Divine Interrogation Debug Test...\n');

    const browser = await chromium.launch({
        headless: false,
        slowMo: 1000 // Slow down to watch
    });

    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });

    const page = await context.newPage();

    // Capture ALL console messages with full details
    page.on('console', msg => {
        const type = msg.type();
        const text = msg.text();
        const location = msg.location();

        console.log(`\n📝 Console [${type.toUpperCase()}]:`);
        console.log(`   Message: ${text}`);
        if (location.url) {
            console.log(`   Location: ${location.url}:${location.lineNumber}`);
        }

        // If it's an object, try to get more details
        if (text.includes('[object Object]')) {
            console.log('   ⚠️  Detected [object Object] - this indicates improper data handling');
        }
    });

    // Capture network responses with full details
    const apiCalls = [];
    page.on('response', async response => {
        const url = response.url();
        if (url.includes('/api/')) {
            const method = response.request().method();
            const status = response.status();

            let body = null;
            try {
                body = await response.json();
            } catch (e) {
                try {
                    body = await response.text();
                } catch (e2) {
                    body = '<Could not read body>';
                }
            }

            apiCalls.push({ url, method, status, body });

            console.log(`\n🌐 API Response: ${method} ${url}`);
            console.log(`   Status: ${status}`);
            console.log(`   Body:`, JSON.stringify(body, null, 2));
        }
    });

    // Capture page errors with stack traces
    page.on('pageerror', error => {
        console.log(`\n💥 JavaScript Error:`);
        console.log(`   Message: ${error.message}`);
        console.log(`   Stack: ${error.stack}`);
    });

    try {
        console.log('Step 1: Creating game...');
        await page.goto('http://localhost:5000', { waitUntil: 'networkidle' });
        await page.fill('#creator-name', 'DebugPlayer');
        await page.click('button.rune-create');

        console.log('\nStep 2: Waiting for game page to load...');
        await page.waitForURL('**/game', { timeout: 10000 });
        await page.waitForTimeout(3000);

        console.log('\nStep 3: Taking screenshot of interrogation screen...');
        await page.screenshot({ path: 'screenshots/debug_interrogation.png', fullPage: true });

        console.log('\nStep 4: Inspecting interrogation data structure...');
        const interrogationData = await page.evaluate(() => {
            // Get the question text element
            const questionTextEl = document.getElementById('question-text');
            const answerOptionsContainer = document.getElementById('answer-options');

            // Get all answer buttons
            const answerButtons = answerOptionsContainer?.querySelectorAll('.answer-option');
            const buttonTexts = Array.from(answerButtons || []).map(btn => btn.textContent);

            // Try to get the game instance from window
            let gameData = null;
            try {
                // The game.js creates an ArcaneCodexGame instance
                // Check if we can access it
                gameData = {
                    questionText: questionTextEl?.textContent,
                    answerCount: buttonTexts.length,
                    answerTexts: buttonTexts,
                    questionTextInnerHTML: questionTextEl?.innerHTML
                };
            } catch (e) {
                gameData = { error: e.message };
            }

            return gameData;
        });

        console.log('\n📊 Interrogation Screen Data:');
        console.log('   Question Text:', interrogationData.questionText);
        console.log('   Answer Count:', interrogationData.answerCount);
        console.log('   Answer Texts:', interrogationData.answerTexts);
        console.log('   Question HTML:', interrogationData.questionTextInnerHTML);

        // Wait to see if any delayed API calls happen
        console.log('\nStep 5: Waiting for delayed API calls...');
        await page.waitForTimeout(5000);

        console.log('\n📋 Summary of API Calls:');
        apiCalls.forEach((call, index) => {
            console.log(`\n   Call ${index + 1}: ${call.method} ${call.url}`);
            console.log(`   Status: ${call.status}`);
            if (call.url.includes('start_interrogation')) {
                console.log('   ⚠️  This is the interrogation start call - check its response!');
                console.log('   Response:', JSON.stringify(call.body, null, 2));
            }
        });

        // Check what the JavaScript is actually receiving
        console.log('\nStep 6: Checking what JavaScript received from API...');
        const jsStateData = await page.evaluate(async () => {
            try {
                // Make the API call manually to see what we get
                const response = await fetch('/api/start_interrogation', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                });
                const data = await response.json();
                return { success: true, data };
            } catch (error) {
                return { success: false, error: error.message };
            }
        });

        console.log('\n🔍 Manual API Call Result:');
        console.log(JSON.stringify(jsStateData, null, 2));

        if (jsStateData.success && jsStateData.data.question) {
            console.log('\n✅ Question structure from API:');
            console.log('   Type of question:', typeof jsStateData.data.question);
            console.log('   Question keys:', Object.keys(jsStateData.data.question || {}));
            console.log('   Full question object:', JSON.stringify(jsStateData.data.question, null, 2));
        }

    } catch (error) {
        console.error('\n💥 Test failed:', error.message);
        console.error(error.stack);
        await page.screenshot({ path: 'screenshots/debug_error.png', fullPage: true });
    } finally {
        console.log('\n✅ Debug test complete! Check console output above for details.');
        await browser.close();
    }
}

debugInterrogation().catch(console.error);
