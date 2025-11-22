const { chromium } = require('playwright');

async function finalConfirmation() {
    console.log('=================================');
    console.log('   FINAL CONFIRMATION TEST');
    console.log('=================================\n');

    const browser = await chromium.launch({
        headless: false,
        slowMo: 100
    });

    const page = await browser.newPage();

    // Monitor console for errors
    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.log(`❌ Error: ${msg.text()}`);
        }
    });

    let testsPassed = 0;
    let testsFailed = 0;

    try {
        await page.goto('http://localhost:5000/static/game_flow_beautiful_integrated.html');
        await page.waitForSelector('#mainMenu', { state: 'visible' });
        await page.waitForTimeout(2000);

        // TEST 1: CREATE GAME FLOW
        console.log('TEST 1: CREATE GAME → FACE THE GODS');
        console.log('=====================================');

        // Navigate to character creation
        await page.evaluate(() => gameManager.showCharacterCreation());
        console.log('✓ Navigated to character creation');

        // Enter name
        await page.fill('#playerNameInput', 'TestHero' + Date.now());
        console.log('✓ Entered player name');

        // Click Face the Gods
        await page.click('button:has-text("Face the Gods")');
        console.log('✓ Clicked Face the Gods');

        // Wait for screen transition
        await page.waitForTimeout(3000);

        // Check if we reached interrogation
        const test1Result = await page.evaluate(() => {
            const activeScreen = document.querySelector('.screen.active');
            const questionText = document.getElementById('questionText')?.textContent;
            const optionButtons = document.querySelectorAll('.option-button');

            return {
                activeScreenId: activeScreen?.id,
                isInterrogation: activeScreen?.id === 'divineInterrogation',
                hasQuestion: questionText && questionText !== 'Loading divine wisdom...',
                questionPreview: questionText?.substring(0, 50),
                optionCount: optionButtons.length
            };
        });

        if (test1Result.isInterrogation && test1Result.hasQuestion && test1Result.optionCount > 0) {
            console.log('✅ TEST 1 PASSED: Reached Divine Interrogation');
            console.log(`   - Question: "${test1Result.questionPreview}..."`);
            console.log(`   - ${test1Result.optionCount} answer options available`);

            // Test clicking an answer
            await page.click('.option-button:first-child');
            await page.waitForTimeout(2000);

            const afterAnswer = await page.evaluate(() => {
                const questionText = document.getElementById('questionText')?.textContent;
                return questionText?.substring(0, 50);
            });

            if (afterAnswer !== test1Result.questionPreview) {
                console.log('✅ Answer submission works - new question displayed');
            }
            testsPassed++;
        } else {
            console.log('❌ TEST 1 FAILED: Did not reach Divine Interrogation');
            console.log(`   Current screen: ${test1Result.activeScreenId}`);
            testsFailed++;
        }

        // Reset for next test
        await page.reload();
        await page.waitForSelector('#mainMenu');
        await page.waitForTimeout(2000);

        // TEST 2: JOIN GAME FLOW
        console.log('\nTEST 2: JOIN GAME → MULTIPLAYER');
        console.log('================================');

        // First create a game to join
        const gameCode = await page.evaluate(async () => {
            // Get CSRF token
            const csrfResp = await fetch('/api/csrf-token');
            const csrfData = await csrfResp.json();

            // Set username
            await fetch('/api/set_username', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfData.csrf_token
                },
                body: JSON.stringify({ username: 'GameHost' })
            });

            // Create game
            const createResp = await fetch('/api/create_game', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfData.csrf_token
                }
            });
            const createData = await createResp.json();
            return createData.game_code;
        });

        console.log(`✓ Created game with code: ${gameCode}`);

        // Navigate to join screen
        await page.evaluate(() => gameManager.showJoinGame());
        console.log('✓ Navigated to join screen');

        // Fill in game code and name
        await page.fill('#gameCodeInput', gameCode);
        await page.fill('#joinPlayerNameInput', 'JoinPlayer' + Date.now());
        console.log('✓ Entered game code and name');

        // Click Join Party
        await page.click('button:has-text("Join Party")');
        console.log('✓ Clicked Join Party');

        // Wait for response
        await page.waitForTimeout(3000);

        // Check if we reached interrogation
        const test2Result = await page.evaluate(() => {
            const activeScreen = document.querySelector('.screen.active');
            const questionText = document.getElementById('questionText')?.textContent;
            const optionButtons = document.querySelectorAll('.option-button');

            return {
                activeScreenId: activeScreen?.id,
                isInterrogation: activeScreen?.id === 'divineInterrogation',
                hasQuestion: questionText && questionText !== 'Loading divine wisdom...',
                optionCount: optionButtons.length
            };
        });

        if (test2Result.isInterrogation && test2Result.hasQuestion && test2Result.optionCount > 0) {
            console.log('✅ TEST 2 PASSED: Joined game and reached interrogation');
            console.log(`   - ${test2Result.optionCount} answer options available`);

            // Test multiplayer answer
            await page.click('.option-button:first-child');
            console.log('✅ Multiplayer answer click works');
            testsPassed++;
        } else {
            console.log('❌ TEST 2 FAILED: Did not reach interrogation after join');
            console.log(`   Current screen: ${test2Result.activeScreenId}`);
            testsFailed++;
        }

    } catch (error) {
        console.error('\nTest error:', error.message);
        testsFailed = 2;
    } finally {
        console.log('\n=================================');
        console.log('        TEST SUMMARY');
        console.log('=================================');
        console.log(`✅ Passed: ${testsPassed}/2`);
        console.log(`❌ Failed: ${testsFailed}/2`);

        if (testsPassed === 2) {
            console.log('\n🎉 ALL TESTS PASSED! Both issues are fixed!');
        } else {
            console.log('\n⚠️  Some tests failed. Please review the output above.');
        }

        await page.waitForTimeout(3000);
        await browser.close();
    }
}

finalConfirmation();