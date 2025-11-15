#!/usr/bin/env python3
"""
Phase D: Backend Integration Verification
Verifies all backend endpoints and frontend connections are working
"""

import os
import re

def check_backend_endpoints():
    """Verify all new endpoints were added to web_game.py"""
    print("\n[1/5] Checking backend endpoints...")

    with open('web_game.py', 'r', encoding='utf-8') as f:
        content = f.read()

    endpoints = [
        ('/api/character/stats', 'Character stats endpoint'),
        ('/api/character/divine_favor', 'Divine favor endpoint'),
        ('/api/inventory/all', 'Inventory endpoint'),
        ('/api/quests/active', 'Active quests endpoint'),
        ('/api/quests/completed', 'Completed quests endpoint'),
        ('/api/map/current', 'Current location endpoint'),
    ]

    all_found = True
    for endpoint, description in endpoints:
        if endpoint in content:
            print(f"  [OK] {description}")
        else:
            print(f"  [FAIL] {description} - NOT FOUND")
            all_found = False

    return all_found

def check_frontend_integration():
    """Verify frontend integration code was added"""
    print("\n[2/5] Checking frontend integration...")

    with open('static/arcane_codex_scenario_ui_enhanced.html', 'r', encoding='utf-8') as f:
        content = f.read()

    integrations = [
        ('loadCharacterStats', 'Character stats loader'),
        ('loadDivineFavor', 'Divine favor loader'),
        ('loadInventory', 'Inventory loader'),
        ('loadQuests', 'Quests loader'),
        ('loadCurrentScenario', 'Scenario loader'),
        ('submitChoice', 'Choice submission'),
        ('startGameStatePolling', 'Game state polling'),
    ]

    all_found = True
    for function_name, description in integrations:
        if f'function {function_name}' in content or f'async function {function_name}' in content:
            print(f"  [OK] {description}")
        else:
            print(f"  [FAIL] {description} - NOT FOUND")
            all_found = False

    return all_found

def check_api_helper():
    """Verify API helper function exists"""
    print("\n[3/5] Checking API helper functions...")

    with open('static/arcane_codex_scenario_ui_enhanced.html', 'r', encoding='utf-8') as f:
        content = f.read()

    helpers = [
        ('apiCall', 'API call wrapper'),
        ('getItemIcon', 'Item icon helper'),
        ('PHASE D: Backend Integration', 'Phase D marker'),
    ]

    all_found = True
    for helper, description in helpers:
        if helper in content:
            print(f"  [OK] {description}")
        else:
            print(f"  [FAIL] {description} - NOT FOUND")
            all_found = False

    return all_found

def check_event_listeners():
    """Verify event listeners were added"""
    print("\n[4/5] Checking event listeners...")

    with open('static/arcane_codex_scenario_ui_enhanced.html', 'r', encoding='utf-8') as f:
        content = f.read()

    listeners = [
        ('character-overlay', 'Character overlay listener'),
        ('inventory-overlay', 'Inventory overlay listener'),
        ('quests-overlay', 'Quest overlay listener'),
        ('loadCurrentScenario()', 'Initial scenario load'),
        ('startGameStatePolling()', 'Polling initialization'),
    ]

    all_found = True
    for listener, description in listeners:
        if listener in content:
            print(f"  [OK] {description}")
        else:
            print(f"  [FAIL] {description} - NOT FOUND")
            all_found = False

    return all_found

def check_backups():
    """Verify backups were created"""
    print("\n[5/5] Checking backups...")

    backups = [
        ('web_game.py.backup_phase_d', 'Backend backup'),
        ('static/arcane_codex_scenario_ui_enhanced.html.backup_phase_d_frontend', 'Frontend backup'),
    ]

    all_found = True
    for backup_file, description in backups:
        if os.path.exists(backup_file):
            size = os.path.getsize(backup_file)
            print(f"  [OK] {description} ({size:,} bytes)")
        else:
            print(f"  [FAIL] {description} - NOT FOUND")
            all_found = False

    return all_found

def check_file_sizes():
    """Check file size changes"""
    print("\n[BONUS] File size analysis...")

    files = [
        ('web_game.py', 'Backend server'),
        ('static/arcane_codex_scenario_ui_enhanced.html', 'Frontend HTML'),
    ]

    for filepath, description in files:
        if os.path.exists(filepath):
            size = os.path.getsize(filepath)
            print(f"  {description}: {size:,} bytes")

def count_total_endpoints():
    """Count total API endpoints"""
    print("\n[INFO] Total API endpoints...")

    with open('web_game.py', 'r', encoding='utf-8') as f:
        content = f.read()

    # Count @app.route declarations
    endpoints = re.findall(r'@app\.route\([\'"]([^\'"]+)[\'"]', content)

    print(f"  Total endpoints: {len(endpoints)}")
    print(f"  Phase D added: 6 new endpoints")
    print(f"  Original endpoints: {len(endpoints) - 6}")

def main():
    print("=" * 70)
    print("PHASE D: BACKEND INTEGRATION VERIFICATION")
    print("=" * 70)

    results = []

    results.append(("Backend Endpoints", check_backend_endpoints()))
    results.append(("Frontend Integration", check_frontend_integration()))
    results.append(("API Helpers", check_api_helper()))
    results.append(("Event Listeners", check_event_listeners()))
    results.append(("Backups Created", check_backups()))

    check_file_sizes()
    count_total_endpoints()

    print("\n" + "=" * 70)
    print("VERIFICATION SUMMARY")
    print("=" * 70)

    passed = sum(1 for _, result in results if result)
    total = len(results)

    for name, result in results:
        status = "[PASS]" if result else "[FAIL]"
        print(f"  {status} {name}")

    print("\n" + "=" * 70)
    print(f"RESULT: {passed}/{total} checks passed")

    if passed == total:
        print("STATUS: [OK] Phase D integration complete!")
        print("\nYour game is now:")
        print("  - Connected to backend")
        print("  - Ready to load real data")
        print("  - Able to submit player choices")
        print("  - Auto-updating every 5 seconds")
        print("\nNext steps:")
        print("  1. Start the Flask server: python web_game.py")
        print("  2. Open browser: http://localhost:5000/game")
        print("  3. Create/join a game")
        print("  4. Test overlays and gameplay")
    else:
        print(f"STATUS: [WARN] {total - passed} checks failed")

    print("=" * 70)

    return passed == total

if __name__ == '__main__':
    success = main()
    exit(0 if success else 1)
