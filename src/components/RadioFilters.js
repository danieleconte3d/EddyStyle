import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FilterListIcon from '@mui/icons-material/FilterList';
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

const RadioFilters = ({ onFilterChange, initialFilters = {} }) => {
  const [expanded, setExpanded] = useState(false);
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
        const languagesData = await RadioBrowserAPI.getAllLanguages(30);
        setLanguages(languagesData);

        // Carica i paesi più popolari
        const countriesData = await RadioBrowserAPI.getAllCountries(30);
        setCountries(countriesData);

        // Carica i tag/generi più popolari
        const tagsData = await RadioBrowserAPI.getAllTags(50);
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
    
    // Notifica il componente padre
    onFilterChange(newFilters);
  };

  const handleCategoryClick = (category) => {
    const newCategory = selectedCategory === category ? '' : category;
    setSelectedCategory(newCategory);
    handleFilterChange('category', newCategory);
  };

  const handleClearFilters = () => {
    setFilters({});
    setSelectedCategory('');
    onFilterChange({});
  };

  return (
    <Box sx={{ mb: 4, width: '100%' }}>
      <Accordion 
        expanded={expanded} 
        onChange={() => setExpanded(!expanded)}
        sx={{
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          color: 'white',
          borderRadius: 2,
          '&:before': {
            display: 'none',
          }
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}
          sx={{ 
            borderRadius: 2,
            '&.Mui-expanded': {
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0,
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <FilterListIcon sx={{ mr: 1 }} />
            <Typography>Filtri e Categorie</Typography>
            
            {Object.keys(filters).length > 0 && (
              <Chip 
                label={`${Object.keys(filters).length} attivi`}
                size="small"
                sx={{ ml: 2, backgroundColor: 'primary.main', color: 'white' }}
              />
            )}
          </Box>
        </AccordionSummary>
        
        <AccordionDetails sx={{ p: 2 }}>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <CircularProgress size={30} sx={{ color: 'white' }} />
            </Box>
          ) : (
            <>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                Categorie Popolari
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                {categoriesList.map((category) => (
                  <Chip
                    key={category.name}
                    label={category.name}
                    clickable
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
              
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, 
                gap: 2,
                mb: 3
              }}>
                <FormControl fullWidth sx={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: 1,
                }}>
                  <InputLabel id="language-select-label" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    Lingua
                  </InputLabel>
                  <Select
                    labelId="language-select-label"
                    value={filters.language || ''}
                    onChange={(e) => handleFilterChange('language', e.target.value)}
                    label="Lingua"
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

                <FormControl fullWidth sx={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: 1,
                }}>
                  <InputLabel id="country-select-label" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    Paese
                  </InputLabel>
                  <Select
                    labelId="country-select-label"
                    value={filters.country || ''}
                    onChange={(e) => handleFilterChange('country', e.target.value)}
                    label="Paese"
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
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button 
                  variant="contained" 
                  onClick={handleClearFilters}
                  sx={{ mr: 2 }}
                  color="secondary"
                >
                  Pulisci Filtri
                </Button>
                
                <Button 
                  variant="contained" 
                  onClick={() => setExpanded(false)}
                  color="primary"
                >
                  Applica
                </Button>
              </Box>
            </>
          )}
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default RadioFilters; 