import { Router } from 'express';
import { Role } from '@prisma/client';
import { validate } from '../../middleware/validate.js';
import { authenticate, requireRole } from '../../middleware/auth.js';
import {
  companyIdParamSchema,
  createCompanySchema,
  listCompaniesSchema,
  updateCompanySchema,
} from './company.schemas.js';
import { create, getOne, list, remove, update } from './company.controller.js';

const router = Router();

// All company routes require authentication.
router.use(authenticate);

// Reads: any authenticated role.
router.get('/', validate(listCompaniesSchema), list);
router.get('/:id', validate(companyIdParamSchema), getOne);

// Writes: BROKER or ADMIN only.
const canWrite = requireRole(Role.BROKER, Role.ADMIN);
router.post('/', canWrite, validate(createCompanySchema), create);
router.put('/:id', canWrite, validate(updateCompanySchema), update);
router.delete('/:id', canWrite, validate(companyIdParamSchema), remove);

export default router;
