import React from 'react';
import { Avatar, Tooltip } from '@mui/material';
import type {  Assignee  } from '../../types';

interface AssigneeAvatarProps {
  assignee: Assignee;
  size?: number;
}

const AssigneeAvatar: React.FC<AssigneeAvatarProps> = ({ assignee, size = 32 }) => {
  // Simple deterministic color generation based on name length or first char
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

  return (
    <Tooltip title={assignee.name} arrow placement="top">
      <Avatar
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
        {assignee.initials}
      </Avatar>
    </Tooltip>
  );
};

export default AssigneeAvatar;
