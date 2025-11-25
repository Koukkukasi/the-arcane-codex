@echo off
REM =====================================================
REM Arcane Codex - Run Database Migrations (Windows)
REM =====================================================

echo.
echo ========================================
echo   Database Migrations
echo ========================================
echo.

REM Check if database is running
docker-compose ps db | findstr "Up" >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Database container is not running!
    echo Please run start.bat first.
    echo.
    pause
    exit /b 1
)

echo Waiting for database to be ready...
timeout /t 5 /nobreak >nul

echo Running migrations...
call npm run migrate

if errorlevel 1 (
    echo [ERROR] Migration failed!
    pause
    exit /b 1
)

echo.
echo [OK] Migrations completed successfully
echo.
pause
