const { chromium } = require('playwright');

async function testButtonClick() {
    console.log('=== BUTTON CLICK TEST ===\n');

    const browser = await chromium.launch({ headless: false, slowMo: 200 });
    const page = await browser.newPage();

    // Monitor console
    page.on('console', msg => {
        console.log(`📝 ${msg.type()}: ${msg.text()}`);
    });

    try {
        await page.goto('http://localhost:5000/static/game_flow_beautiful_integrated.html');
        await page.waitForSelector('#mainMenu');
        await page.waitForTimeout(2000);

        console.log('1. Navigate to character creation...');
        await page.evaluate(() => {
            gameManager.showCharacterCreation();
        });

        await page.waitForTimeout(500);

        console.log('2. Fill in player name...');
        await page.fill('#playerNameInput', 'ClickTestPlayer');

        console.log('3. Check Face the Gods button...');
        const buttonCheck = await page.evaluate(() => {
            const btn = document.querySelector('button[onclick*="startInterrogation"]');
            if (btn) {
                return {
                    found: true,
                    text: btn.textContent.trim(),
                    onclick: btn.onclick?.toString() || btn.getAttribute('onclick'),
                    disabled: btn.disabled
                };
            }
            return { found: false };
        });
        console.log('   Button:', buttonCheck);

        console.log('\n4. Add logging to gameManager.startInterrogation...');
        await page.evaluate(() => {
            const original = gameManager.startInterrogation;
            gameManager.startInterrogation = async function() {
                console.log('[TEST] startInterrogation called');
                try {
                    const result = await original.call(this);
                    console.log('[TEST] startInterrogation completed');
                    return result;
                } catch (error) {
                    console.log('[TEST] startInterrogation error:', error);
                    throw error;
                }
            };
        });

        console.log('5. Click Face the Gods button...');
        await page.click('button:has-text("Face the Gods")');

        console.log('6. Wait for result...');
        await page.waitForTimeout(5000);

        console.log('\n7. Check final state...');
        const finalState = await page.evaluate(() => {
            const activeScreen = document.querySelector('.screen.active');
            const questionText = document.getElementById('questionText');
            const optionButtons = document.querySelectorAll('.option-button');

            return {
                activeScreenId: activeScreen?.id,
                hasQuestion: questionText?.textContent ? true : false,
                questionPreview: questionText?.textContent?.substring(0, 100),
                optionCount: optionButtons.length,
                screenList: Array.from(document.querySelectorAll('.screen')).map(s => ({
                    id: s.id,
                    active: s.classList.contains('active')
                }))
            };
        });

        console.log('Final state:', JSON.stringify(finalState, null, 2));

        // If we're on the interrogation screen, test clicking an answer
        if (finalState.activeScreenId === 'divineInterrogation' && finalState.optionCount > 0) {
            console.log('\n8. Testing answer click...');
            await page.click('.option-button:first-child');
            await page.waitForTimeout(3000);

            const afterAnswer = await page.evaluate(() => {
                return {
                    questionText: document.getElementById('questionText')?.textContent?.substring(0, 50),
                    stillOnInterrogation: document.getElementById('divineInterrogation').classList.contains('active')
                };
            });
            console.log('After answer:', afterAnswer);
        }

    } catch (error) {
        console.error('Test error:', error);
    } finally {
        console.log('\n=== TEST COMPLETE ===');
        await browser.close();
    }
}

testButtonClick();