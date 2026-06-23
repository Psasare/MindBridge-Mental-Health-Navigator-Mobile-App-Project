import { Router } from 'express';
import { getEntries, createEntry } from '../controllers/journal.controller.js';
import { auth } from '../middleware/auth.middleware.js';

const router = Router();

router.use(auth);

router.get('/', getEntries);
router.post('/', createEntry);

export default router;
