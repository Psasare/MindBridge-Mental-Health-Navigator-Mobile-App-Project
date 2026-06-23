import express from 'express';
import { processCBTWorksheet } from '../controllers/self-help.controller.js';
import { auth } from '../middleware/auth.middleware.js';
const router = express.Router();
router.use(auth);
router.post('/cbt-reframe', processCBTWorksheet);
export default router;
//# sourceMappingURL=self-help.routes.js.map