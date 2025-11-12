// Build script for Electron production server
const { build } = require('esbuild');
const path = require('path');
const fs = require('fs');

async function buildElectronServer() {
  console.log('Building Electron server bundle...');
  
  try {
    // Build the server as ESM, only externalizing native modules
    await build({
      entryPoints: ['server/index-electron.ts'],
      bundle: true,
      platform: 'node',
      target: 'node20',
      format: 'esm',  // Keep as ESM
      outfile: 'dist/server-electron.mjs',
      external: [
        'better-sqlite3',  // Native module
        'sqlite3',         // Native module (if used)
        'electron',        // Electron itself
      ],
      loader: {
        '.ts': 'ts',
        '.tsx': 'tsx',
        '.js': 'js',
        '.jsx': 'jsx'
      },
      define: {
        'process.env.NODE_ENV': '"production"',
        'process.env.USE_SQLITE': '"true"'
      },
      minify: false,  // Keep readable for debugging
      sourcemap: false,
    });
    
    console.log('✓ Server bundled successfully to dist/server-electron.mjs');
    
    // Copy SQLite native module to dist
    const sqliteSource = path.join('node_modules', 'better-sqlite3');
    const sqliteDest = path.join('dist', 'node_modules', 'better-sqlite3');
    
    // Create dist/node_modules directory if it doesn't exist
    if (!fs.existsSync(path.join('dist', 'node_modules'))) {
      fs.mkdirSync(path.join('dist', 'node_modules'), { recursive: true });
    }
    
    // Simple copy function for native modules
    function copyDir(src, dest) {
      fs.mkdirSync(dest, { recursive: true });
      const entries = fs.readdirSync(src, { withFileTypes: true });
      
      for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        
        if (entry.isDirectory()) {
          copyDir(srcPath, destPath);
        } else {
          fs.copyFileSync(srcPath, destPath);
        }
      }
    }
    
    // Copy better-sqlite3
    if (fs.existsSync(sqliteSource)) {
      console.log('Copying better-sqlite3 native module...');
      copyDir(sqliteSource, sqliteDest);
      console.log('✓ Native modules copied to dist/node_modules');
    }
    
    console.log('\n✅ Electron server build complete!');
    console.log('Files created:');
    console.log('  - dist/server-electron.mjs (bundled server)');
    console.log('  - dist/node_modules/better-sqlite3/ (native module)');
    
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

buildElectronServer();