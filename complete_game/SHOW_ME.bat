@echo off
echo Killing all Python processes...
taskkill /F /IM python.exe /T 2>nul

timeout /t 2 /nobreak >nul

echo Starting fresh Flask server...
cd "C:\Users\ilmiv\ProjectArgent\complete_game"
start /B python web_game.py

timeout /t 3 /nobreak >nul

echo Opening browser to show you the changes...
start http://localhost:5000

echo.
echo Browser should open in 3 seconds showing ENHANCED CRT effects!
echo If you still see old version, press Ctrl+F5 to hard refresh.
echo.
pause
