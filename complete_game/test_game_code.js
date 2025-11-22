const { chromium } = require('playwright');

async function testGameCodeDisplay() {
    console.log('\n🎮 Testing Game Code Display\n');
    console.log('='.repeat(70));

    const browser = await chromium.launch({ headless: false, slowMo: 1000 });
    const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

    page.on('console', msg => {
        if (msg.text().includes('Game created')) {
            console.log(`✅ ${msg.text()}`);
        }
    });

    try {
        console.log('\n1️⃣ Navigate to game...');
        await page.goto('http://localhost:5000', { waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);

        console.log('\n2️⃣ Click "Create Game"...');
        await page.click('button:has-text("Create Game")');
        await page.waitForTimeout(3000);

        console.log('\n3️⃣ Check if game code is displayed...');
        const gameCodeDisplay = await page.$('#gameCodeDisplay');
        const isVisible = await gameCodeDisplay.isVisible();

        console.log(`\nGame Code Display Visible: ${isVisible ? '✅ YES' : '❌ NO'}`);

        if (isVisible) {
            const gameCode = await page.textContent('#gameCodeText');
            console.log(`\n🎯 GAME CODE: ${gameCode}`);
            console.log(`\n✅ SUCCESS! Game code is displayed to the user.`);
            console.log(`\nFriends can now join by clicking "Join Game" and entering: ${gameCode}`);
        } else {
            console.log('\n❌ FAILED: Game code is not visible!');
        }

        console.log('\n='.repeat(70));
        console.log('\nKeeping browser open for 15 seconds...');
        await page.waitForTimeout(15000);

    } catch (error) {
        console.error('\n❌ TEST FAILED:', error.message);
    } finally {
        await browser.close();
    }
}

testGameCodeDisplay().catch(console.error);
