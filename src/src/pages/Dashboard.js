import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography, Container, Grid } from '@mui/material';
import RadioIcon from '@mui/icons-material/Radio';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import InventoryIcon from '@mui/icons-material/Inventory';
import WindowControls from '../components/WindowControls';

function Dashboard() {
  const navigate = useNavigate();

  const buttons = [
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
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <WindowControls />
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <Typography variant="h2" component="h1" gutterBottom sx={{ mb: 8, color: 'primary.main' }}>
          Eddy Style
        </Typography>
        
        <Grid container spacing={4} justifyContent="center">
          {buttons.map((button) => (
            <Grid item key={button.title}>
              <Button
                variant="contained"
                onClick={() => navigate(button.path)}
                sx={{
                  width: 200,
                  height: 200,
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
    </Container>
  );
}

export default Dashboard; 