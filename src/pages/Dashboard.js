import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography, Container, Grid, useTheme, useMediaQuery } from '@mui/material';
import RadioIcon from '@mui/icons-material/Radio';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import InventoryIcon from '@mui/icons-material/Inventory';
import PeopleIcon from '@mui/icons-material/People';
import TopBar from '../components/TopBar';

function Dashboard() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Log per debugging
  useEffect(() => {
    console.log('Dashboard component mounted');
  }, []);

  const buttons = isMobile ? [
    {
      title: 'Calendario',
      icon: <CalendarMonthIcon sx={{ fontSize: 60 }} />,
      path: '/clienti',
      color: '#00e5ff'
    },
    {
      title: 'Personale',
      icon: <PeopleIcon sx={{ fontSize: 60 }} />,
      path: '/personale',
      color: '#ff9800'
    }
  ] : [
    {
      title: 'Radio',
      icon: <RadioIcon sx={{ fontSize: 60 }} />,
      path: '/radio',
      color: '#f50057'
    },
    {
      title: 'Calendario',
      icon: <CalendarMonthIcon sx={{ fontSize: 60 }} />,
      path: '/clienti',
      color: '#00e5ff'
    },
    {
      title: 'Magazzino',
      icon: <InventoryIcon sx={{ fontSize: 60 }} />,
      path: '/magazzino',
      color: '#4caf50'
    },
    {
      title: 'Personale',
      icon: <PeopleIcon sx={{ fontSize: 60 }} />,
      path: '/personale',
      color: '#ff9800'
    }
  ];

  return (
    <Container maxWidth={false} disableGutters sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      <TopBar title="Eddy Style" showBack={true} />
      
      <Box sx={{ 
        flexGrow: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        alignItems: 'center',
        px: 2,
        py: 4,
        mt: 2
      }}>
        <Typography 
          variant="h2" 
          component="h1" 
          gutterBottom 
          sx={{ mb: { xs: 4, sm: 8 }, color: 'primary.main', textAlign: 'center' }}
        >
          Eddy Style
        </Typography>
        
        <Box sx={{ width: '100%', maxWidth: 1000, mx: 'auto' }}>
          <Grid container spacing={4} justifyContent="center">
            {buttons.map((button) => (
              <Grid item key={button.title} xs={12} sm={6} md={isMobile ? 6 : 4}>
                <Button
                  variant="contained"
                  onClick={() => {
                    console.log(`Navigating to ${button.path}`);
                    navigate(button.path);
                  }}
                  sx={{
                    width: '100%',
                    minHeight: { xs: 120, sm: 180 },
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    backgroundColor: button.color,
                    '&:hover': {
                      backgroundColor: button.color,
                      opacity: 0.9
                    }
                  }}
                >
                  {button.icon}
                  <Typography variant="h5" component="span">
                    {button.title}
                  </Typography>
                </Button>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>
    </Container>
  );
}

export default Dashboard; 