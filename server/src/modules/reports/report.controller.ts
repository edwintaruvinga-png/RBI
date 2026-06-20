import { asyncHandler } from '../../lib/asyncHandler.js';
import {
  createReport,
  deleteReport,
  getReport,
  listReports,
  updateReport,
} from './report.service.js';
import type { ListReportsQuery } from './report.schemas.js';

export const list = asyncHandler(async (req, res) => {
  const reports = await listReports(req.query as unknown as ListReportsQuery);
  res.json({ reports });
});

export const getOne = asyncHandler(async (req, res) => {
  const report = await getReport(req.params.id);
  res.json({ report });
});

export const create = asyncHandler(async (req, res) => {
  // authorId comes from the authenticated user, never the request body.
  const report = await createReport(req.body, req.user!.id);
  res.status(201).json({ report });
});

export const update = asyncHandler(async (req, res) => {
  const report = await updateReport(req.params.id, req.body);
  res.json({ report });
});

export const remove = asyncHandler(async (req, res) => {
  await deleteReport(req.params.id);
  res.status(204).send();
});
