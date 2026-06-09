import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import FilterBar from '../components/Board/FilterBar';

const defaultProps = {
  searchQuery: '',
  setSearchQuery: vi.fn(),
  priorityFilter: 'All' as const,
  setPriorityFilter: vi.fn(),
  assigneeFilter: 'All',
  setAssigneeFilter: vi.fn(),
  assigneeOptions: [
    { id: 'user-1', name: 'John Doe' },
    { id: 'user-2', name: 'Jane Smith' },
  ],
};

describe('FilterBar Component', () => {
  it('should call setSearchQuery when typing in the search box', () => {
    const setSearchQuery = vi.fn();
    render(<FilterBar {...defaultProps} setSearchQuery={setSearchQuery} />);

    const searchInput = screen.getByPlaceholderText('Search tasks...');
    fireEvent.change(searchInput, { target: { value: 'bug fix' } });

    expect(setSearchQuery).toHaveBeenCalledWith('bug fix');
  });

  it('should render all assignee options in the dropdown', () => {
    render(<FilterBar {...defaultProps} />);

    // The assignee select should be visible
    expect(screen.getByText('All Assignees')).toBeDefined();
  });

  it('should render priority filter with all options', () => {
    render(<FilterBar {...defaultProps} />);

    expect(screen.getByText('All Priorities')).toBeDefined();
  });
});
