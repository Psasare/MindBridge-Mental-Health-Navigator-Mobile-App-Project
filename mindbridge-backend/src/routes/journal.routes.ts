import { Router } from 'express';
import { getEntries, createEntry, deleteEntry } from '../controllers/journal.controller.js';
import { auth } from '../middleware/auth.middleware.js';

const router = Router();

router.use(auth);

router.get('/', getEntries);
router.post('/', createEntry);
router.delete('/:id', deleteEntry);

export default router;
