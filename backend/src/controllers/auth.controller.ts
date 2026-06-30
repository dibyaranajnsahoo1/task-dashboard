import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { getDb } from '../db/database';
import type { User } from '../types';

const JWT_SECRET = process.env.JWT_SECRET ?? 'fallback-secret';
const SALT_ROUNDS = 10;

const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(50),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

function signToken(userId: number, username: string): string {
  // JWT contains only what it needs: userId and username
  return jwt.sign({ userId, username }, JWT_SECRET, { expiresIn: '7d' });
}

/**
 * POST /auth/register
 * Accept username + password, hash password, store user, return JWT.
 */
export async function register(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: 'Validation Error',
        message: parsed.error.errors[0].message,
      });
      return;
    }

    const { username, password } = parsed.data;
    const db = getDb();

    // Check if username already exists
    const existing = db
      .prepare('SELECT id FROM users WHERE username = ?')
      .get(username);

    if (existing) {
      res.status(409).json({
        error: 'Conflict',
        message: 'Username is already taken.',
      });
      return;
    }

    // Hash password with bcrypt (never store plaintext)
    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    const result = db
      .prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)')
      .run(username, password_hash);

    const userId = result.lastInsertRowid as number;
    const token = signToken(userId, username);

    res.status(201).json({
      message: 'User registered successfully.',
      token,
      user: { id: userId, username },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /auth/login
 * Validate credentials, return JWT.
 */
export async function login(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: 'Validation Error',
        message: parsed.error.errors[0].message,
      });
      return;
    }

    const { username, password } = parsed.data;
    const db = getDb();

    const user = db
      .prepare('SELECT * FROM users WHERE username = ?')
      .get(username) as unknown as User | undefined;

    if (!user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid username or password.',
      });
      return;
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid username or password.',
      });
      return;
    }

    const token = signToken(user.id, user.username);

    res.status(200).json({
      message: 'Login successful.',
      token,
      user: { id: user.id, username: user.username },
    });
  } catch (err) {
    next(err);
  }
}
