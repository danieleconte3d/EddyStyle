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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FavoriteIcon from '@mui/icons-material/Favorite';
import DeleteIcon from '@mui/icons-material/Delete';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import RadioStorage from '../utils/radioStorage';

const RadioFavorites = ({ onRadioSelect }) => {
  const [favorites, setFavorites] = useState([]);
  const [expanded, setExpanded] = useState(false);

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
  };

  return (
    <Box sx={{ mb: 4, width: '100%' }}>
      <Accordion 
        expanded={expanded} 
        onChange={() => setExpanded(!expanded)}
        sx={{
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          color: 'white',
          borderRadius: 2,
          '&:before': {
            display: 'none',
          },
          mb: 2
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}
          sx={{ 
            borderRadius: 2,
            '&.Mui-expanded': {
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0,
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <FavoriteIcon sx={{ mr: 1, color: '#ff6b6b' }} />
            <Typography>Le Mie Preferite</Typography>
            <Typography variant="body2" sx={{ ml: 1, opacity: 0.7 }}>
              ({favorites.length})
            </Typography>
          </Box>
        </AccordionSummary>
        
        <AccordionDetails sx={{ p: 0 }}>
          {favorites.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ opacity: 0.7 }}>
                Non hai ancora radio preferite.
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.7, mt: 1 }}>
                Clicca sull'icona del cuore su una radio per aggiungerla qui.
              </Typography>
            </Box>
          ) : (
            <List sx={{ width: '100%', bgcolor: 'transparent', p: 0 }}>
              {favorites.map((radio, index) => (
                <React.Fragment key={radio.id}>
                  <ListItem
                    alignItems="center"
                    secondaryAction={
                      <IconButton 
                        edge="end" 
                        onClick={(e) => handleRemoveFavorite(e, radio.id)}
                        sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    }
                    onClick={() => handleRadioSelect(radio)}
                    sx={{ 
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.05)'
                      }
                    }}
                  >
                    <ListItemAvatar sx={{ position: 'relative' }}>
                      <Avatar 
                        alt={radio.name} 
                        src={radio.cover}
                        variant="rounded"
                        sx={{ width: 50, height: 50 }}
                      />
                      <Box sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'rgba(0, 0, 0, 0.4)',
                        opacity: 0,
                        transition: 'opacity 0.2s',
                        '&:hover': {
                          opacity: 1
                        }
                      }}>
                        <PlayArrowIcon sx={{ color: 'white', fontSize: 30 }} />
                      </Box>
                    </ListItemAvatar>
                    <ListItemText
                      primary={radio.name}
                      primaryTypographyProps={{
                        noWrap: true,
                        sx: { color: 'white' }
                      }}
                      secondary={new Date(radio.addedAt).toLocaleDateString()}
                      secondaryTypographyProps={{
                        sx: { color: 'rgba(255, 255, 255, 0.7)' }
                      }}
                      sx={{ ml: 1 }}
                    />
                  </ListItem>
                  {index < favorites.length - 1 && (
                    <Divider variant="inset" component="li" sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
                  )}
                </React.Fragment>
              ))}
            </List>
          )}
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default RadioFavorites; 