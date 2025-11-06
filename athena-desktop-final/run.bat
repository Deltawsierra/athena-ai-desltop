@echo off
echo Starting Athena AI Desktop...

if not exist node_modules (
    echo Dependencies not installed. Running setup first...
    call setup.bat
)

if not exist node_modules\better-sqlite3\build\Release\better_sqlite3.node (
    echo Rebuilding native modules...
    cd node_modules\better-sqlite3
    call npm run install
    cd ..\..
)

if exist node_modules\electron\dist\electron.exe (
    echo Launching Athena AI Desktop...
    node_modules\electron\dist\electron.exe electron-main.cjs
) else (
    echo Error: Electron not found. Please run setup.bat first
    pause
)
