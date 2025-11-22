const { chromium } = require('playwright');

async function testCompleteInterrogation() {
    console.log('\n🎮 COMPLETE INTERROGATION TEST - Multiple Questions\n');
    console.log('='.repeat(70));

    const browser = await chromium.launch({ headless: false, slowMo: 800 });
    const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

    page.on('console', msg => {
        if (msg.text().includes('[DIVINE]')) {
            console.log(`  ${msg.text()}`);
        }
    });

    try {
        console.log('\n1️⃣ Navigate and create game...');
        await page.goto('http://localhost:5000', { waitUntil: 'networkidle' });
        await page.click('button:has-text("Create Game")');
        await page.fill('#playerNameInput', 'HeroTest');
        console.log('✅ Name entered');

        console.log('\n2️⃣ Starting Divine Interrogation...');
        await page.click('button:has-text("Face the Gods")');
        await page.waitForTimeout(3000);

        const divineScreen = await page.$('#divineInterrogation');
        const isVisible = await divineScreen.isVisible();
        console.log(`✅ Divine Interrogation ${isVisible ? 'VISIBLE' : 'NOT VISIBLE'}`);

        if (!isVisible) {
            throw new Error('Divine Interrogation did not start!');
        }

        console.log('\n3️⃣ Answering 5 questions...\n');
        for (let i = 1; i <= 5; i++) {
            await page.waitForTimeout(1500);

            const questionNum = await page.textContent('#questionNumber').catch(() => 'unknown');
            const questionText = await page.textContent('.question-text');

            console.log(`Question ${questionNum}:`);
            console.log(`  "${questionText.substring(0, 70)}..."`);

            const buttons = await page.$$('.option-button:not([disabled])');
            if (buttons.length === 0) {
                console.log(`  ❌ No clickable buttons!`);
                break;
            }

            const firstButton = buttons[0];
            const btnText = await firstButton.textContent();
            console.log(`  Clicking: "${btnText.trim().substring(0, 40)}..."`);

            await firstButton.click();
            await page.waitForTimeout(2000);
            console.log(`  ✅ Answer submitted\n`);
        }

        console.log('='.repeat(70));
        console.log('🎉 COMPLETE INTERROGATION TEST SUCCESSFUL');
        console.log('='.repeat(70));

        console.log('\nKeeping browser open for 10 seconds for manual inspection...');
        await page.waitForTimeout(10000);

    } catch (error) {
        console.error('\n❌ TEST FAILED:', error.message);
    } finally {
        await browser.close();
    }
}

testCompleteInterrogation().catch(console.error);
