import { Router } from 'express';
import { Role } from '@prisma/client';
import { validate } from '../../middleware/validate.js';
import { authenticate, requireRole } from '../../middleware/auth.js';
import {
  countryIdParamSchema,
  createCountrySchema,
  listCountriesSchema,
  updateCountrySchema,
} from './country.schemas.js';
import { create, getOne, list, remove, update } from './country.controller.js';

const router = Router();

// All country routes require authentication.
router.use(authenticate);

// Reads: any authenticated role.
router.get('/', validate(listCountriesSchema), list);
router.get('/:id', validate(countryIdParamSchema), getOne);

// Writes: BROKER or ADMIN only.
const canWrite = requireRole(Role.BROKER, Role.ADMIN);
router.post('/', canWrite, validate(createCountrySchema), create);
router.put('/:id', canWrite, validate(updateCountrySchema), update);
router.delete('/:id', canWrite, validate(countryIdParamSchema), remove);

export default router;
