import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Role, type Prisma } from '@prisma/client';
import { env } from '../../config/env.js';
import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../middleware/error.js';
import type { LoginInput, RegisterInput } from './auth.schemas.js';

const SALT_ROUNDS = 10;

/** Fields safe to return to clients — never includes the password hash. */
const publicUserSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

export type PublicUser = Prisma.UserGetPayload<{ select: typeof publicUserSelect }>;

function signToken(user: { id: string; role: Role }): string {
  const options: jwt.SignOptions = {
    subject: user.id,
    expiresIn: env.jwtExpiresIn as jwt.SignOptions['expiresIn'],
  };
  return jwt.sign({ role: user.role }, env.jwtSecret, options);
}

export async function registerUser(
  input: RegisterInput,
): Promise<{ user: PublicUser; token: string }> {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new AppError(409, 'Email is already registered');
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

  // New self-service accounts always start as VIEWER; elevating a role is an
  // administrative action and is intentionally not part of registration.
  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      password: passwordHash,
      role: Role.VIEWER,
    },
    select: publicUserSelect,
  });

  return { user, token: signToken(user) };
}

export async function loginUser(
  input: LoginInput,
): Promise<{ user: PublicUser; token: string }> {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) {
    throw new AppError(401, 'Invalid email or password');
  }

  const passwordMatches = await bcrypt.compare(input.password, user.password);
  if (!passwordMatches) {
    throw new AppError(401, 'Invalid email or password');
  }

  const { password: _password, ...publicUser } = user;
  return { user: publicUser, token: signToken(user) };
}

export async function getUserById(id: string): Promise<PublicUser> {
  const user = await prisma.user.findUnique({ where: { id }, select: publicUserSelect });
  if (!user) {
    throw new AppError(404, 'User not found');
  }
  return user;
}
