import React from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Box, 
  Grid,
  Divider
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ConfirmDialog from './ConfirmDialog';

function AppointmentDialog({ 
  open, 
  onClose, 
  onSave, 
  onDelete,
  appointment, 
  selectedDate, 
  selectedTime, 
  onTimeChange,
  personale = []
}) {
  const [formData, setFormData] = React.useState({
    title: '',
    client: '',
    stylistId: '',
    notes: '',
    duration: 60,
    date: selectedDate
  });
  const [showConfirmDelete, setShowConfirmDelete] = React.useState(false);

  // Aggiorna il form quando cambia l'appuntamento
  React.useEffect(() => {
    if (appointment) {
      const duration = Math.round((new Date(appointment.endTime) - new Date(appointment.startTime)) / (1000 * 60));
      // Assicurati che la durata sia uno dei valori validi
      const validDuration = [30, 60, 90, 120, 150, 180].includes(duration) ? duration : 60;
      
      setFormData({
        title: appointment.title || '',
        client: appointment.client || '',
        stylistId: appointment.personale_id || '',
        notes: appointment.notes || '',
        duration: validDuration,
        date: new Date(appointment.startTime)
      });
    } else {
      setFormData({
        title: '',
        client: '',
        stylistId: '',
        notes: '',
        duration: 60,
        date: selectedDate
      });
    }
  }, [appointment, selectedDate]);

  const handleChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSave = () => {
    onSave({
      ...formData,
      date: formData.date,
      time: selectedTime,
      personale_id: formData.stylistId
    });
  };

  const handleDelete = () => {
    setShowConfirmDelete(true);
  };

  const handleConfirmDelete = () => {
    onDelete(appointment.id);
    setShowConfirmDelete(false);
  };

  // Filtra il personale attivo
  const activePersonale = personale.filter(p => !p.isEx);

  // Se l'appuntamento ha un ex operatore, aggiungilo alla lista
  const displayPersonale = React.useMemo(() => {
    if (appointment?.personale_isEx && appointment?.personale_id) {
      // Cerca l'ex operatore nel personale completo
      const exOperator = personale.find(p => p.id === appointment.personale_id);
      if (exOperator) {
        return [...activePersonale, exOperator];
      }
    }
    return activePersonale;
  }, [activePersonale, appointment, personale]);

  return (
    <>
      <Dialog 
        open={open} 
        onClose={onClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {appointment ? 'Modifica Appuntamento' : 'Nuovo Appuntamento'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Titolo Appuntamento"
              value={formData.title}
              onChange={handleChange('title')}
              fullWidth
              required
            />
            
            <TextField
              label="Nome Cliente"
              value={formData.client}
              onChange={handleChange('client')}
              fullWidth
              required
            />
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Data"
                  type="date"
                  value={formData.date ? formData.date.toISOString().split('T')[0] : ''}
                  onChange={(e) => {
                    const newDate = new Date(e.target.value);
                    setFormData(prev => ({
                      ...prev,
                      date: newDate
                    }));
                  }}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Orario Inizio"
                  value={selectedTime || ''}
                  onChange={onTimeChange}
                  type="time"
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </Grid>
            </Grid>
            
            <FormControl fullWidth>
              <InputLabel>Durata (minuti)</InputLabel>
              <Select
                value={formData.duration}
                onChange={handleChange('duration')}
                label="Durata (minuti)"
              >
                <MenuItem value={30}>30 minuti</MenuItem>
                <MenuItem value={60}>1 ora</MenuItem>
                <MenuItem value={90}>1 ora e 30 min</MenuItem>
                <MenuItem value={120}>2 ore</MenuItem>
                <MenuItem value={150}>2 ore e 30 min</MenuItem>
                <MenuItem value={180}>3 ore</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth required>
              <InputLabel>Operatore</InputLabel>
              <Select
                value={formData.stylistId}
                onChange={handleChange('stylistId')}
                label="Operatore"
              >
                {displayPersonale.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ 
                        width: 16, 
                        height: 16, 
                        borderRadius: '50%', 
                        backgroundColor: p.colore 
                      }} />
                      {p.nome}
                      {p.isEx && ' (Ex)'}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              label="Note"
              value={formData.notes}
              onChange={handleChange('notes')}
              multiline
              rows={2}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          {appointment && (
            <>
              <Button 
                onClick={handleDelete} 
                color="error" 
                startIcon={<DeleteIcon />}
                sx={{ mr: 'auto' }}
              >
                Elimina
              </Button>
              <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />
            </>
          )}
          <Button onClick={onClose} color="inherit">Annulla</Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            {appointment ? 'Salva Modifiche' : 'Salva'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={showConfirmDelete}
        onClose={() => setShowConfirmDelete(false)}
        onConfirm={handleConfirmDelete}
        title="Elimina Appuntamento"
        message="Sei sicuro di voler eliminare questo appuntamento? Questa azione non può essere annullata."
        confirmText="Elimina"
        cancelText="Annulla"
      />
    </>
  );
}

export default AppointmentDialog; 