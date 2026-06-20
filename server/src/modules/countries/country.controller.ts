import { asyncHandler } from '../../lib/asyncHandler.js';
import {
  createCountry,
  deleteCountry,
  getCountry,
  listCountries,
  updateCountry,
} from './country.service.js';

export const list = asyncHandler(async (req, res) => {
  const countries = await listCountries(req.query);
  res.json({ countries });
});

export const getOne = asyncHandler(async (req, res) => {
  const country = await getCountry(req.params.id);
  res.json({ country });
});

export const create = asyncHandler(async (req, res) => {
  const country = await createCountry(req.body);
  res.status(201).json({ country });
});

export const update = asyncHandler(async (req, res) => {
  const country = await updateCountry(req.params.id, req.body);
  res.json({ country });
});

export const remove = asyncHandler(async (req, res) => {
  await deleteCountry(req.params.id);
  res.status(204).send();
});
