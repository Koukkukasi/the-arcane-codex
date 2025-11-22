"""
Debug SocketIO loading issue
"""
import asyncio
from playwright.async_api import async_playwright
import json
import time

async def debug_socketio():
    async with async_playwright() as p:
        # Launch browser with devtools for debugging
        browser = await p.chromium.launch(
            headless=False,
            devtools=True
        )

        context = await browser.new_context()
        page = await context.new_page()

        # Collect all network requests and responses
        network_logs = []
        console_logs = []

        def on_request(request):
            if 'socket.io' in request.url or 'cdn.socket' in request.url:
                network_logs.append({
                    'type': 'request',
                    'url': request.url,
                    'method': request.method,
                    'timestamp': time.time()
                })
                print(f"[NETWORK REQUEST] {request.method} {request.url}")

        def on_response(response):
            if 'socket.io' in response.url or 'cdn.socket' in response.url:
                network_logs.append({
                    'type': 'response',
                    'url': response.url,
                    'status': response.status,
                    'timestamp': time.time()
                })
                print(f"[NETWORK RESPONSE] {response.status} {response.url}")

        def on_console(msg):
            console_logs.append({
                'type': msg.type,
                'text': msg.text,
                'timestamp': time.time()
            })
            print(f"[CONSOLE {msg.type.upper()}] {msg.text}")

        # Listen to network and console events
        page.on('request', on_request)
        page.on('response', on_response)
        page.on('console', on_console)

        print("\n=== Loading page ===")
        await page.goto('http://localhost:5000/static/actual_game.html')

        # Wait a bit for scripts to load
        await page.wait_for_timeout(3000)

        print("\n=== Checking SocketIO availability ===")

        # Check if io is defined
        io_check = await page.evaluate('''() => {
            const results = {};

            // Check if io exists
            results.io_defined = typeof io !== 'undefined';
            results.io_type = typeof io;

            // Check if socket exists
            results.socket_defined = typeof socket !== 'undefined';
            results.socket_type = typeof socket;

            // Check window.socket
            results.window_socket_defined = typeof window.socket !== 'undefined';
            results.window_socket_type = typeof window.socket;

            // Try to get io version if available
            if (typeof io !== 'undefined' && io.version) {
                results.io_version = io.version;
            }

            // Check if any script tags for socket.io exist
            const scripts = Array.from(document.getElementsByTagName('script'));
            results.socketio_scripts = scripts
                .filter(s => s.src && s.src.includes('socket.io'))
                .map(s => ({
                    src: s.src,
                    loaded: s.loaded !== false,
                    async: s.async,
                    defer: s.defer
                }));

            return results;
        }''')

        print("\n=== SocketIO Check Results ===")
        print(json.dumps(io_check, indent=2))

        # Check for any CSP or security policies
        csp_check = await page.evaluate('''() => {
            const meta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
            return meta ? meta.content : null;
        }''')

        if csp_check:
            print(f"\n=== Content Security Policy ===")
            print(csp_check)

        # Try to manually load socket.io if it failed
        if not io_check['io_defined']:
            print("\n=== Attempting manual script injection ===")

            # Try injecting the script directly
            inject_result = await page.evaluate('''() => {
                return new Promise((resolve) => {
                    const script = document.createElement('script');
                    script.src = 'https://cdn.socket.io/4.7.2/socket.io.min.js';

                    script.onload = () => {
                        setTimeout(() => {
                            resolve({
                                success: true,
                                io_defined: typeof io !== 'undefined',
                                io_type: typeof io
                            });
                        }, 100);
                    };

                    script.onerror = (error) => {
                        resolve({
                            success: false,
                            error: error.toString()
                        });
                    };

                    document.head.appendChild(script);
                });
            }''')

            print("Manual injection result:", json.dumps(inject_result, indent=2))

        # Check battle manager status
        print("\n=== Checking Battle Manager ===")
        battle_check = await page.evaluate('''() => {
            const results = {};

            // Check if BattleManager exists
            results.battleManager_defined = typeof BattleManager !== 'undefined';

            // Check if battleManager instance exists
            results.battleManager_instance = typeof battleManager !== 'undefined';

            if (typeof battleManager !== 'undefined') {
                results.socket_retry_timeout = battleManager.socketRetryTimeout !== undefined;
            }

            return results;
        }''')

        print(json.dumps(battle_check, indent=2))

        # Try alternative CDN versions
        print("\n=== Testing Alternative CDN Versions ===")

        cdns = [
            'https://cdn.socket.io/4.5.4/socket.io.min.js',
            'https://cdn.jsdelivr.net/npm/socket.io-client@4.7.2/dist/socket.io.min.js',
            'https://unpkg.com/socket.io-client@4.7.2/dist/socket.io.min.js'
        ]

        for cdn_url in cdns:
            print(f"\nTrying: {cdn_url}")

            test_result = await page.evaluate('''(url) => {
                return new Promise((resolve) => {
                    // Remove existing socket.io if any
                    if (typeof io !== 'undefined') {
                        delete window.io;
                    }

                    const script = document.createElement('script');
                    script.src = url;

                    script.onload = () => {
                        setTimeout(() => {
                            resolve({
                                success: true,
                                io_defined: typeof io !== 'undefined',
                                url: url
                            });
                        }, 500);
                    };

                    script.onerror = () => {
                        resolve({
                            success: false,
                            url: url
                        });
                    };

                    document.head.appendChild(script);
                });
            }''', cdn_url)

            print(f"Result: {test_result}")

            if test_result.get('io_defined'):
                print(f"✅ SUCCESS: {cdn_url} loaded io successfully!")
                break

        # Wait to see console logs
        await page.wait_for_timeout(5000)

        print("\n=== Summary ===")
        print(f"Total console logs: {len(console_logs)}")
        print(f"Total network logs: {len(network_logs)}")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(debug_socketio())