@echo off
title Sorwathe DPT — Update
cd /d "%~dp0"
color 0A

echo.
echo  ==========================================
echo   SORWATHE DPT — Checking for Updates
echo  ==========================================
echo.

:: Check internet
ping -n 1 github.com >nul 2>&1
if %errorlevel% neq 0 (
    echo  ERROR: No internet connection.
    echo  Please connect to the internet and try again.
    echo.
    pause
    exit /b 1
)

echo  Downloading latest version from GitHub...
echo.

git pull origin main

if %errorlevel%==0 (
    echo.
    echo  ==========================================
    echo   Update complete!
    echo.
    echo   Now double-click start.bat to run the
    echo   app, then open it on your phone while
    echo   on the same WiFi to get the new version.
    echo  ==========================================
) else (
    echo.
    echo  Something went wrong. Please send a
    echo  screenshot of this window for help.
)

echo.
pause
