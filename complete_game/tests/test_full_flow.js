// Comprehensive Playwright test to find all errors
const { chromium } = require('playwright');

(async () => {
    console.log('🎮 THE ARCANE CODEX - COMPREHENSIVE ERROR DETECTION\n');
    console.log('='.repeat(70));

    const browser = await chromium.launch({
        headless: false,
        slowMo: 800
    });

    const page = await browser.newPage();

    // Capture console errors
    const errors = [];
    page.on('console', msg => {
        if (msg.type() === 'error') {
            errors.push(`CONSOLE ERROR: ${msg.text()}`);
        }
    });

    // Capture page errors
    page.on('pageerror', error => {
        errors.push(`PAGE ERROR: ${error.message}`);
    });

    // Capture failed requests
    page.on('requestfailed', request => {
        errors.push(`REQUEST FAILED: ${request.url()} - ${request.failure().errorText}`);
    });

    try {
        // TEST 1: Landing Page
        console.log('\n📄 TEST 1: Landing Page');
        console.log('-'.repeat(70));
        await page.goto('http://localhost:5000', { waitUntil: 'networkidle', timeout: 10000 });
        await page.waitForTimeout(2000);

        const title = await page.title();
        console.log('✅ Page loaded:', title);

        await page.screenshot({ path: 'test_01_landing.png', fullPage: true });
        console.log('📸 Screenshot: test_01_landing.png');

        // Check for play button
        const playButton = await page.locator('button:has-text("PLAY")');
        const playButtonVisible = await playButton.isVisible();
        console.log(`Play button visible: ${playButtonVisible ? '✅' : '❌'}`);

        // TEST 2: Navigate to Game Page
        console.log('\n🎮 TEST 2: Navigate to Game Page');
        console.log('-'.repeat(70));

        try {
            await page.evaluate(() => {
                window.playGame();
            });
            await page.waitForTimeout(2000);
        } catch (e) {
            console.log('⚠️  Direct function call failed, trying click:', e.message);
            await page.goto('http://localhost:5000/game', { waitUntil: 'networkidle' });
        }

        const currentUrl = page.url();
        console.log('Current URL:', currentUrl);

        await page.screenshot({ path: 'test_02_game_page.png', fullPage: true });
        console.log('📸 Screenshot: test_02_game_page.png');

        // Check lobby elements
        console.log('\n🔍 Checking UI Elements:');
        const lobbyScreen = await page.locator('#lobby-screen');
        const lobbyVisible = await lobbyScreen.isVisible().catch(() => false);
        console.log(`  Lobby screen: ${lobbyVisible ? '✅' : '❌'}`);

        const createButton = await page.locator('button:has-text("Create Game")').count();
        console.log(`  Create button: ${createButton > 0 ? '✅' : '❌'}`);

        const joinButton = await page.locator('button:has-text("Join Game")').count();
        console.log(`  Join button: ${joinButton > 0 ? '✅' : '❌'}`);

        // Check CSS
        const cssLoaded = await page.$$eval('link[rel="stylesheet"]', links =>
            links.map(l => l.href)
        );
        console.log('\n🎨 CSS Files Loaded:');
        cssLoaded.forEach(css => console.log('  -', css));

        // Check background color
        const bgColor = await page.evaluate(() => {
            return window.getComputedStyle(document.body).backgroundColor;
        });
        console.log('\n🎨 Body background color:', bgColor);

        // Check for specific styles
        const hasFlicker = await page.evaluate(() => {
            const style = window.getComputedStyle(document.body);
            return style.animation.includes('screenFlicker');
        });
        console.log('CRT flicker animation:', hasFlicker ? '✅' : '❌');

        // TEST 3: Try to Create Game
        if (createButton > 0) {
            console.log('\n🎲 TEST 3: Create Game');
            console.log('-'.repeat(70));

            await page.fill('#creator-name', 'TestPlayer1');
            console.log('✅ Filled name: TestPlayer1');

            await page.screenshot({ path: 'test_03_filled_form.png' });
            console.log('📸 Screenshot: test_03_filled_form.png');

            await page.click('button:has-text("Create Game")');
            console.log('✅ Clicked Create Game');

            await page.waitForTimeout(3000);

            await page.screenshot({ path: 'test_04_after_create.png', fullPage: true });
            console.log('📸 Screenshot: test_04_after_create.png');

            // Check for game code
            const gameCode = await page.locator('#game-code').textContent().catch(() => null);
            if (gameCode && gameCode !== '------') {
                console.log('✅ Game created with code:', gameCode);
            } else {
                console.log('❌ No game code found');
            }
        }

        // Print all errors
        console.log('\n' + '='.repeat(70));
        console.log('📊 ERROR SUMMARY');
        console.log('='.repeat(70));

        if (errors.length === 0) {
            console.log('✅ NO ERRORS DETECTED!');
        } else {
            console.log(`❌ Found ${errors.length} errors:\n`);
            errors.forEach((err, i) => {
                console.log(`${i + 1}. ${err}`);
            });
        }

        console.log('\n📸 Screenshots saved:');
        console.log('  - test_01_landing.png');
        console.log('  - test_02_game_page.png');
        console.log('  - test_03_filled_form.png');
        console.log('  - test_04_after_create.png');

        console.log('\n⏸️  Keeping browser open for 20 seconds...');
        await page.waitForTimeout(20000);

    } catch (error) {
        console.error('\n❌ TEST SUITE ERROR:', error.message);
        await page.screenshot({ path: 'test_error.png', fullPage: true });
        console.log('📸 Error screenshot: test_error.png');
    } finally {
        await browser.close();
        console.log('\n✅ Test complete!');
    }
})();
