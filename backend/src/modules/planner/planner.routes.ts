import { Router } from 'express';
import {
  getPersonalTasks,
  createPersonalTask,
  toggleTaskCompletion,
  deleteTask,
  getCuratedPlans,
} from './planner.controller.js';
import { authenticateToken } from '../../middleware/auth.js';

const router = Router();

router.use(authenticateToken);
router.get('/tasks', getPersonalTasks);
router.post('/tasks', createPersonalTask);
router.patch('/tasks/:id/toggle', toggleTaskCompletion);
router.delete('/tasks/:id', deleteTask);
router.get('/curated-plans', getCuratedPlans);

export default router;

