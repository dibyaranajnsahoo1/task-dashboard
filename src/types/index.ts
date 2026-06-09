export type Priority = 'Low' | 'Medium' | 'High';
export type Status = 'To Do' | 'In Progress' | 'Done';

export interface Assignee {
  id: string;
  name: string;
  avatarUrl?: string;
  initials: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  assignee?: Assignee;
  tags?: string[];
  dueDate?: string; // ISO string
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}
