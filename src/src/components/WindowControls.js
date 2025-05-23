import React from 'react';
import { Box, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import RemoveIcon from '@mui/icons-material/Remove';

// Verifica se siamo in Electron
const isElectron = () => {
  return window && window.process && window.process.type === 'renderer';
};

function WindowControls() {
  // Se non siamo in Electron, non mostrare i controlli
  if (!isElectron()) {
    return null;
  }

  const handleMinimize = () => {
    if (window.electron && window.electron.minimize) {
      window.electron.minimize();
    }
  };

  const handleClose = () => {
    if (window.electron && window.electron.close) {
      window.electron.close();
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