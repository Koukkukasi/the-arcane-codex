const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();

    console.log('Checking GitHub status...');
    await page.goto('https://github.com/new');
    await page.waitForTimeout(3000);

    // Check if we're on login page or create repo page
    const url = page.url();
    console.log('Current URL:', url);

    if (url.includes('login')) {
        console.log('\n❌ You need to LOG IN to GitHub first!');
        console.log('\nPlease:');
        console.log('1. Log in to GitHub in the browser that just opened');
        console.log('2. After logging in, go to: https://github.com/new');
        console.log('3. Create the repository');
        console.log('4. Copy the URL and paste it here');
    } else if (url.includes('new')) {
        console.log('\n✅ You are on the create repository page!');
        console.log('\nTrying to fill in the form...');

        try {
            // Try to fill in repository name
            await page.fill('input[name="repository[name]"]', 'the-arcane-codex');
            await page.fill('input[name="repository[description]"]', 'Dark fantasy RPG with Divine Council mechanic');
            console.log('✓ Form filled!');
            console.log('\nNow click "Create repository" button and copy the URL!');
        } catch (error) {
            console.log('Could not auto-fill. Please fill manually.');
        }
    } else {
        console.log('\n⚠️ Unexpected page. Current URL:', url);
    }

    // Take screenshot
    await page.screenshot({ path: 'github_status.png' });
    console.log('\nScreenshot saved: github_status.png');

    // Keep browser open
    console.log('\nBrowser will stay open for 5 minutes...');
    await page.waitForTimeout(300000);
    await browser.close();
})();
