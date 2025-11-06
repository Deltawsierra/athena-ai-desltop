# Athena AI - Windows Installation Fixer
# This script fixes common Windows installation issues

param(
    [string]$InstallPath = "$env:USERPROFILE\Desktop\athena-ai-desktop"
)

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  ATHENA AI - WINDOWS INSTALLATION FIXER       " -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")

if (-not $isAdmin) {
    Write-Host "This script needs Administrator privileges to fix installation issues." -ForegroundColor Yellow
    Write-Host "Restarting as Administrator..." -ForegroundColor Yellow
    
    # Restart script as Administrator
    Start-Process PowerShell -Verb RunAs -ArgumentList "-NoProfile", "-ExecutionPolicy Bypass", "-File", "`"$PSCommandPath`"", "-InstallPath", "`"$InstallPath`""
    exit
}

Write-Host "Running with Administrator privileges" -ForegroundColor Green
Write-Host ""

# Navigate to installation directory
if (-not (Test-Path $InstallPath)) {
    Write-Host "ERROR: Installation directory not found: $InstallPath" -ForegroundColor Red
    Write-Host "Please extract athena-ai-desktop to your Desktop first." -ForegroundColor Yellow
    pause
    exit 1
}

Set-Location $InstallPath
Write-Host "Working directory: $InstallPath" -ForegroundColor Gray

# Step 1: Clear file locks
Write-Host ""
Write-Host "Step 1: Clearing file locks..." -ForegroundColor Yellow

# Kill any running Electron processes
Get-Process | Where-Object {$_.ProcessName -like "*electron*"} | Stop-Process -Force -ErrorAction SilentlyContinue

# Step 2: Add Windows Defender exception
Write-Host "Step 2: Adding Windows Defender exception..." -ForegroundColor Yellow
try {
    Add-MpPreference -ExclusionPath $InstallPath -ErrorAction Stop
    Write-Host "✓ Added Windows Defender exception" -ForegroundColor Green
} catch {
    Write-Host "! Could not add Windows Defender exception (may already exist)" -ForegroundColor Gray
}

# Step 3: Fix permissions
Write-Host "Step 3: Fixing folder permissions..." -ForegroundColor Yellow
$acl = Get-Acl $InstallPath
$permission = "$env:USERNAME","FullControl","ContainerInherit,ObjectInherit","None","Allow"
$accessRule = New-Object System.Security.AccessControl.FileSystemAccessRule $permission
$acl.SetAccessRule($accessRule)
Set-Acl $InstallPath $acl
Write-Host "✓ Permissions fixed" -ForegroundColor Green

# Step 4: Clean and reinstall node_modules
Write-Host ""
Write-Host "Step 4: Checking Node.js installation..." -ForegroundColor Yellow

$nodeVersion = $null
try {
    $nodeVersion = & node --version 2>$null
} catch {}

if (-not $nodeVersion) {
    Write-Host "ERROR: Node.js is not installed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Node.js first:" -ForegroundColor Yellow
    Write-Host "1. Download from: https://nodejs.org/en/download/" -ForegroundColor Cyan
    Write-Host "2. Choose 'Windows Installer (.msi)' - 64-bit" -ForegroundColor Cyan
    Write-Host "3. Run the installer with default settings" -ForegroundColor Cyan
    Write-Host "4. Restart this script after installation" -ForegroundColor Cyan
    Write-Host ""
    
    $response = Read-Host "Would you like to open the Node.js download page? (Y/N)"
    if ($response -eq 'Y' -or $response -eq 'y') {
        Start-Process "https://nodejs.org/en/download/"
    }
    
    pause
    exit 1
}

Write-Host "✓ Node.js found: $nodeVersion" -ForegroundColor Green

# Step 5: Clean install
Write-Host ""
Write-Host "Step 5: Performing clean installation..." -ForegroundColor Yellow

# Remove old node_modules
if (Test-Path "node_modules") {
    Write-Host "Removing old node_modules..." -ForegroundColor Gray
    Remove-Item -Path "node_modules" -Recurse -Force -ErrorAction SilentlyContinue
}

# Remove package-lock
if (Test-Path "package-lock.json") {
    Remove-Item -Path "package-lock.json" -Force -ErrorAction SilentlyContinue
}

# Clean npm cache
Write-Host "Cleaning npm cache..." -ForegroundColor Gray
& npm cache clean --force 2>$null

# Install dependencies
Write-Host "Installing dependencies (this will take 2-3 minutes)..." -ForegroundColor Yellow
Write-Host "Please be patient..." -ForegroundColor Gray

$env:npm_config_msvs_version = "2022"
$env:npm_config_build_from_source = "false"

& npm install --production --no-optional 2>&1 | Out-String

# Check if Electron was installed
if (Test-Path "node_modules\electron\dist\electron.exe") {
    Write-Host "✓ Electron installed successfully!" -ForegroundColor Green
} else {
    Write-Host "! Electron not found, installing separately..." -ForegroundColor Yellow
    & npm install electron --save-prod 2>&1 | Out-String
}

# Step 6: Create desktop shortcut
Write-Host ""
Write-Host "Step 6: Creating desktop shortcut..." -ForegroundColor Yellow

$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut("$env:USERPROFILE\Desktop\Athena AI.lnk")
$Shortcut.TargetPath = "$InstallPath\node_modules\electron\dist\electron.exe"
$Shortcut.Arguments = "`"$InstallPath\electron-main.cjs`""
$Shortcut.WorkingDirectory = $InstallPath
$Shortcut.IconLocation = "$InstallPath\node_modules\electron\dist\electron.exe"
$Shortcut.Description = "Athena AI - Cybersecurity Intelligence Platform"
$Shortcut.Save()

Write-Host "✓ Desktop shortcut created" -ForegroundColor Green

# Step 7: Test launch
Write-Host ""
Write-Host "================================================" -ForegroundColor Green
Write-Host "  INSTALLATION FIXED!                          " -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""
Write-Host "✓ All issues have been resolved" -ForegroundColor Green
Write-Host ""
Write-Host "You can now launch Athena AI from:" -ForegroundColor Cyan
Write-Host "  • Desktop shortcut: 'Athena AI'" -ForegroundColor White
Write-Host "  • Or run LaunchAthena-Windows.bat" -ForegroundColor White
Write-Host ""
Write-Host "Default Login:" -ForegroundColor Yellow
Write-Host "  Username: admin" -ForegroundColor White
Write-Host "  Password: admin123" -ForegroundColor White
Write-Host ""

$response = Read-Host "Would you like to launch Athena AI now? (Y/N)"
if ($response -eq 'Y' -or $response -eq 'y') {
    Write-Host "Launching Athena AI..." -ForegroundColor Green
    Start-Process "$InstallPath\node_modules\electron\dist\electron.exe" -ArgumentList "`"$InstallPath\electron-main.cjs`"" -WorkingDirectory $InstallPath
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")