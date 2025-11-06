#!/usr/bin/env node
const { spawn } = require('child_process');
const path = require('path');

// This script runs the Electron app in development mode
// It starts the Express server and then launches Electron

console.log('Starting Athena AI Desktop Application...\n');

// Start the Express server
const serverProcess = spawn('npm', ['run', 'dev'], {
  shell: true,
  stdio: 'inherit',
  env: { ...process.env, ELECTRON_RUN_AS_NODE: '1' }
});

// Wait a bit for the server to start
setTimeout(() => {
  console.log('\nLaunching Electron window...');
  
  // Start Electron
  const electronProcess = spawn('npx', ['electron', 'electron-main.cjs'], {
    shell: true,
    stdio: 'inherit'
  });
  
  // Handle Electron process exit
  electronProcess.on('close', (code) => {
    console.log(`\nElectron process exited with code ${code}`);
    serverProcess.kill();
    process.exit(code);
  });
}, 3000);

// Handle script termination
process.on('SIGINT', () => {
  console.log('\nShutting down Athena AI...');
  serverProcess.kill();
  process.exit(0);
});