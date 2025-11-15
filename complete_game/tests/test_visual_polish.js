const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Set viewport to 1920x1080
  await page.setViewportSize({ width: 1920, height: 1080 });
  
  // Load the HTML file
  const filePath = 'file://' + path.resolve('arcane_codex_scenario_ui_enhanced.html');
  await page.goto(filePath);
  
  // Wait for page to load
  await page.waitForTimeout(1000);
  
  // Take full page screenshot
  await page.screenshot({ path: 'ui_visual_polish_full.png', fullPage: false });
  console.log('✓ Full page screenshot saved');
  
  // Screenshot top HUD
  const topHud = await page.locator('.top-hud').boundingBox();
  await page.screenshot({ path: 'ui_top_hud.png', clip: topHud });
  console.log('✓ Top HUD screenshot saved');
  
  // Screenshot scenario panel
  const scenario = await page.locator('.scenario-container').boundingBox();
  await page.screenshot({ path: 'ui_scenario_panel.png', clip: scenario });
  console.log('✓ Scenario panel screenshot saved');
  
  // Screenshot right sidebar
  const rightPanel = await page.locator('.right-panel').boundingBox();
  await page.screenshot({ path: 'ui_right_sidebar.png', clip: rightPanel });
  console.log('✓ Right sidebar screenshot saved');
  
  // Screenshot bottom action bar
  const bottomHud = await page.locator('.bottom-hud').boundingBox();
  await page.screenshot({ path: 'ui_bottom_action_bar.png', clip: bottomHud });
  console.log('✓ Bottom action bar screenshot saved');
  
  // Test hover states on choice buttons
  await page.hover('.choice-btn:first-of-type');
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'ui_choice_hover.png', clip: scenario });
  console.log('✓ Choice button hover screenshot saved');
  
  // Test hover on party member
  const partyMember = page.locator('.party-member').first();
  await partyMember.hover();
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'ui_party_hover.png', clip: rightPanel });
  console.log('✓ Party member hover screenshot saved');
  
  // Measure spacing and colors
  const colors = await page.evaluate(() => {
    const getColor = (selector) => {
      const el = document.querySelector(selector);
      if (!el) return null;
      const style = window.getComputedStyle(el);
      return {
        color: style.color,
        background: style.backgroundColor,
        border: style.borderColor
      };
    };
    
    return {
      gameTitle: getColor('.game-title'),
      choiceBtn: getColor('.choice-btn'),
      narrativeText: getColor('.narrative-text'),
      trustValue: getColor('.trust-value'),
      objectiveCompleted: getColor('.objective-item.completed')
    };
  });
  
  console.log('\n=== COLOR ANALYSIS ===');
  console.log(JSON.stringify(colors, null, 2));
  
  // Measure spacing
  const spacing = await page.evaluate(() => {
    const getSpacing = (selector) => {
      const el = document.querySelector(selector);
      if (!el) return null;
      const style = window.getComputedStyle(el);
      return {
        margin: style.margin,
        padding: style.padding,
        gap: style.gap
      };
    };
    
    return {
      choiceButtons: getSpacing('.choice-section'),
      partyMembers: getSpacing('.party-members'),
      objectivesList: getSpacing('.objectives-list')
    };
  });
  
  console.log('\n=== SPACING ANALYSIS ===');
  console.log(JSON.stringify(spacing, null, 2));
  
  await browser.close();
  console.log('\n✓ All visual analysis complete!');
})();
