@echo off
REM Start the Node.js Backend API Server
REM The Arcane Codex - Fantasy RPG Game

echo.
echo ======================================================================
echo   THE ARCANE CODEX - Starting Backend API Server
echo ======================================================================
echo.

REM Check if node_modules exists
if not exist "node_modules\" (
    echo [ERROR] node_modules not found!
    echo.
    echo Please run: npm install
    echo.
    pause
    exit /b 1
)

REM Check if .env exists
if not exist ".env" (
    echo [WARNING] .env file not found!
    echo.
    echo Creating .env from .env.example...
    copy .env.example .env
    echo.
    echo [NOTE] Please edit .env and configure your environment variables
    echo.
)

REM Start the server in development mode
echo Starting server in development mode...
echo.
npm run dev

pause
