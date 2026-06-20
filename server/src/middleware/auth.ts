import type { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import type { Role } from '@prisma/client';
import { env } from '../config/env.js';
import { prisma } from '../lib/prisma.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { AppError } from './error.js';

interface AuthTokenPayload extends jwt.JwtPayload {
  sub: string;
  role: Role;
}

/**
 * Verifies the `Authorization: Bearer <token>` header, loads the user, and
 * attaches it to `req.user`. JWT verification errors are forwarded to the
 * error handler (which maps them to 401 responses).
 */
export const authenticate: RequestHandler = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    throw new AppError(401, 'Missing or malformed Authorization header');
  }

  const token = header.slice('Bearer '.length).trim();
  const payload = jwt.verify(token, env.jwtSecret) as AuthTokenPayload;

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, email: true, role: true },
  });

  if (!user) {
    throw new AppError(401, 'User no longer exists');
  }

  req.user = user;
  next();
});

/**
 * Guard that allows the request through only if the authenticated user has one
 * of the given roles. Use after `authenticate`.
 */
export const requireRole =
  (...roles: Role[]): RequestHandler =>
  (req, _res, next) => {
    if (!req.user) {
      next(new AppError(401, 'Not authenticated'));
      return;
    }
    if (!roles.includes(req.user.role)) {
      next(new AppError(403, 'Insufficient permissions'));
      return;
    }
    next();
  };
