const { chromium } = require('playwright');

async function testErrorCapture() {
    console.log('=== ERROR CAPTURE TEST ===\n');

    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();

    // Capture all errors
    const errors = [];
    page.on('pageerror', error => {
        errors.push(error.message);
        console.log('❌ Page Error:', error.message);
    });

    page.on('console', msg => {
        if (msg.type() === 'error') {
            errors.push(msg.text());
            console.log('❌ Console Error:', msg.text());
        }
    });

    try {
        await page.goto('http://localhost:5000/static/game_flow_beautiful_integrated.html');
        await page.waitForSelector('#mainMenu');
        await page.waitForTimeout(2000);

        console.log('1. Testing startInterrogation with error handling...\n');

        const result = await page.evaluate(async () => {
            const log = [];

            // Navigate to character creation
            gameManager.showCharacterCreation();
            document.getElementById('playerNameInput').value = 'TestPlayer';

            // Wrap startInterrogation to catch errors
            try {
                log.push('Calling startInterrogation...');

                // Call it and await it properly
                const result = await gameManager.startInterrogation();

                log.push('startInterrogation completed');
                log.push('Result: ' + JSON.stringify(result));

                return { success: true, log, result };
            } catch (error) {
                log.push('ERROR: ' + error.message);
                log.push('Stack: ' + error.stack);

                // Check where we are after error
                const activeScreen = document.querySelector('.screen.active');
                log.push('Active screen after error: ' + activeScreen?.id);

                return {
                    success: false,
                    error: error.message,
                    stack: error.stack,
                    log
                };
            }
        });

        console.log('Result:', JSON.stringify(result, null, 2));

        // Now test the actual button with proper async handling
        console.log('\n2. Testing button with async wrapper...\n');

        await page.evaluate(() => {
            // Reload the page state
            gameManager.showCharacterCreation();
            document.getElementById('playerNameInput').value = 'TestPlayer2';

            // Replace the button onclick to properly handle async
            const btn = document.querySelector('button[onclick*="startInterrogation"]');
            if (btn) {
                btn.onclick = async function(e) {
                    e.preventDefault();
                    console.log('Button clicked - calling startInterrogation with await...');
                    try {
                        await gameManager.startInterrogation();
                        console.log('startInterrogation completed successfully');
                    } catch (error) {
                        console.error('startInterrogation failed:', error);
                    }
                };
            }
        });

        // Click the button
        await page.click('button:has-text("Face the Gods")');
        await page.waitForTimeout(5000);

        const finalState = await page.evaluate(() => {
            const activeScreen = document.querySelector('.screen.active');
            return {
                activeScreenId: activeScreen?.id,
                divineInterrogationActive: document.getElementById('divineInterrogation').classList.contains('active'),
                hasQuestion: document.getElementById('questionText')?.textContent !== 'Loading divine wisdom...',
                questionText: document.getElementById('questionText')?.textContent?.substring(0, 100)
            };
        });

        console.log('\n3. Final state:', JSON.stringify(finalState, null, 2));

        if (errors.length > 0) {
            console.log('\n4. Captured errors:');
            errors.forEach((err, i) => {
                console.log(`   ${i + 1}. ${err}`);
            });
        }

    } catch (error) {
        console.error('Test error:', error);
    } finally {
        await browser.close();
    }
}

testErrorCapture();