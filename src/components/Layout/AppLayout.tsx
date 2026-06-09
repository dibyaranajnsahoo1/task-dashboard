import React from 'react';
import { Box, Container } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import NotificationProvider from '../common/NotificationProvider';

const AppLayout: React.FC = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navbar />
      <Box component="main" sx={{ flexGrow: 1,  display: 'flex', flexDirection: 'column' }}>
        <Container maxWidth={false} sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', px: { xs: 2, sm: 3, md: 4 } }}>
          <Outlet />
        </Container>
      </Box>
      <NotificationProvider />
    </Box>
  );
};

export default AppLayout;
