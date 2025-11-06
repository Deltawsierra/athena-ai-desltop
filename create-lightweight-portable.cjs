#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Creating Lightweight Portable Athena AI Desktop...\n');

// Create portable app directory
const portableDir = path.join(__dirname, 'athena-portable');
if (fs.existsSync(portableDir)) {
  fs.rmSync(portableDir, { recursive: true });
}
fs.mkdirSync(portableDir, { recursive: true });

// Step 1: Copy essential files
console.log('📋 Copying essential files...');
const filesToCopy = [
  'electron-main.cjs',
  'electron-preload.cjs',
  'package.json',
  'athena.db',
  'electron-builder.yml'
];

filesToCopy.forEach(file => {
  if (fs.existsSync(file)) {
    fs.copyFileSync(file, path.join(portableDir, file));
    console.log(`  ✓ Copied ${file}`);
  }
});

// Step 2: Copy directories (excluding node_modules)
const copyDir = (src, dest) => {
  if (!fs.existsSync(src)) return;
  
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== '.git') {
      copyDir(srcPath, destPath);
    } else if (entry.isFile()) {
      fs.copyFileSync(srcPath, destPath);
    }
  }
};

const dirsToCopy = [
  { src: 'server', dest: 'server' },
  { src: 'shared', dest: 'shared' },
  { src: 'client/dist', dest: 'client/dist' },
  { src: 'build', dest: 'build' },
  { src: 'attached_assets', dest: 'attached_assets' }
];

dirsToCopy.forEach(({ src, dest }) => {
  const destPath = path.join(portableDir, dest);
  if (fs.existsSync(src)) {
    copyDir(src, destPath);
    console.log(`  ✓ Copied ${src}`);
  }
});

// Step 3: Create install script
const installScript = `#!/bin/bash
echo "🚀 Installing Athena AI Desktop Dependencies..."
echo "This will take a few minutes on first run..."
npm install --production
echo "✅ Installation complete!"
echo "You can now run the application with ./run.sh"
`;

fs.writeFileSync(path.join(portableDir, 'install.sh'), installScript);
fs.chmodSync(path.join(portableDir, 'install.sh'), 0o755);

// Step 4: Create run script
const runScript = `#!/bin/bash
echo "🚀 Starting Athena AI Desktop..."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "⚠️  Dependencies not installed. Running install.sh first..."
    ./install.sh
fi

# Run with electron
if [ -f "node_modules/.bin/electron" ]; then
    ./node_modules/.bin/electron electron-main.cjs
else
    echo "❌ Error: Electron not found. Please run ./install.sh first"
    exit 1
fi
`;

fs.writeFileSync(path.join(portableDir, 'run.sh'), runScript);
fs.chmodSync(path.join(portableDir, 'run.sh'), 0o755);

// Step 5: Create Windows batch files
const installBat = `@echo off
echo Installing Athena AI Desktop Dependencies...
echo This will take a few minutes on first run...
npm install --production
echo.
echo Installation complete!
echo You can now run the application with run.bat
pause
`;

fs.writeFileSync(path.join(portableDir, 'install.bat'), installBat);

const runBat = `@echo off
echo Starting Athena AI Desktop...

if not exist node_modules (
    echo Dependencies not installed. Running install.bat first...
    call install.bat
)

if exist node_modules\\electron\\dist\\electron.exe (
    node_modules\\electron\\dist\\electron.exe electron-main.cjs
) else (
    echo Error: Electron not found. Please run install.bat first
    pause
)
`;

fs.writeFileSync(path.join(portableDir, 'run.bat'), runBat);

// Step 6: Create README
const readme = `# Athena AI Desktop - Portable Edition

## 🚀 Quick Start

### First Time Setup (Required Once)
1. Extract this folder to your desired location (e.g., Desktop)
2. Install dependencies:
   - **Windows**: Double-click "install.bat"
   - **Mac/Linux**: Run "./install.sh" in terminal

### Running the Application
After installation:
- **Windows**: Double-click "run.bat"
- **Mac/Linux**: Run "./run.sh" in terminal

## 📋 System Requirements
- Node.js 16 or later
- 2GB RAM minimum
- 500MB disk space

## 🔐 Default Login Credentials
- **Admin**: username "admin", password "admin123"
- **Test User**: username "testuser", password "password123"

## 💡 Features
- ✅ Fully offline operation
- ✅ Local SQLite database
- ✅ JARVIS-inspired interface
- ✅ Real-time threat monitoring
- ✅ CVE classification
- ✅ Penetration testing
- ✅ Audit logging

## 🔧 Troubleshooting

### If the app doesn't start:
1. Ensure Node.js is installed (run "node --version" in terminal)
2. Delete node_modules folder and run install script again
3. Check that all files were extracted properly

### Database Issues:
- Your data is stored in "athena.db" file
- To reset: Delete athena.db and restart the app

## 📁 File Structure
- athena.db - Local database
- server/ - Backend code
- client/dist/ - Frontend application
- electron-main.cjs - Desktop app entry point

## 🛠️ For Developers
To run in development mode:
1. Install all dependencies: npm install
2. Start dev server: npm run dev

---
Built with ❤️ using Electron, React, and SQLite
`;

fs.writeFileSync(path.join(portableDir, 'README.md'), readme);

// Step 7: Create package.json with exact dependencies
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
// Keep only production dependencies
delete packageJson.devDependencies;
packageJson.scripts = {
  start: "electron electron-main.cjs",
  postinstall: "electron-rebuild"
};
fs.writeFileSync(
  path.join(portableDir, 'package.json'), 
  JSON.stringify(packageJson, null, 2)
);

console.log('\n' + '='.repeat(60));
console.log('✅ LIGHTWEIGHT PORTABLE APP CREATED!');
console.log('='.repeat(60));
console.log('\n📁 Location: ./athena-portable/');
console.log('\n📦 Size: ~15MB (without dependencies)');
console.log('\n🚀 To use:');
console.log('   1. Copy "athena-portable" folder to desired location');
console.log('   2. Run install script (first time only)');
console.log('   3. Run the application with run script');
console.log('\n💡 The app will download dependencies on first run');
console.log('   (requires internet connection for initial setup)');
console.log('='.repeat(60));