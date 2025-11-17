#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
CSRF Token Debugging with Playwright
Comprehensive test to identify the exact point of failure
"""

import sys
import io
from playwright.sync_api import sync_playwright
import time
import json

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

def test_csrf_flow():
    print("=" * 80)
    print("CSRF TOKEN DEBUGGING TEST")
    print("=" * 80)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        context = browser.new_context(viewport={'width': 1920, 'height': 1080})
        page = context.new_page()

        all_console = []
        all_network = []

        def handle_console(msg):
            try:
                text = msg.text
                msg_type = msg.type
                all_console.append({'type': msg_type, 'text': text, 'time': time.time()})
                print(f"[CONSOLE-{msg_type.upper()}] {text}")
            except Exception as e:
                print(f"Error handling console: {e}")

        def handle_request(request):
            try:
                url = request.url
                method = request.method
                headers = request.headers
                all_network.append({
                    'type': 'request',
                    'method': method,
                    'url': url,
                    'headers': headers,
                    'time': time.time()
                })
                if '/api/' in url:
                    print(f"\n[NETWORK-REQUEST] {method} {url}")
                    if 'x-csrftoken' in headers:
                        print(f"  CSRF Token in headers: {headers['x-csrftoken'][:20]}...")
                    else:
                        print(f"  NO CSRF TOKEN IN HEADERS!")
            except Exception as e:
                print(f"Error handling request: {e}")

        def handle_response(response):
            try:
                url = response.url
                status = response.status
                if '/api/' in url:
                    print(f"[NETWORK-RESPONSE] {status} {url}")
                    all_network.append({
                        'type': 'response',
                        'status': status,
                        'url': url,
                        'time': time.time()
                    })
            except Exception as e:
                print(f"Error handling response: {e}")

        page.on("console", handle_console)
        page.on("request", handle_request)
        page.on("response", handle_response)

        print("\n" + "=" * 80)
        print("STEP 1: Loading page...")
        print("=" * 80)
        page.goto("http://localhost:5000?nocache=" + str(time.time()))
        time.sleep(3)

        print("\n" + "=" * 80)
        print("STEP 2: Checking if CSRF token was fetched on page load...")
        print("=" * 80)

        # Check localStorage and global variables
        csrf_in_storage = page.evaluate("() => localStorage.getItem('csrf_token')")
        csrf_in_window = page.evaluate("() => window.csrfToken")

        print(f"CSRF in localStorage: {csrf_in_storage}")
        print(f"CSRF in window.csrfToken: {csrf_in_window}")

        print("\n" + "=" * 80)
        print("STEP 3: Clicking 'Create/Join Game'...")
        print("=" * 80)
        page.click("button:has-text('Create/Join Game')")
        time.sleep(1)

        print("\n" + "=" * 80)
        print("STEP 4: Clicking 'Create New Game'...")
        print("=" * 80)

        # Auto-accept the prompt
        page.on("dialog", lambda dialog: dialog.accept("TestUser999"))
        page.click("button:has-text('Create New Game')")

        print("\n" + "=" * 80)
        print("STEP 5: Waiting 5 seconds for API calls...")
        print("=" * 80)
        time.sleep(5)

        print("\n" + "=" * 80)
        print("STEP 6: ANALYSIS")
        print("=" * 80)

        # Check final CSRF token state
        csrf_in_storage_final = page.evaluate("() => localStorage.getItem('csrf_token')")
        csrf_in_window_final = page.evaluate("() => window.csrfToken")

        print(f"\nFinal CSRF in localStorage: {csrf_in_storage_final}")
        print(f"Final CSRF in window.csrfToken: {csrf_in_window_final}")

        # Find CSRF token fetch request
        print("\n--- CSRF Token Fetch Analysis ---")
        csrf_requests = [n for n in all_network if '/api/csrf-token' in n.get('url', '')]
        if csrf_requests:
            print(f"Found {len(csrf_requests)} requests to /api/csrf-token")
            for req in csrf_requests:
                print(f"  {req}")
        else:
            print("NO REQUESTS TO /api/csrf-token FOUND!")

        # Find set_username request
        print("\n--- set_username Request Analysis ---")
        set_username_requests = [n for n in all_network if '/api/set_username' in n.get('url', '')]
        if set_username_requests:
            print(f"Found {len(set_username_requests)} requests to /api/set_username")
            for req in set_username_requests:
                print(f"  {req}")
                if req.get('type') == 'request':
                    headers = req.get('headers', {})
                    if 'x-csrftoken' in headers:
                        print(f"    CSRF Token: {headers['x-csrftoken'][:30]}...")
                    else:
                        print(f"    NO CSRF TOKEN!")
        else:
            print("NO REQUESTS TO /api/set_username FOUND!")

        # Console log analysis
        print("\n--- Console Log Analysis ---")
        csrf_logs = [c for c in all_console if 'csrf' in c.get('text', '').lower() or 'token' in c.get('text', '').lower()]
        print(f"Found {len(csrf_logs)} console messages about CSRF/tokens:")
        for log in csrf_logs:
            print(f"  [{log['type']}] {log['text']}")

        print("\n" + "=" * 80)
        print("STEP 7: Screenshot and keep browser open")
        print("=" * 80)
        page.screenshot(path="test_csrf_debug.png", full_page=True)
        print("\nScreenshot saved: test_csrf_debug.png")

        print("\nKeeping browser open for 20 seconds for manual inspection...")
        time.sleep(20)
        browser.close()

if __name__ == "__main__":
    test_csrf_flow()
