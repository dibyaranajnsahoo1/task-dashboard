import React from 'react';
import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import AccessTimeRounded from '@mui/icons-material/AccessTimeRounded';
import LabelRounded from '@mui/icons-material/LabelRounded';
import type { Task } from '../../types';
import PriorityChip from '../common/PriorityChip';
import AssigneeAvatar from '../common/AssigneeAvatar';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

interface TaskCardProps {
  task: Task;
  isNew?: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, isNew = false }) => {
  const navigate = useNavigate();
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'Done';

  return (
    <Card
      onClick={() => navigate(`/task/${task.id}`)}
      sx={{
        cursor: 'pointer',
        position: 'relative',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        outline: isNew ? (theme) => `2px solid ${theme.palette.primary.main}` : 'none',
        outlineOffset: isNew ? '2px' : '0px',
        animation: isNew ? 'highlightNew 1.5s ease forwards' : 'none',
        '@keyframes highlightNew': {
          '0%': { transform: 'scale(1.03)', boxShadow: '0 0 0 4px rgba(99, 102, 241, 0.4)' },
          '100%': { transform: 'scale(1)', boxShadow: 'none', outline: 'none' },
        },
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: (theme) =>
            theme.palette.mode === 'light'
              ? '0 10px 15px -3px rgb(0 0 0 / 0.12), 0 4px 6px -4px rgb(0 0 0 / 0.1)'
              : '0 10px 15px -3px rgb(0 0 0 / 0.4), 0 4px 6px -4px rgb(0 0 0 / 0.3)',
        },
      }}
    >
      <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
        {/* Priority + Title */}
        <PriorityChip priority={task.priority} />

        <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 1, mb: 1.5, lineHeight: 1.3 }}>
          {task.title}
        </Typography>

        {/* Due date + Assignee row */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: isOverdue ? 'error.main' : 'text.secondary' }}>
            <AccessTimeRounded sx={{ fontSize: 14 }} />
            <Typography variant="caption" sx={{ fontWeight: 500 }}>
              {task.dueDate ? format(new Date(task.dueDate), 'MMM d, yyyy') : 'No due date'}
            </Typography>
          </Box>

          {task.assignee && (
            <AssigneeAvatar assignee={task.assignee} size={28} />
          )}
        </Box>

        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1.5 }}>
            {task.tags.map((tag, idx) => (
              <Chip
                key={idx}
                label={tag}
                size="small"
                icon={<LabelRounded sx={{ fontSize: '0.75rem !important' }} />}
                sx={{
                  height: 20,
                  fontSize: '0.62rem',
                  fontWeight: 700,
                  bgcolor: (theme) => theme.palette.mode === 'light' ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.2)',
                  color: 'primary.main',
                  border: 'none',
                  '& .MuiChip-label': { px: 0.5 }
                }}
              />
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default TaskCard;
