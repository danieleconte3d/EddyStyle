import React, { useState, useEffect, useMemo } from 'react';
import { Box, Grid, useTheme, useMediaQuery, IconButton, Typography, Dialog, Button, Paper } from '@mui/material';
import WeekDay from './WeekDay';
import WeekNavigator from './WeekNavigator';
import { format, addDays, subDays, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek } from 'date-fns';
import { it } from 'date-fns/locale';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

function WeekCalendar({ 
  onDaySelect, 
  onTimeSlotClick, 
  appointments = [], 
  onAppointmentClick,
  currentWeek,
  onWeekChange 
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Aggiungi listener per il resize della finestra
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Determina se mostrare la vista mobile basandosi sulla larghezza effettiva
  const shouldShowMobileView = windowWidth < 900;

  // Genera i giorni della settimana usando useMemo per ottimizzare
  const weekDays = useMemo(() => {
    const today = new Date();
    const days = [];
    
    // Trova il lunedì della settimana corrente
    const monday = new Date(today);
    monday.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1) + (currentWeek * 7));
    
    // Genera i 7 giorni della settimana
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(monday);
      currentDate.setDate(monday.getDate() + i);
      
      // Filtra gli appuntamenti per questo giorno
      const dayAppointments = appointments.filter(appointment => {
        const appointmentDate = new Date(appointment.startTime);
        return appointmentDate.toDateString() === currentDate.toDateString();
      });
      
      days.push({
        day: currentDate.toLocaleDateString('it-IT', { weekday: 'long' }),
        date: currentDate.toLocaleDateString('it-IT', { day: 'numeric', month: 'numeric' }),
        fullDate: currentDate,
        isToday: currentDate.toDateString() === today.toDateString(),
        appointments: dayAppointments
      });
    }
    
    return days;
  }, [currentWeek, appointments]);

  // Funzioni per la navigazione tra i mesi
  const handlePrevMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  // Gestisce il cambio di giorno su mobile
  const handlePrevDay = () => {
    const newDate = subDays(currentDate, 1);
    setCurrentDate(newDate);
    setSelectedDate(newDate);
    
    // Aggiorna la settimana se necessario
    const newWeek = Math.floor((newDate - startOfWeek(new Date(), { weekStartsOn: 1 })) / (7 * 24 * 60 * 60 * 1000));
    if (newWeek !== currentWeek && onWeekChange) {
      onWeekChange(newWeek);
    }
    
    if (onDaySelect) {
      onDaySelect(newDate);
    }
  };

  const handleNextDay = () => {
    const newDate = addDays(currentDate, 1);
    setCurrentDate(newDate);
    setSelectedDate(newDate);
    
    // Aggiorna la settimana se necessario
    const newWeek = Math.floor((newDate - startOfWeek(new Date(), { weekStartsOn: 1 })) / (7 * 24 * 60 * 60 * 1000));
    if (newWeek !== currentWeek && onWeekChange) {
      onWeekChange(newWeek);
    }
    
    if (onDaySelect) {
      onDaySelect(newDate);
    }
  };

  const handleDateSelect = (date) => {
    setCurrentDate(date);
    setSelectedDate(date);
    setCalendarOpen(false);
    
    // Aggiorna la settimana se necessario
    const newWeek = Math.floor((date - startOfWeek(new Date(), { weekStartsOn: 1 })) / (7 * 24 * 60 * 60 * 1000));
    if (newWeek !== currentWeek && onWeekChange) {
      onWeekChange(newWeek);
    }
    
    if (onDaySelect) {
      onDaySelect(date);
    }
  };

  // Genera i giorni del mese per il calendario
  const generateMonthDays = (date) => {
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    return eachDayOfInterval({ start, end });
  };

  const monthDays = generateMonthDays(currentDate);

  const handleDayClick = (day) => {
    setSelectedDate(day.fullDate);
    if (onDaySelect) {
      onDaySelect(day.fullDate);
    }
  };

  const handleWeekChange = (newWeek) => {
    if (onWeekChange) {
      onWeekChange(newWeek);
    }
  };

  const handleTimeSlotClick = (day, time) => {
    if (onTimeSlotClick) {
      onTimeSlotClick(time, day.fullDate);
    }
  };

  return (
    <Box sx={{ 
      width: '100%', 
      position: 'relative',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {!shouldShowMobileView ? (
        // Visualizzazione desktop
        <>
          <WeekNavigator 
            currentWeek={currentWeek}
            onWeekChange={onWeekChange}
          />
          <Grid 
            container 
            spacing={2} 
            sx={{ 
              mt: 2,
              flex: 1,
              minHeight: 0,
              overflow: 'hidden',
              '& .MuiGrid-item': {
                height: '100%',
                minHeight: 0,
                display: 'flex'
              }
            }}
          >
            {weekDays.map((day, index) => (
              <Grid item xs key={index}>
                <WeekDay
                  day={day.day}
                  date={day.date}
                  isToday={day.isToday}
                  isSelected={selectedDate && new Date(selectedDate).getDate() === new Date(day.fullDate).getDate()}
                  onClick={() => onDaySelect && onDaySelect(day.fullDate)}
                  onTimeSlotClick={(time) => onTimeSlotClick && onTimeSlotClick(time, day.fullDate)}
                  appointments={day.appointments}
                  onAppointmentClick={onAppointmentClick}
                />
              </Grid>
            ))}
          </Grid>
        </>
      ) : (
        // Visualizzazione mobile
        <>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            mb: 2,
            px: 1
          }}>
            <IconButton onClick={handlePrevDay} color="primary">
              <ChevronLeftIcon />
            </IconButton>
            
            <Box 
              onClick={() => setCalendarOpen(true)}
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                cursor: 'pointer',
                px: 2,
                py: 1,
                borderRadius: 1,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)'
                }
              }}
            >
              <CalendarMonthIcon />
              <Typography variant="body1">
                {format(currentDate, 'dd MMMM yyyy', { locale: it })}
              </Typography>
            </Box>

            <IconButton onClick={handleNextDay} color="primary">
              <ChevronRightIcon />
            </IconButton>
          </Box>

          <Dialog
            open={calendarOpen}
            onClose={() => setCalendarOpen(false)}
            maxWidth="xs"
            fullWidth
          >
            <Box sx={{ p: 2 }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                mb: 2
              }}>
                <IconButton onClick={handlePrevMonth} color="primary">
                  <ChevronLeftIcon />
                </IconButton>
                <Typography variant="h6">
                  {format(currentDate, 'MMMM yyyy', { locale: it })}
                </Typography>
                <IconButton onClick={handleNextMonth} color="primary">
                  <ChevronRightIcon />
                </IconButton>
              </Box>

              <Grid container spacing={1}>
                {['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'].map(day => (
                  <Grid item xs key={day}>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        display: 'block', 
                        textAlign: 'center',
                        fontWeight: 'bold',
                        color: 'text.secondary'
                      }}
                    >
                      {day}
                    </Typography>
                  </Grid>
                ))}
                {monthDays.map((day, index) => {
                  const isToday = day.toDateString() === new Date().toDateString();
                  const isSelected = selectedDate && day.toDateString() === selectedDate.toDateString();
                  return (
                    <Grid item xs key={index}>
                      <Button
                        fullWidth
                        onClick={() => handleDateSelect(day)}
                        sx={{
                          minWidth: '36px',
                          height: '36px',
                          p: 0,
                          borderRadius: '50%',
                          backgroundColor: isSelected ? 'primary.main' : 'transparent',
                          color: isSelected ? 'white' : 'text.primary',
                          '&:hover': {
                            backgroundColor: isSelected ? 'primary.dark' : 'rgba(255, 255, 255, 0.1)'
                          },
                          border: isToday ? '2px solid' : 'none',
                          borderColor: 'primary.main'
                        }}
                      >
                        {format(day, 'd')}
                      </Button>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
          </Dialog>

          <Box sx={{ flex: 1, minHeight: 0 }}>
            <WeekDay
              day={format(currentDate, 'EEEE', { locale: it })}
              date={format(currentDate, 'dd MMMM', { locale: it })}
              isToday={currentDate.toDateString() === new Date().toDateString()}
              isSelected={true}
              onTimeSlotClick={(time) => onTimeSlotClick && onTimeSlotClick(time, currentDate)}
              appointments={weekDays.find(day => 
                day.fullDate.toDateString() === currentDate.toDateString()
              )?.appointments || []}
              onAppointmentClick={onAppointmentClick}
            />
          </Box>
        </>
      )}
    </Box>
  );
}

function AppointmentCard({ appointment, onClick }) {
  const isExOperator = appointment.personale_isEx;

  return (
    <Box
      onClick={() => onClick(appointment)}
      sx={{
        p: 1,
        borderRadius: 1,
        backgroundColor: isExOperator ? 'transparent' : appointment.personale_colore,
        backgroundImage: isExOperator 
          ? `repeating-linear-gradient(45deg, ${appointment.personale_colore}, ${appointment.personale_colore} 10px, transparent 10px, transparent 20px)`
          : 'none',
        color: 'white',
        cursor: 'pointer',
        fontSize: '0.875rem',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        opacity: isExOperator ? 0.3 : 1,
        '&:hover': {
          opacity: isExOperator ? 0.5 : 0.8
        }
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        <Box>{appointment.nome_cliente}</Box>
        <Box sx={{ 
          fontSize: '0.8rem',
          fontWeight: 'bold',
          backgroundColor: 'rgba(255,255,255,0.2)',
          borderRadius: 1,
          px: 1,
          py: 0.5,
          textAlign: 'center'
        }}>
          {isExOperator ? 'EX OPERATORE' : 'OPERATORE ATTIVO'}
        </Box>
      </Box>
    </Box>
  );
}

export default WeekCalendar; 