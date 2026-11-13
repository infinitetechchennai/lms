import { Router } from 'express';
import { getVideos, toggleFavoriteVideo, recordVideoView } from './videos.controller.js';
import { authenticateToken } from '../../middleware/auth.js';

const router = Router();

router.get('/', authenticateToken, getVideos);
router.post('/:id/favorite', authenticateToken, toggleFavoriteVideo);
router.post('/:id/view', authenticateToken, recordVideoView);

export default router;

