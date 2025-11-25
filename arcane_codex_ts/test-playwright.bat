@echo off
REM =====================================================
REM Arcane Codex - Run Playwright Tests (Windows)
REM =====================================================

echo.
echo ========================================
echo   Arcane Codex - Playwright Tests
echo ========================================
echo.

REM Check if database is running
docker-compose ps db | findstr "Up" >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Database container is not running!
    echo Starting database containers...
    docker-compose up -d db redis
    timeout /t 10 /nobreak >nul
)

REM Run tests based on parameter
if "%1"=="database" (
    echo Running database tests...
    call npx playwright test --project=database-tests
) else if "%1"=="api" (
    echo Running API tests...
    call npx playwright test --project=api-tests
) else if "%1"=="auth" (
    echo Running authentication tests...
    call npx playwright test tests/api/auth.test.ts
) else if "%1"=="ui" (
    echo Running tests in UI mode...
    call npx playwright test --ui
) else if "%1"=="headed" (
    echo Running tests in headed mode...
    call npx playwright test --headed
) else if "%1"=="report" (
    echo Opening test report...
    call npx playwright show-report
) else (
    echo Running all Playwright tests...
    call npx playwright test
)

echo.
if errorlevel 1 (
    echo [FAILED] Some tests failed
) else (
    echo [OK] All tests passed
)

echo.
pause
