// Build script for creating Electron distribution package
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('========================================');
console.log('Building Athena AI for Distribution');
console.log('========================================\n');

function runCommand(command, description) {
  console.log(`\n${description}...`);
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`✓ ${description} complete`);
    return true;
  } catch (error) {
    console.error(`✗ ${description} failed:`, error.message);
    return false;
  }
}

// Step 1: Build frontend with Vite
if (!runCommand('npx vite build', 'Building frontend')) {
  process.exit(1);
}

// Step 2: Build Electron server bundle
if (!runCommand('node build-electron-server.cjs', 'Building Electron server')) {
  process.exit(1);
}

// Step 3: Copy essential files for Electron
console.log('\nPreparing distribution files...');

// Ensure electron-main.cjs exists in dist for electron-builder
const mainPath = path.join(__dirname, 'electron-main.cjs');
const distMainPath = path.join(__dirname, 'dist', 'electron-main.cjs');
if (fs.existsSync(mainPath)) {
  fs.copyFileSync(mainPath, distMainPath);
  console.log('✓ Copied electron-main.cjs to dist');
}

// Copy preload script if exists
const preloadPath = path.join(__dirname, 'electron-preload.cjs');
const distPreloadPath = path.join(__dirname, 'dist', 'electron-preload.cjs');
if (fs.existsSync(preloadPath)) {
  fs.copyFileSync(preloadPath, distPreloadPath);
  console.log('✓ Copied electron-preload.cjs to dist');
}

console.log('\n========================================');
console.log('Build complete! Ready for packaging.');
console.log('========================================');
console.log('\nNow run one of these commands:');
console.log('  npx electron-builder        (all platforms)');
console.log('  npx electron-builder --win  (Windows only)');
console.log('  npx electron-builder --mac  (macOS only)');
console.log('  npx electron-builder --linux (Linux only)');