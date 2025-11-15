/**
 * Take screenshot of Discord Developer Portal - URL Generator
 */

const { chromium } = require('playwright');

async function takeScreenshot() {
    console.log('📸 Opening Discord Developer Portal...\n');

    const browser = await chromium.launch({
        headless: false,
        slowMo: 1000
    });

    const context = await browser.newContext();
    const page = await context.newPage();

    try {
        // Navigate to Discord Developer Portal
        await page.goto('https://discord.com/developers/applications');

        console.log('⏳ Waiting for login (if needed)...\n');
        await page.waitForURL('**/developers/applications', { timeout: 60000 });

        console.log('✅ Logged in!\n');

        // Try to find and click on The Arcane Codex application
        console.log('🔍 Looking for "The Arcane Codex" application...\n');

        await page.waitForTimeout(2000);

        // Click on the application
        const appLink = await page.locator('text=The Arcane Codex').first();
        await appLink.click();

        await page.waitForTimeout(2000);

        // Navigate to OAuth2 > URL Generator
        console.log('📍 Navigating to OAuth2 > URL Generator...\n');

        await page.click('a[href*="/oauth2"]');
        await page.waitForTimeout(1000);

        // Check if we need to click URL Generator submenu
        try {
            await page.click('a[href*="/url-generator"]');
            await page.waitForTimeout(1000);
        } catch (e) {
            console.log('Already on URL Generator page');
        }

        console.log('📸 Taking screenshot...\n');
        await page.screenshot({
            path: 'url_generator_page.png',
            fullPage: true
        });

        console.log('✅ Screenshot saved to: url_generator_page.png\n');
        console.log('⏸️  Browser will stay open for 10 seconds...\n');

        await page.waitForTimeout(10000);

    } catch (error) {
        console.error('❌ Error:', error.message);
        await page.screenshot({ path: 'error_screenshot.png', fullPage: true });
        console.log('Screenshot saved to: error_screenshot.png');
    } finally {
        await browser.close();
    }
}

takeScreenshot();
