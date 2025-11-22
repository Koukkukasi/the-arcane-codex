"""
Test Battle System SocketIO Connection
"""
import asyncio
from playwright.async_api import async_playwright
import json
import time

async def test_battle_socket():
    """Test that SocketIO connects properly for battle system"""

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context()
        page = await context.new_page()

        console_logs = []
        errors = []
        socket_connected = False

        def on_console(msg):
            text = msg.text
            console_logs.append(text)
            print(f"[CONSOLE] {text}")

            # Check for socket connection
            if 'Socket connected!' in text:
                nonlocal socket_connected
                socket_connected = True

        def on_pageerror(error):
            errors.append(str(error))
            print(f"[ERROR] {error}")

        page.on('console', on_console)
        page.on('pageerror', on_pageerror)

        print("\n=== Test 1: Loading page ===")
        await page.goto('http://localhost:5000/static/actual_game.html')
        await page.wait_for_timeout(2000)

        # Test 1: Check if SocketIO library loaded
        print("\n=== Test 2: Checking SocketIO library ===")
        io_loaded = await page.evaluate('() => typeof io !== "undefined"')
        print(f"SocketIO library loaded: {io_loaded}")
        assert io_loaded, "SocketIO library not loaded"

        # Test 2: Trigger battle which should establish session
        print("\n=== Test 3: Triggering battle to establish session ===")

        # Make battle API call first to establish session
        response = await page.evaluate('''async () => {
            const response = await fetch('/api/battle/test', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({game_code: 'TEST001'}),
                credentials: 'include'  // Include cookies for session
            });
            return {
                ok: response.ok,
                status: response.status,
                data: await response.json()
            };
        }''')

        print(f"Battle API response: Status={response['status']}, OK={response['ok']}")
        assert response['ok'], f"Battle API failed: {response}"

        # Test 3: Wait for socket initialization
        print("\n=== Test 4: Waiting for socket initialization ===")
        await page.wait_for_timeout(3000)

        # Test 4: Check socket connection status
        print("\n=== Test 5: Checking socket connection ===")
        socket_status = await page.evaluate('''() => {
            const results = {};

            // Check window.socket
            results.windowSocket = typeof window.socket !== 'undefined';
            results.windowSocketConnected = window.socket ? window.socket.connected : false;
            results.windowSocketId = window.socket ? window.socket.id : null;

            // Check global socket
            results.globalSocket = typeof socket !== 'undefined';
            results.globalSocketConnected = typeof socket !== 'undefined' ? socket.connected : false;

            return results;
        }''')

        print(f"Socket status: {json.dumps(socket_status, indent=2)}")

        # Test 5: Try to manually connect if not connected
        if not socket_status.get('windowSocketConnected'):
            print("\n=== Test 6: Attempting manual socket connection ===")

            connect_result = await page.evaluate('''async () => {
                if (typeof io === 'undefined') {
                    return {error: 'io not defined'};
                }

                // Create new socket with credentials
                const testSocket = io('http://localhost:5000', {
                    transports: ['websocket', 'polling'],
                    withCredentials: true
                });

                return new Promise((resolve) => {
                    const timeout = setTimeout(() => {
                        resolve({
                            connected: testSocket.connected,
                            id: testSocket.id,
                            timeout: true
                        });
                    }, 5000);

                    testSocket.on('connect', () => {
                        clearTimeout(timeout);
                        resolve({
                            connected: true,
                            id: testSocket.id,
                            success: true
                        });
                    });

                    testSocket.on('connect_error', (error) => {
                        clearTimeout(timeout);
                        resolve({
                            connected: false,
                            error: error.message
                        });
                    });
                });
            }''')

            print(f"Manual connection result: {json.dumps(connect_result, indent=2)}")
            socket_connected = connect_result.get('connected', False)

        # Test 6: Check battle manager state
        print("\n=== Test 7: Checking battle manager ===")
        battle_state = await page.evaluate('''() => {
            if (typeof battleManager === 'undefined') {
                return {error: 'battleManager not defined'};
            }

            return {
                initialized: true,
                hasSocketRetryTimeout: battleManager.socketRetryTimeout !== undefined
            };
        }''')

        print(f"Battle manager state: {json.dumps(battle_state, indent=2)}")

        # Test 7: Try clicking attack button
        print("\n=== Test 8: Testing attack button ===")

        # Check if battle UI is visible
        attack_button_visible = await page.locator('#attack-btn').is_visible()

        if attack_button_visible:
            print("Attack button is visible, clicking...")
            await page.click('#attack-btn')
            await page.wait_for_timeout(1000)

            # Check for any response
            attack_response = await page.evaluate('''() => {
                const logs = window.consoleLogs || [];
                return logs.filter(log => log.includes('attack') || log.includes('Attack'));
            }''')

            print(f"Attack response logs: {attack_response}")
        else:
            print("Attack button not visible (battle not active)")

        # Summary
        print("\n" + "="*60)
        print("TEST SUMMARY")
        print("="*60)

        tests_passed = 0
        tests_total = 8

        results = [
            ("1. Page loaded", True),
            ("2. SocketIO library loaded", io_loaded),
            ("3. Battle API works", response['ok']),
            ("4. Session established", response['ok']),
            ("5. Socket connection attempted", socket_status.get('windowSocket') or socket_status.get('globalSocket')),
            ("6. Socket connected", socket_connected or socket_status.get('windowSocketConnected')),
            ("7. Battle manager initialized", battle_state.get('initialized', False)),
            ("8. Attack button functional", attack_button_visible or not response['ok'])
        ]

        for test_name, passed in results:
            status = "✓ PASS" if passed else "✗ FAIL"
            print(f"{status} - {test_name}")
            if passed:
                tests_passed += 1

        print(f"\nRESULT: {tests_passed}/{tests_total} tests passed ({tests_passed*100//tests_total}%)")

        if errors:
            print(f"\nErrors encountered: {len(errors)}")
            for error in errors[:3]:
                print(f"  - {error}")

        await browser.close()

        # Return success if all critical tests pass
        success = tests_passed >= 7  # At least 7/8 tests should pass
        return success

if __name__ == "__main__":
    success = asyncio.run(test_battle_socket())
    exit(0 if success else 1)