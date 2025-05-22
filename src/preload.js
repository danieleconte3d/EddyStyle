const { contextBridge, ipcRenderer } = require('electron');

// Espone l'API IPC al renderer process
contextBridge.exposeInMainWorld('electron', {
  invoke: (channel, ...args) => {
    return ipcRenderer.invoke(channel, ...args);
  },
  on: (channel, func) => {
    ipcRenderer.on(channel, (event, ...args) => func(...args));
  },
  removeListener: (channel, func) => {
    ipcRenderer.removeListener(channel, func);
  }
}); 