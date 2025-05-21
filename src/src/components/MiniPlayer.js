import React, { useState, useEffect } from 'react';
import { Box, IconButton, Typography, Avatar } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { useRadio } from '../contexts/RadioContext';
import { useNavigate } from 'react-router-dom';
import RadioStorage from '../utils/radioStorage';

const MiniPlayer = () => {
  const { currentRadio, isPlaying, togglePlay, toggleFavorite } = useRadio();
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (currentRadio) {
      setIsFavorite(RadioStorage.isFavorite(currentRadio.id));
    }
  }, [currentRadio]);

  if (!currentRadio) return null;

  const handleToggleFavorite = (e) => {
    e.stopPropagation();
    e.preventDefault();
    
    const newIsFavorite = toggleFavorite(currentRadio);
    setIsFavorite(newIsFavorite);
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 13,
        right: 200,
        height: '32px',
        width: '20%',
        minWidth: '250px',
        maxWidth: '300px',
        display: 'flex',
        alignItems: 'center',
        padding: '0 8px',
        zIndex: 1300,
        color: 'white',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          cursor: 'pointer',
          flex: 1,
          minWidth: 0,
          marginRight: '80px',
          '&:hover': {
            '& .radio-name': {
              color: 'primary.main',
            }
          }
        }}
        onClick={() => navigate('/radio')}
      >
        <Avatar
          src={currentRadio.cover}
          alt={currentRadio.name}
          variant="rounded"
          sx={{ 
            width: 24, 
            height: 24,
            flexShrink: 0,
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        />
        <Typography
          variant="body2"
          className="radio-name"
          sx={{
            fontWeight: 500,
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            fontSize: '0.8rem',
            transition: 'color 0.2s ease',
            flex: 1,
            minWidth: 0,
          }}
        >
          {currentRadio.name}
        </Typography>
      </Box>

      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center',
          position: 'absolute',
          right: 8,
        }}
      >
        <IconButton
          onClick={togglePlay}
          size="small"
          sx={{
            color: 'white',
            padding: '4px',
            '&:hover': { 
              color: 'primary.main',
            },
          }}
        >
          {isPlaying ? (
            <PauseIcon sx={{ fontSize: '1.2rem' }} />
          ) : (
            <PlayArrowIcon sx={{ fontSize: '1.2rem' }} />
          )}
        </IconButton>
        <IconButton
          onClick={handleToggleFavorite}
          size="small"
          sx={{
            color: isFavorite ? '#ff6b6b' : 'white',
            padding: '4px',
            '&:hover': { 
              color: isFavorite ? '#ff8787' : '#ff6b6b',
              transform: 'scale(1.1)',
            },
            transition: 'all 0.2s ease',
          }}
        >
          {isFavorite ? (
            <FavoriteIcon sx={{ 
              fontSize: '1.2rem',
              transform: 'scale(1.1)',
              transition: 'transform 0.2s ease',
            }} />
          ) : (
            <FavoriteBorderIcon sx={{ 
              fontSize: '1.2rem',
              transition: 'transform 0.2s ease',
            }} />
          )}
        </IconButton>
      </Box>
    </Box>
  );
};

export default MiniPlayer; 