@echo off
REM ============================================================================
REM The Arcane Codex - Multiplayer Startup Script
REM Start this to run the 1-4 player web game
REM ============================================================================

echo.
echo ===============================================================
echo     THE ARCANE CODEX - Multiplayer Server
echo ===============================================================
echo.
echo Starting server with:
echo   - Flask + Socket.IO (real-time multiplayer)
echo   - MCP integration (Claude Desktop)
echo   - Sensory whisper system
echo   - 1-4 players per game
echo.
echo REQUIREMENTS:
echo   1. Claude Desktop running
echo   2. MCP configured (see MCP_SETUP.md)
echo   3. Python 3.8+
echo.
echo ===============================================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python not found!
    echo Please install Python 3.8+ from python.org
    pause
    exit /b 1
)

REM Check if virtual environment exists
if not exist "venv\" (
    echo Creating virtual environment...
    python -m venv venv
    echo.
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat
echo.

REM Install dependencies
echo Checking dependencies...
pip install -r requirements.txt --quiet
echo.

REM Start the server
echo Starting multiplayer server...
echo.
echo Open your browser to: http://localhost:5000
echo.
python web_game.py

pause
