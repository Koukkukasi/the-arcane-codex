const { chromium } = require('playwright');
const path = require('path');

const HTML_FILE = path.join(__dirname, 'static', 'arcane_codex_scenario_ui_enhanced.html');

(async () => {
    console.log('🐛 Checking for errors...\n');

    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    const page = await context.newPage();

    const consoleMessages = [];
    const errors = [];

    // Listen for console messages
    page.on('console', msg => {
        const text = msg.text();
        consoleMessages.push({ type: msg.type(), text });
        if (msg.type() === 'error') {
            console.log(`❌ CONSOLE ERROR: ${text}`);
        } else if (msg.type() === 'warning') {
            console.log(`⚠️  WARNING: ${text}`);
        }
    });

    // Listen for page errors
    page.on('pageerror', error => {
        console.log(`❌ PAGE ERROR: ${error.message}`);
        console.log(`   Stack: ${error.stack}`);
        errors.push(error);
    });

    try {
        console.log('Loading page...\n');
        await page.goto(`file://${HTML_FILE}`);
        await page.waitForTimeout(3000);

        // Check what content is actually in the narrative panel
        const content = await page.evaluate(() => {
            const narrative = document.querySelector('.scene-narrative-panel');
            const leftSidebar = document.querySelector('.left-sidebar');
            const partyPanel = document.querySelector('.party-panel');

            return {
                narrative: {
                    exists: !!narrative,
                    innerHTML: narrative ? narrative.innerHTML.substring(0, 500) : null,
                    childCount: narrative ? narrative.children.length : 0
                },
                leftSidebar: {
                    exists: !!leftSidebar,
                    childCount: leftSidebar ? leftSidebar.children.length : 0
                },
                partyPanel: {
                    exists: !!partyPanel,
                    childCount: partyPanel ? partyPanel.children.length : 0
                }
            };
        });

        console.log('\n📋 Content Check:');
        console.log('Narrative Panel:', content.narrative.exists ? '✅' : '❌');
        if (content.narrative.exists) {
            console.log(`  - Children: ${content.narrative.childCount}`);
            console.log(`  - Content preview: ${content.narrative.innerHTML?.substring(0, 200)}...`);
        }

        console.log('\nLeft Sidebar:', content.leftSidebar.exists ? '✅' : '❌');
        console.log(`  - Children: ${content.leftSidebar.childCount}`);

        console.log('\nParty Panel:', content.partyPanel.exists ? '✅' : '❌');
        console.log(`  - Children: ${content.partyPanel.childCount}`);

        // Take screenshot
        await page.screenshot({
            path: path.join(__dirname, 'error_check.png'),
            fullPage: false
        });
        console.log('\n📸 Screenshot: error_check.png');

        console.log('\n📊 Summary:');
        console.log(`Console messages: ${consoleMessages.length}`);
        console.log(`Errors: ${errors.length}`);

        if (errors.length === 0 && consoleMessages.filter(m => m.type === 'error').length === 0) {
            console.log('✅ No JavaScript errors found!');
        }

        console.log('\n⏸️  Browser staying open for 30 seconds...');
        await page.waitForTimeout(30000);

    } catch (error) {
        console.error('❌ Test error:', error);
    } finally {
        await browser.close();
    }
})();
