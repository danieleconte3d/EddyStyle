import React, { useEffect, useState } from 'react';
import { Snackbar, Alert, Button, LinearProgress, Typography, Box } from '@mui/material';

// Verifica se siamo in Electron
const isElectron = () => {
  return window && window.process && window.process.type === 'renderer';
};

function UpdateNotification() {
  const [notification, setNotification] = useState(null);
  const [updateInfo, setUpdateInfo] = useState(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    // Se non siamo in Electron, non fare nulla
    if (!isElectron() || !window.electron) return;
    
    // Ascolta i messaggi di aggiornamento
    if (window.electron.onUpdateMessage) {
      window.electron.onUpdateMessage((_, message) => {
        setNotification(message);
        if (message.type === 'success') {
          setIsDownloading(false);
        }
      });
    }

    // Ascolta la disponibilità di aggiornamenti
    if (window.electron.onUpdateAvailable) {
      window.electron.onUpdateAvailable((_, info) => {
        setUpdateInfo(info);
      });
    }

    // Ascolta il progresso del download
    if (window.electron.onDownloadProgress) {
      window.electron.onDownloadProgress((_, progressObj) => {
        setDownloadProgress(progressObj.percent || 0);
      });
    }
  }, []);

  const handleStartUpdate = () => {
    if (!isElectron() || !window.electron?.startUpdate) return;
    setIsDownloading(true);
    window.electron.startUpdate();
  };

  const handleRestartApp = () => {
    if (!isElectron() || !window.electron?.restartApp) return;
    window.electron.restartApp();
  };

  // Se non siamo in Electron, non mostrare nulla
  if (!isElectron() || !window.electron) return null;

  return (
    <>
      {/* Notifica di aggiornamento disponibile */}
      <Snackbar 
        open={!!updateInfo && !isDownloading} 
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          severity="info" 
          action={
            <Button color="primary" size="small" onClick={handleStartUpdate}>
              Aggiorna
            </Button>
          }
        >
          {`Nuova versione ${updateInfo?.version} disponibile!`}
          {updateInfo?.releaseNotes && (
            <Typography variant="caption" display="block">
              {updateInfo.releaseNotes}
            </Typography>
          )}
        </Alert>
      </Snackbar>

      {/* Barra di progresso download */}
      {isDownloading && (
        <Box 
          position="fixed" 
          bottom={0} 
          left={0} 
          right={0} 
          p={2} 
          bgcolor="background.paper"
          boxShadow={3}
        >
          <Typography variant="body2" gutterBottom>
            Download aggiornamento: {Math.round(downloadProgress)}%
          </Typography>
          <LinearProgress variant="determinate" value={downloadProgress} />
        </Box>
      )}

      {/* Notifiche generiche */}
      <Snackbar 
        open={!!notification} 
        autoHideDuration={6000} 
        onClose={() => setNotification(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert 
          severity={notification?.type || 'info'} 
          action={
            notification?.type === 'success' && (
              <Button color="primary" size="small" onClick={handleRestartApp}>
                Riavvia
              </Button>
            )
          }
        >
          {notification?.message}
        </Alert>
      </Snackbar>
    </>
  );
}

export default UpdateNotification; 