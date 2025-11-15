"""
Quick verification script for The Arcane Codex
Checks if everything is ready to run
"""

import sys

print("╔═══════════════════════════════════════════════════════════╗")
print("║         THE ARCANE CODEX - SETUP VERIFICATION             ║")
print("╚═══════════════════════════════════════════════════════════╝")
print()

# Check Python version
print("Checking Python version...")
version = sys.version_info
print(f"Python {version.major}.{version.minor}.{version.micro}")

if version.major < 3 or (version.major == 3 and version.minor < 11):
    print("❌ ERROR: Python 3.11+ required!")
    print("   Please upgrade Python")
    sys.exit(1)
else:
    print("✅ Python version OK")

print()

# Check dependencies
print("Checking dependencies...")

try:
    import discord
    print(f"✅ discord.py {discord.__version__} installed")
except ImportError:
    print("❌ discord.py NOT installed")
    print("   Run: pip install discord.py")
    sys.exit(1)

try:
    import flask
    print(f"✅ Flask {flask.__version__} installed")
except ImportError:
    print("⚠️  Flask NOT installed (optional for web UI)")
    print("   Run: pip install flask flask-cors")

try:
    import flask_cors
    print("✅ flask-cors installed")
except ImportError:
    print("⚠️  flask-cors NOT installed (optional for web UI)")

print()

# Check game files
print("Checking game files...")

import os

files_to_check = [
    ("discord_bot.py", "Discord bot"),
    ("arcane_codex_server.py", "Game engine"),
    ("requirements.txt", "Dependencies list"),
    ("DISCORD_SETUP.md", "Setup guide"),
    ("START_HERE.md", "Quick start guide")
]

all_files_ok = True
for filename, description in files_to_check:
    if os.path.exists(filename):
        print(f"✅ {filename} - {description}")
    else:
        print(f"❌ {filename} - MISSING!")
        all_files_ok = False

print()

if all_files_ok:
    print("╔═══════════════════════════════════════════════════════════╗")
    print("║                ✅ ALL CHECKS PASSED!                      ║")
    print("╚═══════════════════════════════════════════════════════════╝")
    print()
    print("Next steps:")
    print("1. Create Discord bot at: https://discord.com/developers/applications")
    print("2. Copy your bot token")
    print("3. Run: python discord_bot.py YOUR_TOKEN")
    print()
    print("See DISCORD_SETUP.md for detailed instructions!")
else:
    print("❌ SETUP INCOMPLETE")
    print("Some files are missing. Please check installation.")
    sys.exit(1)
