const { chromium } = require('playwright');

async function verifyCodeDisplay() {
    console.log('\n🔍 VERIFYING Game Code Display on Divine Interrogation\n');
    console.log('='.repeat(70));

    const browser = await chromium.launch({ headless: false, slowMo: 1500 });
    const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

    try {
        console.log('1️⃣ Starting game flow...');
        await page.goto('http://localhost:5000', { waitUntil: 'networkidle' });
        await page.click('button:has-text("Create Game")');
        await page.fill('#playerNameInput', 'TestPlayer');
        await page.click('button:has-text("Face the Gods")');

        console.log('2️⃣ Waiting for Divine Interrogation to load...');
        await page.waitForTimeout(5000);

        console.log('3️⃣ Checking for game code on interrogation screen...');
        const codeDisplay = await page.$('#interrogationGameCodeDisplay');
        const isVisible = await codeDisplay.isVisible();
        const gameCode = await page.textContent('#interrogationGameCodeText');

        console.log(`\n📊 RESULTS:`);
        console.log(`   Game Code Display Visible: ${isVisible ? '✅ YES' : '❌ NO'}`);
        console.log(`   Game Code Text: "${gameCode.trim()}"`);

        if (isVisible && gameCode.trim()) {
            console.log(`\n🎉 SUCCESS! Game code is visible: ${gameCode.trim()}`);
            console.log(`   ✅ You can now copy and share this code with friends`);
            console.log(`   ✅ Friends can join by clicking "Join Game" and entering the code`);
        } else {
            console.log(`\n❌ FAILED: Game code not properly displayed`);
        }

        console.log('\n='.repeat(70));
        console.log('\nKeeping browser open for 20 seconds for manual verification...');
        await page.waitForTimeout(20000);

    } catch (error) {
        console.error('\n❌ ERROR:', error.message);
    } finally {
        await browser.close();
    }
}

verifyCodeDisplay().catch(console.error);
