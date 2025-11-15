// Test to diagnose all current issues
const { chromium } = require('playwright');

(async () => {
    console.log('Starting comprehensive issue test...\n');

    const browser = await chromium.launch({ headless: false, slowMo: 500 });
    const page = await browser.newPage();

    try {
        // Test 1: Create a game
        console.log('TEST 1: Creating a game');
        await page.goto('http://localhost:5000/game');
        await page.waitForTimeout(2000);

        // Fill in hero name
        const nameInput = page.locator('#creator-name');
        if (await nameInput.count() > 0) {
            await nameInput.fill('TestHero');
            console.log('  Filled hero name');
        }

        // Take screenshot of lobby
        await page.screenshot({ path: 'lobby_state.png', fullPage: true });
        console.log('  Screenshot: lobby_state.png');

        // Click create game button
        const createBtn = page.locator('button:has-text("Embark")');
        if (await createBtn.count() > 0) {
            await createBtn.click();
            console.log('  Clicked Embark button');
            await page.waitForTimeout(3000);
        }

        // Check for errors
        const errorText = await page.locator('body').textContent();
        if (errorText.includes('error') || errorText.includes('Error')) {
            console.log('  ERROR DETECTED');
            await page.screenshot({ path: 'error_after_create.png', fullPage: true });
        }

        // Check if we're in interrogation
        const questionElement = page.locator('.question-text');
        if (await questionElement.count() > 0) {
            console.log('  Interrogation started!');

            // Test 2: Question page styling
            console.log('\nTEST 2: Checking question page styling');
            await page.screenshot({ path: 'question_page.png', fullPage: true });
            console.log('  Screenshot: question_page.png');

            // Get question text
            const questionText = await questionElement.textContent();
            console.log(`  Question: ${questionText.substring(0, 50)}...`);

            // Answer the question
            const answerBtns = page.locator('.answer-option');
            const answerCount = await answerBtns.count();
            console.log(`  Found ${answerCount} answer options`);

            if (answerCount > 0) {
                await answerBtns.first().click();
                console.log('  Clicked first answer');
                await page.waitForTimeout(3000);

                // Test 3: Check for repeated questions
                console.log('\nTEST 3: Checking for repeated questions');
                const newQuestionElement = page.locator('.question-text');
                if (await newQuestionElement.count() > 0) {
                    const newQuestionText = await newQuestionElement.textContent();
                    if (newQuestionText === questionText) {
                        console.log('  WARNING: Same question repeated!');
                        await page.screenshot({ path: 'repeated_question.png', fullPage: true });
                    } else {
                        console.log('  Different question shown');
                    }
                }
            }
        }

        // Test 4: Try to join a game in new tab
        console.log('\nTEST 4: Testing join game functionality');
        const page2 = await browser.newPage();
        await page2.goto('http://localhost:5000/game');
        await page2.waitForTimeout(2000);

        // Try to get game code from first page
        await page.bringToFront();
        const gameCodeElement = page.locator('#game-code');
        let gameCode = '';
        if (await gameCodeElement.count() > 0) {
            gameCode = await gameCodeElement.textContent();
            console.log(`  Game code: ${gameCode}`);
        }

        // Try to join on second page
        if (gameCode && gameCode !== '------') {
            await page2.bringToFront();
            const joinCodeInput = page2.locator('#join-code');
            const joinNameInput = page2.locator('#joiner-name');

            if (await joinCodeInput.count() > 0 && await joinNameInput.count() > 0) {
                await joinNameInput.fill('Player2');
                await joinCodeInput.fill(gameCode);

                const joinBtn = page2.locator('button:has-text("Join")');
                if (await joinBtn.count() > 0) {
                    await joinBtn.click();
                    console.log('  Clicked Join button');
                    await page2.waitForTimeout(3000);

                    const joinErrorElement = page2.locator('#lobby-error');
                    if (await joinErrorElement.count() > 0) {
                        const errorMsg = await joinErrorElement.textContent();
                        console.log(`  Join error: ${errorMsg}`);
                        await page2.screenshot({ path: 'join_error.png', fullPage: true });
                    } else {
                        console.log('  Join successful!');
                    }
                }
            }
        }

        // Test 5: Check map visibility
        console.log('\nTEST 5: Checking map feature');
        await page.bringToFront();
        const mapContainer = page.locator('.map-container');
        if (await mapContainer.count() > 0) {
            console.log('  Map container found!');
            await page.screenshot({ path: 'with_map.png', fullPage: true });

            // Try to toggle map
            const mapToggle = page.locator('#map-toggle');
            if (await mapToggle.count() > 0) {
                await mapToggle.click();
                console.log('  Clicked map toggle');
                await page.waitForTimeout(500);
                await page.screenshot({ path: 'map_toggled.png', fullPage: true });
            }
        } else {
            console.log('  Map container NOT found');
        }

    } catch (error) {
        console.error('Test error:', error.message);
        await page.screenshot({ path: 'test_error.png', fullPage: true });
    }

    console.log('\nTest complete! Check screenshots for issues.');
    await browser.close();
})();
