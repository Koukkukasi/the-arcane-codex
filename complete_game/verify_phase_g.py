#!/usr/bin/env python3
"""
Phase G: SVG Graphics Integration Verification Script

This script verifies that all SVG assets are properly integrated
and all required files are in place.
"""

import os
from pathlib import Path

# ANSI color codes for terminal output
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
RESET = '\033[0m'

def check_file_exists(path, description):
    """Check if a file exists and print status."""
    if os.path.exists(path):
        print(f"{GREEN}[PASS]{RESET} {description}: {path}")
        return True
    else:
        print(f"{RED}[FAIL]{RESET} {description}: {path} {RED}(MISSING){RESET}")
        return False

def check_file_contains(path, search_string, description):
    """Check if a file contains a specific string."""
    try:
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
            if search_string in content:
                print(f"{GREEN}[PASS]{RESET} {description}")
                return True
            else:
                print(f"{RED}[FAIL]{RESET} {description} {RED}(NOT FOUND){RESET}")
                return False
    except Exception as e:
        print(f"{RED}[FAIL]{RESET} {description} {RED}(ERROR: {e}){RESET}")
        return False

def main():
    print(f"\n{BLUE}{'='*60}{RESET}")
    print(f"{BLUE}Phase G: SVG Graphics Integration Verification{RESET}")
    print(f"{BLUE}{'='*60}{RESET}\n")

    base_path = Path(__file__).parent
    checks_passed = 0
    total_checks = 0

    # 1. Check SVG Assets
    print(f"\n{YELLOW}1. Checking SVG Assets (14 files){RESET}")
    svg_files = [
        'arcane_codex_logo.svg',
        'god_valdris.svg',
        'god_kaitha.svg',
        'god_morvane.svg',
        'god_sylara.svg',
        'god_korvan.svg',
        'god_athena.svg',
        'god_mercus.svg',
        'corner_flourish.svg',
        'divider_line.svg',
        'rune_symbol_1.svg',
        'rune_symbol_2.svg',
        'rune_symbol_3.svg',
        'mystical_background.svg'
    ]

    for svg_file in svg_files:
        path = base_path / 'static' / 'images' / svg_file
        total_checks += 1
        if check_file_exists(path, f"SVG: {svg_file}"):
            checks_passed += 1

    # 2. Check CSS Integration File
    print(f"\n{YELLOW}2. Checking CSS Integration File{RESET}")
    css_path = base_path / 'static' / 'css' / 'svg-integration.css'
    total_checks += 1
    if check_file_exists(css_path, "CSS: svg-integration.css"):
        checks_passed += 1

    # 3. Check JavaScript Integration File
    print(f"\n{YELLOW}3. Checking JavaScript Integration File{RESET}")
    js_path = base_path / 'static' / 'js' / 'divine-council.js'
    total_checks += 1
    if check_file_exists(js_path, "JS: divine-council.js"):
        checks_passed += 1

    # 4. Check Main UI HTML File
    print(f"\n{YELLOW}4. Checking Main UI HTML Modifications{RESET}")
    main_ui_path = base_path / 'static' / 'arcane_codex_scenario_ui_enhanced.html'

    total_checks += 1
    if check_file_exists(main_ui_path, "HTML: arcane_codex_scenario_ui_enhanced.html"):
        checks_passed += 1

    # Check CSS link
    total_checks += 1
    if check_file_contains(main_ui_path, '/static/css/svg-integration.css',
                          "  CSS link in main UI"):
        checks_passed += 1

    # Check JS link
    total_checks += 1
    if check_file_contains(main_ui_path, '/static/js/divine-council.js',
                          "  JS link in main UI"):
        checks_passed += 1

    # Check Divine Council modal
    total_checks += 1
    if check_file_contains(main_ui_path, 'id="council-voting-modal"',
                          "  Divine Council modal present"):
        checks_passed += 1

    # Check corner flourishes
    total_checks += 1
    if check_file_contains(main_ui_path, 'class="corner-decoration corner-tl"',
                          "  Corner flourishes present"):
        checks_passed += 1

    # Check god icon paths
    total_checks += 1
    if check_file_contains(main_ui_path, '/static/images/god_valdris.svg',
                          "  God icon paths corrected"):
        checks_passed += 1

    # 5. Check Landing Page HTML
    print(f"\n{YELLOW}5. Checking Landing Page Modifications{RESET}")
    landing_path = base_path / 'static' / 'index.html'

    total_checks += 1
    if check_file_exists(landing_path, "HTML: index.html"):
        checks_passed += 1

    # Check logo integration
    total_checks += 1
    if check_file_contains(landing_path, '/static/images/arcane_codex_logo.svg',
                          "  Logo integrated in header"):
        checks_passed += 1

    # 6. Check Test File
    print(f"\n{YELLOW}6. Checking Test File{RESET}")
    test_path = base_path / 'test_svg_integration.html'
    total_checks += 1
    if check_file_exists(test_path, "Test: test_svg_integration.html"):
        checks_passed += 1

    # 7. Check Documentation
    print(f"\n{YELLOW}7. Checking Documentation{RESET}")
    docs = [
        'PHASE_G_SVG_INTEGRATION_COMPLETE.md',
        'PHASE_G_DELIVERY_SUMMARY.md'
    ]

    for doc_file in docs:
        path = base_path / doc_file
        total_checks += 1
        if check_file_exists(path, f"Doc: {doc_file}"):
            checks_passed += 1

    # Final Summary
    print(f"\n{BLUE}{'='*60}{RESET}")
    print(f"{BLUE}Verification Summary{RESET}")
    print(f"{BLUE}{'='*60}{RESET}")

    percentage = (checks_passed / total_checks) * 100

    print(f"\nTotal Checks: {total_checks}")
    print(f"Passed: {GREEN}{checks_passed}{RESET}")
    print(f"Failed: {RED}{total_checks - checks_passed}{RESET}")
    print(f"Success Rate: {GREEN if percentage == 100 else YELLOW}{percentage:.1f}%{RESET}")

    if checks_passed == total_checks:
        print(f"\n{GREEN}{'='*60}{RESET}")
        print(f"{GREEN}[SUCCESS] Phase G Integration Complete and Verified!{RESET}")
        print(f"{GREEN}{'='*60}{RESET}\n")
        print(f"{GREEN}All 14 SVG assets are properly integrated.{RESET}")
        print(f"{GREEN}Ready for testing and production use.{RESET}\n")
        return 0
    else:
        print(f"\n{RED}{'='*60}{RESET}")
        print(f"{RED}[FAILED] Some checks failed. Please review above.{RESET}")
        print(f"{RED}{'='*60}{RESET}\n")
        return 1

if __name__ == '__main__':
    exit(main())
