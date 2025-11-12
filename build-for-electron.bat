@echo off
title Building Athena AI for Electron Production
echo ==========================================
echo BUILDING ATHENA AI FOR ELECTRON
echo ==========================================
echo.

echo Step 1: Building frontend (Vite)...
call npx vite build
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Frontend build failed
    pause
    exit /b 1
)
echo Frontend build complete!
echo.

echo Step 2: Building server (simplified)...
echo Creating server bundle...
call npx esbuild server/index.ts --bundle --platform=node --target=node18 --format=cjs --outfile=dist/server.cjs --external:better-sqlite3 --external:lightningcss --external:@babel/preset-typescript --external:esbuild --minify=false
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Server build failed
    pause
    exit /b 1
)
echo Server bundle created!
echo.

echo Step 3: Copying SQLite module...
xcopy /E /I /Y node_modules\better-sqlite3 dist\node_modules\better-sqlite3 >nul 2>&1
echo SQLite module copied!
echo.

echo ==========================================
echo BUILD COMPLETE!
echo ==========================================
echo.
echo Production files ready in dist folder:
echo - Frontend: dist/public/
echo - Server: dist/server.cjs
echo - SQLite: dist/node_modules/better-sqlite3/
echo.
echo You can now run the Electron app in production.
echo.
pause