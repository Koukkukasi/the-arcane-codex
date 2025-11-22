const { chromium } = require('playwright');

async function testScreenTransitions() {
    console.log('=== SCREEN TRANSITION TRACE ===\n');

    const browser = await chromium.launch({ headless: false, slowMo: 100 });
    const page = await browser.newPage();

    try {
        await page.goto('http://localhost:5000/static/game_flow_beautiful_integrated.html');
        await page.waitForSelector('#mainMenu');
        await page.waitForTimeout(2000);

        console.log('1. Instrumenting showScreen to trace all calls...\n');

        await page.evaluate(() => {
            window.screenTransitions = [];

            const originalShowScreen = gameManager.showScreen;
            gameManager.showScreen = function(screenId) {
                const timestamp = Date.now();
                const stack = new Error().stack;

                window.screenTransitions.push({
                    timestamp,
                    screenId,
                    from: this.currentScreen,
                    stack: stack.split('\n').slice(2, 5).join(' -> ')
                });

                console.log(`[TRACE] Screen transition: ${this.currentScreen} -> ${screenId}`);

                originalShowScreen.call(this, screenId);
            };

            // Also trace displayQuestion
            const originalDisplayQuestion = gameManager.displayQuestion;
            gameManager.displayQuestion = function(questionData) {
                console.log(`[TRACE] displayQuestion called with question #${questionData?.question_number}`);
                originalDisplayQuestion.call(this, questionData);
            };
        });

        console.log('2. Navigate to character creation...');
        await page.evaluate(() => {
            gameManager.showCharacterCreation();
        });

        console.log('3. Fill name and click Face the Gods...');
        await page.fill('#playerNameInput', 'TraceTest');

        // Capture what happens when we click
        await page.evaluate(() => {
            const btn = document.querySelector('button[onclick*="startInterrogation"]');
            btn.onclick = async function(e) {
                e.preventDefault();
                console.log('[TRACE] Button clicked, calling startInterrogation...');
                await gameManager.startInterrogation();
                console.log('[TRACE] startInterrogation returned');
            };
        });

        await page.click('button:has-text("Face the Gods")');

        // Wait for all transitions
        await page.waitForTimeout(5000);

        console.log('\n4. All screen transitions:');
        const transitions = await page.evaluate(() => window.screenTransitions);

        transitions.forEach((t, i) => {
            console.log(`   ${i + 1}. [${t.timestamp}] ${t.from} -> ${t.screenId}`);
            console.log(`      Stack: ${t.stack}`);
        });

        console.log('\n5. Final state:');
        const finalState = await page.evaluate(() => {
            const activeScreen = document.querySelector('.screen.active');
            const questionEl = document.getElementById('questionText');
            const divineScreen = document.getElementById('divineInterrogation');

            // Check if question content is in the wrong screen
            const characterScreen = document.getElementById('characterCreation');
            const hasQuestionInCharScreen = characterScreen?.innerHTML.includes('question');

            return {
                activeScreenId: activeScreen?.id,
                questionText: questionEl?.textContent?.substring(0, 50),
                divineScreenClasses: divineScreen?.className,
                divineScreenDisplay: window.getComputedStyle(divineScreen).display,
                characterScreenActive: characterScreen?.classList.contains('active'),
                hasQuestionInCharScreen
            };
        });
        console.log(JSON.stringify(finalState, null, 2));

        // Check if there's any JavaScript that might be switching screens
        console.log('\n6. Checking for other screen switchers...');
        const otherCalls = await page.evaluate(() => {
            const html = document.documentElement.innerHTML;
            const matches = [];

            // Look for showScreen calls
            const regex = /showScreen\(['"](.*?)['"]\)/g;
            let match;
            while ((match = regex.exec(html)) !== null) {
                if (!matches.includes(match[1])) {
                    matches.push(match[1]);
                }
            }

            return matches;
        });
        console.log('   Screens referenced in showScreen calls:', otherCalls);

    } catch (error) {
        console.error('Test error:', error);
    } finally {
        await browser.close();
    }
}

testScreenTransitions();