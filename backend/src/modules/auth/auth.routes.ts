import { Router } from 'express';
import { register, login, getCurrentUser, updateProfile } from './auth.controller.js';
import { validateBody } from '../../middleware/validate.js';
import { registerSchema, loginSchema, updateProfileSchema } from './auth.validation.js';
import { authenticateToken } from '../../middleware/auth.js';
import { authLimiter } from '../../middleware/rateLimiter.js';

const router = Router();

router.post('/register', authLimiter, validateBody(registerSchema), register);
router.post('/login', authLimiter, validateBody(loginSchema), login);
router.get('/me', authenticateToken, getCurrentUser);
router.put('/profile', authenticateToken, validateBody(updateProfileSchema), updateProfile);

export default router;

