@echo off
title Athena AI - Cybersecurity Intelligence Platform

REM ============================================
REM Athena AI Desktop Application Launcher
REM Windows Batch Script
REM ============================================

echo Starting Athena AI Cybersecurity Platform...
echo.

REM Store the current directory where the script is located
set "SCRIPT_DIR=%~dp0"
REM Remove trailing backslash if present
if "%SCRIPT_DIR:~-1%"=="\" set "SCRIPT_DIR=%SCRIPT_DIR:~0,-1%"

REM Navigate to script directory
cd /d "%SCRIPT_DIR%"

REM Check if we're in the application directory
if not exist "package.json" (
    echo ========================================================
    echo ERROR: Cannot launch from this location!
    echo ========================================================
    echo.
    echo This launcher script was not found in the application folder.
    echo.
    echo TO FIX THIS PROBLEM:
    echo.
    echo 1. Navigate to your AegisEngine folder
    echo    ^(The folder where you ran 'npm install'^)
    echo.
    echo 2. Find the launch-windows.bat file there
    echo.
    echo 3. Right-click on launch-windows.bat
    echo.
    echo 4. Select "Send to" -^> "Desktop (create shortcut)"
    echo.
    echo 5. Use the shortcut on your desktop to launch Athena AI
    echo.
    echo DO NOT copy or move the .bat file itself to your desktop.
    echo You need to create a SHORTCUT instead.
    echo.
    echo Current location: %CD%
    echo ========================================================
    pause
    exit /b 1
)

REM Check if Node.js is installed
where node >nul 2>nul
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH.
    echo Please install Node.js from https://nodejs.org/ and try again.
    pause
    exit /b 1
)

REM Check if node_modules exists
if not exist "node_modules" (
    echo ERROR: Application dependencies not found.
    echo.
    echo Please run 'npm install' in this directory first:
    echo %CD%
    echo.
    echo Steps:
    echo 1. Open a terminal/command prompt
    echo 2. Navigate to: %CD%
    echo 3. Run: npm install
    echo 4. Wait for installation to complete
    echo 5. Try launching again
    pause
    exit /b 1
)

REM Start the application
echo.
echo Launching Athena AI...
echo The application will open in a new window momentarily.
echo.
echo To stop the application, close the Electron window.
echo.

REM Run Electron in production mode
set NODE_ENV=production
npm run electron

if errorlevel 1 (
    echo.
    echo ERROR: Failed to start the application.
    echo Please check the error messages above.
    pause
    exit /b 1
)

pause