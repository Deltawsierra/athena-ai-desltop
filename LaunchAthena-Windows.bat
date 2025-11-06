@echo off
title Athena AI Desktop
color 0B
cls

echo ========================================
echo    ATHENA AI DESKTOP LAUNCHER
echo ========================================
echo.

cd /d "%~dp0"

:: Check if Electron exists
if exist "node_modules\electron\dist\electron.exe" (
    echo Starting Athena AI...
    start "" "node_modules\electron\dist\electron.exe" electron-main.cjs
    echo.
    echo Application launched! Check your system tray if window doesn't appear.
    timeout /t 3 >nul
    exit
) else (
    echo.
    echo ERROR: Electron not found in node_modules!
    echo.
    echo Please run these steps first:
    echo 1. Make sure Node.js is installed from nodejs.org
    echo 2. Open Command Prompt in this folder
    echo 3. Run: npm install
    echo 4. Then run this launcher again
    echo.
    pause
    exit
)