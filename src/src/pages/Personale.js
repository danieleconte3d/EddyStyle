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

function Personale() {
  const navigate = useNavigate();
  const [personale, setPersonale] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedPersonale, setSelectedPersonale] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    colore: '#000000',
    telefono: ''
  });

  useEffect(() => {
    loadPersonale();
  }, []);

  const loadPersonale = async () => {
    try {
      const data = await window.electron.database.getAllPersonale();
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
        colore: '#000000',
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
      colore: '#000000',
      telefono: ''
    });
  };

  const handleSubmit = async () => {
    try {
      if (selectedPersonale) {
        await window.electron.database.updatePersonale(selectedPersonale.id, formData);
      } else {
        await window.electron.database.createPersonale(formData);
      }
      handleCloseDialog();
      loadPersonale();
    } catch (error) {
      console.error('Errore nel salvataggio del personale:', error);
    }
  };

  const handleDelete = async () => {
    if (!selectedPersonale) return;
    
    try {
      await window.electron.database.deletePersonale(selectedPersonale.id);
      handleCloseDialog();
      loadPersonale();
    } catch (error) {
      console.error('Errore nell\'eliminazione del personale:', error);
    }
  };

  return (
    <Container maxWidth={false} disableGutters sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        p: 2, 
        borderBottom: '1px solid rgba(255, 255, 255, 0.12)'
      }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Personale
        </Typography>
        <MiniPlayer />
        <WindowControls />
      </Box>

      {/* Contenuto principale */}
      <Box sx={{ flexGrow: 1, p: 3, overflow: 'auto' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {personale.map((p) => (
              <Grid item xs={12} sm={6} md={4} key={p.id}>
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    '&:hover': { opacity: 0.8 }
                  }}
                  onClick={() => handleOpenDialog(p)}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          backgroundColor: p.colore,
                          mr: 2
                        }}
                      />
                      <Typography variant="h6">{p.nome}</Typography>
                    </Box>
                    {p.telefono && (
                      <Typography color="text.secondary">
                        Tel: {p.telefono}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
            <Grid item xs={12} sm={6} md={4}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  '&:hover': { opacity: 0.8 },
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onClick={() => handleOpenDialog()}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <AddIcon sx={{ fontSize: 40, mb: 1 }} />
                    <Typography>Aggiungi Personale</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Box>

      {/* Dialog per aggiungere/modificare personale */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedPersonale ? 'Modifica Personale' : 'Nuovo Personale'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Nome"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              fullWidth
            />
            <TextField
              label="Colore"
              type="color"
              value={formData.colore}
              onChange={(e) => setFormData({ ...formData, colore: e.target.value })}
              fullWidth
              InputProps={{
                style: { height: '56px' }
              }}
            />
            <TextField
              label="Telefono"
              value={formData.telefono}
              onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          {selectedPersonale && (
            <Button
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleDelete}
            >
              Elimina
            </Button>
          )}
          <Button onClick={handleCloseDialog}>Annulla</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedPersonale ? 'Salva' : 'Aggiungi'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Personale; 