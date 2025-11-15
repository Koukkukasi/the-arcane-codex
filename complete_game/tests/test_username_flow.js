/**
 * Playwright Test - Username Authentication Flow
 * Tests the new two-step authentication: username → game creation
 */

const { chromium } = require('playwright');

async function testUsernameFlow() {
    console.log('🔍 Starting Username Authentication Flow Test...\n');

    const browser = await chromium.launch({
        headless: false,
        slowMo: 1000
    });

    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });

    const page = await context.newPage();

    // Capture console messages
    const consoleMessages = [];
    page.on('console', msg => {
        const type = msg.type();
        const text = msg.text();
        consoleMessages.push({ type, text });

        if (type === 'error') {
            console.log(`\n❌ Console ERROR: ${text}`);
        } else {
            console.log(`📝 Console [${type}]: ${text}`);
        }
    });

    // Capture page errors
    page.on('pageerror', error => {
        console.log(`\n💥 JavaScript Error:`);
        console.log(`   Message: ${error.message}`);
        console.log(`   Stack: ${error.stack}`);
    });

    // Capture network errors
    page.on('requestfailed', request => {
        console.log(`\n❌ Network Error: ${request.url()} - ${request.failure().errorText}`);
    });

    // Track API calls
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

            const statusIcon = status >= 200 && status < 300 ? '✅' : '❌';
            console.log(`\n${statusIcon} API: ${method} ${url.split('/api/')[1]}`);
            console.log(`   Status: ${status}`);
            if (status >= 400) {
                console.log(`   Response:`, JSON.stringify(body, null, 2));
            }
        }
    });

    try {
        console.log('Step 1: Loading landing page...');
        await page.goto('http://localhost:5000', { waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);
        await page.screenshot({ path: 'screenshots/01_username_screen.png', fullPage: true });
        console.log('✅ Screenshot: 01_username_screen.png\n');

        // Check if username screen is visible
        const usernameScreen = await page.evaluate(() => {
            const screen = document.getElementById('username-screen');
            const style = window.getComputedStyle(screen);
            return {
                exists: !!screen,
                display: style.display,
                visible: style.display !== 'none'
            };
        });
        console.log('Username Screen:', usernameScreen);

        console.log('\nStep 2: Entering username...');
        const testUsername = 'TestPlayer1';
        await page.fill('#username-input', testUsername);
        await page.screenshot({ path: 'screenshots/02_username_filled.png', fullPage: true });
        console.log('✅ Screenshot: 02_username_filled.png\n');

        console.log('Step 3: Submitting username...');
        await page.click('#username-form button[type="submit"]');
        await page.waitForTimeout(3000);
        await page.screenshot({ path: 'screenshots/03_game_selection.png', fullPage: true });
        console.log('✅ Screenshot: 03_game_selection.png\n');

        // Check if game selection screen is now visible
        const gameSelectionScreen = await page.evaluate(() => {
            const usernameScreen = document.getElementById('username-screen');
            const gameScreen = document.getElementById('game-selection-screen');
            const displayUsername = document.getElementById('display-username');

            return {
                usernameVisible: window.getComputedStyle(usernameScreen).display !== 'none',
                gameSelectionVisible: window.getComputedStyle(gameScreen).display !== 'none',
                displayedUsername: displayUsername?.textContent
            };
        });
        console.log('Screen State:', gameSelectionScreen);

        if (!gameSelectionScreen.gameSelectionVisible) {
            console.log('\n⚠️  WARNING: Game selection screen not visible!');
        }

        if (gameSelectionScreen.displayedUsername !== testUsername) {
            console.log(`\n⚠️  WARNING: Username mismatch! Expected: ${testUsername}, Got: ${gameSelectionScreen.displayedUsername}`);
        }

        console.log('\nStep 4: Creating game...');
        await page.click('#create-game-form button[type="submit"]');

        console.log('Waiting for navigation to /game page...');
        await page.waitForURL('**/game', { timeout: 10000 });
        console.log('✅ Navigated to /game page\n');

        await page.waitForTimeout(3000);
        await page.screenshot({ path: 'screenshots/04_interrogation_screen.png', fullPage: true });
        console.log('✅ Screenshot: 04_interrogation_screen.png\n');

        // Check interrogation screen
        const interrogationState = await page.evaluate(() => {
            const questionText = document.getElementById('question-text')?.textContent;
            const answerOptions = document.querySelectorAll('.answer-option');
            const answerTexts = Array.from(answerOptions).map(btn => btn.textContent);

            return {
                hasQuestion: !!questionText && questionText.length > 0,
                questionText: questionText?.substring(0, 100),
                answerCount: answerOptions.length,
                answersLookGood: answerTexts.every(text => text && !text.includes('[object')),
                firstAnswer: answerTexts[0]
            };
        });

        console.log('\n📊 Interrogation Screen Check:');
        console.log('   Has Question:', interrogationState.hasQuestion ? '✅' : '❌');
        console.log('   Question Preview:', interrogationState.questionText);
        console.log('   Answer Count:', interrogationState.answerCount);
        console.log('   Answers Look Good:', interrogationState.answersLookGood ? '✅' : '❌');
        console.log('   First Answer:', interrogationState.firstAnswer);

        // Wait for any delayed errors
        console.log('\nStep 5: Waiting for delayed errors...');
        await page.waitForTimeout(5000);

        console.log('\n📋 API Calls Summary:');
        apiCalls.forEach((call, index) => {
            const statusIcon = call.status >= 200 && call.status < 300 ? '✅' : '❌';
            console.log(`\n   ${index + 1}. ${statusIcon} ${call.method} ${call.url.split('/api/')[1]}`);
            console.log(`      Status: ${call.status}`);
        });

        console.log('\n📝 Console Messages Summary:');
        console.log(`   Total messages: ${consoleMessages.length}`);
        const errors = consoleMessages.filter(m => m.type === 'error');
        if (errors.length > 0) {
            console.log(`   ❌ Errors found: ${errors.length}`);
            errors.forEach(err => console.log(`      - ${err.text}`));
        } else {
            console.log('   ✅ No JavaScript errors');
        }

        console.log('\n🎯 Test Results:');
        console.log('   ✅ Username entry works');
        console.log(`   ${gameSelectionScreen.gameSelectionVisible ? '✅' : '❌'} Game selection screen shows`);
        console.log(`   ${gameSelectionScreen.displayedUsername === testUsername ? '✅' : '❌'} Username displayed correctly`);
        console.log(`   ${interrogationState.hasQuestion ? '✅' : '❌'} Divine Interrogation starts`);
        console.log(`   ${interrogationState.answersLookGood ? '✅' : '❌'} Answers display correctly`);
        console.log(`   ${errors.length === 0 ? '✅' : '❌'} No console errors`);

    } catch (error) {
        console.error('\n💥 Test failed:', error.message);
        console.error(error.stack);
        await page.screenshot({ path: 'screenshots/ERROR_username_flow.png', fullPage: true });
    } finally {
        console.log('\n✅ Test complete! Check screenshots/ folder for visual evidence.');
        await browser.close();
    }
}

// Create screenshots directory if needed
const fs = require('fs');
if (!fs.existsSync('screenshots')) {
    fs.mkdirSync('screenshots');
}

testUsernameFlow().catch(console.error);
