import React, { useState, useMemo, useEffect } from 'react';
import { Box, Button, Typography } from '@mui/material';
import AddRounded from '@mui/icons-material/AddRounded';
import { DragDropContext } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { useNavigate } from 'react-router-dom';
import { useTaskStore } from '../../store/taskStore';
import type { Status, Priority } from '../../types';
import BoardColumn from './BoardColumn';
import FilterBar from './FilterBar';
import TaskStats from './TaskStats';

const STATUSES: Status[] = ['To Do', 'In Progress', 'Done'];

const BoardView: React.FC = () => {
  const { tasks, moveTask } = useTaskStore();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'All'>('All');
  const [assigneeFilter, setAssigneeFilter] = useState('All');
  const [newTaskId, setNewTaskId] = useState<string | null>(null);

  // Read newTaskId from sessionStorage (set by CreateTaskPage after save)
  useEffect(() => {
    const id = sessionStorage.getItem('newTaskId');
    if (id) {
      setNewTaskId(id);
      sessionStorage.removeItem('newTaskId');
      // Clear highlight after animation completes
      setTimeout(() => setNewTaskId(null), 2500);
    }
  }, [tasks]);

  // Unique assignee options derived from tasks
  const assigneeOptions = useMemo(() => {
    const map = new Map<string, string>();
    tasks.forEach(t => {
      if (t.assignee) map.set(t.assignee.id, t.assignee.name);
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch =
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.description || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPriority = priorityFilter === 'All' || task.priority === priorityFilter;
      const matchesAssignee = assigneeFilter === 'All' || task.assignee?.id === assigneeFilter;
      return matchesSearch && matchesPriority && matchesAssignee;
    });
  }, [tasks, searchQuery, priorityFilter, assigneeFilter]);

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;
    moveTask(draggableId, destination.droppableId as Status, destination.index);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 3,
        gap: 2,
        flexWrap: 'wrap'
      }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700, fontSize: { xs: '1.4rem', sm: '2rem' } }}>
          Project Tasks
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddRounded />}
          onClick={() => navigate('/create')}
          size="medium"
          sx={{ flexShrink: 0 }}
        >
          New Task
        </Button>
      </Box>

      {/* Stats */}
      <TaskStats />

      {/* Filters */}
      <FilterBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        priorityFilter={priorityFilter}
        setPriorityFilter={setPriorityFilter}
        assigneeFilter={assigneeFilter}
        setAssigneeFilter={setAssigneeFilter}
        assigneeOptions={assigneeOptions}
      />

      {/* Board Columns */}
      <Box sx={{ flexGrow: 1, pb: 2, mt: 1 }}>
        <DragDropContext onDragEnd={onDragEnd}>
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr', md: 'repeat(3, 1fr)' },
            gap: { xs: 2, md: 3 },
            alignItems: 'start',
          }}>
            {STATUSES.map(status => (
              <BoardColumn
                key={status}
                status={status}
                tasks={filteredTasks.filter(t => t.status === status)}
                newTaskId={newTaskId}
              />
            ))}
          </Box>
        </DragDropContext>
      </Box>
    </Box>
  );
};

export default BoardView;
