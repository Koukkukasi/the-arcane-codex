const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();

    console.log('Opening GitHub repository creation page...');
    await page.goto('https://github.com/new');

    // Wait for user to see the page
    console.log('\n===========================================');
    console.log('GitHub "Create new repository" page opened!');
    console.log('===========================================');
    console.log('\nPlease:');
    console.log('1. Repository name: the-arcane-codex');
    console.log('2. Description: Dark fantasy RPG with Divine Council mechanic');
    console.log('3. Click "Create repository"');
    console.log('4. Copy the URL shown (https://github.com/Koukkukasi/the-arcane-codex.git)');
    console.log('5. Paste it in the chat');
    console.log('\nBrowser will stay open for you to complete the process...');

    // Keep browser open
    await page.waitForTimeout(300000); // 5 minutes
    await browser.close();
})();
