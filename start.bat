@echo off
title Sorwathe DPT
cd /d "%~dp0"

:: Check Node.js is available
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo  ERROR: Node.js is not installed.
    echo.
    echo  Please download and install it from:
    echo    https://nodejs.org
    echo  Choose the LTS version, install with default settings.
    echo  Then double-click this file again.
    echo.
    pause
    exit /b 1
)

:: Open browser after a short delay (server needs a moment to start)
start "" cmd /c "timeout /t 2 /nobreak >nul && start http://localhost:8080"

:: Start the server (this line stays open — Ctrl+C to stop)
node server.js

pause
