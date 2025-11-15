const { chromium } = require('playwright');

async function runTest() {
    console.log('=== Starting Playwright Console Error Diagnostics ===\n');

    const browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const context = await browser.newContext();
    const page = await context.newPage();

    // Storage for captured events
    const consoleMessages = [];
    const pageErrors = [];
    const failedRequests = [];
    const networkRequests = [];

    // Capture console messages
    page.on('console', msg => {
        const type = msg.type();
        const text = msg.text();
        const location = msg.location();

        consoleMessages.push({
            type,
            text,
            location: `${location.url}:${location.lineNumber}:${location.columnNumber}`
        });

        console.log(`[CONSOLE ${type.toUpperCase()}] ${text}`);
        if (location.url) {
            console.log(`  Location: ${location.url}:${location.lineNumber}:${location.columnNumber}`);
        }
    });

    // Capture page errors
    page.on('pageerror', error => {
        pageErrors.push({
            message: error.message,
            stack: error.stack
        });
        console.log(`[PAGE ERROR] ${error.message}`);
        console.log(`  Stack: ${error.stack}`);
    });

    // Capture failed network requests
    page.on('requestfailed', request => {
        const failure = request.failure();
        failedRequests.push({
            url: request.url(),
            method: request.method(),
            failure: failure ? failure.errorText : 'Unknown error'
        });
        console.log(`[REQUEST FAILED] ${request.method()} ${request.url()}`);
        console.log(`  Error: ${failure ? failure.errorText : 'Unknown error'}`);
    });

    // Capture all network requests for debugging
    page.on('response', async response => {
        const url = response.url();
        const status = response.status();
        const request = response.request();

        networkRequests.push({
            url,
            method: request.method(),
            status,
            statusText: response.statusText()
        });

        // Log API calls specifically
        if (url.includes('/api/') || url.includes('/game/') || url.includes('claude.ai')) {
            console.log(`[NETWORK] ${request.method()} ${url} - Status: ${status}`);

            // Try to get response body for API calls
            try {
                const contentType = response.headers()['content-type'] || '';
                if (contentType.includes('application/json')) {
                    const body = await response.json();
                    // For interrogation responses, show full details
                    if (url.includes('start_interrogation')) {
                        console.log(`  FULL Response: ${JSON.stringify(body, null, 2)}`);
                    } else {
                        console.log(`  Response: ${JSON.stringify(body).substring(0, 200)}`);
                    }
                } else if (contentType.includes('text')) {
                    const text = await response.text();
                    console.log(`  Response: ${text.substring(0, 200)}`);
                }
            } catch (e) {
                console.log(`  (Could not parse response body)`);
            }
        }
    });

    try {
        console.log('\n=== Step 1: Navigating to game ===');
        await page.goto('http://localhost:5000/game', {
            waitUntil: 'networkidle',
            timeout: 30000
        });
        console.log('Page loaded successfully\n');

        // Wait a bit for any initial scripts to run
        await page.waitForTimeout(2000);

        console.log('=== Step 2: Checking page state ===');
        const title = await page.title();
        console.log(`Page title: ${title}`);

        // Check if creator input is visible
        const creatorInput = await page.locator('#creator-name');
        const isCreatorVisible = await creatorInput.isVisible().catch(() => false);
        console.log(`Creator input visible: ${isCreatorVisible}\n`);

        if (isCreatorVisible) {
            console.log('=== Step 3: Filling creator name ===');
            await creatorInput.fill('TestWizard');
            console.log('Creator name filled: TestWizard\n');

            console.log('=== Step 4: Clicking Embark button ===');
            const embarkButton = page.locator('button:has-text("Embark")');
            await embarkButton.click();
            console.log('Embark button clicked\n');

            // Wait for game to start
            await page.waitForTimeout(3000);

            console.log('=== Step 5: Waiting for interrogation phase ===');
            // Check if we're in interrogation
            const interrogationVisible = await page.locator('.interrogation-container, #interrogation-container, [class*="interrogation"]').first().isVisible({ timeout: 10000 }).catch(() => false);
            console.log(`Interrogation container visible: ${interrogationVisible}\n`);

            if (interrogationVisible) {
                console.log('=== Step 6: Checking for question ===');
                await page.waitForTimeout(5000);

                // Try to find question text element specifically
                const questionTextEl = await page.locator('#question-text').textContent({ timeout: 5000 }).catch(() => null);
                console.log(`#question-text element content: "${questionTextEl}"\n`);

                // Check answer options
                const answerButtons = await page.locator('.answer-option').count();
                console.log(`Answer option buttons found: ${answerButtons}\n`);

                // Get the first answer button text if any
                if (answerButtons > 0) {
                    const firstAnswer = await page.locator('.answer-option').first().textContent();
                    console.log(`First answer text: ${firstAnswer.substring(0, 100)}\n`);
                }

                // Check for loading indicators
                const loadingVisible = await page.locator('.loading, [class*="loading"]').isVisible().catch(() => false);
                console.log(`Loading indicator visible: ${loadingVisible}\n`);

                // Get DOM state
                const domInfo = await page.evaluate(() => {
                    const questionEl = document.getElementById('question-text');
                    const optionsEl = document.getElementById('answer-options');
                    return {
                        questionExists: !!questionEl,
                        questionText: questionEl ? questionEl.textContent : null,
                        optionsExists: !!optionsEl,
                        optionsHTML: optionsEl ? optionsEl.innerHTML.substring(0, 200) : null
                    };
                });
                console.log(`DOM state:`, JSON.stringify(domInfo, null, 2), '\n');
            }

            // Wait a bit more to catch any delayed errors
            console.log('=== Waiting for additional events (10 seconds) ===');
            await page.waitForTimeout(10000);
        }

    } catch (error) {
        console.log(`\n[TEST ERROR] ${error.message}`);
        console.log(`Stack: ${error.stack}`);
    }

    await browser.close();

    // Print summary
    console.log('\n\n========================================');
    console.log('=== DIAGNOSTIC SUMMARY ===');
    console.log('========================================\n');

    console.log(`Total Console Messages: ${consoleMessages.length}`);
    console.log(`  - Errors: ${consoleMessages.filter(m => m.type === 'error').length}`);
    console.log(`  - Warnings: ${consoleMessages.filter(m => m.type === 'warning').length}`);
    console.log(`  - Logs: ${consoleMessages.filter(m => m.type === 'log').length}`);

    console.log(`\nTotal Page Errors: ${pageErrors.length}`);
    console.log(`Total Failed Requests: ${failedRequests.length}`);
    console.log(`Total Network Requests: ${networkRequests.length}\n`);

    if (pageErrors.length > 0) {
        console.log('\n=== PAGE ERRORS DETAIL ===');
        pageErrors.forEach((err, i) => {
            console.log(`\n${i + 1}. ${err.message}`);
            if (err.stack) {
                console.log(`   ${err.stack}`);
            }
        });
    }

    if (failedRequests.length > 0) {
        console.log('\n=== FAILED REQUESTS DETAIL ===');
        failedRequests.forEach((req, i) => {
            console.log(`\n${i + 1}. ${req.method} ${req.url}`);
            console.log(`   Failure: ${req.failure}`);
        });
    }

    const errorMessages = consoleMessages.filter(m => m.type === 'error');
    if (errorMessages.length > 0) {
        console.log('\n=== CONSOLE ERRORS DETAIL ===');
        errorMessages.forEach((msg, i) => {
            console.log(`\n${i + 1}. ${msg.text}`);
            console.log(`   Location: ${msg.location}`);
        });
    }

    console.log('\n=== Test completed ===\n');
}

runTest().catch(error => {
    console.error('Fatal error running test:', error);
    process.exit(1);
});
