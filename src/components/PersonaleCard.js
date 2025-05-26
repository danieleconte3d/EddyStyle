import React from 'react';
import { 
  Box, 
  Typography
} from '@mui/material';

function PersonaleCard({ 
  personale, 
  onClick
}) {
  return (
    <Box 
      onClick={() => onClick(personale)}
      sx={{ 
        position: 'relative',
        p: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 0.5,
        width: 'fit-content',
        minWidth: 120,
        maxWidth: 140,
        cursor: 'pointer',
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'translateY(-2px)'
        }
      }}
    >
      <Box sx={{ 
        position: 'relative',
        width: 120,
        height: 120,
        padding: '4px',
        borderRadius: '50%',
        border: '3px solid',
        borderColor: personale.colore,
        backgroundColor: 'transparent'
      }}>
        <Box sx={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          overflow: 'hidden',
          backgroundColor: 'rgba(0,0,0,0.1)',
          position: 'relative'
        }}>
          {personale.foto ? (
            <img 
              src={personale.foto} 
              alt={personale.nome}
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'cover' 
              }}
            />
          ) : (
            <Box sx={{ 
              width: '100%', 
              height: '100%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              backgroundColor: 'rgba(0,0,0,0.05)'
            }}>
              <Typography variant="h3" sx={{ color: 'text.secondary' }}>
                {personale.nome.charAt(0).toUpperCase()}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
      <Box sx={{ 
        textAlign: 'center',
        width: '100%'
      }}>
        <Typography variant="h6" sx={{ mb: 0.5 }}>
          {personale.nome}
        </Typography>
        {personale.telefono && (
          <Typography variant="body2" color="text.secondary">
            {personale.telefono}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

export default PersonaleCard; 