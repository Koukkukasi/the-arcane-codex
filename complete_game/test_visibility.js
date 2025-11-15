const { chromium } = require('playwright');
const path = require('path');

const HTML_FILE = path.join(__dirname, 'static', 'arcane_codex_scenario_ui_enhanced.html');

(async () => {
    console.log('🔍 Checking what\'s blocking the game...\n');

    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    const page = await context.newPage();

    try {
        await page.goto(`file://${HTML_FILE}`);
        await page.waitForTimeout(2000);

        const visibility = await page.evaluate(() => {
            const elements = {
                welcomeScreen: document.querySelector('.welcome-screen'),
                gameBoard: document.querySelector('.game-board'),
                levelUpBurst: document.querySelector('.level-up-burst'),
                achievementToast: document.querySelector('.achievement-toast'),
                leftSidebar: document.querySelector('.left-sidebar'),
                narrativePanel: document.querySelector('.scene-narrative-panel'),
                partyPanel: document.querySelector('.party-panel')
            };

            const getStyles = (el) => {
                if (!el) return null;
                const styles = window.getComputedStyle(el);
                return {
                    display: styles.display,
                    visibility: styles.visibility,
                    opacity: styles.opacity,
                    zIndex: styles.zIndex,
                    position: styles.position
                };
            };

            return {
                welcomeScreen: getStyles(elements.welcomeScreen),
                gameBoard: getStyles(elements.gameBoard),
                levelUpBurst: getStyles(elements.levelUpBurst),
                achievementToast: getStyles(elements.achievementToast),
                leftSidebar: getStyles(elements.leftSidebar),
                narrativePanel: getStyles(elements.narrativePanel),
                partyPanel: getStyles(elements.partyPanel)
            };
        });

        console.log('Element Visibility Status:\n');
        Object.entries(visibility).forEach(([name, styles]) => {
            if (styles) {
                const visible = styles.display !== 'none' && styles.visibility !== 'hidden' && parseFloat(styles.opacity) > 0;
                console.log(`${name}: ${visible ? '✅ VISIBLE' : '❌ HIDDEN'}`);
                console.log(`  - display: ${styles.display}`);
                console.log(`  - visibility: ${styles.visibility}`);
                console.log(`  - opacity: ${styles.opacity}`);
                console.log(`  - z-index: ${styles.zIndex}`);
                console.log('');
            } else {
                console.log(`${name}: ❌ NOT FOUND IN DOM\n`);
            }
        });

        // Take screenshot
        await page.screenshot({
            path: path.join(__dirname, 'visibility_check.png'),
            fullPage: false
        });
        console.log('📸 Screenshot: visibility_check.png');

        console.log('\n⏸️  Browser staying open for 20 seconds...');
        await page.waitForTimeout(20000);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await browser.close();
    }
})();
