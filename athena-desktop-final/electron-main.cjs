const { app, BrowserWindow, Menu, shell } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');

// Keep a global reference of the window object
let mainWindow;
let serverProcess;

// Enable live reload for Electron in development
if (isDev) {
  require('electron-reload')(__dirname, {
    electron: path.join(__dirname, 'node_modules', '.bin', 'electron'),
    hardResetMethod: 'exit'
  });
}

async function startExpressServer() {
  // In production, the server is bundled with the app
  // In development, we start the existing server
  if (!isDev) {
    // For production, we'll start the server (handles both .js and .ts)
    try {
      require('./server-dist/index.js');
    } catch (err) {
      // If JS doesn't exist, try TypeScript with tsx
      require('./server-dist/index.ts');
    }
  } else {
    // In development, we can use the existing npm run dev setup
    const { spawn } = require('child_process');
    serverProcess = spawn('npm', ['run', 'dev'], {
      shell: true,
      env: { 
        ...process.env, 
        ELECTRON_RUN_AS_NODE: '1',
        USE_SQLITE: 'true',  // Tell the server to use SQLite storage
        NODE_ENV: 'development'
      },
      stdio: 'inherit'
    });
  }

  // Wait a bit for the server to start
  return new Promise(resolve => setTimeout(resolve, 3000));
}

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    icon: path.join(__dirname, 'assets/icon.png'), // Add an icon later
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'electron-preload.cjs')
    },
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    backgroundColor: '#0a0a0a',
    show: false // Don't show until ready
  });

  // Create app menu
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Reload',
          accelerator: 'CmdOrCtrl+R',
          click: () => mainWindow.reload()
        },
        {
          label: 'Toggle Developer Tools',
          accelerator: isDev ? 'CmdOrCtrl+Shift+I' : '',
          click: () => mainWindow.webContents.toggleDevTools()
        },
        { type: 'separator' },
        {
          label: 'Exit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => app.quit()
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { label: 'Undo', accelerator: 'CmdOrCtrl+Z', selector: 'undo:' },
        { label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', selector: 'redo:' },
        { type: 'separator' },
        { label: 'Cut', accelerator: 'CmdOrCtrl+X', selector: 'cut:' },
        { label: 'Copy', accelerator: 'CmdOrCtrl+C', selector: 'copy:' },
        { label: 'Paste', accelerator: 'CmdOrCtrl+V', selector: 'paste:' },
        { label: 'Select All', accelerator: 'CmdOrCtrl+A', selector: 'selectAll:' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { label: 'Actual Size', accelerator: 'CmdOrCtrl+0', click: () => mainWindow.webContents.setZoomLevel(0) },
        { label: 'Zoom In', accelerator: 'CmdOrCtrl+Plus', click: () => {
          const currentZoom = mainWindow.webContents.getZoomLevel();
          mainWindow.webContents.setZoomLevel(currentZoom + 1);
        }},
        { label: 'Zoom Out', accelerator: 'CmdOrCtrl+-', click: () => {
          const currentZoom = mainWindow.webContents.getZoomLevel();
          mainWindow.webContents.setZoomLevel(currentZoom - 1);
        }},
        { type: 'separator' },
        { label: 'Toggle Fullscreen', accelerator: 'F11', click: () => {
          mainWindow.setFullScreen(!mainWindow.isFullScreen());
        }}
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About Athena AI',
          click: () => {
            const { dialog } = require('electron');
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About Athena AI',
              message: 'Athena AI - Cybersecurity Intelligence Platform',
              detail: 'Version 1.0.0\n\nA JARVIS-inspired cybersecurity dashboard with advanced AI capabilities.',
              buttons: ['OK']
            });
          }
        }
      ]
    }
  ];

  // macOS specific menu adjustments
  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        { label: 'About ' + app.getName(), selector: 'orderFrontStandardAboutPanel:' },
        { type: 'separator' },
        { label: 'Services', submenu: [] },
        { type: 'separator' },
        { label: 'Hide ' + app.getName(), accelerator: 'Cmd+H', selector: 'hide:' },
        { label: 'Hide Others', accelerator: 'Cmd+Shift+H', selector: 'hideOtherApplications:' },
        { label: 'Show All', selector: 'unhideAllApplications:' },
        { type: 'separator' },
        { label: 'Quit', accelerator: 'Cmd+Q', click: () => app.quit() }
      ]
    });
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  // Load the app
  const startUrl = isDev 
    ? 'http://localhost:5000' 
    : `file://${path.join(__dirname, 'client/dist/index.html')}`;
  
  mainWindow.loadURL(startUrl);

  // Open DevTools in development
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle external links
  mainWindow.webContents.on('new-window', (event, url) => {
    event.preventDefault();
    shell.openExternal(url);
  });
}

// This method will be called when Electron has finished initialization
app.whenReady().then(async () => {
  // Start Express server first
  console.log('Starting Express server...');
  await startExpressServer();
  
  // Then create the window
  console.log('Creating Electron window...');
  createWindow();
});

// Quit when all windows are closed
app.on('window-all-closed', () => {
  // On macOS, keep app running even when all windows are closed
  if (process.platform !== 'darwin') {
    if (serverProcess) {
      serverProcess.kill();
    }
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS, re-create window when dock icon is clicked
  if (mainWindow === null) {
    createWindow();
  }
});

// Handle app termination
app.on('before-quit', () => {
  if (serverProcess) {
    serverProcess.kill();
  }
});