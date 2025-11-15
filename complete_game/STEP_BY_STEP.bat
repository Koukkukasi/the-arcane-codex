@echo off
echo ╔═══════════════════════════════════════════════════════════╗
echo ║         THE ARCANE CODEX - INSTALLATION WIZARD            ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.

echo Step 1: Installing dependencies...
echo.
pip install -r requirements.txt
echo.

echo Step 2: Verifying setup...
echo.
python verify_setup.py
echo.

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ╔═══════════════════════════════════════════════════════════╗
    echo ║                   ✅ READY TO GO!                         ║
    echo ╚═══════════════════════════════════════════════════════════╝
    echo.
    echo Next: Create your Discord bot!
    echo.
    echo 1. Open: https://discord.com/developers/applications
    echo 2. Create New Application
    echo 3. Go to Bot section and Add Bot
    echo 4. Copy the TOKEN
    echo 5. Enable "Message Content Intent"
    echo 6. Run: python discord_bot.py YOUR_TOKEN
    echo.
    echo See DISCORD_SETUP.md for detailed step-by-step!
    echo.
) else (
    echo.
    echo ❌ Installation failed. Please check errors above.
    echo.
)

pause
