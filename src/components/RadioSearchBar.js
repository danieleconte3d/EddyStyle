import React from 'react';
import { Box, TextField, CircularProgress } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

function RadioSearchBar({ searchQuery, onSearchChange, isLoading }) {
  const handleSubmit = (e) => {
    e.preventDefault();
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
          onChange={(e) => onSearchChange(e.target.value)}
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