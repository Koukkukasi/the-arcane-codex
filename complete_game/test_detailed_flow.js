const { chromium } = require('playwright');

async function testDetailedFlow() {
    console.log('=== DETAILED FLOW TEST ===\n');

    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();

    // Monitor API responses
    const apiResponses = {};
    page.on('response', async resp => {
        if (resp.url().includes('/api/')) {
            const endpoint = resp.url().split('/').pop();
            try {
                apiResponses[endpoint] = await resp.json();
            } catch {}
        }
    });

    try {
        await page.goto('http://localhost:5000/static/game_flow_beautiful_integrated.html');
        await page.waitForSelector('#mainMenu');
        await page.waitForTimeout(2000);

        console.log('1. Testing startInterrogation step by step...\n');

        const flowResult = await page.evaluate(async () => {
            const log = [];

            // Setup
            gameManager.showCharacterCreation();
            document.getElementById('playerNameInput').value = 'DetailedTest';
            log.push('Setup complete');

            // Get player name
            const playerName = document.getElementById('playerNameInput').value.trim();
            log.push(`Player name: ${playerName}`);

            if (!playerName) {
                log.push('ERROR: No player name');
                return { log };
            }

            gameState.playerName = playerName;
            log.push('Player name set in gameState');

            // Set username
            log.push('Calling set_username...');
            const usernameResult = await APIManager.call('/api/set_username', 'POST', { username: playerName });
            log.push(`set_username result: ${JSON.stringify(usernameResult)}`);

            if (!usernameResult || usernameResult.status !== 'success') {
                log.push('ERROR: Failed to set username');
                return { log };
            }

            // Create game
            if (!gameState.gameCode) {
                log.push('Creating game...');
                const createResult = await APIManager.call('/api/create_game', 'POST', {});
                log.push(`create_game result: ${JSON.stringify(createResult)}`);

                if (createResult && createResult.status === 'success') {
                    gameState.gameCode = createResult.game_code;
                    log.push(`Game code saved: ${gameState.gameCode}`);
                } else {
                    log.push('ERROR: Failed to create game');
                    return { log };
                }
            }

            // Start interrogation
            log.push('Calling start_interrogation...');
            const result = await APIManager.call('/api/start_interrogation', 'POST', {});
            log.push(`start_interrogation result: ${JSON.stringify(result)}`);

            // Check condition
            const conditionCheck = {
                hasResult: result !== null && result !== undefined,
                hasStatus: result?.status !== undefined,
                statusIsSuccess: result?.status === 'success',
                hasQuestion: result?.question !== null && result?.question !== undefined,
                fullCondition: result && result.status === 'success' && result.question
            };
            log.push(`Condition check: ${JSON.stringify(conditionCheck)}`);

            if (result && result.status === 'success' && result.question) {
                log.push('Condition passed - should show divineInterrogation');

                // Try to call the methods directly
                try {
                    log.push('Calling showScreen("divineInterrogation")...');
                    gameManager.showScreen('divineInterrogation');
                    log.push('showScreen completed');

                    log.push('Setting theme...');
                    ThemeManager.setTheme('divine');
                    log.push('Theme set');

                    log.push('Calling displayQuestion...');
                    gameManager.displayQuestion(result.question);
                    log.push('displayQuestion completed');
                } catch (error) {
                    log.push(`ERROR in screen transition: ${error.message}`);
                }
            } else {
                log.push('Condition failed - would show error toast');
            }

            // Check final state
            const activeScreen = document.querySelector('.screen.active');
            log.push(`Final active screen: ${activeScreen?.id}`);

            return { log, conditionCheck, finalScreen: activeScreen?.id };
        });

        console.log('Flow execution log:');
        flowResult.log.forEach((msg, i) => {
            console.log(`   ${i + 1}. ${msg}`);
        });

        console.log('\n2. API responses captured:');
        Object.keys(apiResponses).forEach(key => {
            console.log(`   ${key}: ${apiResponses[key]?.status || 'unknown'}`);
        });

    } catch (error) {
        console.error('Test error:', error);
    } finally {
        await browser.close();
    }
}

testDetailedFlow();