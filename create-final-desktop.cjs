#!/usr/bin/env node

/**
 * Create final portable desktop application with all fixes
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Creating Final Athena AI Desktop Application...\n');

// Create portable app directory
const portableDir = path.join(__dirname, 'athena-desktop-final');
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

// Step 3: Create setup script that handles native module rebuilding
const setupScript = `#!/bin/bash
echo "🚀 Setting up Athena AI Desktop..."
echo "This will install dependencies and prepare the application..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install --production

# Rebuild native modules
echo "🔧 Rebuilding native modules..."
cd node_modules/better-sqlite3
npm run install
cd ../..

echo "✅ Setup complete! You can now run the application."
`;

fs.writeFileSync(path.join(portableDir, 'setup.sh'), setupScript);
fs.chmodSync(path.join(portableDir, 'setup.sh'), 0o755);

// Step 4: Create run script
const runScript = `#!/bin/bash
echo "🚀 Starting Athena AI Desktop..."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "⚠️  Dependencies not installed. Running setup first..."
    ./setup.sh
fi

# Check if better-sqlite3 is properly built
if [ ! -f "node_modules/better-sqlite3/build/Release/better_sqlite3.node" ]; then
    echo "🔧 Rebuilding native modules..."
    cd node_modules/better-sqlite3
    npm run install
    cd ../..
fi

# Run the application
if [ -f "node_modules/.bin/electron" ]; then
    echo "🖥️  Launching Athena AI Desktop..."
    ./node_modules/.bin/electron electron-main.cjs
else
    echo "❌ Error: Electron not found. Please run ./setup.sh first"
    exit 1
fi
`;

fs.writeFileSync(path.join(portableDir, 'run.sh'), runScript);
fs.chmodSync(path.join(portableDir, 'run.sh'), 0o755);

// Step 5: Create Windows batch files
const setupBat = `@echo off
echo Setting up Athena AI Desktop...
echo This will install dependencies and prepare the application...

echo.
echo Installing dependencies...
call npm install --production

echo.
echo Rebuilding native modules...
cd node_modules\\better-sqlite3
call npm run install
cd ..\\..

echo.
echo Setup complete! You can now run the application.
pause
`;

fs.writeFileSync(path.join(portableDir, 'setup.bat'), setupBat);

const runBat = `@echo off
echo Starting Athena AI Desktop...

if not exist node_modules (
    echo Dependencies not installed. Running setup first...
    call setup.bat
)

if not exist node_modules\\better-sqlite3\\build\\Release\\better_sqlite3.node (
    echo Rebuilding native modules...
    cd node_modules\\better-sqlite3
    call npm run install
    cd ..\\..
)

if exist node_modules\\electron\\dist\\electron.exe (
    echo Launching Athena AI Desktop...
    node_modules\\electron\\dist\\electron.exe electron-main.cjs
) else (
    echo Error: Electron not found. Please run setup.bat first
    pause
)
`;

fs.writeFileSync(path.join(portableDir, 'run.bat'), runBat);

// Step 6: Create comprehensive README
const readme = `# Athena AI Desktop Application

## 🚀 Quick Start Guide

### Installation (First Time Only)

#### Windows:
1. Extract this folder to your desired location
2. Double-click **setup.bat**
3. Wait for installation to complete

#### Mac/Linux:
1. Extract this folder to your desired location
2. Open terminal in this folder
3. Run: **./setup.sh**
4. Wait for installation to complete

### Running the Application

#### Windows:
- Double-click **run.bat**

#### Mac/Linux:
- Run: **./run.sh** in terminal

## 📋 System Requirements

- **Node.js**: Version 16 or later
- **RAM**: 2GB minimum (4GB recommended)
- **Disk Space**: 500MB for installation
- **OS**: Windows 10+, macOS 10.14+, Ubuntu 18.04+ (or similar Linux)

## 🔐 Login Credentials

| User Type | Username | Password |
|-----------|----------|----------|
| Administrator | admin | admin123 |
| Test User | testuser | password123 |

## ✨ Features

- **Fully Offline Operation**: No internet required after setup
- **Local SQLite Database**: All data stored locally
- **JARVIS-Inspired Interface**: Futuristic cybersecurity UI
- **Comprehensive Security Tools**:
  - Real-time Threat Monitoring Dashboard
  - CVE Classification System
  - Automated Penetration Testing
  - Security Audit Logging
  - Client & Test Management
  - AI-Powered Analysis Tools

## 🔧 Troubleshooting

### Application Won't Start

1. **Verify Node.js Installation**
   - Open terminal/command prompt
   - Run: \`node --version\`
   - Should show v16.0.0 or higher

2. **Rebuild Native Modules**
   - Delete the \`node_modules\` folder
   - Run setup script again

3. **Check for Errors**
   - Run from terminal/command prompt to see error messages
   - Check \`athena.db\` file exists

### Database Issues

- **Reset Database**: Delete \`athena.db\` file and restart
- **Backup Data**: Copy \`athena.db\` to save your data

### Missing Dependencies on Linux

If you see library errors, install:
\`\`\`bash
sudo apt-get update
sudo apt-get install -y \\
  libglib2.0-0 libgtk-3-0 libnss3 \\
  libatk1.0-0 libatk-bridge2.0-0 \\
  libcups2 libx11-6 libxcomposite1 \\
  libxdamage1 libxfixes3 libxrandr2 \\
  libgbm1 libasound2 libxss1 libxtst6
\`\`\`

## 📁 File Structure

- **athena.db** - Local SQLite database
- **server/** - Backend application code
- **client/dist/** - Frontend application
- **electron-main.cjs** - Desktop app entry point
- **setup.sh/.bat** - Installation scripts
- **run.sh/.bat** - Launch scripts

## 🛠️ Development Mode

For developers who want to modify the application:

1. Install all dependencies: \`npm install\`
2. Start development server: \`npm run dev\`
3. Build for production: \`npm run build\`

## 🆘 Support

If you encounter issues:
1. Check this README for solutions
2. Run from terminal to see detailed error messages
3. Ensure all system requirements are met

## 📝 License

Athena AI Desktop - Cybersecurity Intelligence Platform
Built with Electron, React, TypeScript, and SQLite

---
Version 1.0.0 | Ready for offline deployment
`;

fs.writeFileSync(path.join(portableDir, 'README.md'), readme);

// Step 7: Create a simple diagnostic script
const diagnosticScript = `#!/usr/bin/env node
console.log('🔍 Athena AI Desktop Diagnostic Tool\\n');

const fs = require('fs');
const path = require('path');

// Check Node.js version
console.log('Node.js Version:', process.version);
console.log('Platform:', process.platform);
console.log('Architecture:', process.arch);

// Check for required files
const requiredFiles = [
  'electron-main.cjs',
  'package.json',
  'athena.db',
  'server/index.ts',
  'client/dist/index.html'
];

console.log('\\n📁 Checking Required Files:');
requiredFiles.forEach(file => {
  const exists = fs.existsSync(path.join(__dirname, file));
  console.log(\`  \${exists ? '✓' : '✗'} \${file}\`);
});

// Check for node_modules
const nodeModulesExists = fs.existsSync(path.join(__dirname, 'node_modules'));
console.log('\\n📦 Dependencies:', nodeModulesExists ? 'Installed' : 'Not Installed');

if (nodeModulesExists) {
  // Check for critical modules
  const criticalModules = ['electron', 'better-sqlite3', 'express'];
  console.log('\\n🔧 Critical Modules:');
  criticalModules.forEach(mod => {
    const exists = fs.existsSync(path.join(__dirname, 'node_modules', mod));
    console.log(\`  \${exists ? '✓' : '✗'} \${mod}\`);
  });
  
  // Check for native binding
  const bindingPath = path.join(__dirname, 'node_modules/better-sqlite3/build/Release/better_sqlite3.node');
  const bindingExists = fs.existsSync(bindingPath);
  console.log('\\n🔌 Native Bindings:', bindingExists ? 'Built' : 'Not Built');
}

console.log('\\n✅ Diagnostic complete!');
`;

fs.writeFileSync(path.join(portableDir, 'diagnostic.js'), diagnosticScript);
fs.chmodSync(path.join(portableDir, 'diagnostic.js'), 0o755);

console.log('\n' + '='.repeat(60));
console.log('✅ FINAL DESKTOP APPLICATION CREATED!');
console.log('='.repeat(60));
console.log('\n📁 Location: ./athena-desktop-final/');
console.log('\n📦 Package Size: ~20MB (without dependencies)');
console.log('\n🚀 Installation Instructions:');
console.log('   1. Copy "athena-desktop-final" folder to desired location');
console.log('   2. Run setup script (first time only):');
console.log('      - Windows: Double-click setup.bat');
console.log('      - Mac/Linux: Run ./setup.sh');
console.log('   3. Launch the application:');
console.log('      - Windows: Double-click run.bat');
console.log('      - Mac/Linux: Run ./run.sh');
console.log('\n🔐 Login: admin/admin123 or testuser/password123');
console.log('\n🔍 Troubleshooting: Run diagnostic.js to check setup');
console.log('='.repeat(60));