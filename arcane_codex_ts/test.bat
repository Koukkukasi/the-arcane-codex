@echo off
REM =====================================================
REM Arcane Codex - Run Tests (Windows)
REM =====================================================

echo.
echo ========================================
echo   Arcane Codex - Running Tests
echo ========================================
echo.

REM Check if database is running
docker-compose ps db | findstr "Up" >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Database container is not running!
    echo Starting database containers...
    docker-compose up -d db redis
    timeout /t 5 /nobreak >nul
)

REM Run tests based on parameter
if "%1"=="database" (
    echo Running database tests...
    call npm run test:database
) else if "%1"=="api" (
    echo Running API tests...
    call npm run test:api
) else if "%1"=="e2e" (
    echo Running E2E tests...
    call npm run test:e2e
) else if "%1"=="ui" (
    echo Running UI tests...
    call npm run test:ui-tests
) else (
    echo Running all tests...
    call npm test
)

echo.
echo [OK] Tests completed
echo.
pause
