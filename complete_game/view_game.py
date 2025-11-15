"""
Quick viewer to see the game in browser with all CRT effects
Opens browser window for 30 seconds so you can see everything
"""

import asyncio
from playwright.async_api import async_playwright

async def view_game():
    async with async_playwright() as p:
        # Launch visible browser
        browser = await p.chromium.launch(
            headless=False,
            args=['--start-maximized']
        )

        context = await browser.new_context(
            viewport={'width': 1920, 'height': 1080},
            no_viewport=True
        )

        page = await context.new_page()

        print("Opening game in browser...")
        print("You can now see all the CRT effects!")
        print("Browser will stay open for 60 seconds...")

        # Navigate to main menu
        await page.goto('http://localhost:5000/')

        # Keep browser open for 60 seconds
        print("\nMain menu visible - check out the CRT effects:")
        print("- Green phosphor title glow")
        print("- Chromatic aberration on title")
        print("- Scanline overlay")
        print("- Screen flicker")
        print("- Vignette (curved screen edges)")
        print("- Particle effects (stars and embers)")
        print("- Green PLAY button")
        print("- Amber JOIN GAME button")

        await asyncio.sleep(60)

        await browser.close()
        print("\nBrowser closed.")

if __name__ == '__main__':
    print("Starting Arcane Codex viewer...")
    asyncio.run(view_game())
