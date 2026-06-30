import 'dotenv/config';
import request from 'supertest';
import app from '../src/app';
import { initDb, resetDb } from '../src/db/database';
import { runMigrations } from '../src/db/migrate';

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  await initDb();
  runMigrations();
});

afterAll(() => {
  resetDb();
});

describe('POST /auth/register', () => {
  it('should register a new user and return 201 with a JWT', async () => {
    const res = await request(app).post('/auth/register').send({
      username: 'testuser',
      password: 'password123',
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.username).toBe('testuser');
    expect(typeof res.body.token).toBe('string');
  });

  it('should return 409 if username is already taken', async () => {
    await request(app).post('/auth/register').send({
      username: 'duplicate_user',
      password: 'password123',
    });

    const res = await request(app).post('/auth/register').send({
      username: 'duplicate_user',
      password: 'anotherpassword',
    });

    expect(res.status).toBe(409);
    expect(res.body.error).toBe('Conflict');
  });

  it('should return 400 if password is too short', async () => {
    const res = await request(app).post('/auth/register').send({
      username: 'validuser',
      password: '123',
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation Error');
    expect(res.body.message).toContain('Password');
  });
});

describe('POST /auth/login', () => {
  beforeAll(async () => {
    await request(app).post('/auth/register').send({
      username: 'loginuser',
      password: 'correctpassword',
    });
  });

  it('should return 200 with a JWT on valid credentials', async () => {
    const res = await request(app).post('/auth/login').send({
      username: 'loginuser',
      password: 'correctpassword',
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.username).toBe('loginuser');
  });

  it('should return 401 on wrong password', async () => {
    const res = await request(app).post('/auth/login').send({
      username: 'loginuser',
      password: 'wrongpassword',
    });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Unauthorized');
  });
});
