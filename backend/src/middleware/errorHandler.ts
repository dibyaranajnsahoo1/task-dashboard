import { Request, Response, NextFunction } from 'express';

interface AppError extends Error {
  statusCode?: number;
}

/**
 * Global error handler — catches anything passed via next(err).
 * Ensures all error responses follow the same JSON shape.
 */
export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = err.statusCode ?? 500;
  const message =
    statusCode === 500 && process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred.'
      : err.message;

  if (statusCode === 500) {
    console.error('SERVER ERROR:', err);
  }

  res.status(statusCode).json({
    error: statusCode === 500 ? 'Internal Server Error' : 'Error',
    message,
  });
}
