@echo off
title Athena AI - Production Mode
echo ==========================================
echo ATHENA AI - PRODUCTION MODE
echo ==========================================
echo.
set NODE_ENV=production
echo Starting production build...
echo.
npx electron electron-main.cjs
echo.
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Production build not found or failed to start.
    echo Please build the application first:
    echo   Run: build-installer.bat
    echo.
)
pause