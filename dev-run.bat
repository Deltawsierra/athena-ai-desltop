@echo off
title Athena AI - Development Mode
echo ==========================================
echo ATHENA AI - DEVELOPMENT MODE
echo ==========================================
echo.
echo Starting development server with hot reload...
echo.
npm run electron
echo.
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Failed to start development server.
    echo Please check if all dependencies are installed.
    echo Run: npm install
    echo.
)
pause