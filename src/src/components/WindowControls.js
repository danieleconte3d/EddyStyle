import React from 'react';
import { Box, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import RemoveIcon from '@mui/icons-material/Remove';

// Verifica se siamo in Electron
const isElectron = () => {
  return window && window.process && window.process.type === 'renderer';
};

// Ottieni ipcRenderer solo se siamo in Electron
let ipcRenderer = null;
if (isElectron()) {
  try {
    ipcRenderer = window.require('electron').ipcRenderer;
  } catch (error) {
    console.error('Errore durante il caricamento di electron:', error);
  }
}

function WindowControls() {
  const handleMinimize = () => {
    if (ipcRenderer) {
      ipcRenderer.send('minimize-window');
    } else {
      console.log('Minimize non disponibile (non in Electron)');
    }
  };

  const handleClose = () => {
    if (ipcRenderer) {
      ipcRenderer.send('close-window');
    } else {
      console.log('Close non disponibile (non in Electron)');
    }
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        right: 0,
        display: 'flex',
        gap: 1,
        p: 1,
        zIndex: 1000
      }}
    >
      <IconButton
        onClick={handleMinimize}
        sx={{
          color: 'white',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)'
          }
        }}
      >
        <RemoveIcon />
      </IconButton>
      <IconButton
        onClick={handleClose}
        sx={{
          color: 'white',
          '&:hover': {
            backgroundColor: 'rgba(255, 0, 0, 0.1)'
          }
        }}
      >
        <CloseIcon />
      </IconButton>
    </Box>
  );
}

export default WindowControls; 