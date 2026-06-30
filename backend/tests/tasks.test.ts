import 'dotenv/config';
import request from 'supertest';
import app from '../src/app';
import { initDb, resetDb } from '../src/db/database';
import { runMigrations } from '../src/db/migrate';

let authToken: string;

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  await initDb();
  runMigrations();

  const res = await request(app).post('/auth/register').send({
    username: 'taskuser',
    password: 'password123',
  });
  authToken = res.body.token as string;
});

afterAll(() => {
  resetDb();
});

describe('POST /tasks (protected)', () => {
  it('should return 401 if no token is provided', async () => {
    const res = await request(app).post('/tasks').send({
      title: 'Unauthorized task',
      due_date: '2099-12-31',
    });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Unauthorized');
  });

  it('should return 201 and create a task when authenticated', async () => {
    const res = await request(app)
      .post('/tasks')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Build REST API',
        description: 'Complete the backend assignment',
        priority: 'High',
        status: 'In Progress',
        due_date: '2099-12-31',
        tags: ['backend', 'api'],
      });

    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe('Build REST API');
    expect(res.body.data.priority).toBe('High');
    expect(res.body.data.tags).toEqual(['backend', 'api']);
    expect(res.body.data).toHaveProperty('id');
  });

  it('should return 400 if title is missing', async () => {
    const res = await request(app)
      .post('/tasks')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ description: 'No title', due_date: '2099-12-31' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation Error');
    expect(res.body.message).toContain('Title');
  });

  it('should return 400 if due_date is missing', async () => {
    const res = await request(app)
      .post('/tasks')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ title: 'No due date task' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation Error');
  });
});

describe('GET /tasks', () => {
  it('should return a list of tasks with count', async () => {
    const res = await request(app).get('/tasks');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(typeof res.body.count).toBe('number');
  });

  it('should filter tasks by status', async () => {
    await request(app)
      .post('/tasks')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ title: 'Done task', status: 'Done', due_date: '2099-01-01' });

    const res = await request(app).get('/tasks?status=Done');

    expect(res.status).toBe(200);
    res.body.data.forEach((task: { status: string }) => {
      expect(task.status).toBe('Done');
    });
  });
});

describe('GET /tasks/:id', () => {
  it('should return 404 for a non-existent task ID', async () => {
    const res = await request(app).get('/tasks/non-existent-uuid-00000');

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Not Found');
  });

  it('should return a task by ID', async () => {
    const created = await request(app)
      .post('/tasks')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ title: 'Find me by ID', due_date: '2099-06-01' });

    const taskId = created.body.data.id as string;
    const res = await request(app).get(`/tasks/${taskId}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(taskId);
    expect(res.body.data.title).toBe('Find me by ID');
  });
});

describe('PUT /tasks/:id (protected)', () => {
  it('should update a task and return updated data', async () => {
    const created = await request(app)
      .post('/tasks')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ title: 'Original Title', due_date: '2099-06-01' });

    const taskId = created.body.data.id as string;

    const res = await request(app)
      .put(`/tasks/${taskId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ title: 'Updated Title', status: 'Done' });

    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe('Updated Title');
    expect(res.body.data.status).toBe('Done');
  });

  it('should return 401 without a token', async () => {
    const res = await request(app).put('/tasks/some-id').send({ title: 'Hacked' });
    expect(res.status).toBe(401);
  });
});

describe('DELETE /tasks/:id (protected)', () => {
  it('should delete a task and return 204, then 404 on re-fetch', async () => {
    const created = await request(app)
      .post('/tasks')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ title: 'Delete me', due_date: '2099-01-01' });

    const taskId = created.body.data.id as string;

    const del = await request(app)
      .delete(`/tasks/${taskId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(del.status).toBe(204);

    const get = await request(app).get(`/tasks/${taskId}`);
    expect(get.status).toBe(404);
  });

  it('should return 401 without a token', async () => {
    const res = await request(app).delete('/tasks/some-id');
    expect(res.status).toBe(401);
  });
});
