import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

// Componenti originali
import MiniPlayer from './components/MiniPlayer';
import UpdateNotification from './components/UpdateNotification';

// Componenti delle pagine
import Dashboard from './pages/Dashboard';
import Cliente from './pages/Cliente';
import Magazzino from './pages/Magazzino';
import Radio from './pages/Radio';
import Personale from './pages/Personale';

// Context Provider
import { RadioProvider } from './contexts/RadioContext';

// Tema personalizzato
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#f50057',
    },
    secondary: {
      main: '#00e5ff',
    },
  },
});

// Componente placeholder per le pagine
const PlaceholderPage = ({ name }) => (
  <Box sx={{ p: 4, textAlign: 'center' }}>
    <Typography variant="h4">Pagina {name}</Typography>
    <Typography variant="body1" sx={{ mt: 2 }}>
      Questo è un placeholder per la pagina {name}.
    </Typography>
  </Box>
);

function App() {
  const [appReady, setAppReady] = useState(false);
  const [appError, setAppError] = useState(null);
  const [renderStage, setRenderStage] = useState('initial');

  // Gestione degli errori globali e inizializzazione
  useEffect(() => {
    window.addEventListener('error', (event) => {
      console.error('Errore globale:', event.error);
      setAppError('Si è verificato un errore imprevisto: ' + (event.error?.message || 'Errore sconosciuto'));
    });

    // Test di rendering progressivo
    console.log('App component mounted');
    
    const timer1 = setTimeout(() => {
      console.log('Stage 1: App ready');
      setAppReady(true);
    }, 1000);
    
    const timer2 = setTimeout(() => {
      console.log('Stage 2: Basic render');
      setRenderStage('basic');
    }, 2000);
    
    const timer3 = setTimeout(() => {
      console.log('Stage 3: Router initialized');
      setRenderStage('router');
    }, 3000);
    
    const timer4 = setTimeout(() => {
      console.log('Stage 4: RadioProvider and MiniPlayer added');
      setRenderStage('radio-components');
    }, 4000);
    
    const timer5 = setTimeout(() => {
      console.log('Stage 5: All components added');
      setRenderStage('complete');
    }, 5000);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
    };
  }, []);

  // Renderizza una schermata di caricamento se l'app non è pronta
  if (!appReady) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100vh',
            bgcolor: 'background.default',
            color: 'text.primary'
          }}
        >
          <Typography variant="h3" gutterBottom>
            Eddy Style
          </Typography>
          <CircularProgress color="primary" size={60} />
          <Typography variant="body1" sx={{ mt: 2 }}>
            Caricamento dell'applicazione (Fase 1)...
          </Typography>
        </Box>
      </ThemeProvider>
    );
  }

  // Contenuto completo dell'app
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RadioProvider>
        <Router>
          <Box sx={{ 
            display: 'flex', 
            height: '100vh', 
            flexDirection: 'column'
          }}>
            {appError && (
              <Box sx={{ 
                bgcolor: 'error.main', 
                color: 'error.contrastText', 
                p: 1, 
                textAlign: 'center' 
              }}>
                <Typography>{appError}</Typography>
              </Box>
            )}
            
            {renderStage !== 'complete' && (
              <Box sx={{ 
                p: 1, 
                bgcolor: 'primary.main', 
                display: 'flex', 
                justifyContent: 'center'
              }}>
                <Typography variant="body2">Fase di caricamento: {renderStage}</Typography>
              </Box>
            )}
            
            <MiniPlayer />
            
            <Box sx={{ flex: 1, overflow: 'auto' }}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/clienti" element={<Cliente />} />
                <Route path="/magazzino" element={<Magazzino />} />
                <Route path="/radio" element={<Radio />} />
                <Route path="/personale" element={<Personale />} />
              </Routes>
            </Box>
            
            <UpdateNotification />
          </Box>
        </Router>
      </RadioProvider>
    </ThemeProvider>
  );
}

export default App; 