#!/usr/bin/env python3
"""
Security Audit Script
Verifies all Phase A security fixes have been properly implemented
"""

import os
import subprocess
import re

def run_command(cmd):
    """Run shell command and return output"""
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True, cwd=os.getcwd())
        return result.stdout + result.stderr
    except Exception as e:
        return f"Error: {str(e)}"

def check_gitignore():
    """Verify .gitignore includes sensitive files"""
    print("\n[1/8] Checking .gitignore...")

    with open('.gitignore', 'r') as f:
        gitignore = f.read()

    checks = [
        ('.env', '.env' in gitignore),
        ('*.db', '*.db' in gitignore),
        ('*.backup', '*.backup' in gitignore)
    ]

    all_passed = all(check[1] for check in checks)

    for pattern, passed in checks:
        status = "[OK]" if passed else "[FAIL]"
        print(f"  {status} {pattern} in .gitignore")

    return all_passed

def check_git_tracking():
    """Verify sensitive files are not tracked in git"""
    print("\n[2/8] Checking git tracking...")

    env_tracked = run_command("git ls-files | grep -E '\.env$'")
    db_tracked = run_command("git ls-files | grep -E '\.db$'")

    env_ok = not env_tracked.strip()
    db_ok = not db_tracked.strip()

    print(f"  {'[OK]' if env_ok else '[FAIL]'} .env not tracked in git")
    print(f"  {'[OK]' if db_ok else '[FAIL]'} *.db not tracked in git")

    return env_ok and db_ok

def check_flask_cors():
    """Verify flask-cors is updated"""
    print("\n[3/8] Checking flask-cors version...")

    output = run_command("pip show flask-cors")
    version_match = re.search(r'Version: ([\d.]+)', output)

    if version_match:
        version = version_match.group(1)
        is_updated = version >= '6.0.1'
        status = "[OK]" if is_updated else "[FAIL]"
        print(f"  {status} flask-cors version: {version}")
        return is_updated
    else:
        print("  [FAIL] flask-cors not installed")
        return False

def check_xss_fixes():
    """Verify XSS vulnerabilities are fixed"""
    print("\n[4/8] Checking XSS fixes in HTML...")

    with open('static/arcane_codex_scenario_ui_enhanced.html', 'r', encoding='utf-8') as f:
        html = f.read()

    xss_comments = html.count('// XSS Fix:')

    print(f"  {'[OK]' if xss_comments >= 3 else '[FAIL]'} Found {xss_comments}/3 XSS fix comments")

    # Check that dangerous patterns are NOT present
    dangerous_patterns = [
        (r'detailsContent\.innerHTML = `<p>\$\{tooltip\}</p>`', 'Unsafe tooltip innerHTML'),
        (r'errorDiv\.innerHTML = .*error\.message', 'Unsafe error.message innerHTML'),
    ]

    all_safe = True
    for pattern, description in dangerous_patterns:
        if re.search(pattern, html):
            print(f"  [FAIL] Found dangerous pattern: {description}")
            all_safe = False

    if all_safe:
        print(f"  [OK] No dangerous innerHTML patterns found")

    return xss_comments >= 3 and all_safe

def check_csp():
    """Verify Content Security Policy is present"""
    print("\n[5/8] Checking Content Security Policy...")

    with open('static/arcane_codex_scenario_ui_enhanced.html', 'r', encoding='utf-8') as f:
        html = f.read()

    has_csp = 'Content-Security-Policy' in html

    print(f"  {'[OK]' if has_csp else '[FAIL]'} CSP meta tag {'found' if has_csp else 'missing'}")

    return has_csp

def check_csrf_backend():
    """Verify CSRF protection in backend"""
    print("\n[6/8] Checking CSRF backend protection...")

    with open('web_game.py', 'r', encoding='utf-8') as f:
        backend = f.read()

    checks = [
        ('CSRFProtect import', 'from flask_wtf.csrf import CSRFProtect' in backend),
        ('CSRFProtect init', 'csrf = CSRFProtect(app)' in backend),
        ('CSRF token endpoint', '/api/csrf-token' in backend),
    ]

    all_passed = all(check[1] for check in checks)

    for description, passed in checks:
        status = "[OK]" if passed else "[FAIL]"
        print(f"  {status} {description}")

    return all_passed

def check_csrf_frontend():
    """Verify CSRF protection in frontend"""
    print("\n[7/8] Checking CSRF frontend implementation...")

    with open('static/arcane_codex_scenario_ui_enhanced.html', 'r', encoding='utf-8') as f:
        frontend = f.read()

    checks = [
        ('fetchCSRFToken function', 'async function fetchCSRFToken()' in frontend),
        ('fetchWithCSRF helper', 'function fetchWithCSRF(' in frontend),
        ('CSRF token fetch', "fetch('/api/csrf-token')" in frontend),
        ('fetchWithCSRF usage', 'fetchWithCSRF(' in frontend),
    ]

    all_passed = all(check[1] for check in checks)

    for description, passed in checks:
        status = "[OK]" if passed else "[FAIL]"
        print(f"  {status} {description}")

    return all_passed

def check_flask_wtf():
    """Verify Flask-WTF is installed"""
    print("\n[8/8] Checking Flask-WTF installation...")

    output = run_command("pip show Flask-WTF")
    is_installed = 'Name: Flask-WTF' in output

    if is_installed:
        version_match = re.search(r'Version: ([\d.]+)', output)
        version = version_match.group(1) if version_match else 'unknown'
        print(f"  [OK] Flask-WTF version: {version}")
    else:
        print("  [FAIL] Flask-WTF not installed")

    # Check requirements.txt
    with open('requirements.txt', 'r') as f:
        requirements = f.read()

    in_requirements = 'Flask-WTF' in requirements
    print(f"  {'[OK]' if in_requirements else '[FAIL]'} Flask-WTF in requirements.txt")

    return is_installed and in_requirements

def main():
    print("=" * 70)
    print("ARCANE CODEX - SECURITY AUDIT (Phase A)")
    print("=" * 70)

    results = []

    results.append(("Gitignore Protection", check_gitignore()))
    results.append(("Git Tracking Check", check_git_tracking()))
    results.append(("Flask-CORS Update", check_flask_cors()))
    results.append(("XSS Fixes", check_xss_fixes()))
    results.append(("Content Security Policy", check_csp()))
    results.append(("CSRF Backend", check_csrf_backend()))
    results.append(("CSRF Frontend", check_csrf_frontend()))
    results.append(("Flask-WTF Installation", check_flask_wtf()))

    print("\n" + "=" * 70)
    print("SECURITY AUDIT SUMMARY")
    print("=" * 70)

    passed = sum(1 for _, result in results if result)
    total = len(results)

    for name, result in results:
        status = "[PASS]" if result else "[FAIL]"
        print(f"  {status} {name}")

    print("\n" + "=" * 70)
    print(f"RESULT: {passed}/{total} checks passed")

    if passed == total:
        print("STATUS: [OK] All security fixes verified!")
    else:
        print(f"STATUS: [WARN] {total - passed} checks failed")

    print("=" * 70)

    return passed == total

if __name__ == '__main__':
    success = main()
    exit(0 if success else 1)
