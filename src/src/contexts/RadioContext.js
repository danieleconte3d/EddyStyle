import React, { createContext, useState, useContext, useRef, useEffect } from 'react';
import RadioBrowserAPI from '../utils/radioAPI';
import RadioStorage from '../utils/radioStorage';

const RadioContext = createContext();

export const RadioProvider = ({ children }) => {
  const [currentRadio, setCurrentRadio] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState(null);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [historyCount, setHistoryCount] = useState(0);
  const audioRef = useRef(new Audio());

  // Carica i contatori all'avvio e quando cambiano i dati
  useEffect(() => {
    updateCounts();
  }, []);

  const updateCounts = () => {
    setFavoritesCount(RadioStorage.getFavorites().length);
    setHistoryCount(RadioStorage.getHistory().length);
  };

  useEffect(() => {
    if (currentRadio && isPlaying) {
      audioRef.current.src = currentRadio.stream;
      audioRef.current.play()
        .then(() => {
          setError(null);
          
          // Traccia il clic sulla radio
          if (currentRadio.id) {
            RadioBrowserAPI.trackClick(currentRadio.id)
              .catch(err => console.warn('Errore nel tracciamento del click:', err));
            
            // Aggiunge la radio alla cronologia e aggiorna i contatori
            RadioStorage.addToHistory(currentRadio);
            updateCounts();
          }
        })
        .catch(error => {
          console.error('Errore nella riproduzione:', error);
          setError(`Impossibile riprodurre ${currentRadio.name}. Prova un'altra radio.`);
          setIsPlaying(false);
        });
    } else {
      audioRef.current.pause();
    }

    return () => {
      // Non fermiamo l'audio quando il componente viene smontato
      // audioRef.current.pause();
      // audioRef.current.src = '';
    };
  }, [currentRadio, isPlaying]);

  const playRadio = (radio) => {
    if (currentRadio?.id === radio.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentRadio(radio);
      setIsPlaying(true);
    }
  };

  const stopRadio = () => {
    setIsPlaying(false);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleFavorite = (radio) => {
    try {
      const isFavorite = RadioStorage.isFavorite(radio.id);
      if (isFavorite) {
        RadioStorage.removeFavorite(radio.id);
      } else {
        RadioStorage.addFavorite(radio);
      }
      updateCounts();
      return !isFavorite;
    } catch (error) {
      console.error('Errore nella gestione dei preferiti:', error);
      return false;
    }
  };

  return (
    <RadioContext.Provider value={{
      currentRadio,
      isPlaying,
      error,
      favoritesCount,
      historyCount,
      playRadio,
      stopRadio,
      togglePlay,
      toggleFavorite,
      updateCounts
    }}>
      {children}
    </RadioContext.Provider>
  );
};

export const useRadio = () => {
  const context = useContext(RadioContext);
  if (!context) {
    throw new Error('useRadio deve essere usato all\'interno di un RadioProvider');
  }
  return context;
}; 