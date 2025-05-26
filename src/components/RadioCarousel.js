import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Box, Snackbar, Alert, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import { radios } from '../config/radios';
import RadioItem from './RadioItem';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode, Virtual } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/free-mode';
import RadioBrowserAPI from '../utils/radioAPI';
import RadioStorage from '../utils/radioStorage';
import RadioSideMenu from './RadioSideMenu';
import { useRadio } from '../contexts/RadioContext';

const CarouselContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  height: '500px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  overflow: 'hidden'
}));

function RadioCarousel({ onRadioChange, searchQuery, onSearchComplete }) {
  const [error, setError] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentView, setCurrentView] = useState('popular');
  const swiperRef = useRef(null);
  const [popularRadios, setPopularRadios] = useState([]);
  const [isScrolling, setIsScrolling] = useState(false);
  const isScrollingRef = useRef(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadingBatchSize = 10;
  
  const { currentRadio, isPlaying, playRadio, toggleFavorite, togglePlay } = useRadio();

  // Formatta i dati delle radio in un formato coerente
  const formatRadioData = useCallback((radioData) => {
    return radioData
      .filter(radio => radio.url_resolved)
      .map(radio => ({
        id: radio.stationuuid,
        name: radio.name,
        stream: radio.url_resolved,
        cover: radio.favicon || 'https://www.radioparadise.com/graphics/logos/rp_250.png',
        color: `#${Math.floor(Math.random()*16777215).toString(16)}`
      }));
  }, []);

  const searchRadios = useCallback(async (query) => {
    if (!query) return;
    
    console.log('🔍 Iniziando ricerca per:', query);
    setIsLoading(true);
    setCurrentView('search');
    try {
      const data = await RadioBrowserAPI.searchRadios(query, 20);
      console.log('📻 Risultati ricerca:', data.length);
      const formattedRadios = formatRadioData(data);
      setSearchResults(formattedRadios);
    } catch (error) {
      console.error('❌ Errore nella ricerca:', error);
      setError('Errore nella ricerca delle radio. Riprova più tardi.');
    } finally {
      setIsLoading(false);
      onSearchComplete?.();
    }
  }, [formatRadioData, onSearchComplete]);

  // Gestisce i filtri
  const handleFilterChange = useCallback(async (newFilters) => {
    if (Object.keys(newFilters).length > 0) {
      setIsLoading(true);
      try {
        const data = await RadioBrowserAPI.advancedSearch(newFilters, 30);
        const formattedRadios = formatRadioData(data);
        setSearchResults(formattedRadios);
        setCurrentView('search');
      } catch (error) {
        console.error('Errore nella ricerca con filtri:', error);
        setError('Errore nella ricerca delle radio. Riprova più tardi.');
      } finally {
        setIsLoading(false);
      }
    }
  }, [formatRadioData]);

  const handleCloseError = useCallback(() => {
    setError(null);
  }, []);

  // Aggiungo l'effetto per ascoltare i cambiamenti di searchQuery
  useEffect(() => {
    console.log('🔄 searchQuery cambiato:', searchQuery);
    if (searchQuery) {
      searchRadios(searchQuery);
    } else {
      setSearchResults([]);
      setCurrentView('popular');
    }
  }, [searchQuery, searchRadios]);

  const handleRadioClick = useCallback((radio) => {
    if (isScrolling) return;
    
    if (currentRadio?.id === radio.id) {
      togglePlay();
    } else {
      playRadio(radio);
    }
  }, [currentRadio, isScrolling, playRadio, togglePlay]);

  const handleTextOverflow = useCallback((radioId, text) => {
    const textElement = document.getElementById(`radio-text-${radioId}`);
    if (textElement) {
      const isOverflowing = textElement.scrollWidth > textElement.clientWidth;
      if (isOverflowing) {
        // Gestiamo l'overflow del testo se necessario
      }
    }
  }, []);

  const handleToggleFavorite = useCallback((radio) => {
    if (isScrolling) return;
    toggleFavorite(radio);
  }, [isScrolling, toggleFavorite]);

  const handleSelectFromHistory = useCallback((radio) => {
    playRadio(radio);
  }, [playRadio]);

  const getFavoritesCount = useCallback(() => {
    return RadioStorage.getFavorites().length;
  }, []);

  const getHistoryCount = useCallback(() => {
    return RadioStorage.getHistory().length;
  }, []);

  const getDisplayRadios = useCallback(() => {
    switch (currentView) {
      case 'search':
        return searchResults;
      case 'favorites':
        return RadioStorage.getFavorites();
      case 'history':
        return RadioStorage.getHistory();
      case 'popular':
      default:
        return popularRadios.length > 0 ? popularRadios : radios;
    }
  }, [currentView, popularRadios, searchResults]);

  const displayRadios = useMemo(() => {
    return getDisplayRadios();
  }, [getDisplayRadios]);

  const loadMoreRadios = useCallback(async () => {
    if (isLoadingMore) return;

    try {
      setIsLoadingMore(true);
      let newData;
      const currentRadios = getDisplayRadios();
      
      switch (currentView) {
        case 'popular':
          newData = await RadioBrowserAPI.getPopularRadios(loadingBatchSize, currentRadios.length);
          setPopularRadios(prev => [...prev, ...formatRadioData(newData)]);
          break;
        case 'search':
          if (searchQuery) {
            newData = await RadioBrowserAPI.searchRadios(searchQuery, loadingBatchSize, currentRadios.length);
            setSearchResults(prev => [...prev, ...formatRadioData(newData)]);
          }
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Errore nel caricamento di altre radio:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [currentView, formatRadioData, getDisplayRadios, isLoadingMore, loadingBatchSize, searchQuery]);

  const handleScroll = useCallback((swiper) => {
    if (!isScrollingRef.current) {
      isScrollingRef.current = true;
      setIsScrolling(true);
    }

    if (!isLoadingMore && swiper.activeIndex + 5 >= displayRadios.length) {
      loadMoreRadios();
    }

    setTimeout(() => {
      isScrollingRef.current = false;
      setIsScrolling(false);
    }, 300);
  }, [displayRadios.length, isLoadingMore, loadMoreRadios]);

  const renderRadioSlide = useCallback((radio) => (
    <SwiperSlide
      key={radio.id}
      style={{
        width: '250px',
        height: 'auto',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: isScrolling ? 'grabbing' : 'pointer',
        transform: 'translate3d(0,0,0)',
        backfaceVisibility: 'hidden',
        perspective: 1000,
        WebkitFontSmoothing: 'antialiased',
        WebkitTransform: 'translate3d(0,0,0)',
        willChange: 'transform',
        transformStyle: 'preserve-3d',
        transition: isScrolling ? 'none' : 'all 0.2s ease',
        '&:hover': {
          transform: isScrolling ? 'none' : 'scale(1.05)'
        }
      }}
    >
      <Box 
        sx={{ 
          position: 'relative',
          userSelect: 'none',
          transform: 'translate3d(0,0,0)',
          backfaceVisibility: 'hidden',
          perspective: 1000,
          WebkitFontSmoothing: 'antialiased',
          WebkitTransform: 'translate3d(0,0,0)',
          willChange: 'transform',
          transformStyle: 'preserve-3d',
          transition: isScrolling ? 'none' : 'all 0.2s ease',
          '&:hover': {
            transform: isScrolling ? 'none' : 'scale(1.05)'
          }
        }}
      >
        <RadioItem
          radio={radio}
          isPlaying={currentRadio?.id === radio.id && isPlaying}
          onRadioClick={handleRadioClick}
          onTextOverflow={handleTextOverflow}
          isScrolling={isScrolling}
          onToggleFavorite={handleToggleFavorite}
        />
      </Box>
    </SwiperSlide>
  ), [currentRadio, isPlaying, isScrolling, handleRadioClick, handleTextOverflow, handleToggleFavorite]);

  return (
    <CarouselContainer>
      <RadioSideMenu 
        onFilterChange={handleFilterChange}
        onRadioSelect={handleSelectFromHistory}
        favoritesCount={getFavoritesCount()}
        historyCount={getHistoryCount()}
      />
      
      {isLoading && displayRadios.length === 0 && (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          width: '100%',
          height: '100%'
        }}>
          <CircularProgress size={60} sx={{ color: 'white' }} />
        </Box>
      )}

      <Box sx={{ width: '100%', flex: 1 }}>
        <Swiper
          ref={swiperRef}
          modules={[FreeMode, Virtual]}
          freeMode={{
            enabled: true,
            momentum: true,
            momentumRatio: 0.3,
            momentumVelocityRatio: 0.3,
            momentumBounce: false,
            momentumBounceRatio: 1
          }}
          spaceBetween={20}
          slidesPerView="auto"
          centeredSlides={true}
          onSlideChange={handleScroll}
          onTouchStart={() => {
            isScrollingRef.current = true;
            setIsScrolling(true);
          }}
          onTouchEnd={() => {
            setTimeout(() => {
              isScrollingRef.current = false;
              setIsScrolling(false);
            }, 300);
          }}
          preloadImages={false}
          style={{
            width: '100%',
            height: '100%',
            padding: '0 20px',
            willChange: 'transform',
            transformStyle: 'preserve-3d'
          }}
        >
          {displayRadios.map(renderRadioSlide)}
        </Swiper>
      </Box>

      {isLoadingMore && (
        <Box sx={{ 
          position: 'absolute',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000
        }}>
          <CircularProgress size={30} sx={{ color: 'white' }} />
        </Box>
      )}

      <Snackbar 
        open={!!error} 
        autoHideDuration={2000} 
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseError} 
          severity={error?.severity || 'error'} 
          sx={{ width: '100%' }}
        >
          {error?.message || error}
        </Alert>
      </Snackbar>
    </CarouselContainer>
  );
}

export default React.memo(RadioCarousel); 