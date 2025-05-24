import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
  Divider,
  Button,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import RadioStorage from '../utils/radioStorage';

const RadioFavoritesContent = ({ onRadioSelect, onClose }) => {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = () => {
    const favorites = RadioStorage.getFavorites();
    setFavorites(favorites);
  };

  const handleRemoveFavorite = (e, radioId) => {
    e.stopPropagation();
    RadioStorage.removeFavorite(radioId);
    loadFavorites();
  };

  const handleRadioSelect = (radio) => {
    if (onRadioSelect) {
      onRadioSelect(radio);
    }
    if (onClose) {
      onClose();
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      {favorites.length === 0 ? (
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="body2" sx={{ opacity: 0.7 }}>
            Non hai ancora radio preferite.
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.7, mt: 1 }}>
            Clicca sull'icona del cuore su una radio per aggiungerla qui.
          </Typography>
        </Box>
      ) : (
        <List sx={{ width: '100%', bgcolor: 'transparent', p: 0, maxHeight: '60vh', overflow: 'auto' }}>
          {favorites.map((radio, index) => (
            <React.Fragment key={radio.id}>
              <ListItem
                alignItems="flex-start"
                secondaryAction={
                  <IconButton 
                    edge="end" 
                    size="small"
                    onClick={(e) => handleRemoveFavorite(e, radio.id)}
                    sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                }
                onClick={() => handleRadioSelect(radio)}
                sx={{ 
                  cursor: 'pointer',
                  py: 1,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.05)'
                  }
                }}
              >
                <ListItemAvatar>
                  <Avatar 
                    alt={radio.name} 
                    src={radio.cover}
                    variant="rounded"
                    sx={{ width: 40, height: 40 }}
                  />
                </ListItemAvatar>
                <ListItemText
                  primary={radio.name}
                  primaryTypographyProps={{
                    noWrap: true,
                    sx: { color: 'white', fontSize: '0.9rem' }
                  }}
                  secondary={new Date(radio.addedAt).toLocaleDateString()}
                  secondaryTypographyProps={{
                    sx: { color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.8rem' }
                  }}
                />
              </ListItem>
              {index < favorites.length - 1 && (
                <Divider variant="inset" component="li" sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
              )}
            </React.Fragment>
          ))}
        </List>
      )}
    </Box>
  );
};

export default RadioFavoritesContent; 