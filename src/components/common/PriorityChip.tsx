import React from 'react';
import { Chip } from '@mui/material';
import type {  Priority  } from '../../types';

interface PriorityChipProps {
  priority: Priority;
  size?: 'small' | 'medium';
}

const PriorityChip: React.FC<PriorityChipProps> = ({ priority, size = 'small' }) => {
  const getPriorityColor = () => {
    switch (priority) {
      case 'High':
        return 'error';
      case 'Medium':
        return 'warning';
      case 'Low':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Chip 
      label={priority} 
      size={size} 
      color={getPriorityColor()} 
      variant="outlined"
      sx={{ 
        fontWeight: 600,
        borderRadius: '6px',
        borderWidth: '1.5px'
      }} 
    />
  );
};

export default PriorityChip;
