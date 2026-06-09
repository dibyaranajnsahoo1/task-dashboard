import React from 'react';
import { Box, Paper, Typography, useTheme, CircularProgress } from '@mui/material';
import AssignmentRounded from '@mui/icons-material/AssignmentRounded';
import CheckCircleRounded from '@mui/icons-material/CheckCircleRounded';
import WarningRounded from '@mui/icons-material/WarningRounded';
import { useTaskStore } from '../../store/taskStore';

const TaskStats: React.FC = () => {
  const { tasks } = useTaskStore();
  const theme = useTheme();

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'Done').length;
  const overdueTasks = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'Done').length;
  
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const StatBox = ({ title, value, icon, color, progress }: { title: string, value: number, icon: React.ReactNode, color: string, progress?: number }) => (
    <Paper 
      elevation={0}
      sx={{ 
        flex: 1,
        minWidth: { xs: '100%', sm: 140 },
        p: { xs: 1.5, sm: 2 }, 
        display: 'flex', 
        alignItems: 'center', 
        gap: 2,
        borderRadius: 3,
        border: `1px solid ${theme.palette.divider}`,
        bgcolor: 'background.paper',
      }}
    >
      <Box sx={{ 
        p: 1.5, 
        borderRadius: 2, 
        bgcolor: `${color}20`, 
        color: color,
        display: 'flex'
      }}>
        {icon}
      </Box>
      <Box>
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          {value}
        </Typography>
      </Box>
      {progress !== undefined && (
        <Box sx={{ position: 'relative', display: 'inline-flex', ml: 'auto' }}>
          <CircularProgress variant="determinate" value={100} size={48} thickness={4} sx={{ color: 'divider', position: 'absolute' }} />
          <CircularProgress variant="determinate" value={progress} size={48} thickness={4} sx={{ color }} />
          <Box sx={{ top: 0, left: 0, bottom: 0, right: 0, position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.6rem' }} color="text.secondary">
              {`${progress}%`}
            </Typography>
          </Box>
        </Box>
      )}
    </Paper>
  );

  return (
    <Box sx={{ display: 'flex', gap: { xs: 2, sm: 3 }, mb: { xs: 2, sm: 4 }, flexWrap: 'wrap' }}>
      <StatBox 
        title="Total Tasks" 
        value={totalTasks} 
        icon={<AssignmentRounded />} 
        color={theme.palette.primary.main} 
      />
      <StatBox 
        title="Completed" 
        value={completedTasks} 
        icon={<CheckCircleRounded />} 
        color={theme.palette.secondary.main} 
        progress={completionPercentage}
      />
      <StatBox 
        title="Overdue" 
        value={overdueTasks} 
        icon={<WarningRounded />} 
        color={theme.palette.error.main} 
      />
    </Box>
  );
};

export default TaskStats;
