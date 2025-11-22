/**
 * Debug Divine Interrogation Auto-Skip Issue
 */

const { chromium } = require('playwright');

async function debugInterrogation() {
    console.log('\n🐛 Debugging Divine Interrogation Auto-Skip\n');

    const browser = await chromium.launch({ headless: false, slowMo: 100 });
    const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

    // Track all console messages
    page.on('console', msg => {
        console.log(`[BROWSER] ${msg.type()}: ${msg.text()}`);
    });

    // Track all API requests
    page.on('request', request => {
        if (request.url().includes('/api/')) {
            console.log(`[API REQUEST] ${request.method()} ${request.url()}`);
        }
    });

    // Track all API responses
    page.on('response', async response => {
        if (response.url().includes('/api/')) {
            try {
                const json = await response.json();
                console.log(`[API RESPONSE] ${response.url()}`);
                console.log(`  Status: ${json.status || 'unknown'}`);
                if (json.question) {
                    console.log(`  Question: ${json.question.question_text?.substring(0, 50)}...`);
                }
            } catch (e) {
                // Not JSON
            }
        }
    });

    try {
        // Load page
        console.log('📍 Loading page...');
        await page.goto('http://localhost:5000', { timeout: 60000 });
        await page.waitForTimeout(3000);

        // Activate character creation screen
        console.log('\n🎭 Activating character creation...');
        await page.evaluate(() => {
            document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
            document.getElementById('characterCreation').classList.add('active');
        });
        await page.waitForTimeout(500);

        // Enter player name
        console.log('\n✍️ Entering player name...');
        await page.fill('#playerNameInput', 'DebugTester');
        await page.waitForTimeout(500);

        // Click "Face the Gods"
        console.log('\n🎭 Starting divine interrogation...');
        await page.click('button:has-text("Face the Gods")');

        // Wait for interrogation screen to appear
        console.log('\n⏳ Waiting for interrogation screen...');
        await page.waitForSelector('#divineInterrogation', { timeout: 10000 }).catch(() => {
            console.log('❌ #divineInterrogation not found!');
        });
        await page.waitForTimeout(2000);

        // Check if we're on interrogation screen
        const isOnInterrogation = await page.isVisible('#divineInterrogation');
        console.log(`\n📍 On interrogation screen: ${isOnInterrogation}`);

        if (isOnInterrogation) {
            // Monitor question changes
            console.log('\n👀 Monitoring question display for 30 seconds...\n');

            let questionNumber = 0;
            for (let i = 0; i < 30; i++) {
                const currentQ = await page.textContent('#questionNumber').catch(() => 'unknown');
                const questionText = await page.textContent('#questionText').catch(() => '');
                const buttonsVisible = await page.$$eval('.option-button', btns => btns.length).catch(() => 0);

                if (currentQ !== `Question ${questionNumber} of 10`) {
                    console.log(`\n⚡ QUESTION CHANGED!`);
                    console.log(`  From: Question ${questionNumber}`);
                    console.log(`  To: ${currentQ}`);
                    console.log(`  Text: ${questionText.substring(0, 60)}...`);
                    console.log(`  Buttons visible: ${buttonsVisible}`);

                    // Extract question number
                    const match = currentQ.match(/Question (\d+)/);
                    if (match) {
                        questionNumber = parseInt(match[1]);
                    }
                }

                await page.waitForTimeout(1000);
            }

            console.log('\n✅ Monitoring complete');
        }

        console.log('\n⏳ Keeping browser open for inspection...');
        await page.waitForTimeout(60000);

    } catch (error) {
        console.error('\n❌ Error:', error.message);
    } finally {
        await browser.close();
    }
}

debugInterrogation().catch(console.error);
