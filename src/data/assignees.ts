import type { Assignee } from '../types';

export const ASSIGNEES: Assignee[] = [
  {
    id: 'user-1',
    name: 'John Doe',
    initials: 'JD',
  },
  {
    id: 'user-2',
    name: 'Priya Shah',
    initials: 'PS',
  },
  {
    id: 'user-3',
    name: 'Michael Chen',
    initials: 'MC',
  },
];

export const getAssigneeById = (id: string): Assignee =>
  ASSIGNEES.find((assignee) => assignee.id === id) ?? ASSIGNEES[0];
