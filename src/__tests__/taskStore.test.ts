import { describe, it, expect, beforeEach } from 'vitest';
import { useTaskStore } from '../store/taskStore';

describe('taskStore', () => {
  beforeEach(() => {
    // Clear the store before each test
    useTaskStore.setState({ tasks: [] });
  });

  it('should add a new task', () => {
    const store = useTaskStore.getState();
    const newTask = {
      title: 'Test Task',
      description: 'Test Description',
      priority: 'High' as const,
      status: 'To Do' as const,
    };

    store.addTask(newTask);

    const updatedStore = useTaskStore.getState();
    expect(updatedStore.tasks.length).toBe(1);
    expect(updatedStore.tasks[0].title).toBe('Test Task');
    expect(updatedStore.tasks[0].status).toBe('To Do');
    expect(updatedStore.tasks[0].id).toBeDefined();
    expect(updatedStore.tasks[0].createdAt).toBeDefined();
  });

  it('should delete a task', () => {
    // Setup
    useTaskStore.getState().addTask({
      title: 'Task to delete',
      description: '',
      priority: 'Low',
      status: 'To Do',
    });
    
    const storeWithTask = useTaskStore.getState();
    const taskId = storeWithTask.tasks[0].id;

    // Execute
    storeWithTask.deleteTask(taskId);

    // Assert
    const updatedStore = useTaskStore.getState();
    expect(updatedStore.tasks.length).toBe(0);
  });

  it('should update a task', () => {
    // Setup
    useTaskStore.getState().addTask({
      title: 'Task to update',
      description: 'Old description',
      priority: 'Low',
      status: 'To Do',
    });
    
    const store = useTaskStore.getState();
    const taskId = store.tasks[0].id;

    // Execute
    store.updateTask(taskId, { title: 'Updated Title', status: 'Done' });

    // Assert
    const updatedStore = useTaskStore.getState();
    expect(updatedStore.tasks[0].title).toBe('Updated Title');
    expect(updatedStore.tasks[0].status).toBe('Done');
    expect(updatedStore.tasks[0].description).toBe('Old description'); // Should remain unchanged
  });

  it('should move a task between statuses', () => {
    // Setup
    useTaskStore.getState().addTask({
      title: 'Task to move',
      description: '',
      priority: 'Low',
      status: 'To Do',
    });
    
    const store = useTaskStore.getState();
    const taskId = store.tasks[0].id;

    // Execute
    store.moveTask(taskId, 'In Progress');

    // Assert
    const updatedStore = useTaskStore.getState();
    expect(updatedStore.tasks[0].status).toBe('In Progress');
  });
});
