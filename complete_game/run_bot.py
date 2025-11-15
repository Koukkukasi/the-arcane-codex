"""
Simple bot launcher
Loads Discord bot token from environment variable for security
"""
import sys
import os

# Get token from environment variable
TOKEN = os.getenv('DISCORD_BOT_TOKEN')

if not TOKEN:
    print("===============================================================")
    print("         THE ARCANE CODEX - BOT LAUNCHER")
    print("===============================================================")
    print()
    print("ERROR: DISCORD_BOT_TOKEN environment variable not set")
    print()
    print("To fix this:")
    print("  1. Create a .env file with: DISCORD_BOT_TOKEN=your_token_here")
    print("  2. Or set it in your shell:")
    print("     - Windows: set DISCORD_BOT_TOKEN=your_token_here")
    print("     - Linux/Mac: export DISCORD_BOT_TOKEN=your_token_here")
    print()
    print("===============================================================")
    sys.exit(1)

print("===============================================================")
print("         THE ARCANE CODEX - BOT LAUNCHER")
print("===============================================================")
print()
print("Starting bot...")
print()

# Import the bot module
from discord_bot import run_bot

# Run the bot with the token
run_bot(TOKEN)
