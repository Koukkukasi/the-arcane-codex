const { chromium } = require('playwright');

async function testInterrogationResponse() {
    console.log('=== INTERROGATION RESPONSE TEST ===\n');

    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();

    // Capture responses
    const responses = {};
    page.on('response', async resp => {
        if (resp.url().includes('/api/')) {
            const endpoint = resp.url().split('/').pop();
            try {
                const json = await resp.json();
                responses[endpoint] = json;
                console.log(`\n📥 /${endpoint}:`, JSON.stringify(json, null, 2));
            } catch {}
        }
    });

    try {
        await page.goto('http://localhost:5000/static/game_flow_beautiful_integrated.html');
        await page.waitForSelector('#mainMenu');
        await page.waitForTimeout(2000);

        console.log('1. Testing startInterrogation method directly...\n');

        const result = await page.evaluate(async () => {
            // Show character creation
            gameManager.showCharacterCreation();
            document.getElementById('playerNameInput').value = 'TestPlayer';

            // Store original method
            const originalShowScreen = gameManager.showScreen;
            const originalDisplayQuestion = gameManager.displayQuestion;

            let capturedData = {
                showScreenCalled: false,
                displayQuestionCalled: false,
                screenToShow: null,
                questionData: null
            };

            // Intercept method calls
            gameManager.showScreen = function(screenId) {
                capturedData.showScreenCalled = true;
                capturedData.screenToShow = screenId;
                console.log('showScreen called with:', screenId);
                originalShowScreen.call(this, screenId);
            };

            gameManager.displayQuestion = function(questionData) {
                capturedData.displayQuestionCalled = true;
                capturedData.questionData = questionData;
                console.log('displayQuestion called with:', questionData);
                originalDisplayQuestion.call(this, questionData);
            };

            // Call startInterrogation
            await gameManager.startInterrogation();

            // Check final state
            const activeScreen = document.querySelector('.screen.active');
            capturedData.finalActiveScreen = activeScreen?.id;

            // Restore original methods
            gameManager.showScreen = originalShowScreen;
            gameManager.displayQuestion = originalDisplayQuestion;

            return capturedData;
        });

        console.log('\n2. Method call capture:');
        console.log(JSON.stringify(result, null, 2));

        // Check what's in the response
        console.log('\n3. Captured API responses:');
        if (responses.start_interrogation) {
            console.log('start_interrogation response:', JSON.stringify(responses.start_interrogation, null, 2));

            // Check if response matches expected structure
            const resp = responses.start_interrogation;
            console.log('\nResponse analysis:');
            console.log(`  - Has 'status' field: ${resp.hasOwnProperty('status')}`);
            console.log(`  - Status value: ${resp.status}`);
            console.log(`  - Has 'question' field: ${resp.hasOwnProperty('question')}`);
            console.log(`  - Question is object: ${typeof resp.question === 'object'}`);

            if (resp.question) {
                console.log(`  - Question has 'question_text': ${resp.question.hasOwnProperty('question_text')}`);
                console.log(`  - Question has 'options': ${resp.question.hasOwnProperty('options')}`);
            }

            // Test the condition
            const conditionMet = resp && resp.status === 'success' && resp.question;
            console.log(`\n  Condition (result && result.status === 'success' && result.question): ${conditionMet}`);
        }

        // Now let's manually test what happens
        console.log('\n4. Manual test of screen transition...');

        const manualTest = await page.evaluate(async () => {
            // Simulate a successful response
            const mockResponse = {
                status: 'success',
                question: {
                    question_number: 1,
                    question_text: 'Test question',
                    options: [
                        { id: 0, text: 'Option 1' },
                        { id: 1, text: 'Option 2' }
                    ]
                }
            };

            // Check if condition would pass
            const conditionPasses = mockResponse && mockResponse.status === 'success' && mockResponse.question;

            if (conditionPasses) {
                gameManager.showScreen('divineInterrogation');
                gameManager.displayQuestion(mockResponse.question);
            }

            const activeScreen = document.querySelector('.screen.active');
            return {
                conditionPassed: conditionPasses,
                screenChanged: activeScreen?.id === 'divineInterrogation',
                activeScreenId: activeScreen?.id,
                questionDisplayed: document.getElementById('questionText')?.textContent
            };
        });

        console.log('Manual test result:', JSON.stringify(manualTest, null, 2));

    } catch (error) {
        console.error('Test error:', error);
    } finally {
        await page.waitForTimeout(5000);
        await browser.close();
    }
}

testInterrogationResponse();