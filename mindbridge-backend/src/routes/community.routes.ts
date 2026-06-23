import { Router } from 'express';
import { getFeed, createPost, toggleHug } from '../controllers/community.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.use(requireAuth);

router.get('/', getFeed);
router.post('/', createPost);
router.post('/:postId/hug', toggleHug);

export default router;
