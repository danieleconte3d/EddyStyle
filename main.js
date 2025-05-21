const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');

// Configurazione per l'ambiente di sviluppo
const isDev = process.env.NODE_ENV === 'development';

// Configurazione dell'updater
autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // Carica l'app React
  mainWindow.loadURL(
    isDev
      ? 'http://localhost:3000'
      : `file://${path.join(__dirname, 'src/build/index.html')}`
  );

  // Gestione degli aggiornamenti
  if (!isDev) {
    checkForUpdates();
  }
}

// Funzione per controllare gli aggiornamenti
async function checkForUpdates() {
  try {
    await autoUpdater.checkForUpdates();
  } catch (error) {
    console.error('Errore nel controllo degli aggiornamenti:', error);
  }
}

// Eventi dell'updater
autoUpdater.on('checking-for-update', () => {
  mainWindow.webContents.send('update-message', {
    type: 'info',
    message: 'Controllo aggiornamenti in corso...'
  });
});

autoUpdater.on('update-available', (info) => {
  mainWindow.webContents.send('update-available', {
    version: info.version,
    releaseNotes: info.releaseNotes
  });
});

autoUpdater.on('update-not-available', () => {
  mainWindow.webContents.send('update-message', {
    type: 'info',
    message: 'Nessun aggiornamento disponibile.'
  });
});

autoUpdater.on('error', (err) => {
  mainWindow.webContents.send('update-message', {
    type: 'error',
    message: 'Errore durante l'aggiornamento: ' + err.message
  });
});

autoUpdater.on('download-progress', (progressObj) => {
  mainWindow.webContents.send('download-progress', progressObj);
});

autoUpdater.on('update-downloaded', () => {
  mainWindow.webContents.send('update-message', {
    type: 'success',
    message: 'Aggiornamento scaricato. Verrà installato alla chiusura dell\'applicazione.'
  });
});

// Gestione dei messaggi dall'interfaccia
ipcMain.on('start-update', () => {
  autoUpdater.downloadUpdate();
});

ipcMain.on('restart-app', () => {
  autoUpdater.quitAndInstall();
});

// Gestione del ciclo di vita dell'app
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
}); 