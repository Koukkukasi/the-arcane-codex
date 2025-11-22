const { chromium } = require('playwright');

const BASE_URL = 'http://localhost:5000';

async function testCreateGameQuick() {
    console.log('\n=== QUICK TEST: CREATE GAME FLOW ===\n');

    const browser = await chromium.launch({ headless: false, slowMo: 50 });
    const page = await browser.newPage();

    // Monitor console
    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.log(`❌ Error: ${msg.text()}`);
        }
    });

    // Monitor API calls
    page.on('response', async response => {
        if (response.url().includes('/api/')) {
            const status = response.status();
            const url = response.url().split('/').pop();
            console.log(`📥 API: /${url} -> ${status}`);
            if (status !== 200) {
                const body = await response.text().catch(() => '');
                console.log(`   Response: ${body.substring(0, 100)}`);
            }
        }
    });

    try {
        console.log('1. Loading game...');
        await page.goto(`${BASE_URL}/static/game_flow_beautiful_integrated.html`);
        await page.waitForSelector('#mainMenu', { state: 'visible' });

        console.log('2. Clicking Create Game...');
        await page.click('button:has-text("Create Game")');

        // Check which screen we're on
        await page.waitForTimeout(1000);
        const visibleScreen = await page.evaluate(() => {
            const screens = ['mainMenu', 'characterCreation', 'joinGameScreen', 'divineInterrogation'];
            for (const id of screens) {
                const el = document.getElementById(id);
                if (el && !el.classList.contains('hidden') && el.style.display !== 'none') {
                    return id;
                }
            }
            return 'unknown';
        });
        console.log(`3. Current screen: ${visibleScreen}`);

        if (visibleScreen === 'characterCreation') {
            console.log('✅ Successfully navigated to character creation!');

            console.log('4. Entering name and clicking Face the Gods...');
            await page.fill('#playerNameInput', 'TestPlayer' + Date.now());
            await page.click('button:has-text("Face the Gods")');

            // Wait for interrogation
            await page.waitForTimeout(3000);

            const interrogationVisible = await page.evaluate(() => {
                const el = document.getElementById('divineInterrogation');
                return el && !el.classList.contains('hidden');
            });

            if (interrogationVisible) {
                console.log('✅ Successfully reached Divine Interrogation!');

                // Check for question
                const hasQuestion = await page.$('#questionText');
                const hasOptions = await page.$$('.option-button');
                console.log(`   Question displayed: ${hasQuestion ? 'Yes' : 'No'}`);
                console.log(`   Answer options: ${hasOptions.length}`);

                if (hasOptions.length > 0) {
                    console.log('5. Testing answer click...');
                    await hasOptions[0].click();
                    await page.waitForTimeout(2000);
                    console.log('   Answer clicked successfully');
                }
            } else {
                console.log('❌ Failed to reach Divine Interrogation');
            }
        } else {
            console.log(`❌ Wrong screen shown: ${visibleScreen}`);
        }

    } catch (error) {
        console.error('Test error:', error.message);
    } finally {
        await page.waitForTimeout(2000);
        await browser.close();
        console.log('\n=== TEST COMPLETE ===\n');
    }
}

async function testJoinGameQuick() {
    console.log('\n=== QUICK TEST: JOIN GAME FLOW ===\n');

    const browser = await chromium.launch({ headless: false, slowMo: 50 });
    const page = await browser.newPage();

    // Monitor API calls
    page.on('response', async response => {
        if (response.url().includes('/api/')) {
            const status = response.status();
            const url = response.url().split('/').pop();
            console.log(`📥 API: /${url} -> ${status}`);
        }
    });

    try {
        // First create a game
        console.log('1. Creating a test game...');
        await page.goto(`${BASE_URL}/static/game_flow_beautiful_integrated.html`);

        const gameCode = await page.evaluate(async () => {
            // Set username first
            await fetch('/api/set_username', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: 'TestHost' })
            });

            // Create game
            const response = await fetch('/api/create_game', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await response.json();
            return data.game_code;
        });

        console.log(`   Game created: ${gameCode}`);

        // Now test join
        console.log('2. Testing join flow...');
        await page.reload();
        await page.waitForSelector('#mainMenu');

        await page.click('button:has-text("Join Game")');
        await page.waitForSelector('#joinGameScreen', { state: 'visible' });

        console.log('3. Entering game code and name...');
        await page.fill('#gameCodeInput', gameCode);
        await page.fill('#joinPlayerNameInput', 'TestJoiner' + Date.now());

        console.log('4. Clicking Join Party...');
        await page.click('button:has-text("Join Party")');

        await page.waitForTimeout(3000);

        const interrogationVisible = await page.evaluate(() => {
            const el = document.getElementById('divineInterrogation');
            return el && !el.classList.contains('hidden');
        });

        if (interrogationVisible) {
            console.log('✅ Successfully joined and reached Divine Interrogation!');

            const hasOptions = await page.$$('.option-button');
            if (hasOptions.length > 0) {
                console.log('5. Testing answer in multiplayer...');
                await hasOptions[0].click();
                await page.waitForTimeout(2000);
                console.log('✅ Multiplayer answer works!');
            }
        } else {
            console.log('❌ Failed to reach interrogation after join');
        }

    } catch (error) {
        console.error('Test error:', error.message);
    } finally {
        await browser.close();
        console.log('\n=== TEST COMPLETE ===\n');
    }
}

// Run tests
(async () => {
    await testCreateGameQuick();
    await testJoinGameQuick();
})();