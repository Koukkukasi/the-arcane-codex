"""
Setup and Run Playwright Tests for The Arcane Codex
Automated installation and test execution
"""

import subprocess
import sys
import os
import time
import json

def print_header(text):
    """Print formatted header"""
    print("\n" + "="*60)
    print(f"  {text}")
    print("="*60)

def install_playwright():
    """Install Playwright and browsers"""
    print_header("Installing Playwright")

    try:
        # Install playwright package
        print("\n1. Installing Playwright package...")
        subprocess.run([sys.executable, "-m", "pip", "install", "playwright"],
                      check=True, capture_output=True)
        print("   [OK] Playwright package installed")

        # Install browsers
        print("\n2. Installing browsers (Chrome, Firefox, WebKit)...")
        print("   This may take a few minutes on first run...")
        subprocess.run([sys.executable, "-m", "playwright", "install"],
                      check=True)
        print("   [OK] Browsers installed")

        # Install dependencies (for Linux)
        if sys.platform.startswith('linux'):
            print("\n3. Installing system dependencies...")
            subprocess.run([sys.executable, "-m", "playwright", "install-deps"],
                          check=True)
            print("   [OK] System dependencies installed")

        return True

    except subprocess.CalledProcessError as e:
        print(f"\n[ERROR] Installation failed: {e}")
        print("\n  Manual installation steps:")
        print("  1. pip install playwright")
        print("  2. playwright install")
        print("  3. playwright install-deps (Linux only)")
        return False
    except Exception as e:
        print(f"\n[ERROR] Unexpected error: {e}")
        return False

def check_playwright_installed():
    """Check if Playwright is already installed"""
    try:
        import playwright
        print("[OK] Playwright is already installed")
        return True
    except ImportError:
        print("[WARNING]  Playwright not found, installing...")
        return False

def start_game_server():
    """Start the game server in background"""
    print_header("Starting Game Server")

    try:
        # Start server in background
        print("Starting The Arcane Codex server...")
        server_process = subprocess.Popen(
            [sys.executable, "start_game.py"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )

        # Wait for server to be ready
        print("Waiting for server to start...")
        for i in range(10):
            time.sleep(1)
            print(f"  {i+1}/10...", end="\r")

        print("\n[OK] Server should be running on http://localhost:5000")
        return server_process

    except Exception as e:
        print(f"[ERROR] Failed to start server: {e}")
        print("\nPlease start the server manually:")
        print("  python start_game.py")
        return None

def run_playwright_tests(headless=False):
    """Run the Playwright test suite"""
    print_header("Running Playwright Tests")

    try:
        # Prepare command
        cmd = [sys.executable, "playwright_tests.py"]
        if headless:
            cmd.append("--headless")

        print("Executing Playwright tests...")
        print("This will test:")
        print("  * Main menu navigation")
        print("  * Game creation flow")
        print("  * Joining games")
        print("  * UI elements")
        print("  * Town interactions")
        print("  * Multiplayer simulation")
        print("  * Chat system")
        print("  * Responsive design")
        print("  * End-to-end gameplay")
        print()

        # Run tests
        result = subprocess.run(cmd, capture_output=False, text=True)

        if result.returncode == 0:
            print("\n[OK] All Playwright tests completed!")
        else:
            print("\n[WARNING]  Some tests may have failed")

        return result.returncode == 0

    except FileNotFoundError:
        print("[ERROR] playwright_tests.py not found!")
        print("   Make sure you're in the complete_game directory")
        return False
    except Exception as e:
        print(f"[ERROR] Error running tests: {e}")
        return False

def view_test_results():
    """Display test results from report"""
    try:
        with open('playwright_test_report.json', 'r') as f:
            report = json.load(f)

        print_header("Test Results Summary")
        print(f"\nTimestamp: {report['timestamp']}")
        print(f"Success Rate: {report['success_rate']:.1f}%")
        print(f"Passed: {report['passed']}/{len(report['results'])}")

        print("\nDetailed Results:")
        for result in report['results']:
            status = "[OK]" if result['success'] else "[ERROR]"
            details = f" - {result['details']}" if result.get('details') else ""
            print(f"  {status} {result['name']}{details}")

        if report.get('screenshots'):
            print(f"\nScreenshots captured: {len(report['screenshots'])}")

    except FileNotFoundError:
        print("No test report found. Run tests first.")
    except Exception as e:
        print(f"Error reading report: {e}")

def interactive_menu():
    """Interactive menu for test options"""
    while True:
        print("\n" + "="*60)
        print("  PLAYWRIGHT TEST MENU")
        print("="*60)
        print("\n1. Install Playwright (first time only)")
        print("2. Run tests with browser visible")
        print("3. Run tests headless (no browser window)")
        print("4. View last test results")
        print("5. Start game server only")
        print("6. Exit")
        print()

        choice = input("Select option (1-6): ").strip()

        if choice == "1":
            install_playwright()
        elif choice == "2":
            run_playwright_tests(headless=False)
        elif choice == "3":
            run_playwright_tests(headless=True)
        elif choice == "4":
            view_test_results()
        elif choice == "5":
            start_game_server()
            input("\nPress Enter to stop server...")
        elif choice == "6":
            print("Goodbye!")
            break
        else:
            print("Invalid option, please try again")

def main():
    """Main entry point"""
    print("""
================================================================

         THE ARCANE CODEX - PLAYWRIGHT TEST SETUP

  Automated browser testing for the complete game

================================================================
    """)

    import argparse
    parser = argparse.ArgumentParser(description='Setup and run Playwright tests')
    parser.add_argument('--quick', action='store_true',
                       help='Quick run: install if needed and run tests')
    parser.add_argument('--headless', action='store_true',
                       help='Run tests in headless mode')
    parser.add_argument('--install-only', action='store_true',
                       help='Only install Playwright')
    parser.add_argument('--no-server', action='store_true',
                       help='Skip starting game server')

    args = parser.parse_args()

    if args.quick:
        # Quick mode: install if needed and run tests
        print(">> Quick test mode")

        # Check/install Playwright
        if not check_playwright_installed():
            if not install_playwright():
                sys.exit(1)

        # Start server unless skipped
        server_process = None
        if not args.no_server:
            server_process = start_game_server()

        # Run tests
        success = run_playwright_tests(headless=args.headless)

        # Cleanup
        if server_process:
            print("\nStopping server...")
            server_process.terminate()

        sys.exit(0 if success else 1)

    elif args.install_only:
        # Just install Playwright
        install_playwright()

    else:
        # Interactive mode
        interactive_menu()

if __name__ == "__main__":
    main()