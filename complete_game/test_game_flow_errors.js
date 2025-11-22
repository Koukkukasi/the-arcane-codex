const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Configuration
const BASE_URL = 'http://localhost:5000';
const TEST_GAME_CODE = 'TEST123';
const TEST_PLAYER_NAME = 'TestPlayer';
const TIMEOUT = 30000; // 30 seconds timeout

// Store all captured errors
const capturedData = {
    consoleMessages: [],
    pageErrors: [],
    requestFailures: [],
    responseErrors: [],
    uncaughtExceptions: [],
    timestamps: {},
    screenshots: [],
    flowBreakpoint: null
};

async function captureAllErrors(page) {
    console.log('🎯 Setting up comprehensive error capture...\n');

    // Capture ALL console messages
    page.on('console', msg => {
        const entry = {
            type: msg.type(),
            text: msg.text(),
            location: msg.location(),
            args: msg.args().length,
            timestamp: new Date().toISOString()
        };

        capturedData.consoleMessages.push(entry);

        // Log errors and warnings immediately
        if (['error', 'warning'].includes(msg.type())) {
            console.log(`📝 Console ${msg.type().toUpperCase()}:`, msg.text());
            if (msg.location().url) {
                console.log(`   Location: ${msg.location().url}:${msg.location().lineNumber}:${msg.location().columnNumber}`);
            }
        }
    });

    // Capture page errors (uncaught exceptions)
    page.on('pageerror', error => {
        const entry = {
            message: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
        };
        capturedData.pageErrors.push(entry);
        console.log('❌ PAGE ERROR:', error.message);
        console.log('   Stack:', error.stack?.split('\n')[1]?.trim() || 'N/A');
    });

    // Capture failed requests
    page.on('requestfailed', request => {
        const entry = {
            url: request.url(),
            method: request.method(),
            failure: request.failure(),
            timestamp: new Date().toISOString()
        };
        capturedData.requestFailures.push(entry);
        console.log('🔴 REQUEST FAILED:', request.url());
        console.log('   Failure:', request.failure()?.errorText || 'Unknown');
    });

    // Capture responses with errors
    page.on('response', response => {
        if (response.status() >= 400) {
            const entry = {
                url: response.url(),
                status: response.status(),
                statusText: response.statusText(),
                timestamp: new Date().toISOString()
            };
            capturedData.responseErrors.push(entry);
            console.log(`⚠️ HTTP ERROR ${response.status()}:`, response.url());
        }
    });

    // Inject error capture into the page
    await page.addInitScript(() => {
        // Override console methods to capture stack traces
        const originalError = console.error;
        console.error = function(...args) {
            const stack = new Error().stack;
            originalError.apply(console, [...args, '\nStack:', stack]);
        };

        // Capture unhandled promise rejections
        window.addEventListener('unhandledrejection', event => {
            console.error('Unhandled Promise Rejection:', event.reason);
        });

        // Capture all errors
        window.addEventListener('error', event => {
            console.error('Window Error Event:', {
                message: event.message,
                filename: event.filename,
                line: event.lineno,
                column: event.colno,
                error: event.error?.stack
            });
        });
    });
}

async function testJoinGameFlow(page) {
    console.log('\n========================================');
    console.log('📋 TESTING JOIN GAME FLOW');
    console.log('========================================\n');

    try {
        // Step 1: Navigate to the game
        console.log('1️⃣ Navigating to game page...');
        capturedData.timestamps.navigation_start = Date.now();
        await page.goto(BASE_URL, {
            waitUntil: 'networkidle',
            timeout: TIMEOUT
        });
        capturedData.timestamps.navigation_complete = Date.now();
        console.log('✅ Page loaded successfully\n');

        // Take initial screenshot
        await page.screenshot({
            path: 'screenshots/01_initial_page.png',
            fullPage: true
        });
        capturedData.screenshots.push('01_initial_page.png');

        // Step 2: Click Join Game
        console.log('2️⃣ Looking for Join Game button...');
        const joinButton = await page.locator('button:has-text("Join Game")').first();
        const joinButtonVisible = await joinButton.isVisible();

        if (!joinButtonVisible) {
            throw new Error('Join Game button not visible');
        }

        capturedData.timestamps.join_click_start = Date.now();
        await joinButton.click();
        capturedData.timestamps.join_click_complete = Date.now();
        console.log('✅ Clicked Join Game button\n');

        await page.waitForTimeout(500); // Small delay to let UI update
        await page.screenshot({
            path: 'screenshots/02_after_join_click.png',
            fullPage: true
        });
        capturedData.screenshots.push('02_after_join_click.png');

        // Step 3: Enter game code
        console.log('3️⃣ Entering game code...');
        const gameCodeInput = await page.locator('input[placeholder*="ABC123" i]').first();
        const codeInputVisible = await gameCodeInput.isVisible();

        if (!codeInputVisible) {
            throw new Error('Game code input not visible');
        }

        await gameCodeInput.fill(TEST_GAME_CODE);
        console.log(`✅ Entered game code: ${TEST_GAME_CODE}\n`);

        // Step 4: Enter player name
        console.log('4️⃣ Entering player name...');
        const nameInput = await page.locator('input[placeholder*="Enter your name" i]').first();
        const nameInputVisible = await nameInput.isVisible();

        if (!nameInputVisible) {
            throw new Error('Player name input not visible');
        }

        await nameInput.fill(TEST_PLAYER_NAME);
        console.log(`✅ Entered player name: ${TEST_PLAYER_NAME}\n`);

        await page.screenshot({
            path: 'screenshots/03_form_filled.png',
            fullPage: true
        });
        capturedData.screenshots.push('03_form_filled.png');

        // Step 5: Click Join Party
        console.log('5️⃣ Looking for Join Party button...');
        const joinPartyButton = await page.locator('button:has-text("JOIN PARTY")').first();
        const joinPartyVisible = await joinPartyButton.isVisible();

        if (!joinPartyVisible) {
            throw new Error('Join Party button not visible');
        }

        capturedData.timestamps.join_party_click_start = Date.now();
        await joinPartyButton.click();
        capturedData.timestamps.join_party_click_complete = Date.now();
        console.log('✅ Clicked Join Party button\n');

        // Wait and capture final state
        await page.waitForTimeout(2000);
        await page.screenshot({
            path: 'screenshots/04_after_join_party.png',
            fullPage: true
        });
        capturedData.screenshots.push('04_after_join_party.png');

        console.log('✅ Join Game flow completed\n');

    } catch (error) {
        capturedData.flowBreakpoint = {
            flow: 'join_game',
            error: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
        };
        console.log('❌ JOIN GAME FLOW FAILED:', error.message);

        // Take error screenshot
        await page.screenshot({
            path: 'screenshots/error_join_game.png',
            fullPage: true
        });
        capturedData.screenshots.push('error_join_game.png');
    }
}

async function testCreateGameFlow(page) {
    console.log('\n========================================');
    console.log('📋 TESTING CREATE GAME FLOW');
    console.log('========================================\n');

    try {
        // Step 1: Navigate to the game (refresh)
        console.log('1️⃣ Refreshing page for Create Game test...');
        await page.goto(BASE_URL, {
            waitUntil: 'networkidle',
            timeout: TIMEOUT
        });
        console.log('✅ Page refreshed\n');

        await page.screenshot({
            path: 'screenshots/10_create_initial.png',
            fullPage: true
        });
        capturedData.screenshots.push('10_create_initial.png');

        // Step 2: Click Create Game
        console.log('2️⃣ Looking for Create Game button...');
        const createButton = await page.locator('button:has-text("Create Game")').first();
        const createButtonVisible = await createButton.isVisible();

        if (!createButtonVisible) {
            throw new Error('Create Game button not visible');
        }

        capturedData.timestamps.create_click_start = Date.now();
        await createButton.click();
        capturedData.timestamps.create_click_complete = Date.now();
        console.log('✅ Clicked Create Game button\n');

        await page.waitForTimeout(500);
        await page.screenshot({
            path: 'screenshots/11_after_create_click.png',
            fullPage: true
        });
        capturedData.screenshots.push('11_after_create_click.png');

        // Step 3: Enter host name
        console.log('3️⃣ Entering host name...');
        const hostNameInput = await page.locator('input[placeholder*="Enter your name" i]').first();
        const hostInputVisible = await hostNameInput.isVisible();

        if (!hostInputVisible) {
            throw new Error('Host name input not visible');
        }

        await hostNameInput.fill('TestHost');
        console.log('✅ Entered host name: TestHost\n');

        await page.screenshot({
            path: 'screenshots/12_name_entered.png',
            fullPage: true
        });
        capturedData.screenshots.push('12_name_entered.png');

        // Step 4: Click Face the Gods
        console.log('4️⃣ Looking for Face the Gods button...');
        const faceGodsButton = await page.locator('button:has-text("FACE THE GODS")').first();
        const faceGodsVisible = await faceGodsButton.isVisible();

        if (!faceGodsVisible) {
            throw new Error('Face the Gods button not visible');
        }

        capturedData.timestamps.face_gods_click_start = Date.now();
        await faceGodsButton.click();
        capturedData.timestamps.face_gods_click_complete = Date.now();
        console.log('✅ Clicked Face the Gods button\n');

        // Wait and capture final state
        await page.waitForTimeout(2000);
        await page.screenshot({
            path: 'screenshots/13_after_face_gods.png',
            fullPage: true
        });
        capturedData.screenshots.push('13_after_face_gods.png');

        console.log('✅ Create Game flow completed\n');

    } catch (error) {
        capturedData.flowBreakpoint = {
            flow: 'create_game',
            error: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
        };
        console.log('❌ CREATE GAME FLOW FAILED:', error.message);

        // Take error screenshot
        await page.screenshot({
            path: 'screenshots/error_create_game.png',
            fullPage: true
        });
        capturedData.screenshots.push('error_create_game.png');
    }
}

async function generateReport() {
    console.log('\n========================================');
    console.log('📊 FINAL ERROR REPORT');
    console.log('========================================\n');

    const report = {
        summary: {
            totalConsoleErrors: capturedData.consoleMessages.filter(m => m.type === 'error').length,
            totalConsoleWarnings: capturedData.consoleMessages.filter(m => m.type === 'warning').length,
            totalPageErrors: capturedData.pageErrors.length,
            totalRequestFailures: capturedData.requestFailures.length,
            totalResponseErrors: capturedData.responseErrors.length,
            flowBreakpoint: capturedData.flowBreakpoint
        },
        details: capturedData,
        generatedAt: new Date().toISOString()
    };

    // Console Errors with line numbers
    if (report.summary.totalConsoleErrors > 0) {
        console.log('🔴 CONSOLE ERRORS:');
        capturedData.consoleMessages
            .filter(m => m.type === 'error')
            .forEach(err => {
                console.log(`  - ${err.text}`);
                if (err.location.url) {
                    console.log(`    📍 ${err.location.url}:${err.location.lineNumber}:${err.location.columnNumber}`);
                }
            });
        console.log('');
    }

    // Page Errors (Uncaught Exceptions)
    if (capturedData.pageErrors.length > 0) {
        console.log('❌ UNCAUGHT EXCEPTIONS:');
        capturedData.pageErrors.forEach(err => {
            console.log(`  - ${err.message}`);
            if (err.stack) {
                const lines = err.stack.split('\n').slice(0, 3);
                lines.forEach(line => console.log(`    ${line.trim()}`));
            }
        });
        console.log('');
    }

    // Network Failures
    if (capturedData.requestFailures.length > 0) {
        console.log('🌐 NETWORK REQUEST FAILURES:');
        capturedData.requestFailures.forEach(req => {
            console.log(`  - ${req.method} ${req.url}`);
            console.log(`    Reason: ${req.failure?.errorText || 'Unknown'}`);
        });
        console.log('');
    }

    // HTTP Errors
    if (capturedData.responseErrors.length > 0) {
        console.log('⚠️ HTTP ERRORS:');
        capturedData.responseErrors.forEach(res => {
            console.log(`  - ${res.status} ${res.statusText}: ${res.url}`);
        });
        console.log('');
    }

    // Flow Breakpoint
    if (capturedData.flowBreakpoint) {
        console.log('💥 FLOW BREAKPOINT:');
        console.log(`  Flow: ${capturedData.flowBreakpoint.flow}`);
        console.log(`  Error: ${capturedData.flowBreakpoint.error}`);
        console.log('');
    }

    // Screenshots
    console.log('📸 SCREENSHOTS CAPTURED:');
    capturedData.screenshots.forEach(screenshot => {
        console.log(`  - ${screenshot}`);
    });
    console.log('');

    // Save detailed report
    fs.writeFileSync('error_report.json', JSON.stringify(report, null, 2));
    console.log('📄 Detailed report saved to: error_report.json\n');

    return report;
}

async function runTests() {
    console.log('🚀 Starting Comprehensive Error Capture Test');
    console.log('============================================\n');

    // Create screenshots directory
    if (!fs.existsSync('screenshots')) {
        fs.mkdirSync('screenshots');
    }

    const browser = await chromium.launch({
        headless: false, // Set to true for CI/CD
        devtools: true   // Open DevTools to see console
    });

    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 },
        ignoreHTTPSErrors: true
    });

    const page = await context.newPage();

    // Set up comprehensive error capture
    await captureAllErrors(page);

    // Run tests
    await testJoinGameFlow(page);
    await testCreateGameFlow(page);

    // Generate report
    const report = await generateReport();

    // Analyze and suggest fixes
    console.log('🔧 SUGGESTED FIXES:');
    console.log('==================\n');

    if (report.summary.totalConsoleErrors > 0) {
        const errors = capturedData.consoleMessages.filter(m => m.type === 'error');

        // Check for common issues
        const hasUndefinedErrors = errors.some(e => e.text.includes('undefined') || e.text.includes('null'));
        const hasNetworkErrors = capturedData.requestFailures.length > 0;
        const hasSocketErrors = errors.some(e => e.text.toLowerCase().includes('socket') || e.text.toLowerCase().includes('websocket'));

        if (hasUndefinedErrors) {
            console.log('1. UNDEFINED/NULL REFERENCE ERRORS DETECTED:');
            console.log('   - Check that all DOM elements exist before accessing');
            console.log('   - Verify socket.io is properly initialized');
            console.log('   - Ensure game state variables are initialized\n');
        }

        if (hasNetworkErrors) {
            console.log('2. NETWORK/CONNECTIVITY ISSUES:');
            console.log('   - Verify the server is running on port 5000');
            console.log('   - Check CORS configuration');
            console.log('   - Ensure socket.io client can connect to server\n');
        }

        if (hasSocketErrors) {
            console.log('3. SOCKET.IO CONNECTION ISSUES:');
            console.log('   - Check that socket.io client library is loaded');
            console.log('   - Verify socket connection URL matches server');
            console.log('   - Ensure socket event handlers are properly set up\n');
        }
    }

    // Keep browser open for 5 seconds to review
    await page.waitForTimeout(5000);

    await browser.close();
    console.log('\n✅ Test completed. Check screenshots/ folder and error_report.json for details.');
}

// Run the tests
runTests().catch(console.error);