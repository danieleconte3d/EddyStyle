import React, { useState } from 'react';
import { 
  Box, 
  Drawer, 
  IconButton,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import FavoriteIcon from '@mui/icons-material/Favorite';
import HistoryIcon from '@mui/icons-material/History';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import RadioFiltersContent from './RadioFiltersContent';
import RadioFavoritesContent from './RadioFavoritesContent';
import RadioHistoryContent from './RadioHistoryContent';
import { useRadio } from '../contexts/RadioContext';

const DRAWER_WIDTH = '25%';
const MIN_DRAWER_WIDTH = 280;
const MAX_DRAWER_WIDTH = 400;

const menuItems = [
  { id: 'filters', label: 'Filtri e Categorie', icon: <FilterListIcon />, color: '#9c27b0' },
  { id: 'favorites', label: 'Le Mie Preferite', icon: <FavoriteIcon />, color: '#ff6b6b' },
  { id: 'history', label: 'Ascoltate di Recente', icon: <HistoryIcon />, color: '#64b5f6' }
];

const RadioSideMenu = ({ 
  onFilterChange, 
  onRadioSelect
}) => {
  const [open, setOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState('');
  const { favoritesCount, historyCount } = useRadio();

  const handleToggleMenu = (menuId) => {
    if (activeMenu === menuId) {
      setOpen(false);
      setActiveMenu('');
    } else {
      setActiveMenu(menuId);
      setOpen(true);
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  const renderContent = () => {
    switch (activeMenu) {
      case 'filters':
        return <RadioFiltersContent onFilterChange={onFilterChange} onClose={handleClose} />;
      case 'favorites':
        return <RadioFavoritesContent onRadioSelect={onRadioSelect} onClose={handleClose} />;
      case 'history':
        return <RadioHistoryContent onRadioSelect={onRadioSelect} onClose={handleClose} />;
      default:
        return null;
    }
  };

  // Ottiene il conteggio degli elementi per ogni menu
  const getCount = (menuId) => {
    switch (menuId) {
      case 'favorites':
        return favoritesCount;
      case 'history':
        return historyCount;
      default:
        return 0;
    }
  };

  return (
    <>
      {/* Pulsanti laterali */}
      <Box sx={{
        position: 'fixed',
        left: 0,
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 1200,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        borderTopRightRadius: 8,
        borderBottomRightRadius: 8,
        padding: 0.5,
      }}>
        {menuItems.map((item) => (
          <IconButton
            key={item.id}
            onClick={() => handleToggleMenu(item.id)}
            sx={{
              color: activeMenu === item.id ? item.color : 'white',
              backgroundColor: activeMenu === item.id ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
              position: 'relative',
            }}
          >
            {item.icon}
            {getCount(item.id) > 0 && (
              <Box
                sx={{
                  position: 'absolute',
                  top: -2,
                  right: -2,
                  backgroundColor: item.color,
                  color: 'white',
                  borderRadius: '50%',
                  width: 18,
                  height: 18,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.7rem',
                  fontWeight: 'bold',
                }}
              >
                {getCount(item.id)}
              </Box>
            )}
          </IconButton>
        ))}
      </Box>

      {/* Menu laterale */}
      <Drawer
        anchor="left"
        open={open}
        onClose={handleClose}
        sx={{
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            minWidth: MIN_DRAWER_WIDTH,
            maxWidth: MAX_DRAWER_WIDTH,
            backgroundColor: 'rgba(18, 18, 18, 0.95)',
            color: 'white',
            borderRight: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 0 20px rgba(0, 0, 0, 0.5)',
          },
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          backgroundColor: activeMenu === 'filters' ? '#9c27b0' : 
                          activeMenu === 'favorites' ? '#e91e63' : 
                          activeMenu === 'history' ? '#2196f3' : 
                          'transparent',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {menuItems.find(item => item.id === activeMenu)?.icon}
            <Typography variant="h6" sx={{ ml: 1 }}>
              {menuItems.find(item => item.id === activeMenu)?.label}
            </Typography>
          </Box>
          <IconButton 
            onClick={handleClose}
            sx={{
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            <ChevronLeftIcon />
          </IconButton>
        </Box>
        <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
        
        <Box sx={{ p: 2 }}>
          {renderContent()}
        </Box>
      </Drawer>
    </>
  );
};

export default RadioSideMenu; 