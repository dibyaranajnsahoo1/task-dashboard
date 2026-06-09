import React from 'react';
import { Box, TextField, MenuItem, InputAdornment } from '@mui/material';
import SearchRounded from '@mui/icons-material/SearchRounded';
import type { Priority } from '../../types';

interface FilterBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  priorityFilter: Priority | 'All';
  setPriorityFilter: (priority: Priority | 'All') => void;
  assigneeFilter: string;
  setAssigneeFilter: (assignee: string) => void;
  assigneeOptions: { id: string; name: string }[];
}

const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  setSearchQuery,
  priorityFilter,
  setPriorityFilter,
  assigneeFilter,
  setAssigneeFilter,
  assigneeOptions,
}) => {
  return (
    <Box sx={{
      display: 'flex',
      gap: 2,
      mb: 3,
      flexWrap: 'wrap',
      flexDirection: { xs: 'column', sm: 'row' }
    }}>
      {/* Search */}
      <TextField
        placeholder="Search tasks..."
        variant="outlined"
        size="small"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{ width: { xs: '100%', sm: 240 }, bgcolor: 'background.paper', borderRadius: 2 }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchRounded fontSize="small" color="action" />
              </InputAdornment>
            ),
          }
        }}
      />

      {/* Priority Filter */}
      <TextField
        select
        label="Priority"
        variant="outlined"
        size="small"
        value={priorityFilter}
        onChange={(e) => setPriorityFilter(e.target.value as Priority | 'All')}
        sx={{ width: { xs: '100%', sm: 150 }, bgcolor: 'background.paper', borderRadius: 2 }}
      >
        <MenuItem value="All">All Priorities</MenuItem>
        <MenuItem value="High">🔴 High</MenuItem>
        <MenuItem value="Medium">🟡 Medium</MenuItem>
        <MenuItem value="Low">🟢 Low</MenuItem>
      </TextField>

      {/* Assignee Filter */}
      <TextField
        select
        label="Assignee"
        variant="outlined"
        size="small"
        value={assigneeFilter}
        onChange={(e) => setAssigneeFilter(e.target.value)}
        sx={{ width: { xs: '100%', sm: 160 }, bgcolor: 'background.paper', borderRadius: 2 }}
      >
        <MenuItem value="All">All Assignees</MenuItem>
        {assigneeOptions.map((a) => (
          <MenuItem key={a.id} value={a.id}>{a.name}</MenuItem>
        ))}
      </TextField>
    </Box>
  );
};

export default FilterBar;
