// Dev launcher: starts Electron, which in turn starts the API.
// electron-main.cjs decides dev vs packaged from app.isPackaged, so this script
// only needs to hand it a running Electron.
const { spawn } = require('child_process');
const electron = require('electron');

const child = spawn(electron, ['electron-main.cjs'], {
  stdio: 'inherit',
  env: { ...process.env, NODE_ENV: process.env.NODE_ENV || 'development' },
});

child.on('close', (code) => process.exit(code ?? 0));
