import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogActions, 
  Button, 
  Typography,
  Box
} from '@mui/material';

function ConfirmDialog({ 
  open, 
  onClose, 
  onConfirm, 
  title = "Conferma",
  message = "Sei sicuro di voler procedere?",
  confirmText = "Conferma",
  cancelText = "Annulla"
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          backgroundColor: 'background.paper',
          minWidth: '300px',
          position: 'relative',
          zIndex: 2
        }
      }}
      BackdropProps={{
        sx: {
          backgroundColor: 'rgba(0, 0, 0, 0.7)'
        }
      }}
    >
      <DialogContent sx={{ pt: 3, pb: 2 }}>
        <Typography variant="h6" component="div" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {message}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">
          {cancelText}
        </Button>
        <Button onClick={onConfirm} variant="contained" color="error">
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ConfirmDialog; 