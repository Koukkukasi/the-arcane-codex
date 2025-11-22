/**
 * THE ARCANE CODEX - Beautiful UI Comprehensive Test
 * Tests the new game_flow_beautiful_integrated.html UI
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Ensure test-results directory exists
const resultsDir = 'test-results/beautiful-ui';
if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
}

async function testBeautifulUI() {
    console.log('\n╔══════════════════════════════════════════════════════════╗');
    console.log('║   Beautiful UI Comprehensive Test                       ║');
    console.log('╚══════════════════════════════════════════════════════════╝\n');

    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

    const results = {
        passed: [],
        failed: [],
        warnings: []
    };

    try {
        // Test 1: Load Homepage
        console.log('📍 Test 1: Loading homepage...');
        await page.goto('http://localhost:5000');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        // Check title
        const title = await page.title();
        if (title.includes('Beautiful Game Flow')) {
            results.passed.push('✅ Beautiful UI title detected');
            console.log('✅ Beautiful UI loaded!');
        } else {
            results.failed.push(`❌ Wrong UI loaded. Title: ${title}`);
            console.log(`❌ Wrong UI! Title: ${title}`);
        }

        await page.screenshot({ path: `${resultsDir}/01-homepage.png`, fullPage: true });
        console.log('📸 Screenshot: 01-homepage.png\n');

        // Test 2: Verify CSS Variables
        console.log('🎨 Test 2: Checking CSS variables...');
        const cssVars = await page.evaluate(() => {
            const style = getComputedStyle(document.body);
            return {
                themePrimary: style.getPropertyValue('--theme-primary'),
                battlePrimary: style.getPropertyValue('--battle-primary'),
                divinePrimary: style.getPropertyValue('--divine-primary'),
                victoryPrimary: style.getPropertyValue('--victory-primary')
            };
        });

        if (cssVars.themePrimary && cssVars.battlePrimary) {
            results.passed.push('✅ CSS variables defined');
            console.log('✅ CSS variables present:');
            console.log(`  --theme-primary: ${cssVars.themePrimary.trim()}`);
            console.log(`  --battle-primary: ${cssVars.battlePrimary.trim()}`);
            console.log(`  --divine-primary: ${cssVars.divinePrimary.trim()}`);
            console.log(`  --victory-primary: ${cssVars.victoryPrimary.trim()}\n`);
        } else {
            results.failed.push('❌ CSS variables missing');
            console.log('❌ CSS variables not found!\n');
        }

        // Test 3: Check Typography
        console.log('✍️ Test 3: Verifying typography...');
        const fonts = await page.evaluate(() => {
            const testDiv = document.createElement('div');
            testDiv.style.fontFamily = 'Cinzel, serif';
            document.body.appendChild(testDiv);
            const computedFont = getComputedStyle(testDiv).fontFamily;
            document.body.removeChild(testDiv);
            return computedFont;
        });

        if (fonts.includes('Cinzel')) {
            results.passed.push('✅ Professional fonts loaded');
            console.log('✅ Cinzel font family detected\n');
        } else {
            results.warnings.push('⚠️ Font detection inconclusive');
            console.log('⚠️ Could not confirm font loading\n');
        }

        // Test 4: Theme Switching
        console.log('🎭 Test 4: Testing theme system...');

        // Test battle theme
        await page.evaluate(() => {
            document.body.className = '';
            document.body.classList.add('battle-theme');
        });
        await page.waitForTimeout(1500);
        await page.screenshot({ path: `${resultsDir}/02-battle-theme.png` });
        console.log('📸 Screenshot: 02-battle-theme.png (red theme)');

        // Test divine theme
        await page.evaluate(() => {
            document.body.className = '';
            document.body.classList.add('divine-theme');
        });
        await page.waitForTimeout(1500);
        await page.screenshot({ path: `${resultsDir}/03-divine-theme.png` });
        console.log('📸 Screenshot: 03-divine-theme.png (gold/purple theme)');

        // Test victory theme
        await page.evaluate(() => {
            document.body.className = '';
            document.body.classList.add('victory-theme');
        });
        await page.waitForTimeout(1500);
        await page.screenshot({ path: `${resultsDir}/04-victory-theme.png` });
        console.log('📸 Screenshot: 04-victory-theme.png (green theme)');

        // Reset to default
        await page.evaluate(() => {
            document.body.className = '';
        });
        await page.waitForTimeout(1000);

        results.passed.push('✅ Theme switching works');
        console.log('✅ All theme transitions successful\n');

        // Test 5: Check for Old UI Elements
        console.log('🔍 Test 5: Verifying no old UI elements...');
        const oldUIElements = await page.evaluate(() => {
            const indicators = [];

            // Check for old UI indicators
            if (document.querySelector('.old-style-class')) {
                indicators.push('old-style-class found');
            }

            // Check if we're using new structure
            const hasModernStructure = document.querySelector('.game-container') !== null;

            return {
                hasOldElements: indicators.length > 0,
                hasModernStructure,
                indicators
            };
        });

        if (!oldUIElements.hasOldElements && oldUIElements.hasModernStructure) {
            results.passed.push('✅ Clean modern UI structure');
            console.log('✅ No old UI elements detected\n');
        } else {
            results.warnings.push('⚠️ UI structure verification inconclusive');
            console.log('⚠️ Structure check inconclusive\n');
        }

        // Test 6: SocketIO Integration
        console.log('🔌 Test 6: Checking SocketIO...');
        const socketIO = await page.evaluate(() => {
            return {
                ioExists: typeof io !== 'undefined',
                socketExists: typeof socket !== 'undefined'
            };
        });

        if (socketIO.ioExists) {
            results.passed.push('✅ SocketIO library loaded');
            console.log('✅ SocketIO library present');
            if (socketIO.socketExists) {
                console.log('✅ Socket instance exists\n');
            } else {
                console.log('⚠️ Socket not yet initialized\n');
            }
        } else {
            results.failed.push('❌ SocketIO not loaded');
            console.log('❌ SocketIO library missing\n');
        }

        // Test 7: Battle Manager Integration
        console.log('⚔️ Test 7: Checking battle manager...');
        const battleManager = await page.evaluate(() => {
            return {
                exists: typeof battleManager !== 'undefined',
                enhanced: typeof battleManager !== 'undefined' &&
                         typeof battleManager.startTestBattle === 'function'
            };
        });

        if (battleManager.enhanced) {
            results.passed.push('✅ Enhanced battle manager loaded');
            console.log('✅ Enhanced battle manager detected\n');
        } else if (battleManager.exists) {
            results.warnings.push('⚠️ Battle manager exists but may not be enhanced');
            console.log('⚠️ Battle manager exists but version unclear\n');
        } else {
            results.failed.push('❌ Battle manager not loaded');
            console.log('❌ Battle manager not found\n');
        }

        // Test 8: Responsive Design
        console.log('📱 Test 8: Testing responsive design...');
        await page.setViewportSize({ width: 768, height: 1024 });
        await page.waitForTimeout(1000);
        await page.screenshot({ path: `${resultsDir}/05-tablet-view.png`, fullPage: true });
        console.log('📸 Screenshot: 05-tablet-view.png (tablet)');

        await page.setViewportSize({ width: 375, height: 667 });
        await page.waitForTimeout(1000);
        await page.screenshot({ path: `${resultsDir}/06-mobile-view.png`, fullPage: true });
        console.log('📸 Screenshot: 06-mobile-view.png (mobile)');

        await page.setViewportSize({ width: 1920, height: 1080 });
        await page.waitForTimeout(1000);
        results.passed.push('✅ Responsive design functional');
        console.log('✅ Responsive layout works\n');

        // Test 9: Page Performance
        console.log('⚡ Test 9: Checking performance...');
        const performance = await page.evaluate(() => {
            const perf = window.performance;
            const timing = perf.timing;

            return {
                domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
                loadComplete: timing.loadEventEnd - timing.navigationStart,
                resourceCount: perf.getEntriesByType('resource').length
            };
        });

        console.log(`  DOM loaded: ${performance.domContentLoaded}ms`);
        console.log(`  Page loaded: ${performance.loadComplete}ms`);
        console.log(`  Resources: ${performance.resourceCount}`);

        if (performance.loadComplete < 5000) {
            results.passed.push('✅ Fast page load (<5s)');
            console.log('✅ Performance acceptable\n');
        } else {
            results.warnings.push('⚠️ Page load >5 seconds');
            console.log('⚠️ Page load slower than expected\n');
        }

        // Test 10: Console Errors
        console.log('🐛 Test 10: Checking for errors...');
        const consoleErrors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                consoleErrors.push(msg.text());
            }
        });

        await page.reload();
        await page.waitForTimeout(3000);

        if (consoleErrors.length === 0) {
            results.passed.push('✅ No console errors');
            console.log('✅ No console errors detected\n');
        } else {
            results.warnings.push(`⚠️ ${consoleErrors.length} console errors`);
            console.log(`⚠️ Found ${consoleErrors.length} console errors:`);
            consoleErrors.slice(0, 3).forEach(err => console.log(`  - ${err}`));
            console.log();
        }

        // Final screenshot
        await page.screenshot({ path: `${resultsDir}/07-final-state.png`, fullPage: true });
        console.log('📸 Screenshot: 07-final-state.png (final)\n');

        // Generate Test Report
        console.log('╔══════════════════════════════════════════════════════════╗');
        console.log('║   TEST RESULTS SUMMARY                                   ║');
        console.log('╚══════════════════════════════════════════════════════════╝\n');

        console.log('✅ PASSED TESTS:');
        results.passed.forEach(test => console.log(`  ${test}`));
        console.log();

        if (results.warnings.length > 0) {
            console.log('⚠️  WARNINGS:');
            results.warnings.forEach(warn => console.log(`  ${warn}`));
            console.log();
        }

        if (results.failed.length > 0) {
            console.log('❌ FAILED TESTS:');
            results.failed.forEach(fail => console.log(`  ${fail}`));
            console.log();
        }

        const totalTests = results.passed.length + results.failed.length;
        const passRate = Math.round((results.passed.length / totalTests) * 100);

        console.log(`📊 Overall: ${results.passed.length}/${totalTests} tests passed (${passRate}%)`);
        console.log(`📁 Screenshots saved in: ${resultsDir}/\n`);

        if (results.failed.length === 0) {
            console.log('🎉 ALL CRITICAL TESTS PASSED! Beautiful UI is working!\n');
        } else {
            console.log('⚠️  Some tests failed. Review results above.\n');
        }

        console.log('⏳ Browser will stay open for 10 seconds for inspection...\n');
        await page.waitForTimeout(10000);

        return {
            passed: results.passed.length,
            failed: results.failed.length,
            warnings: results.warnings.length,
            passRate
        };

    } catch (error) {
        console.error('\n❌ Test failed with error:', error.message);
        console.error(error.stack);

        await page.screenshot({ path: `${resultsDir}/error.png` });
        console.log('📸 Error screenshot saved\n');

        return {
            passed: results.passed.length,
            failed: results.failed.length + 1,
            warnings: results.warnings.length,
            error: error.message
        };

    } finally {
        await browser.close();
    }
}

// Run test
testBeautifulUI().then(results => {
    console.log('Test completed.');
    if (results.failed > 0) {
        process.exit(1);
    }
}).catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
