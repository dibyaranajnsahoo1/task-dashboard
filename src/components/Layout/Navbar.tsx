import React from 'react';
import { AppBar, Toolbar, Typography, Box, IconButton, useTheme } from '@mui/material';
import DashboardRounded from '@mui/icons-material/DashboardRounded';
import DarkModeRounded from '@mui/icons-material/DarkModeRounded';
import LightModeRounded from '@mui/icons-material/LightModeRounded';
import { useThemeStore } from '../../store/themeStore';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
  const theme = useTheme();
  const { mode, toggleTheme } = useThemeStore();

  return (
    <AppBar 
      position="sticky" 
      elevation={0}
      sx={{ 
        bgcolor: theme.palette.mode === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(18, 18, 18, 0.8)',
        backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${theme.palette.divider}`,
        color: 'text.primary',
        mb: 4
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box 
          component={Link} 
          to="/" 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1.5,
            textDecoration: 'none',
            color: 'inherit'
          }}
        >
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              borderRadius: 2,
              p: 0.5
            }}
          >
            <DashboardRounded />
          </Box>
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              fontWeight: 700, 
              letterSpacing: '-0.5px',
              fontSize: { xs: '1rem', sm: '1.25rem' },
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Task Dashboard
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={toggleTheme} color="inherit" sx={{ ml: 1 }}>
            {mode === 'dark' ? <LightModeRounded /> : <DarkModeRounded />}
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
