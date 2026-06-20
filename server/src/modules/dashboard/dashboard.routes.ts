import { Router } from 'express';
import { validate } from '../../middleware/validate.js';
import { authenticate } from '../../middleware/auth.js';
import { dashboardIdParamSchema } from './dashboard.schemas.js';
import { companyDashboard, countryDashboard, overview } from './dashboard.controller.js';

const router = Router();

// All dashboard routes are read-only and open to any authenticated role.
router.use(authenticate);

router.get('/overview', overview);
router.get('/countries/:id', validate(dashboardIdParamSchema), countryDashboard);
router.get('/companies/:id', validate(dashboardIdParamSchema), companyDashboard);

export default router;
