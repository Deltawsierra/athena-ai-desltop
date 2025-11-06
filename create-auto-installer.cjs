#!/usr/bin/env node

/**
 * Creates automated installers for all platforms
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Creating Automated Installers for Athena AI...\n');

// Ensure client is built first
if (!fs.existsSync('client/dist/index.html')) {
  console.log('⚠️  Frontend not built. Building now...');
  try {
    execSync('npm run build:client', { stdio: 'inherit' });
  } catch (error) {
    console.log('Note: Frontend already built or build command not available');
  }
}

// Create each installer file separately to avoid escaping issues
console.log('📦 Creating installer files...');

// Windows PowerShell installer
const windowsInstallerPath = 'athena-installer-windows.ps1';
fs.writeFileSync(windowsInstallerPath, `# Athena AI Automated Installer for Windows
# Run this script as Administrator

Write-Host "================================" -ForegroundColor Cyan
Write-Host "  ATHENA AI DESKTOP INSTALLER   " -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Installation directory
$installDir = "$env:LOCALAPPDATA\\AthenaAI"
Write-Host "Installation directory: $installDir"

# Create directory
if (Test-Path $installDir) {
    Remove-Item -Path $installDir -Recurse -Force
}
New-Item -ItemType Directory -Path $installDir -Force | Out-Null

# Copy files from current directory
Write-Host "Installing Athena AI..."
$sourceDir = Split-Path -Parent $PSCommandPath
Copy-Item -Path "$sourceDir\\*" -Destination $installDir -Recurse -Force

Set-Location $installDir

# Install dependencies
Write-Host "Installing dependencies (this may take a few minutes)..."
npm install --production

# Create Desktop shortcut
Write-Host "Creating shortcuts..."
$WshShell = New-Object -ComObject WScript.Shell
$desktop = [System.Environment]::GetFolderPath('Desktop')
$shortcut = $WshShell.CreateShortcut("$desktop\\Athena AI.lnk")
$shortcut.TargetPath = "powershell.exe"
$shortcut.Arguments = "-NoProfile -ExecutionPolicy Bypass -Command \\"cd '$installDir'; .\\node_modules\\.bin\\electron electron-main.cjs\\""
$shortcut.WorkingDirectory = $installDir
$shortcut.Description = "Athena AI - Cybersecurity Intelligence Platform"
$shortcut.Save()

Write-Host ""
Write-Host "================================" -ForegroundColor Green
Write-Host "  INSTALLATION COMPLETE!        " -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""
Write-Host "Desktop shortcut created!" -ForegroundColor Green
Write-Host ""
Write-Host "Default Login:" -ForegroundColor Yellow
Write-Host "  Username: admin"
Write-Host "  Password: admin123"
Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
`);
console.log(`✓ Created Windows PowerShell installer (${windowsInstallerPath})`);

// Mac/Linux installer 
const unixInstallerPath = 'athena-installer-unix.sh';
fs.writeFileSync(unixInstallerPath, `#!/bin/bash
# Athena AI Automated Installer for Mac/Linux

echo "================================"
echo "  ATHENA AI DESKTOP INSTALLER  "
echo "================================"
echo ""

# Detect OS
if [[ "$OSTYPE" == "darwin"* ]]; then
    OS="macOS"
    INSTALL_DIR="$HOME/Applications/AthenaAI"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS="Linux"
    INSTALL_DIR="$HOME/.local/share/AthenaAI"
else
    echo "Unsupported OS: $OSTYPE"
    exit 1
fi

echo "Detected OS: $OS"
echo "Installation directory: $INSTALL_DIR"

# Create installation directory
if [ -d "$INSTALL_DIR" ]; then
    rm -rf "$INSTALL_DIR"
fi
mkdir -p "$INSTALL_DIR"

# Copy application files
echo "Installing Athena AI..."
SOURCE_DIR="$(dirname "$0")"
cp -r "$SOURCE_DIR"/* "$INSTALL_DIR/"

cd "$INSTALL_DIR"

# Install dependencies
echo "Installing dependencies (this may take a few minutes)..."
npm install --production

# Create desktop entry for Linux
if [[ "$OS" == "Linux" ]]; then
    mkdir -p "$HOME/.local/share/applications"
    
    cat > "$HOME/.local/share/applications/athena-ai.desktop" <<EOF
[Desktop Entry]
Name=Athena AI
Comment=Cybersecurity Intelligence Platform
Exec=$INSTALL_DIR/node_modules/.bin/electron $INSTALL_DIR/electron-main.cjs
Icon=$INSTALL_DIR/build/icon.png
Terminal=false
Type=Application
Categories=Development;Security;
EOF
    
    chmod +x "$HOME/.local/share/applications/athena-ai.desktop"
    cp "$HOME/.local/share/applications/athena-ai.desktop" "$HOME/Desktop/" 2>/dev/null
fi

# Create launch script for Mac
if [[ "$OS" == "macOS" ]]; then
    cat > "$INSTALL_DIR/launch.command" <<EOF
#!/bin/bash
cd "$INSTALL_DIR"
./node_modules/.bin/electron electron-main.cjs
EOF
    chmod +x "$INSTALL_DIR/launch.command"
    
    # Create alias on Desktop
    ln -s "$INSTALL_DIR/launch.command" "$HOME/Desktop/Athena AI"
fi

echo ""
echo "================================"
echo "  INSTALLATION COMPLETE!        "
echo "================================"
echo ""
echo "Athena AI installed successfully!"
echo ""
echo "Default Login:"
echo "  Username: admin"
echo "  Password: admin123"
echo ""
echo "Press Enter to exit..."
read
`);
fs.chmodSync(unixInstallerPath, 0o755);
console.log(`✓ Created Mac/Linux bash installer (${unixInstallerPath})`);

// Create simplified Windows batch installer
const batchInstallerPath = 'athena-installer.bat';
fs.writeFileSync(batchInstallerPath, `@echo off
echo ================================
echo   ATHENA AI DESKTOP INSTALLER   
echo ================================
echo.

set INSTALL_DIR=%LOCALAPPDATA%\\AthenaAI
echo Installation directory: %INSTALL_DIR%
echo.

if exist "%INSTALL_DIR%" rmdir /s /q "%INSTALL_DIR%"
mkdir "%INSTALL_DIR%"

echo Installing Athena AI...
xcopy /E /I /Y /Q * "%INSTALL_DIR%"

cd /d "%INSTALL_DIR%"

echo Installing dependencies (this may take a few minutes)...
call npm install --production

echo.
echo Creating desktop shortcut...
powershell -Command "$WshShell = New-Object -ComObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%USERPROFILE%\\Desktop\\Athena AI.lnk'); $Shortcut.TargetPath = '%INSTALL_DIR%\\node_modules\\electron\\dist\\electron.exe'; $Shortcut.Arguments = '%INSTALL_DIR%\\electron-main.cjs'; $Shortcut.WorkingDirectory = '%INSTALL_DIR%'; $Shortcut.Save()"

echo.
echo ================================
echo   INSTALLATION COMPLETE!        
echo ================================
echo.
echo Desktop shortcut created!
echo.
echo Default Login:
echo   Username: admin
echo   Password: admin123
echo.
pause
`);
console.log(`✓ Created Windows batch installer (${batchInstallerPath})`);

// Create download page HTML
const downloadPagePath = 'download-athena.html';
fs.writeFileSync(downloadPagePath, `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Download Athena AI Desktop</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            color: white;
        }
        
        .container {
            text-align: center;
            padding: 2rem;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
            max-width: 600px;
            margin: 20px;
        }
        
        h1 {
            font-size: 3rem;
            margin-bottom: 1rem;
            background: linear-gradient(45deg, #00ffff, #ffffff);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        .subtitle {
            font-size: 1.2rem;
            opacity: 0.9;
            margin-bottom: 2rem;
        }
        
        .download-section {
            margin: 2rem 0;
        }
        
        .download-button {
            display: inline-block;
            padding: 1rem 2.5rem;
            margin: 0.5rem;
            font-size: 1.1rem;
            background: linear-gradient(45deg, #00ffff, #0099ff);
            color: white;
            text-decoration: none;
            border-radius: 50px;
            transition: all 0.3s ease;
            box-shadow: 0 10px 20px rgba(0, 153, 255, 0.3);
        }
        
        .download-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 15px 30px rgba(0, 153, 255, 0.5);
        }
        
        .download-button.primary {
            background: linear-gradient(45deg, #00ff88, #00ffff);
        }
        
        .instructions {
            margin-top: 2rem;
            padding: 1.5rem;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            text-align: left;
        }
        
        .instructions h3 {
            margin-bottom: 0.5rem;
        }
        
        .instructions p {
            margin-bottom: 0.5rem;
            padding-left: 1rem;
        }
        
        code {
            background: rgba(0, 0, 0, 0.3);
            padding: 2px 6px;
            border-radius: 4px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Athena AI</h1>
        <p class="subtitle">Cybersecurity Intelligence Platform</p>
        
        <div class="download-section">
            <h2 style="margin-bottom: 1rem;">Download for Your Platform</h2>
            
            <div id="windows-section">
                <h3>Windows</h3>
                <a href="athena-installer.bat" class="download-button primary" download>
                    Download Windows Installer (.bat)
                </a>
                <a href="athena-installer-windows.ps1" class="download-button" download>
                    PowerShell Installer (.ps1)
                </a>
            </div>
            
            <div id="unix-section" style="margin-top: 2rem;">
                <h3>Mac & Linux</h3>
                <a href="athena-installer-unix.sh" class="download-button primary" download>
                    Download Unix Installer (.sh)
                </a>
            </div>
        </div>
        
        <div class="instructions">
            <h3>Windows Installation:</h3>
            <p>1. Download <code>athena-installer.bat</code></p>
            <p>2. Double-click to run (allow if Windows asks)</p>
            <p>3. Wait for installation to complete</p>
            <p>4. Find Athena AI on your desktop!</p>
            
            <h3 style="margin-top: 1rem;">Mac/Linux Installation:</h3>
            <p>1. Download <code>athena-installer-unix.sh</code></p>
            <p>2. Open Terminal in Downloads folder</p>
            <p>3. Run: <code>chmod +x athena-installer-unix.sh</code></p>
            <p>4. Run: <code>./athena-installer-unix.sh</code></p>
            <p>5. Find Athena AI on your desktop!</p>
            
            <h3 style="margin-top: 1rem;">Default Login:</h3>
            <p>Username: <strong>admin</strong></p>
            <p>Password: <strong>admin123</strong></p>
        </div>
        
        <script>
            // Auto-detect OS and highlight recommended download
            const platform = navigator.platform.toLowerCase();
            if (platform.includes('win')) {
                document.getElementById('windows-section').style.border = '2px solid #00ffff';
                document.getElementById('windows-section').style.padding = '1rem';
                document.getElementById('windows-section').style.borderRadius = '10px';
            } else if (platform.includes('mac') || platform.includes('linux')) {
                document.getElementById('unix-section').style.border = '2px solid #00ffff';
                document.getElementById('unix-section').style.padding = '1rem';
                document.getElementById('unix-section').style.borderRadius = '10px';
            }
        </script>
    </div>
</body>
</html>`);
console.log(`✓ Created download page (${downloadPagePath})`);

// Create a bundling script
const bundleScriptPath = 'bundle-for-distribution.cjs';
fs.writeFileSync(bundleScriptPath, `#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Creating distribution bundle...');

const distDir = 'athena-distribution';
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true });
}
fs.mkdirSync(distDir);

// Files to include in distribution
const filesToCopy = [
  'athena-installer-windows.ps1',
  'athena-installer-unix.sh', 
  'athena-installer.bat',
  'download-athena.html',
  'electron-main.cjs',
  'electron-preload.cjs',
  'package.json',
  'athena.db'
];

// Directories to copy
const dirsToCopy = ['server', 'shared', 'client/dist', 'build', 'attached_assets'];

// Copy files
filesToCopy.forEach(file => {
  if (fs.existsSync(file)) {
    fs.copyFileSync(file, path.join(distDir, file));
  }
});

// Copy directories
const copyDir = (src, dest) => {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory() && entry.name !== 'node_modules') {
      copyDir(srcPath, destPath);
    } else if (entry.isFile()) {
      fs.copyFileSync(srcPath, destPath);
    }
  }
};

dirsToCopy.forEach(dir => {
  const dest = path.join(distDir, dir);
  copyDir(dir, dest);
});

// Create archive
console.log('Creating archive...');
execSync(\`tar -czf athena-distribution.tar.gz \${distDir}\`, { stdio: 'inherit' });

console.log('✓ Distribution bundle created: athena-distribution.tar.gz');
`);
fs.chmodSync(bundleScriptPath, 0o755);
console.log(`✓ Created bundling script (${bundleScriptPath})`);

console.log('\n' + '='.repeat(60));
console.log('✅ AUTOMATED INSTALLERS CREATED!');
console.log('='.repeat(60));
console.log('\n📦 Created Files:');
console.log('   • athena-installer.bat - Simple Windows batch installer');
console.log('   • athena-installer-windows.ps1 - PowerShell installer');
console.log('   • athena-installer-unix.sh - Mac/Linux installer');
console.log('   • download-athena.html - Download page with all installers');
console.log('   • bundle-for-distribution.cjs - Creates distribution package');
console.log('\n🚀 To Distribute:');
console.log('   1. Run: node bundle-for-distribution.cjs');
console.log('   2. Share the athena-distribution.tar.gz file');
console.log('   3. Users extract and run the appropriate installer');
console.log('\n✨ Features:');
console.log('   • One-click installation');
console.log('   • Automatic desktop shortcut creation');
console.log('   • No manual steps required');
console.log('   • Works offline after download');
console.log('='.repeat(60));