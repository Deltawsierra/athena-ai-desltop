@echo off
echo Starting Athena AI Desktop...

if not exist node_modules (
    echo Dependencies not installed. Running install.bat first...
    call install.bat
)

if exist node_modules\electron\dist\electron.exe (
    node_modules\electron\dist\electron.exe electron-main.cjs
) else (
    echo Error: Electron not found. Please run install.bat first
    pause
)
