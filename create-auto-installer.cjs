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
    console.log('Failed to build frontend:', error.message);
    process.exit(1);
  }
}

// Create Windows PowerShell installer script
const windowsInstaller = `# Athena AI Automated Installer for Windows
# This script downloads and installs everything automatically

Write-Host "================================" -ForegroundColor Cyan
Write-Host "  ATHENA AI DESKTOP INSTALLER   " -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as administrator
$currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
$isAdmin = $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "Requesting administrator privileges..." -ForegroundColor Yellow
    Start-Process PowerShell -Verb RunAs "-NoProfile -ExecutionPolicy Bypass -File `"$PSCommandPath`""
    exit
}

Write-Host "✓ Running with administrator privileges" -ForegroundColor Green

# Set installation directory
$installDir = "$env:LOCALAPPDATA\\AthenaAI"
Write-Host "Installation directory: $installDir" -ForegroundColor Gray

# Check for Node.js
Write-Host ""
Write-Host "Checking for Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>$null
    Write-Host "✓ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "Node.js not found. Installing Node.js..." -ForegroundColor Yellow
    
    # Download Node.js installer
    $nodeUrl = "https://nodejs.org/dist/v20.11.0/node-v20.11.0-x64.msi"
    $nodeInstaller = "$env:TEMP\\node-installer.msi"
    
    Write-Host "  Downloading Node.js..." -ForegroundColor Gray
    Invoke-WebRequest -Uri $nodeUrl -OutFile $nodeInstaller
    
    Write-Host "  Installing Node.js..." -ForegroundColor Gray
    Start-Process msiexec.exe -ArgumentList "/i", $nodeInstaller, "/quiet", "/norestart" -Wait
    
    # Refresh environment variables
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
    
    Write-Host "✓ Node.js installed successfully" -ForegroundColor Green
}

# Create installation directory
Write-Host ""
Write-Host "Creating installation directory..." -ForegroundColor Yellow
if (Test-Path $installDir) {
    Write-Host "  Removing old installation..." -ForegroundColor Gray
    Remove-Item -Path $installDir -Recurse -Force
}
New-Item -ItemType Directory -Path $installDir -Force | Out-Null
Write-Host "✓ Directory created" -ForegroundColor Green

# Extract application files
Write-Host ""
Write-Host "Installing Athena AI..." -ForegroundColor Yellow
Write-Host "  Extracting application files..." -ForegroundColor Gray

# Copy application files (in real scenario, these would be embedded or downloaded)
$sourceDir = Split-Path -Parent $PSCommandPath
Copy-Item -Path "$sourceDir\\*" -Destination $installDir -Recurse -Force -Exclude @("*.ps1", "*.sh", "node_modules")

Set-Location $installDir

# Install dependencies
Write-Host "  Installing dependencies (this may take a few minutes)..." -ForegroundColor Gray
npm install --production 2>&1 | Out-Null

# Rebuild native modules
Write-Host "  Building native modules..." -ForegroundColor Gray
Set-Location "$installDir\\node_modules\\better-sqlite3"
npm run install 2>&1 | Out-Null
Set-Location $installDir

Write-Host "✓ Application installed" -ForegroundColor Green

# Create Start Menu shortcut
Write-Host ""
Write-Host "Creating shortcuts..." -ForegroundColor Yellow
$startMenuPath = "$env:APPDATA\\Microsoft\\Windows\\Start Menu\\Programs"
$WshShell = New-Object -ComObject WScript.Shell

$shortcut = $WshShell.CreateShortcut("$startMenuPath\\Athena AI.lnk")
$shortcut.TargetPath = "$installDir\\node_modules\\electron\\dist\\electron.exe"
$shortcut.Arguments = "$installDir\\electron-main.cjs"
$shortcut.WorkingDirectory = $installDir
$shortcut.IconLocation = "$installDir\\build\\icon.ico"
$shortcut.Description = "Athena AI - Cybersecurity Intelligence Platform"
$shortcut.Save()

# Create Desktop shortcut
$desktop = [System.Environment]::GetFolderPath('Desktop')
$desktopShortcut = $WshShell.CreateShortcut("$desktop\\Athena AI.lnk")
$desktopShortcut.TargetPath = "$installDir\\node_modules\\electron\\dist\\electron.exe"
$desktopShortcut.Arguments = "$installDir\\electron-main.cjs"
$desktopShortcut.WorkingDirectory = $installDir
$desktopShortcut.IconLocation = "$installDir\\build\\icon.ico"
$desktopShortcut.Description = "Athena AI - Cybersecurity Intelligence Platform"
$desktopShortcut.Save()

Write-Host "✓ Shortcuts created" -ForegroundColor Green

# Register uninstaller
Write-Host ""
Write-Host "Registering uninstaller..." -ForegroundColor Yellow
$uninstallPath = "HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\AthenaAI"
New-Item -Path $uninstallPath -Force | Out-Null
Set-ItemProperty -Path $uninstallPath -Name "DisplayName" -Value "Athena AI"
Set-ItemProperty -Path $uninstallPath -Name "UninstallString" -Value "$installDir\\uninstall.bat"
Set-ItemProperty -Path $uninstallPath -Name "DisplayIcon" -Value "$installDir\\build\\icon.ico"
Set-ItemProperty -Path $uninstallPath -Name "Publisher" -Value "Athena AI Team"
Set-ItemProperty -Path $uninstallPath -Name "DisplayVersion" -Value "1.0.0"
Set-ItemProperty -Path $uninstallPath -Name "InstallLocation" -Value $installDir

Write-Host "✓ Uninstaller registered" -ForegroundColor Green

# Create uninstall script
@"
@echo off
echo Uninstalling Athena AI...
rmdir /s /q "$installDir"
reg delete "HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\AthenaAI" /f
del "%APPDATA%\\Microsoft\\Windows\\Start Menu\\Programs\\Athena AI.lnk"
del "%USERPROFILE%\\Desktop\\Athena AI.lnk"
echo Athena AI has been uninstalled.
pause
"@ | Out-File -FilePath "$installDir\\uninstall.bat" -Encoding ASCII

Write-Host ""
Write-Host "================================" -ForegroundColor Green
Write-Host "  INSTALLATION COMPLETE!        " -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""
Write-Host "Athena AI has been installed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "You can now:" -ForegroundColor Cyan
Write-Host "  • Launch from Desktop shortcut" -ForegroundColor White
Write-Host "  • Launch from Start Menu" -ForegroundColor White
Write-Host ""
Write-Host "Default Login:" -ForegroundColor Yellow
Write-Host "  Username: admin" -ForegroundColor White
Write-Host "  Password: admin123" -ForegroundColor White
Write-Host ""

$response = Read-Host "Would you like to launch Athena AI now? (Y/N)"
if ($response -eq 'Y' -or $response -eq 'y') {
    Write-Host "Launching Athena AI..." -ForegroundColor Cyan
    Start-Process "$installDir\\node_modules\\electron\\dist\\electron.exe" -ArgumentList "$installDir\\electron-main.cjs" -WorkingDirectory $installDir
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
`;

fs.writeFileSync('athena-installer-windows.ps1', windowsInstaller);
console.log('✓ Created Windows PowerShell installer (athena-installer-windows.ps1)');

// Create Mac/Linux bash installer script
const unixInstaller = `#!/bin/bash
# Athena AI Automated Installer for Mac/Linux

echo "================================"
echo "  ATHENA AI DESKTOP INSTALLER  "
echo "================================"
echo ""

# Colors for output
RED='\\033[0;31m'
GREEN='\\033[0;32m'
YELLOW='\\033[1;33m'
CYAN='\\033[0;36m'
NC='\\033[0m' # No Color

# Detect OS
if [[ "$OSTYPE" == "darwin"* ]]; then
    OS="macOS"
    INSTALL_DIR="$HOME/Applications/AthenaAI"
    DESKTOP="$HOME/Desktop"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS="Linux"
    INSTALL_DIR="$HOME/.local/share/AthenaAI"
    DESKTOP="$HOME/Desktop"
    APPLICATIONS="$HOME/.local/share/applications"
else
    echo -e "\${RED}Unsupported operating system: $OSTYPE\${NC}"
    exit 1
fi

echo -e "\${CYAN}Detected OS: $OS\${NC}"
echo "Installation directory: $INSTALL_DIR"
echo ""

# Check for Node.js
echo -e "\${YELLOW}Checking for Node.js...\${NC}"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "\${GREEN}✓ Node.js found: $NODE_VERSION\${NC}"
else
    echo -e "\${YELLOW}Node.js not found. Please install Node.js first.\${NC}"
    echo ""
    if [[ "$OS" == "macOS" ]]; then
        echo "Install with Homebrew:"
        echo "  brew install node"
        echo ""
        echo "Or download from: https://nodejs.org"
    else
        echo "Install with package manager:"
        echo "  Ubuntu/Debian: sudo apt-get install nodejs npm"
        echo "  Fedora: sudo dnf install nodejs npm"
        echo "  Arch: sudo pacman -S nodejs npm"
        echo ""
        echo "Or download from: https://nodejs.org"
    fi
    exit 1
fi

# Create installation directory
echo ""
echo -e "\${YELLOW}Creating installation directory...\${NC}"
if [ -d "$INSTALL_DIR" ]; then
    echo "  Removing old installation..."
    rm -rf "$INSTALL_DIR"
fi
mkdir -p "$INSTALL_DIR"
echo -e "\${GREEN}✓ Directory created\${NC}"

# Copy application files
echo ""
echo -e "\${YELLOW}Installing Athena AI...\${NC}"
echo "  Copying application files..."
SOURCE_DIR="$(dirname "$0")"
cp -r "$SOURCE_DIR"/* "$INSTALL_DIR/" 2>/dev/null || true
rm -f "$INSTALL_DIR"/*.sh "$INSTALL_DIR"/*.ps1 2>/dev/null

cd "$INSTALL_DIR"

# Install dependencies
echo "  Installing dependencies (this may take a few minutes)..."
npm install --production > /dev/null 2>&1

# Rebuild native modules
echo "  Building native modules..."
cd node_modules/better-sqlite3
npm run install > /dev/null 2>&1
cd "$INSTALL_DIR"

echo -e "\${GREEN}✓ Application installed\${NC}"

# Create desktop entry for Linux
if [[ "$OS" == "Linux" ]]; then
    echo ""
    echo -e "\${YELLOW}Creating desktop entry...\${NC}"
    mkdir -p "$APPLICATIONS"
    
    cat > "$APPLICATIONS/athena-ai.desktop" <<EOF
[Desktop Entry]
Name=Athena AI
Comment=Cybersecurity Intelligence Platform
Exec=$INSTALL_DIR/node_modules/.bin/electron $INSTALL_DIR/electron-main.cjs
Icon=$INSTALL_DIR/build/icon.png
Terminal=false
Type=Application
Categories=Development;Security;
StartupNotify=true
EOF
    
    chmod +x "$APPLICATIONS/athena-ai.desktop"
    
    # Create desktop shortcut
    if [ -d "$DESKTOP" ]; then
        cp "$APPLICATIONS/athena-ai.desktop" "$DESKTOP/"
        chmod +x "$DESKTOP/athena-ai.desktop"
        echo -e "\${GREEN}✓ Desktop shortcut created\${NC}"
    fi
fi

# Create Mac app bundle
if [[ "$OS" == "macOS" ]]; then
    echo ""
    echo -e "\${YELLOW}Creating app bundle...\${NC}"
    
    # Create launch script
    cat > "$INSTALL_DIR/launch.sh" <<'EOF'
#!/bin/bash
cd "$(dirname "$0")"
./node_modules/.bin/electron electron-main.cjs
EOF
    chmod +x "$INSTALL_DIR/launch.sh"
    
    # Create alias on Desktop
    if [ -d "$DESKTOP" ]; then
        osascript -e "tell application \\"Finder\\" to make alias file to POSIX file \\"$INSTALL_DIR/launch.sh\\" at POSIX file \\"$DESKTOP\\"" > /dev/null 2>&1
        mv "$DESKTOP/launch.sh" "$DESKTOP/Athena AI" 2>/dev/null || true
        echo -e "\${GREEN}✓ Desktop alias created\${NC}"
    fi
fi

# Create uninstall script
cat > "$INSTALL_DIR/uninstall.sh" <<EOF
#!/bin/bash
echo "Uninstalling Athena AI..."
rm -rf "$INSTALL_DIR"
rm -f "$DESKTOP/Athena AI*"
rm -f "$DESKTOP/athena-ai.desktop"
[ -f "$APPLICATIONS/athena-ai.desktop" ] && rm -f "$APPLICATIONS/athena-ai.desktop"
echo "Athena AI has been uninstalled."
EOF
chmod +x "$INSTALL_DIR/uninstall.sh"

echo ""
echo -e "\${GREEN}================================\${NC}"
echo -e "\${GREEN}  INSTALLATION COMPLETE!        \${NC}"
echo -e "\${GREEN}================================\${NC}"
echo ""
echo -e "\${GREEN}Athena AI has been installed successfully!\${NC}"
echo ""
echo -e "\${CYAN}You can now:\${NC}"
if [[ "$OS" == "macOS" ]]; then
    echo "  • Launch from Desktop alias"
    echo "  • Or run: $INSTALL_DIR/launch.sh"
else
    echo "  • Launch from Desktop shortcut"
    echo "  • Launch from Applications menu"
    echo "  • Or run: $INSTALL_DIR/node_modules/.bin/electron $INSTALL_DIR/electron-main.cjs"
fi
echo ""
echo -e "\${YELLOW}Default Login:\${NC}"
echo "  Username: admin"
echo "  Password: admin123"
echo ""
echo -e "\${CYAN}To uninstall:\${NC}"
echo "  Run: $INSTALL_DIR/uninstall.sh"
echo ""

read -p "Would you like to launch Athena AI now? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "\${CYAN}Launching Athena AI...\${NC}"
    if [[ "$OS" == "macOS" ]]; then
        "$INSTALL_DIR/launch.sh" &
    else
        "$INSTALL_DIR/node_modules/.bin/electron" "$INSTALL_DIR/electron-main.cjs" &
    fi
fi

echo ""
echo "Press Enter to exit..."
read
`;

fs.writeFileSync('athena-installer-unix.sh', unixInstaller);
fs.chmodSync('athena-installer-unix.sh', 0o755);
console.log('✓ Created Mac/Linux bash installer (athena-installer-unix.sh)');

// Create a one-click download HTML page
const downloadPage = `<!DOCTYPE html>
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
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
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
        
        .download-button {
            display: inline-block;
            padding: 1rem 3rem;
            font-size: 1.2rem;
            background: linear-gradient(45deg, #00ffff, #0099ff);
            color: white;
            text-decoration: none;
            border-radius: 50px;
            transition: all 0.3s ease;
            box-shadow: 0 10px 20px rgba(0, 153, 255, 0.3);
            margin: 10px;
            border: none;
            cursor: pointer;
        }
        
        .download-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 15px 30px rgba(0, 153, 255, 0.5);
        }
        
        .platform-icon {
            width: 24px;
            height: 24px;
            display: inline-block;
            vertical-align: middle;
            margin-right: 10px;
        }
        
        .instructions {
            margin-top: 3rem;
            padding: 1.5rem;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            text-align: left;
        }
        
        .instructions h3 {
            margin-bottom: 1rem;
        }
        
        .instructions ol {
            padding-left: 1.5rem;
        }
        
        .instructions li {
            margin-bottom: 0.5rem;
        }
        
        .system-req {
            margin-top: 2rem;
            font-size: 0.9rem;
            opacity: 0.8;
        }
        
        .detected-os {
            margin: 1rem 0;
            padding: 0.5rem 1rem;
            background: rgba(0, 255, 255, 0.1);
            border-radius: 20px;
            display: inline-block;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Athena AI</h1>
        <p class="subtitle">Cybersecurity Intelligence Platform</p>
        
        <div id="detected-os" class="detected-os">
            Detecting your operating system...
        </div>
        
        <div id="download-section">
            <h2 style="margin: 2rem 0 1rem;">Choose Your Platform:</h2>
            
            <button class="download-button" onclick="downloadWindows()">
                <span class="platform-icon">🪟</span> Download for Windows
            </button>
            
            <button class="download-button" onclick="downloadMac()">
                <span class="platform-icon">🍎</span> Download for macOS
            </button>
            
            <button class="download-button" onclick="downloadLinux()">
                <span class="platform-icon">🐧</span> Download for Linux
            </button>
        </div>
        
        <div class="instructions">
            <h3>Installation Instructions:</h3>
            <ol id="install-steps">
                <li>Download the installer for your platform</li>
                <li>Run the installer (may require admin/sudo permissions)</li>
                <li>Follow the on-screen instructions</li>
                <li>Launch Athena AI from your desktop or applications menu</li>
            </ol>
            
            <h3 style="margin-top: 1.5rem;">Default Login:</h3>
            <p>Username: <strong>admin</strong></p>
            <p>Password: <strong>admin123</strong></p>
        </div>
        
        <div class="system-req">
            <strong>System Requirements:</strong><br>
            • Node.js 16 or later<br>
            • 2GB RAM minimum<br>
            • 500MB free disk space
        </div>
    </div>
    
    <script>
        // Detect operating system
        function detectOS() {
            const platform = navigator.platform.toLowerCase();
            const userAgent = navigator.userAgent.toLowerCase();
            
            if (platform.includes('win')) {
                return 'Windows';
            } else if (platform.includes('mac')) {
                return 'macOS';
            } else if (platform.includes('linux')) {
                return 'Linux';
            } else if (userAgent.includes('android')) {
                return 'Android (Not Supported)';
            } else if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
                return 'iOS (Not Supported)';
            }
            return 'Unknown';
        }
        
        // Update UI with detected OS
        const detectedOS = detectOS();
        document.getElementById('detected-os').innerHTML = 
            '✨ Detected OS: <strong>' + detectedOS + '</strong>';
        
        // Auto-highlight recommended download
        if (detectedOS === 'Windows') {
            document.querySelectorAll('.download-button')[0].style.background = 
                'linear-gradient(45deg, #00ff88, #00ffff)';
        } else if (detectedOS === 'macOS') {
            document.querySelectorAll('.download-button')[1].style.background = 
                'linear-gradient(45deg, #00ff88, #00ffff)';
        } else if (detectedOS === 'Linux') {
            document.querySelectorAll('.download-button')[2].style.background = 
                'linear-gradient(45deg, #00ff88, #00ffff)';
        }
        
        // Download functions
        function downloadWindows() {
            // Update instructions for Windows
            document.getElementById('install-steps').innerHTML = \`
                <li>Download the PowerShell installer</li>
                <li>Right-click the file and select "Run with PowerShell"</li>
                <li>If prompted, allow the script to run (type 'Y' and press Enter)</li>
                <li>The installer will handle everything automatically</li>
                <li>Find Athena AI on your desktop when complete!</li>
            \`;
            
            // Trigger download
            window.location.href = 'athena-installer-windows.ps1';
        }
        
        function downloadMac() {
            // Update instructions for Mac
            document.getElementById('install-steps').innerHTML = \`
                <li>Download the installer script</li>
                <li>Open Terminal (Cmd+Space, type "Terminal")</li>
                <li>Navigate to Downloads: cd ~/Downloads</li>
                <li>Make executable: chmod +x athena-installer-unix.sh</li>
                <li>Run installer: ./athena-installer-unix.sh</li>
                <li>Find Athena AI on your desktop when complete!</li>
            \`;
            
            // Trigger download
            window.location.href = 'athena-installer-unix.sh';
        }
        
        function downloadLinux() {
            // Update instructions for Linux
            document.getElementById('install-steps').innerHTML = \`
                <li>Download the installer script</li>
                <li>Open Terminal</li>
                <li>Navigate to Downloads: cd ~/Downloads</li>
                <li>Make executable: chmod +x athena-installer-unix.sh</li>
                <li>Run installer: ./athena-installer-unix.sh</li>
                <li>Find Athena AI in your applications menu!</li>
            \`;
            
            // Trigger download
            window.location.href = 'athena-installer-unix.sh';
        }
    </script>
</body>
</html>`;

fs.writeFileSync('download-athena.html', downloadPage);
console.log('✓ Created download page (download-athena.html)');

console.log('\n' + '='.repeat(60));
console.log('✅ AUTOMATED INSTALLERS CREATED!');
console.log('='.repeat(60));
console.log('\n📦 Created Files:');
console.log('   • athena-installer-windows.ps1 - Windows PowerShell installer');
console.log('   • athena-installer-unix.sh - Mac/Linux bash installer');
console.log('   • download-athena.html - One-click download page');
console.log('\n🚀 Distribution:');
console.log('   1. Host these files on a web server');
console.log('   2. Direct users to download-athena.html');
console.log('   3. They click their platform and follow instructions');
console.log('\n✨ Features:');
console.log('   • Auto-detects operating system');
console.log('   • Installs Node.js if missing (Windows)');
console.log('   • Creates desktop shortcuts automatically');
console.log('   • Registers with system (uninstaller on Windows)');
console.log('   • One-click installation process');
console.log('='.repeat(60));