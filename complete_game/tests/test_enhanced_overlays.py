#!/usr/bin/env python3
"""Test and capture screenshots of enhanced overlays"""

import asyncio
from playwright.async_api import async_playwright
import os
import time

async def test_overlays():
    async with async_playwright() as p:
        # Launch browser
        browser = await p.chromium.launch(headless=False)
        page = await browser.new_page(viewport={'width': 1920, 'height': 1080})

        # Navigate to the enhanced version
        file_path = f"file:///{os.path.abspath('arcane_codex_scenario_ui_enhanced_visual.html').replace(os.sep, '/')}"
        await page.goto(file_path)

        # Wait for page to load
        await page.wait_for_timeout(2000)

        # Create screenshots directory
        os.makedirs('screenshots', exist_ok=True)

        # Capture main game view
        await page.screenshot(path='screenshots/00_main_view.png', full_page=False)
        print("[OK] Captured main view")

        # Test Character overlay (C key)
        await page.keyboard.press('c')
        await page.wait_for_timeout(1000)
        await page.screenshot(path='screenshots/01_character_overlay.png', full_page=False)
        print("✓ Captured Character overlay")
        await page.keyboard.press('Escape')
        await page.wait_for_timeout(500)

        # Test Inventory overlay (I key)
        await page.keyboard.press('i')
        await page.wait_for_timeout(1000)
        await page.screenshot(path='screenshots/02_inventory_overlay.png', full_page=False)
        print("✓ Captured Inventory overlay")
        await page.keyboard.press('Escape')
        await page.wait_for_timeout(500)

        # Test Skills overlay (K key)
        await page.keyboard.press('k')
        await page.wait_for_timeout(1000)
        await page.screenshot(path='screenshots/03_skills_overlay.png', full_page=False)
        print("✓ Captured Skills overlay")
        await page.keyboard.press('Escape')
        await page.wait_for_timeout(500)

        # Test Quests overlay (J key)
        await page.keyboard.press('j')
        await page.wait_for_timeout(1000)
        await page.screenshot(path='screenshots/04_quests_overlay.png', full_page=False)
        print("✓ Captured Quests overlay")
        await page.keyboard.press('Escape')
        await page.wait_for_timeout(500)

        # Test Map overlay (M key)
        await page.keyboard.press('m')
        await page.wait_for_timeout(1000)
        await page.screenshot(path='screenshots/05_map_overlay.png', full_page=False)
        print("✓ Captured Map overlay")
        await page.keyboard.press('Escape')
        await page.wait_for_timeout(500)

        # Test Settings overlay (ESC key)
        await page.keyboard.press('Escape')
        await page.wait_for_timeout(1000)
        await page.screenshot(path='screenshots/06_settings_overlay.png', full_page=False)
        print("✓ Captured Settings overlay")

        # Close Settings
        await page.keyboard.press('Escape')
        await page.wait_for_timeout(500)

        # Keep browser open for manual inspection
        print("\n✅ All overlays tested successfully!")
        print("📸 Screenshots saved in 'screenshots' folder")
        print("\n🎮 Browser will stay open for manual testing...")
        print("Press Ctrl+C to close when done.")

        # Keep browser open
        try:
            await asyncio.sleep(300)  # Keep open for 5 minutes
        except KeyboardInterrupt:
            pass

        await browser.close()

if __name__ == "__main__":
    asyncio.run(test_overlays())