const { app, BrowserWindow, Menu, shell, protocol, net } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const fs = require('fs');
const { pathToFileURL } = require('url');

// Keep a global reference of the window object
let mainWindow;
let serverProcess;

// In production, disable security warnings since we've made conscious security decisions
// We use 'unsafe-eval' for React Query/Vite compatibility which triggers warnings
if (!isDev) {
  process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';
}

// Register custom protocol scheme before app is ready
protocol.registerSchemesAsPrivileged([
  { 
    scheme: 'app', 
    privileges: { 
      secure: true, 
      standard: true, 
      supportFetchAPI: true,
      corsEnabled: true 
    } 
  }
]);

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
    // For production, run the bundled server
    try {
      // Set environment for production server
      process.env.NODE_ENV = 'production';
      process.env.USE_SQLITE = 'true';
      
      // Import and start the production server
      const { pathToFileURL } = require('url');
      const fs = require('fs');
      const serverPath = path.join(__dirname, 'dist', 'index.js');
      
      console.log('Looking for production server at:', serverPath);
      
      if (fs.existsSync(serverPath)) {
        // Convert Windows path to file URL for proper import
        const serverUrl = pathToFileURL(serverPath).href;
        console.log('Loading production server from:', serverUrl);
        
        await import(serverUrl);
        console.log('Production server started successfully');
      } else {
        const errorMsg = `Production server bundle not found at: ${serverPath}\nPlease run 'npm run build' first.`;
        console.error(errorMsg);
        const { dialog } = require('electron');
        dialog.showErrorBox('Athena AI - Server Error', errorMsg);
        app.quit();
        throw new Error(errorMsg);
      }
    } catch (err) {
      console.error('Failed to start production server:', err);
      const { dialog } = require('electron');
      dialog.showErrorBox('Athena AI - Startup Error', `Failed to start server:\n${err.message}`);
      app.quit();
      throw err;
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
      preload: path.join(__dirname, 'electron-preload.cjs'),
      // SECURITY: Always enable webSecurity in production
      // In development, we keep it enabled for security testing
      webSecurity: true,  // Critical: Must be true in production for security
      sandbox: true,      // Enable sandboxing for additional security
      allowRunningInsecureContent: false
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

  // Load the app - use custom protocol in production
  const startUrl = isDev 
    ? 'http://localhost:5000'  // Development: use Vite dev server for HMR
    : 'app://athena/index.html';  // Production: use custom protocol
  
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
  
  // Configure security policies for production
  if (!isDev) {
    // Set proper Content Security Policy for production
    // Note: 'unsafe-eval' is required for React Query and Vite's production build
    // This is a known limitation when using modern bundlers with Electron
    const cspPolicy = 
      "default-src 'self' app://athena; " +  // Tightened: removed localhost from default-src
      "script-src 'self' app://athena 'unsafe-eval'; " +  // unsafe-eval required for React Query
      "style-src 'self' app://athena 'unsafe-inline' https://fonts.googleapis.com; " +
      "font-src 'self' app://athena https://fonts.gstatic.com data:; " +
      "img-src 'self' app://athena data: blob:; " +
      "connect-src 'self' http://localhost:5000 ws://localhost:5000";  // API calls only need connect-src
    
    mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          'Content-Security-Policy': [cspPolicy]
        }
      });
    });
    
    // Allow API requests from app:// to http://localhost:5000
    mainWindow.webContents.session.webRequest.onBeforeSendHeaders(
      { urls: ['http://localhost:5000/*'] },
      (details, callback) => {
        // Ensure the Origin header is set properly for CORS
        details.requestHeaders['Origin'] = 'app://athena';
        callback({ requestHeaders: details.requestHeaders });
      }
    );
  }
}

// Register the custom protocol handler
function registerCustomProtocol() {
  protocol.registerFileProtocol('app', (request, callback) => {
    try {
      // Parse the URL properly
      const parsedUrl = new URL(request.url);
      
      // Get the pathname and decode it (handles %20 etc)
      let pathname = decodeURIComponent(parsedUrl.pathname);
      
      // Remove leading slash if present
      if (pathname.startsWith('/')) {
        pathname = pathname.slice(1);
      }
      
      // Default to index.html if no path specified
      if (pathname === '' || pathname === 'athena' || pathname === 'athena/') {
        pathname = 'index.html';
      }
      
      // Define the allowed public directory with normalized separator
      const publicDir = path.resolve(__dirname, 'dist', 'public');
      
      // Construct and normalize the full file path
      const requestedPath = path.resolve(publicDir, pathname);
      
      // SECURITY: Ensure the resolved path is within the public directory
      // Use path.relative to check if path escapes the public directory
      const relativePath = path.relative(publicDir, requestedPath);
      
      // If relative path starts with .. or is absolute, it's trying to escape
      if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
        console.error(`[Security] Path traversal attempt blocked: ${request.url} -> ${relativePath}`);
        callback({ error: -6 }); // FILE_NOT_FOUND
        return;
      }
      
      // Additional check: ensure the normalized path is actually inside publicDir
      const normalizedPublic = path.normalize(publicDir + path.sep);
      const normalizedRequest = path.normalize(requestedPath + path.sep);
      if (!normalizedRequest.startsWith(normalizedPublic)) {
        console.error(`[Security] Path escape attempt blocked: ${request.url}`);
        callback({ error: -6 }); // FILE_NOT_FOUND  
        return;
      }
      
      // Check if the file exists and is a file (not directory)
      if (fs.existsSync(requestedPath) && fs.statSync(requestedPath).isFile()) {
        callback({ path: requestedPath });
      } else {
        // For client-side routing, serve index.html for non-existent paths
        const indexPath = path.join(publicDir, 'index.html');
        if (fs.existsSync(indexPath)) {
          callback({ path: indexPath });
        } else {
          console.error(`[Protocol] File not found: ${requestedPath}`);
          callback({ error: -6 }); // FILE_NOT_FOUND
        }
      }
    } catch (err) {
      console.error('[Protocol] Error handling request:', err);
      callback({ error: -6 }); // FILE_NOT_FOUND
    }
  });
}

// This method will be called when Electron has finished initialization
app.whenReady().then(async () => {
  // Register the custom protocol for production
  if (!isDev) {
    registerCustomProtocol();
  }
  
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