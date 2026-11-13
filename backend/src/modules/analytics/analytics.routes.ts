import { Router } from 'express';
import { getStudentAnalytics } from './analytics.controller.js';
import { authenticateToken } from '../../middleware/auth.js';

const router = Router();

router.use(authenticateToken);
router.get('/dashboard', getStudentAnalytics);

export default router;

