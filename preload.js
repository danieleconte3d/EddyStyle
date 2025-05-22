const { contextBridge, ipcRenderer } = require('electron');

// Espone le API di Electron in modo sicuro
contextBridge.exposeInMainWorld('electron', {
  database: {
    getAllPersonale: () => ipcRenderer.invoke('get-all-personale'),
    createPersonale: (data) => ipcRenderer.invoke('create-personale', data),
    updatePersonale: (id, data) => ipcRenderer.invoke('update-personale', id, data),
    deletePersonale: (id) => ipcRenderer.invoke('delete-personale', id),
    getAllAppointments: () => ipcRenderer.invoke('get-all-appointments'),
    createAppointment: (data) => ipcRenderer.invoke('create-appointment', data),
    updateAppointment: (id, data) => ipcRenderer.invoke('update-appointment', id, data),
    deleteAppointment: (id) => ipcRenderer.invoke('delete-appointment', id),
    getAppointmentsByDateRange: (startDate, endDate) => 
      ipcRenderer.invoke('get-appointments-by-date-range', startDate, endDate),
    debugDatabase: () => ipcRenderer.invoke('debug-database')
  }
}); 