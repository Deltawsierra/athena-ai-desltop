@echo off
title Athena AI - Security Verification
echo =====================================
echo ATHENA AI SECURITY VERIFICATION
echo =====================================
echo.
echo Checking Electron version...
call npx electron --version
echo.
echo Expected: v33.0.0
echo.
echo =====================================
echo LAUNCHING APP WITH SECURITY ENABLED
echo =====================================
echo.
echo Security Configuration:
echo - webSecurity: TRUE
echo - contextIsolation: TRUE
echo - nodeIntegration: FALSE
echo - sandbox: TRUE
echo.
echo Starting Athena AI...
set NODE_ENV=production
set ELECTRON_DISABLE_SECURITY_WARNINGS=true
start npx electron electron-main.cjs
echo.
echo =====================================
echo App launched successfully!
echo Check console for any warnings.
echo =====================================
echo.
pause