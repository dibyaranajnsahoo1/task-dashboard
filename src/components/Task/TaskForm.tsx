import React from 'react';
import { 
  Avatar,
  Box, 
  Button, 
  TextField, 
  MenuItem, 
  Typography,
  Autocomplete,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import type { Task } from '../../types';
import { ASSIGNEES } from '../../data/assignees';

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().max(500).optional(),
  priority: z.enum(['Low', 'Medium', 'High']),
  status: z.enum(['To Do', 'In Progress', 'Done']),
  assigneeId: z.string().min(1, 'Assignee is required'),
  dueDate: z.string().min(1, 'Due date is required').refine(val => {
    const selectedDate = new Date(val);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selectedDate >= today;
  }, 'Due date cannot be in the past'),
  tags: z.array(z.string()).optional(),
});

export type TaskFormData = z.infer<typeof taskSchema>;

interface TaskFormProps {
  initialData?: Task;
  onSubmit: (data: TaskFormData) => void;
  onCancel?: () => void;
  isEdit?: boolean;
}

const TaskForm: React.FC<TaskFormProps> = ({ initialData, onSubmit, onCancel, isEdit = false }) => {
  const navigate = useNavigate();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      priority: initialData?.priority || 'Medium',
      status: initialData?.status || 'To Do',
      assigneeId: initialData?.assignee?.id || ASSIGNEES[0].id,
      dueDate: initialData?.dueDate ? new Date(initialData.dueDate).toISOString().split('T')[0] : '',
      tags: initialData?.tags || [],
    },
  });

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate(-1);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h5" sx={{ mb: 4, fontWeight: 700 }}>
        {isEdit ? 'Edit Task' : 'Create New Task'}
      </Typography>
      
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3 }}>
          <Box sx={{ gridColumn: '1 / -1' }}>
            <Controller
              name="title"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  required
                  fullWidth
                  label="Task Title"
                  error={!!errors.title}
                  helperText={errors.title?.message}
                  autoFocus
                />
              )}
            />
          </Box>
          
          <Box sx={{ gridColumn: '1 / -1' }}>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  multiline
                  rows={4}
                  label="Description"
                  error={!!errors.description}
                  helperText={errors.description?.message}
                />
              )}
            />
          </Box>

          <Box>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  fullWidth
                  label="Status"
                  error={!!errors.status}
                  helperText={errors.status?.message}
                >
                  <MenuItem value="To Do">To Do</MenuItem>
                  <MenuItem value="In Progress">In Progress</MenuItem>
                  <MenuItem value="Done">Done</MenuItem>
                </TextField>
              )}
            />
          </Box>

          <Box>
            <Controller
              name="priority"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  fullWidth
                  label="Priority"
                  error={!!errors.priority}
                  helperText={errors.priority?.message}
                >
                  <MenuItem value="Low">Low</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="High">High</MenuItem>
                </TextField>
              )}
            />
          </Box>

          <Box>
            <Controller
              name="dueDate"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  type="date"
                  fullWidth
                  required
                  label="Due Date"
                  slotProps={{ inputLabel: { shrink: true } }}
                  error={!!errors.dueDate}
                  helperText={errors.dueDate?.message}
                />
              )}
            />
          </Box>

          <Box>
            <Controller
              name="assigneeId"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  required
                  fullWidth
                  label="Assignee"
                  error={!!errors.assigneeId}
                  helperText={errors.assigneeId?.message}
                >
                  {ASSIGNEES.map((assignee) => (
                    <MenuItem key={assignee.id} value={assignee.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar
                          src={assignee.avatarUrl}
                          sx={{
                            width: 24,
                            height: 24,
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            bgcolor: 'primary.main',
                          }}
                        >
                          {assignee.initials}
                        </Avatar>
                        <Typography variant="body2">{assignee.name}</Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Box>
          
          <Box sx={{ gridColumn: '1 / -1' }}>
            <Controller
              name="tags"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  multiple
                  freeSolo
                  options={[]}
                  value={field.value || []}
                  onChange={(_, newValue) => field.onChange(newValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      label="Tags (Type and press enter)"
                      placeholder="e.g. Bug, Feature, Urgent"
                    />
                  )}
                />
              )}
            />
          </Box>
        </Box>

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button variant="outlined" color="inherit" onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary">
            {isEdit ? 'Save Changes' : 'Create Task'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default TaskForm;
