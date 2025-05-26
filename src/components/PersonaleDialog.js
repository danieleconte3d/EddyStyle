import React, { useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  TextField,
  Typography
} from '@mui/material';
import Webcam from 'react-webcam';
import ColorPicker from './ColorPicker';

function PersonaleDialog({ 
  open, 
  onClose, 
  onSubmit, 
  onDelete, 
  selectedPersonale, 
  formData, 
  setFormData 
}) {
  const webcamRef = useRef(null);
  const [openCameraDialog, setOpenCameraDialog] = React.useState(false);

  const handleCapture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setFormData({ ...formData, foto: imageSrc });
    setOpenCameraDialog(false);
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedPersonale ? 'Modifica Personale' : 'Nuovo Personale'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box sx={{
              width: 120,
              height: 120,
              borderRadius: '50%',
              overflow: 'hidden',
              border: '3px solid',
              borderColor: formData.colore,
              mb: 2,
              cursor: 'pointer',
              backgroundColor: 'rgba(0,0,0,0.1)'
            }} onClick={() => setOpenCameraDialog(true)}>
              {formData.foto ? (
                <img 
                  src={formData.foto} 
                  alt="Foto personale"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <Box sx={{ 
                  width: '100%', 
                  height: '100%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}>
                  <Typography variant="h4">
                    {formData.nome ? formData.nome.charAt(0).toUpperCase() : '+'}
                  </Typography>
                </Box>
              )}
            </Box>
            <TextField
              fullWidth
              label="Nome"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Telefono"
              value={formData.telefono}
              onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              sx={{ mb: 2 }}
            />
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Colore
            </Typography>
            <ColorPicker
              color={formData.colore}
              onChange={(color) => setFormData({ ...formData, colore: color.hex })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          {selectedPersonale && (
            <Button 
              onClick={onDelete} 
              color="error"
            >
              Elimina
            </Button>
          )}
          <Button onClick={onClose}>Annulla</Button>
          <Button onClick={onSubmit} variant="contained">
            Salva
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openCameraDialog} onClose={() => setOpenCameraDialog(false)}>
        <DialogTitle>Scatta Foto</DialogTitle>
        <DialogContent>
          <Box sx={{ width: '100%', maxWidth: 500 }}>
            <Webcam
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={{
                width: 500,
                height: 500,
                facingMode: "user"
              }}
              style={{ width: '100%', height: 'auto' }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCameraDialog(false)}>Annulla</Button>
          <Button onClick={handleCapture} variant="contained">
            Scatta Foto
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default PersonaleDialog; 