#!/bin/bash

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║         THE ARCANE CODEX - DISCORD BOT LAUNCHER           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Check if bot token is provided
if [ -z "$1" ] && [ -z "$DISCORD_BOT_TOKEN" ]; then
    echo "ERROR: Discord bot token not provided!"
    echo ""
    echo "USAGE:"
    echo "  ./run_discord.sh YOUR_BOT_TOKEN"
    echo ""
    echo "OR set environment variable:"
    echo "  export DISCORD_BOT_TOKEN=YOUR_TOKEN"
    echo "  ./run_discord.sh"
    echo ""
    exit 1
fi

echo "Starting Discord bot..."
echo ""

if [ -z "$1" ]; then
    python3 discord_bot.py
else
    python3 discord_bot.py "$1"
fi
