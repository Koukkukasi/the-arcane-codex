"""
Check console errors during game flow
"""
import asyncio
from playwright.async_api import async_playwright

async def check_console_errors():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        context = await browser.new_context(viewport={'width': 1920, 'height': 1080})
        page = await context.new_page()

        # Collect console messages and errors
        console_messages = []
        errors = []

        page.on("console", lambda msg: console_messages.append(f"[{msg.type}] {msg.text}"))
        page.on("pageerror", lambda err: errors.append(f"PAGE ERROR: {err}"))

        print("=" * 70)
        print("CHECKING CONSOLE ERRORS")
        print("=" * 70)

        # Navigate to main page
        print("\n[1] Loading main page...")
        await page.goto('http://localhost:5000/')
        await asyncio.sleep(2)

        # Click PLAY button (force due to CRT animations)
        print("[2] Clicking PLAY button...")
        play_button = page.locator('button.menu-button.primary:has-text("PLAY")')
        await play_button.click(force=True)
        await asyncio.sleep(2)

        # Print all console messages so far
        print("\n[CONSOLE MESSAGES FROM MAIN PAGE]")
        for msg in console_messages:
            print(f"  {msg}")
        console_messages.clear()

        # Print errors
        if errors:
            print("\n[ERRORS FROM MAIN PAGE]")
            for err in errors:
                print(f"  {err}")
            errors.clear()

        # Set username
        print("\n[3] Setting username...")
        username_input = page.locator('input[placeholder="Enter your name"]')
        await username_input.fill("TestPlayer")

        continue_btn = page.locator('button.primary:has-text("CONTINUE")')
        await continue_btn.click(force=True)
        await asyncio.sleep(2)

        # Create game
        print("[4] Creating game...")
        create_btn = page.locator('button.primary:has-text("CREATE GAME")')
        await create_btn.click(force=True)
        await asyncio.sleep(3)

        # Check for game code display
        game_code_elem = page.locator('.code-display, .game-code')
        if await game_code_elem.count() > 0:
            game_code = await game_code_elem.first.text_content()
            print(f"[OK] Game created with code: {game_code}")
        else:
            print("[ERROR] No game code found on page!")

        # Print console messages from game creation
        print("\n[CONSOLE MESSAGES FROM GAME CREATION]")
        for msg in console_messages:
            print(f"  {msg}")
        console_messages.clear()

        if errors:
            print("\n[ERRORS FROM GAME CREATION]")
            for err in errors:
                print(f"  {err}")
            errors.clear()

        # Try to join a game in new tab
        print("\n[5] Opening new tab to join game...")
        page2 = await context.new_page()

        page2_console = []
        page2_errors = []
        page2.on("console", lambda msg: page2_console.append(f"[{msg.type}] {msg.text}"))
        page2.on("pageerror", lambda err: page2_errors.append(f"PAGE ERROR: {err}"))

        await page2.goto('http://localhost:5000/')
        await asyncio.sleep(2)

        # Click PLAY on second page
        play_button2 = page2.locator('button.menu-button.primary:has-text("PLAY")')
        await play_button2.click(force=True)
        await asyncio.sleep(2)

        # Set username on second page
        username_input2 = page2.locator('input[placeholder="Enter your name"]')
        await username_input2.fill("TestPlayer2")
        continue_btn2 = page2.locator('button.primary:has-text("CONTINUE")')
        await continue_btn2.click(force=True)
        await asyncio.sleep(2)

        # Click JOIN GAME
        join_btn = page2.locator('button:has-text("JOIN GAME")')
        await join_btn.click(force=True)
        await asyncio.sleep(2)

        # Enter fake game code
        code_input = page2.locator('input[placeholder*="code"], input[type="text"]')
        if await code_input.count() > 0:
            print("[6] Entering test game code 'ABC123'...")
            await code_input.first.fill("ABC123")

            # Click join
            join_submit = page2.locator('button.primary:has-text("JOIN")')
            await join_submit.click(force=True)
            await asyncio.sleep(2)

        # Print console from join attempt
        print("\n[CONSOLE MESSAGES FROM JOIN ATTEMPT]")
        for msg in page2_console:
            print(f"  {msg}")

        if page2_errors:
            print("\n[ERRORS FROM JOIN ATTEMPT]")
            for err in page2_errors:
                print(f"  {err}")

        print("\n" + "=" * 70)
        print("TEST COMPLETE - Browser will close in 10 seconds")
        print("=" * 70)
        await asyncio.sleep(10)

        await browser.close()

if __name__ == '__main__':
    asyncio.run(check_console_errors())
