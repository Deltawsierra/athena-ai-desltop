@echo off
title Athena AI - Development Mode Test
echo =========================================================
echo ATHENA AI - DEVELOPMENT MODE SECURITY TEST
echo =========================================================
echo.
echo Testing in DEVELOPMENT mode to verify CSP is applied
echo even during development (fixing security warnings).
echo.
echo =========================================================
set NODE_ENV=development
echo Environment: DEVELOPMENT
echo.
echo Starting Electron in development mode...
echo Security should be configured even in dev mode.
echo.
npx electron electron-main.cjs
echo.
echo =========================================================
echo If warnings appear in dev mode, the CSP may not be
echo properly applied for localhost URLs.
echo =========================================================
pause