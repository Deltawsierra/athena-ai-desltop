@echo off
title Athena AI - Quick Fix for Windows
color 0B

echo ================================================
echo   ATHENA AI - QUICK FIX FOR WINDOWS
echo ================================================
echo.
echo This will fix the "Electron not found" error
echo.

cd /d "%~dp0"

:: Check for Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo.
    echo Please install Node.js first:
    echo 1. Go to: https://nodejs.org
    echo 2. Download and install the LTS version
    echo 3. Run this script again
    echo.
    pause
    exit /b 1
)

echo Node.js found!
echo.

:: Kill any running Electron processes
taskkill /F /IM electron.exe >nul 2>&1

:: Remove problematic folders
if exist node_modules (
    echo Removing old node_modules folder...
    rmdir /s /q node_modules
)

if exist package-lock.json (
    del /q package-lock.json
)

:: Clean npm cache
echo Cleaning npm cache...
npm cache clean --force >nul 2>&1

:: Install with specific flags for Windows
echo.
echo Installing Electron and dependencies...
echo This will take 2-3 minutes. Please wait...
echo.

:: Set environment variables for Windows builds
set npm_config_msvs_version=2022
set npm_config_build_from_source=false
set npm_config_python=python

:: Install production dependencies
call npm install --production --no-optional

:: Check if Electron was installed
if not exist "node_modules\electron\dist\electron.exe" (
    echo.
    echo Installing Electron separately...
    call npm install electron --save-prod
)

:: Create simple launcher
echo @echo off > "Launch-Athena.bat"
echo cd /d "%%~dp0" >> "Launch-Athena.bat"
echo start "" "node_modules\electron\dist\electron.exe" electron-main.cjs >> "Launch-Athena.bat"

echo.
echo ================================================
echo   INSTALLATION COMPLETE!
echo ================================================
echo.

if exist "node_modules\electron\dist\electron.exe" (
    echo SUCCESS! Electron is now installed.
    echo.
    echo To launch Athena AI:
    echo   - Double-click "Launch-Athena.bat"
    echo.
    echo Default Login:
    echo   Username: admin
    echo   Password: admin123
    echo.
    echo Press any key to launch Athena AI now...
    pause >nul
    start "" "node_modules\electron\dist\electron.exe" electron-main.cjs
) else (
    echo WARNING: Electron installation may have failed.
    echo Please check for errors above.
    echo.
    echo If problems persist, try:
    echo 1. Run this script as Administrator
    echo 2. Temporarily disable antivirus
    echo 3. Make sure you have internet connection
    echo.
    pause
)