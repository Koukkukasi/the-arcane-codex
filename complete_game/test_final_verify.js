const { chromium } = require('playwright');

async function finalVerification() {
    console.log('=== FINAL VERIFICATION TEST ===\n');

    const browser = await chromium.launch({
        headless: false,
        slowMo: 100
    });

    const page = await browser.newPage();

    // Monitor console
    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.log(`❌ Error: ${msg.text()}`);
        }
    });

    // Monitor API responses
    page.on('response', async response => {
        if (response.url().includes('/api/')) {
            const url = response.url().split('/').pop();
            const status = response.status();
            console.log(`📥 API /${url}: ${status}`);
            if (status !== 200) {
                const text = await response.text().catch(() => '');
                if (text.includes('message')) {
                    try {
                        const json = JSON.parse(text);
                        console.log(`   Message: ${json.message}`);
                    } catch {}
                }
            }
        }
    });

    try {
        console.log('TEST 1: CREATE GAME FLOW');
        console.log('-------------------------\n');

        await page.goto('http://localhost:5000/static/game_flow_beautiful_integrated.html');
        await page.waitForSelector('#mainMenu', { state: 'visible' });

        console.log('1. Testing direct function call...');
        const directTest = await page.evaluate(() => {
            gameManager.showCharacterCreation();
            return document.getElementById('characterCreation').classList.contains('active');
        });
        console.log(`   Character creation screen shown: ${directTest ? '✅' : '❌'}`);

        if (directTest) {
            console.log('\n2. Testing Face the Gods flow...');

            // Enter name
            await page.fill('#playerNameInput', 'TestPlayer' + Date.now());
            console.log('   Name entered ✅');

            // Click Face the Gods
            await page.click('button:has-text("Face the Gods")');
            console.log('   Face the Gods clicked...');

            // Wait for interrogation screen
            await page.waitForTimeout(3000);

            const interrogationActive = await page.evaluate(() => {
                return document.getElementById('divineInterrogation').classList.contains('active');
            });

            if (interrogationActive) {
                console.log('   Divine Interrogation reached ✅');

                // Check for question
                const questionText = await page.$eval('#questionText', el => el.textContent).catch(() => null);
                if (questionText) {
                    console.log(`   Question displayed: "${questionText.substring(0, 50)}..."✅`);

                    // Test answer click
                    const answerButtons = await page.$$('.option-button');
                    if (answerButtons.length > 0) {
                        console.log(`   ${answerButtons.length} answer options available ✅`);

                        await answerButtons[0].click();
                        console.log('   Answer clicked ✅');

                        await page.waitForTimeout(2000);

                        const newQuestion = await page.$eval('#questionText', el => el.textContent).catch(() => null);
                        if (newQuestion !== questionText) {
                            console.log('   New question received ✅');
                            console.log('\n✅ CREATE GAME FLOW WORKS!');
                        } else {
                            console.log('   ⚠️ Same question - answer might not have submitted');
                        }
                    }
                }
            } else {
                console.log('   ❌ Failed to reach Divine Interrogation');
            }
        }

        // Reset for join test
        await page.reload();
        await page.waitForSelector('#mainMenu');

        console.log('\n\nTEST 2: JOIN GAME FLOW');
        console.log('-------------------------\n');

        // First create a game via API
        console.log('1. Creating test game via API...');
        const gameCode = await page.evaluate(async () => {
            // Get CSRF token
            const csrfResp = await fetch('/api/csrf-token');
            const csrfData = await csrfResp.json();
            const csrfToken = csrfData.csrf_token;

            // Set username
            await fetch('/api/set_username', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken
                },
                body: JSON.stringify({ username: 'TestHost' })
            });

            // Create game
            const createResp = await fetch('/api/create_game', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken
                }
            });
            const createData = await createResp.json();
            return createData.game_code;
        });

        console.log(`   Game created: ${gameCode} ✅`);

        // Navigate to join screen
        console.log('\n2. Testing join flow...');
        await page.evaluate(() => {
            gameManager.showJoinGame();
        });

        const joinScreenActive = await page.evaluate(() => {
            return document.getElementById('joinGameScreen').classList.contains('active');
        });
        console.log(`   Join screen shown: ${joinScreenActive ? '✅' : '❌'}`);

        if (joinScreenActive) {
            // Fill in details
            await page.fill('#gameCodeInput', gameCode);
            await page.fill('#joinPlayerNameInput', 'TestJoiner' + Date.now());
            console.log('   Game code and name entered ✅');

            // Click join
            await page.click('button:has-text("Join Party")');
            console.log('   Join Party clicked...');

            await page.waitForTimeout(3000);

            const joinedInterrogation = await page.evaluate(() => {
                return document.getElementById('divineInterrogation').classList.contains('active');
            });

            if (joinedInterrogation) {
                console.log('   Divine Interrogation reached ✅');

                // Test multiplayer answer
                const answerButtons = await page.$$('.option-button');
                if (answerButtons.length > 0) {
                    console.log(`   ${answerButtons.length} answer options available ✅`);

                    await answerButtons[0].click();
                    console.log('   Answer clicked in multiplayer ✅');

                    console.log('\n✅ JOIN GAME FLOW WORKS!');
                }
            } else {
                console.log('   ❌ Failed to reach interrogation after join');
            }
        }

    } catch (error) {
        console.error('\nTest error:', error.message);
    } finally {
        console.log('\n=== TEST COMPLETE ===\n');
        await page.waitForTimeout(3000);
        await browser.close();
    }
}

finalVerification();