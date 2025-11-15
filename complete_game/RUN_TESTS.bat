@echo off
REM ============================================================================
REM The Arcane Codex - Run Playwright Tests
REM ============================================================================

echo.
echo ===============================================================
echo     THE ARCANE CODEX - Playwright Test Suite
echo ===============================================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js not found!
    echo Please install Node.js from nodejs.org
    pause
    exit /b 1
)

REM Install Playwright if needed
if not exist "node_modules\" (
    echo Installing Playwright...
    call npm install
    call npm run install-playwright
    echo.
)

echo Running tests...
echo.
echo IMPORTANT: Make sure Claude Desktop is running!
echo.

REM Run tests
call npx playwright test

echo.
echo ===============================================================
echo Test complete! View report with: npm run test:report
echo ===============================================================
pause
