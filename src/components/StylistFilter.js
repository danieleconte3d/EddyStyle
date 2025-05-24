import React from 'react';
import { Box, Button, Paper } from '@mui/material';

function StylistFilter({ stylists, selectedStylistIds, onStylistSelect }) {
  const handleStylistClick = (stylistId) => {
    if (stylistId === null) {
      // Se clicchiamo su "Tutti", deseleziona tutti gli altri
      onStylistSelect([]);
    } else {
      // Se clicchiamo su un dipendente
      const newSelection = selectedStylistIds.includes(stylistId)
        ? selectedStylistIds.filter(id => id !== stylistId) // Rimuovi se già selezionato
        : [...selectedStylistIds, stylistId]; // Aggiungi se non selezionato
      
      onStylistSelect(newSelection);
    }
  };

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        mb: 2, 
        p: 1,
        display: 'flex', 
        justifyContent: 'center',
        backgroundColor: 'background.paper',
        gap: 1 // Aggiunge spazio tra i pulsanti
      }}
    >
      <Button
        variant={selectedStylistIds.length === 0 ? "contained" : "outlined"}
        onClick={() => handleStylistClick(null)}
        size="small"
        sx={{
          minWidth: '80px'
        }}
      >
        Tutti
      </Button>
      {stylists.map((stylist) => (
        <Button
          key={stylist.id}
          variant={selectedStylistIds.includes(stylist.id) ? "contained" : "outlined"}
          onClick={() => handleStylistClick(stylist.id)}
          size="small"
          sx={{
            minWidth: '100px',
            borderColor: stylist.color,
            color: selectedStylistIds.includes(stylist.id) ? 'white' : stylist.color,
            backgroundColor: selectedStylistIds.includes(stylist.id) ? stylist.color : 'transparent',
            '&:hover': {
              backgroundColor: selectedStylistIds.includes(stylist.id) ? stylist.color : `${stylist.color}20`,
              borderColor: stylist.color,
            }
          }}
        >
          {stylist.name}
        </Button>
      ))}
    </Paper>
  );
}

export default StylistFilter; 