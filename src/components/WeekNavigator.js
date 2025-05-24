import React from 'react';
import { Box, IconButton, Typography, Paper } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { format, addWeeks, subWeeks } from 'date-fns';
import { it } from 'date-fns/locale';

function WeekNavigator({ currentWeek, onWeekChange }) {
  const today = new Date();
  const currentDate = currentWeek === 0 ? today : addWeeks(today, currentWeek);
  
  const getWeekRange = (date) => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay() + (date.getDay() === 0 ? -6 : 1));
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    return { startOfWeek, endOfWeek };
  };

  const { startOfWeek, endOfWeek } = getWeekRange(currentDate);

  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      mb: 3
    }}>
      <Paper
        elevation={0}
        sx={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '12px',
          padding: '4px',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        <IconButton 
          onClick={() => onWeekChange(currentWeek - 1)}
          sx={{ 
            color: 'white',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)'
            }
          }}
        >
          <ChevronLeftIcon />
        </IconButton>
        
        <Box sx={{ 
          px: 3,
          py: 1,
          minWidth: 300,
          textAlign: 'center',
          borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
          borderRight: '1px solid rgba(255, 255, 255, 0.1)',
          mx: 1
        }}>
          <Typography 
            variant="subtitle1" 
            sx={{ 
              color: 'white',
              fontWeight: 500,
              letterSpacing: '0.5px'
            }}
          >
            {format(startOfWeek, 'd MMMM', { locale: it })} - {format(endOfWeek, 'd MMMM yyyy', { locale: it })}
          </Typography>
          <Typography 
            variant="caption" 
            sx={{ 
              color: 'rgba(255, 255, 255, 0.7)',
              display: 'block',
              mt: 0.5
            }}
          >
            {currentWeek === 0 ? 'Settimana Corrente' : 
             currentWeek > 0 ? `Settimana +${currentWeek}` : 
             `Settimana ${currentWeek}`}
          </Typography>
        </Box>

        <IconButton 
          onClick={() => onWeekChange(currentWeek + 1)}
          sx={{ 
            color: 'white',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)'
            }
          }}
        >
          <ChevronRightIcon />
        </IconButton>
      </Paper>
    </Box>
  );
}

export default WeekNavigator; 