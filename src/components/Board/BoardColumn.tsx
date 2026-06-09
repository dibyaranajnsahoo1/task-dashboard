import React from 'react';
import { Box, Typography, Paper, useTheme } from '@mui/material';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import type { Status, Task } from '../../types';
import TaskCard from '../Task/TaskCard';
import AssignmentTurnedInRounded from '@mui/icons-material/AssignmentTurnedInRounded';

interface BoardColumnProps {
  status: Status;
  tasks: Task[];
  newTaskId?: string | null;
}

const BoardColumn: React.FC<BoardColumnProps> = ({ status, tasks, newTaskId }) => {
  const theme = useTheme();
  
  const getStatusColor = () => {
    switch (status) {
      case 'To Do': return theme.palette.text.secondary;
      case 'In Progress': return theme.palette.primary.main;
      case 'Done': return theme.palette.secondary.main;
      default: return theme.palette.divider;
    }
  };
  
  return (
    <Paper
      elevation={0}
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
        borderRadius: 3,
        p: { xs: 1.5, sm: 2 },
        border: `1px solid ${theme.palette.divider}`,
        borderTop: `4px solid ${getStatusColor()}`
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 700 }}>
          {status}
        </Typography>
        <Box 
          sx={{ 
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
            px: 1.5,
            py: 0.5,
            borderRadius: 5,
            typography: 'caption',
            fontWeight: 700
          }}
        >
          {tasks.length}
        </Box>
      </Box>

      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <Box
            ref={provided.innerRef}
            {...provided.droppableProps}
            sx={{
              flexGrow: 1,
              minHeight: 150,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              transition: 'background-color 0.2s',
              bgcolor: snapshot.isDraggingOver 
                ? (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)')
                : 'transparent',
              borderRadius: 2,
            }}
          >
            {tasks.map((task, index) => (
              <Draggable key={task.id} draggableId={task.id} index={index}>
                {(provided, snapshot) => (
                  <Box
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    sx={{
                      ...provided.draggableProps.style,
                      opacity: snapshot.isDragging ? 0.8 : 1,
                    }}
                  >
                    <TaskCard task={task} isNew={task.id === newTaskId} />
                  </Box>
                )}
              </Draggable>
            ))}
            
            {tasks.length === 0 && (
              <Box sx={{ 
                flexGrow: 1, 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center', 
                justifyContent: 'center',
                color: 'text.secondary',
                opacity: 0.6,
                py: 4
              }}>
                <AssignmentTurnedInRounded sx={{ fontSize: 40, mb: 1, opacity: 0.5 }} />
                <Typography variant="body2" sx={{ fontWeight: 500 }}>No tasks yet</Typography>
              </Box>
            )}
            
            {provided.placeholder}
          </Box>
        )}
      </Droppable>
    </Paper>
  );
};

export default BoardColumn;
