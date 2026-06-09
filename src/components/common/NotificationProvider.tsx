import React from 'react';
import { Snackbar, Alert } from '@mui/material';
import { useNotificationStore } from '../../store/notificationStore';

const NotificationProvider: React.FC = () => {
  const { open, message, type, hideNotification } = useNotificationStore();

  const handleClose = (_event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    hideNotification();
  };

  return (
    <Snackbar 
      open={open} 
      autoHideDuration={4000} 
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      <Alert 
        onClose={handleClose} 
        severity={type} 
        variant="filled"
        sx={{ width: '100%', borderRadius: 2, boxShadow: 3, fontWeight: 500 }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default NotificationProvider;
