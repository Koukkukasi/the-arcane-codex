@echo off
echo Killing all Python processes...
taskkill /F /IM python.exe 2>nul

echo.
echo Waiting 2 seconds...
timeout /t 2 /nobreak >nul

echo.
echo Starting ONE fresh server...
cd "C:\Users\ilmiv\ProjectArgent\complete_game"
start "Flask Server" python web_game.py

echo.
echo Waiting for server to start...
timeout /t 4 /nobreak >nul

echo.
echo Opening browser in INCOGNITO mode (no cache)...
start chrome --incognito http://localhost:5000

echo.
echo Done! Browser should show ENHANCED CRT effects.
echo.
echo If it doesn't work, the changes aren't in the files.
echo If it DOES work, your regular browser just needs cache cleared.
echo.
pause
