import { Router } from 'express';
import { getGroups, seedGroups } from '../controllers/groups.controller.js';
const router = Router();
// Routes
router.get('/', getGroups);
router.post('/seed', seedGroups);
export default router;
//# sourceMappingURL=groups.routes.js.map