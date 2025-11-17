#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Test Create Game Flow with Playwright
"""

import sys
import io
from playwright.sync_api import sync_playwright
import time

# Fix encoding for Windows console
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

def test_create_game():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        context = browser.new_context(viewport={'width': 1920, 'height': 1080})
        page = context.new_page()

        # Collect console messages and errors
        console_messages = []
        console_errors = []
        network_errors = []

        page.on("console", lambda msg: console_messages.append(f"[{msg.type}] {msg.text}"))
        page.on("pageerror", lambda exc: console_errors.append(f"Page Error: {exc}"))
        page.on("requestfailed", lambda request: network_errors.append(f"Failed: {request.url} - {request.failure}"))

        print("=" * 80)
        print("CREATE GAME FLOW TEST")
        print("=" * 80)

        # Navigate to the page
        print("\n1. Loading page...")
        page.goto("http://localhost:5000", wait_until="networkidle", timeout=10000)
        print("   [OK] Page loaded")

        time.sleep(2)

        # Take initial screenshot
        page.screenshot(path="test_step1_initial.png")
        print("   Screenshot: test_step1_initial.png")

        # Click "Create/Join Game (Multiplayer)"
        print("\n2. Clicking 'Create/Join Game (Multiplayer)'...")
        try:
            page.click("button:has-text('Create/Join Game (Multiplayer)')")
            time.sleep(1)
            page.screenshot(path="test_step2_multiplayer_menu.png")
            print("   [OK] Clicked, screenshot: test_step2_multiplayer_menu.png")
        except Exception as e:
            print(f"   [ERROR] {e}")
            page.screenshot(path="test_step2_error.png")

        # Click "Create New Game"
        print("\n3. Clicking 'Create New Game'...")
        try:
            page.click("button:has-text('Create New Game')")
            time.sleep(1)
            page.screenshot(path="test_step3_clicked_create.png")
            print("   [OK] Clicked, screenshot: test_step3_clicked_create.png")
        except Exception as e:
            print(f"   [ERROR] {e}")
            page.screenshot(path="test_step3_error.png")

        # Handle prompt dialog (username)
        print("\n4. Handling username prompt...")
        try:
            # Auto-accept prompt with test name
            page.on("dialog", lambda dialog: dialog.accept("TestPlayer"))
            time.sleep(3)  # Wait for API calls
            page.screenshot(path="test_step4_after_prompt.png")
            print("   [OK] Prompt handled, screenshot: test_step4_after_prompt.png")
        except Exception as e:
            print(f"   [ERROR] {e}")

        # Wait for game creation
        time.sleep(3)
        page.screenshot(path="test_step5_final_state.png")
        print("   Screenshot: test_step5_final_state.png")

        # Print console messages
        print("\n5. Console Messages (last 20):")
        for msg in console_messages[-20:]:
            print(f"   {msg}")

        # Print console errors
        print("\n6. Console Errors:")
        if console_errors:
            for err in console_errors:
                print(f"   [ERROR] {err}")
        else:
            print("   [OK] No console errors")

        # Print network errors
        print("\n7. Network Errors:")
        if network_errors:
            for err in network_errors:
                print(f"   [ERROR] {err}")
        else:
            print("   [OK] No network errors")

        print("\n" + "=" * 80)
        print("Keeping browser open for 15 seconds for inspection...")
        time.sleep(15)

        browser.close()

if __name__ == "__main__":
    test_create_game()
