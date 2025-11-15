/**
 * Playwright script to create Discord bot
 * Will open browser and automate bot creation process
 */

const { chromium } = require('playwright');

async function createDiscordBot() {
    console.log('🚀 Starting Discord Bot Creation...\n');

    // Launch browser in headed mode so user can see and log in
    const browser = await chromium.launch({
        headless: false,
        slowMo: 500  // Slow down actions so user can see what's happening
    });

    const context = await browser.newContext();
    const page = await context.newPage();

    try {
        // Step 1: Navigate to Discord Developer Portal
        console.log('📍 Navigating to Discord Developer Portal...');
        await page.goto('https://discord.com/developers/applications');

        // Wait for user to log in if needed
        console.log('⏳ Waiting for login... (Please log in if prompted)');
        console.log('⏰ You have 5 minutes to log in...\n');
        await page.waitForURL('**/developers/applications', { timeout: 300000 });
        console.log('✅ Logged in!\n');

        // Step 2: Create New Application
        console.log('📝 Creating new application...');

        // Click "New Application" button
        await page.click('button:has-text("New Application")');

        // Wait for modal
        await page.waitForSelector('input[name="name"]');

        // Enter application name
        await page.fill('input[name="name"]', 'The Arcane Codex');

        // Accept terms
        await page.click('input[type="checkbox"]');

        // Click Create
        await page.click('button:has-text("Create")');

        console.log('✅ Application created!\n');

        // Wait for app page to load
        await page.waitForTimeout(2000);

        // Step 3: Navigate to Bot section
        console.log('🤖 Adding bot...');
        await page.click('a[href*="/bot"]');

        await page.waitForTimeout(1000);

        // Click "Add Bot" button
        try {
            await page.click('button:has-text("Add Bot")');

            // Confirm
            await page.waitForSelector('button:has-text("Yes, do it!")');
            await page.click('button:has-text("Yes, do it!")');

            console.log('✅ Bot added!\n');
        } catch (e) {
            console.log('ℹ️  Bot already exists, continuing...\n');
        }

        await page.waitForTimeout(2000);

        // Step 4: Reset Token
        console.log('🔑 Getting bot token...');

        // Click Reset Token
        await page.click('button:has-text("Reset Token")');

        // Confirm
        await page.waitForSelector('button:has-text("Yes, do it!")');
        await page.click('button:has-text("Yes, do it!")');

        await page.waitForTimeout(2000);

        // Copy token
        const tokenVisible = await page.isVisible('div[class*="tokenValue"]');
        let token = '';

        if (tokenVisible) {
            token = await page.textContent('div[class*="tokenValue"]');
            console.log('✅ Token obtained!\n');
            console.log('🔑 YOUR BOT TOKEN:');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log(token);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('⚠️  SAVE THIS TOKEN! You will need it to run the bot.\n');
        }

        // Step 5: Enable Message Content Intent
        console.log('⚙️  Enabling Message Content Intent...');

        // Scroll to Privileged Gateway Intents
        await page.evaluate(() => {
            const element = document.querySelector('h5:has-text("Privileged Gateway Intents")');
            if (element) element.scrollIntoView();
        });

        await page.waitForTimeout(1000);

        // Find and toggle Message Content Intent
        const toggles = await page.locator('div[role="switch"]').all();

        for (const toggle of toggles) {
            const parent = await toggle.locator('..').locator('..');
            const text = await parent.textContent();

            if (text.includes('Message Content Intent')) {
                const isEnabled = await toggle.getAttribute('aria-checked');

                if (isEnabled !== 'true') {
                    await toggle.click();
                    console.log('✅ Message Content Intent enabled!\n');
                } else {
                    console.log('ℹ️  Message Content Intent already enabled!\n');
                }
                break;
            }
        }

        // Save changes
        try {
            await page.click('button:has-text("Save Changes")');
            await page.waitForTimeout(1000);
            console.log('✅ Changes saved!\n');
        } catch (e) {
            console.log('ℹ️  No changes to save\n');
        }

        // Step 6: Generate OAuth2 URL
        console.log('🔗 Generating invite URL...');

        // Navigate to OAuth2 > URL Generator
        await page.click('a[href*="/oauth2"]');
        await page.waitForTimeout(1000);

        await page.click('a[href*="/url-generator"]');
        await page.waitForTimeout(2000);

        // Select bot scope
        await page.click('input[value="bot"]');
        await page.waitForTimeout(500);

        // Select permissions
        const permissions = [
            'Send Messages',
            'Read Messages/View Channels',
            'Embed Links',
            'Read Message History',
            'Add Reactions'
        ];

        for (const perm of permissions) {
            try {
                await page.click(`label:has-text("${perm}") input[type="checkbox"]`);
            } catch (e) {
                console.log(`⚠️  Could not check: ${perm}`);
            }
        }

        await page.waitForTimeout(1000);

        // Get generated URL
        const urlInput = await page.locator('input[readonly][value*="discord.com/api/oauth2"]');
        const inviteUrl = await urlInput.inputValue();

        console.log('✅ Invite URL generated!\n');
        console.log('🔗 BOT INVITE URL:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(inviteUrl);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        // Save token and URL to file
        const fs = require('fs');
        const output = `THE ARCANE CODEX - Discord Bot Setup
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BOT TOKEN:
${token}

INVITE URL:
${inviteUrl}

⚠️  KEEP THIS FILE SECURE! Never share your bot token.

NEXT STEPS:
1. Open the invite URL above in your browser
2. Select your Discord server
3. Authorize the bot
4. Run the bot with:
   set DISCORD_BOT_TOKEN=${token}
   python discord_bot.py
`;

        fs.writeFileSync('bot_credentials.txt', output);
        console.log('💾 Credentials saved to: bot_credentials.txt\n');

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✅ DISCORD BOT SETUP COMPLETE!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        console.log('📋 Next steps:');
        console.log('1. Copy the invite URL above');
        console.log('2. Open it in your browser');
        console.log('3. Select your Discord server');
        console.log('4. Click "Authorize"');
        console.log('5. Run the bot (instructions in bot_credentials.txt)\n');

        console.log('⏸️  Browser will stay open for 30 seconds...');
        await page.waitForTimeout(30000);

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.log('\n📸 Taking screenshot of error...');
        await page.screenshot({ path: 'error_screenshot.png', fullPage: true });
        console.log('Screenshot saved to: error_screenshot.png');
    } finally {
        await browser.close();
    }
}

// Run the script
createDiscordBot();
