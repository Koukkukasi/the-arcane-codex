@echo off
echo ===============================================================
echo          THE ARCANE CODEX - Game Server Launcher
echo ===============================================================
echo.
echo Starting Flask web server...
echo.
echo Access game at:
echo   Desktop: http://localhost:5000
echo   Mobile:  http://YOUR-IP:5000
echo.
echo Press Ctrl+C to stop server
echo ===============================================================
echo.

cd /d "%~dp0"
python web_game.py

pause
