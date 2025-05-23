import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  IconButton,
  useTheme,
  useMediaQuery
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
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
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
      p: { xs: 1, sm: 2 },
      borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
      backgroundColor: theme.palette.background.paper,
      height: { xs: '56px', sm: '64px' },
      position: 'relative'
    }}>
      {/* Sezione sinistra: Back button e titolo */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: { xs: 1, sm: 2 },
        flex: '1 1 auto',
        minWidth: 0
      }}>
        {showBack && (
          <IconButton 
            onClick={() => navigate(-1)} 
            color="inherit"
            size={isSmall ? 'small' : 'medium'}
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
            fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' },
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
        >
          {title}
        </Typography>
      </Box>

      {/* Sezione centrale: Orologio e data (solo su desktop) */}
      {!isMobile && (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1
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
      )}

      {/* Orologio mobile compatto */}
      {isMobile && (
        <Typography 
          variant="body2" 
          sx={{ 
            fontFamily: 'monospace',
            fontSize: { xs: '0.8rem', sm: '0.9rem' },
            color: 'text.secondary',
            position: 'absolute',
            right: { xs: '80px', sm: '120px' },
            top: '50%',
            transform: 'translateY(-50%)'
          }}
        >
          {format(currentTime, 'HH:mm')}
        </Typography>
      )}

      {/* Sezione destra: MiniPlayer e controlli finestra */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: { xs: 1, sm: 2 },
        flex: '0 0 auto'
      }}>
        {!isSmall && <MiniPlayer />}
        <WindowControls />
      </Box>
    </Box>
  );
}

export default TopBar; 