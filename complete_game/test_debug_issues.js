const { chromium } = require('playwright');
const fs = require('fs').promises;

// Configuration
const BASE_URL = 'http://localhost:5000';
const TIMEOUT = 30000;

// Helper function to generate unique names
function generateTestName() {
    return `TestPlayer_${Date.now()}`;
}

// Helper function to log errors
async function logError(context, error) {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] ERROR:`, error);
}

// Helper function to capture page state
async function capturePageState(page, name) {
    try {
        // Take screenshot
        await page.screenshot({ path: `debug_${name}_${Date.now()}.png`, fullPage: true });

        // Get page content
        const content = await page.content();
        await fs.writeFile(`debug_${name}_${Date.now()}.html`, content);

        // Get console errors
        const consoleErrors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                consoleErrors.push({
                    text: msg.text(),
                    location: msg.location(),
                    args: msg.args()
                });
            }
        });

        return consoleErrors;
    } catch (error) {
        console.error('Failed to capture page state:', error);
    }
}

async function testCreateGameFlow() {
    console.log('\n========================================');
    console.log('TESTING CREATE GAME FLOW - FACE THE GODS');
    console.log('========================================\n');

    const browser = await chromium.launch({
        headless: false,
        slowMo: 100  // Slow down for debugging
    });

    const context = await browser.newContext();
    const page = await context.newPage();

    const errors = [];
    const networkRequests = [];
    const consoleMessages = [];

    // Set up console monitoring
    page.on('console', msg => {
        const msgObj = {
            type: msg.type(),
            text: msg.text(),
            location: msg.location()
        };
        consoleMessages.push(msgObj);

        if (msg.type() === 'error') {
            console.log(`❌ Console Error: ${msg.text()}`);
            if (msg.location()) {
                console.log(`   at ${msg.location().url}:${msg.location().lineNumber}:${msg.location().columnNumber}`);
            }
            errors.push(msgObj);
        } else if (msg.type() === 'warning') {
            console.log(`⚠️  Console Warning: ${msg.text()}`);
        } else if (msg.text().includes('[DIVINE]') || msg.text().includes('Interrogation')) {
            console.log(`📝 Debug Log: ${msg.text()}`);
        }
    });

    // Set up network monitoring
    page.on('request', request => {
        if (request.url().includes('/api/')) {
            console.log(`📤 API Request: ${request.method()} ${request.url()}`);
            if (request.postData()) {
                console.log(`   Body: ${request.postData()}`);
            }
            networkRequests.push({
                method: request.method(),
                url: request.url(),
                postData: request.postData(),
                headers: request.headers()
            });
        }
    });

    page.on('response', response => {
        if (response.url().includes('/api/')) {
            console.log(`📥 API Response: ${response.status()} ${response.url()}`);
            response.text().then(text => {
                try {
                    const json = JSON.parse(text);
                    console.log(`   Response: ${JSON.stringify(json, null, 2)}`);
                } catch {
                    console.log(`   Response: ${text}`);
                }
            }).catch(err => {
                console.log(`   Failed to read response: ${err.message}`);
            });
        }
    });

    page.on('pageerror', error => {
        console.error(`🔴 Page Error:`, error.message);
        errors.push({ type: 'pageerror', message: error.message, stack: error.stack });
    });

    try {
        console.log('1. Navigating to game page...');
        await page.goto(`${BASE_URL}/static/game_flow_beautiful_integrated.html`, {
            waitUntil: 'networkidle',
            timeout: TIMEOUT
        });

        console.log('2. Waiting for main menu...');
        await page.waitForSelector('#mainMenu', { state: 'visible', timeout: 10000 });

        console.log('3. Clicking "Create Game" button...');
        // Check if button exists and is clickable
        const createGameBtn = await page.$('button:has-text("Create Game")');
        if (!createGameBtn) {
            throw new Error('Create Game button not found!');
        }

        // Check button properties
        const btnProps = await createGameBtn.evaluate(el => ({
            disabled: el.disabled,
            onclick: el.onclick ? el.onclick.toString() : null,
            className: el.className,
            innerText: el.innerText
        }));
        console.log('   Button properties:', btnProps);

        await createGameBtn.click();

        console.log('4. Waiting for Create Game screen...');
        await page.waitForSelector('#createGameScreen', { state: 'visible', timeout: 10000 });

        console.log('5. Entering player name...');
        const playerName = generateTestName();
        await page.fill('#playerNameInput', playerName);
        console.log(`   Name entered: ${playerName}`);

        console.log('6. Looking for "Face the Gods" button...');

        // Try multiple selectors
        const selectors = [
            'button:has-text("Face the Gods")',
            'button.btn:has-text("Face the Gods")',
            '#createGameScreen button:has-text("Face the Gods")',
            'button[onclick*="startInterrogation"]'
        ];

        let faceGodsBtn = null;
        for (const selector of selectors) {
            faceGodsBtn = await page.$(selector);
            if (faceGodsBtn) {
                console.log(`   Found button with selector: ${selector}`);
                break;
            }
        }

        if (!faceGodsBtn) {
            console.error('❌ "Face the Gods" button not found!');
            await capturePageState(page, 'no_face_gods_button');

            // Try to get all buttons on the page
            const allButtons = await page.$$eval('button', buttons =>
                buttons.map(b => ({
                    text: b.innerText,
                    onclick: b.onclick ? b.onclick.toString() : null,
                    disabled: b.disabled,
                    className: b.className
                }))
            );
            console.log('All buttons on page:', allButtons);
            throw new Error('Face the Gods button not found');
        }

        // Check button state
        const btnState = await faceGodsBtn.evaluate(el => ({
            disabled: el.disabled,
            onclick: el.onclick ? el.onclick.toString() : null,
            className: el.className,
            style: {
                display: window.getComputedStyle(el).display,
                visibility: window.getComputedStyle(el).visibility,
                opacity: window.getComputedStyle(el).opacity
            }
        }));
        console.log('   Face the Gods button state:', btnState);

        console.log('7. Clicking "Face the Gods" button...');
        await faceGodsBtn.click();

        // Wait for any response or screen change
        console.log('8. Waiting for response...');

        // Check if we're still on the same screen after 3 seconds
        await page.waitForTimeout(3000);

        const currentScreen = await page.evaluate(() => {
            const screens = ['createGameScreen', 'interrogationScreen', 'mainMenu'];
            for (const screen of screens) {
                const el = document.getElementById(screen);
                if (el && !el.classList.contains('hidden')) {
                    return screen;
                }
            }
            return 'unknown';
        });

        console.log(`   Current screen: ${currentScreen}`);

        if (currentScreen === 'createGameScreen') {
            console.error('❌ Still on Create Game screen - button did not work!');

            // Check gameManager state
            const gameManagerState = await page.evaluate(() => {
                if (typeof gameManager !== 'undefined') {
                    return {
                        exists: true,
                        playerName: gameManager.playerName,
                        gameCode: gameManager.gameCode,
                        isMultiplayer: gameManager.isMultiplayer,
                        methods: Object.getOwnPropertyNames(Object.getPrototypeOf(gameManager))
                    };
                }
                return { exists: false };
            });
            console.log('GameManager state:', gameManagerState);

            // Check if startInterrogation function exists
            const funcCheck = await page.evaluate(() => {
                if (typeof gameManager !== 'undefined' && typeof gameManager.startInterrogation === 'function') {
                    // Try calling it directly
                    try {
                        console.log('Attempting direct call to gameManager.startInterrogation()');
                        gameManager.startInterrogation();
                        return { callable: true, called: true };
                    } catch (error) {
                        return { callable: true, called: false, error: error.message };
                    }
                }
                return { callable: false };
            });
            console.log('Function check result:', funcCheck);

        } else if (currentScreen === 'interrogationScreen') {
            console.log('✅ Successfully transitioned to interrogation screen!');

            // Check if question is displayed
            const questionText = await page.$eval('#questionText', el => el.innerText).catch(() => null);
            console.log('   Question displayed:', questionText);

            const optionsCount = await page.$$eval('.option-button', options => options.length);
            console.log(`   Number of answer options: ${optionsCount}`);
        }

        await capturePageState(page, 'create_game_final_state');

    } catch (error) {
        console.error('Test failed:', error);
        await capturePageState(page, 'create_game_error');
    } finally {
        console.log('\n--- Summary ---');
        console.log(`Total console errors: ${errors.length}`);
        console.log(`Total API calls: ${networkRequests.length}`);

        if (errors.length > 0) {
            console.log('\nConsole Errors:');
            errors.forEach((err, i) => {
                console.log(`${i + 1}. ${err.text}`);
                if (err.location) {
                    console.log(`   Location: ${err.location.url}:${err.location.lineNumber}`);
                }
            });
        }

        await browser.close();
    }
}

async function testJoinGameFlow() {
    console.log('\n========================================');
    console.log('TESTING JOIN GAME FLOW - MULTIPLAYER');
    console.log('========================================\n');

    const browser = await chromium.launch({
        headless: false,
        slowMo: 100
    });

    const context = await browser.newContext();
    const page = await context.newPage();

    const errors = [];
    const networkRequests = [];

    // Set up monitoring (same as before)
    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.log(`❌ Console Error: ${msg.text()}`);
            errors.push({
                type: msg.type(),
                text: msg.text(),
                location: msg.location()
            });
        } else if (msg.text().includes('[DIVINE]') || msg.text().includes('Interrogation')) {
            console.log(`📝 Debug Log: ${msg.text()}`);
        }
    });

    page.on('request', request => {
        if (request.url().includes('/api/')) {
            console.log(`📤 API Request: ${request.method()} ${request.url()}`);
            networkRequests.push({
                method: request.method(),
                url: request.url(),
                postData: request.postData()
            });
        }
    });

    page.on('response', async response => {
        if (response.url().includes('/api/')) {
            const text = await response.text().catch(() => '');
            console.log(`📥 API Response: ${response.status()} ${response.url()}`);
            console.log(`   Body: ${text}`);
        }
    });

    try {
        // First, create a game to get a code
        console.log('1. Creating a game first to get a code...');
        await page.goto(`${BASE_URL}/static/game_flow_beautiful_integrated.html`, {
            waitUntil: 'networkidle',
            timeout: TIMEOUT
        });

        // Quick create game
        await page.click('button:has-text("Create Game")');
        await page.fill('#playerNameInput', 'Host' + Date.now());

        // Directly call the API to create game
        const gameCode = await page.evaluate(async () => {
            const response = await fetch('/api/create_game', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: 'TestHost' })
            });
            const data = await response.json();
            return data.game_code;
        });

        console.log(`   Game created with code: ${gameCode}`);

        // Now test joining
        console.log('2. Refreshing page to test join flow...');
        await page.goto(`${BASE_URL}/static/game_flow_beautiful_integrated.html`, {
            waitUntil: 'networkidle'
        });

        console.log('3. Clicking "Join Game" button...');
        await page.click('button:has-text("Join Game")');

        console.log('4. Waiting for Join Game screen...');
        await page.waitForSelector('#joinGameScreen', { state: 'visible', timeout: 10000 });

        console.log('5. Entering game code...');
        await page.fill('#gameCodeInput', gameCode);

        console.log('6. Entering player name...');
        const playerName = 'Joiner' + Date.now();
        await page.fill('#joinPlayerNameInput', playerName);

        console.log('7. Clicking "Join Game" submit button...');
        await page.click('#joinGameScreen button.btn:has-text("Join Game")');

        console.log('8. Waiting for interrogation screen...');
        try {
            await page.waitForSelector('#interrogationScreen', { state: 'visible', timeout: 10000 });
            console.log('✅ Successfully joined and reached interrogation!');

            // Check if questions are displayed
            const questionText = await page.$eval('#questionText', el => el.innerText).catch(() => null);
            console.log(`   Question: ${questionText}`);

            // Try to click an answer
            console.log('9. Testing answer click...');
            const answerButtons = await page.$$('.option-button');
            console.log(`   Found ${answerButtons.length} answer buttons`);

            if (answerButtons.length > 0) {
                // Check first button state
                const btnState = await answerButtons[0].evaluate(el => ({
                    disabled: el.disabled,
                    onclick: el.onclick ? 'has onclick' : 'no onclick',
                    text: el.innerText
                }));
                console.log('   First button state:', btnState);

                console.log('10. Clicking first answer...');
                await answerButtons[0].click();

                // Wait for response
                await page.waitForTimeout(2000);

                // Check if question changed
                const newQuestionText = await page.$eval('#questionText', el => el.innerText).catch(() => null);
                if (newQuestionText !== questionText) {
                    console.log('✅ Answer submitted successfully! New question displayed.');
                } else {
                    console.log('❌ Answer click did not work - same question still displayed');
                }
            }

        } catch (error) {
            console.error('❌ Failed to reach interrogation screen:', error.message);
            await capturePageState(page, 'join_game_failed');
        }

    } catch (error) {
        console.error('Test failed:', error);
        await capturePageState(page, 'join_game_error');
    } finally {
        console.log('\n--- Summary ---');
        console.log(`Total console errors: ${errors.length}`);
        console.log(`Total API calls: ${networkRequests.length}`);

        await browser.close();
    }
}

// Main test runner
async function runTests() {
    console.log('Starting Arcane Codex Debug Tests');
    console.log('==================================\n');
    console.log(`Server: ${BASE_URL}`);
    console.log(`Time: ${new Date().toISOString()}\n`);

    try {
        // Test server connectivity first
        const testResponse = await fetch(BASE_URL).catch(err => null);
        if (!testResponse) {
            console.error('❌ Server is not running at ' + BASE_URL);
            console.error('Please start the server first: python app.py');
            process.exit(1);
        }
        console.log('✅ Server is running\n');

        // Run tests
        await testCreateGameFlow();
        await testJoinGameFlow();

        console.log('\n==================================');
        console.log('All tests completed!');
        console.log('Check the debug_*.png and debug_*.html files for captured states');

    } catch (error) {
        console.error('Fatal error:', error);
    }
}

// Run the tests
runTests();