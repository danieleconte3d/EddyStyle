import React from 'react';
import { Box, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import RemoveIcon from '@mui/icons-material/Remove';
const { ipcRenderer } = window.require('electron');

function WindowControls() {
  const handleMinimize = () => {
    ipcRenderer.send('minimize-window');
  };

  const handleClose = () => {
    ipcRenderer.send('close-window');
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