import { configureStore } from '@reduxjs/toolkit';

// Creiamo uno slice per ogni funzionalità principale
const clientiSlice = {
  name: 'clienti',
  initialState: {
    lista: [],
    loading: false,
    error: null
  }
};

const magazzinoSlice = {
  name: 'magazzino',
  initialState: {
    prodotti: [],
    loading: false,
    error: null
  }
};

const appuntamentiSlice = {
  name: 'appuntamenti',
  initialState: {
    lista: [],
    loading: false,
    error: null
  }
};

const radioSlice = {
  name: 'radio',
  initialState: {
    isPlaying: false,
    currentStation: null,
    volume: 0.5
  }
};

export const store = configureStore({
  reducer: {
    clienti: (state = clientiSlice.initialState) => state,
    magazzino: (state = magazzinoSlice.initialState) => state,
    appuntamenti: (state = appuntamentiSlice.initialState) => state,
    radio: (state = radioSlice.initialState) => state
  }
}); 