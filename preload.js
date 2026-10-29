const { contextBridge, ipcRenderer } = require('electron');

// Expose secure native desktop bridge to the renderer window
contextBridge.exposeInMainWorld('novaDesktop', {
  isDesktop: true,
  platform: process.platform,

  // Window Controls
  minimize: () => ipcRenderer.invoke('window:minimize'),
  maximize: () => ipcRenderer.invoke('window:maximize'),
  close: () => ipcRenderer.invoke('window:close'),
  isMaximized: () => ipcRenderer.invoke('window:isMaximized'),
  onMaximizedChange: (callback) => {
    ipcRenderer.on('window:maximized-change', (event, isMax) => callback(isMax));
  },

  // In-app Native Routing
  navigate: (route) => ipcRenderer.invoke('app:navigate', route),

  // Windows Native Notifications
  notify: (title, body) => ipcRenderer.invoke('app:notification', { title, body })
});
