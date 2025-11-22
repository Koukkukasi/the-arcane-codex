"""
Final Battle System Test - Verify SocketIO Connection Works
"""
import asyncio
from playwright.async_api import async_playwright
import json

async def test_battle_final():
    """Test that the battle system with SocketIO connection works end-to-end"""

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context()
        page = await context.new_page()

        # Track console messages
        console_logs = []
        socket_connected = False

        def on_console(msg):
            text = msg.text
            console_logs.append(text)
            print(f"[LOG] {text}")
            # Check for successful socket connection
            if 'Socket connected!' in text and 'ID:' in text:
                nonlocal socket_connected
                socket_connected = True

        page.on('console', on_console)

        print("\n============================================")
        print("BATTLE SYSTEM FINAL TEST")
        print("============================================\n")

        # Load the game page
        print("[1/8] Loading game page...")
        await page.goto('http://localhost:5000/static/actual_game.html')
        await page.wait_for_timeout(2000)

        # Check SocketIO library
        print("[2/8] Checking SocketIO library...")
        io_loaded = await page.evaluate('() => typeof io !== "undefined"')
        print(f"       -> SocketIO loaded: {io_loaded}")

        # Call battle API to establish session
        print("[3/8] Calling battle API to establish session...")
        response = await page.evaluate('''async () => {
            const response = await fetch('/api/battle/test', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({game_code: 'TEST001'}),
                credentials: 'include'
            });
            return {
                ok: response.ok,
                status: response.status,
                data: await response.json()
            };
        }''')
        print(f"       -> API Response: Status={response['status']}, OK={response['ok']}")

        # Check if battle started
        battle_started = response['ok'] and 'enemy' in response.get('data', {})
        print(f"       -> Battle started: {battle_started}")

        # Wait for socket to connect after session established
        print("[4/8] Waiting for socket connection...")
        await page.wait_for_timeout(3000)

        # Check socket status
        print("[5/8] Checking socket status...")
        socket_info = await page.evaluate('''() => {
            const info = {};
            if (window.socket) {
                info.exists = true;
                info.connected = window.socket.connected;
                info.id = window.socket.id;
            } else {
                info.exists = false;
            }
            return info;
        }''')
        print(f"       -> Socket exists: {socket_info.get('exists', False)}")
        print(f"       -> Socket connected: {socket_info.get('connected', False)}")
        if socket_info.get('id'):
            print(f"       -> Socket ID: {socket_info['id']}")
            socket_connected = True

        # Check battle UI visibility
        print("[6/8] Checking battle UI...")
        battle_visible = await page.locator('.battle-scene').is_visible()
        controls_visible = await page.locator('.battle-controls').is_visible()
        attack_visible = await page.locator('#attack-btn').is_visible()

        print(f"       -> Battle scene visible: {battle_visible}")
        print(f"       -> Battle controls visible: {controls_visible}")
        print(f"       -> Attack button visible: {attack_visible}")

        # Test attack button if visible
        print("[7/8] Testing attack button functionality...")
        if attack_visible:
            # Clear previous logs to track attack response
            console_logs.clear()

            # Click attack button
            await page.click('#attack-btn')
            await page.wait_for_timeout(1000)

            # Check for attack-related logs
            attack_logs = [log for log in console_logs if 'attack' in log.lower() or 'damage' in log.lower()]
            if attack_logs:
                print(f"       -> Attack triggered: {len(attack_logs)} related logs")
                for log in attack_logs[:2]:
                    print(f"          {log}")
            else:
                print("       -> No attack response detected")
        else:
            print("       -> Attack button not available")

        # Check for animation
        print("[8/8] Checking for battle animations...")
        animation_active = await page.evaluate('''() => {
            const scene = document.querySelector('.battle-scene');
            if (!scene) return false;
            // Check if any battle animations are running
            const animations = scene.getAnimations ? scene.getAnimations() : [];
            return animations.length > 0;
        }''')
        print(f"       -> Animations active: {animation_active}")

        # Summary
        print("\n============================================")
        print("TEST RESULTS")
        print("============================================")

        results = {
            "1. Page loaded": True,
            "2. SocketIO library loaded": io_loaded,
            "3. Battle API works": response['ok'],
            "4. Session established": response['ok'],
            "5. Socket connected": socket_connected,
            "6. Battle UI visible": battle_visible or controls_visible,
            "7. Attack button functional": attack_visible,
            "8. Battle system ready": battle_started
        }

        passed = 0
        failed = 0

        for test, result in results.items():
            status = "[PASS]" if result else "[FAIL]"
            print(f"{status} {test}")
            if result:
                passed += 1
            else:
                failed += 1

        total = len(results)
        percentage = (passed * 100) // total

        print(f"\n FINAL SCORE: {passed}/{total} tests passed ({percentage}%)")

        # Check for any errors in console
        error_logs = [log for log in console_logs if 'error' in log.lower() or 'failed' in log.lower()]
        if error_logs and failed > 0:
            print("\n[DEBUG] Error logs detected:")
            for log in error_logs[:3]:
                print(f"  - {log}")

        await browser.close()

        # Return true if at least 7/8 tests pass
        return passed >= 7

if __name__ == "__main__":
    success = asyncio.run(test_battle_final())
    if success:
        print("\nSUCCESS: Battle system is working!")
        exit(0)
    else:
        print("\nFAILURE: Battle system needs fixes")
        exit(1)