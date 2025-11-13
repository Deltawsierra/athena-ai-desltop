@echo off
title Testing Athena AI Desktop
echo ==========================================
echo TESTING ATHENA AI DESKTOP APP
echo ==========================================
echo.
echo Setting production environment...
set NODE_ENV=production
echo.
echo Starting Electron app...
echo.
npx electron electron-main.cjs
echo.
echo If the app started without errors, it's working!
pause