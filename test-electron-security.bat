@echo off
title Athena AI - Electron Security Test
echo =========================================================
echo ATHENA AI - ELECTRON SECURITY VERIFICATION
echo =========================================================
echo.
echo This test verifies that Electron security is properly
echo configured and no warnings appear in the console.
echo.
echo =========================================================
echo SECURITY FIXES APPLIED:
echo =========================================================
echo.
echo 1. CSP is now applied in BOTH dev and prod modes
echo    - Previously only in production (!isDev)
echo    - Now always applied to prevent warnings
echo.
echo 2. Security configuration:
echo    - webSecurity: true (always enabled)
echo    - contextIsolation: true (isolates contexts)
echo    - nodeIntegration: false (prevents Node access)
echo    - sandbox: true (restricts renderer)
echo.
echo 3. Content Security Policy:
echo    - NO 'unsafe-eval' (prevents warnings)
echo    - Proper sources for dev and prod
echo.
echo =========================================================
echo TESTING PRODUCTION BUILD...
echo =========================================================
echo.
echo Setting environment to production...
set NODE_ENV=production
echo.
echo Starting Electron app...
echo Watch the console below for any warnings:
echo.
npx electron electron-main.cjs
echo.
echo =========================================================
echo TEST COMPLETE
echo =========================================================
echo.
echo EXPECTED: No security warnings should appear
echo.
echo If you STILL see warnings, please check:
echo 1. Clear any cached Electron data
echo 2. Ensure you have the latest code
echo 3. Run 'npm run build' before testing
echo.
pause