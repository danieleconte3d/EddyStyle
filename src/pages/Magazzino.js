import React from 'react';
import { Box, Typography, Container } from '@mui/material';
import TopBar from '../components/TopBar';

function Magazzino() {
  return (
    <Container maxWidth={false} disableGutters sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <TopBar title="Gestione Magazzino" />
      
      <Box sx={{ 
        flex: 1, 
        p: 3,
        mt: 2
      }}>
        <Typography variant="h4" sx={{ color: 'primary.main' }}>
          Gestione Magazzino
        </Typography>
      </Box>
    </Container>
  );
}

export default Magazzino; 