@echo off
echo ╔═══════════════════════════════════════════════════════════╗
echo ║         THE ARCANE CODEX - DISCORD BOT LAUNCHER           ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.

REM Check if bot token is provided
if "%1"=="" (
    echo ERROR: Discord bot token not provided!
    echo.
    echo USAGE:
    echo   run_discord.bat YOUR_BOT_TOKEN
    echo.
    echo OR set environment variable:
    echo   set DISCORD_BOT_TOKEN=YOUR_TOKEN
    echo   run_discord.bat
    echo.
    pause
    exit /b 1
)

echo Starting Discord bot...
echo.
python discord_bot.py %1

pause
