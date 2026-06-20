import { Router } from 'express';
import { Role } from '@prisma/client';
import { validate } from '../../middleware/validate.js';
import { authenticate, requireRole } from '../../middleware/auth.js';
import {
  createReportSchema,
  listReportsSchema,
  reportIdParamSchema,
  updateReportSchema,
} from './report.schemas.js';
import { create, getOne, list, remove, update } from './report.controller.js';

const router = Router();

// All report routes require authentication.
router.use(authenticate);

// Reads: any authenticated role.
router.get('/', validate(listReportsSchema), list);
router.get('/:id', validate(reportIdParamSchema), getOne);

// Writes: BROKER or ADMIN only.
const canWrite = requireRole(Role.BROKER, Role.ADMIN);
router.post('/', canWrite, validate(createReportSchema), create);
router.put('/:id', canWrite, validate(updateReportSchema), update);
router.delete('/:id', canWrite, validate(reportIdParamSchema), remove);

export default router;
