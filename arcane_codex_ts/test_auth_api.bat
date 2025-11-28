@echo off
REM Authentication API Manual Testing Script for Windows
REM This script demonstrates how to test all authentication endpoints
REM Requires curl to be installed (included in Windows 10+)

setlocal enabledelayedexpansion

set BASE_URL=http://localhost:5000/api/auth

echo === Authentication API Test Script ===
echo.

REM Generate random username to avoid conflicts
set USERNAME=testuser_%RANDOM%
set PASSWORD=testpass123
set EMAIL=%USERNAME%@test.com

echo 1. Testing Registration
echo POST %BASE_URL%/register
curl -s -X POST "%BASE_URL%/register" ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"%USERNAME%\",\"password\":\"%PASSWORD%\",\"email\":\"%EMAIL%\"}" ^
  > register_response.json

type register_response.json
echo.

REM Note: Extracting JSON in batch files is complex
REM For manual testing, save tokens from the output above
echo.
echo Please copy the accessToken and refreshToken from above
echo Then use them in the following commands:
echo.

echo 2. Testing Get User Info
echo curl -X GET "%BASE_URL%/me" -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
echo.

echo 3. Testing Token Refresh
echo curl -X POST "%BASE_URL%/refresh" -H "Content-Type: application/json" -d "{\"refreshToken\":\"YOUR_REFRESH_TOKEN\"}"
echo.

echo 4. Testing Login
echo curl -X POST "%BASE_URL%/login" -H "Content-Type: application/json" -d "{\"username\":\"%USERNAME%\",\"password\":\"%PASSWORD%\"}"
echo.

echo 5. Testing Logout
echo curl -X POST "%BASE_URL%/logout" -H "Content-Type: application/json" -d "{\"refreshToken\":\"YOUR_REFRESH_TOKEN\"}"
echo.

echo Test user created: %USERNAME%
echo Password: %PASSWORD%
echo.

REM Cleanup
del register_response.json 2>nul

echo === For easier testing, use the PowerShell script or the Playwright tests ===
echo Run: npm test tests/api/auth.spec.ts

endlocal
