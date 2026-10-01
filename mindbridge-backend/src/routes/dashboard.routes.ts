import { Router } from 'express';
import { getDashboardAggregate } from '../controllers/dashboard.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

// @route   GET /api/dashboard/aggregate
// @desc    Get all necessary data for the dashboard in a single request (BFF pattern)
// @access  Private
router.get('/aggregate', authenticate, getDashboardAggregate);

export default router;
