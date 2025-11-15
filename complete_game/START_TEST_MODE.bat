@echo off
echo ================================
echo  ARCANE CODEX - TEST MODE
echo ================================
echo.
echo  TEST MODE ENABLED
echo  - Uses mock interrogation questions
echo  - No MCP required for testing
echo  - Full end-to-end gameplay available
echo.
echo Starting server with TEST_MODE enabled...
echo.

set ARCANE_TEST_MODE=1
python web_game.py

pause
