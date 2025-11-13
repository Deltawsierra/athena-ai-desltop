@echo off
title Building Athena AI Desktop for Windows
echo ==========================================
echo BUILDING ATHENA AI FOR WINDOWS
echo ==========================================
echo.

echo Step 1: Building Electron Server Bundle...
call node build-electron-server.cjs
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Server build failed. Make sure esbuild is installed!
    echo Run: npm install esbuild
    pause
    exit /b 1
)
echo Server bundle created successfully!
echo.

echo Step 2: Building Frontend (Vite)...
call npx vite build
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Frontend build failed
    pause
    exit /b 1
)
echo Frontend build complete!
echo.

echo ==========================================
echo BUILD COMPLETE!
echo ==========================================
echo.
echo Production files ready in dist folder:
echo - Frontend: dist\public\
echo - Server: dist\server-electron.mjs
echo - SQLite: dist\node_modules\better-sqlite3\
echo.
echo To run the app in production mode:
echo   set NODE_ENV=production
echo   npx electron electron-main.cjs
echo.
echo Or for development mode:
echo   npm run electron
echo.
pause