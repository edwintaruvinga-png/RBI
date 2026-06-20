import type { ErrorRequestHandler, Request, Response } from 'express';
import { ZodError } from 'zod';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

// jsonwebtoken is CommonJS; its error classes must come off the default export
// to be usable as runtime values (instanceof) under ESM.
const { JsonWebTokenError, TokenExpiredError } = jwt;

/** Operational error with an associated HTTP status code. */
export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({ error: 'Not Found', message: `Cannot ${req.method} ${req.path}` });
};

// Must keep four parameters so Express recognises this as error middleware.
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'ValidationError',
      message: 'Invalid request data',
      details: err.flatten(),
    });
    return;
  }

  if (err instanceof TokenExpiredError) {
    res.status(401).json({ error: 'Unauthorized', message: 'Token expired' });
    return;
  }

  if (err instanceof JsonWebTokenError) {
    res.status(401).json({ error: 'Unauthorized', message: 'Invalid token' });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.name,
      message: err.message,
      ...(err.details ? { details: err.details } : {}),
    });
    return;
  }

  // Unexpected error — log it and return a generic 500.
  console.error(err);
  res.status(500).json({
    error: 'InternalServerError',
    message: 'Something went wrong',
    ...(env.isProduction ? {} : { detail: err instanceof Error ? err.message : String(err) }),
  });
};
