const { chromium } = require('playwright');
const path = require('path');

const HTML_FILE = path.join(__dirname, 'static', 'arcane_codex_scenario_ui_enhanced.html');

(async () => {
    console.log('📸 Taking map visual screenshots...\n');

    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    const page = await context.newPage();

    try {
        await page.goto(`file://${HTML_FILE}`);
        await page.waitForTimeout(2000);

        // Screenshot 1: Before opening map
        await page.screenshot({
            path: path.join(__dirname, 'test_screenshots_phase4', 'visual_01_before_map.png'),
            fullPage: true
        });
        console.log('✅ Screenshot 1: Before opening map');

        // Open map
        await page.keyboard.press('m');
        await page.waitForTimeout(1500);

        // Screenshot 2: Map opened
        await page.screenshot({
            path: path.join(__dirname, 'test_screenshots_phase4', 'visual_02_map_opened.png'),
            fullPage: true
        });
        console.log('✅ Screenshot 2: Map opened');

        // Screenshot 3: Just the map overlay element
        const mapOverlay = await page.locator('#map-overlay');
        await mapOverlay.screenshot({
            path: path.join(__dirname, 'test_screenshots_phase4', 'visual_03_map_overlay_only.png')
        });
        console.log('✅ Screenshot 3: Map overlay element only');

        // Screenshot 4: Just the canvas
        const canvas = await page.locator('#world-map-canvas');
        if (await canvas.count() > 0) {
            await canvas.screenshot({
                path: path.join(__dirname, 'test_screenshots_phase4', 'visual_04_canvas_only.png')
            });
            console.log('✅ Screenshot 4: Canvas element only');
        }

        // Get element info
        const info = await page.evaluate(() => {
            const overlay = document.getElementById('map-overlay');
            const container = document.querySelector('.world-map');
            const canvas = document.getElementById('world-map-canvas');
            const controls = document.querySelector('.map-controls');
            const legend = document.querySelector('.map-legend');

            return {
                overlay: overlay ? {
                    display: window.getComputedStyle(overlay).display,
                    width: window.getComputedStyle(overlay).width,
                    height: window.getComputedStyle(overlay).height,
                    zIndex: window.getComputedStyle(overlay).zIndex
                } : null,
                container: container ? {
                    width: window.getComputedStyle(container).width,
                    height: window.getComputedStyle(container).height,
                    display: window.getComputedStyle(container).display
                } : null,
                canvas: canvas ? {
                    width: canvas.width,
                    height: canvas.height,
                    styleWidth: window.getComputedStyle(canvas).width,
                    styleHeight: window.getComputedStyle(canvas).height
                } : null,
                controlsVisible: controls ? window.getComputedStyle(controls).display !== 'none' : false,
                legendVisible: legend ? window.getComputedStyle(legend).display !== 'none' : false
            };
        });

        console.log('\n📊 Element Info:');
        console.log(JSON.stringify(info, null, 2));

        console.log('\n⏸️  Browser staying open for 60 seconds for manual inspection...');
        await page.waitForTimeout(60000);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await browser.close();
    }
})();
