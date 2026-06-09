import React from 'react';
import { Box, Button, Paper } from '@mui/material';
import ArrowBackRounded from '@mui/icons-material/ArrowBackRounded';
import { useNavigate } from 'react-router-dom';
import TaskForm from '../components/Task/TaskForm';
import { useTaskStore } from '../store/taskStore';
import { useNotificationStore } from '../store/notificationStore';
import type { Assignee } from '../types';

const CreateTaskPage: React.FC = () => {
  const navigate = useNavigate();
  const { addTask } = useTaskStore();
  const { showNotification } = useNotificationStore();

  // Mock current user as assignee default
  const currentUser: Assignee = {
    id: 'user-1',
    name: 'John Doe',
    initials: 'JD'
  };

  const handleSubmit = (data: any) => {
    const newTask = addTask({
      ...data,
      assignee: currentUser,
    });
    // Store new task id so BoardView can highlight it
    if (newTask?.id) {
      sessionStorage.setItem('newTaskId', newTask.id);
    }
    showNotification('Task created successfully! 🎉');
    navigate('/');
  };

  return (
    <Box>
      <Button
        startIcon={<ArrowBackRounded />}
        onClick={() => navigate('/')}
        sx={{ mb: 2, color: 'text.secondary' }}
      >
        Back to Board
      </Button>
      <Paper sx={{ p: { xs: 2, sm: 4 }, maxWidth: 800, mx: 'auto', borderRadius: 3 }}>
        <TaskForm onSubmit={handleSubmit} onCancel={() => navigate('/')} />
      </Paper>
    </Box>
  );
};

export default CreateTaskPage;
