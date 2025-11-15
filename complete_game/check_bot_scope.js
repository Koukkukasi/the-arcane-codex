/**
 * Check bot scope and capture result
 */

const { chromium } = require('playwright');

async function checkBotScope() {
    console.log('🚀 Checking bot scope...\n');

    const browser = await chromium.launch({
        headless: false,
        slowMo: 500
    });

    const context = await browser.newContext();
    const page = await context.newPage();

    try {
        await page.goto('https://discord.com/developers/applications');
        await page.waitForURL('**/developers/applications', { timeout: 60000 });

        console.log('✅ Logged in!\n');

        // Click on The Arcane Codex
        await page.click('text=The Arcane Codex');
        await page.waitForTimeout(2000);

        // Go to OAuth2
        await page.click('a[href*="/oauth2"]');
        await page.waitForTimeout(1000);

        // Go to URL Generator
        try {
            await page.click('a[href*="/url-generator"]');
        } catch (e) {}
        await page.waitForTimeout(2000);

        console.log('📋 Checking "bot" scope...\n');

        // Find and check the bot checkbox
        const botCheckbox = await page.locator('label:has-text("bot") input[type="checkbox"]').first();
        await botCheckbox.check();

        await page.waitForTimeout(2000);

        console.log('✅ Bot scope checked!\n');
        console.log('📸 Taking screenshot...\n');

        await page.screenshot({
            path: 'bot_checked.png',
            fullPage: true
        });

        console.log('✅ Screenshot saved to: bot_checked.png\n');

        // Try to find the generated URL
        const urlInput = await page.locator('input[readonly], textarea[readonly]').all();

        console.log(`Found ${urlInput.length} readonly fields\n`);

        for (let i = 0; i < urlInput.length; i++) {
            const value = await urlInput[i].inputValue();
            if (value && value.includes('discord.com')) {
                console.log('🔗 FOUND URL:');
                console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                console.log(value);
                console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
            }
        }

        console.log('⏸️  Browser staying open for 30 seconds...\n');
        await page.waitForTimeout(30000);

    } catch (error) {
        console.error('❌ Error:', error.message);
        await page.screenshot({ path: 'error_screenshot.png', fullPage: true });
    } finally {
        await browser.close();
    }
}

checkBotScope();
