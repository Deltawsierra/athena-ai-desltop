#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Creating Simple One-Click Installers for Athena AI...\n');

// Windows Batch Installer (simplest approach)
const windowsBatch = `@echo off
title Athena AI Desktop Installer
color 0B

echo.
echo ========================================
echo    ATHENA AI DESKTOP INSTALLER
echo ========================================
echo.

:: Set installation directory
set INSTALL_DIR=%USERPROFILE%\\Desktop\\AthenaAI

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
cd node_modules\\better-sqlite3
call npm run install --silent 2>nul
cd ..\..

:: Create desktop shortcut batch file
echo @echo off > "%USERPROFILE%\\Desktop\\Athena AI.bat"
echo cd /d "%INSTALL_DIR%" >> "%USERPROFILE%\\Desktop\\Athena AI.bat"
echo start "" node_modules\\electron\\dist\\electron.exe electron-main.cjs >> "%USERPROFILE%\\Desktop\\Athena AI.bat"

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
`;

fs.writeFileSync('install-windows.bat', windowsBatch);
console.log('✓ Created Windows installer: install-windows.bat');

// Mac/Linux Shell Installer
const unixShell = `#!/bin/bash

echo ""
echo "========================================"
echo "   ATHENA AI DESKTOP INSTALLER"
echo "========================================"
echo ""

# Set installation directory
if [[ "$OSTYPE" == "darwin"* ]]; then
    INSTALL_DIR="$HOME/Desktop/AthenaAI"
    OS="macOS"
else
    INSTALL_DIR="$HOME/Desktop/AthenaAI"
    OS="Linux"
fi

echo "Operating System: $OS"
echo "Installation directory: $INSTALL_DIR"
echo ""

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed!"
    echo ""
    echo "Please install Node.js first:"
    if [[ "$OS" == "macOS" ]]; then
        echo "  Download from: https://nodejs.org"
        echo "  Or use Homebrew: brew install node"
    else
        echo "  Ubuntu/Debian: sudo apt-get install nodejs npm"
        echo "  Fedora: sudo dnf install nodejs npm"
        echo "  Or download from: https://nodejs.org"
    fi
    exit 1
fi

echo "Found Node.js: $(node --version)"
echo ""

# Remove old installation
if [ -d "$INSTALL_DIR" ]; then
    echo "Removing old installation..."
    rm -rf "$INSTALL_DIR"
fi

# Create installation directory
echo "Creating installation directory..."
mkdir -p "$INSTALL_DIR"

# Copy all files
echo "Installing Athena AI files..."
cp -r . "$INSTALL_DIR/"

# Change to installation directory
cd "$INSTALL_DIR"

# Install dependencies
echo ""
echo "Installing dependencies (this may take 2-3 minutes)..."
echo "Please wait..."
npm install --production --silent

# Rebuild native modules
echo ""
echo "Finalizing installation..."
cd node_modules/better-sqlite3
npm run install --silent 2>/dev/null
cd ../..

# Create desktop launcher script
cat > "$HOME/Desktop/Athena AI.command" << 'EOF'
#!/bin/bash
cd "$HOME/Desktop/AthenaAI"
./node_modules/.bin/electron electron-main.cjs
EOF

chmod +x "$HOME/Desktop/Athena AI.command"

# For Linux, also create desktop entry
if [[ "$OS" == "Linux" ]]; then
    cat > "$HOME/Desktop/AthenaAI.desktop" << EOF
[Desktop Entry]
Name=Athena AI
Comment=Cybersecurity Intelligence Platform
Exec=$INSTALL_DIR/node_modules/.bin/electron $INSTALL_DIR/electron-main.cjs
Icon=$INSTALL_DIR/build/icon.png
Terminal=false
Type=Application
Categories=Development;Security;
EOF
    chmod +x "$HOME/Desktop/AthenaAI.desktop"
fi

echo ""
echo "========================================"
echo "   INSTALLATION COMPLETE!"
echo "========================================"
echo ""
echo "Athena AI has been installed successfully!"
echo ""
echo "A launcher has been created on your desktop."
if [[ "$OS" == "macOS" ]]; then
    echo "Double-click 'Athena AI.command' to launch the application."
else
    echo "Double-click 'AthenaAI' to launch the application."
fi
echo ""
echo "Default Login Credentials:"
echo "  Username: admin"
echo "  Password: admin123"
echo ""
echo "Press Enter to exit..."
read
`;

fs.writeFileSync('install-mac-linux.sh', unixShell);
fs.chmodSync('install-mac-linux.sh', 0o755);
console.log('✓ Created Mac/Linux installer: install-mac-linux.sh');

// Create a simple download page
const downloadHTML = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Download Athena AI Desktop</title>
    <style>
        body {
            font-family: system-ui, -apple-system, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            margin: 0;
            color: white;
        }
        .container {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            padding: 3rem;
            border-radius: 20px;
            text-align: center;
            max-width: 500px;
        }
        h1 {
            margin: 0 0 0.5rem 0;
            font-size: 2.5rem;
        }
        .subtitle {
            opacity: 0.9;
            margin-bottom: 2rem;
        }
        .btn {
            display: block;
            width: 100%;
            padding: 1rem;
            margin: 1rem 0;
            background: linear-gradient(45deg, #00ffff, #0099ff);
            color: white;
            text-decoration: none;
            border-radius: 10px;
            font-size: 1.1rem;
            font-weight: 600;
            transition: transform 0.2s;
        }
        .btn:hover {
            transform: translateY(-2px);
        }
        .instructions {
            text-align: left;
            background: rgba(0, 0, 0, 0.2);
            padding: 1rem;
            border-radius: 10px;
            margin-top: 2rem;
            font-size: 0.9rem;
        }
        .instructions h3 {
            margin-top: 0;
        }
        code {
            background: rgba(0, 0, 0, 0.3);
            padding: 2px 5px;
            border-radius: 3px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Athena AI</h1>
        <p class="subtitle">Cybersecurity Intelligence Platform</p>
        
        <h2>Download Installer</h2>
        
        <a href="athena-desktop-final.tar.gz" class="btn" download>
            📦 Download Complete Package (5.5MB)
        </a>
        
        <div class="instructions">
            <h3>Installation Steps:</h3>
            <p><strong>1.</strong> Extract the downloaded file</p>
            <p><strong>2.</strong> Run the installer for your system:</p>
            <ul>
                <li>Windows: Double-click <code>install-windows.bat</code></li>
                <li>Mac/Linux: Run <code>./install-mac-linux.sh</code></li>
            </ul>
            <p><strong>3.</strong> Find Athena AI on your desktop!</p>
            
            <h3>Default Login:</h3>
            <p>Username: <code>admin</code><br>Password: <code>admin123</code></p>
        </div>
    </div>
</body>
</html>`;

fs.writeFileSync('download.html', downloadHTML);
console.log('✓ Created download page: download.html');

console.log('\n' + '='.repeat(60));
console.log('✅ SIMPLE ONE-CLICK INSTALLERS CREATED!');
console.log('='.repeat(60));
console.log('\n📦 Created Files:');
console.log('   • install-windows.bat - Windows one-click installer');
console.log('   • install-mac-linux.sh - Mac/Linux one-click installer');
console.log('   • download.html - Simple download page');
console.log('\n🚀 How to distribute:');
console.log('   1. Bundle with: tar -czf athena-installer.tar.gz athena-desktop-final/');
console.log('   2. User downloads and extracts the archive');
console.log('   3. User runs the appropriate installer');
console.log('   4. App appears on desktop ready to use!');
console.log('\n✨ Features:');
console.log('   • One-click installation');
console.log('   • Automatic desktop shortcut');
console.log('   • No technical knowledge required');
console.log('   • Clear error messages if Node.js missing');
console.log('='.repeat(60));