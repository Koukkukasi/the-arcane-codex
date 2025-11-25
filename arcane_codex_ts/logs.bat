@echo off
REM =====================================================
REM Arcane Codex - View Docker Logs (Windows)
REM =====================================================

echo.
echo ========================================
echo   Arcane Codex - Docker Logs
echo ========================================
echo.

REM Check which service to view
if "%1"=="" (
    echo Viewing logs for all services...
    echo.
    docker-compose logs -f
) else (
    echo Viewing logs for service: %1
    echo.
    docker-compose logs -f %1
)

pause
