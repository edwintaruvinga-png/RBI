import { asyncHandler } from '../../lib/asyncHandler.js';
import {
  createCompany,
  deleteCompany,
  getCompany,
  listCompanies,
  updateCompany,
} from './company.service.js';

export const list = asyncHandler(async (req, res) => {
  const companies = await listCompanies(req.query);
  res.json({ companies });
});

export const getOne = asyncHandler(async (req, res) => {
  const company = await getCompany(req.params.id);
  res.json({ company });
});

export const create = asyncHandler(async (req, res) => {
  const company = await createCompany(req.body);
  res.status(201).json({ company });
});

export const update = asyncHandler(async (req, res) => {
  const company = await updateCompany(req.params.id, req.body);
  res.json({ company });
});

export const remove = asyncHandler(async (req, res) => {
  await deleteCompany(req.params.id);
  res.status(204).send();
});
