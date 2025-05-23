import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';

const BarContainer = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 80,
  left: '50%',
  transform: 'translateX(-50%)',
  width: '90%',
  maxWidth: 800,
  height: 180,
  borderRadius: 16,
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
  padding: theme.spacing(3),
  boxShadow: '0 6px 20px rgba(0,0,0,0.4)',
  backdropFilter: 'blur(4px)',
  zIndex: 20,
}));

const BlurredBg = styled('div')(({ cover }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundImage: `url(${cover})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  filter: 'blur(20px) brightness(0.5)',
  transform: 'scale(1.2)',
  zIndex: 0,
}));

const CoverImg = styled('img')(({ theme }) => ({
  width: 80,
  height: 80,
  borderRadius: 8,
  objectFit: 'cover',
  boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
  zIndex: 2,
}));

const InfoBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  marginLeft: theme.spacing(2),
  zIndex: 2,
}));

function NowPlayingBar({ radio, isPlaying, onTogglePlay }) {
  if (!radio) return null;

  return (
    <BarContainer>
      <BlurredBg cover={radio.cover} />
      <CoverImg src={radio.cover} alt={radio.name} />
      <InfoBox>
        <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
          {radio.name}
        </Typography>
      </InfoBox>
      <Box sx={{ flexGrow: 1 }} />
      <IconButton
        onClick={onTogglePlay}
        sx={{ zIndex: 2, color: 'white' }}
      >
        {isPlaying ? <PauseIcon fontSize="large" /> : <PlayArrowIcon fontSize="large" />}
      </IconButton>
    </BarContainer>
  );
}

export default React.memo(NowPlayingBar); 