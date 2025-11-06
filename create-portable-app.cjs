#!/usr/bin/env node

/**
 * Create a portable Electron app that can be run directly
 * This creates a simpler setup that can be dragged to desktop
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Creating Portable Athena AI Desktop Application...\n');

// Create portable app directory
const portableDir = path.join(__dirname, 'athena-ai-desktop');
if (fs.existsSync(portableDir)) {
  fs.rmSync(portableDir, { recursive: true });
}
fs.mkdirSync(portableDir, { recursive: true });

// Step 1: Copy Electron files
console.log('📋 Copying application files...');
const filesToCopy = [
  'electron-main.cjs',
  'electron-preload.cjs',
  'package.json',
  'athena.db'
];

filesToCopy.forEach(file => {
  if (fs.existsSync(file)) {
    fs.copyFileSync(file, path.join(portableDir, file));
    console.log(`  ✓ Copied ${file}`);
  }
});

// Step 2: Copy directories
const dirsToCopy = [
  { src: 'server', dest: 'server' },
  { src: 'shared', dest: 'shared' },
  { src: 'client/dist', dest: 'client/dist' },
  { src: 'build', dest: 'build' }
];

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

dirsToCopy.forEach(({ src, dest }) => {
  const destPath = path.join(portableDir, dest);
  if (fs.existsSync(src)) {
    copyDir(src, destPath);
    console.log(`  ✓ Copied ${src} directory`);
  }
});

// Step 3: Copy minimal node_modules (only essential packages)
console.log('\n📦 Copying essential dependencies...');
const essentialPackages = [
  'electron',
  'better-sqlite3',
  'express',
  'express-session',
  'drizzle-orm',
  '@radix-ui',
  '@tanstack',
  'lucide-react',
  'react',
  'react-dom',
  'wouter',
  'framer-motion',
  'clsx',
  'tailwind-merge',
  'zod'
];

const modulesDir = path.join(portableDir, 'node_modules');
fs.mkdirSync(modulesDir, { recursive: true });

// Copy package directories
const copyModules = (moduleName) => {
  const srcPath = path.join('node_modules', moduleName);
  const destPath = path.join(modulesDir, moduleName);
  
  if (fs.existsSync(srcPath)) {
    copyDir(srcPath, destPath);
    return true;
  }
  return false;
};

// Copy all node_modules for simplicity (this ensures all dependencies are included)
console.log('  Copying all node_modules (this may take a moment)...');
copyDir('node_modules', modulesDir);
console.log('  ✓ Dependencies copied');

// Step 4: Create run scripts
console.log('\n🎯 Creating run scripts...');

// Windows batch file
const batchScript = `@echo off
echo Starting Athena AI Desktop...
cd /d "%~dp0"
if exist node_modules\\electron\\dist\\electron.exe (
    node_modules\\electron\\dist\\electron.exe electron-main.cjs
) else (
    echo Error: Electron not found. Please ensure node_modules are properly installed.
    pause
)`;

fs.writeFileSync(path.join(portableDir, 'Run-AthenaAI.bat'), batchScript);
console.log('  ✓ Created Run-AthenaAI.bat (for Windows)');

// Unix shell script
const shellScript = `#!/bin/bash
echo "Starting Athena AI Desktop..."
cd "$(dirname "$0")"

# Check if electron exists
if [ -f "node_modules/electron/dist/electron" ]; then
    ./node_modules/electron/dist/electron electron-main.cjs
elif [ -f "node_modules/.bin/electron" ]; then
    ./node_modules/.bin/electron electron-main.cjs
else
    echo "Error: Electron not found. Please ensure node_modules are properly installed."
    exit 1
fi`;

fs.writeFileSync(path.join(portableDir, 'Run-AthenaAI.sh'), shellScript);
fs.chmodSync(path.join(portableDir, 'Run-AthenaAI.sh'), 0o755);
console.log('  ✓ Created Run-AthenaAI.sh (for Linux/Mac)');

// Step 5: Create desktop entry file for Linux
const desktopEntry = `[Desktop Entry]
Name=Athena AI
Comment=Cybersecurity Intelligence Platform
Exec=${portableDir}/Run-AthenaAI.sh
Icon=${portableDir}/build/icon.png
Terminal=false
Type=Application
Categories=Development;Security;`;

fs.writeFileSync(path.join(portableDir, 'AthenaAI.desktop'), desktopEntry);
fs.chmodSync(path.join(portableDir, 'AthenaAI.desktop'), 0o755);
console.log('  ✓ Created AthenaAI.desktop (Linux desktop entry)');

// Step 6: Create README
const readme = `# Athena AI Desktop Application

## How to Run

### Windows:
1. Double-click "Run-AthenaAI.bat"
2. The application will start automatically

### Linux/Mac:
1. Open terminal in this folder
2. Run: ./Run-AthenaAI.sh
3. Or double-click the script if your system allows

### Desktop Shortcut (Linux):
1. Copy AthenaAI.desktop to your desktop
2. Right-click and select "Allow Launching" or similar
3. Double-click to run

## Default Login Credentials
- Admin: username "admin", password "admin123"
- User: username "testuser", password "password123"

## Troubleshooting
If the app doesn't start:
1. Ensure all files were extracted properly
2. Check that node_modules folder exists
3. Try running from terminal to see error messages

## Data Storage
Your data is stored locally in the athena.db file within this folder.
`;

fs.writeFileSync(path.join(portableDir, 'README.txt'), readme);
console.log('  ✓ Created README.txt');

// Step 7: Create a simple icon if missing
const iconPath = path.join(portableDir, 'build', 'icon.png');
if (!fs.existsSync(iconPath)) {
  fs.mkdirSync(path.join(portableDir, 'build'), { recursive: true });
  // Create a simple 64x64 blue square as placeholder
  const iconData = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
  fs.writeFileSync(iconPath, Buffer.from(iconData, 'base64'));
  console.log('  ✓ Created placeholder icon');
}

// Final message
console.log('\n' + '='.repeat(60));
console.log('✅ PORTABLE APP CREATED SUCCESSFULLY!');
console.log('='.repeat(60));
console.log('\n📁 Location: ./athena-ai-desktop/');
console.log('\n📋 To use the application:');
console.log('   1. Navigate to the "athena-ai-desktop" folder');
console.log('   2. Double-click the appropriate run script:');
console.log('      - Windows: Run-AthenaAI.bat');
console.log('      - Linux/Mac: Run-AthenaAI.sh');
console.log('\n💡 You can drag the entire "athena-ai-desktop" folder');
console.log('   to your desktop or any location you prefer!');
console.log('\n🔐 Login with: admin/admin123 or testuser/password123');
console.log('='.repeat(60));