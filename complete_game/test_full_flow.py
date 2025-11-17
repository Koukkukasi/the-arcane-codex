#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Test Full Create Game Flow - Detailed Error Capture
"""

import sys
import io
from playwright.sync_api import sync_playwright
import time

# Fix encoding for Windows console
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

def test_full_flow():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        context = browser.new_context(viewport={'width': 1920, 'height': 1080})
        page = context.new_page()

        # Collect ALL events
        console_messages = []
        console_errors = []
        network_requests = []
        network_responses = []

        page.on("console", lambda msg: console_messages.append(f"[{msg.type}] {msg.text}"))
        page.on("pageerror", lambda exc: console_errors.append(f"PAGE ERROR: {exc}"))

        page.on("request", lambda request: network_requests.append({
            'url': request.url,
            'method': request.method,
            'headers': dict(request.headers)
        }))

        page.on("response", lambda response: network_responses.append({
            'url': response.url,
            'status': response.status,
            'ok': response.ok
        }))

        print("=" * 80)
        print("FULL FLOW TEST WITH DETAILED ERROR CAPTURE")
        print("=" * 80)

        # Load page
        print("\n1. Loading page...")
        page.goto("http://localhost:5000")
        time.sleep(2)
        print("   Page loaded")

        # Click multiplayer
        print("\n2. Clicking Create/Join Game...")
        page.click("button:has-text('Create/Join Game')")
        time.sleep(1)

        # Click create
        print("\n3. Clicking Create New Game...")

        # Set up dialog handler BEFORE clicking
        dialog_handled = False
        def handle_dialog(dialog):
            global dialog_handled
            print(f"\n   [DIALOG] Type: {dialog.type}, Message: {dialog.message}")
            dialog.accept("TestUser123")
            dialog_handled = True

        page.on("dialog", handle_dialog)

        page.click("button:has-text('Create New Game')")

        # Wait for dialog
        time.sleep(2)

        # Wait for API calls
        print("\n4. Waiting for API calls...")
        time.sleep(5)

        # Check for error messages on page
        print("\n5. Checking for error/success messages...")
        messages = page.locator(".message").all()
        for msg in messages:
            text = msg.text_content()
            classes = msg.get_attribute("class")
            print(f"   Message: [{classes}] {text}")

        # Print all console output
        print("\n6. Console Output:")
        for msg in console_messages:
            print(f"   {msg}")

        # Print errors
        print("\n7. Console Errors:")
        if console_errors:
            for err in console_errors:
                print(f"   ERROR: {err}")
        else:
            print("   No errors")

        # Print failed network requests
        print("\n8. Network Requests (last 10):")
        for req in network_requests[-10:]:
            print(f"   {req['method']} {req['url']}")

        print("\n9. Failed Responses:")
        failed = [r for r in network_responses if not r['ok']]
        if failed:
            for resp in failed:
                print(f"   {resp['status']} - {resp['url']}")
        else:
            print("   No failed responses")

        # Take final screenshot
        page.screenshot(path="test_full_flow_final.png", full_page=True)
        print("\n10. Screenshot saved: test_full_flow_final.png")

        print("\n" + "=" * 80)
        print("Keeping browser open for 20 seconds...")
        time.sleep(20)

        browser.close()

if __name__ == "__main__":
    test_full_flow()
