const { chromium } = require('playwright');

async function debugCSRF() {
    console.log('=== CSRF TOKEN DEBUG ===\n');

    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();

    // Monitor console
    page.on('console', msg => {
        const text = msg.text();
        if (text.includes('CSRF') || text.includes('token')) {
            console.log(`📝 Console: ${text}`);
        }
    });

    try {
        await page.goto('http://localhost:5000/static/game_flow_beautiful_integrated.html');
        await page.waitForSelector('#mainMenu');

        // Wait for initialization
        await page.waitForTimeout(2000);

        console.log('1. Checking CSRF token in gameState...');
        const tokenState = await page.evaluate(() => {
            return {
                hasGameState: typeof gameState !== 'undefined',
                csrfToken: gameState?.csrfToken,
                hasAPIManager: typeof APIManager !== 'undefined',
                getCsrfTokenExists: typeof APIManager?.getCsrfToken === 'function'
            };
        });
        console.log(JSON.stringify(tokenState, null, 2));

        if (!tokenState.csrfToken) {
            console.log('\n2. CSRF token missing! Trying to get it...');
            const newToken = await page.evaluate(async () => {
                if (APIManager && APIManager.getCsrfToken) {
                    const token = await APIManager.getCsrfToken();
                    return {
                        token: token,
                        nowInGameState: gameState?.csrfToken
                    };
                }
                return null;
            });
            console.log('New token result:', newToken);
        }

        console.log('\n3. Testing API call with token...');
        const apiTest = await page.evaluate(async () => {
            const results = {};

            // Ensure we have token
            if (!gameState.csrfToken) {
                await APIManager.getCsrfToken();
            }
            results.tokenAfterGet = gameState.csrfToken;

            // Test set_username
            try {
                const response = await fetch('/api/set_username', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': gameState.csrfToken
                    },
                    body: JSON.stringify({ username: 'TestUser123' })
                });

                results.setUsername = {
                    status: response.status,
                    statusText: response.statusText,
                    headers: {
                        contentType: response.headers.get('content-type')
                    }
                };

                if (response.headers.get('content-type')?.includes('json')) {
                    results.setUsername.data = await response.json();
                } else {
                    const text = await response.text();
                    results.setUsername.textResponse = text.substring(0, 200);
                }
            } catch (error) {
                results.setUsername = { error: error.message };
            }

            // Now try APIManager.call
            results.apiManagerCall = await APIManager.call('/api/set_username', 'POST', {
                username: 'TestUser456'
            });

            return results;
        });

        console.log('\n4. API test results:');
        console.log(JSON.stringify(apiTest, null, 2));

        // Now test the full flow
        console.log('\n5. Testing full startInterrogation flow...');

        await page.evaluate(() => {
            gameManager.showCharacterCreation();
        });

        await page.fill('#playerNameInput', 'DebugPlayer');
        await page.click('button:has-text("Face the Gods")');

        // Capture network activity
        const requests = [];
        page.on('request', req => {
            if (req.url().includes('/api/')) {
                requests.push({
                    url: req.url().split('/').pop(),
                    headers: req.headers(),
                    method: req.method()
                });
            }
        });

        await page.waitForTimeout(3000);

        console.log('\n6. Network requests made:');
        requests.forEach(req => {
            console.log(`   ${req.method} /${req.url}`);
            if (req.headers['x-csrftoken']) {
                console.log(`     X-CSRFToken: ${req.headers['x-csrftoken'].substring(0, 20)}...`);
            } else {
                console.log('     ⚠️ NO CSRF TOKEN IN HEADERS');
            }
        });

        // Check final state
        const finalState = await page.evaluate(() => {
            const activeScreen = document.querySelector('.screen.active');
            return {
                activeScreen: activeScreen?.id,
                csrfTokenStillPresent: gameState?.csrfToken ? 'yes' : 'no',
                errorToasts: Array.from(document.querySelectorAll('.toast.error')).map(t => t.textContent)
            };
        });

        console.log('\n7. Final state:');
        console.log(JSON.stringify(finalState, null, 2));

    } catch (error) {
        console.error('Test error:', error);
    } finally {
        await page.waitForTimeout(3000);
        await browser.close();
    }
}

debugCSRF();