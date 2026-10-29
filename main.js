const { app, BrowserWindow, ipcMain, globalShortcut, Notification, shell } = require('electron');
const path = require('path');
const url = require('url');

let mainWindow = null;

// Routing map for SPA/multi-page navigation in Electron
const routeMap = {
  '/': 'index.html',
  '/chat': 'chat/index.html',
  '/chat/': 'chat/index.html',
  '/planes': 'planes/index.html',
  '/planes/': 'planes/index.html',
  '/admin': 'admin/index.html',
  '/admin/': 'admin/index.html',
  '/api': 'api/index.html',
  '/api/': 'api/index.html',
  '/feedback': 'feedback/index.html',
  '/feedback/': 'feedback/index.html'
};

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 840,
    minWidth: 960,
    minHeight: 640,
    backgroundColor: '#07070a',
    show: false,
    frame: false, // Frameless for custom native dark titlebar
    titleBarStyle: 'hidden',
    titleBarOverlay: process.platform === 'win32' ? {
      color: '#09090e',
      symbolColor: '#cbd5e1',
      height: 38
    } : false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      spellcheck: true
    }
  });

  // Load the initial landing page
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Smooth appearance when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
  });

  // Track window state changes for the titlebar
  mainWindow.on('maximize', () => {
    mainWindow.webContents.send('window:maximized-change', true);
  });

  mainWindow.on('unmaximize', () => {
    mainWindow.webContents.send('window:maximized-change', false);
  });

  // Handle in-app navigation so links like href="/chat" load the local file
  mainWindow.webContents.on('will-navigate', (event, targetUrl) => {
    const parsed = new URL(targetUrl);
    
    // External links open in default web browser
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      if (!parsed.hostname.includes('localhost') && !parsed.hostname.includes('127.0.0.1')) {
        event.preventDefault();
        shell.openExternal(targetUrl);
        return;
      }
    }

    // Local file protocol navigation
    if (parsed.protocol === 'file:') {
      const pathname = parsed.pathname.replace(/^[A-Za-z]:/, ''); // Normalize Windows drive letter
      for (const [route, file] of Object.entries(routeMap)) {
        if (pathname.endsWith(route) || pathname === route) {
          event.preventDefault();
          mainWindow.loadFile(path.join(__dirname, file));
          return;
        }
      }
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// App lifecycle
app.whenReady().then(() => {
  createWindow();

  // Register global hotkey (Ctrl+Alt+N or Cmd+Alt+N) to toggle window
  globalShortcut.register('CommandOrControl+Alt+N', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        if (mainWindow.isFocused()) {
          mainWindow.hide();
        } else {
          mainWindow.focus();
        }
      } else {
        mainWindow.show();
        mainWindow.focus();
      }
    }
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Window Controls
ipcMain.handle('window:minimize', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.handle('window:maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.handle('window:close', () => {
  if (mainWindow) mainWindow.close();
});

ipcMain.handle('window:isMaximized', () => {
  return mainWindow ? mainWindow.isMaximized() : false;
});

ipcMain.handle('app:navigate', (event, route) => {
  if (mainWindow && routeMap[route]) {
    mainWindow.loadFile(path.join(__dirname, routeMap[route]));
  }
});

ipcMain.handle('app:notification', (event, { title, body }) => {
  if (Notification.isSupported()) {
    new Notification({
      title: title || 'Nova AI',
      body: body || '',
      icon: path.join(__dirname, 'icon.png')
    }).show();
  }
});
