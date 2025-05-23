const { contextBridge, ipcRenderer } = require('electron');

// Espone le API di Electron in modo sicuro
contextBridge.exposeInMainWorld('electron', {
  // Funzionalità per il controllo della finestra
  minimize: () => ipcRenderer.send('minimize-window'),
  close: () => ipcRenderer.send('close-window'),
  
  // Funzionalità per gli aggiornamenti
  onUpdateMessage: (callback) => ipcRenderer.on('update-message', callback),
  onUpdateAvailable: (callback) => ipcRenderer.on('update-available', callback),
  onDownloadProgress: (callback) => ipcRenderer.on('download-progress', callback),
  startUpdate: () => ipcRenderer.send('start-update'),
  restartApp: () => ipcRenderer.send('restart-app')
}); 