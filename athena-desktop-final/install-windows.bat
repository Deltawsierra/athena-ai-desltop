@echo off
title Athena AI Desktop Installer
color 0B

echo.
echo ========================================
echo    ATHENA AI DESKTOP INSTALLER
echo ========================================
echo.

:: Set installation directory
set INSTALL_DIR=%USERPROFILE%\Desktop\AthenaAI

echo Installation directory: %INSTALL_DIR%
echo.

:: Check for Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo.
    echo Please install Node.js first from:
    echo https://nodejs.org
    echo.
    pause
    exit /b 1
)

echo Found Node.js: 
node --version
echo.

:: Remove old installation
if exist "%INSTALL_DIR%" (
    echo Removing old installation...
    rmdir /s /q "%INSTALL_DIR%"
)

:: Create installation directory
echo Creating installation directory...
mkdir "%INSTALL_DIR%"

:: Copy all files
echo Installing Athena AI files...
xcopy /E /I /Y /Q . "%INSTALL_DIR%" >nul

:: Change to installation directory
cd /d "%INSTALL_DIR%"

:: Install dependencies
echo.
echo Installing dependencies (this may take 2-3 minutes)...
echo Please wait...
call npm install --production --silent

:: Rebuild native modules
echo.
echo Finalizing installation...
cd node_modules\better-sqlite3
call npm run install --silent 2>nul
cd ....

:: Create desktop shortcut batch file
echo @echo off > "%USERPROFILE%\Desktop\Athena AI.bat"
echo cd /d "%INSTALL_DIR%" >> "%USERPROFILE%\Desktop\Athena AI.bat"
echo start "" node_modules\electron\dist\electron.exe electron-main.cjs >> "%USERPROFILE%\Desktop\Athena AI.bat"

echo.
echo ========================================
echo    INSTALLATION COMPLETE!
echo ========================================
echo.
echo Athena AI has been installed successfully!
echo.
echo A shortcut has been created on your desktop.
echo Double-click "Athena AI" to launch the application.
echo.
echo Default Login Credentials:
echo   Username: admin
echo   Password: admin123
echo.
pause
