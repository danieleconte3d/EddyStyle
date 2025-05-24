import React from 'react';
import { Outlet } from 'react-router-dom';
import Box from '@mui/material/Box';

const Layout = () => {
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      height: '100%'
    }}>
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout; 