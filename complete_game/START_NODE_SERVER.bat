@echo off
REM The Arcane Codex - Node.js Server Startup Script
REM This script starts the Node.js backend API server

echo ===================================================================
echo   THE ARCANE CODEX - Node.js Backend Server
echo ===================================================================
echo.

REM Check if Node.js is installed
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed!
    echo.
    echo Please install Node.js from: https://nodejs.org/
    echo Recommended version: 14.0.0 or higher
    echo.
    pause
    exit /b 1
)

REM Display Node.js version
echo [INFO] Checking Node.js version...
node --version
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo [INFO] node_modules not found. Installing dependencies...
    echo.
    call npm install
    if %errorlevel% neq 0 (
        echo.
        echo [ERROR] Failed to install dependencies!
        pause
        exit /b 1
    )
    echo.
    echo [SUCCESS] Dependencies installed successfully!
    echo.
)

REM Check if .env exists
if not exist ".env" (
    echo [WARNING] .env file not found!
    echo Creating .env from .env.node.example...
    echo.
    copy .env.node.example .env
    echo.
    echo [INFO] Please edit .env if you need to change PORT or other settings
    echo.
)

echo [INFO] Starting The Arcane Codex API server...
echo [INFO] Server will be available at: http://localhost:3000
echo [INFO] Press Ctrl+C to stop the server
echo.
echo ===================================================================
echo.

REM Start the server
npm start

pause
