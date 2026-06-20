import { asyncHandler } from '../../lib/asyncHandler.js';
import {
  getCompanyDashboard,
  getCountryDashboard,
  getOverview,
} from './dashboard.service.js';

export const overview = asyncHandler(async (_req, res) => {
  res.json(await getOverview());
});

export const countryDashboard = asyncHandler(async (req, res) => {
  res.json(await getCountryDashboard(req.params.id));
});

export const companyDashboard = asyncHandler(async (req, res) => {
  res.json(await getCompanyDashboard(req.params.id));
});
