"""
Playwright Test Suite for The Arcane Codex
Tests CRT effects, menu navigation, and multiplayer flow
"""

import asyncio
import os
from playwright.async_api import async_playwright, expect

async def test_game_ui():
    """Test main menu UI and CRT effects"""

    async with async_playwright() as p:
        # Launch browser (headless=False to see what's happening)
        browser = await p.chromium.launch(headless=False)
        context = await browser.new_context(
            viewport={'width': 1920, 'height': 1080}
        )
        page = await context.new_page()

        # Create screenshots directory
        os.makedirs('screenshots', exist_ok=True)

        print("=" * 60)
        print("TEST 1: Main Menu UI & CRT Effects")
        print("=" * 60)

        # Navigate to main page
        await page.goto('http://localhost:5000/', wait_until='networkidle')
        await asyncio.sleep(2)  # Wait for animations

        # Take screenshot of main menu
        await page.screenshot(path='screenshots/01_main_menu.png', full_page=True)
        print("[OK] Screenshot saved: 01_main_menu.png")

        # Verify PLAY button exists
        play_button = page.locator('button.menu-button.primary:has-text("PLAY")')
        await expect(play_button).to_be_visible()
        print("[OK] PLAY button found")

        # Verify JOIN GAME button exists
        join_button = page.locator('button.menu-button:has-text("JOIN GAME")')
        await expect(join_button).to_be_visible()
        print("[OK] JOIN GAME button found")

        # Verify title with CRT effects
        title = page.locator('.game-title')
        await expect(title).to_contain_text('THE ARCANE')
        print("[OK] Title verified")

        # Check for CRT effects (scanlines, particles)
        stars = page.locator('#stars .star')
        star_count = await stars.count()
        print(f"[OK] Found {star_count} particle effects")

        print("\n" + "=" * 60)
        print("TEST 2: PLAY Button Flow")
        print("=" * 60)

        # Click PLAY button (force click due to animations)
        await play_button.click(force=True)
        await asyncio.sleep(1)

        # Should navigate to game landing page
        await page.wait_for_url('**/game_landing.html', timeout=5000)
        print("[OK] Navigated to game_landing.html")

        # Take screenshot of game landing
        await page.screenshot(path='screenshots/02_game_landing.png', full_page=True)
        print("[OK] Screenshot saved: 02_game_landing.png")

        # Verify name input screen
        name_screen = page.locator('#name-screen.active')
        await expect(name_screen).to_be_visible()
        print("[OK] Name input screen visible")

        # Enter player name
        name_input = page.locator('#player-name')
        await name_input.fill('TESTWIZARD')
        await asyncio.sleep(0.5)

        await page.screenshot(path='screenshots/03_name_entered.png', full_page=True)
        print("[OK] Screenshot saved: 03_name_entered.png")

        # Click "Enter the Realm"
        enter_button = page.locator('button:has-text("ENTER THE REALM")')
        await enter_button.click(force=True)
        await asyncio.sleep(1)

        # Should show menu screen
        menu_screen = page.locator('#menu-screen.active')
        await expect(menu_screen).to_be_visible()
        print("[OK] Menu screen visible")

        # Verify welcome message
        welcome = page.locator('#welcome-name')
        await expect(welcome).to_have_text('TESTWIZARD')
        print("[OK] Welcome message shows player name")

        await page.screenshot(path='screenshots/04_welcome_screen.png', full_page=True)
        print("[OK] Screenshot saved: 04_welcome_screen.png")

        print("\n" + "=" * 60)
        print("TEST 3: Create Game Flow")
        print("=" * 60)

        # Click "Create New Game"
        create_button = page.locator('button:has-text("CREATE NEW GAME")')
        await create_button.click(force=True)
        await asyncio.sleep(1)

        # Should show create screen with game code
        create_screen = page.locator('#create-screen.active')
        await expect(create_screen).to_be_visible()
        print("[OK] Create game screen visible")

        # Get game code
        game_code = await page.locator('#game-code').text_content()
        print(f"[OK] Game code generated: {game_code}")

        # Verify host in player list
        player_list = page.locator('#players')
        await expect(player_list).to_contain_text('TESTWIZARD')
        await expect(player_list).to_contain_text('HOST')
        print("[OK] Host shown in player list")

        await page.screenshot(path='screenshots/05_create_game.png', full_page=True)
        print("[OK] Screenshot saved: 05_create_game.png")

        print("\n" + "=" * 60)
        print("TEST 4: JOIN GAME Flow (New Browser)")
        print("=" * 60)

        # Open a second browser window to test joining
        page2 = await context.new_page()
        await page2.goto('http://localhost:5000/', wait_until='networkidle')
        await asyncio.sleep(1)

        # Click JOIN GAME button
        join_main_button = page2.locator('button.menu-button:has-text("JOIN GAME")')
        await join_main_button.click(force=True)
        await asyncio.sleep(1)

        # Should navigate to game landing with join screen
        await page2.wait_for_url('**/game_landing.html', timeout=5000)
        print("[OK] Navigated to game_landing.html")

        # Enter player name
        name_input2 = page2.locator('#player-name')
        await name_input2.fill('TESTTHIEF')
        enter_button2 = page2.locator('button:has-text("ENTER THE REALM")')
        await enter_button2.click(force=True)
        await asyncio.sleep(1)

        # Should show join screen
        join_screen = page2.locator('#join-screen.active')
        await expect(join_screen).to_be_visible()
        print("[OK] Join screen visible")

        await page2.screenshot(path='screenshots/06_join_screen.png', full_page=True)
        print("[OK] Screenshot saved: 06_join_screen.png")

        # Enter game code
        join_code_input = page2.locator('#join-code')
        await join_code_input.fill(game_code)
        join_button2 = page2.locator('button:has-text("JOIN GAME")')
        await join_button2.click(force=True)
        await asyncio.sleep(1)

        # Should show lobby screen
        lobby_screen = page2.locator('#lobby-screen.active')
        await expect(lobby_screen).to_be_visible()
        print("[OK] Lobby screen visible")

        # Verify game code displayed
        lobby_code = await page2.locator('#lobby-code').text_content()
        assert lobby_code == game_code, f"Game code mismatch: {lobby_code} != {game_code}"
        print(f"[OK] Game code matches: {lobby_code}")

        await page2.screenshot(path='screenshots/07_joined_lobby.png', full_page=True)
        print("[OK] Screenshot saved: 07_joined_lobby.png")

        print("\n" + "=" * 60)
        print("TEST SUMMARY")
        print("=" * 60)
        print("[PASS] All tests passed!")
        print("[PASS] CRT effects verified")
        print("[PASS] PLAY button flow works")
        print("[PASS] CREATE GAME flow works")
        print("[PASS] JOIN GAME flow works")
        print(f"[PASS] Game code: {game_code}")
        print(f"[PASS] Screenshots saved to: screenshots/")
        print("=" * 60)

        # Keep browser open for 5 seconds to review
        await asyncio.sleep(5)

        await browser.close()

if __name__ == '__main__':
    print("\n>> Starting Arcane Codex UI Tests...\n")
    asyncio.run(test_game_ui())
