@echo off
REM =====================================================
REM Arcane Codex - Stop Script (Windows)
REM =====================================================

echo.
echo ========================================
echo   Stopping Arcane Codex Server
echo ========================================
echo.

REM Stop Docker containers
echo Stopping database containers...
docker-compose down

echo.
echo [OK] All services stopped
echo.
pause
