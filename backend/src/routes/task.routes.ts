import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import {
  listTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
} from '../controllers/task.controller';

const router = Router();

// Public routes
router.get('/', listTasks);
router.get('/:id', getTask);

// Protected routes — require valid JWT
router.post('/', requireAuth, createTask);
router.put('/:id', requireAuth, updateTask);
router.delete('/:id', requireAuth, deleteTask);

export default router;
