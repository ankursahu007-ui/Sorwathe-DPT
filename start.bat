@echo off
title Sorwathe DPT
color 0A
chcp 65001 >nul

echo.
echo   ==========================================
echo    SORWATHE DAILY PRODUCTION TRACKER
echo   ==========================================
echo.

:: ── Find Python ──────────────────────────────
set PYTHON=
python --version >nul 2>&1
if %errorlevel%==0 ( set PYTHON=python & goto :found )
py --version >nul 2>&1
if %errorlevel%==0 ( set PYTHON=py & goto :found )

echo   ERROR: Python is not installed.
echo.
echo   Please install Python from:
echo     https://www.python.org/downloads/
echo.
echo   During installation, tick the box that says
echo   "Add Python to PATH", then run this file again.
echo.
pause
exit /b 1

:found
:: ── Get local IP address ─────────────────────
set LOCAL_IP=
for /f "tokens=2 delims=:" %%A in ('ipconfig ^| findstr /c:"IPv4 Address"') do (
    for /f "tokens=1" %%B in ("%%A") do (
        if not defined LOCAL_IP set LOCAL_IP=%%B
    )
)

echo   Starting local server on port 8080...
echo.
echo   ┌──────────────────────────────────────────┐
echo   │                                          │
echo   │  On this computer:                       │
echo   │    http://localhost:8080                 │
echo   │                                          │
if defined LOCAL_IP (
echo   │  On your phone / tablet (same WiFi):     │
echo   │    http://%LOCAL_IP%:8080         │
echo   │                                          │
)
echo   │  To install on phone: open the link in   │
echo   │  Chrome, tap the menu (3 dots), then     │
echo   │  tap "Add to Home Screen"                │
echo   │                                          │
echo   └──────────────────────────────────────────┘
echo.
echo   Press Ctrl+C to stop the server.
echo.

:: Open browser after a short delay
start "" cmd /c "timeout /t 2 /nobreak >nul && start http://localhost:8080"

:: Change to the folder where this file lives, then start server
cd /d "%~dp0"
%PYTHON% -m http.server 8080

pause
