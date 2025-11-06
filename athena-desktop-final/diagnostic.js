#!/usr/bin/env node
console.log('🔍 Athena AI Desktop Diagnostic Tool\n');

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

console.log('\n📁 Checking Required Files:');
requiredFiles.forEach(file => {
  const exists = fs.existsSync(path.join(__dirname, file));
  console.log(`  ${exists ? '✓' : '✗'} ${file}`);
});

// Check for node_modules
const nodeModulesExists = fs.existsSync(path.join(__dirname, 'node_modules'));
console.log('\n📦 Dependencies:', nodeModulesExists ? 'Installed' : 'Not Installed');

if (nodeModulesExists) {
  // Check for critical modules
  const criticalModules = ['electron', 'better-sqlite3', 'express'];
  console.log('\n🔧 Critical Modules:');
  criticalModules.forEach(mod => {
    const exists = fs.existsSync(path.join(__dirname, 'node_modules', mod));
    console.log(`  ${exists ? '✓' : '✗'} ${mod}`);
  });
  
  // Check for native binding
  const bindingPath = path.join(__dirname, 'node_modules/better-sqlite3/build/Release/better_sqlite3.node');
  const bindingExists = fs.existsSync(bindingPath);
  console.log('\n🔌 Native Bindings:', bindingExists ? 'Built' : 'Not Built');
}

console.log('\n✅ Diagnostic complete!');
