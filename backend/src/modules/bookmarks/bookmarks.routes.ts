import { Router } from 'express';
import { getBookmarks, toggleBookmark, removeBookmark } from './bookmarks.controller.js';
import { authenticateToken } from '../../middleware/auth.js';

const router = Router();

router.use(authenticateToken);
router.get('/', getBookmarks);
router.post('/toggle', toggleBookmark);
router.delete('/:id', removeBookmark);

export default router;

