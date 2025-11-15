const { chromium } = require('playwright');
const path = require('path');

const HTML_FILE = path.join(__dirname, 'static', 'arcane_codex_scenario_ui_enhanced.html');

(async () => {
    console.log('🗺️  Starting Map Overlay Debug Test\n');

    const browser = await chromium.launch({
        headless: false,
        slowMo: 500  // Slow down for visibility
    });

    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });

    const page = await context.newPage();

    // Listen for console errors
    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.log('❌ CONSOLE ERROR:', msg.text());
        }
    });

    // Listen for page errors
    page.on('pageerror', error => {
        console.log('❌ PAGE ERROR:', error.message);
    });

    try {
        // Load page
        console.log('📄 Loading page...');
        await page.goto(`file://${HTML_FILE}`);
        await page.waitForTimeout(2000);

        console.log('\n📋 TEST 1: Opening Map Overlay with M key');
        await page.keyboard.press('m');
        await page.waitForTimeout(1000);

        // Check if overlay is visible
        const mapOverlay = await page.locator('#map-overlay');
        const isVisible = await mapOverlay.evaluate(el => {
            const styles = window.getComputedStyle(el);
            return {
                display: styles.display,
                opacity: styles.opacity,
                hasActiveClass: el.classList.contains('active')
            };
        });

        console.log('Map overlay state:', isVisible);

        if (isVisible.hasActiveClass) {
            console.log('✅ Map overlay has active class');
        } else {
            console.log('❌ Map overlay does NOT have active class');
        }

        // Take screenshot
        await page.screenshot({
            path: path.join(__dirname, 'test_screenshots_phase4', 'map_debug_01_opened.png'),
            fullPage: true
        });

        console.log('\n📋 TEST 2: Checking Canvas Elements');

        // Check world canvas
        const worldCanvas = await page.locator('#world-map-canvas');
        const worldCanvasExists = await worldCanvas.count() > 0;
        console.log('World canvas exists:', worldCanvasExists ? '✅' : '❌');

        if (worldCanvasExists) {
            const worldCanvasInfo = await worldCanvas.evaluate(canvas => ({
                width: canvas.width,
                height: canvas.height,
                clientWidth: canvas.clientWidth,
                clientHeight: canvas.clientHeight,
                hasContext: !!canvas.getContext('2d')
            }));
            console.log('World canvas info:', worldCanvasInfo);
        }

        // Check minimap canvas
        const minimapCanvas = await page.locator('#minimap-canvas');
        const minimapCanvasExists = await minimapCanvas.count() > 0;
        console.log('Minimap canvas exists:', minimapCanvasExists ? '✅' : '❌');

        if (minimapCanvasExists) {
            const minimapCanvasInfo = await minimapCanvas.evaluate(canvas => ({
                width: canvas.width,
                height: canvas.height,
                clientWidth: canvas.clientWidth,
                clientHeight: canvas.clientHeight,
                hasContext: !!canvas.getContext('2d')
            }));
            console.log('Minimap canvas info:', minimapCanvasInfo);
        }

        console.log('\n📋 TEST 3: Checking mapSystem Object');
        const mapSystemInfo = await page.evaluate(() => {
            if (typeof mapSystem === 'undefined') {
                return { exists: false };
            }
            return {
                exists: true,
                hasWorldCanvas: !!mapSystem.worldCanvas,
                hasWorldCtx: !!mapSystem.worldCtx,
                hasMinimapCanvas: !!mapSystem.minimapCanvas,
                hasMinimapCtx: !!mapSystem.minimapCtx,
                locationsCount: mapSystem.locations ? mapSystem.locations.length : 0,
                scale: mapSystem.scale,
                offsetX: mapSystem.offsetX,
                offsetY: mapSystem.offsetY
            };
        });
        console.log('mapSystem info:', mapSystemInfo);

        console.log('\n📋 TEST 4: Checking Map Initialization');
        const initCheck = await page.evaluate(() => {
            // Try to call init manually
            if (typeof mapSystem !== 'undefined' && typeof mapSystem.init === 'function') {
                try {
                    mapSystem.init();
                    return { success: true, error: null };
                } catch (e) {
                    return { success: false, error: e.message };
                }
            }
            return { success: false, error: 'mapSystem or init function not found' };
        });
        console.log('Manual init attempt:', initCheck);

        await page.waitForTimeout(1000);

        // Take another screenshot after manual init
        await page.screenshot({
            path: path.join(__dirname, 'test_screenshots_phase4', 'map_debug_02_after_init.png'),
            fullPage: true
        });

        console.log('\n📋 TEST 5: Checking Canvas Rendering');
        const canvasRendered = await page.evaluate(() => {
            const canvas = document.getElementById('world-map-canvas');
            if (!canvas) return { rendered: false, reason: 'Canvas not found' };

            const ctx = canvas.getContext('2d');
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            // Check if any non-transparent pixels exist
            let hasContent = false;
            for (let i = 3; i < data.length; i += 4) {
                if (data[i] > 0) { // Check alpha channel
                    hasContent = true;
                    break;
                }
            }

            return {
                rendered: hasContent,
                canvasSize: `${canvas.width}x${canvas.height}`,
                reason: hasContent ? 'Has content' : 'Canvas is empty/transparent'
            };
        });
        console.log('Canvas rendering check:', canvasRendered);

        console.log('\n📋 TEST 6: Testing Filter Buttons');
        const filterButtons = await page.locator('#map-overlay .filter-btn[data-filter]');
        const filterCount = await filterButtons.count();
        console.log(`Filter buttons found: ${filterCount}`);

        if (filterCount > 0) {
            console.log('Clicking Cities filter...');
            await page.click('#map-overlay .filter-btn[data-filter="cities"]');
            await page.waitForTimeout(500);

            await page.screenshot({
                path: path.join(__dirname, 'test_screenshots_phase4', 'map_debug_03_cities_filter.png'),
                fullPage: true
            });
        }

        console.log('\n📋 TEST 7: Testing Zoom Controls');
        const zoomInBtn = await page.locator('button:has-text("🔍 +")');
        if (await zoomInBtn.count() > 0) {
            console.log('Clicking zoom in...');
            await zoomInBtn.click();
            await page.waitForTimeout(500);

            const scaleAfterZoom = await page.evaluate(() => {
                return typeof mapSystem !== 'undefined' ? mapSystem.scale : 'N/A';
            });
            console.log('Scale after zoom in:', scaleAfterZoom);
        }

        console.log('\n📋 TEST 8: Checking for JavaScript Errors in Map Code');
        const errorCheck = await page.evaluate(() => {
            const errors = [];

            // Check if mapSystem exists
            if (typeof mapSystem === 'undefined') {
                errors.push('mapSystem is undefined');
            } else {
                // Check required methods
                const requiredMethods = ['init', 'render', 'renderMinimap', 'setupCanvas', 'setupEvents'];
                requiredMethods.forEach(method => {
                    if (typeof mapSystem[method] !== 'function') {
                        errors.push(`mapSystem.${method} is not a function`);
                    }
                });
            }

            return errors;
        });

        if (errorCheck.length > 0) {
            console.log('❌ Errors found:');
            errorCheck.forEach(err => console.log('  -', err));
        } else {
            console.log('✅ No JavaScript errors detected in map system');
        }

        // Final screenshot
        await page.screenshot({
            path: path.join(__dirname, 'test_screenshots_phase4', 'map_debug_final.png'),
            fullPage: true
        });

        console.log('\n✅ Map debug test complete!');
        console.log('Screenshots saved to test_screenshots_phase4/');

        // Keep browser open for manual inspection
        console.log('\n⏸️  Browser will stay open for 30 seconds for manual inspection...');
        await page.waitForTimeout(30000);

    } catch (error) {
        console.error('❌ Test failed:', error);
        await page.screenshot({
            path: path.join(__dirname, 'test_screenshots_phase4', 'map_debug_ERROR.png'),
            fullPage: true
        });
    } finally {
        await browser.close();
    }
})();
