import React, { useEffect, useRef } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';

// Costante per l'altezza di ogni slot orario (in pixel)
const SLOT_HEIGHT = 30;
// Costante per la larghezza del contenitore degli appuntamenti
const APPOINTMENTS_CONTAINER_WIDTH = 130;

// Stile per il contenitore degli slot orari
const TimeSlotsContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  flexGrow: 1,
  height: '100%',
  overflow: 'auto',
  '&::-webkit-scrollbar': {
    display: 'none' // Nascondi la scrollbar
  },
  msOverflowStyle: 'none', // Per IE/Edge
  scrollbarWidth: 'none', // Per Firefox
  maskImage: 'linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)',
  WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)',
  padding: '0 4px',
  display: 'flex',
  flexDirection: 'column'
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
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
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

  // Formatta orario per la visualizzazione
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // Formatta la data per mostrare il mese in lettere
  const formatDate = (dateStr) => {
    const [day, month] = dateStr.split('/');
    const months = [
      'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
      'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
    ];
    return `${day} ${months[parseInt(month) - 1]}`;
  };

  // Calcola la posizione e l'altezza di un appuntamento
  const getAppointmentPosition = (appointment, date) => {
    try {
      const startTime = new Date(appointment.startTime);
      const endTime = new Date(appointment.endTime);
      
      // Calcolo della posizione verticale
      const startMinutes = startTime.getHours() * 60 + startTime.getMinutes();
      const endMinutes = endTime.getHours() * 60 + endTime.getMinutes();
      const duration = endMinutes - startMinutes;
      
      const SLOT_HEIGHT = 30; // altezza di ogni slot in pixel
      const MINUTES_PER_SLOT = 30; // minuti per ogni slot
      const CONTAINER_PADDING = 20; // padding del contenitore
      const FIRST_LINE_OFFSET = -8; // offset della prima linea per il testo
      const TIME_LABEL_HEIGHT = 16; // altezza del riquadro verde con il testo dell'orario
      const TIME_LABEL_OFFSET = TIME_LABEL_HEIGHT / 2; // offset per centrare rispetto al riquadro verde
      
      const top = (startMinutes / MINUTES_PER_SLOT) * SLOT_HEIGHT + CONTAINER_PADDING + FIRST_LINE_OFFSET + TIME_LABEL_OFFSET;
      const height = (duration / MINUTES_PER_SLOT) * SLOT_HEIGHT;
      
      return { 
        top,
        height,
        left: 40,
        width: APPOINTMENTS_CONTAINER_WIDTH - 4,
        margin: 2
      };
    } catch (error) {
      console.error('Errore nel calcolo della posizione:', error);
      return null;
    }
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
    console.log('Gestione sovrapposizioni:', {
      appointmentsCount: appointments.length,
      date
    });

    const positions = appointments.map(appointment => {
      const position = getAppointmentPosition(appointment, date);
      return position ? { ...appointment, position } : null;
    }).filter(Boolean);

    console.log('Posizioni calcolate:', positions);

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

  // Calcola le posizioni degli appuntamenti
  const positionedAppointments = handleOverlappingAppointments(appointments, date);
  console.log('Appuntamenti posizionati:', positionedAppointments);

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
        height: '100%',
        width: '100%',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <Box sx={{ mb: 0.25, flexShrink: 0 }}>
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
          {formatDate(date)}
        </Typography>
      </Box>

      <TimeSlotsContainer 
        ref={timeSlotsContainerRef}
        sx={{
          position: 'relative',
          flex: 1,
          overflow: 'auto',
          paddingTop: '20px',
          minHeight: 0
        }}
      >
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
              height: '30px',
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
          </TimeSlot>
        ))}

        {positionedAppointments && positionedAppointments.length > 0 ? (
          positionedAppointments.map(appointment => {
            const position = appointment.position;
            return (
              <AppointmentBox
                key={appointment.id}
                color={appointment.color}
                style={{
                  top: `${position.top}px`,
                  height: `${position.height}px`,
                  left: `${position.left}px`,
                  width: `${position.width}px`,
                  margin: `0 ${position.margin}px`,
                  position: 'absolute',
                  zIndex: 999
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
                    textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
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
                    textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {appointment.client}
                </Typography>
              </AppointmentBox>
            );
          })
        ) : null}
      </TimeSlotsContainer>
    </Paper>
  );
}

export default WeekDay; 