"""
Final Battle System Test with Debug Info
"""
import asyncio
from playwright.async_api import async_playwright
import json

async def test_battle_final_debug():
    """Test the battle system with detailed debugging"""

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)  # Show browser for debugging
        context = await browser.new_context()
        page = await context.new_page()

        console_logs = []

        def on_console(msg):
            text = msg.text
            console_logs.append(text)
            print(f"[CONSOLE] {text}")

        page.on('console', on_console)

        print("\n============================================")
        print("BATTLE SYSTEM DEBUG TEST")
        print("============================================\n")

        # Load page
        print("Loading page...")
        await page.goto('http://localhost:5000/static/actual_game.html')
        await page.wait_for_timeout(2000)

        # Check initial state
        print("\nChecking initial state...")
        initial_state = await page.evaluate('''() => {
            return {
                io: typeof io !== 'undefined',
                battleManager: typeof battleManager !== 'undefined',
                ArcaneCodex: typeof window.ArcaneCodex !== 'undefined',
                animations: window.ArcaneCodex ? (typeof window.ArcaneCodex.animations !== 'undefined') : false
            };
        }''')
        print(f"Initial state: {json.dumps(initial_state, indent=2)}")

        # Trigger battle
        print("\nTriggering battle...")
        await page.evaluate('() => { if (window.triggerTestBattle) window.triggerTestBattle(); }')

        # Wait for battle to initialize
        print("Waiting for battle initialization...")
        await page.wait_for_timeout(5000)

        # Check battle state
        print("\nChecking battle state...")
        battle_state = await page.evaluate('''() => {
            const state = {};

            // Check battle manager
            if (window.battleManager) {
                state.isInBattle = battleManager.isInBattle;
                state.currentBattle = battleManager.currentBattle ? true : false;
                state.socketInitialized = battleManager.socketInitialized;
            }

            // Check socket
            if (window.socket) {
                state.socketConnected = socket.connected;
                state.socketId = socket.id;
            }

            // Check DOM elements
            const battleScene = document.querySelector('.battle-scene');
            const battleControls = document.querySelector('.battle-controls');
            const attackBtn = document.querySelector('#attack-btn');
            const customControls = document.getElementById('battle-controls');

            state.battleSceneExists = battleScene !== null;
            state.battleControlsExists = battleControls !== null;
            state.attackBtnExists = attackBtn !== null;
            state.customControlsExists = customControls !== null;

            // Check visibility
            if (battleScene) {
                state.battleSceneVisible = battleScene.offsetParent !== null;
                state.battleSceneDisplay = window.getComputedStyle(battleScene).display;
            }
            if (customControls) {
                state.customControlsVisible = customControls.offsetParent !== null;
                state.customControlsDisplay = window.getComputedStyle(customControls).display;
            }

            return state;
        }''')
        print(f"Battle state: {json.dumps(battle_state, indent=2)}")

        # Wait more and check again
        print("\nWaiting 5 more seconds for animations...")
        await page.wait_for_timeout(5000)

        # Final check
        print("\nFinal check...")
        final_state = await page.evaluate('''() => {
            const controls = document.getElementById('battle-controls');
            const attackBtn = document.getElementById('attack-btn');

            return {
                customControlsExists: controls !== null,
                attackBtnExists: attackBtn !== null,
                battleInProgress: window.battleManager ? battleManager.isInBattle : false
            };
        }''')
        print(f"Final state: {json.dumps(final_state, indent=2)}")

        # Test clicking attack if available
        if final_state['attackBtnExists']:
            print("\nClicking attack button...")
            await page.click('#attack-btn')
            await page.wait_for_timeout(2000)

        # Show recent console logs
        print("\nRecent console logs:")
        for log in console_logs[-10:]:
            print(f"  {log}")

        await page.wait_for_timeout(30000)  # Keep browser open for manual inspection
        await browser.close()

if __name__ == "__main__":
    asyncio.run(test_battle_final_debug())