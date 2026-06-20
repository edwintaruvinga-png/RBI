import { asyncHandler } from '../../lib/asyncHandler.js';
import { getUserById, loginUser, registerUser } from './auth.service.js';

export const register = asyncHandler(async (req, res) => {
  const result = await registerUser(req.body);
  res.status(201).json(result);
});

export const login = asyncHandler(async (req, res) => {
  const result = await loginUser(req.body);
  res.json(result);
});

export const me = asyncHandler(async (req, res) => {
  // `authenticate` guarantees req.user is set before this handler runs.
  const user = await getUserById(req.user!.id);
  res.json({ user });
});
