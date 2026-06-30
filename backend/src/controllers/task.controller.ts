import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../db/database';
import type { Task } from '../types';

// ── Validation schemas ──────────────────────────────────────────────────────

const createTaskSchema = z.object({
  title: z.string({ required_error: 'Title is required' }).min(1, 'Title is required').max(200),
  description: z.string().max(2000).optional().default(''),
  priority: z.enum(['Low', 'Medium', 'High']).optional().default('Medium'),
  status: z.enum(['To Do', 'In Progress', 'Done']).optional().default('To Do'),
  due_date: z.string({ required_error: 'Due date is required' }).min(1, 'Due date is required'),
  assignee_name: z.string().max(100).optional().nullable(),
  assignee_initials: z.string().max(3).optional().nullable(),
  tags: z.array(z.string()).optional().default([]),
});

const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  priority: z.enum(['Low', 'Medium', 'High']).optional(),
  status: z.enum(['To Do', 'In Progress', 'Done']).optional(),
  due_date: z.string().optional().nullable(),
  assignee_name: z.string().max(100).optional().nullable(),
  assignee_initials: z.string().max(3).optional().nullable(),
  tags: z.array(z.string()).optional(),
});

// Query params for listing tasks
const listQuerySchema = z.object({
  status: z.enum(['To Do', 'In Progress', 'Done']).optional(),
  priority: z.enum(['Low', 'Medium', 'High']).optional(),
  sort: z.enum(['created_at', 'due_date', 'updated_at']).optional().default('created_at'),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
});

// Helper to parse tags JSON safely
function parseTags(tagsJson: string): string[] {
  try {
    return JSON.parse(tagsJson) as string[];
  } catch {
    return [];
  }
}

function formatTask(row: Task): object {
  return {
    ...row,
    tags: parseTags(row.tags),
  };
}

// ── Controllers ─────────────────────────────────────────────────────────────

/**
 * GET /tasks
 * List all tasks with optional filtering by status/priority and sorting.
 */
export function listTasks(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    const parsed = listQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({
        error: 'Validation Error',
        message: parsed.error.errors[0].message,
      });
      return;
    }

    const { status, priority, sort, order } = parsed.data;
    const db = getDb();

    const conditions: string[] = [];
    const params: string[] = [];

    if (status) {
      conditions.push('status = ?');
      params.push(status);
    }
    if (priority) {
      conditions.push('priority = ?');
      params.push(priority);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    // sort and order are validated by zod — safe to interpolate
    const sql = `SELECT * FROM tasks ${where} ORDER BY ${sort} ${order.toUpperCase()}`;

    const rows = db.prepare(sql).all(...params) as unknown as Task[];
    res.status(200).json({ data: rows.map(formatTask), count: rows.length });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /tasks/:id
 * Get a single task by ID.
 */
export function getTask(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    const db = getDb();
    const row = db
      .prepare('SELECT * FROM tasks WHERE id = ?')
      .get(req.params.id) as unknown as Task | undefined;

    if (!row) {
      res.status(404).json({
        error: 'Not Found',
        message: `Task with id '${req.params.id}' does not exist.`,
      });
      return;
    }

    res.status(200).json({ data: formatTask(row) });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /tasks  (protected)
 * Create a new task.
 */
export function createTask(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    const parsed = createTaskSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: 'Validation Error',
        message: parsed.error.errors[0].message,
      });
      return;
    }

    const data = parsed.data;
    const db = getDb();
    const id = uuidv4();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO tasks
        (id, title, description, priority, status, due_date,
         assignee_name, assignee_initials, tags, created_by, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      data.title,
      data.description,
      data.priority,
      data.status,
      data.due_date ?? null,
      data.assignee_name ?? null,
      data.assignee_initials ?? null,
      JSON.stringify(data.tags),
      req.user!.userId,
      now,
      now,
    );

    const created = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as unknown as Task;
    res.status(201).json({ data: formatTask(created) });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /tasks/:id  (protected)
 * Update an existing task (partial update).
 */
export function updateTask(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    const db = getDb();
    const existing = db
      .prepare('SELECT * FROM tasks WHERE id = ?')
      .get(req.params.id) as unknown as Task | undefined;

    if (!existing) {
      res.status(404).json({
        error: 'Not Found',
        message: `Task with id '${req.params.id}' does not exist.`,
      });
      return;
    }

    const parsed = updateTaskSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: 'Validation Error',
        message: parsed.error.errors[0].message,
      });
      return;
    }

    const data = parsed.data;
    const now = new Date().toISOString();

    // Build dynamic SET clause from provided fields only
    const setClauses: string[] = ['updated_at = ?'];
    const params: unknown[] = [now];

    if (data.title !== undefined) { setClauses.push('title = ?'); params.push(data.title); }
    if (data.description !== undefined) { setClauses.push('description = ?'); params.push(data.description); }
    if (data.priority !== undefined) { setClauses.push('priority = ?'); params.push(data.priority); }
    if (data.status !== undefined) { setClauses.push('status = ?'); params.push(data.status); }
    if (data.due_date !== undefined) { setClauses.push('due_date = ?'); params.push(data.due_date); }
    if (data.assignee_name !== undefined) { setClauses.push('assignee_name = ?'); params.push(data.assignee_name); }
    if (data.assignee_initials !== undefined) { setClauses.push('assignee_initials = ?'); params.push(data.assignee_initials); }
    if (data.tags !== undefined) { setClauses.push('tags = ?'); params.push(JSON.stringify(data.tags)); }

    params.push(req.params.id);

    db.prepare(`UPDATE tasks SET ${setClauses.join(', ')} WHERE id = ?`).run(...params);

    const updated = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id) as unknown as Task;
    res.status(200).json({ data: formatTask(updated) });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /tasks/:id  (protected)
 * Delete a task by ID.
 */
export function deleteTask(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    const db = getDb();
    const existing = db
      .prepare('SELECT id FROM tasks WHERE id = ?')
      .get(req.params.id);

    if (!existing) {
      res.status(404).json({
        error: 'Not Found',
        message: `Task with id '${req.params.id}' does not exist.`,
      });
      return;
    }

    db.prepare('DELETE FROM tasks WHERE id = ?').run(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
