@echo off
echo ╔═══════════════════════════════════════════════════════════╗
echo ║         THE ARCANE CODEX - BOT LAUNCHER                   ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.
echo This script will start your Discord bot.
echo.
echo ⚠️  YOU NEED YOUR BOT TOKEN!
echo.
echo If you don't have it:
echo 1. Go to: https://discord.com/developers/applications
echo 2. Click on "The Arcane Codex"
echo 3. Click "Bot" in sidebar
echo 4. Click "Reset Token" and copy it
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

set /p TOKEN="Paste your bot token here and press Enter: "

if "%TOKEN%"=="" (
    echo.
    echo ❌ No token provided! Exiting...
    pause
    exit /b 1
)

echo.
echo ✅ Token received! Starting bot...
echo.

set DISCORD_BOT_TOKEN=%TOKEN%
python discord_bot.py

pause
