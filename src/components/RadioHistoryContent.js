import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Button,
} from '@mui/material';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
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

const RadioHistoryContent = ({ onRadioSelect, onClose }) => {
  const [history, setHistory] = useState([]);

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
    if (onClose) {
      onClose();
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      {history.length === 0 ? (
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="body2" sx={{ opacity: 0.7 }}>
            Non hai ancora ascoltato nessuna radio.
          </Typography>
        </Box>
      ) : (
        <>
          <List sx={{ width: '100%', bgcolor: 'transparent', p: 0, maxHeight: '58vh', overflow: 'auto' }}>
            {history.map((radio, index) => (
              <React.Fragment key={radio.id}>
                <ListItem
                  alignItems="flex-start"
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
                    secondary={formatRelativeTime(radio.playedAt)}
                    secondaryTypographyProps={{
                      sx: { color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.8rem' }
                    }}
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
              size="small"
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
    </Box>
  );
};

export default RadioHistoryContent; 