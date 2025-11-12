@echo off
echo Testing Athena AI with ES Module fix...
set NODE_ENV=production
set ELECTRON_DISABLE_SECURITY_WARNINGS=true
npx electron electron-main.cjs
pause