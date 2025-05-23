import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Layout from './components/Layout';
import Radio from './pages/Radio';

// Componenti originali
import MiniPlayer from './components/MiniPlayer';
import UpdateNotification from './components/UpdateNotification';

// Componenti delle pagine
import Dashboard from './pages/Dashboard';
import Cliente from './pages/Cliente';
import Magazzino from './pages/Magazzino';
import Personale from './pages/Personale';

// Context Provider
import { RadioProvider } from './contexts/RadioContext';

// Tema personalizzato ottimizzato per mobile e desktop
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
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
  components: {
    MuiContainer: {
      styleOverrides: {
        root: {
          paddingLeft: '16px',
          paddingRight: '16px',
          '@media (max-width: 600px)': {
            paddingLeft: '8px',
            paddingRight: '8px',
          },
        },
      },
    },
  },
});

function App() {
  const [appReady, setAppReady] = useState(false);
  const [appError, setAppError] = useState(null);

  // Gestione degli errori globali e inizializzazione
  useEffect(() => {
    window.addEventListener('error', (event) => {
      console.error('Errore globale:', event.error);
      setAppError('Si è verificato un errore imprevisto: ' + (event.error?.message || 'Errore sconosciuto'));
    });

    // Inizializzazione più rapida per web
    console.log('App component mounted');
    
    const timer = setTimeout(() => {
      console.log('App ready');
      setAppReady(true);
    }, 500); // Ridotto da 1000ms a 500ms
    
    return () => {
      clearTimeout(timer);
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
          <Typography variant="h3" gutterBottom sx={{
            fontSize: { xs: '1.5rem', sm: '2rem', md: '3rem' }
          }}>
            Eddy Style
          </Typography>
          <CircularProgress color="primary" size={60} />
          <Typography variant="body1" sx={{ 
            mt: 2,
            fontSize: { xs: '0.875rem', sm: '1rem' }
          }}>
            Caricamento dell'applicazione...
          </Typography>
        </Box>
      </ThemeProvider>
    );
  }

  // Contenuto completo dell'app
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
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
              
              <MiniPlayer />
              
              <Box sx={{ flex: 1, overflow: 'auto' }}>
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route
                    path="/"
                    element={
                      <PrivateRoute>
                        <Layout />
                      </PrivateRoute>
                    }
                  >
                    <Route index element={<Dashboard />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="radio" element={<Radio />} />
                  </Route>
                  <Route
                    path="/clienti"
                    element={
                      <PrivateRoute>
                        <Cliente />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/magazzino"
                    element={
                      <PrivateRoute>
                        <Magazzino />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/personale"
                    element={
                      <PrivateRoute>
                        <Personale />
                      </PrivateRoute>
                    }
                  />
                </Routes>
              </Box>
              
              <UpdateNotification />
            </Box>
          </Router>
        </RadioProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App; 