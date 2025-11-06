@echo off
echo Starting Athena AI Desktop...
cd /d "%~dp0"
if exist node_modules\electron\dist\electron.exe (
    node_modules\electron\dist\electron.exe electron-main.cjs
) else (
    echo Error: Electron not found. Please ensure node_modules are properly installed.
    pause
)