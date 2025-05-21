import React, { useState } from 'react';
import { Box, Typography, Container, IconButton } from '@mui/material';
import RadioCarousel from '../components/RadioCarousel';
import WindowControls from '../components/WindowControls';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const NowPlayingContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  height: '200px',
  width: '100%',
  marginBottom: theme.spacing(4),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
  borderRadius: theme.spacing(2),
  transition: 'all 0.3s ease-in-out',
  opacity: 0,
  transform: 'translateY(-20px)',
  '&.visible': {
    opacity: 1,
    transform: 'translateY(0)',
  }
}));

const BackgroundImage = styled(Box)(({ image }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundImage: `url(${image})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  filter: 'blur(20px)',
  transform: 'scale(1.1)',
  transition: 'all 0.3s ease-in-out',
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle at center, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.8) 100%)',
  }
}));

const NowPlayingContent = styled(Box)(({ theme }) => ({
  position: 'relative',
  zIndex: 1,
  textAlign: 'center',
  color: 'white',
  padding: theme.spacing(2),
}));

function Radio() {
  const [currentRadio, setCurrentRadio] = useState(null);
  const navigate = useNavigate();

  const handleRadioChange = (radio) => {
    setCurrentRadio(radio);
  };

  return (
    <Container maxWidth="xl" sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <WindowControls />
      <Box sx={{ 
        p: 3, 
        flexGrow: 1, 
        display: 'flex', 
        flexDirection: 'column',
        position: 'relative'
      }}>
        <IconButton
          onClick={() => navigate(-1)}
          sx={{
            position: 'absolute',
            top: 25,
            left: 0,
            zIndex: 3,
            color: 'white',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.2)'
            }
          }}
        >
          <ArrowBackIcon />
        </IconButton>

        <Typography variant="h4" sx={{ 
          mb: 4, 
          color: 'primary.main',
          pl: 6
        }}>
          Radio
        </Typography>
        
        <NowPlayingContainer className={currentRadio ? 'visible' : ''}>
          {currentRadio && (
            <>
              <BackgroundImage image={currentRadio.cover} />
              <NowPlayingContent>
                <Typography variant="h3" sx={{ 
                  fontWeight: 'bold',
                  textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                  mb: 1
                }}>
                  {currentRadio.name}
                </Typography>
                <Typography variant="h6" sx={{ 
                  opacity: 0.8,
                  textShadow: '0 1px 2px rgba(0,0,0,0.5)'
                }}>
                  In riproduzione
                </Typography>
              </NowPlayingContent>
            </>
          )}
        </NowPlayingContainer>

        <Box sx={{ flexGrow: 1 }}>
          <RadioCarousel onRadioChange={handleRadioChange} />
        </Box>
      </Box>
    </Container>
  );
}

export default Radio; 