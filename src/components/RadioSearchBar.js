import React from 'react';
import { Box, TextField, CircularProgress } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

function RadioSearchBar({ searchQuery, onSearchChange, onSearchSubmit, isLoading }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('📝 Form inviato con query:', searchQuery);
    if (searchQuery.trim()) {
      console.log('✅ Chiamata onSearchSubmit con:', searchQuery);
      onSearchSubmit(searchQuery);
    } else {
      console.log('❌ Query vuota, ricerca non eseguita');
    }
  };

  const handleChange = (e) => {
    console.log('📝 Input cambiato:', e.target.value);
    onSearchChange(e.target.value);
  };

  return (
    <Box sx={{ 
      width: '80%',
      maxWidth: 600,
      mb: 4,
      mt: 4
    }}>
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Cerca una radio..."
          value={searchQuery}
          onChange={handleChange}
          InputProps={{
            startAdornment: <SearchIcon sx={{ color: 'white', mr: 1 }} />,
            endAdornment: isLoading && <CircularProgress size={20} sx={{ color: 'white' }} />,
            sx: {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: 2,
              '& .MuiOutlinedInput-root': {
                color: 'white',
                '& fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'primary.main',
                },
              },
            }
          }}
        />
      </form>
    </Box>
  );
}

export default React.memo(RadioSearchBar); 