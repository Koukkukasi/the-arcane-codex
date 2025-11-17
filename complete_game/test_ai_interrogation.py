#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Test AI-Powered Divine Interrogation with Playwright
Captures console errors and validates API integration
"""

import sys
import io
from playwright.sync_api import sync_playwright
import time

# Fix encoding for Windows console
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

def test_ai_interrogation():
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
        print("AI-POWERED DIVINE INTERROGATION TEST")
        print("=" * 80)

        # Navigate to the page
        print("\n1. Loading AI-powered UI (index.html)...")
        try:
            page.goto("http://localhost:5000", wait_until="networkidle", timeout=10000)
            print("   [OK] Page loaded successfully")
        except Exception as e:
            print(f"   [ERROR] Failed to load page: {e}")
            browser.close()
            return

        # Wait for page to fully render
        time.sleep(2)

        # Check page title
        print("\n2. Checking page details...")
        title = page.title()
        print(f"   Title: {title}")

        # Check for main elements
        print("\n3. Checking UI elements...")

        main_menu = page.locator("#main-menu").count()
        print(f"   Main menu: {main_menu}")

        begin_btn = page.locator("button:has-text('Begin Divine Interrogation')").count()
        print(f"   Begin button: {begin_btn}")

        # Take screenshot of initial state
        print("\n4. Capturing initial state screenshot...")
        page.screenshot(path="ai_interrogation_initial.png", full_page=True)
        print("   Screenshot saved: ai_interrogation_initial.png")

        # Try to click "Begin Divine Interrogation"
        print("\n5. Attempting to start interrogation...")
        if begin_btn > 0:
            try:
                page.click("button:has-text('Begin Divine Interrogation')")
                print("   [OK] Clicked 'Begin Divine Interrogation' button")

                # Wait for API call
                time.sleep(3)

                # Check if interrogation screen appeared
                interrogation_screen = page.locator("#interrogation-screen").count()
                interrogation_visible = page.locator("#interrogation-screen.hidden").count() == 0

                print(f"   Interrogation screen exists: {interrogation_screen > 0}")
                print(f"   Interrogation screen visible: {interrogation_visible}")

                # Take screenshot after clicking
                page.screenshot(path="ai_interrogation_after_click.png", full_page=True)
                print("   Screenshot saved: ai_interrogation_after_click.png")

            except Exception as e:
                print(f"   [ERROR] Failed to click button: {e}")
        else:
            print("   [ERROR] Begin button not found")

        # Print console messages
        print("\n6. Console Messages:")
        if console_messages:
            for msg in console_messages[-30:]:  # Show last 30
                print(f"   {msg}")
        else:
            print("   No console messages")

        # Print console errors
        print("\n7. Console Errors:")
        if console_errors:
            for err in console_errors:
                print(f"   [ERROR] {err}")
        else:
            print("   [OK] No console errors detected")

        # Print network errors
        print("\n8. Network Errors:")
        if network_errors:
            for err in network_errors:
                print(f"   [ERROR] {err}")
        else:
            print("   [OK] No network errors detected")

        # Check network requests
        print("\n9. Recent Network Activity:")
        print("   (Check browser DevTools for detailed network log)")

        print("\n" + "=" * 80)
        print("TEST SUMMARY")
        print("=" * 80)

        if "The Arcane Codex" in title:
            print("[OK] Correct UI loaded")
        else:
            print("[ERROR] Wrong UI version")

        if begin_btn > 0:
            print("[OK] Begin button present")
        else:
            print("[ERROR] Begin button missing")

        if len(console_errors) == 0:
            print("[OK] No JavaScript errors")
        else:
            print(f"[ERROR] {len(console_errors)} JavaScript errors detected")

        if len(network_errors) == 0:
            print("[OK] No network failures")
        else:
            print(f"[ERROR] {len(network_errors)} network failures detected")

        print("\n" + "=" * 80)
        print("\nBrowser will stay open for 30 seconds for inspection...")
        print("Check the browser DevTools (F12) for detailed error information")
        time.sleep(30)

        browser.close()

if __name__ == "__main__":
    test_ai_interrogation()
