@echo off
title Athena AI - Testing Production Mode
echo ========================================
echo  ATHENA AI PRODUCTION TEST
echo ========================================
echo.

REM Navigate to application directory
cd /d "%~dp0"

REM Check if production build exists
if not exist "dist\index.js" (
    echo ERROR: Production build not found in dist folder.
    echo Please run 'npm run build' first.
    pause
    exit /b 1
)

REM Set production environment
echo Setting production environment...
set NODE_ENV=production
set ELECTRON_IS_DEV=0
set ELECTRON_DISABLE_SECURITY_WARNINGS=true

echo.
echo Starting Athena AI in production mode...
echo Watch for any error messages below:
echo ========================================
echo.

REM Run Electron with visible output for debugging
npx electron electron-main.cjs

echo.
echo ========================================
echo If you saw any errors above, please note them.
pause