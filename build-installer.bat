@echo off
title Athena AI - Build Installer
echo ==========================================
echo ATHENA AI - BUILD INSTALLER
echo ==========================================
echo.

echo Step 1: Building Electron server bundle...
call node build-electron-server.cjs
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Server build failed!
    echo Make sure esbuild is installed: npm install esbuild
    pause
    exit /b 1
)
echo.

echo Step 2: Building frontend with Vite...
call npx vite build
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Frontend build failed!
    pause
    exit /b 1
)
echo.

echo Step 3: Copying required files...
copy electron-main.cjs dist\electron-main.cjs >nul 2>&1
copy electron-preload.cjs dist\electron-preload.cjs >nul 2>&1
echo.

echo Step 4: Creating Windows installer...
call npx electron-builder --win
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Installer creation failed!
    pause
    exit /b 1
)

echo.
echo ==========================================
echo BUILD COMPLETE!
echo ==========================================
echo.
echo Installer created: dist-electron\AthenaAI-Setup-1.0.0.exe
echo.
echo To run the app:
echo   Development: dev-run.bat
echo   Production: production-run.bat
echo.
pause