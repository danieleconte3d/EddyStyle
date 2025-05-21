import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Divider
} from '@mui/material';
import RadioBrowserAPI from '../utils/radioAPI';

const categoriesList = [
  { name: 'Pop', color: '#FF5252' },
  { name: 'Rock', color: '#7C4DFF' },
  { name: 'Jazz', color: '#448AFF' },
  { name: 'Classical', color: '#FFD740' },
  { name: 'Electronic', color: '#64FFDA' },
  { name: 'News', color: '#B388FF' },
  { name: 'Talk', color: '#FF80AB' },
  { name: 'Sports', color: '#69F0AE' },
  { name: 'Country', color: '#FFAB40' },
  { name: 'Hip Hop', color: '#EA80FC' }
];

const RadioFiltersContent = ({ onFilterChange, onClose, initialFilters = {} }) => {
  const [filters, setFilters] = useState(initialFilters);
  const [languages, setLanguages] = useState([]);
  const [countries, setCountries] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadFilterOptions = async () => {
      setIsLoading(true);
      try {
        // Carica le lingue più popolari
        const languagesData = await RadioBrowserAPI.getAllLanguages(20);
        setLanguages(languagesData);

        // Carica i paesi più popolari
        const countriesData = await RadioBrowserAPI.getAllCountries(20);
        setCountries(countriesData);

        // Carica i tag/generi più popolari
        const tagsData = await RadioBrowserAPI.getAllTags(30);
        setTags(tagsData);
      } catch (error) {
        console.error('Errore nel caricamento delle opzioni di filtro:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFilterOptions();
  }, []);

  const handleFilterChange = (name, value) => {
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    
    // Se selezioniamo una categoria, la impostiamo come tag
    if (name === 'category' && value) {
      newFilters.tag = value;
    }
  };

  const handleCategoryClick = (category) => {
    const newCategory = selectedCategory === category ? '' : category;
    setSelectedCategory(newCategory);
    handleFilterChange('category', newCategory);
  };

  const handleClearFilters = () => {
    setFilters({});
    setSelectedCategory('');
    if (onFilterChange) {
      onFilterChange({});
    }
  };

  const handleApplyFilters = () => {
    if (onFilterChange) {
      onFilterChange(filters);
    }
    if (onClose) {
      onClose();
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress size={30} sx={{ color: 'white' }} />
        </Box>
      ) : (
        <>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Categorie Popolari
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8, mb: 3 }}>
            {categoriesList.map((category) => (
              <Chip
                key={category.name}
                label={category.name}
                clickable
                size="small"
                onClick={() => handleCategoryClick(category.name)}
                sx={{
                  backgroundColor: selectedCategory === category.name ? category.color : 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: selectedCategory === category.name ? category.color : 'rgba(255, 255, 255, 0.2)',
                  }
                }}
              />
            ))}
          </Box>
          
          <Divider sx={{ my: 2, borderColor: 'rgba(255, 255, 255, 0.1)' }} />
          
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Lingua
          </Typography>
          <FormControl fullWidth sx={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: 1,
            mb: 2
          }}>
            <InputLabel id="language-select-label" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Lingua
            </InputLabel>
            <Select
              labelId="language-select-label"
              value={filters.language || ''}
              onChange={(e) => handleFilterChange('language', e.target.value)}
              label="Lingua"
              size="small"
              sx={{ 
                color: 'white',
                '.MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'primary.main',
                },
              }}
            >
              <MenuItem value="">Tutte le lingue</MenuItem>
              {languages.map((language) => (
                <MenuItem key={language.name} value={language.name}>
                  {language.name} ({language.stationcount})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Paese
          </Typography>
          <FormControl fullWidth sx={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: 1,
            mb: 3
          }}>
            <InputLabel id="country-select-label" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Paese
            </InputLabel>
            <Select
              labelId="country-select-label"
              value={filters.country || ''}
              onChange={(e) => handleFilterChange('country', e.target.value)}
              label="Paese"
              size="small"
              sx={{ 
                color: 'white',
                '.MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'primary.main',
                },
              }}
            >
              <MenuItem value="">Tutti i paesi</MenuItem>
              {countries.map((country) => (
                <MenuItem key={country.name} value={country.name}>
                  {country.name} ({country.stationcount})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button 
              variant="outlined" 
              onClick={handleClearFilters}
              size="small"
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                borderColor: 'rgba(255, 255, 255, 0.3)',
                '&:hover': {
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)'
                }
              }}
            >
              Pulisci
            </Button>
            
            <Button 
              variant="contained" 
              onClick={handleApplyFilters}
              size="small"
              color="primary"
            >
              Applica Filtri
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
};

export default RadioFiltersContent; 