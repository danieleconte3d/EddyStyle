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
  Grid 
} from '@mui/material';

function AppointmentDialog({ 
  open, 
  onClose, 
  onSave, 
  appointment, 
  selectedDate, 
  selectedTime, 
  onTimeChange,
  stylists = []
}) {
  const [formData, setFormData] = React.useState({
    title: '',
    client: '',
    stylistId: '',
    notes: '',
    duration: 60
  });

  // Aggiorna il form quando cambia l'appuntamento
  React.useEffect(() => {
    if (appointment) {
      setFormData({
        title: appointment.title,
        client: appointment.client,
        stylistId: appointment.stylistId,
        notes: appointment.notes || '',
        duration: Math.round((appointment.endTime - appointment.startTime) / (1000 * 60))
      });
    } else {
      setFormData({
        title: '',
        client: '',
        stylistId: '',
        notes: '',
        duration: 60
      });
    }
  }, [appointment]);

  const handleChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSave = () => {
    onSave({
      ...formData,
      date: selectedDate,
      time: selectedTime,
      personale_id: formData.stylistId
    });
  };

  return (
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
              {selectedDate && (
                <TextField
                  label="Data"
                  value={selectedDate.toLocaleDateString('it')}
                  InputProps={{ readOnly: true }}
                  fullWidth
                />
              )}
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
          
          <FormControl fullWidth required>
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
              {stylists.map(stylist => (
                <MenuItem key={stylist.id} value={stylist.id}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box 
                      sx={{ 
                        width: 16, 
                        height: 16, 
                        borderRadius: '50%', 
                        bgcolor: stylist.color,
                        mr: 1 
                      }} 
                    />
                    {stylist.name}
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
      <DialogActions>
        <Button onClick={onClose} color="inherit">Annulla</Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          {appointment ? 'Salva Modifiche' : 'Salva'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AppointmentDialog; 