@echo off
title Sorwathe DPT Desktop
cd /d "%~dp0"
color 0A

echo.
echo  ==========================================
echo   SORWATHE DPT — Desktop App
echo  ==========================================
echo.

:: Check Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo  ERROR: Node.js is not installed.
    echo  Download from: https://nodejs.org
    pause
    exit /b 1
)

:: Install Electron on first run (needs internet, ~120 MB, one-time only)
if not exist "node_modules\electron" (
    echo  First-time setup: downloading desktop components...
    echo  This takes 1-3 minutes and only happens once.
    echo.
    npm install --save-dev electron@33 --prefer-offline 2>nul
    npm install --save-dev electron@33
    if %errorlevel% neq 0 (
        echo.
        echo  ERROR: Could not install Electron.
        echo  Make sure you are connected to the internet
        echo  and try again.
        pause
        exit /b 1
    )
    echo.
    echo  Setup complete!
    echo.
)

echo  Opening Sorwathe DPT desktop window...
echo  (Close this window to quit the app.)
echo.

:: Launch the desktop app
.\node_modules\.bin\electron.cmd .

pause
