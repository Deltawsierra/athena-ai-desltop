#!/usr/bin/env node

/**
 * Workaround script to build Electron desktop app
 * This handles the devDependencies issue with electron-builder
 */

const fs = require('fs');
const { spawn } = require('child_process');
const path = require('path');

async function runCommand(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    console.log(`Running: ${command} ${args.join(' ')}`);
    
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

async function buildDesktop() {
  try {
    console.log('🚀 Building Athena AI Desktop Application...\n');
    
    // Step 1: Read package.json
    const packagePath = path.join(__dirname, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    const originalPackage = JSON.stringify(packageJson, null, 2);
    
    // Step 2: Move electron packages to devDependencies temporarily
    console.log('📦 Preparing package.json for build...');
    packageJson.devDependencies = packageJson.devDependencies || {};
    
    // Move electron packages
    const electronPackages = ['electron', 'electron-builder', 'electron-is-dev', 'electron-reload'];
    electronPackages.forEach(pkg => {
      if (packageJson.dependencies[pkg]) {
        packageJson.devDependencies[pkg] = packageJson.dependencies[pkg];
        delete packageJson.dependencies[pkg];
      }
    });
    
    // Add required metadata for electron-builder
    packageJson.description = packageJson.description || 'Athena AI - Cybersecurity Intelligence Platform';
    packageJson.author = packageJson.author || 'Athena AI Team';
    packageJson.main = packageJson.main || 'electron-main.cjs';
    
    // Write modified package.json
    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
    
    // Step 3: Ensure client is built
    console.log('\n⚛️  Building React frontend...');
    if (!fs.existsSync('client/dist')) {
      await runCommand('npm', ['run', 'build:client']);
    } else {
      console.log('Frontend already built, skipping...');
    }
    
    // Step 4: Copy server files
    console.log('\n🔧 Preparing server files...');
    const serverDistDir = path.join(__dirname, 'server-dist');
    if (!fs.existsSync(serverDistDir)) {
      fs.mkdirSync(serverDistDir, { recursive: true });
    }
    
    // Copy server and shared directories
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
    
    copyRecursive('server', serverDistDir);
    copyRecursive('shared', path.join(__dirname, 'shared-dist'));
    
    // Step 5: Create build resources
    console.log('\n📋 Preparing build resources...');
    const buildDir = path.join(__dirname, 'build');
    if (!fs.existsSync(buildDir)) {
      fs.mkdirSync(buildDir);
    }
    
    // Create placeholder icon if needed
    const iconPath = path.join(buildDir, 'icon.png');
    if (!fs.existsSync(iconPath)) {
      // Create a simple 256x256 transparent PNG as placeholder
      const iconData = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
      fs.writeFileSync(iconPath, Buffer.from(iconData, 'base64'));
      console.log('Created placeholder icon (replace with actual icon)');
    }
    
    // Step 6: Run electron-builder
    console.log('\n📦 Building installer with Electron Builder...');
    const platform = process.platform === 'darwin' ? 'mac' : 
                     process.platform === 'win32' ? 'win' : 'linux';
    
    await runCommand('npx', ['electron-builder', `--${platform}`, '-c', 'electron-builder.yml']);
    
    // Step 7: Restore original package.json
    console.log('\n♻️  Restoring original package.json...');
    fs.writeFileSync(packagePath, originalPackage);
    
    console.log('\n✅ Build complete! Check the dist-electron directory for your installer.');
    console.log('📁 Location: dist-electron/');
    
    // List created files
    const distDir = path.join(__dirname, 'dist-electron');
    if (fs.existsSync(distDir)) {
      const files = fs.readdirSync(distDir);
      console.log('\n📦 Created files:');
      files.forEach(file => {
        const stats = fs.statSync(path.join(distDir, file));
        const size = (stats.size / 1024 / 1024).toFixed(2);
        console.log(`  - ${file} (${size} MB)`);
      });
    }
    
  } catch (error) {
    console.error(`\n❌ Build failed: ${error.message}`);
    
    // Restore package.json on error
    const packagePath = path.join(__dirname, 'package.json');
    const packageBackup = path.join(__dirname, 'package.backup.json');
    if (fs.existsSync(packageBackup)) {
      fs.copyFileSync(packageBackup, packagePath);
    }
    
    process.exit(1);
  }
}

// Run the build
buildDesktop();