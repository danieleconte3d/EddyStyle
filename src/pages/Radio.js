import React, { useState } from 'react';
import { Box, Container } from '@mui/material';
import TopBar from '../components/TopBar';
import RadioCarousel from '../components/RadioCarousel';
import NowPlayingBar from '../components/NowPlayingBar';
import RadioSearchBar from '../components/RadioSearchBar';
import { useRadio } from '../contexts/RadioContext';

function Radio() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const { currentRadio, isPlaying, togglePlay } = useRadio();

  const handleSearchSubmit = (query) => {
    console.log('🎯 Radio: handleSearchSubmit chiamato con:', query);
    setIsSearching(true);
    setSearchQuery(query);
  };

  const handleSearchChange = (value) => {
    console.log('🎯 Radio: handleSearchChange chiamato con:', value);
    setSearchQuery(value);
  };

  return (
    <Container maxWidth={false} disableGutters sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <TopBar title="Radio" showBack={true} />
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        gap: 2,
        py: 2
      }}>
        {currentRadio && (
          <NowPlayingBar 
            radio={currentRadio} 
            isPlaying={isPlaying} 
            onTogglePlay={togglePlay} 
          />
        )}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          width: '100%'
        }}>
          <RadioSearchBar 
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            onSearchSubmit={handleSearchSubmit}
            isLoading={isSearching}
          />
        </Box>
      </Box>
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <RadioCarousel 
          searchQuery={searchQuery} 
          onSearchComplete={() => setIsSearching(false)}
        />
      </Box>
    </Container>
  );
}

export default Radio; 