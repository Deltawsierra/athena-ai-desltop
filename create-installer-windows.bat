@echo off
title Creating Athena AI Installer
echo ==========================================
echo CREATING ATHENA AI INSTALLER FOR WINDOWS
echo ==========================================
echo.

echo Step 1: Building application...
call node build-for-dist.cjs
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Build failed!
    pause
    exit /b 1
)
echo.

echo Step 2: Creating Windows installer...
call npx electron-builder --win
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Installer creation failed!
    pause
    exit /b 1
)

echo.
echo ==========================================
echo SUCCESS! INSTALLER CREATED
echo ==========================================
echo.
echo Installer location:
echo   dist-electron\AthenaAI-Setup-1.0.0.exe
echo.
echo You can now install Athena AI on any Windows computer!
echo.
pause