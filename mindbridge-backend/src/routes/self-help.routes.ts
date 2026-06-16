import express from 'express';
import { processCBTWorksheet } from '../controllers/self-help.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.post('/cbt-reframe', processCBTWorksheet);

export default router;
