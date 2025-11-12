// Build script to create a properly bundled server for Electron production
const { build } = require('esbuild');
const path = require('path');
const fs = require('fs');

async function buildServer() {
  console.log('Building bundled server for Electron production...');
  
  try {
    // Bundle the server with all dependencies except native modules
    await build({
      entryPoints: ['server/index.ts'],
      bundle: true,
      platform: 'node',
      target: 'node18',
      format: 'cjs',  // Use CommonJS for better compatibility
      outfile: 'dist/server-bundled.cjs',
      external: [
        'better-sqlite3',  // Native module, keep external
        'electron',        // Don't bundle Electron
      ],
      loader: {
        '.ts': 'ts',
        '.tsx': 'tsx',
        '.js': 'js',
        '.jsx': 'jsx'
      },
      define: {
        'process.env.NODE_ENV': '"production"'
      },
      minify: false,  // Keep readable for debugging
      sourcemap: false,
    });
    
    console.log('✓ Server bundled successfully to dist/server-bundled.cjs');
    
    // Copy SQLite native module to dist
    const sqliteSource = path.join('node_modules', 'better-sqlite3');
    const sqliteDest = path.join('dist', 'node_modules', 'better-sqlite3');
    
    // Create dist/node_modules directory
    fs.mkdirSync(path.join('dist', 'node_modules'), { recursive: true });
    
    // Copy better-sqlite3 module
    copyFolderRecursive(sqliteSource, sqliteDest);
    console.log('✓ SQLite native module copied to dist');
    
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

function copyFolderRecursive(source, target) {
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }
  
  const files = fs.readdirSync(source);
  
  files.forEach(file => {
    const sourcePath = path.join(source, file);
    const targetPath = path.join(target, file);
    
    if (fs.lstatSync(sourcePath).isDirectory()) {
      copyFolderRecursive(sourcePath, targetPath);
    } else {
      fs.copyFileSync(sourcePath, targetPath);
    }
  });
}

buildServer();