@echo off
echo Setting up Athena AI Desktop...
echo This will install dependencies and prepare the application...

echo.
echo Installing dependencies...
call npm install --production

echo.
echo Rebuilding native modules...
cd node_modules\better-sqlite3
call npm run install
cd ..\..

echo.
echo Setup complete! You can now run the application.
pause
