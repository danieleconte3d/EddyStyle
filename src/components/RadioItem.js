import React, { useState } from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import RadioIcon from '@mui/icons-material/Radio';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { memo } from 'react';
import RadioStorage from '../utils/radioStorage';

const ScrollingText = styled(Typography)(({ theme }) => ({
  width: '100%',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  textAlign: 'center',
  position: 'relative',
  zIndex: 2,
  textShadow: '0 2px 4px rgba(0,0,0,0.5)'
}));

const coverStyle = {
  width: 150,
  height: 150,
  borderRadius: 6,
  zIndex: 2,
  boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
  objectFit: 'cover'
};

const reflectionBoxStyle = {
  width: 150,
  height: 150,
  position: 'absolute',
  top: 'calc(0% + 75px)',
  left: '50%',
  transform: 'scaleY(-1) translateX(-50%) translateY(0px) rotateX(-80deg)',
  transformOrigin: 'bottom',
  borderRadius: 6,
  zIndex: 1,
  objectFit: 'cover',
  filter: 'blur(8px)',
  maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.3) 100%)',
  WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 100%)'
};

const placeholderStyle = {
  ...coverStyle,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(255, 255, 255, 0.05)'
};

const placeholderIconStyle = {
  fontSize: 120,
  color: 'rgba(255, 255, 255, 0.3)',
  width: '100%',
  height: '100%',
  padding: '40px'
};

const RadioItemComponent = ({ radio, isPlaying, onRadioClick, onTextOverflow, isScrolling, onToggleFavorite }) => {
  const [failedImage, setFailedImage] = useState(false);
  const [isFavorite, setIsFavorite] = useState(RadioStorage.isFavorite(radio.id));

  const handleImageError = () => {
    setFailedImage(true);
  };

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite(radio);
      setIsFavorite(!isFavorite);
    }
  };

  return (
    <Box
      sx={{
        width: '120px',
        height: '50%',
        margin: '0 10px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        position: 'relative',
        borderRadius: 16,
        padding: 16,
        '&:hover': {
          transform: 'scale(1.05)',
        }
      }}
      onClick={(e) => onRadioClick(radio, e)}
    >
      <Box sx={{ 
        position: 'relative', 
        height: 280,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        perspective: '400px'
      }}>
        <IconButton
          onClick={handleFavoriteClick}
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: '8px',
            zIndex: 10,
            cursor: isScrolling ? 'grabbing' : 'pointer',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            '&:hover': { 
              backgroundColor: isScrolling ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.5)',
              transform: isScrolling ? 'none' : 'scale(1.1)'
            },
            transition: isScrolling ? 'none' : 'all 0.2s ease'
          }}
        >
          {isFavorite ? (
            <FavoriteIcon sx={{ 
              color: '#ff6b6b',
              fontSize: '24px',
              transition: isScrolling ? 'none' : 'transform 0.2s ease',
              '&:hover': {
                transform: isScrolling ? 'none' : 'scale(1.1)'
              }
            }} />
          ) : (
            <FavoriteBorderIcon sx={{ 
              color: 'white',
              fontSize: '24px',
              transition: isScrolling ? 'none' : 'transform 0.2s ease',
              '&:hover': {
                transform: isScrolling ? 'none' : 'scale(1.1)'
              }
            }} />
          )}
        </IconButton>

        <ScrollingText
          id={`radio-text-${radio.id}`}
          variant="h6"
          sx={{ 
            mb: 2, 
            color: 'white', 
            width: '100%',
            position: 'absolute',
            top: 'calc(70% + 40px)',
            zIndex: 3
          }}
        >
          {radio.name}
        </ScrollingText>

        {failedImage ? (
          <>
            <Box sx={placeholderStyle}>
              <RadioIcon sx={placeholderIconStyle} />
            </Box>
            <Box sx={{
              ...reflectionBoxStyle,
              transformStyle: 'preserve-3d',
              backgroundColor: 'rgba(255, 255, 255, 0.05)'
            }}>
              <RadioIcon sx={placeholderIconStyle} />
            </Box>
          </>
        ) : (
          <>
            <Box
              component="img"
              src={radio.cover}
              alt={radio.name}
              onError={handleImageError}
              sx={coverStyle}
            />
            <img
              src={radio.cover}
              alt={`${radio.name} reflection`}
              style={{
                ...reflectionBoxStyle,
                transformStyle: 'preserve-3d'
              }}
            />
          </>
        )}

        {isPlaying && (
          <IconButton
            sx={{
              color: 'white',
              '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.2)' },
              zIndex: 3,
              position: 'absolute',
              bottom: 0
            }}
          >
            <PlayArrowIcon />
          </IconButton>
        )}
      </Box>
    </Box>
  );
};

const areEqual = (prev, next) => {
  return (
    prev.radio.id === next.radio.id &&
    prev.isPlaying === next.isPlaying &&
    RadioStorage.isFavorite(prev.radio.id) === RadioStorage.isFavorite(next.radio.id)
  );
};

export default memo(RadioItemComponent, areEqual);