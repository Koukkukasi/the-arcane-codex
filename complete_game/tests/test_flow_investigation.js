// Test to investigate the game flow issue
const { chromium } = require('playwright');

(async () => {
    console.log('\n🔍 Investigating game flow issue...\n');

    const browser = await chromium.launch({ headless: false, slowMo: 800 });
    const page = await browser.newPage();

    try {
        // Clear localStorage to start fresh
        console.log('1️⃣ Testing with CLEAN localStorage (no saved session)');
        console.log('='.repeat(60));
        await page.goto('http://localhost:5000/game');
        await page.evaluate(() => {
            localStorage.clear();
        });
        await page.reload();
        await page.waitForTimeout(2000);

        // Check what screen is shown
        const lobbyVisible = await page.locator('#lobby-screen').isVisible().catch(() => false);
        const interrogationVisible = await page.locator('#interrogation-screen').isVisible().catch(() => false);
        const usernameVisible = await page.locator('#username-screen').isVisible().catch(() => false);

        console.log('\nScreen visibility (clean session):');
        console.log(`  Lobby screen: ${lobbyVisible ? '✅ VISIBLE' : '❌ HIDDEN'}`);
        console.log(`  Interrogation screen: ${interrogationVisible ? '❌ VISIBLE (BAD!)' : '✅ HIDDEN (good)'}`);
        console.log(`  Username screen: ${usernameVisible ? '✅ VISIBLE' : '❌ HIDDEN'}`);

        await page.screenshot({ path: 'clean_session_state.png' });
        console.log('\n📸 Screenshot: clean_session_state.png');

        // Now test what happens after creating a game and refreshing
        console.log('\n\n2️⃣ Testing with SAVED session (after game creation)');
        console.log('='.repeat(60));

        // Create a game
        await page.fill('#username-form input[name="username"]', 'TestPlayer');
        await page.click('#username-form button[type="submit"]');
        await page.waitForTimeout(1000);

        await page.fill('#creator-name', 'SessionTest');
        await page.click('button:has-text("Embark")');
        console.log('✓ Created game...');
        await page.waitForTimeout(5000);

        // Check what localStorage contains
        const savedData = await page.evaluate(() => {
            return {
                playerId: localStorage.getItem('arcane_player_id'),
                gameCode: localStorage.getItem('arcane_game_code')
            };
        });
        console.log('\nSaved localStorage data:');
        console.log(`  Player ID: ${savedData.playerId}`);
        console.log(`  Game Code: ${savedData.gameCode}`);

        // Now refresh the page (simulating user clicking PLAY again)
        console.log('\n🔄 Refreshing page (simulates clicking PLAY again)...');
        await page.reload();
        await page.waitForTimeout(3000);

        const lobbyAfter = await page.locator('#lobby-screen').isVisible().catch(() => false);
        const interrogationAfter = await page.locator('#interrogation-screen').isVisible().catch(() => false);

        console.log('\nScreen visibility after refresh (with saved session):');
        console.log(`  Lobby screen: ${lobbyAfter ? '✅ VISIBLE' : '❌ HIDDEN'}`);
        console.log(`  Interrogation screen: ${interrogationAfter ? '⚠️  VISIBLE' : '✅ HIDDEN'}`);

        if (interrogationAfter && !lobbyAfter) {
            console.log('\n🎯 ISSUE CONFIRMED:');
            console.log('   When localStorage has a saved session, the game auto-resumes');
            console.log('   and jumps straight to interrogation instead of showing lobby!');
        }

        await page.screenshot({ path: 'saved_session_state.png' });
        console.log('\n📸 Screenshot: saved_session_state.png');

        console.log('\n\n📊 SOLUTION:');
        console.log('='.repeat(60));
        console.log('Need to modify game.js to NOT auto-resume on page load.');
        console.log('Should always show lobby first, with option to "Resume Game".');
        console.log('='.repeat(60));

        console.log('\nBrowser will stay open for 15 seconds...');
        await page.waitForTimeout(15000);

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        await page.screenshot({ path: 'error_investigation.png' });
    }

    await browser.close();
    console.log('\n✅ Investigation complete!\n');
})();
