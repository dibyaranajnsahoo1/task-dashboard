import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import type { JwtPayload } from '../types';

const JWT_SECRET = process.env.JWT_SECRET ?? 'fallback-secret';

/**
 * Middleware that verifies the Bearer JWT on protected routes.
 * Attaches the decoded payload to req.user.
 * Returns 401 if the token is missing or invalid.
 */
export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'A valid Bearer token is required.',
    });
    return;
  }

  const token = authHeader.slice(7);

  try {
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.user = payload;
    next();
  } catch {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Token is invalid or has expired.',
    });
  }
}
