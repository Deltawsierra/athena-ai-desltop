@echo off
echo Testing Athena AI with Strict Security...
set NODE_ENV=production
npx electron electron-main.cjs
pause