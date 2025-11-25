@echo off
REM =====================================================
REM Arcane Codex - Reset Database (Windows)
REM =====================================================

echo.
echo ========================================
echo   WARNING: Database Reset
echo ========================================
echo.
echo This will DELETE ALL DATA and recreate the database!
echo.
set /p CONFIRM="Are you sure? Type 'yes' to continue: "

if not "%CONFIRM%"=="yes" (
    echo.
    echo [CANCELLED] Database reset cancelled
    pause
    exit /b 0
)

echo.
echo [1/4] Stopping containers...
docker-compose down

echo.
echo [2/4] Removing database volume...
docker volume rm arcane_codex_ts_postgres-data 2>nul
if errorlevel 1 (
    echo [WARNING] Volume might not exist or is not named as expected
)

echo.
echo [3/4] Starting fresh containers...
docker-compose up -d db redis

echo.
echo [4/4] Waiting for database and running migrations...
timeout /t 15 /nobreak >nul
call npm run migrate

echo.
echo [OK] Database reset complete
echo.
pause
