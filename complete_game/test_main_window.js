const { chromium } = require('playwright');
const path = require('path');

const HTML_FILE = path.join(__dirname, 'static', 'arcane_codex_scenario_ui_enhanced.html');

(async () => {
    console.log('🎮 Testing Main Game Window Layout...\n');

    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    const page = await context.newPage();

    try {
        await page.goto(`file://${HTML_FILE}`);
        await page.waitForTimeout(2000);

        // Screenshot main window
        await page.screenshot({
            path: path.join(__dirname, 'main_window_default.png'),
            fullPage: false
        });
        console.log('✅ Screenshot: main_window_default.png');

        // Check layout elements
        const layoutInfo = await page.evaluate(() => {
            const elements = {
                leftSidebar: document.querySelector('.left-sidebar'),
                narrativePanel: document.querySelector('.scene-narrative-panel'),
                rightPanel: document.querySelector('.party-panel'),
                actionBar: document.querySelector('.action-bar'),
                choiceButtons: document.querySelectorAll('.choice-btn')
            };

            const info = {};

            if (elements.leftSidebar) {
                const styles = window.getComputedStyle(elements.leftSidebar);
                info.leftSidebar = {
                    display: styles.display,
                    width: styles.width,
                    position: styles.position,
                    visible: styles.display !== 'none'
                };
            }

            if (elements.narrativePanel) {
                const styles = window.getComputedStyle(elements.narrativePanel);
                info.narrativePanel = {
                    display: styles.display,
                    width: styles.width,
                    marginLeft: styles.marginLeft,
                    visible: styles.display !== 'none'
                };
            }

            if (elements.rightPanel) {
                const styles = window.getComputedStyle(elements.rightPanel);
                info.rightPanel = {
                    display: styles.display,
                    width: styles.width,
                    visible: styles.display !== 'none'
                };
            }

            if (elements.actionBar) {
                const styles = window.getComputedStyle(elements.actionBar);
                info.actionBar = {
                    display: styles.display,
                    bottom: styles.bottom,
                    visible: styles.display !== 'none'
                };
            }

            info.choiceButtonsCount = elements.choiceButtons.length;

            return info;
        });

        console.log('\n📊 Layout Info:');
        console.log(JSON.stringify(layoutInfo, null, 2));

        console.log('\n⏸️  Browser staying open for 30 seconds for inspection...');
        await page.waitForTimeout(30000);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await browser.close();
    }
})();
