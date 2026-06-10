import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Task, Status } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { ASSIGNEES } from '../data/assignees';

interface TaskState {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Task;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  moveTask: (id: string, newStatus: Status, newIndex?: number) => void;
}

const getDueDate = (daysFromNow: number) =>
  new Date(Date.now() + daysFromNow * 24 * 60 * 60 * 1000).toISOString();

const mockTasks: Task[] = [
  {
    id: uuidv4(),
    title: 'Research Competitors',
    description: 'Look into similar products in the market to understand common patterns and missing features.',
    priority: 'Medium',
    status: 'To Do',
    assignee: ASSIGNEES[1],
    dueDate: getDueDate(3),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    title: 'Design System Setup',
    description: 'Set up MUI theme, typography, and color palette in the codebase.',
    priority: 'High',
    status: 'In Progress',
    assignee: ASSIGNEES[0],
    dueDate: getDueDate(1),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    title: 'Initial Project Scaffold',
    description: 'Create Vite project with React and TypeScript.',
    priority: 'Low',
    status: 'Done',
    assignee: ASSIGNEES[2],
    dueDate: getDueDate(7),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

export const useTaskStore = create<TaskState>()(
  persist(
    (set) => ({
      tasks: mockTasks,
      addTask: (task) => {
        const newTask: Task = {
          ...task,
          id: uuidv4(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({ tasks: [...state.tasks, newTask] }));
        return newTask;
      },
      updateTask: (id, updates) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? { ...task, ...updates, updatedAt: new Date().toISOString() }
              : task
          ),
        })),
      deleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        })),
      moveTask: (id, newStatus, newIndex) =>
        set((state) => {
          const taskToMove = state.tasks.find((t) => t.id === id);
          if (!taskToMove) return state;

          const updatedTask = { ...taskToMove, status: newStatus, updatedAt: new Date().toISOString() };
          const otherTasks = state.tasks.filter((t) => t.id !== id);
          
          if (typeof newIndex === 'number') {
            const statusTasks = otherTasks.filter(t => t.status === newStatus);
            const nonStatusTasks = otherTasks.filter(t => t.status !== newStatus);
            
            statusTasks.splice(newIndex, 0, updatedTask);
            
            return {
              tasks: [...nonStatusTasks, ...statusTasks],
            };
          }

          return {
            tasks: [...otherTasks, updatedTask],
          };
        }),
    }),
    {
      name: 'task-storage',
    }
  )
);
