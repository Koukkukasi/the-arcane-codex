const { chromium } = require('playwright');
const path = require('path');

const HTML_FILE = path.join(__dirname, 'static', 'arcane_codex_scenario_ui_enhanced.html');

(async () => {
    console.log('🎮 Testing All Game UI Fixes...\n');

    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    const page = await context.newPage();

    const results = {
        mainLayout: {},
        worldMap: {},
        questMaps: {}
    };

    try {
        await page.goto(`file://${HTML_FILE}`);
        await page.waitForTimeout(2000);

        // TEST 1: Main Layout (3-column)
        console.log('📋 TEST 1: Main Window Layout');

        const layoutCheck = await page.evaluate(() => {
            const left = document.querySelector('.left-sidebar');
            const center = document.querySelector('.scene-narrative-panel');
            const right = document.querySelector('.party-panel');

            return {
                leftVisible: left ? window.getComputedStyle(left).display !== 'none' : false,
                centerVisible: center ? window.getComputedStyle(center).display !== 'none' : false,
                rightVisible: right ? window.getComputedStyle(right).display !== 'none' : false,
                leftWidth: left ? window.getComputedStyle(left).width : 'N/A',
                centerWidth: center ? window.getComputedStyle(center).width : 'N/A',
                rightWidth: right ? window.getComputedStyle(right).width : 'N/A'
            };
        });

        console.log(`Left sidebar: ${layoutCheck.leftVisible ? '✅' : '❌'} (${layoutCheck.leftWidth})`);
        console.log(`Center panel: ${layoutCheck.centerVisible ? '✅' : '❌'} (${layoutCheck.centerWidth})`);
        console.log(`Right panel: ${layoutCheck.rightVisible ? '✅' : '❌'} (${layoutCheck.rightWidth})`);

        results.mainLayout = layoutCheck;

        await page.screenshot({
            path: path.join(__dirname, 'test_final_main_layout.png'),
            fullPage: false
        });
        console.log('📸 Screenshot: test_final_main_layout.png\n');

        // TEST 2: World Map (simplified)
        console.log('📋 TEST 2: World Map (Simplified, ADHD-friendly)');

        await page.keyboard.press('m');
        await page.waitForTimeout(1500);

        const mapCheck = await page.evaluate(() => {
            if (typeof fantasyMapSystem === 'undefined') {
                return { exists: false };
            }

            const totalLocations = fantasyMapSystem.locations ? fantasyMapSystem.locations.length : 0;

            // Count visible locations at default zoom
            let visibleCount = 0;
            if (fantasyMapSystem.locations) {
                fantasyMapSystem.locations.forEach(loc => {
                    if (loc.discovered && loc.priority === 1) {
                        visibleCount++;
                    }
                });
            }

            return {
                exists: true,
                totalLocations,
                visibleAtDefaultZoom: visibleCount,
                canvasSize: {
                    width: fantasyMapSystem.canvas ? fantasyMapSystem.canvas.width : 0,
                    height: fantasyMapSystem.canvas ? fantasyMapSystem.canvas.height : 0
                }
            };
        });

        console.log(`Map system: ${mapCheck.exists ? '✅' : '❌'}`);
        console.log(`Total locations: ${mapCheck.totalLocations}`);
        console.log(`Visible at default zoom: ${mapCheck.visibleAtDefaultZoom} (should be ~8-10)`);
        console.log(`Canvas: ${mapCheck.canvasSize.width}x${mapCheck.canvasSize.height}`);

        results.worldMap = mapCheck;

        await page.screenshot({
            path: path.join(__dirname, 'test_final_world_map.png'),
            fullPage: false
        });
        console.log('📸 Screenshot: test_final_world_map.png\n');

        // TEST 3: Quest Maps (click on quest marker)
        console.log('📋 TEST 3: Quest Detail Maps');

        const questMapCheck = await page.evaluate(() => {
            return typeof questMaps !== 'undefined' && typeof openQuestMap === 'function';
        });

        if (questMapCheck) {
            console.log('Quest map system: ✅ Loaded');

            // Try to open quest map programmatically
            await page.evaluate(() => {
                if (typeof openQuestMap === 'function') {
                    openQuestMap('warehouse');
                }
            });

            await page.waitForTimeout(1000);

            const questMapVisible = await page.evaluate(() => {
                const modal = document.getElementById('quest-map-modal');
                return modal ? window.getComputedStyle(modal).display !== 'none' : false;
            });

            console.log(`Quest map modal opened: ${questMapVisible ? '✅' : '❌'}`);
            results.questMaps.systemLoaded = true;
            results.questMaps.modalOpened = questMapVisible;

            if (questMapVisible) {
                await page.screenshot({
                    path: path.join(__dirname, 'test_final_quest_map.png'),
                    fullPage: false
                });
                console.log('📸 Screenshot: test_final_quest_map.png');

                // Close quest map
                await page.click('#quest-map-modal .close-btn');
                await page.waitForTimeout(500);
            }
        } else {
            console.log('Quest map system: ❌ Not loaded');
            results.questMaps.systemLoaded = false;
        }

        // Close world map
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);

        console.log('\n' + '='.repeat(60));
        console.log('📊 FINAL RESULTS SUMMARY');
        console.log('='.repeat(60));

        console.log('\n✅ COMPLETED FIXES:');
        if (results.mainLayout.leftVisible && results.mainLayout.centerVisible && results.mainLayout.rightVisible) {
            console.log('  ✓ Main layout: 3-column display restored');
        } else {
            console.log('  ✗ Main layout: Still has issues');
        }

        if (results.worldMap.visibleAtDefaultZoom >= 8 && results.worldMap.visibleAtDefaultZoom <= 12) {
            console.log('  ✓ World map: Simplified (8-10 locations visible)');
        } else {
            console.log(`  ✗ World map: ${results.worldMap.visibleAtDefaultZoom} locations visible`);
        }

        if (results.questMaps.systemLoaded) {
            console.log('  ✓ Quest maps: System implemented');
        } else {
            console.log('  ✗ Quest maps: Not implemented');
        }

        console.log('\n⏸️  Browser staying open for 30 seconds for manual inspection...');
        await page.waitForTimeout(30000);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await browser.close();
    }
})();
