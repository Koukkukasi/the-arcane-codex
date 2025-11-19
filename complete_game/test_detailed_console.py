#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Detailed Console Capture
"""

import sys
import io
from playwright.sync_api import sync_playwright
import time
import json

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

def test_console():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        context = browser.new_context(viewport={'width': 1920, 'height': 1080})
        page = context.new_page()

        all_console = []

        def handle_console(msg):
            try:
                text = msg.text
                msg_type = msg.type
                all_console.append({'type': msg_type, 'text': text})
                print(f"[{msg_type.upper()}] {text}")
            except Exception as e:
                print(f"Error handling console: {e}")

        page.on("console", handle_console)

        print("Loading page...")
        page.goto("http://localhost:5000?nocache=" + str(time.time()))
        time.sleep(2)

        print("\nClicking Create/Join Game...")
        page.click("button:has-text('Create/Join Game')")
        time.sleep(1)

        print("\nClicking Create New Game...")
        page.on("dialog", lambda dialog: dialog.accept("TestUser999"))
        page.click("button:has-text('Create New Game')")

        print("\nWaiting 8 seconds for all API calls...")
        time.sleep(8)

        print("\n" + "=" * 80)
        print("ALL CONSOLE OUTPUT:")
        print("=" * 80)
        for entry in all_console:
            print(f"[{entry['type']}] {entry['text']}")

        print("\n" + "=" * 80)
        print("Checking page state...")

        # Check what screen is visible
        screens = {
            'main-menu': page.locator("#main-menu:not(.hidden)").count(),
            'multiplayer-menu': page.locator("#multiplayer-menu:not(.hidden)").count(),
            'interrogation-screen': page.locator("#interrogation-screen:not(.hidden)").count(),
        }

        print("\nVisible screens:")
        for screen, count in screens.items():
            if count > 0:
                print(f"  {screen}: VISIBLE")

        # Check for messages
        messages = page.locator(".message").all()
        print(f"\nMessages on page: {len(messages)}")
        for msg in messages:
            print(f"  - {msg.text_content()}")

        page.screenshot(path="test_detailed_final.png", full_page=True)
        print("\nScreenshot: test_detailed_final.png")

        print("\nKeeping browser open 15 seconds...")
        time.sleep(15)
        browser.close()

if __name__ == "__main__":
    test_console()
