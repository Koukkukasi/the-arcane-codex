"""
Dependency Checker for The Arcane Codex
Verifies all required dependencies are installed with correct versions
"""

import sys
import subprocess
from typing import Dict, List, Tuple

# Required dependencies with minimum versions
REQUIRED_DEPS = {
    'flask': '3.0.0',
    'flask-cors': '4.0.0',
    'flask-socketio': '5.3.0',
    'anthropic': '0.34.0',
    'discord.py': '2.3.0',
    'python-dotenv': '1.0.0',
    'psutil': '5.9.0',
    'mcp': '0.9.0',
    'eventlet': '0.33.0'
}

# Optional dependencies
OPTIONAL_DEPS = {
    'pytest': '7.4.0',
    'pylint': '3.0.0',
    'black': '23.12.0'
}

def check_python_version() -> Tuple[bool, str]:
    """Check if Python version is 3.8 or higher"""
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        return False, f"Python {version.major}.{version.minor} (requires 3.8+)"
    return True, f"Python {version.major}.{version.minor}.{version.micro}"

def get_installed_version(package_name: str) -> str:
    """Get installed version of a package"""
    try:
        # Handle package name variations
        import_name = package_name
        if package_name == 'discord.py':
            import_name = 'discord'
        elif package_name == 'flask-socketio':
            import_name = 'flask_socketio'
        elif package_name == 'flask-cors':
            import_name = 'flask_cors'
        elif package_name == 'python-dotenv':
            import_name = 'dotenv'

        module = __import__(import_name)
        version = getattr(module, '__version__', None)

        if not version:
            # Fallback: try pip show
            result = subprocess.run(
                [sys.executable, '-m', 'pip', 'show', package_name],
                capture_output=True,
                text=True
            )
            for line in result.stdout.split('\n'):
                if line.startswith('Version:'):
                    version = line.split(':', 1)[1].strip()
                    break

        return version or 'unknown'
    except ImportError:
        return None

def compare_versions(installed: str, required: str) -> bool:
    """Compare version strings"""
    if not installed or installed == 'unknown':
        return False

    try:
        installed_parts = [int(x) for x in installed.split('.')[:3]]
        required_parts = [int(x) for x in required.split('.')[:3]]

        # Pad with zeros if needed
        while len(installed_parts) < 3:
            installed_parts.append(0)
        while len(required_parts) < 3:
            required_parts.append(0)

        return installed_parts >= required_parts
    except (ValueError, AttributeError):
        return False

def check_dependencies() -> Dict[str, Dict]:
    """Check all dependencies"""
    results = {}

    for package, min_version in REQUIRED_DEPS.items():
        installed = get_installed_version(package)

        if installed is None:
            status = 'MISSING'
            message = f'NOT INSTALLED - Run: pip install {package}>={min_version}'
        elif not compare_versions(installed, min_version):
            status = 'OUTDATED'
            message = f'Installed: {installed}, Required: {min_version}+ - Run: pip install --upgrade {package}'
        else:
            status = 'OK'
            message = f'Installed: {installed}'

        results[package] = {
            'status': status,
            'installed': installed,
            'required': min_version,
            'message': message
        }

    return results

def check_optional_dependencies() -> Dict[str, Dict]:
    """Check optional development dependencies"""
    results = {}

    for package, min_version in OPTIONAL_DEPS.items():
        installed = get_installed_version(package)

        if installed is None:
            status = 'NOT_INSTALLED'
            message = f'Optional - Install with: pip install {package}>={min_version}'
        elif not compare_versions(installed, min_version):
            status = 'OUTDATED'
            message = f'Installed: {installed}, Recommended: {min_version}+'
        else:
            status = 'OK'
            message = f'Installed: {installed}'

        results[package] = {
            'status': status,
            'installed': installed,
            'required': min_version,
            'message': message
        }

    return results

def print_results(results: Dict[str, Dict], title: str):
    """Print formatted results"""
    print(f"\n{'='*70}")
    print(f"{title}")
    print(f"{'='*70}\n")

    max_name_len = max(len(name) for name in results.keys())

    for package, info in results.items():
        # Use ASCII-safe symbols for Windows console compatibility
        status_symbol = {
            'OK': '[OK]',
            'MISSING': '[X]',
            'OUTDATED': '[!]',
            'NOT_INSTALLED': '[ ]'
        }.get(info['status'], '[?]')

        print(f"{status_symbol} {package.ljust(max_name_len)}  {info['message']}")

def main():
    """Main dependency checker"""
    print("\n" + "="*70)
    print("THE ARCANE CODEX - DEPENDENCY CHECKER")
    print("="*70)

    # Check Python version
    python_ok, python_version = check_python_version()
    print(f"\nPython Version: {python_version}")
    if not python_ok:
        print("[X] ERROR: Python 3.8+ required!")
        print("  Download from: https://www.python.org/downloads/")
        sys.exit(1)
    print("[OK] Python version OK")

    # Check required dependencies
    required_results = check_dependencies()
    print_results(required_results, "REQUIRED DEPENDENCIES")

    # Check optional dependencies
    optional_results = check_optional_dependencies()
    print_results(optional_results, "OPTIONAL DEVELOPMENT DEPENDENCIES")

    # Summary
    print(f"\n{'='*70}")
    print("SUMMARY")
    print(f"{'='*70}\n")

    missing = [pkg for pkg, info in required_results.items() if info['status'] == 'MISSING']
    outdated = [pkg for pkg, info in required_results.items() if info['status'] == 'OUTDATED']
    ok = [pkg for pkg, info in required_results.items() if info['status'] == 'OK']

    print(f"[OK] OK: {len(ok)}/{len(required_results)}")
    if outdated:
        print(f"[!] Outdated: {len(outdated)} - {', '.join(outdated)}")
    if missing:
        print(f"[X] Missing: {len(missing)} - {', '.join(missing)}")

    # Recommendations
    if missing or outdated:
        print(f"\n{'='*70}")
        print("RECOMMENDATIONS")
        print(f"{'='*70}\n")

        if missing:
            print("Install missing dependencies:")
            print("  pip install -r requirements.txt")
            print("\nOr install individually:")
            for pkg in missing:
                min_ver = required_results[pkg]['required']
                print(f"  pip install {pkg}>={min_ver}")

        if outdated:
            print("\nUpdate outdated dependencies:")
            for pkg in outdated:
                print(f"  pip install --upgrade {pkg}")

    # Exit status
    print(f"\n{'='*70}\n")
    if missing:
        print("[!] CRITICAL: Missing required dependencies. Install them to run the game.")
        sys.exit(1)
    elif outdated:
        print("[!] WARNING: Some dependencies are outdated. Consider updating.")
        sys.exit(0)
    else:
        print("[OK] SUCCESS: All required dependencies are installed and up-to-date!")
        print("\nYou're ready to run The Arcane Codex!")
        print("  python web_game.py")
        sys.exit(0)

if __name__ == '__main__':
    main()
