// Quick script to create game and get join code
const { chromium } = require('playwright');

(async () => {
    console.log('\n🎮 Creating game to get join code...\n');
    
    const browser = await chromium.launch({ headless: false, slowMo: 500 });
    const page = await browser.newPage();
    
    try {
        // Go to game page
        await page.goto('http://localhost:5000/game');
        await page.waitForTimeout(2000);
        
        // Fill in creator name
        await page.fill('#creator-name', 'QuickHost');
        console.log('✓ Entered player name');
        
        // Click Embark to create game
        await page.click('button:has-text("Embark")');
        console.log('✓ Creating game...');
        await page.waitForTimeout(4000);
        
        // Get the game code
        const gameCode = await page.locator('#game-code').textContent();
        
        console.log('\n' + '='.repeat(50));
        console.log('   GAME CREATED!');
        console.log('='.repeat(50));
        console.log(`\n   JOIN CODE: ${gameCode}\n`);
        console.log('='.repeat(50));
        console.log('\nTo join:');
        console.log('1. Open http://localhost:5000/game in another browser');
        console.log('2. Enter your name');
        console.log(`3. Enter code: ${gameCode}`);
        console.log('4. Click Join\n');
        console.log('Browser will stay open for 60 seconds...\n');
        
        // Keep browser open
        await page.waitForTimeout(60000);
        
    } catch (error) {
        console.error('Error:', error.message);
        await page.screenshot({ path: 'error_get_code.png' });
    }
    
    await browser.close();
})();
