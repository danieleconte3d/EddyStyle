import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  IconButton,
  useTheme
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import WindowControls from './WindowControls';
import MiniPlayer from './MiniPlayer';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

function TopBar({ title, showBack = true }) {
  const navigate = useNavigate();
  const theme = useTheme();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Aggiorna l'orologio ogni secondo
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between',
      p: 2,
      borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
      backgroundColor: theme.palette.background.paper,
      height: '64px'
    }}>
      {/* Sezione sinistra: Back button e titolo */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {showBack && (
          <IconButton 
            onClick={() => navigate(-1)} 
            color="inherit"
            sx={{ 
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            <ArrowBackIcon />
          </IconButton>
        )}
        <Typography 
          variant="h6" 
          component="h1"
          sx={{
            fontWeight: 'bold',
            fontSize: '1.1rem'
          }}
        >
          {title}
        </Typography>
      </Box>

      {/* Sezione centrale: Orologio e data */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        position: 'absolute',
        left: '50%',
        transform: 'translateX(-50%)'
      }}>
        <Typography 
          variant="h6" 
          sx={{ 
            fontSize: '1.2rem',
            fontWeight: 'bold',
            fontFamily: 'monospace'
          }}
        >
          {format(currentTime, 'HH:mm:ss')}
        </Typography>
        <Typography 
          variant="caption" 
          sx={{ 
            color: 'text.secondary',
            fontSize: '0.8rem'
          }}
        >
          {format(currentTime, 'EEEE d MMMM yyyy', { locale: it })}
        </Typography>
      </Box>

      {/* Sezione destra: MiniPlayer e controlli finestra */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 2
      }}>
        <MiniPlayer />
        <WindowControls />
      </Box>
    </Box>
  );
}

export default TopBar; 