#!/usr/bin/env node

/**
 * Script to ensure better-sqlite3 is properly built for the current platform
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Ensuring better-sqlite3 is properly built...\n');

try {
  // Check if better-sqlite3 exists
  const sqlitePath = path.join(__dirname, 'node_modules', 'better-sqlite3');
  if (!fs.existsSync(sqlitePath)) {
    console.log('❌ better-sqlite3 not found. Please run npm install first.');
    process.exit(1);
  }

  // Rebuild better-sqlite3
  console.log('📦 Rebuilding better-sqlite3 native bindings...');
  process.chdir(sqlitePath);
  execSync('npm run install', { stdio: 'inherit' });
  
  // Verify the build
  const bindingPaths = [
    'build/Release/better_sqlite3.node',
    'lib/binding/node-v115-linux-x64/better_sqlite3.node',
    'build/better_sqlite3.node'
  ];
  
  let found = false;
  for (const bindingPath of bindingPaths) {
    if (fs.existsSync(path.join(sqlitePath, bindingPath))) {
      console.log(`✅ Found native binding at: ${bindingPath}`);
      found = true;
      break;
    }
  }
  
  if (!found) {
    console.log('⚠️  Native binding not found in expected locations, but rebuild completed.');
  }
  
  console.log('\n✅ better-sqlite3 rebuild complete!');
  
} catch (error) {
  console.error('❌ Error rebuilding better-sqlite3:', error.message);
  process.exit(1);
}