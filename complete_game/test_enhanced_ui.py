#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Test Enhanced UI with Playwright
Verifies SVG graphics load and captures console errors
"""

import sys
import io
from playwright.sync_api import sync_playwright
import time

# Fix encoding for Windows console
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

def test_enhanced_ui():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        context = browser.new_context(viewport={'width': 1920, 'height': 1080})
        page = context.new_page()

        # Collect console messages and errors
        console_messages = []
        console_errors = []

        page.on("console", lambda msg: console_messages.append(f"[{msg.type}] {msg.text}"))
        page.on("pageerror", lambda exc: console_errors.append(f"Page Error: {exc}"))

        print("=" * 80)
        print("ENHANCED UI TEST - SVG GRAPHICS VERIFICATION")
        print("=" * 80)

        # Navigate to the page
        print("\n1. Loading enhanced UI...")
        try:
            page.goto("http://localhost:5000", wait_until="networkidle", timeout=10000)
            print("   ✓ Page loaded successfully")
        except Exception as e:
            print(f"   ✗ Failed to load page: {e}")
            browser.close()
            return

        # Wait for page to fully render
        time.sleep(2)

        # Check page title
        print("\n2. Checking page details...")
        title = page.title()
        print(f"   Title: {title}")

        # Check for SVG elements
        print("\n3. Checking for SVG graphics...")
        svg_count = page.locator("svg").count()
        print(f"   SVG elements found: {svg_count}")

        # Check for enhanced UI elements
        print("\n4. Checking enhanced UI components...")

        # Check for game container
        game_container = page.locator(".game-container").count()
        print(f"   Game containers: {game_container}")

        # Check for top HUD
        top_hud = page.locator(".top-hud").count()
        print(f"   Top HUD elements: {top_hud}")

        # Check for scenario display
        scenario_display = page.locator(".scenario-display").count()
        print(f"   Scenario displays: {scenario_display}")

        # Check for control panel
        control_panel = page.locator(".control-panel").count()
        print(f"   Control panels: {control_panel}")

        # Print console messages
        print("\n5. Console Messages:")
        if console_messages:
            for msg in console_messages[:20]:  # Show first 20
                print(f"   {msg}")
            if len(console_messages) > 20:
                print(f"   ... and {len(console_messages) - 20} more messages")
        else:
            print("   No console messages")

        # Print console errors
        print("\n6. Console Errors:")
        if console_errors:
            for err in console_errors:
                print(f"   ✗ {err}")
        else:
            print("   ✓ No console errors detected")

        # Take screenshot
        print("\n7. Capturing screenshot...")
        screenshot_path = "enhanced_ui_screenshot.png"
        page.screenshot(path=screenshot_path, full_page=True)
        print(f"   Screenshot saved: {screenshot_path}")

        # Check network requests for failed resources
        print("\n8. Checking network requests...")
        # This requires setting up request/response listeners before navigation
        # For now, we'll check what's loaded

        print("\n" + "=" * 80)
        print("TEST SUMMARY")
        print("=" * 80)

        if "Enhanced Scenario Interface" in title:
            print("✓ Enhanced UI is being served")
        else:
            print("✗ Wrong UI version served")

        if svg_count > 0:
            print(f"✓ SVG graphics present ({svg_count} elements)")
        else:
            print("✗ No SVG graphics found")

        if game_container > 0:
            print("✓ Enhanced game container loaded")
        else:
            print("✗ Enhanced game container missing")

        if len(console_errors) == 0:
            print("✓ No JavaScript errors")
        else:
            print(f"✗ {len(console_errors)} JavaScript errors detected")

        print("\n" + "=" * 80)

        # Keep browser open for inspection
        print("\nBrowser will close in 5 seconds...")
        time.sleep(5)

        browser.close()

if __name__ == "__main__":
    test_enhanced_ui()
