import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Container, IconButton
} from '@mui/material';
import WindowControls from '../components/WindowControls';
import WeekCalendar from '../components/WeekCalendar';
import AppointmentDialog from '../components/AppointmentDialog';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

function Cliente() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [stylists, setStylists] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [editingAppointment, setEditingAppointment] = useState(null);

  // Carica gli appuntamenti e il personale dal database
  useEffect(() => {
    const loadData = async () => {
      try {
        // Carica il personale
        const personale = await window.electron.database.getAllPersonale();
        console.log('Personale caricato:', personale);
        setStylists(personale.map(p => ({
          id: p.id,
          name: p.nome,
          color: p.colore
        })));

        // Carica gli appuntamenti
        await loadAppointments();
      } catch (error) {
        console.error('Errore nel caricamento dei dati:', error);
      }
    };

    loadData();
  }, []);

  const loadAppointments = async () => {
    try {
      const appointments = await window.electron.database.getAllAppointments();
      console.log('Appuntamenti caricati dal database:', appointments);
      
      // Trasforma gli appuntamenti nel formato richiesto dal componente WeekDay
      const transformedAppointments = appointments.map(appointment => {
        const startTime = new Date(appointment.data_inizio);
        const endTime = new Date(startTime.getTime() + appointment.durata * 60000); // Converti durata in millisecondi
        
        return {
          id: appointment.id,
          title: appointment.servizio,
          client: appointment.nome,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          notes: appointment.note,
          color: appointment.personale_colore || '#FF5722', // Usa il colore del personale o un colore di default
          personale_id: appointment.personale_id
        };
      });
      
      console.log('Appuntamenti trasformati:', transformedAppointments);
      setAppointments(transformedAppointments);
    } catch (error) {
      console.error('Errore nel caricamento degli appuntamenti:', error);
    }
  };
  
  // Gestisce apertura del dialog per nuovo appuntamento
  const handleOpenDialog = (date, time, appointment = null) => {
    console.log('Apertura dialog con:', { date, time, appointment });
    if (!date || !time) {
      console.error('Data o orario mancanti');
      return;
    }
    setSelectedDate(date);
    setSelectedTime(time);
    setEditingAppointment(appointment);
    setOpenDialog(true);
  };
  
  // Chiude il dialog
  const handleCloseDialog = () => {
    console.log('Chiusura dialog');
    setOpenDialog(false);
    setSelectedDate(null);
    setSelectedTime(null);
    setEditingAppointment(null);
  };
  
  // Funzione per verificare la sovrapposizione degli appuntamenti
  const checkAppointmentOverlap = (newAppointment, existingAppointments) => {
    const newStart = new Date(newAppointment.startTime);
    const newEnd = new Date(newAppointment.endTime);

    return existingAppointments.some(existing => {
      if (existing.id === newAppointment.id) return false;
      const existingStart = new Date(existing.startTime);
      const existingEnd = new Date(existing.endTime);
      
      return (
        (newStart >= existingStart && newStart < existingEnd) ||
        (newEnd > existingStart && newEnd <= existingEnd) ||
        (newStart <= existingStart && newEnd >= existingEnd)
      );
    });
  };
  
  // Gestisce il salvataggio dell'appuntamento
  const handleSaveAppointment = async (formData) => {
    try {
      console.log('Dati form ricevuti:', formData);
      
      // Creiamo una nuova data basata sulla data selezionata
      const date = new Date(formData.date);
      const [hour, minute] = formData.time.split(':').map(Number);
      
      // Impostiamo l'ora e i minuti sulla data
      date.setHours(hour, minute, 0, 0);
      
      // Creiamo l'orario di inizio e fine
      const startTime = new Date(date);
      const endTime = new Date(date);
      endTime.setMinutes(endTime.getMinutes() + formData.duration);

      const appointmentData = {
        nome: formData.client,
        servizio: formData.title,
        data_inizio: startTime.toISOString(),
        durata: formData.duration,
        note: formData.notes,
        telefono: formData.telefono || '',
        email: formData.email || '',
        prezzo: formData.prezzo || 0,
        metodo_pagamento: formData.metodo_pagamento || '',
        personale_id: formData.personale_id || null
      };

      console.log('Dati appuntamento da salvare:', appointmentData);

      if (editingAppointment) {
        console.log('Aggiornamento appuntamento esistente:', editingAppointment.id);
        const result = await window.electron.database.updateAppointment(editingAppointment.id, appointmentData);
        console.log('Risultato aggiornamento:', result);
      } else {
        console.log('Creazione nuovo appuntamento');
        const result = await window.electron.database.createAppointment(appointmentData);
        console.log('Risultato creazione:', result);
      }

      // Ricarica gli appuntamenti dal database
      await loadAppointments();
      handleCloseDialog();
    } catch (error) {
      console.error('Errore nel salvataggio dell\'appuntamento:', error);
    }
  };

  // Gestisce il movimento di un appuntamento
  const handleAppointmentMove = async (appointment, newData) => {
    try {
      // Verifica sovrapposizioni con il nuovo orario
      const hasOverlap = appointments.some(existing => {
        if (existing.id === appointment.id) return false;
        
        const existingStart = new Date(existing.startTime);
        const existingEnd = new Date(existing.endTime);
        const newStart = new Date(newData.startTime);
        const newEnd = new Date(newData.endTime);
        
        return (
          (newStart >= existingStart && newStart < existingEnd) ||
          (newEnd > existingStart && newEnd <= existingEnd) ||
          (newStart <= existingStart && newEnd >= existingEnd)
        );
      });

      if (hasOverlap) {
        console.log('Attenzione: Appuntamento sovrapposto');
        return;
      }

      // Aggiorna l'appuntamento nel database
      const appointmentData = {
        nome: appointment.client,
        servizio: appointment.title,
        data_inizio: new Date(newData.startTime).toISOString(),
        durata: Math.round((newData.endTime - newData.startTime) / 60000),
        note: appointment.notes,
        telefono: '',
        email: '',
        prezzo: 0,
        metodo_pagamento: ''
      };

      await window.electron.database.updateAppointment(appointment.id, appointmentData);
      
      // Ricarica gli appuntamenti dal database
      await loadAppointments();
    } catch (error) {
      console.error('Errore durante lo spostamento dell\'appuntamento:', error);
    }
  };

  return (
    <Container maxWidth={false} disableGutters sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        p: 2,
        borderBottom: '1px solid rgba(255, 255, 255, 0.12)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate('/')} color="inherit">
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" component="h1">
            Gestione Appuntamenti
          </Typography>
        </Box>
        <WindowControls />
      </Box>

      <Box sx={{ flex: 1, overflow: 'hidden', p: 2 }}>
        <WeekCalendar
          onDaySelect={setSelectedDate}
          onTimeSlotClick={(time, date) => handleOpenDialog(date, time)}
          appointments={appointments}
          onAppointmentClick={(appointment) => {
            const date = new Date(appointment.startTime);
            const time = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
            handleOpenDialog(date, time, appointment);
          }}
        />
      </Box>

      <AppointmentDialog
        open={openDialog}
        onClose={handleCloseDialog}
        onSave={handleSaveAppointment}
        appointment={editingAppointment}
        selectedDate={selectedDate}
        selectedTime={selectedTime}
        onTimeChange={(e) => setSelectedTime(e.target.value)}
        stylists={stylists}
      />
    </Container>
  );
}

export default Cliente; 