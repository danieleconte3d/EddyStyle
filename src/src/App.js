import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';

// Componenti delle pagine
import Dashboard from './pages/Dashboard';
import Cliente from './pages/Cliente';
import Magazzino from './pages/Magazzino';
import Radio from './pages/Radio';
import MiniPlayer from './components/MiniPlayer';
import UpdateNotification from './components/UpdateNotification';

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

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RadioProvider>
        <Router>
          <Box sx={{ display: 'flex', height: '100vh', flexDirection: 'column' }}>
            <MiniPlayer />
            <Box sx={{ flex: 1 }}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/clienti" element={<Cliente />} />
                <Route path="/magazzino" element={<Magazzino />} />
                <Route path="/radio" element={<Radio />} />
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