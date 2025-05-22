const { app, BrowserWindow, ipcMain, protocol } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');
const fs = require('fs');
const url = require('url');
const db = require('./src/database');
const sqlite3 = require('sqlite3').verbose();

// Verifica lo stato dell'ambiente
console.log('NODE_ENV:', process.env.NODE_ENV);

// Configurazione per l'ambiente di sviluppo
const isDev = process.env.NODE_ENV === 'development';
console.log(`Esecuzione in modalità: ${isDev ? 'sviluppo' : 'produzione'}`);

// Configurazione dell'updater
autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;

let mainWindow;

// Gestione messaggi IPC per il controllo della finestra
ipcMain.on('minimize-window', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.on('close-window', () => {
  app.quit();
});

function createWindow() {
  // Creiamo la finestra principale
  mainWindow = new BrowserWindow({
    fullscreen: true,
    frame: false,
    show: false,
    backgroundColor: '#000000',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // Determina quale file caricare
  let loadUrl;
  if (isDev) {
    loadUrl = 'http://localhost:3000';
    console.log('Ambiente di sviluppo, caricamento da:', loadUrl);
  } else {
    const reactAppPath = path.join(__dirname, 'build', 'index.html');
    console.log('Percorso app React:', reactAppPath);
    console.log('File app React esiste:', fs.existsSync(reactAppPath));
    
    loadUrl = url.format({
      pathname: reactAppPath,
      protocol: 'file:',
      slashes: true
    });
  }
  
  console.log('URL di caricamento:', loadUrl);

  // Gestione errori di caricamento
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error(`Errore di caricamento ${errorCode}: ${errorDescription}`);
    console.error('Dettagli errore:', {
      errorCode,
      errorDescription,
      loadUrl,
      isDev
    });
  });

  // Gestione errori di renderer
  mainWindow.webContents.on('render-process-gone', (event, details) => {
    console.error('Renderer process crashed:', details);
  });

  // Gestione errori di navigazione
  mainWindow.webContents.on('did-fail-provisional-load', (event, errorCode, errorDescription) => {
    console.error(`Errore di caricamento provvisorio ${errorCode}: ${errorDescription}`);
  });

  // Carica l'URL
  mainWindow.loadURL(loadUrl).catch(err => {
    console.error('Errore durante il caricamento dell\'URL:', err);
  });

  // Mostra la finestra solo quando è pronta
  mainWindow.once('ready-to-show', () => {
    console.log('Finestra pronta, mostro l\'app');
    mainWindow.show();
  });

  // Apri DevTools per debug
  mainWindow.webContents.openDevTools();
  
  // Intercetta log dalla pagina web
  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    console.log(`Console (${level}): ${message}`);
  });

  // Quando la finestra viene chiusa
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Creazione della finestra quando Electron è pronto
app.whenReady().then(() => {
  // Registra un protocollo per gestire le risorse statiche
  protocol.registerFileProtocol('file', (request, callback) => {
    const pathname = decodeURI(request.url.replace('file:///', ''));
    callback(pathname);
  });
  
  createWindow();
  
  // Su macOS, ricrea la finestra quando viene cliccata l'icona nel dock
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Gestione degli aggiornamenti
function checkForUpdates() {
  try {
    autoUpdater.checkForUpdates();
  } catch (error) {
    console.error('Errore nel controllo degli aggiornamenti:', error);
  }
}

// Evento avviato quando l'app è pronta
app.on('ready', () => {
  // Controlla aggiornamenti solo in produzione
  if (!isDev) {
    checkForUpdates();
  }
});

// Eventi dell'updater
autoUpdater.on('checking-for-update', () => {
  if (mainWindow) {
    mainWindow.webContents.send('update-message', {
      type: 'info',
      message: 'Controllo aggiornamenti in corso...'
    });
  }
});

autoUpdater.on('update-available', (info) => {
  if (mainWindow) {
    mainWindow.webContents.send('update-available', {
      version: info.version,
      releaseNotes: info.releaseNotes
    });
  }
});

autoUpdater.on('update-not-available', () => {
  if (mainWindow) {
    mainWindow.webContents.send('update-message', {
      type: 'info',
      message: 'Nessun aggiornamento disponibile.'
    });
  }
});

autoUpdater.on('error', (err) => {
  if (mainWindow) {
    mainWindow.webContents.send('update-message', {
      type: 'error',
      message: 'Errore durante l\'aggiornamento: ' + err.message
    });
  }
});

autoUpdater.on('download-progress', (progressObj) => {
  if (mainWindow) {
    mainWindow.webContents.send('download-progress', progressObj);
  }
});

autoUpdater.on('update-downloaded', () => {
  if (mainWindow) {
    mainWindow.webContents.send('update-message', {
      type: 'success',
      message: 'Aggiornamento scaricato. Verrà installato alla chiusura dell\'applicazione.'
    });
  }
});

// Gestione dei messaggi dall'interfaccia per l'updater
ipcMain.on('start-update', () => {
  autoUpdater.downloadUpdate();
});

ipcMain.on('restart-app', () => {
  autoUpdater.quitAndInstall();
});

// Gestori IPC per il database
ipcMain.handle('get-all-appointments', async () => {
  try {
    const appointments = await db.getAllAppointments();
    return appointments;
  } catch (error) {
    console.error('Errore nel recupero degli appuntamenti:', error);
    throw error;
  }
});

ipcMain.handle('create-appointment', async (event, appointment) => {
  try {
    const result = await db.createAppointment(appointment);
    return result;
  } catch (error) {
    console.error('Errore nella creazione dell\'appuntamento:', error);
    throw error;
  }
});

ipcMain.handle('update-appointment', async (event, id, appointment) => {
  try {
    const result = await db.updateAppointment(id, appointment);
    return result;
  } catch (error) {
    console.error('Errore nell\'aggiornamento dell\'appuntamento:', error);
    throw error;
  }
});

ipcMain.handle('delete-appointment', async (event, id) => {
  try {
    const result = await db.deleteAppointment(id);
    return result;
  } catch (error) {
    console.error('Errore nell\'eliminazione dell\'appuntamento:', error);
    throw error;
  }
});

ipcMain.handle('get-appointments-by-date-range', async (event, startDate, endDate) => {
  try {
    const appointments = await db.getAppointmentsByDateRange(startDate, endDate);
    return appointments;
  } catch (error) {
    console.error('Errore nel recupero degli appuntamenti per intervallo di date:', error);
    throw error;
  }
});

// Handler per il personale
ipcMain.handle('get-all-personale', async () => {
  try {
    return await db.getAllPersonale();
  } catch (error) {
    console.error('Errore nel recupero del personale:', error);
    throw error;
  }
});

ipcMain.handle('create-personale', async (event, data) => {
  try {
    return await db.createPersonale(data);
  } catch (error) {
    console.error('Errore nella creazione del personale:', error);
    throw error;
  }
});

ipcMain.handle('update-personale', async (event, id, data) => {
  try {
    return await db.updatePersonale(id, data);
  } catch (error) {
    console.error('Errore nell\'aggiornamento del personale:', error);
    throw error;
  }
});

ipcMain.handle('delete-personale', async (event, id) => {
  try {
    return await db.deletePersonale(id);
  } catch (error) {
    console.error('Errore nell\'eliminazione del personale:', error);
    throw error;
  }
});

// Handler per il debug del database
ipcMain.handle('debug-database', async () => {
  try {
    return await db.debugDatabase();
  } catch (error) {
    console.error('Errore nel debug del database:', error);
    throw error;
  }
});

// Termina completamente l'app quando tutte le finestre sono chiuse (eccetto su macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
}); 