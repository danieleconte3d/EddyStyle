import React, { useState, useRef, useEffect, useMemo, Profiler, useCallback } from 'react';
import { Box, IconButton, Typography, useTheme, Snackbar, Alert, TextField, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { useNavigate } from 'react-router-dom';
import { radios } from '../config/radios';
import RadioItem from './RadioItem';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/free-mode';
import RadioBrowserAPI from '../utils/radioAPI';
import RadioStorage from '../utils/radioStorage';
import RadioSideMenu from './RadioSideMenu';
import { useRadio } from '../contexts/RadioContext';

const CarouselContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  height: '800px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  overflow: 'hidden'
}));

const ScrollingText = styled(Typography)(({ theme, isScrolling }) => ({
  width: '100%',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  textAlign: 'center',
  animation: isScrolling ? 'scrollText 10s linear infinite' : 'none',
  '@keyframes scrollText': {
    '0%': {
      transform: 'translateX(0)',
    },
    '100%': {
      transform: 'translateX(-100%)',
    },
  },
  position: 'relative',
  zIndex: 2,
  textShadow: '0 2px 4px rgba(0,0,0,0.5)'
}));

// Utility per il profiling
const onRenderCallback = (
  id, // l'id del componente profilato
  phase, // "mount" o "update"
  actualDuration, // tempo speso nel rendering
  baseDuration, // tempo stimato senza memoization
  startTime, // quando il rendering è iniziato
  commitTime, // quando React ha committato l'update
  interactions // Set di interazioni tracciate per il render
) => {
  console.log(`[Profiler] ${id}:`, {
    phase,
    actualDuration: Math.round(actualDuration * 100) / 100,
    baseDuration: Math.round(baseDuration * 100) / 100,
    startTime: Math.round(startTime * 100) / 100,
    commitTime: Math.round(commitTime * 100) / 100
  });
};

function RadioCarousel({ onRadioChange }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [failedImages, setFailedImages] = useState({});
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({});
  const [currentView, setCurrentView] = useState('popular'); // 'popular', 'search', 'favorites', 'history'
  const [scrollingTexts, setScrollingTexts] = useState({});
  const swiperRef = useRef(null);
  const [popularRadios, setPopularRadios] = useState([]);
  const [isScrolling, setIsScrolling] = useState(false);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 10 });
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadingBatchSize = 10;
  const renderCount = useRef(0);
  const lastRenderTime = useRef(window.performance.now());
  const frameRef = useRef(0);
  const lastFrameTime = useRef(window.performance.now());
  const performanceData = useRef({
    frames: [],
    scrollEvents: 0,
    loadEvents: 0
  });
  
  const { currentRadio, isPlaying, playRadio, toggleFavorite, togglePlay } = useRadio();
  const theme = useTheme();
  const navigate = useNavigate();

  // Carica le radio popolari all'avvio con paginazione
  useEffect(() => {
    const loadInitialRadios = async () => {
      try {
        setIsLoading(true);
        // Carica prima le radio preferite
        const favorites = RadioStorage.getFavorites();
        // Poi carica le radio recenti, escludendo quelle già nei preferiti
        const history = RadioStorage.getHistory().filter(radio => 
          !favorites.some(fav => fav.id === radio.id)
        );
        // Infine carica le radio popolari, escludendo quelle già nei preferiti o recenti
        const popularData = await RadioBrowserAPI.getPopularRadios(30);
        const formattedPopularRadios = formatRadioData(popularData).filter(radio => 
          !favorites.some(fav => fav.id === radio.id) && 
          !history.some(hist => hist.id === radio.id)
        );
        
        // Combina le radio in ordine: preferite, recenti, popolari
        const combinedRadios = [...favorites, ...history, ...formattedPopularRadios];
        setPopularRadios(combinedRadios);
        setSearchResults([]);
      } catch (error) {
        console.error('Errore nel caricamento delle radio:', error);
        setError('Errore nel caricamento delle radio. Riprova più tardi.');
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialRadios();
  }, []);
  
  // Formatta i dati delle radio in un formato coerente
  const formatRadioData = (radioData) => {
    return radioData
      .filter(radio => radio.url_resolved)
      .map(radio => ({
        id: radio.stationuuid,
        name: radio.name,
        stream: radio.url_resolved,
        cover: radio.favicon || 'https://www.radioparadise.com/graphics/logos/rp_250.png',
        color: `#${Math.floor(Math.random()*16777215).toString(16)}`
      }));
  };

  const searchRadios = async (query) => {
    if (!query) return;
    
    setIsLoading(true);
    setCurrentView('search');
    try {
      const data = await RadioBrowserAPI.searchRadios(query, 20);
      const formattedRadios = formatRadioData(data);
      setSearchResults(formattedRadios);
    } catch (error) {
      console.error('Errore nella ricerca:', error);
      setError('Errore nella ricerca delle radio. Riprova più tardi.');
    } finally {
      setIsLoading(false);
    }
  };

  // Gestisce i filtri
  const handleFilterChange = async (newFilters) => {
    setFilters(newFilters);
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
  };

  const handleCloseError = () => {
    setError(null);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    searchRadios(searchQuery);
  };

  const handleRadioClick = (radio) => {
    if (isScrolling) return; // Ignora il click se c'è stato uno scroll
    
    if (currentRadio?.id === radio.id) {
      togglePlay();
    } else {
      playRadio(radio);
    }
  };

  const handleTextOverflow = (radioId, text) => {
    const textElement = document.getElementById(`radio-text-${radioId}`);
    if (textElement) {
      const isOverflowing = textElement.scrollWidth > textElement.clientWidth;
      if (isOverflowing) {
        setScrollingTexts(prev => ({ ...prev, [radioId]: true }));
      }
    }
  };

  const handleToggleFavorite = (e, radio) => {
    if (isScrolling) return; // Ignora il click se c'è stato uno scroll
    
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(radio);
    setCurrentIndex(prev => prev);
  };

  const handleSelectFromHistory = (radio) => {
    playRadio(radio);
  };

  // Ottiene il conteggio dei preferiti e della cronologia
  const getFavoritesCount = () => {
    return RadioStorage.getFavorites().length;
  };

  const getHistoryCount = () => {
    return RadioStorage.getHistory().length;
  };

  // Determina quali radio mostrare in base alla vista corrente
  const getDisplayRadios = () => {
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
  };

  // Ottimizzazione del rendering con useMemo per le radio
  const displayRadios = useMemo(() => {
    return getDisplayRadios();
  }, [currentView, popularRadios, searchResults, searchQuery]);

  // Funzione per caricare più radio
  const loadMoreRadios = async () => {
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
      }
    } catch (error) {
      console.error('Errore nel caricamento di altre radio:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Ottimizzazione scroll handler con throttling
  const handleScroll = useMemo(() => {
    let lastCall = 0;
    const throttleInterval = 16; // circa 60fps
    let scrollTimeout;

    return (swiper) => {
      const now = window.performance.now();
      
      if (now - lastCall >= throttleInterval) {
        performanceData.current.scrollEvents++;
        setIsScrolling(true);
        setCurrentIndex(swiper.activeIndex);

        // Carica più radio solo quando siamo vicini alla fine e non stiamo già caricando
        if (!isLoadingMore && swiper.activeIndex + 5 >= displayRadios.length) {
          performanceData.current.loadEvents++;
          loadMoreRadios();
        }

        lastCall = now;
      }

      // Debounce dello stato di scroll con timeout più lungo
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        setIsScrolling(false);
      }, 300);
    };
  }, [displayRadios.length, isLoadingMore, loadMoreRadios]);

  // Ottimizzazione del rendering dei singoli elementi del carosello
  const renderRadioSlide = useCallback((radio) => (
    <SwiperSlide
      key={radio.id}
      style={{
        width: '300px',
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
        />
        <IconButton
          onClick={(e) => handleToggleFavorite(e, radio)}
          sx={{
            position: 'absolute',
            bottom: 380,
            left: 300,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: '12px',
            zIndex: 10,
            cursor: isScrolling ? 'grabbing' : 'pointer',
            '&:hover': { 
              backgroundColor: isScrolling ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.5)',
              transform: isScrolling ? 'none' : 'scale(1.1)'
            },
            transition: isScrolling ? 'none' : 'all 0.2s ease'
          }}
        >
          {RadioStorage.isFavorite(radio.id) ? (
            <FavoriteIcon sx={{ 
              color: '#ff6b6b',
              fontSize: '28px',
              transition: isScrolling ? 'none' : 'transform 0.2s ease',
              '&:hover': {
                transform: isScrolling ? 'none' : 'scale(1.1)'
              }
            }} />
          ) : (
            <FavoriteBorderIcon sx={{ 
              color: 'white',
              fontSize: '28px',
              transition: isScrolling ? 'none' : 'transform 0.2s ease',
              '&:hover': {
                transform: isScrolling ? 'none' : 'scale(1.1)'
              }
            }} />
          )}
        </IconButton>
      </Box>
    </SwiperSlide>
  ), [currentRadio, isPlaying, isScrolling, handleRadioClick, handleTextOverflow, handleToggleFavorite]);

  // Performance monitoring
  useEffect(() => {
    renderCount.current++;
    const currentTime = window.performance.now();
    const timeSinceLastRender = currentTime - lastRenderTime.current;
    
    console.log(`[Performance] Render #${renderCount.current}:`, {
      timeSinceLastRender: Math.round(timeSinceLastRender * 100) / 100 + 'ms',
      displayRadiosLength: displayRadios.length
    });
    
    lastRenderTime.current = currentTime;
  });

  // Monitor delle performance
  useEffect(() => {
    const logPerformance = () => {
      const currentTime = window.performance.now();
      const frameDelta = currentTime - lastFrameTime.current;
      
      performanceData.current.frames.push(frameDelta);
      if (performanceData.current.frames.length > 60) {
        performanceData.current.frames.shift();
      }

      const avgFrameTime = performanceData.current.frames.reduce((a, b) => a + b, 0) / performanceData.current.frames.length;
      const fps = 1000 / avgFrameTime;

      if (frameRef.current % 60 === 0) { // Log ogni 60 frame per non intasare la console
        console.log(`[Performance] Stats:`, {
          fps: Math.round(fps),
          frameTime: Math.round(frameDelta * 100) / 100 + 'ms',
          scrollEvents: performanceData.current.scrollEvents,
          loadEvents: performanceData.current.loadEvents
        });
      }

      lastFrameTime.current = currentTime;
      frameRef.current = window.requestAnimationFrame(logPerformance);
    };

    frameRef.current = window.requestAnimationFrame(logPerformance);

    return () => {
      window.cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return (
    <Profiler id="RadioCarousel" onRender={onRenderCallback}>
      <CarouselContainer>
        {/* Menu laterale */}
        <RadioSideMenu 
          onFilterChange={handleFilterChange}
          onRadioSelect={handleSelectFromHistory}
          favoritesCount={getFavoritesCount()}
          historyCount={getHistoryCount()}
        />
        
        {/* Campo di ricerca */}
        <Box sx={{ 
          width: '80%',
          maxWidth: 600,
          mb: 4,
          mt: 4
        }}>
          <form onSubmit={handleSearch}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Cerca una radio..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
            modules={[FreeMode]}
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
              setIsScrolling(true);
              performanceData.current.scrollEvents = 0;
            }}
            onTouchEnd={() => {
              setTimeout(() => {
                setIsScrolling(false);
              }, 300);
            }}
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
    </Profiler>
  );
}

// Ottimizzazione con memo
export default React.memo(RadioCarousel, (prevProps, nextProps) => {
  return prevProps.onRadioChange === nextProps.onRadioChange;
}); 