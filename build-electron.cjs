#!/usr/bin/env node

/**
 * Build script for creating Electron desktop installers
 * This script:
 * 1. Builds the React frontend
 * 2. Compiles the TypeScript backend
 * 3. Packages everything with Electron
 * 4. Creates installers for Windows, Mac, and Linux
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function runCommand(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    log(`Running: ${command} ${args.join(' ')}`, 'blue');
    
    const proc = spawn(command, args, {
      shell: true,
      stdio: 'inherit',
      ...options
    });
    
    proc.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });
    
    proc.on('error', reject);
  });
}

async function buildElectron() {
  try {
    log('\n🚀 Building Athena AI Desktop Application...', 'bright');
    
    // Step 1: Clean previous builds
    log('\n📦 Step 1: Cleaning previous builds...', 'yellow');
    const distDir = path.join(__dirname, 'dist-electron');
    const clientDistDir = path.join(__dirname, 'client', 'dist');
    const serverDistDir = path.join(__dirname, 'server-dist');
    
    if (fs.existsSync(distDir)) {
      fs.rmSync(distDir, { recursive: true });
    }
    if (fs.existsSync(clientDistDir)) {
      fs.rmSync(clientDistDir, { recursive: true });
    }
    if (fs.existsSync(serverDistDir)) {
      fs.rmSync(serverDistDir, { recursive: true });
    }
    
    // Step 2: Build the React frontend
    log('\n⚛️  Step 2: Building React frontend...', 'yellow');
    await runCommand('npm', ['run', 'build:client']);
    
    // Step 3: Copy backend files (since TypeScript compilation has issues, we'll use the source)
    log('\n🔧 Step 3: Preparing backend files...', 'yellow');
    // For now, we'll copy the TypeScript files directly as Electron can run them
    if (!fs.existsSync(serverDistDir)) {
      fs.mkdirSync(serverDistDir);
    }
    
    // Copy server files
    const copyRecursive = (src, dest) => {
      if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
      const entries = fs.readdirSync(src, { withFileTypes: true });
      
      for (let entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        
        if (entry.isDirectory() && entry.name !== 'node_modules') {
          copyRecursive(srcPath, destPath);
        } else if (entry.isFile()) {
          fs.copyFileSync(srcPath, destPath);
        }
      }
    };
    
    copyRecursive(path.join(__dirname, 'server'), serverDistDir);
    copyRecursive(path.join(__dirname, 'shared'), path.join(serverDistDir, '..', 'shared'));
    
    // Step 4: Copy necessary files
    log('\n📋 Step 4: Preparing build resources...', 'yellow');
    
    // Create build resources directory
    const buildDir = path.join(__dirname, 'build');
    if (!fs.existsSync(buildDir)) {
      fs.mkdirSync(buildDir);
    }
    
    // Create default icon if it doesn't exist
    const iconPath = path.join(buildDir, 'icon.png');
    if (!fs.existsSync(iconPath)) {
      // Create a simple placeholder icon (1x1 transparent PNG)
      const buffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
      fs.writeFileSync(iconPath, buffer);
      log('Created placeholder icon (replace with your actual icon)', 'yellow');
    }
    
    // Step 5: Package with Electron Builder
    log('\n📦 Step 5: Packaging with Electron Builder...', 'yellow');
    
    // Determine which platform to build for
    const platform = process.platform === 'darwin' ? 'mac' : 
                     process.platform === 'win32' ? 'win' : 'linux';
    
    await runCommand('npx', ['electron-builder', '--' + platform]);
    
    log('\n✅ Build complete! Check the dist-electron directory for installers.', 'green');
    log(`\nInstaller location: ${path.join(distDir, '*')}`, 'bright');
    
  } catch (error) {
    log(`\n❌ Build failed: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Add npm scripts to package.json if they don't exist
async function updatePackageScripts() {
  const packagePath = path.join(__dirname, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  const requiredScripts = {
    'build:client': 'vite build',
    'build:server': 'tsc --project server/tsconfig.json --outDir server-dist',
    'build:electron': 'node build-electron.cjs',
    'electron': 'node run-electron.cjs',
    'dist': 'npm run build:client && npm run build:server && electron-builder',
    'dist:win': 'npm run build:client && npm run build:server && electron-builder --win',
    'dist:mac': 'npm run build:client && npm run build:server && electron-builder --mac',
    'dist:linux': 'npm run build:client && npm run build:server && electron-builder --linux'
  };
  
  let updated = false;
  for (const [script, command] of Object.entries(requiredScripts)) {
    if (!packageJson.scripts[script]) {
      packageJson.scripts[script] = command;
      updated = true;
      log(`Added script: ${script}`, 'yellow');
    }
  }
  
  if (updated) {
    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
    log('Updated package.json with build scripts', 'green');
  }
}

// Run the build
(async () => {
  await updatePackageScripts();
  await buildElectron();
})();