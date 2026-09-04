const { app, BrowserWindow, Menu, shell, protocol, net, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

// `app.isPackaged` is the only reliable signal: an installed app never sets
// NODE_ENV, so the old `NODE_ENV !== 'production'` check made every shipped
// build run in development mode.
const isDev = !app.isPackaged;

const SERVER_PORT = process.env.PORT || '5000';
const SERVER_ORIGIN = `http://127.0.0.1:${SERVER_PORT}`;
const APP_ORIGIN = 'app://athena';

let mainWindow;
let devServerProcess;

protocol.registerSchemesAsPrivileged([
  {
    scheme: 'app',
    privileges: { secure: true, standard: true, supportFetchAPI: true, corsEnabled: true },
  },
]);

/**
 * Starts the API. In a packaged app the bundled CommonJS server is required
 * in-process; in development we spawn `npm run dev` for hot reload.
 */
async function startExpressServer() {
  if (!isDev) {
    // The database and the session secret live in the per-user data directory,
    // not next to the executable (which is read-only on most installs).
    const userData = app.getPath('userData');
    fs.mkdirSync(userData, { recursive: true });
    process.env.ATHENA_USER_DATA = userData;
    process.env.NODE_ENV = 'production';
    process.env.PORT = SERVER_PORT;
    process.env.HOST = '127.0.0.1';

    const serverPath = path.join(__dirname, 'dist', 'server-electron.cjs');
    if (!fs.existsSync(serverPath)) {
      const message =
        'The application server bundle is missing.\n\n' +
        'Build it with:\n  npm run build\n\n' +
        `Expected at:\n${serverPath}`;
      dialog.showErrorBox('Athena AI cannot start', message);
      app.quit();
      throw new Error(message);
    }

    try {
      require(serverPath);
    } catch (err) {
      dialog.showErrorBox('Athena AI cannot start', `The server failed to start:\n${err.message}`);
      app.quit();
      throw err;
    }
  } else {
    const { spawn } = require('child_process');
    devServerProcess = spawn('npm', ['run', 'dev'], {
      shell: true,
      env: { ...process.env, NODE_ENV: 'development' },
      stdio: 'inherit',
    });
  }

  await waitForServer();
}

/** Polls the health endpoint instead of guessing with a fixed delay. */
async function waitForServer(timeoutMs = 30000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await net.fetch(`${SERVER_ORIGIN}/health`);
      if (res.ok) return;
    } catch {
      // Not listening yet.
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`The application server did not respond at ${SERVER_ORIGIN} within ${timeoutMs}ms`);
}

function buildMenu() {
  const fileSubmenu = [
    { label: 'Reload', accelerator: 'CmdOrCtrl+R', click: () => mainWindow && mainWindow.reload() },
  ];
  if (isDev) {
    fileSubmenu.push({
      label: 'Toggle Developer Tools',
      accelerator: 'CmdOrCtrl+Shift+I',
      click: () => mainWindow && mainWindow.webContents.toggleDevTools(),
    });
  }
  fileSubmenu.push({ type: 'separator' }, { role: 'quit' });

  const template = [
    { label: 'File', submenu: fileSubmenu },
    { role: 'editMenu' },
    {
      label: 'View',
      submenu: [
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About Athena AI',
          click: () =>
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About Athena AI',
              message: 'Athena AI - Cybersecurity Intelligence Platform',
              detail: `Version ${app.getVersion()}`,
              buttons: ['OK'],
            }),
        },
      ],
    },
  ];

  if (process.platform === 'darwin') {
    template.unshift({ role: 'appMenu' });
  }
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    icon: path.join(__dirname, 'build', 'icon.ico'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'electron-preload.cjs'),
      webSecurity: true,
      sandbox: true,
      allowRunningInsecureContent: false,
    },
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    backgroundColor: '#0a0a0a',
    show: false,
  });

  buildMenu();

  // Content Security Policy. `file:` is deliberately absent: everything the
  // renderer needs is served over app:// or from the local API.
  const pageOrigin = isDev ? `'self' ${SERVER_ORIGIN}` : `'self' ${APP_ORIGIN}`;
  const cspPolicy = [
    `default-src ${pageOrigin}`,
    `script-src ${pageOrigin}`,
    `style-src ${pageOrigin} 'unsafe-inline'`,
    `font-src ${pageOrigin} data:`,
    `img-src ${pageOrigin} data: blob:`,
    `connect-src 'self' ${SERVER_ORIGIN} ws://127.0.0.1:${SERVER_PORT}`,
    `object-src 'none'`,
    `base-uri 'none'`,
    `frame-ancestors 'none'`,
  ].join('; ');

  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: { ...details.responseHeaders, 'Content-Security-Policy': [cspPolicy] },
    });
  });

  // The renderer is served from app://, so API calls are cross-origin. Stamping
  // the Origin lets the server's allowlist recognize them.
  if (!isDev) {
    mainWindow.webContents.session.webRequest.onBeforeSendHeaders(
      { urls: [`${SERVER_ORIGIN}/*`, `http://localhost:${SERVER_PORT}/*`] },
      (details, callback) => {
        details.requestHeaders['Origin'] = APP_ORIGIN;
        callback({ requestHeaders: details.requestHeaders });
      },
    );
  }

  // Open external links in the real browser, never in an app window.
  // (`new-window` was removed in Electron 22; this is its replacement.)
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      void shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  // Block in-page navigation away from the app's own origins.
  mainWindow.webContents.on('will-navigate', (event, url) => {
    const allowed = isDev ? [SERVER_ORIGIN, `http://localhost:${SERVER_PORT}`] : [APP_ORIGIN];
    if (!allowed.some((origin) => url.startsWith(origin))) {
      event.preventDefault();
    }
  });

  // Load the root, not /index.html: the client router matches on the pathname,
  // and "/index.html" matched no route, which is why the packaged app opened
  // on the 404 screen.
  mainWindow.loadURL(isDev ? `${SERVER_ORIGIN}/` : `${APP_ORIGIN}/`);

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.once('ready-to-show', () => mainWindow.show());
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

/**
 * Serves the built client over app://, confined to dist/public, with an
 * index.html fallback so client-side routes resolve.
 */
function registerCustomProtocol() {
  const publicDir = path.resolve(__dirname, 'dist', 'public');

  protocol.handle('app', (request) => {
    let filePath;
    try {
      const url = new URL(request.url);
      const pathname = decodeURIComponent(url.pathname).replace(/^\/+/, '');
      const candidate = path.resolve(publicDir, pathname);

      // Refuse anything that resolves outside the public directory.
      const relative = path.relative(publicDir, candidate);
      const escapes = relative.startsWith('..') || path.isAbsolute(relative);

      filePath =
        !escapes && pathname !== '' && fs.existsSync(candidate) && fs.statSync(candidate).isFile()
          ? candidate
          : path.join(publicDir, 'index.html');
    } catch {
      filePath = path.join(publicDir, 'index.html');
    }

    return net.fetch(pathToFileURL(filePath).toString());
  });
}

app.whenReady().then(async () => {
  if (!isDev) {
    registerCustomProtocol();
  }
  try {
    await startExpressServer();
  } catch (err) {
    console.error('[electron] server startup failed:', err);
    return;
  }
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

app.on('before-quit', () => {
  if (devServerProcess) {
    devServerProcess.kill();
  }
});
