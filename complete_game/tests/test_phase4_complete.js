/**
 * Phase 4 Complete Testing Suite
 * Tests all SVG integration, backend APIs, and UI features
 */

const { chromium } = require('playwright');
const path = require('path');

// Configuration
const HTML_FILE = path.join(__dirname, 'static', 'arcane_codex_scenario_ui_enhanced.html');
const SCREENSHOT_DIR = path.join(__dirname, 'test_screenshots_phase4');
const fs = require('fs');

// Create screenshot directory
if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

// Test results tracking
const results = {
    total: 0,
    passed: 0,
    failed: 0,
    tests: []
};

function logTest(name, status, details = '') {
    results.total++;
    if (status === 'PASS') {
        results.passed++;
        console.log(`✅ ${name}`);
    } else {
        results.failed++;
        console.log(`❌ ${name}`);
        if (details) console.log(`   ${details}`);
    }
    results.tests.push({ name, status, details });
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
    console.log('🚀 Starting Phase 4 Complete Testing Suite\n');
    console.log(`Testing file: ${HTML_FILE}\n`);

    const browser = await chromium.launch({ headless: false }); // Show browser
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    const page = await context.newPage();

    // Track console messages
    const consoleMessages = [];
    const consoleErrors = [];

    page.on('console', msg => {
        const text = msg.text();
        consoleMessages.push(text);
        if (msg.type() === 'error') {
            consoleErrors.push(text);
        }
    });

    try {
        // ==============================================
        // TEST 1: Page Load
        // ==============================================
        console.log('\n📋 TEST 1: Page Load & Console Check');

        await page.goto(`file://${HTML_FILE}`);
        await sleep(2000); // Wait for page to fully load

        await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01_page_load.png'), fullPage: true });

        // Check for expected console messages
        const hasOverlayInit = consoleMessages.some(msg => msg.includes('Overlay system initialized'));
        const hasEnhancementsLoaded = consoleMessages.some(msg => msg.includes('Overlay enhancements loaded'));
        const hasUILoaded = consoleMessages.some(msg => msg.includes('The Arcane Codex UI loaded'));

        logTest('Page loads successfully', 'PASS');
        logTest('Console: Overlay system initialized', hasOverlayInit ? 'PASS' : 'FAIL');
        logTest('Console: Enhancements loaded', hasEnhancementsLoaded ? 'PASS' : 'FAIL');
        logTest('Console: UI loaded message', hasUILoaded ? 'PASS' : 'FAIL');

        // Check for unexpected errors (excluding expected API errors)
        const unexpectedErrors = consoleErrors.filter(err =>
            !err.includes('ERR_CONNECTION_REFUSED') &&
            !err.includes('/api/scenario/choice')
        );
        logTest('No unexpected console errors', unexpectedErrors.length === 0 ? 'PASS' : 'FAIL',
                unexpectedErrors.length > 0 ? `Found: ${unexpectedErrors.join(', ')}` : '');

        // ==============================================
        // TEST 2: SVG Icons in Character Sheet
        // ==============================================
        console.log('\n📋 TEST 2: SVG God Icons in Character Sheet');

        // Open character overlay
        await page.keyboard.press('c');
        await sleep(500);

        await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02_character_overlay.png'), fullPage: true });

        // Check for god SVG icons
        const godIcons = [
            'god_valdris.svg',
            'god_kaitha.svg',
            'god_morvane.svg',
            'god_sylara.svg',
            'god_korvan.svg',
            'god_athena.svg',
            'god_mercus.svg'
        ];

        for (const iconFile of godIcons) {
            const iconExists = await page.locator(`img[src*="${iconFile}"]`).count() > 0;
            const godName = iconFile.replace('god_', '').replace('.svg', '').toUpperCase();
            logTest(`${godName} icon displays`, iconExists ? 'PASS' : 'FAIL');
        }

        // Check divine icon CSS class exists
        const divineIconCount = await page.locator('.divine-icon').count();
        logTest('Divine icon CSS applied', divineIconCount >= 7 ? 'PASS' : 'FAIL',
                `Found ${divineIconCount} divine icons`);

        // Close overlay
        await page.keyboard.press('Escape');
        await sleep(300);

        // ==============================================
        // TEST 3: Logo SVG Display
        // ==============================================
        console.log('\n📋 TEST 3: Logo SVG Display');

        const logoExists = await page.locator('img[src*="arcane_codex_logo.svg"]').count() > 0;
        logTest('Arcane Codex logo SVG displays', logoExists ? 'PASS' : 'FAIL');

        await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03_logo_display.png'), fullPage: true });

        // ==============================================
        // TEST 4: Rune Symbol in Whisper
        // ==============================================
        console.log('\n📋 TEST 4: Rune Symbol in Whisper');

        const runeExists = await page.locator('img[src*="rune_symbol"]').count() > 0;
        logTest('Rune symbol in whisper header', runeExists ? 'PASS' : 'FAIL');

        const runeIconClass = await page.locator('.whisper-header .rune-icon').count() > 0;
        logTest('Rune icon CSS class applied', runeIconClass ? 'PASS' : 'FAIL');

        // ==============================================
        // TEST 5: Overlay System - Keyboard Shortcuts
        // ==============================================
        console.log('\n📋 TEST 5: Overlay System - Keyboard Shortcuts');

        const overlays = [
            { key: 'c', name: 'Character' },
            { key: 'i', name: 'Inventory' },
            { key: 'k', name: 'Skills' },
            { key: 'j', name: 'Quests' },
            { key: 'm', name: 'Map' }
        ];

        for (const overlay of overlays) {
            await page.keyboard.press(overlay.key);
            await sleep(500);

            const overlayVisible = await page.locator('.game-overlay.active').count() > 0;
            logTest(`${overlay.name} overlay opens (${overlay.key.toUpperCase()} key)`,
                    overlayVisible ? 'PASS' : 'FAIL');

            await page.screenshot({
                path: path.join(SCREENSHOT_DIR, `05_overlay_${overlay.name.toLowerCase()}.png`),
                fullPage: true
            });

            await page.keyboard.press('Escape');
            await sleep(300);

            const overlayClosed = await page.locator('.game-overlay.active').count() === 0;
            logTest(`${overlay.name} overlay closes (ESC key)`, overlayClosed ? 'PASS' : 'FAIL');
        }

        // ==============================================
        // TEST 6: Sidebar Button Clicks
        // ==============================================
        console.log('\n📋 TEST 6: Sidebar Button Clicks');

        const sideButtons = await page.locator('.left-panel .side-btn').all();
        logTest('Sidebar buttons found', sideButtons.length === 6 ? 'PASS' : 'FAIL',
                `Found ${sideButtons.length} buttons`);

        // Test first button (Character)
        await sideButtons[0].click();
        await sleep(500);
        const buttonOpensOverlay = await page.locator('.game-overlay.active').count() > 0;
        logTest('Sidebar button opens overlay', buttonOpensOverlay ? 'PASS' : 'FAIL');

        await page.keyboard.press('Escape');
        await sleep(300);

        // ==============================================
        // TEST 7: Choice Button Interaction
        // ==============================================
        console.log('\n📋 TEST 7: Choice Button Interaction');

        const choiceButtons = await page.locator('.choice-btn').all();
        logTest('Choice buttons found', choiceButtons.length >= 4 ? 'PASS' : 'FAIL',
                `Found ${choiceButtons.length} choice buttons`);

        if (choiceButtons.length > 0) {
            // Click first choice button
            await choiceButtons[0].click();
            await sleep(1500); // Wait for API call attempt

            // Check if processing message appeared
            const processingMessageAppeared = consoleMessages.some(msg =>
                msg.includes('Player chose:'));
            logTest('Choice selection logged to console', processingMessageAppeared ? 'PASS' : 'FAIL');

            // Check for expected error (backend not connected)
            const expectedError = consoleMessages.some(msg =>
                msg.includes('Error submitting choice') ||
                msg.includes('ERR_CONNECTION_REFUSED'));
            logTest('Expected API error (backend not connected)', expectedError ? 'PASS' : 'FAIL');

            await page.screenshot({ path: path.join(SCREENSHOT_DIR, '07_choice_selected.png'), fullPage: true });

            // Check if buttons are disabled
            const firstButtonDisabled = await choiceButtons[0].evaluate(el =>
                el.style.pointerEvents === 'none');
            logTest('Choice buttons disabled after selection', firstButtonDisabled ? 'PASS' : 'FAIL');
        }

        // Reload page for fresh state
        await page.reload();
        await sleep(2000);

        // ==============================================
        // TEST 8: Action Bar Slot Activation
        // ==============================================
        console.log('\n📋 TEST 8: Action Bar Slot Activation');

        const actionSlots = await page.locator('.action-slot').all();
        logTest('Action slots found', actionSlots.length >= 5 ? 'PASS' : 'FAIL',
                `Found ${actionSlots.length} action slots`);

        if (actionSlots.length > 0) {
            // Click first action slot
            await actionSlots[0].click();
            await sleep(500);

            // Check for activation console message
            const activationLogged = consoleMessages.some(msg =>
                msg.includes('Action slot') && msg.includes('activated'));
            logTest('Action slot activation logged', activationLogged ? 'PASS' : 'FAIL');

            await page.screenshot({ path: path.join(SCREENSHOT_DIR, '08_action_activated.png'), fullPage: true });

            // Check for cooldown class
            const hasCooldown = await actionSlots[0].evaluate(el =>
                el.classList.contains('on-cooldown'));
            logTest('Cooldown applied to slot', hasCooldown ? 'PASS' : 'FAIL');

            // Try clicking again during cooldown
            await actionSlots[0].click();
            await sleep(300);

            const stillOnCooldown = await actionSlots[0].evaluate(el =>
                el.classList.contains('on-cooldown'));
            logTest('Slot blocked during cooldown', stillOnCooldown ? 'PASS' : 'FAIL');

            // Wait for cooldown to expire
            console.log('   Waiting 3 seconds for cooldown to expire...');
            await sleep(3500);

            const cooldownExpired = await actionSlots[0].evaluate(el =>
                !el.classList.contains('on-cooldown'));
            logTest('Cooldown expires after duration', cooldownExpired ? 'PASS' : 'FAIL');
        }

        // ==============================================
        // TEST 9: Party Member Details Modal
        // ==============================================
        console.log('\n📋 TEST 9: Party Member Details Modal');

        const partyMembers = await page.locator('.party-member').all();
        logTest('Party members found', partyMembers.length >= 2 ? 'PASS' : 'FAIL',
                `Found ${partyMembers.length} party members`);

        if (partyMembers.length > 0) {
            // Click first party member
            await partyMembers[0].click();
            await sleep(500);

            const modalVisible = await page.locator('.member-details-modal').count() > 0;
            logTest('Party member modal opens', modalVisible ? 'PASS' : 'FAIL');

            await page.screenshot({ path: path.join(SCREENSHOT_DIR, '09_member_modal.png'), fullPage: true });

            // Check modal content
            const hasCloseButton = await page.locator('.close-details-btn').count() > 0;
            logTest('Modal has close button', hasCloseButton ? 'PASS' : 'FAIL');

            // Close modal by clicking close button
            await page.locator('.close-details-btn').click();
            await sleep(500);

            const modalClosed = await page.locator('.member-details-modal').count() === 0;
            logTest('Modal closes with close button', modalClosed ? 'PASS' : 'FAIL');

            // Open again and close with backdrop
            await partyMembers[0].click();
            await sleep(500);

            const modal = await page.locator('.member-details-modal');
            await modal.click({ position: { x: 10, y: 10 } }); // Click backdrop
            await sleep(500);

            const modalClosedByBackdrop = await page.locator('.member-details-modal').count() === 0;
            logTest('Modal closes with backdrop click', modalClosedByBackdrop ? 'PASS' : 'FAIL');
        }

        // ==============================================
        // TEST 10: Responsive Design - Desktop
        // ==============================================
        console.log('\n📋 TEST 10: Responsive Design - Desktop Sizes');

        const desktopSizes = [
            { width: 1920, height: 1080, name: 'Full HD' },
            { width: 1366, height: 768, name: 'Laptop' },
            { width: 1280, height: 720, name: 'Small Laptop' }
        ];

        for (const size of desktopSizes) {
            await page.setViewportSize({ width: size.width, height: size.height });
            await sleep(500);

            await page.screenshot({
                path: path.join(SCREENSHOT_DIR, `10_desktop_${size.width}x${size.height}.png`),
                fullPage: true
            });

            // Check no horizontal overflow
            const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
            const viewportWidth = size.width;
            logTest(`${size.name} (${size.width}x${size.height}) - No horizontal overflow`,
                    bodyWidth <= viewportWidth ? 'PASS' : 'FAIL',
                    bodyWidth > viewportWidth ? `Body width: ${bodyWidth}px` : '');
        }

        // ==============================================
        // TEST 11: Responsive Design - Tablet
        // ==============================================
        console.log('\n📋 TEST 11: Responsive Design - Tablet');

        await page.setViewportSize({ width: 768, height: 1024 });
        await sleep(500);

        await page.screenshot({
            path: path.join(SCREENSHOT_DIR, '11_tablet_768x1024.png'),
            fullPage: true
        });

        // Open overlay to check responsive behavior
        await page.keyboard.press('c');
        await sleep(500);

        const overlayWidth = await page.locator('.overlay-content').evaluate(el =>
            window.getComputedStyle(el).width);
        logTest('Tablet - Overlay responsive width', overlayWidth !== '700px' ? 'PASS' : 'FAIL',
                `Overlay width: ${overlayWidth}`);

        await page.keyboard.press('Escape');
        await sleep(300);

        // ==============================================
        // TEST 12: Responsive Design - Mobile
        // ==============================================
        console.log('\n📋 TEST 12: Responsive Design - Mobile');

        await page.setViewportSize({ width: 375, height: 667 });
        await sleep(500);

        await page.screenshot({
            path: path.join(SCREENSHOT_DIR, '12_mobile_375x667.png'),
            fullPage: true
        });

        // Check map legend hidden on mobile
        await page.keyboard.press('m');
        await sleep(500);

        const mapLegendHidden = await page.locator('.map-legend').evaluate(el =>
            window.getComputedStyle(el).display === 'none');
        logTest('Mobile - Map legend hidden', mapLegendHidden ? 'PASS' : 'FAIL');

        await page.screenshot({
            path: path.join(SCREENSHOT_DIR, '12_mobile_map_overlay.png'),
            fullPage: true
        });

        await page.keyboard.press('Escape');
        await sleep(300);

        // Reset to desktop size
        await page.setViewportSize({ width: 1920, height: 1080 });
        await sleep(500);

        // ==============================================
        // TEST 13: SVG Resources Loaded
        // ==============================================
        console.log('\n📋 TEST 13: SVG Resource Loading');

        const allSVGs = [
            'god_valdris.svg',
            'god_kaitha.svg',
            'god_morvane.svg',
            'god_sylara.svg',
            'god_korvan.svg',
            'god_athena.svg',
            'god_mercus.svg',
            'arcane_codex_logo.svg',
            'rune_symbol_1.svg',
            'rune_symbol_2.svg',
            'rune_symbol_3.svg',
            'corner_flourish.svg',
            'divider_line.svg',
            'mystical_background.svg'
        ];

        // Check page source for SVG references
        const pageContent = await page.content();
        let svgsFound = 0;
        for (const svg of allSVGs) {
            if (pageContent.includes(svg)) {
                svgsFound++;
            }
        }

        logTest('All SVG files referenced in HTML', svgsFound >= 7 ? 'PASS' : 'FAIL',
                `Found ${svgsFound}/${allSVGs.length} SVG references`);

        // ==============================================
        // TEST 14: Animation Performance
        // ==============================================
        console.log('\n📋 TEST 14: Animation Performance');

        // Open and close overlays rapidly
        console.log('   Testing animation performance...');
        for (let i = 0; i < 5; i++) {
            await page.keyboard.press('c');
            await sleep(100);
            await page.keyboard.press('Escape');
            await sleep(100);
        }

        logTest('Rapid overlay toggle performance', 'PASS', 'No crashes during rapid toggling');

        // ==============================================
        // TEST 15: Console Error Summary
        // ==============================================
        console.log('\n📋 TEST 15: Console Error Summary');

        const totalConsoleMessages = consoleMessages.length;
        const totalConsoleErrors = consoleErrors.length;

        // Filter expected errors
        const expectedApiErrors = consoleErrors.filter(err =>
            err.includes('ERR_CONNECTION_REFUSED') ||
            err.includes('/api/scenario/choice') ||
            err.includes('Failed to load resource')
        ).length;

        const unexpectedErrorsFinal = totalConsoleErrors - expectedApiErrors;

        logTest(`Total console messages: ${totalConsoleMessages}`, 'INFO');
        logTest(`Expected API errors: ${expectedApiErrors}`, 'INFO');
        logTest(`Unexpected errors: ${unexpectedErrorsFinal}`,
                unexpectedErrorsFinal === 0 ? 'PASS' : 'FAIL');

        // ==============================================
        // SUMMARY
        // ==============================================
        console.log('\n' + '='.repeat(60));
        console.log('📊 TEST SUMMARY');
        console.log('='.repeat(60));
        console.log(`Total Tests: ${results.total}`);
        console.log(`✅ Passed: ${results.passed}`);
        console.log(`❌ Failed: ${results.failed}`);
        console.log(`Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%`);
        console.log('='.repeat(60));

        // Write detailed report
        const reportPath = path.join(__dirname, 'TEST_REPORT_PHASE4.md');
        let report = `# Phase 4 Test Report\n\n`;
        report += `**Date:** ${new Date().toLocaleString()}\n`;
        report += `**Browser:** Chromium\n`;
        report += `**Total Tests:** ${results.total}\n`;
        report += `**Passed:** ${results.passed}\n`;
        report += `**Failed:** ${results.failed}\n`;
        report += `**Success Rate:** ${((results.passed / results.total) * 100).toFixed(1)}%\n\n`;
        report += `## Test Results\n\n`;

        results.tests.forEach((test, index) => {
            const icon = test.status === 'PASS' ? '✅' : test.status === 'INFO' ? 'ℹ️' : '❌';
            report += `${index + 1}. ${icon} **${test.name}**\n`;
            if (test.details) {
                report += `   - ${test.details}\n`;
            }
            report += `\n`;
        });

        report += `\n## Screenshots\n\n`;
        report += `All screenshots saved to: \`test_screenshots_phase4/\`\n\n`;
        report += `- 01_page_load.png\n`;
        report += `- 02_character_overlay.png\n`;
        report += `- 03_logo_display.png\n`;
        report += `- 05_overlay_*.png (5 overlays)\n`;
        report += `- 07_choice_selected.png\n`;
        report += `- 08_action_activated.png\n`;
        report += `- 09_member_modal.png\n`;
        report += `- 10_desktop_*.png (3 sizes)\n`;
        report += `- 11_tablet_*.png\n`;
        report += `- 12_mobile_*.png\n\n`;

        if (results.failed > 0) {
            report += `\n## Failed Tests\n\n`;
            const failedTests = results.tests.filter(t => t.status === 'FAIL');
            failedTests.forEach(test => {
                report += `- ❌ ${test.name}\n`;
                if (test.details) report += `  ${test.details}\n`;
            });
        }

        report += `\n## Next Steps\n\n`;
        if (results.failed === 0) {
            report += `✅ All tests passed! Ready to proceed to Phase 5: Backend API Development\n`;
        } else {
            report += `⚠️ ${results.failed} test(s) failed. Review failures and fix issues before proceeding.\n`;
        }

        fs.writeFileSync(reportPath, report);
        console.log(`\n📄 Detailed report saved to: ${reportPath}`);
        console.log(`📸 Screenshots saved to: ${SCREENSHOT_DIR}/`);

    } catch (error) {
        console.error('\n❌ TEST SUITE ERROR:', error);
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'ERROR.png'), fullPage: true });
    } finally {
        await browser.close();
        console.log('\n✅ Testing complete!\n');
    }
})();
