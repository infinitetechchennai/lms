import { Router } from 'express';
import {
  getQuestions,
  getQuestionById,
  attemptQuestion,
  getAttemptHistory,
} from './pyq.controller.js';
import { authenticateToken } from '../../middleware/auth.js';

const router = Router();

router.get('/questions', authenticateToken, getQuestions);
router.get('/questions/:id', authenticateToken, getQuestionById);
router.post('/questions/:id/attempt', authenticateToken, attemptQuestion);
router.get('/attempts/history', authenticateToken, getAttemptHistory);

export default router;

