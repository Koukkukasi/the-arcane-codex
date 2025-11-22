const { chromium } = require('playwright');

async function testMultipleGames() {
    console.log('\n🎮 Testing Multiple Game Creations in Same Session\n');
    console.log('='.repeat(70));

    const browser = await chromium.launch({ headless: false, slowMo: 1500 });
    const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

    try {
        console.log('\n📍 GAME 1: Creating first game...');
        console.log('-'.repeat(70));
        await page.goto('http://localhost:5000', { waitUntil: 'networkidle' });
        await page.click('button:has-text("Create Game")');
        await page.fill('#playerNameInput', 'Player1');
        await page.click('button:has-text("Face the Gods")');
        await page.waitForTimeout(5000);

        const code1 = await page.textContent('#interrogationGameCodeText');
        console.log(`✅ Game 1 created with code: ${code1.trim()}`);

        console.log('\n📍 GAME 2: Going back to main menu...');
        console.log('-'.repeat(70));
        await page.goto('http://localhost:5000');
        await page.waitForTimeout(2000);

        console.log('\n📍 GAME 2: Creating second game...');
        await page.click('button:has-text("Create Game")');
        await page.waitForTimeout(2000);
        await page.fill('#playerNameInput', 'Player2');
        await page.click('button:has-text("Face the Gods")');
        await page.waitForTimeout(5000);

        const code2 = await page.textContent('#interrogationGameCodeText');
        console.log(`✅ Game 2 created with code: ${code2.trim()}`);

        console.log('\n' + '='.repeat(70));
        console.log('📊 RESULTS:');
        console.log('='.repeat(70));
        console.log(`Game 1 Code: ${code1.trim()}`);
        console.log(`Game 2 Code: ${code2.trim()}`);

        if (code1.trim() !== code2.trim()) {
            console.log('\n✅ SUCCESS! Different game codes created');
        } else {
            console.log('\n❌ FAILED! Same game code - session not cleared');
        }

        console.log('\nKeeping browser open for 20 seconds...');
        await page.waitForTimeout(20000);

    } catch (error) {
        console.error('\n❌ ERROR:', error.message);
        await page.waitForTimeout(20000);
    } finally {
        await browser.close();
    }
}

testMultipleGames().catch(console.error);
