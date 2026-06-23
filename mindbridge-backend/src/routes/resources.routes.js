import { Router } from 'express';
import { getResources, getRecommendedResources, trackResourceInteraction } from '../controllers/resources.controller.js';
import { auth } from '../middleware/auth.middleware.js';
const router = Router();
router.use(auth);
router.get('/', getResources);
router.get('/recommendations', getRecommendedResources);
router.post('/interact', trackResourceInteraction);
export default router;
//# sourceMappingURL=resources.routes.js.map