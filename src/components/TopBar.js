import React, { useState, useEffect } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton,
  Box
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate, useLocation } from 'react-router-dom';
import MiniPlayer from './MiniPlayer';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { useAuth } from '../contexts/AuthContext';

const TopBar = ({ title, showBack = true, onMenuClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const isDashboard = location.pathname === '/' || location.pathname === '/dashboard';
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleBack = () => {
    navigate(-1);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Errore durante il logout:', error);
    }
  };

  return (
    <AppBar position="static" color="primary" elevation={0}>
      <Toolbar>
        {showBack && (
          <IconButton
            edge="start"
            color="inherit"
            aria-label="back"
            onClick={isDashboard ? handleLogout : handleBack}
            sx={{ mr: 2 }}
          >
            {isDashboard ? <LogoutIcon /> : <ArrowBackIcon />}
          </IconButton>
        )}
        
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {title}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="body2" sx={{ mr: 2 }}>
            {format(currentDate, 'HH:mm', { locale: it })}
          </Typography>
        </Box>
      </Toolbar>
      <MiniPlayer />
    </AppBar>
  );
};

export default TopBar; 