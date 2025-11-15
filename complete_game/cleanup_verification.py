#!/usr/bin/env python3
"""
Phase C Cleanup Verification Script
Verifies all cleanup tasks were completed successfully
"""

import os
import subprocess

def run_command(cmd):
    """Run shell command and return output"""
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True, cwd=os.getcwd())
        return result.stdout + result.stderr
    except Exception as e:
        return f"Error: {str(e)}"

def check_backup_files_removed():
    """Verify backup files were removed"""
    print("\n[1/8] Checking backup files removed...")

    output = run_command("find . -name '*.backup' -o -name '*.bak' -o -name '*_backup.html' | grep -v archive | grep -v node_modules")

    if not output.strip():
        print("  [OK] No backup files found in main codebase")
        return True
    else:
        print(f"  [FAIL] Found backup files: {output.strip()}")
        return False

def check_intermediate_files_removed():
    """Verify intermediate files were removed"""
    print("\n[2/8] Checking intermediate files removed...")

    patterns = ['_pre_', '_integrated', 'temp_integrated', '_visual']
    found = []

    for pattern in patterns:
        output = run_command(f"find ./static -name '*{pattern}*' -type f | grep -v archive | grep -v node_modules")
        if output.strip():
            found.append(output.strip())

    if not found:
        print("  [OK] No intermediate files found in static/")
        return True
    else:
        print(f"  [FAIL] Found intermediate files: {', '.join(found)}")
        return False

def check_tests_organized():
    """Verify test files are organized in /tests directory"""
    print("\n[3/8] Checking test files organized...")

    tests_count = run_command("ls tests/ 2>/dev/null | wc -l").strip()
    root_tests = run_command("ls test_*.py test_*.js test_*.html 2>/dev/null | wc -l").strip()

    try:
        tests_count = int(tests_count)
        root_tests = int(root_tests)
    except:
        tests_count = 0
        root_tests = 0

    if tests_count >= 40 and root_tests == 0:
        print(f"  [OK] {tests_count} test files in tests/ directory")
        print(f"  [OK] No test files in root directory")
        return True
    else:
        print(f"  [WARN] {tests_count} files in tests/, {root_tests} test files still in root")
        return False

def check_flask_apps_archived():
    """Verify Flask apps are archived"""
    print("\n[4/8] Checking Flask apps archived...")

    app_in_root = os.path.exists('app.py')
    app_prod_in_root = os.path.exists('app_production.py')
    app_in_archive = os.path.exists('archive/app.py')
    app_prod_in_archive = os.path.exists('archive/app_production.py')

    if not app_in_root and not app_prod_in_root and app_in_archive and app_prod_in_archive:
        print("  [OK] app.py and app_production.py archived")
        return True
    else:
        print(f"  [FAIL] app.py in root: {app_in_root}, in archive: {app_in_archive}")
        print(f"  [FAIL] app_production.py in root: {app_prod_in_root}, in archive: {app_prod_in_archive}")
        return False

def check_database_module_archived():
    """Verify database_pooled.py is archived"""
    print("\n[5/8] Checking database module archived...")

    db_pooled_in_root = os.path.exists('database_pooled.py')
    db_pooled_in_archive = os.path.exists('archive/database_pooled.py')

    if not db_pooled_in_root and db_pooled_in_archive:
        print("  [OK] database_pooled.py archived")
        return True
    else:
        print(f"  [FAIL] database_pooled.py in root: {db_pooled_in_root}, in archive: {db_pooled_in_archive}")
        return False

def check_dependencies_updated():
    """Verify dependencies were updated"""
    print("\n[6/8] Checking dependencies updated...")

    with open('requirements.txt', 'r') as f:
        requirements = f.read()

    checks = [
        ('Flask==3.1.2', 'Flask==3.1.2' in requirements),
        ('psutil==7.1.3', 'psutil==7.1.3' in requirements),
        ('eventlet==0.40.3', 'eventlet==0.40.3' in requirements),
        ('flask-cors==6.0.1', 'flask-cors==6.0.1' in requirements),
        ('Flask-WTF==1.2.2', 'Flask-WTF==1.2.2' in requirements),
    ]

    all_passed = all(check[1] for check in checks)

    for package, passed in checks:
        status = "[OK]" if passed else "[FAIL]"
        print(f"  {status} {package}")

    return all_passed

def check_archive_directory():
    """Verify archive directory exists with README"""
    print("\n[7/8] Checking archive directory...")

    archive_exists = os.path.exists('archive')
    readme_exists = os.path.exists('archive/README.md')

    if archive_exists and readme_exists:
        print("  [OK] archive/ directory exists with README.md")
        return True
    else:
        print(f"  [FAIL] archive/ exists: {archive_exists}, README.md exists: {readme_exists}")
        return False

def check_git_status():
    """Check git status"""
    print("\n[8/8] Checking git status...")

    status = run_command("git status --short")

    if status.strip():
        modified_count = len([line for line in status.split('\n') if line.strip()])
        print(f"  [INFO] {modified_count} files modified/staged")
        print(f"  [INFO] Ready to commit Phase C changes")
        return True
    else:
        print("  [INFO] No changes to commit")
        return True

def main():
    print("=" * 70)
    print("ARCANE CODEX - PHASE C CLEANUP VERIFICATION")
    print("=" * 70)

    results = []

    results.append(("Backup Files Removed", check_backup_files_removed()))
    results.append(("Intermediate Files Removed", check_intermediate_files_removed()))
    results.append(("Test Files Organized", check_tests_organized()))
    results.append(("Flask Apps Archived", check_flask_apps_archived()))
    results.append(("Database Module Archived", check_database_module_archived()))
    results.append(("Dependencies Updated", check_dependencies_updated()))
    results.append(("Archive Directory", check_archive_directory()))
    results.append(("Git Status", check_git_status()))

    print("\n" + "=" * 70)
    print("CLEANUP VERIFICATION SUMMARY")
    print("=" * 70)

    passed = sum(1 for _, result in results if result)
    total = len(results)

    for name, result in results:
        status = "[PASS]" if result else "[FAIL]"
        print(f"  {status} {name}")

    print("\n" + "=" * 70)
    print(f"RESULT: {passed}/{total} checks passed")

    if passed == total:
        print("STATUS: [OK] All cleanup tasks verified!")
    else:
        print(f"STATUS: [WARN] {total - passed} checks failed")

    print("=" * 70)

    return passed == total

if __name__ == '__main__':
    success = main()
    exit(0 if success else 1)
