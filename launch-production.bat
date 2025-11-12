@echo off
title Athena AI Production
REM Production launcher for Athena AI

REM Navigate to application directory
cd /d "%~dp0"

REM Check if production build exists
if not exist "dist\index.js" (
    echo ERROR: Production build not found.
    echo Please run 'npm run build' first.
    pause
    exit /b 1
)

REM Check if node_modules exists
if not exist "node_modules" (
    echo ERROR: Dependencies not found.
    echo Please run 'npm install' first.
    pause
    exit /b 1
)

REM Launch in production mode
echo Starting Athena AI...
set NODE_ENV=production
start "" /MIN cmd /c npx electron electron-main.cjs
exit