const { chromium } = require('playwright');

async function testSessionClear() {
    console.log('\n🔍 Testing Session Clearing on Multiple Game Creation\n');
    console.log('='.repeat(70));

    const browser = await chromium.launch({ headless: false, slowMo: 1000 });
    const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

    // Log API calls
    page.on('request', req => {
        if (req.url().includes('/api/')) {
            console.log(`\n[API REQUEST] ${req.method()} ${req.url()}`);
        }
    });

    page.on('response', async res => {
        if (res.url().includes('/api/')) {
            const status = res.status();
            console.log(`[API RESPONSE] ${status} ${res.url()}`);
            try {
                const data = await res.json();
                console.log(`[DATA]: ${JSON.stringify(data, null, 2)}`);
            } catch (e) {}
        }
    });

    page.on('console', msg => {
        if (msg.text().includes('Starting new game') || msg.text().includes('cleared')) {
            console.log(`[BROWSER]: ${msg.text()}`);
        }
    });

    try {
        console.log('\n📍 GAME 1: First game creation');
        console.log('-'.repeat(70));
        await page.goto('http://localhost:5000', { waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);

        await page.click('button:has-text("Create Game")');
        await page.waitForTimeout(2000);

        // Check if on character creation screen
        const charCreationVisible = await page.$eval('#characterCreation', el =>
            window.getComputedStyle(el).display !== 'none'
        );
        console.log(`Character Creation Screen: ${charCreationVisible ? '✅ Visible' : '❌ Hidden'}`);

        await page.fill('#playerNameInput', 'Player1');
        await page.click('button:has-text("Face the Gods")');
        await page.waitForTimeout(6000);

        // Check if game code is visible
        const code1Element = await page.$('#interrogationGameCodeText');
        const code1 = code1Element ? await code1Element.textContent() : 'NOT FOUND';
        console.log(`\n✅ Game 1 Code: ${code1}`);

        console.log('\n📍 GAME 2: Going back to main menu');
        console.log('-'.repeat(70));
        await page.goto('http://localhost:5000', { waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);

        // Check what screen we're on
        const mainMenuVisible = await page.$eval('#mainMenu', el =>
            window.getComputedStyle(el).display !== 'none'
        );
        console.log(`Main Menu Visible: ${mainMenuVisible ? '✅ YES' : '❌ NO'}`);

        console.log('\n📍 GAME 2: Clicking Create Game again');
        console.log('-'.repeat(70));
        await page.click('button:has-text("Create Game")');
        await page.waitForTimeout(3000);

        // Check which screens are visible
        const screens = {
            mainMenu: await page.$eval('#mainMenu', el => window.getComputedStyle(el).display !== 'none'),
            characterCreation: await page.$eval('#characterCreation', el => window.getComputedStyle(el).display !== 'none'),
            divineInterrogation: await page.$eval('#divineInterrogation', el => window.getComputedStyle(el).display !== 'none')
        };

        console.log('\nScreen Visibility:');
        Object.entries(screens).forEach(([name, visible]) => {
            console.log(`  ${visible ? '✅' : '❌'} ${name}`);
        });

        // Check if name input is visible
        const nameInputVisible = await page.$eval('#playerNameInput', el =>
            el.offsetParent !== null
        ).catch(() => false);
        console.log(`\nName Input Visible: ${nameInputVisible ? '✅ YES' : '❌ NO'}`);

        if (nameInputVisible) {
            console.log('\n📍 Entering name for Game 2');
            await page.fill('#playerNameInput', 'Player2');

            // Check if button is visible
            const buttonVisible = await page.evaluate(() => {
                const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Face the Gods'));
                if (!btn) return { found: false };
                const style = window.getComputedStyle(btn);
                return {
                    found: true,
                    display: style.display,
                    visibility: style.visibility,
                    opacity: style.opacity,
                    offsetParent: btn.offsetParent !== null
                };
            });

            console.log('Face the Gods Button:', JSON.stringify(buttonVisible, null, 2));

            if (buttonVisible.offsetParent) {
                await page.click('button:has-text("Face the Gods")');
                await page.waitForTimeout(6000);

                const code2Element = await page.$('#interrogationGameCodeText');
                const code2 = code2Element ? await code2Element.textContent() : 'NOT FOUND';
                console.log(`\n✅ Game 2 Code: ${code2}`);

                console.log('\n' + '='.repeat(70));
                console.log('📊 RESULTS');
                console.log('='.repeat(70));
                console.log(`Game 1: ${code1}`);
                console.log(`Game 2: ${code2}`);

                if (code1 !== code2 && code1 !== 'NOT FOUND' && code2 !== 'NOT FOUND') {
                    console.log('\n✅ SUCCESS! Different game codes');
                } else {
                    console.log('\n❌ FAILED! Same codes or codes not found');
                }
            } else {
                console.log('\n❌ Button not visible, cannot proceed');
            }
        } else {
            console.log('\n❌ Name input not visible, cannot proceed');
        }

        console.log('\nKeeping browser open for 30 seconds...');
        await page.waitForTimeout(30000);

    } catch (error) {
        console.error('\n❌ ERROR:', error.message);
        await page.waitForTimeout(20000);
    } finally {
        await browser.close();
    }
}

testSessionClear().catch(console.error);
