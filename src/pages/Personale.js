import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Paper,
  useTheme,
  useMediaQuery,
  CircularProgress
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import MiniPlayer from '../components/MiniPlayer';
import ColorPicker from '../components/ColorPicker';
import TopBar from '../components/TopBar';
import EditIcon from '@mui/icons-material/Edit';
import PersonaleCard from '../components/PersonaleCard';
import PersonaleDialog from '../components/PersonaleDialog';
import { personaleService } from '../services/firebaseService';
import Webcam from 'react-webcam';

function Personale() {
  const navigate = useNavigate();
  const webcamRef = useRef(null);
  const [personale, setPersonale] = useState([]);
  const [exPersonale, setExPersonale] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openCameraDialog, setOpenCameraDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [showExPersonale, setShowExPersonale] = useState(false);
  const [selectedPersonale, setSelectedPersonale] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    colore: '#1976d2',
    telefono: '',
    foto: null
  });

  useEffect(() => {
    const initializeData = async () => {
      try {
        // Prima aggiorniamo i dati esistenti
        await personaleService.updateAllExistingPersonale();
        // Poi carichiamo il personale
        await loadPersonale();
      } catch (error) {
        console.error('Errore durante l\'inizializzazione:', error);
      }
    };

    initializeData();
  }, []);

  const loadPersonale = async () => {
    try {
      const [activeData, exData] = await Promise.all([
        personaleService.getActivePersonale(),
        personaleService.getExPersonale()
      ]);
      setPersonale(activeData);
      setExPersonale(exData);
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
        telefono: personale.telefono || '',
        foto: personale.foto || null
      });
    } else {
      setSelectedPersonale(null);
      setFormData({
        nome: '',
        colore: '#1976d2',
        telefono: '',
        foto: null
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
      telefono: '',
      foto: null
    });
  };

  const handleCapture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setFormData({ ...formData, foto: imageSrc });
    setOpenCameraDialog(false);
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

  const handleDeleteConfirm = async () => {
    if (!selectedPersonale) return;
    
    try {
      await personaleService.setExPersonale(selectedPersonale.id);
      setOpenDeleteDialog(false);
      setSelectedPersonale(null);
      loadPersonale();
    } catch (error) {
      console.error('Errore nell\'eliminazione del personale:', error);
    }
  };

  if (loading) {
    return (
      <Container maxWidth={false} disableGutters sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <TopBar title="Gestione Personale" showBackButton={true} />
        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth={false} disableGutters sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <TopBar title="Gestione Personale" showBackButton={true} />

      <Box sx={{ flex: 1, overflow: 'auto', p: 1 }}>
        <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button 
            variant="outlined" 
            onClick={() => setShowExPersonale(!showExPersonale)}
          >
            {showExPersonale ? 'Personale Attivo' : 'Storico Ex Dipendenti'}
          </Button>
          {!showExPersonale && (
            <Button 
              variant="contained" 
              onClick={() => handleOpenDialog()}
            >
              Aggiungi Personale
            </Button>
          )}
        </Box>

        <Box sx={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
          gap: 5,
          width: '100%'
        }}>
          {(showExPersonale ? exPersonale : personale).map((p) => (
            <Box key={p.id} sx={{ display: 'flex', justifyContent: 'center' }}>
              <PersonaleCard
                personale={p}
                onClick={handleOpenDialog}
              />
            </Box>
          ))}
        </Box>
      </Box>

      <PersonaleDialog
        open={openDialog}
        onClose={handleCloseDialog}
        onSubmit={handleSubmit}
        onDelete={() => {
          setOpenDialog(false);
          setOpenDeleteDialog(true);
        }}
        selectedPersonale={selectedPersonale}
        formData={formData}
        setFormData={setFormData}
      />

      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Conferma Modifica Stato</DialogTitle>
        <DialogContent>
          <Typography>
            Sei sicuro di voler spostare {selectedPersonale?.nome} tra gli ex dipendenti?
            Potrai sempre ripristinare il suo stato in futuro.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)} color="inherit">
            Annulla
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Conferma
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Personale; 