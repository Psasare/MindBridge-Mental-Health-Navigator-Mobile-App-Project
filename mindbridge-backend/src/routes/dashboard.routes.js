import { Router } from 'express';
import { getDashboardAggregate } from '../controllers/dashboard.controller.js';
import { auth } from '../middleware/auth.middleware.js';
const router = Router();
router.get('/aggregate', auth, getDashboardAggregate);
export default router;
//# sourceMappingURL=dashboard.routes.js.map