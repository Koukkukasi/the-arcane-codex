const { chromium } = require('playwright');

async function testAPIResponses() {
    console.log('=== API RESPONSE CAPTURE TEST ===\n');

    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();

    // Capture all API responses
    const apiResponses = {};

    page.on('response', async response => {
        if (response.url().includes('/api/')) {
            const url = response.url().split('/').pop();
            try {
                const text = await response.text();
                const json = JSON.parse(text);
                apiResponses[url] = {
                    status: response.status(),
                    data: json
                };
                console.log(`\n📥 API /${url}:`);
                console.log(JSON.stringify(json, null, 2));
            } catch (e) {
                apiResponses[url] = {
                    status: response.status(),
                    error: 'Failed to parse response'
                };
            }
        }
    });

    try {
        await page.goto('http://localhost:5000/static/game_flow_beautiful_integrated.html');
        await page.waitForSelector('#mainMenu');

        console.log('1. Testing startInterrogation flow...\n');

        // Execute the flow manually
        const flowResult = await page.evaluate(async () => {
            const results = {};

            try {
                // Show character creation
                gameManager.showCharacterCreation();
                results.screenShown = document.getElementById('characterCreation').classList.contains('active');

                // Set player name
                document.getElementById('playerNameInput').value = 'TestPlayer123';

                // Call startInterrogation directly and capture result
                console.log('Calling startInterrogation...');

                // First set username
                const usernameResp = await fetch('/api/set_username', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': document.querySelector('meta[name="csrf-token"]')?.content || ''
                    },
                    body: JSON.stringify({ username: 'TestPlayer123' })
                });
                results.username = await usernameResp.json();

                // Create game
                const createResp = await fetch('/api/create_game', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': document.querySelector('meta[name="csrf-token"]')?.content || ''
                    }
                });
                results.createGame = await createResp.json();

                // Start interrogation
                const interrogationResp = await fetch('/api/start_interrogation', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': document.querySelector('meta[name="csrf-token"]')?.content || ''
                    }
                });
                results.interrogation = await interrogationResp.json();

                // Check what startInterrogation expects
                if (results.interrogation) {
                    results.hasStatus = 'status' in results.interrogation;
                    results.hasQuestion = 'question' in results.interrogation;
                    results.statusValue = results.interrogation.status;

                    // Check the condition
                    results.conditionMet = results.interrogation &&
                                          results.interrogation.status === 'success' &&
                                          results.interrogation.question;
                }

                return results;
            } catch (error) {
                return { error: error.message, stack: error.stack };
            }
        });

        console.log('\n2. Flow execution results:');
        console.log(JSON.stringify(flowResult, null, 2));

        // Now try the actual button click
        console.log('\n3. Testing actual button click...');

        if (flowResult.screenShown) {
            await page.fill('#playerNameInput', 'TestPlayer456');
            await page.click('button:has-text("Face the Gods")');

            await page.waitForTimeout(3000);

            const afterClick = await page.evaluate(() => {
                const activeScreen = document.querySelector('.screen.active');
                return {
                    activeScreenId: activeScreen?.id,
                    divineInterrogationActive: document.getElementById('divineInterrogation').classList.contains('active'),
                    questionText: document.getElementById('questionText')?.textContent,
                    optionCount: document.querySelectorAll('.option-button').length
                };
            });

            console.log('\n4. After button click:');
            console.log(JSON.stringify(afterClick, null, 2));
        }

    } catch (error) {
        console.error('Test error:', error);
    } finally {
        console.log('\n=== END OF TEST ===');
        await page.waitForTimeout(5000);
        await browser.close();
    }
}

testAPIResponses();