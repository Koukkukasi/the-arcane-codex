const { chromium } = require('playwright');
const path = require('path');

const HTML_FILE = path.join(__dirname, 'static', 'arcane_codex_scenario_ui_enhanced.html');

(async () => {
    console.log('🗺️  Testing Enhanced Map Overlay...\n');

    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    const page = await context.newPage();

    try {
        await page.goto(`file://${HTML_FILE}`);
        await page.waitForTimeout(2000);

        console.log('Opening map with M key...');
        await page.keyboard.press('m');
        await page.waitForTimeout(2000);

        // Take full screenshot
        await page.screenshot({
            path: path.join(__dirname, 'map_enhanced_final.png'),
            fullPage: false
        });
        console.log('✅ Screenshot saved: map_enhanced_final.png');

        // Check map system
        const mapInfo = await page.evaluate(() => {
            if (typeof fantasyMapSystem === 'undefined') {
                return { exists: false };
            }
            return {
                exists: true,
                locationsCount: fantasyMapSystem.locations ? fantasyMapSystem.locations.length : 0,
                discoveredCount: fantasyMapSystem.locations ?
                    fantasyMapSystem.locations.filter(l => l.discovered).length : 0,
                canvas: {
                    width: fantasyMapSystem.canvas ? fantasyMapSystem.canvas.width : 0,
                    height: fantasyMapSystem.canvas ? fantasyMapSystem.canvas.height : 0
                },
                initialized: !!fantasyMapSystem.canvas
            };
        });

        console.log('\n📊 Map System Info:');
        console.log(`- Total Locations: ${mapInfo.locationsCount}`);
        console.log(`- Discovered Locations: ${mapInfo.discoveredCount}`);
        console.log(`- Canvas Size: ${mapInfo.canvas.width}x${mapInfo.canvas.height}`);
        console.log(`- Initialized: ${mapInfo.initialized ? 'YES ✅' : 'NO ❌'}`);

        // Test filters
        console.log('\n🔍 Testing Filters...');
        await page.click('button[data-filter="cities"]');
        await page.waitForTimeout(500);
        console.log('✅ Cities filter clicked');

        await page.click('button[data-filter="quests"]');
        await page.waitForTimeout(500);
        console.log('✅ Quests filter clicked');

        await page.click('button[data-filter="all"]');
        await page.waitForTimeout(500);
        console.log('✅ All locations filter clicked');

        // Take final screenshot
        await page.screenshot({
            path: path.join(__dirname, 'map_enhanced_with_filters.png'),
            fullPage: false
        });
        console.log('✅ Screenshot saved: map_enhanced_with_filters.png');

        console.log('\n✨ Map Enhancement Test Complete!');
        console.log('The map should now show:');
        console.log('- 22 total locations');
        console.log('- 18+ discovered and visible');
        console.log('- Rich terrain (mountains, forests, rivers)');
        console.log('- Connection paths between locations');
        console.log('- Decorative compass and border');
        console.log('- Quest markers with pulse animations');

        console.log('\n⏸️  Browser staying open for 20 seconds...');
        await page.waitForTimeout(20000);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await browser.close();
    }
})();
