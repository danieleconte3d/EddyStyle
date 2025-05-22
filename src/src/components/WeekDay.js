import React, { useEffect, useRef } from 'react';
import { Box, Typography, Paper, Tooltip } from '@mui/material';
import { styled } from '@mui/material/styles';

// Costante per l'altezza di ogni slot orario (in pixel)
const SLOT_HEIGHT = 30;
// Costante per la larghezza del contenitore degli appuntamenti
const APPOINTMENTS_CONTAINER_WIDTH = 130;

// Stile per il contenitore degli slot orari
const TimeSlotsContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  flexGrow: 1,
  height: 'calc(100vh - 300px)',
  overflow: 'auto',
  '&::-webkit-scrollbar': {
    display: 'none' // Nascondi la scrollbar
  },
  msOverflowStyle: 'none', // Per IE/Edge
  scrollbarWidth: 'none', // Per Firefox
  maskImage: 'linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)',
  WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)',
  padding: '0 4px'
}));

// Stile per la fascia oraria
const TimeSlot = styled(Box)(({ theme }) => ({
  borderTop: '1px solid rgba(255, 255, 255, 0.05)',
  padding: '4px 0',
  position: 'relative',
  minHeight: '30px',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.05)'
  }
}));

// Stile per l'appuntamento
const AppointmentBox = styled(Box)(({ theme, color }) => ({
  position: 'absolute',
  left: '40px',
  right: '2px',
  backgroundColor: color || 'rgba(25, 118, 210, 0.6)',
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(0.5),
  overflow: 'hidden',
  cursor: 'pointer',
  zIndex: 1,
  boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  '&:hover': {
    transform: 'translateY(-1px)',
    boxShadow: '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)'
  }
}));

function WeekDay({ 
  day, 
  date, 
  isToday, 
  isSelected, 
  onClick,
  onTimeSlotClick,
  appointments = [],
  onAppointmentClick,
  businessHours = { start: 0, end: 24, interval: 30 }
}) {
  const timeSlotsContainerRef = useRef(null);

  // Effetto per impostare lo scroll iniziale alle 7:00
  useEffect(() => {
    if (timeSlotsContainerRef.current) {
      // Calcola la posizione di scroll per le 7:00
      // Ogni slot è SLOT_HEIGHT pixel, e le 7:00 sono 14 slot dall'inizio (7 * 2 slot per ora)
      const scrollPosition = 7 * 2 * SLOT_HEIGHT;
      timeSlotsContainerRef.current.scrollTop = scrollPosition;
    }
  }, []);

  // Funzione per convertire la data dal formato italiano al formato ISO
  const convertItalianDateToISO = (italianDate) => {
    try {
      // Se la data è già in formato ISO, la restituiamo così com'è
      if (italianDate.includes('T')) {
        return italianDate;
      }

      // Dividi la data in giorno e mese
      const [day, month] = italianDate.split('/');
      
      // Ottieni l'anno corrente
      const currentYear = new Date().getFullYear();
      
      // Crea una nuova data nel formato ISO
      return new Date(currentYear, parseInt(month) - 1, parseInt(day)).toISOString();
    } catch (error) {
      console.error('Errore nella conversione della data:', error);
      return null;
    }
  };

  // Calcola la posizione e l'altezza di un appuntamento
  const getAppointmentPosition = (appointment, date) => {
    try {
      console.log('Calcolo posizione per appuntamento:', appointment);
      console.log('Data di riferimento:', date);

      // Verifica che la data sia una stringa valida o un oggetto Date
      if (!date || (typeof date === 'string' && !date.trim())) {
        console.log('Data non valida');
        return null;
      }

      // Converti la data in formato ISO se necessario
      const isoDate = convertItalianDateToISO(date);
      if (!isoDate) {
        console.log('Conversione data fallita');
        return null;
      }

      // Converti la data in un oggetto Date se non lo è già
      const appointmentDate = new Date(appointment.startTime);
      const currentDate = new Date(isoDate);
      
      console.log('Data appuntamento:', appointmentDate);
      console.log('Data corrente:', currentDate);
      
      // Verifica che le date siano valide
      if (isNaN(appointmentDate.getTime()) || isNaN(currentDate.getTime())) {
        console.log('Date non valide');
        return null;
      }
      
      // Confronta solo giorno, mese e anno
      if (appointmentDate.getDate() !== currentDate.getDate() || 
          appointmentDate.getMonth() !== currentDate.getMonth() || 
          appointmentDate.getFullYear() !== currentDate.getFullYear()) {
        console.log('Date non corrispondono');
        return null;
      }
      
      // Verifica che startTime ed endTime siano presenti
      if (!appointment.startTime || !appointment.endTime) {
        console.log('Orari mancanti');
        return null;
      }

      // Converti i timestamp in oggetti Date
      const startTime = new Date(appointment.startTime);
      const endTime = new Date(appointment.endTime);
      
      // Verifica che gli orari siano validi
      if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
        console.log('Orari non validi');
        return null;
      }

      // Ottieni le ore e i minuti nel fuso orario locale
      const startHour = startTime.getHours();
      const startMinute = startTime.getMinutes();
      const endHour = endTime.getHours();
      const endMinute = endTime.getMinutes();
      
      console.log('Orario inizio:', `${startHour}:${startMinute}`);
      console.log('Orario fine:', `${endHour}:${endMinute}`);
      
      // Calcola la posizione in pixel dall'inizio del giorno
      // Ogni ora è composta da 2 slot da 30 minuti
      const startPosition = (startHour * 2 + Math.floor(startMinute / 30)) * SLOT_HEIGHT;
      const durationInMinutes = (endHour - startHour) * 60 + (endMinute - startMinute);
      const height = Math.ceil(durationInMinutes / 30) * SLOT_HEIGHT;
      
      console.log('Posizione calcolata:', { top: startPosition, height });
      return { top: startPosition, height };
    } catch (error) {
      console.error('Errore nel calcolo della posizione:', error);
      return null;
    }
  };

  // Formatta orario per la visualizzazione
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // Genera array di fasce orarie
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = businessHours.start; hour < businessHours.end; hour++) {
      for (let minute = 0; minute < 60; minute += businessHours.interval) {
        const slot = {
          hour,
          minute,
          label: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
          position: (hour * 2 + minute / 30) * SLOT_HEIGHT
        };
        slots.push(slot);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Funzione per gestire la sovrapposizione degli appuntamenti
  const handleOverlappingAppointments = (appointments, date) => {
    const positions = appointments.map(appointment => {
      const position = getAppointmentPosition(appointment, date);
      return position ? { ...appointment, position } : null;
    }).filter(Boolean);

    // Raggruppa gli appuntamenti sovrapposti
    const overlappingGroups = [];
    positions.forEach((appointment, index) => {
      let addedToGroup = false;
      
      // Controlla se l'appuntamento si sovrappone con qualsiasi gruppo esistente
      for (let group of overlappingGroups) {
        const hasOverlap = group.some(existingAppointment => {
          const existingStart = existingAppointment.position.top;
          const existingEnd = existingStart + existingAppointment.position.height;
          const newStart = appointment.position.top;
          const newEnd = newStart + appointment.position.height;
          
          return (
            (newStart >= existingStart && newStart < existingEnd) ||
            (newEnd > existingStart && newEnd <= existingEnd) ||
            (newStart <= existingStart && newEnd >= existingEnd)
          );
        });

        if (hasOverlap) {
          group.push(appointment);
          addedToGroup = true;
          break;
        }
      }

      if (!addedToGroup) {
        overlappingGroups.push([appointment]);
      }
    });

    // Calcola la larghezza per ogni gruppo di appuntamenti sovrapposti
    overlappingGroups.forEach(group => {
      const width = APPOINTMENTS_CONTAINER_WIDTH / group.length;
      group.forEach((appointment, index) => {
        appointment.position.width = width;
        appointment.position.left = 40 + (width * index);
        appointment.position.margin = 2;
      });
    });

    return positions;
  };

  return (
    <Paper
      elevation={1}
      onClick={onClick}
      sx={{
        p: 0.5,
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        backgroundColor: 'background.paper',
        color: 'text.primary',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 3,
        },
        border: isToday ? '2px solid' : 'none',
        borderColor: 'primary.main',
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
      }}
    >
      <Box sx={{ mb: 0.25 }}>
        <Typography
          variant="h6"
          component="div"
          sx={{
            fontWeight: isToday ? 'bold' : 'normal',
            textAlign: 'center',
            mb: 0.25,
            fontSize: '0.875rem',
            lineHeight: 1.2
          }}
        >
          {day}
        </Typography>
        <Typography
          variant="body1"
          component="div"
          sx={{
            textAlign: 'center',
            opacity: isToday ? 1 : 0.7,
            fontSize: '0.75rem',
            lineHeight: 1.2
          }}
        >
          {date}
        </Typography>
      </Box>

      <TimeSlotsContainer ref={timeSlotsContainerRef}>
        {timeSlots.map((slot, i) => (
          <TimeSlot 
            key={i} 
            onClick={(e) => {
              e.stopPropagation();
              if (onTimeSlotClick) {
                onTimeSlotClick(slot.label, date);
              }
            }}
            sx={{
              position: 'relative',
              height: SLOT_HEIGHT,
              borderTop: '1px solid rgba(255, 255, 255, 0.05)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.05)'
              }
            }}
          >
            {slot.minute === 0 && (
              <Typography variant="caption" sx={{ 
                fontSize: '0.7rem', 
                color: 'text.secondary', 
                userSelect: 'none',
                position: 'absolute',
                top: '-8px',
                left: 0,
                padding: '0 4px',
                borderRadius: '2px',
                zIndex: 2
              }}>
                {slot.label}
              </Typography>
            )}
            {slot.minute === 30 && (
              <Box sx={{
                position: 'absolute',
                top: 0,
                left: '40px',
                right: 0,
                height: '1px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)'
              }} />
            )}
          </TimeSlot>
        ))}

        {handleOverlappingAppointments(appointments, date).map(appointment => {
          console.log('Rendering appuntamento:', {
            title: appointment.title,
            position: appointment.position,
            slotHeight: SLOT_HEIGHT
          });
          return (
            <Tooltip
              key={appointment.id}
              title={
                <Box sx={{ p: 1 }}>
                  <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 'bold' }}>
                    {appointment.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'white' }}>
                    Cliente: {appointment.client}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'white' }}>
                    Orario: {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
                  </Typography>
                  {appointment.notes && (
                    <Typography variant="body2" sx={{ color: 'white', mt: 1 }}>
                      Note: {appointment.notes}
                    </Typography>
                  )}
                </Box>
              }
              arrow
              placement="right"
              enterDelay={200}
              leaveDelay={200}
            >
              <AppointmentBox
                color={appointment.color}
                style={{
                  top: `${appointment.position.top}px`,
                  height: `${appointment.position.height}px`,
                  left: `${appointment.position.left}px`,
                  width: `${appointment.position.width - (appointment.position.margin * 2)}px`,
                  margin: `0 ${appointment.position.margin}px`
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (onAppointmentClick) {
                    onAppointmentClick(appointment);
                  }
                }}
              >
                <Typography 
                  variant="caption" 
                  sx={{ 
                    fontWeight: 'bold', 
                    fontSize: '0.7rem',
                    color: 'white',
                    textShadow: '0 1px 2px rgba(0,0,0,0.5)'
                  }}
                >
                  {formatTime(appointment.startTime)} - {appointment.title}
                </Typography>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    display: 'block', 
                    fontSize: '0.7rem',
                    color: 'white',
                    textShadow: '0 1px 2px rgba(0,0,0,0.5)'
                  }}
                >
                  {appointment.client}
                </Typography>
              </AppointmentBox>
            </Tooltip>
          );
        })}
      </TimeSlotsContainer>
    </Paper>
  );
}

export default WeekDay; 