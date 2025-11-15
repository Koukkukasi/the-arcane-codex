// Diagnostic test - check what happens when creating a game
const { chromium } = require('playwright');

(async () => {
    console.log('\n🔍 DIAGNOSING GAME CREATION ISSUE\n');
    console.log('='.repeat(60));

    const browser = await chromium.launch({ headless: false, slowMo: 800 });
    const page = await browser.newPage();

    // Listen for console messages
    page.on('console', msg => {
        const type = msg.type();
        const text = msg.text();
        if (type === 'error') {
            console.log(`  🔴 BROWSER ERROR: ${text}`);
        } else if (text.includes('game') || text.includes('code') || text.includes('error')) {
            console.log(`  📢 BROWSER LOG: ${text}`);
        }
    });

    // Listen for network errors
    page.on('requestfailed', request => {
        console.log(`  ❌ NETWORK FAIL: ${request.url()} - ${request.failure().errorText}`);
    });

    try {
        console.log('\n1. Loading game page...');
        await page.goto('http://localhost:5000/game');
        await page.waitForTimeout(2000);
        console.log('✓ Page loaded\n');

        console.log('2. Checking if lobby screen is visible...');
        const lobbyVisible = await page.locator('#lobby-screen').isVisible();
        console.log(`   Lobby screen: ${lobbyVisible ? '✅ VISIBLE' : '❌ HIDDEN'}`);

        if (!lobbyVisible) {
            console.log('\n❌ PROBLEM: Lobby screen is not showing!');
            console.log('   This means you cannot create or join games.\n');
        }

        console.log('\n3. Filling in creator name...');
        await page.fill('#creator-name', 'TestCreator');
        console.log('✓ Name entered\n');

        console.log('4. Clicking "Embark" button to create game...');
        await page.click('button:has-text("Embark")');
        console.log('✓ Button clicked\n');

        console.log('5. Waiting 5 seconds for game to create...');
        await page.waitForTimeout(5000);

        console.log('\n6. Checking game code display...');
        const gameCodeElement = page.locator('#game-code');
        const gameCode = await gameCodeElement.textContent();
        console.log(`   Game Code: "${gameCode}"`);

        if (gameCode === '------') {
            console.log('   ❌ PROBLEM: Game code still shows placeholder!');
            console.log('   This means the game was NOT created successfully.\n');
        } else if (gameCode && gameCode.length === 6) {
            console.log(`   ✅ SUCCESS: Game created with code ${gameCode}\n`);
        }

        console.log('\n7. Checking current screen...');
        const screens = [
            { id: '#lobby-screen', name: 'Lobby' },
            { id: '#username-screen', name: 'Username' },
            { id: '#interrogation-screen', name: 'Interrogation' },
            { id: '#scenario-screen', name: 'Scenario' }
        ];

        for (const screen of screens) {
            const visible = await page.locator(screen.id).isVisible();
            console.log(`   ${screen.name}: ${visible ? '✅ VISIBLE' : '⚪ hidden'}`);
        }

        console.log('\n8. Taking screenshot...');
        await page.screenshot({ path: 'diagnostic_game_creation.png' });
        console.log('   📸 Screenshot: diagnostic_game_creation.png\n');

        console.log('\n' + '='.repeat(60));
        console.log('DIAGNOSIS COMPLETE');
        console.log('='.repeat(60));
        console.log('\nBrowser will stay open for 10 seconds...\n');
        await page.waitForTimeout(10000);

    } catch (error) {
        console.error('\n\n❌ TEST ERROR:', error.message);
        await page.screenshot({ path: 'diagnostic_error.png' });
    }

    await browser.close();
})();
