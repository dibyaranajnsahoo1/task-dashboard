import React from 'react';
import { Avatar, Tooltip } from '@mui/material';
import type { Assignee } from '../../types';

interface AssigneeAvatarProps {
  assignee: Assignee;
  size?: number;
}

const AssigneeAvatar: React.FC<AssigneeAvatarProps> = ({ assignee, size = 32 }) => {
  const stringToColor = (string: string) => {
    let hash = 0;
    for (let i = 0; i < string.length; i += 1) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = '#';
    for (let i = 0; i < 3; i += 1) {
      const value = (hash >> (i * 8)) & 0xff;
      color += `00${value.toString(16)}`.slice(-2);
    }
    return color;
  };

  const initials = assignee.initials || assignee.name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <Tooltip title={assignee.name} arrow placement="top">
      <Avatar
        aria-label={assignee.name}
        src={assignee.avatarUrl}
        sx={{
          width: size,
          height: size,
          bgcolor: stringToColor(assignee.name),
          fontSize: size * 0.4,
          fontWeight: 600,
          border: '2px solid',
          borderColor: 'background.paper'
        }}
      >
        {initials}
      </Avatar>
    </Tooltip>
  );
};

export default AssigneeAvatar;
