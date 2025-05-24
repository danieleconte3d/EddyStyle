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
import HistoryIcon from '@mui/icons-material/History';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import RadioStorage from '../utils/radioStorage';

const formatRelativeTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) {
    return `${diffDays} ${diffDays === 1 ? 'giorno' : 'giorni'} fa`;
  } else if (diffHours > 0) {
    return `${diffHours} ${diffHours === 1 ? 'ora' : 'ore'} fa`;
  } else if (diffMinutes > 0) {
    return `${diffMinutes} ${diffMinutes === 1 ? 'minuto' : 'minuti'} fa`;
  } else {
    return 'Poco fa';
  }
};

const RadioHistory = ({ onRadioSelect }) => {
  const [history, setHistory] = useState([]);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    const history = RadioStorage.getHistory();
    setHistory(history);
  };

  const handleClearHistory = () => {
    RadioStorage.clearHistory();
    loadHistory();
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
          }
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
            <HistoryIcon sx={{ mr: 1, color: '#64b5f6' }} />
            <Typography>Ascoltate di Recente</Typography>
            <Typography variant="body2" sx={{ ml: 1, opacity: 0.7 }}>
              ({history.length})
            </Typography>
          </Box>
        </AccordionSummary>
        
        <AccordionDetails sx={{ p: 0 }}>
          {history.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ opacity: 0.7 }}>
                Non hai ancora ascoltato nessuna radio.
              </Typography>
            </Box>
          ) : (
            <>
              <List sx={{ width: '100%', bgcolor: 'transparent', p: 0 }}>
                {history.map((radio, index) => (
                  <React.Fragment key={radio.id}>
                    <ListItem
                      alignItems="center"
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
                        secondary={formatRelativeTime(radio.playedAt)}
                        secondaryTypographyProps={{
                          sx: { color: 'rgba(255, 255, 255, 0.7)' }
                        }}
                        sx={{ ml: 1 }}
                      />
                    </ListItem>
                    {index < history.length - 1 && (
                      <Divider variant="inset" component="li" sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
                    )}
                  </React.Fragment>
                ))}
              </List>
              
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  startIcon={<DeleteSweepIcon />}
                  onClick={handleClearHistory}
                  sx={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    '&:hover': {
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)'
                    }
                  }}
                >
                  Cancella Cronologia
                </Button>
              </Box>
            </>
          )}
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default RadioHistory; 