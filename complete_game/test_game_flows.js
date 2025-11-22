const { chromium } = require('playwright');
const fs = require('fs').promises;

// Store all captured data
const capturedData = {
    createGameFlow: {
        consoleErrors: [],
        networkErrors: [],
        apiResponses: []
    },
    joinGameFlow: {
        consoleErrors: [],
        networkErrors: [],
        apiResponses: []
    }
};

async function testCreateGameFlow(page) {
    console.log('\n=== Testing Create Game Flow ===\n');

    // Clear previous data
    capturedData.createGameFlow = {
        consoleErrors: [],
        networkErrors: [],
        apiResponses: []
    };

    // Navigate to the game
    await page.goto('http://localhost:5000/static/game_flow_beautiful_integrated.html');
    await page.waitForTimeout(2000);

    // Take initial screenshot
    await page.screenshot({ path: 'screenshots/create_game_1_initial.png', fullPage: true });
    console.log('Screenshot saved: create_game_1_initial.png');

    // Click Create Game button
    console.log('Clicking "Create Game" button...');
    await page.click('button:has-text("Create Game")');
    await page.waitForTimeout(1000);

    // Enter player name
    console.log('Entering player name...');
    const nameInput = await page.locator('#playerNameInput');
    await nameInput.fill('TestPlayer1');
    await page.screenshot({ path: 'screenshots/create_game_2_name_entered.png', fullPage: true });
    console.log('Screenshot saved: create_game_2_name_entered.png');

    // Click Face the Gods button
    console.log('Attempting to click "Face the Gods" button...');

    // First check if button exists and its state
    const faceTheGodsButton = await page.locator('button:has-text("Face the Gods")');
    const buttonExists = await faceTheGodsButton.count() > 0;

    if (buttonExists) {
        const isDisabled = await faceTheGodsButton.isDisabled();
        const isVisible = await faceTheGodsButton.isVisible();
        console.log(`Face the Gods button - Exists: ${buttonExists}, Visible: ${isVisible}, Disabled: ${isDisabled}`);

        // Get button HTML for debugging
        const buttonHTML = await faceTheGodsButton.evaluate(el => el.outerHTML);
        console.log('Button HTML:', buttonHTML);

        // Try to click the button
        try {
            await faceTheGodsButton.click();
            console.log('Successfully clicked "Face the Gods" button');
            await page.waitForTimeout(2000);
        } catch (error) {
            console.error('Failed to click "Face the Gods" button:', error.message);
            capturedData.createGameFlow.consoleErrors.push({
                type: 'click_error',
                message: error.message,
                timestamp: new Date().toISOString()
            });
        }
    } else {
        console.error('Face the Gods button not found!');
    }

    // Take final screenshot
    await page.screenshot({ path: 'screenshots/create_game_3_after_click.png', fullPage: true });
    console.log('Screenshot saved: create_game_3_after_click.png');

    // Check final state
    const currentURL = page.url();
    console.log('Final URL:', currentURL);

    // Check if we're in game state
    const gameCodeElement = await page.locator('#gameCode');
    if (await gameCodeElement.count() > 0) {
        const gameCode = await gameCodeElement.textContent();
        console.log('Game Code:', gameCode);
    }
}

async function testJoinGameFlow(page, gameCode) {
    console.log('\n=== Testing Join Game Flow ===\n');

    // Clear previous data
    capturedData.joinGameFlow = {
        consoleErrors: [],
        networkErrors: [],
        apiResponses: []
    };

    // Open new page for second player
    await page.goto('http://localhost:5000/static/game_flow_beautiful_integrated.html');
    await page.waitForTimeout(2000);

    // Take initial screenshot
    await page.screenshot({ path: 'screenshots/join_game_1_initial.png', fullPage: true });
    console.log('Screenshot saved: join_game_1_initial.png');

    // Enter game code
    console.log(`Entering game code: ${gameCode}`);
    const codeInput = await page.locator('#gameCodeInput');
    await codeInput.fill(gameCode);

    // Enter player name
    console.log('Entering player name...');
    const nameInput = await page.locator('#playerNameInput');
    await nameInput.fill('TestPlayer2');

    await page.screenshot({ path: 'screenshots/join_game_2_details_entered.png', fullPage: true });
    console.log('Screenshot saved: join_game_2_details_entered.png');

    // Click Join button
    console.log('Clicking "Join" button...');
    const joinButton = await page.locator('button:has-text("Join")');
    await joinButton.click();
    await page.waitForTimeout(3000);

    await page.screenshot({ path: 'screenshots/join_game_3_after_join.png', fullPage: true });
    console.log('Screenshot saved: join_game_3_after_join.png');

    // Check if we're in the game
    const inGame = await page.locator('#gameArea').isVisible();
    console.log('In game area:', inGame);

    if (inGame) {
        // Look for question/answer elements
        console.log('Looking for question and answer elements...');

        // Check for question text
        const questionElement = await page.locator('.question-text, #questionText, [class*="question"]').first();
        if (await questionElement.count() > 0) {
            const questionText = await questionElement.textContent();
            console.log('Current question:', questionText);
        }

        // Check for answer buttons
        const answerButtons = await page.locator('button.answer-btn, button[class*="answer"], .answer-option');
        const answerCount = await answerButtons.count();
        console.log(`Found ${answerCount} answer buttons`);

        if (answerCount > 0) {
            // Try to click the first answer
            console.log('Attempting to click first answer...');
            const firstAnswer = answerButtons.first();

            // Check button state
            const isDisabled = await firstAnswer.isDisabled();
            const isVisible = await firstAnswer.isVisible();
            console.log(`First answer button - Visible: ${isVisible}, Disabled: ${isDisabled}`);

            try {
                await firstAnswer.click();
                console.log('Successfully clicked answer button');
                await page.waitForTimeout(2000);
            } catch (error) {
                console.error('Failed to click answer button:', error.message);
                capturedData.joinGameFlow.consoleErrors.push({
                    type: 'click_error',
                    message: error.message,
                    timestamp: new Date().toISOString()
                });
            }

            await page.screenshot({ path: 'screenshots/join_game_4_after_answer.png', fullPage: true });
            console.log('Screenshot saved: join_game_4_after_answer.png');
        } else {
            console.error('No answer buttons found!');
        }
    }
}

async function runTests() {
    const browser = await chromium.launch({
        headless: false,  // Set to true for headless mode
        devtools: true    // Open DevTools to see console
    });

    try {
        // Create screenshots directory
        await fs.mkdir('screenshots', { recursive: true });

        // Test Create Game Flow
        const page1 = await browser.newPage();

        // Set up console error monitoring
        page1.on('console', msg => {
            if (msg.type() === 'error') {
                const error = {
                    type: 'console_error',
                    message: msg.text(),
                    location: msg.location(),
                    timestamp: new Date().toISOString()
                };
                capturedData.createGameFlow.consoleErrors.push(error);
                console.log('Console Error (Create):', msg.text());
            }
        });

        // Set up network monitoring
        page1.on('requestfailed', request => {
            const error = {
                url: request.url(),
                method: request.method(),
                failure: request.failure(),
                timestamp: new Date().toISOString()
            };
            capturedData.createGameFlow.networkErrors.push(error);
            console.log('Network Error (Create):', request.url(), request.failure());
        });

        // Monitor API responses
        page1.on('response', response => {
            if (response.url().includes('/api/') || response.url().includes('socket.io')) {
                const apiResponse = {
                    url: response.url(),
                    status: response.status(),
                    statusText: response.statusText(),
                    timestamp: new Date().toISOString()
                };
                capturedData.createGameFlow.apiResponses.push(apiResponse);

                if (response.status() >= 400) {
                    console.log(`API Error (Create): ${response.url()} - ${response.status()} ${response.statusText()}`);
                }
            }
        });

        // Run create game test
        await testCreateGameFlow(page1);

        // Get the game code if available
        let gameCode = 'TEST123'; // Default test code
        const gameCodeElement = await page1.locator('#gameCode');
        if (await gameCodeElement.count() > 0) {
            gameCode = await gameCodeElement.textContent();
        }

        // Test Join Game Flow (use same browser, new page)
        const page2 = await browser.newPage();

        // Set up console error monitoring for join flow
        page2.on('console', msg => {
            if (msg.type() === 'error') {
                const error = {
                    type: 'console_error',
                    message: msg.text(),
                    location: msg.location(),
                    timestamp: new Date().toISOString()
                };
                capturedData.joinGameFlow.consoleErrors.push(error);
                console.log('Console Error (Join):', msg.text());
            }
        });

        // Set up network monitoring for join flow
        page2.on('requestfailed', request => {
            const error = {
                url: request.url(),
                method: request.method(),
                failure: request.failure(),
                timestamp: new Date().toISOString()
            };
            capturedData.joinGameFlow.networkErrors.push(error);
            console.log('Network Error (Join):', request.url(), request.failure());
        });

        // Monitor API responses for join flow
        page2.on('response', response => {
            if (response.url().includes('/api/') || response.url().includes('socket.io')) {
                const apiResponse = {
                    url: response.url(),
                    status: response.status(),
                    statusText: response.statusText(),
                    timestamp: new Date().toISOString()
                };
                capturedData.joinGameFlow.apiResponses.push(apiResponse);

                if (response.status() >= 400) {
                    console.log(`API Error (Join): ${response.url()} - ${response.status()} ${response.statusText()}`);
                }
            }
        });

        // Run join game test
        await testJoinGameFlow(page2, gameCode);

        // Save captured data to file
        await fs.writeFile('captured_errors.json', JSON.stringify(capturedData, null, 2));
        console.log('\n=== Test Results Saved ===');
        console.log('Captured errors saved to: captured_errors.json');
        console.log('Screenshots saved to: screenshots/');

        // Print summary
        console.log('\n=== Error Summary ===');
        console.log('Create Game Flow:');
        console.log(`  Console Errors: ${capturedData.createGameFlow.consoleErrors.length}`);
        console.log(`  Network Errors: ${capturedData.createGameFlow.networkErrors.length}`);
        console.log(`  API Responses: ${capturedData.createGameFlow.apiResponses.length}`);

        console.log('\nJoin Game Flow:');
        console.log(`  Console Errors: ${capturedData.joinGameFlow.consoleErrors.length}`);
        console.log(`  Network Errors: ${capturedData.joinGameFlow.networkErrors.length}`);
        console.log(`  API Responses: ${capturedData.joinGameFlow.apiResponses.length}`);

        // Keep browser open for 10 seconds to observe
        console.log('\nKeeping browser open for observation...');
        await page1.waitForTimeout(10000);

    } catch (error) {
        console.error('Test failed:', error);
    } finally {
        await browser.close();
    }
}

// Run the tests
runTests().catch(console.error);