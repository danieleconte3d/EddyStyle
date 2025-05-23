import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Card,
  CardContent,
  Grid,
  CircularProgress
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import WindowControls from '../components/WindowControls';
import MiniPlayer from '../components/MiniPlayer';
import ColorPicker from '../components/ColorPicker';
import TopBar from '../components/TopBar';
import EditIcon from '@mui/icons-material/Edit';
import { personaleService } from '../services/firebaseService';

function Personale() {
  const navigate = useNavigate();
  const [personale, setPersonale] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedPersonale, setSelectedPersonale] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    colore: '#1976d2',
    telefono: ''
  });

  useEffect(() => {
    loadPersonale();
  }, []);

  const loadPersonale = async () => {
    try {
      const data = await personaleService.getAllPersonale();
      setPersonale(data);
    } catch (error) {
      console.error('Errore nel caricamento del personale:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (personale = null) => {
    if (personale) {
      setSelectedPersonale(personale);
      setFormData({
        nome: personale.nome,
        colore: personale.colore,
        telefono: personale.telefono || ''
      });
    } else {
      setSelectedPersonale(null);
      setFormData({
        nome: '',
        colore: '#1976d2',
        telefono: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedPersonale(null);
    setFormData({
      nome: '',
      colore: '#1976d2',
      telefono: ''
    });
  };

  const handleSubmit = async () => {
    try {
      if (selectedPersonale) {
        await personaleService.updatePersonale(selectedPersonale.id, formData);
      } else {
        await personaleService.createPersonale(formData);
      }
      handleCloseDialog();
      loadPersonale();
    } catch (error) {
      console.error('Errore nel salvataggio del personale:', error);
    }
  };

  const handleDeleteClick = (personale) => {
    setSelectedPersonale(personale);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedPersonale) return;
    
    try {
      await personaleService.deletePersonale(selectedPersonale.id);
      setOpenDeleteDialog(false);
      setSelectedPersonale(null);
      loadPersonale();
    } catch (error) {
      console.error('Errore nell\'eliminazione del personale:', error);
    }
  };

  const handleDeleteCancel = () => {
    setOpenDeleteDialog(false);
    setSelectedPersonale(null);
  };

  if (loading) {
    return (
      <Container maxWidth={false} disableGutters sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <TopBar title="Gestione Personale" />
        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth={false} disableGutters sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <TopBar title="Gestione Personale" />

      <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button 
            variant="contained" 
            onClick={() => handleOpenDialog()}
          >
            Aggiungi Personale
          </Button>
        </Box>

        <Grid container spacing={3}>
          {personale.map((p) => (
            <Grid item xs={12} sm={6} md={4} key={p.id}>
              <Card sx={{ 
                backgroundColor: p.colore,
                color: 'white',
                position: 'relative'
              }}>
                <CardContent>
                  <Box sx={{ 
                    position: 'absolute', 
                    top: 8, 
                    right: 8, 
                    display: 'flex', 
                    gap: 1 
                  }}>
                    <IconButton 
                      size="small" 
                      onClick={() => handleOpenDialog(p)}
                      sx={{ color: 'white' }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={() => handleDeleteClick(p)}
                      sx={{ color: 'white' }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                  <Typography variant="h5" component="div" sx={{ mb: 1 }}>
                    {p.nome}
                  </Typography>
                  {p.telefono && (
                    <Typography variant="body2">
                      Tel: {p.telefono}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          {selectedPersonale ? 'Modifica Personale' : 'Nuovo Personale'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
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
          <Button onClick={handleCloseDialog}>Annulla</Button>
          <Button onClick={handleSubmit} variant="contained">
            Salva
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDeleteDialog} onClose={handleDeleteCancel}>
        <DialogTitle>Conferma Eliminazione</DialogTitle>
        <DialogContent>
          <Typography>
            Sei sicuro di voler eliminare {selectedPersonale?.nome}?
            Questa azione non può essere annullata.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="inherit">
            Annulla
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Elimina
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Personale; 