const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Determine if we're in production based on NODE_ENV
const isProduction = process.env.NODE_ENV === 'production';

// Check if we have a production build
const hasProductionBuild = fs.existsSync(path.join(__dirname, 'client', 'dist', 'index.html')) &&
                           fs.existsSync(path.join(__dirname, 'server-dist', 'index.js'));

if (isProduction && !hasProductionBuild) {
  console.error('ERROR: Production build not found!');
  console.error('Please run "npm run build:client && npm run build:server" first.');
  process.exit(1);
}

// Start the Express server first (only in development mode)
// In production, the server is embedded in Electron
let serverProcess = null;

async function startServer() {
  if (!isProduction) {
    console.log('Starting development server...');
    return new Promise((resolve) => {
      serverProcess = spawn('npm', ['run', 'dev'], {
        shell: true,
        stdio: 'inherit',
        env: {
          ...process.env,
          USE_SQLITE: 'true',
          NODE_ENV: 'development'
        }
      });
      
      // Wait for server to be ready
      setTimeout(resolve, 3000);
    });
  }
}

async function startElectron() {
  console.log(`Starting Electron in ${isProduction ? 'production' : 'development'} mode...`);
  
  const electronProcess = spawn(
    require('electron'),
    ['electron-main.cjs'],
    {
      stdio: 'inherit',
      env: {
        ...process.env,
        NODE_ENV: isProduction ? 'production' : 'development',
        ELECTRON_IS_DEV: isProduction ? '0' : '1',
        USE_SQLITE: 'true'
      }
    }
  );

  electronProcess.on('close', (code) => {
    if (serverProcess) {
      serverProcess.kill();
    }
    process.exit(code);
  });
}

// Start the application
async function main() {
  try {
    await startServer();
    await startElectron();
  } catch (error) {
    console.error('Failed to start application:', error);
    process.exit(1);
  }
}

main();