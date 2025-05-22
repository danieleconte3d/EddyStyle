import React, { useState, useEffect, useMemo } from 'react';
import { Box, Grid } from '@mui/material';
import WeekDay from './WeekDay';
import WeekNavigator from './WeekNavigator';
import { format } from 'date-fns';
import { startOfISOWeek, addDays } from 'date-fns';

function WeekCalendar({ onDaySelect, onTimeSlotClick, appointments = [], onAppointmentClick }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentWeek, setCurrentWeek] = useState(0);

  console.log('WeekCalendar - Appuntamenti ricevuti:', appointments);

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

  // Genera le date per la settimana corrente
  const generateWeekDates = (date) => {
    const startOfWeek = startOfISOWeek(date);
    const dates = [];
    
    for (let i = 0; i < 7; i++) {
      const currentDate = addDays(startOfWeek, i);
      dates.push({
        date: format(currentDate, 'dd/MM'),
        day: format(currentDate, 'EEEE'),
        fullDate: currentDate
      });
    }
    
    return dates;
  };

  // Filtra gli appuntamenti per la data specificata
  const getAppointmentsForDate = (date) => {
    console.log('Filtro appuntamenti per data:', date);
    const filteredAppointments = appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.startTime);
      const targetDate = new Date(date.fullDate);
      
      const isSameDay = appointmentDate.getDate() === targetDate.getDate() &&
                       appointmentDate.getMonth() === targetDate.getMonth() &&
                       appointmentDate.getFullYear() === targetDate.getFullYear();
      
      console.log('Confronto date:', {
        appointmentDate: appointmentDate.toISOString(),
        targetDate: targetDate.toISOString(),
        isSameDay
      });
      
      return isSameDay;
    });
    
    console.log('Appuntamenti filtrati:', filteredAppointments);
    return filteredAppointments;
  };

  const weekDates = generateWeekDates(currentDate);
  const today = format(new Date(), 'dd/MM');

  const handleDayClick = (day) => {
    setSelectedDate(day.fullDate);
    if (onDaySelect) {
      onDaySelect(day.fullDate);
    }
  };

  const handleWeekChange = (newWeek) => {
    setCurrentWeek(newWeek);
  };

  const handleTimeSlotClick = (day, time) => {
    if (onTimeSlotClick) {
      onTimeSlotClick(time, day.fullDate);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <WeekNavigator 
        currentWeek={currentWeek}
        onWeekChange={handleWeekChange}
      />
      <Grid container spacing={2} sx={{ mt: 2 }}>
        {weekDays.map((day, index) => (
          <Grid item xs key={index}>
            <WeekDay
              day={day.day}
              date={day.date}
              isToday={day.isToday}
              isSelected={selectedDate && new Date(selectedDate).getDate() === new Date(day.fullDate).getDate()}
              onClick={() => onDaySelect && onDaySelect(day.fullDate)}
              onTimeSlotClick={(time) => handleTimeSlotClick(day, time)}
              appointments={getAppointmentsForDate(day)}
              onAppointmentClick={onAppointmentClick}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default WeekCalendar; 