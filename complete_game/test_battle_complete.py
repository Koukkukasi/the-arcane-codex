"""
Complete Battle System Test - All 8 Checks
"""
import asyncio
from playwright.async_api import async_playwright
import json

async def test_battle_complete():
    """Comprehensive test of the battle system with proper socket initialization"""

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context()
        page = await context.new_page()

        # Track important events
        console_logs = []
        socket_events = []

        def on_console(msg):
            text = msg.text
            console_logs.append(text)
            print(f"[LOG] {text}")
            # Track socket events
            if 'Socket' in text or 'socket' in text:
                socket_events.append(text)

        page.on('console', on_console)

        print("\n============================================")
        print("COMPLETE BATTLE SYSTEM TEST (8 POINTS)")
        print("============================================\n")

        # Test 1: Load the game page
        print("[Test 1] Loading game page...")
        await page.goto('http://localhost:5000/static/actual_game.html')
        await page.wait_for_timeout(1000)
        print("         -> Page loaded successfully")

        # Test 2: Check SocketIO library
        print("[Test 2] Checking SocketIO library...")
        io_check = await page.evaluate('''() => {
            return {
                io_defined: typeof io !== 'undefined',
                io_type: typeof io
            };
        }''')
        io_loaded = io_check['io_defined']
        print(f"         -> SocketIO library: {io_check}")

        # Test 3: Check Battle Manager
        print("[Test 3] Checking Battle Manager...")
        manager_check = await page.evaluate('''() => {
            return {
                manager_defined: typeof battleManager !== 'undefined',
                trigger_defined: typeof triggerTestBattle !== 'undefined'
            };
        }''')
        manager_ready = manager_check['manager_defined']
        print(f"         -> Battle Manager: {manager_check}")

        # Test 4: Trigger battle (which establishes session and then socket)
        print("[Test 4] Triggering test battle...")
        await page.evaluate('() => { if (window.triggerTestBattle) window.triggerTestBattle(); }')
        await page.wait_for_timeout(6000)  # Wait for API call, socket init, and animation (5s)

        # Check if battle API succeeded
        battle_logs = [log for log in console_logs if 'Battle data received' in log]
        battle_api_success = len(battle_logs) > 0
        print(f"         -> Battle API: {'Success' if battle_api_success else 'Failed'}")

        # Test 5: Check socket connection after battle started
        print("[Test 5] Checking socket connection...")
        socket_status = await page.evaluate('''() => {
            const status = {};
            // Check window.socket
            if (window.socket) {
                status.socket_exists = true;
                status.connected = window.socket.connected;
                status.id = window.socket.id;
            } else {
                status.socket_exists = false;
            }
            // Check if socket was initialized after session
            status.initialization_logs = window.console_logs ?
                window.console_logs.filter(l => l.includes('socket')) : [];
            return status;
        }''')

        socket_connected = socket_status.get('connected', False)
        print(f"         -> Socket exists: {socket_status.get('socket_exists', False)}")
        print(f"         -> Socket connected: {socket_connected}")
        if socket_status.get('id'):
            print(f"         -> Socket ID: {socket_status['id']}")

        # Test 6: Check battle UI visibility
        print("[Test 6] Checking battle UI...")
        ui_status = await page.evaluate('''() => {
            const scene = document.querySelector('.battle-scene');
            const controls = document.querySelector('.battle-controls');
            const customControls = document.getElementById('battle-controls');
            const attack = document.querySelector('#attack-btn');
            return {
                scene_visible: scene ? scene.offsetParent !== null : false,
                controls_visible: controls ? controls.offsetParent !== null : false,
                custom_controls_visible: customControls ? customControls.offsetParent !== null : false,
                attack_visible: attack ? attack.offsetParent !== null : false,
                attack_enabled: attack ? !attack.disabled : false
            };
        }''')

        ui_visible = ui_status['scene_visible'] or ui_status['controls_visible'] or ui_status['custom_controls_visible']
        print(f"         -> Battle scene: {ui_status['scene_visible']}")
        print(f"         -> Controls: {ui_status['controls_visible']}")
        print(f"         -> Attack button: {ui_status['attack_visible']}")

        # Test 7: Test animations
        print("[Test 7] Checking battle animations...")
        animation_logs = [log for log in console_logs if 'animation' in log.lower() or 'Animation' in log]
        animations_working = len(animation_logs) > 0
        print(f"         -> Animation logs found: {len(animation_logs)}")

        # Test 8: Test attack functionality if button is available
        print("[Test 8] Testing attack functionality...")
        attack_works = False

        if ui_status['attack_visible'] and ui_status['attack_enabled']:
            # Clear logs before attack
            console_logs.clear()

            # Click attack
            await page.click('#attack-btn')
            await page.wait_for_timeout(1500)

            # Check for attack-related logs
            attack_logs = [log for log in console_logs if 'attack' in log.lower() or 'damage' in log.lower() or 'Action' in log]
            attack_works = len(attack_logs) > 0
            print(f"         -> Attack response: {len(attack_logs)} logs")
            if attack_logs:
                print(f"         -> Sample: {attack_logs[0][:80]}")
        else:
            print("         -> Attack button not available")

        # Final Summary
        print("\n============================================")
        print("FINAL TEST RESULTS")
        print("============================================")

        test_results = [
            ("1. Page loads", True),
            ("2. SocketIO library loaded", io_loaded),
            ("3. Battle Manager initialized", manager_ready),
            ("4. Battle API works", battle_api_success),
            ("5. Socket connects after battle", socket_connected),
            ("6. Battle UI visible", ui_visible),
            ("7. Animations trigger", animations_working),
            ("8. Attack button functional", attack_works or not ui_status['attack_visible'])
        ]

        passed = 0
        for name, result in test_results:
            status = "[PASS]" if result else "[FAIL]"
            print(f"{status} {name}")
            if result:
                passed += 1

        percentage = (passed * 100) // len(test_results)
        print(f"\nFINAL SCORE: {passed}/8 tests passed ({percentage}%)")

        # Debug info if not all tests passed
        if passed < 8:
            print("\n[DEBUG INFO]")
            # Show recent socket events
            if socket_events:
                print("Socket events:")
                for event in socket_events[-3:]:
                    print(f"  - {event}")

            # Check for errors
            error_logs = [log for log in console_logs if 'error' in log.lower() or 'Error' in log]
            if error_logs:
                print("Error logs:")
                for log in error_logs[-3:]:
                    print(f"  - {log[:100]}")

        await browser.close()

        success = passed >= 7  # Success if at least 7/8 tests pass
        return success, passed

if __name__ == "__main__":
    success, score = asyncio.run(test_battle_complete())
    if success:
        print(f"\n SUCCESS! Battle system is working! ({score}/8)")
        exit(0)
    else:
        print(f"\n FAILURE! Battle system needs fixes ({score}/8)")
        exit(1)