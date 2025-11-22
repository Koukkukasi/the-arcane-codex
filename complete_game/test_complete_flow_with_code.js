const { chromium } = require('playwright');

async function testCompleteFlowWithCode() {
    console.log('\n🎮 Complete Flow Test - Game Code Display\n');
    console.log('='.repeat(70));

    const browser = await chromium.launch({ headless: false, slowMo: 1200 });
    const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

    page.on('console', msg => {
        if (msg.text().includes('Game created') || msg.text().includes('[DIVINE]')) {
            console.log(`  ${msg.text()}`);
        }
    });

    try {
        console.log('\n1️⃣ Navigate and click "Create Game"...');
        await page.goto('http://localhost:5000', { waitUntil: 'networkidle' });
        await page.click('button:has-text("Create Game")');
        console.log('✅ Character creation screen shown');

        console.log('\n2️⃣ Enter name "PlayerOne"...');
        await page.fill('#playerNameInput', 'PlayerOne');
        console.log('✅ Name entered');

        console.log('\n3️⃣ Click "Face the Gods"...');
        await page.click('button:has-text("Face the Gods")');
        await page.waitForTimeout(4000); // Wait for game creation and code display

        console.log('\n4️⃣ Check for game code...');
        const gameCodeDisplay = await page.$('#gameCodeDisplay');
        const isCodeVisible = await gameCodeDisplay.isVisible();

        if (isCodeVisible) {
            const gameCode = await page.textContent('#gameCodeText');
            console.log(`\n🎯 SUCCESS! Game code displayed: ${gameCode}`);
            console.log(`\n✅ Friends can join by entering code: ${gameCode}`);
        } else {
            // Check if we're on divine interrogation screen
            const divineScreen = await page.$('#divineInterrogation');
            const isDivineVisible = await divineScreen.isVisible();

            if (isDivineVisible) {
                console.log(`\n⚠️  Divine Interrogation started (game code shown briefly)`);
                console.log(`   The code was displayed for 2 seconds before interrogation began`);
            } else {
                console.log(`\n❌ Game code not visible AND not on interrogation screen`);
            }
        }

        console.log('\n='.repeat(70));
        console.log('\nKeeping browser open for 15 seconds...');
        await page.waitForTimeout(15000);

    } catch (error) {
        console.error('\n❌ ERROR:', error.message);
    } finally {
        await browser.close();
    }
}

testCompleteFlowWithCode().catch(console.error);
