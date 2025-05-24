import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container
} from '@mui/material';
import WeekCalendar from '../components/WeekCalendar';
import AppointmentDialog from '../components/AppointmentDialog';
import TopBar from '../components/TopBar';
import StylistFilter from '../components/StylistFilter';
import { startOfWeek, endOfWeek, addWeeks } from 'date-fns';
import { appointmentsService, personaleService, initializeDefaultPersonale } from '../services/firebaseService';

function Cliente() {
  const [appointments, setAppointments] = useState([]);
  const [stylists, setStylists] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [selectedStylistIds, setSelectedStylistIds] = useState([]);
  const [currentWeek, setCurrentWeek] = useState(0);

  // Carica il personale dal database
  useEffect(() => {
    const loadStylists = async () => {
      try {
        // Inizializza il personale di default se necessario
        await initializeDefaultPersonale();
        
        const personale = await personaleService.getAllPersonale();
        console.log('Personale caricato:', personale);
        setStylists(personale.map(p => ({
          id: p.id,
          name: p.nome,
          color: p.colore
        })));
      } catch (error) {
        console.error('Errore nel caricamento del personale:', error);
      }
    };

    loadStylists();
  }, []);

  // Carica gli appuntamenti quando cambia la settimana
  useEffect(() => {
    loadAppointments();
  }, [currentWeek]);

  const loadAppointments = async () => {
    try {
      const startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30); // Carica appuntamenti per i prossimi 30 giorni
      
      const appointments = await appointmentsService.getAppointmentsByDateRange(startDate, endDate);
      
      // Trasforma gli appuntamenti nel formato richiesto dal calendario
      const transformedAppointments = appointments.map(appointment => {
        const startTime = new Date(appointment.data_inizio.toDate()); // Converti Timestamp in Date
        const endTime = new Date(startTime.getTime() + appointment.durata * 60000); // Aggiungi la durata in millisecondi
        
        return {
          id: appointment.id,
          title: appointment.servizio,
          client: appointment.nome,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          notes: appointment.note,
          color: appointment.personale_colore || '#FF5722',
          personale_id: appointment.personale_id
        };
      });
      
      console.log('Appuntamenti trasformati:', transformedAppointments);
      setAppointments(transformedAppointments);
    } catch (error) {
      console.error('Errore nel caricamento degli appuntamenti:', error);
    }
  };

  // Filtra gli appuntamenti in base ai dipendenti selezionati
  const filteredAppointments = selectedStylistIds.length === 0 
    ? appointments 
    : appointments.filter(app => selectedStylistIds.includes(app.personale_id));

  // Gestisce il cambio di settimana
  const handleWeekChange = (newWeek) => {
    setCurrentWeek(newWeek);
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
        await appointmentsService.updateAppointment(editingAppointment.id, appointmentData);
        console.log('Appuntamento aggiornato con successo');
      } else {
        console.log('Creazione nuovo appuntamento');
        const result = await appointmentsService.createAppointment(appointmentData);
        console.log('Appuntamento creato con successo:', result);
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

      await appointmentsService.updateAppointment(appointment.id, appointmentData);
      
      // Ricarica gli appuntamenti dal database
      await loadAppointments();
    } catch (error) {
      console.error('Errore durante lo spostamento dell\'appuntamento:', error);
    }
  };

  // Gestisce l'eliminazione di un appuntamento
  const handleDeleteAppointment = async (appointmentId) => {
    try {
      await appointmentsService.deleteAppointment(appointmentId);
      await loadAppointments();
      handleCloseDialog();
    } catch (error) {
      console.error('Errore durante l\'eliminazione dell\'appuntamento:', error);
    }
  };

  return (
    <Container maxWidth={false} disableGutters sx={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      overflow: 'hidden' // Importante per evitare scroll indesiderati
    }}>
      <TopBar title="Gestione Appuntamenti" />

      <Box sx={{ 
        flex: 1, 
        overflow: 'hidden', 
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 2
      }}>
        <StylistFilter 
          stylists={stylists}
          selectedStylistIds={selectedStylistIds}
          onStylistSelect={setSelectedStylistIds}
        />
        <Box sx={{ flex: 1, minHeight: 0 }}>
          <WeekCalendar
            onDaySelect={setSelectedDate}
            onTimeSlotClick={(time, date) => handleOpenDialog(date, time)}
            appointments={filteredAppointments}
            onAppointmentClick={(appointment) => {
              const date = new Date(appointment.startTime);
              const time = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
              handleOpenDialog(date, time, appointment);
            }}
            currentWeek={currentWeek}
            onWeekChange={handleWeekChange}
          />
        </Box>
      </Box>

      <AppointmentDialog
        open={openDialog}
        onClose={handleCloseDialog}
        onSave={handleSaveAppointment}
        onDelete={handleDeleteAppointment}
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