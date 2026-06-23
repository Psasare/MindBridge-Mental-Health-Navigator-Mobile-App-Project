import { Router } from 'express';
import { getFeed, createPost, toggleHug } from '../controllers/community.controller.js';
import { auth } from '../middleware/auth.middleware.js';
const router = Router();
router.use(auth);
router.get('/', getFeed);
router.post('/', createPost);
router.post('/:postId/hug', toggleHug);
export default router;
//# sourceMappingURL=community.routes.js.map