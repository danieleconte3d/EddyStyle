import React from 'react';
import { Box, IconButton, Typography, ButtonGroup } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

function WeekNavigator({ currentWeek, onWeekChange }) {
  const getWeekLabel = (weekOffset) => {
    if (weekOffset === 0) return 'Settimana Corrente';
    if (weekOffset > 0) return `Settimana +${weekOffset}`;
    return `Settimana ${weekOffset}`;
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      gap: 2,
      mb: 3
    }}>
      <ButtonGroup variant="contained" color="primary">
        <IconButton 
          onClick={() => onWeekChange(currentWeek - 1)}
          color="inherit"
          sx={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.2)'
            }
          }}
        >
          <ChevronLeftIcon />
        </IconButton>
        
        <Box sx={{ 
          px: 3, 
          py: 1,
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderRadius: 1,
          minWidth: 200,
          textAlign: 'center'
        }}>
          <Typography variant="h6" color="white">
            {getWeekLabel(currentWeek)}
          </Typography>
        </Box>

        <IconButton 
          onClick={() => onWeekChange(currentWeek + 1)}
          color="inherit"
          sx={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.2)'
            }
          }}
        >
          <ChevronRightIcon />
        </IconButton>
      </ButtonGroup>
    </Box>
  );
}

export default WeekNavigator; 