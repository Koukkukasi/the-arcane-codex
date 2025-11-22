const { chromium } = require('playwright');

async function detailedTest() {
    const browser = await chromium.launch({
        headless: false,
        slowMo: 100,
        devtools: true  // Open devtools
    });

    const page = await browser.newPage();

    // Monitor everything
    page.on('console', msg => {
        if (msg.type() === 'log') {
            console.log(`📝 Log: ${msg.text()}`);
        } else if (msg.type() === 'error') {
            console.log(`❌ Error: ${msg.text()}`);
        }
    });

    try {
        console.log('1. Loading page...');
        await page.goto('http://localhost:5000/static/game_flow_beautiful_integrated.html');

        // Wait for page to load
        await page.waitForSelector('#mainMenu', { state: 'visible' });

        console.log('2. Checking gameManager exists...');
        const gameManagerExists = await page.evaluate(() => {
            return typeof gameManager !== 'undefined';
        });
        console.log(`   gameManager exists: ${gameManagerExists}`);

        console.log('3. Testing showCharacterCreation directly...');
        const directCallResult = await page.evaluate(() => {
            if (typeof gameManager !== 'undefined' && typeof gameManager.showCharacterCreation === 'function') {
                try {
                    gameManager.showCharacterCreation();
                    // Check which screen is active
                    const activeScreen = document.querySelector('.screen.active');
                    return {
                        success: true,
                        activeScreenId: activeScreen ? activeScreen.id : 'none',
                        characterCreationVisible: document.getElementById('characterCreation').classList.contains('active')
                    };
                } catch (error) {
                    return { success: false, error: error.message };
                }
            }
            return { success: false, error: 'gameManager not found' };
        });
        console.log('   Direct call result:', directCallResult);

        // Check Create Game button
        console.log('4. Checking Create Game button...');
        const buttonInfo = await page.evaluate(() => {
            const btn = document.querySelector('button:has-text("Create Game")') ||
                       Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Create Game')) ||
                       Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('CREATE GAME'));

            if (btn) {
                return {
                    found: true,
                    text: btn.textContent.trim(),
                    onclick: btn.onclick ? btn.onclick.toString() : 'null',
                    hasEventListener: btn.onclick !== null,
                    disabled: btn.disabled,
                    className: btn.className
                };
            }
            return { found: false };
        });
        console.log('   Button info:', buttonInfo);

        console.log('5. Clicking Create Game button...');
        // Try different selectors
        try {
            await page.click('button:has-text("CREATE GAME")');
        } catch (e1) {
            try {
                await page.click('button:has-text("Create Game")');
            } catch (e2) {
                // Click first button
                await page.click('.menu-buttons button:first-child');
            }
        }

        // Wait a bit
        await page.waitForTimeout(1000);

        console.log('6. Checking current screen after click...');
        const afterClickState = await page.evaluate(() => {
            const activeScreen = document.querySelector('.screen.active');
            const allScreens = Array.from(document.querySelectorAll('.screen')).map(s => ({
                id: s.id,
                active: s.classList.contains('active'),
                display: window.getComputedStyle(s).display
            }));

            return {
                activeScreenId: activeScreen ? activeScreen.id : 'none',
                allScreens: allScreens
            };
        });
        console.log('   After click state:', JSON.stringify(afterClickState, null, 2));

        // If we're on character creation screen, test Face the Gods
        if (afterClickState.activeScreenId === 'characterCreation') {
            console.log('7. Testing Face the Gods...');

            await page.fill('#playerNameInput', 'TestPlayer123');

            // Check the startInterrogation function
            const funcCheck = await page.evaluate(() => {
                return {
                    hasStartInterrogation: typeof gameManager.startInterrogation === 'function',
                    hasAPIManager: typeof APIManager !== 'undefined',
                    hasAPICall: typeof APIManager !== 'undefined' && typeof APIManager.call === 'function'
                };
            });
            console.log('   Function check:', funcCheck);

            // Try clicking Face the Gods
            await page.click('button:has-text("Face the Gods")');

            // Wait for response
            await page.waitForTimeout(3000);

            const finalState = await page.evaluate(() => {
                const activeScreen = document.querySelector('.screen.active');
                return {
                    activeScreenId: activeScreen ? activeScreen.id : 'none',
                    hasQuestion: document.getElementById('questionText') ? document.getElementById('questionText').textContent : 'no question'
                };
            });
            console.log('   Final state:', finalState);
        }

    } catch (error) {
        console.error('Test failed:', error);
    } finally {
        console.log('\nPress Enter to close browser...');
        await page.waitForTimeout(5000);
        await browser.close();
    }
}

detailedTest();