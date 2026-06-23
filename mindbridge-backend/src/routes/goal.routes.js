import express from 'express';
import { getDailyGoals, completeGoal, getGamificationStatus } from '../controllers/goal.controller.js';
import { auth } from '../middleware/auth.middleware.js';
const router = express.Router();
router.use(auth);
router.get('/daily', getDailyGoals);
router.post('/complete', completeGoal);
router.get('/gamification', getGamificationStatus);
export default router;
//# sourceMappingURL=goal.routes.js.map