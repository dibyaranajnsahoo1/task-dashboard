import React, { useState } from 'react';
import { Box, Button, Typography, Paper, Chip } from '@mui/material';
import ArrowBackRounded from '@mui/icons-material/ArrowBackRounded';
import DeleteOutlineRounded from '@mui/icons-material/DeleteOutlineRounded';
import AccessTimeRounded from '@mui/icons-material/AccessTimeRounded';
import { useNavigate, useParams } from 'react-router-dom';
import TaskForm, { type TaskFormData } from '../components/Task/TaskForm';
import { useTaskStore } from '../store/taskStore';
import { useNotificationStore } from '../store/notificationStore';
import ConfirmDialog from '../components/common/ConfirmDialog';
import PriorityChip from '../components/common/PriorityChip';
import AssigneeAvatar from '../components/common/AssigneeAvatar';
import { getAssigneeById } from '../data/assignees';
import { format } from 'date-fns';

const TaskDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { tasks, updateTask, deleteTask } = useTaskStore();
  const { showNotification } = useNotificationStore();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const task = tasks.find(t => t.id === id);

  if (!task) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h5" color="text.secondary">Task not found</Typography>
        <Button onClick={() => navigate('/')} sx={{ mt: 2 }}>Back to Board</Button>
      </Box>
    );
  }

  const handleSubmit = (data: TaskFormData) => {
    const { assigneeId, ...taskData } = data;
    updateTask(task.id, {
      ...taskData,
      description: taskData.description || '',
      assignee: getAssigneeById(assigneeId),
    });
    showNotification('Task updated successfully!');
    navigate('/');
  };

  const handleDelete = () => {
    deleteTask(task.id);
    showNotification('Task deleted!', 'info');
    navigate('/');
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'Done';

  return (
    <Box>
      {/* Top navigation row */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
        <Button
          startIcon={<ArrowBackRounded />}
          onClick={() => navigate('/')}
          sx={{ color: 'text.secondary' }}
        >
          Back to Board
        </Button>

        <Button
          variant="outlined"
          color="error"
          startIcon={<DeleteOutlineRounded />}
          onClick={() => setIsDeleteDialogOpen(true)}
        >
          Delete Task
        </Button>
      </Box>

      {/* Task meta summary */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
        <PriorityChip priority={task.priority} />
        <Chip label={task.status} size="small" variant="outlined" />
        {task.assignee && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <AssigneeAvatar assignee={task.assignee} size={24} />
            <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
              {task.assignee.name}
            </Typography>
          </Box>
        )}
        {task.dueDate && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: isOverdue ? 'error.main' : 'text.secondary' }}>
            <AccessTimeRounded sx={{ fontSize: 16 }} />
            <Typography variant="caption" sx={{ fontWeight: 600 }}>
              {format(new Date(task.dueDate), 'MMM d, yyyy')}
              {isOverdue && ' — Overdue'}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Edit Form */}
      <Paper sx={{ p: { xs: 2, sm: 4 }, maxWidth: 800, mx: 'auto', borderRadius: 3 }}>
        <TaskForm
          initialData={task}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/')}
          isEdit
        />
      </Paper>

      <ConfirmDialog
        open={isDeleteDialogOpen}
        title="Delete Task"
        content={`Are you sure you want to permanently delete "${task.title}"?`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteDialogOpen(false)}
        confirmColor="error"
      />
    </Box>
  );
};

export default TaskDetailPage;
