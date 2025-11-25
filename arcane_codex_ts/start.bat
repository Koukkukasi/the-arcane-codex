@echo off
REM =====================================================
REM Arcane Codex - Quick Start Script (Windows)
REM =====================================================

echo.
echo ========================================
echo   Arcane Codex - Starting Server
echo ========================================
echo.

REM Check if Docker is running
echo [1/5] Checking Docker Desktop...
docker ps >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker Desktop is not running!
    echo Please start Docker Desktop and try again.
    echo.
    pause
    exit /b 1
)
echo [OK] Docker is running

REM Start database containers
echo.
echo [2/5] Starting database containers...
docker-compose up -d
if errorlevel 1 (
    echo [ERROR] Failed to start containers
    pause
    exit /b 1
)

REM Wait for database to be ready
echo.
echo [3/5] Waiting for PostgreSQL to be ready...
timeout /t 10 /nobreak >nul
docker-compose exec -T db pg_isready -U postgres >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Database might still be initializing...
    echo Waiting 10 more seconds...
    timeout /t 10 /nobreak >nul
)
echo [OK] Database is ready

REM Run migrations
echo.
echo [4/5] Running database migrations...
call npm run migrate
if errorlevel 1 (
    echo [WARNING] Migrations failed or already applied
)

REM Start development server
echo.
echo [5/5] Starting development server...
echo.
echo ========================================
echo   Server starting on http://localhost:3000
echo   Press Ctrl+C to stop
echo ========================================
echo.
call npm run dev
