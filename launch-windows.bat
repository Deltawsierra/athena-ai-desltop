@echo off
REM Athena AI Desktop Launcher for Windows
REM Double-click this file to launch Athena AI

echo Starting Athena AI Cybersecurity Platform...
echo.

REM Navigate to application directory
cd /d "%~dp0"

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
    echo Please ensure the application is properly installed.
    echo If this is a development build, run 'npm install' first.
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