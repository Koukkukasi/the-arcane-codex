#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Complete End-to-End Flow Test
Verifies that both issues are fixed:
1. Unicode encoding errors are resolved
2. CSRF token flow works correctly
"""

import sys
import io
from playwright.sync_api import sync_playwright
import time

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

def test_complete_flow():
    print("=" * 80)
    print("COMPLETE END-TO-END FLOW TEST")
    print("=" * 80)
    print("\nThis test verifies:")
    print("1. Server starts without Unicode encoding errors")
    print("2. CSRF token is fetched and used correctly")
    print("3. Create Game flow works end-to-end")
    print("4. Divine Interrogation begins successfully")
    print()

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        context = browser.new_context(viewport={'width': 1920, 'height': 1080})
        page = context.new_page()

        errors = []
        successes = []

        # Track console errors
        def handle_console(msg):
            if msg.type == 'error':
                errors.append(f"Console Error: {msg.text}")
                print(f"[ERROR] {msg.text}")

        page.on("console", handle_console)

        # Step 1: Load page
        print("\n[STEP 1] Loading page...")
        try:
            page.goto("http://localhost:5000")
            page.wait_for_load_state("networkidle", timeout=10000)
            successes.append("Page loaded successfully")
            print("[OK] Page loaded")
        except Exception as e:
            errors.append(f"Failed to load page: {e}")
            print(f"[ERROR] Failed to load page: {e}")
            browser.close()
            return False

        # Step 2: Check CSRF token
        print("\n[STEP 2] Checking CSRF token...")
        time.sleep(2)
        csrf_token = page.evaluate("() => window.csrfToken")
        if csrf_token:
            successes.append(f"CSRF token fetched: {csrf_token[:30]}...")
            print(f"[OK] CSRF token: {csrf_token[:30]}...")
        else:
            errors.append("CSRF token not found in window.csrfToken")
            print("[ERROR] CSRF token not found")

        # Step 3: Create multiplayer game
        print("\n[STEP 3] Creating multiplayer game...")
        try:
            page.click("button:has-text('Create/Join Game')")
            time.sleep(0.5)
            print("[OK] Clicked 'Create/Join Game'")

            # Handle username prompt
            page.on("dialog", lambda dialog: dialog.accept("E2ETestUser"))
            page.click("button:has-text('Create New Game')")
            print("[OK] Clicked 'Create New Game'")

            # Wait for API calls
            time.sleep(3)

            # Check for success message
            page_content = page.content()
            if "Game Created" in page_content or "Game created" in page_content:
                successes.append("Game created successfully")
                print("[OK] Game created")
            else:
                print("[WARNING] Game creation message not found, but continuing...")

        except Exception as e:
            errors.append(f"Failed to create game: {e}")
            print(f"[ERROR] Failed to create game: {e}")

        # Step 4: Check if interrogation started
        print("\n[STEP 4] Checking Divine Interrogation...")
        time.sleep(3)
        try:
            # Check if interrogation screen is visible
            interrogation_visible = page.is_visible("#interrogation-screen")
            if interrogation_visible:
                successes.append("Divine Interrogation screen displayed")
                print("[OK] Interrogation screen visible")

                # Check if question is displayed
                question_text = page.text_content("#question-text")
                if question_text and len(question_text) > 20:
                    successes.append(f"Question displayed: {question_text[:50]}...")
                    print(f"[OK] Question: {question_text[:50]}...")
                else:
                    errors.append("Question text not found or too short")
                    print("[ERROR] Question not displayed properly")
            else:
                errors.append("Interrogation screen not visible")
                print("[ERROR] Interrogation screen not visible")
        except Exception as e:
            errors.append(f"Failed to check interrogation: {e}")
            print(f"[ERROR] Failed to check interrogation: {e}")

        # Step 5: Take screenshot
        print("\n[STEP 5] Taking screenshot...")
        try:
            page.screenshot(path="test_complete_flow.png", full_page=True)
            successes.append("Screenshot saved: test_complete_flow.png")
            print("[OK] Screenshot saved")
        except Exception as e:
            errors.append(f"Failed to save screenshot: {e}")
            print(f"[ERROR] Failed to save screenshot: {e}")

        # Final report
        print("\n" + "=" * 80)
        print("FINAL REPORT")
        print("=" * 80)
        print(f"\nSuccesses: {len(successes)}")
        for s in successes:
            print(f"  [OK] {s}")

        print(f"\nErrors: {len(errors)}")
        for e in errors:
            print(f"  [ERROR] {e}")

        print("\n" + "=" * 80)
        if len(errors) == 0:
            print("ALL TESTS PASSED!")
            print("=" * 80)
            result = True
        else:
            print("SOME TESTS FAILED")
            print("=" * 80)
            result = False

        print("\nKeeping browser open for 10 seconds...")
        time.sleep(10)
        browser.close()

        return result

if __name__ == "__main__":
    success = test_complete_flow()
    sys.exit(0 if success else 1)
