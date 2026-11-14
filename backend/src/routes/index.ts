import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes.js';
import subjectsRoutes from '../modules/subjects/subjects.routes.js';
import notesRoutes from '../modules/notes/notes.routes.js';
import pyqRoutes from '../modules/pyq/pyq.routes.js';
import bookmarksRoutes from '../modules/bookmarks/bookmarks.routes.js';
import flashcardsRoutes from '../modules/flashcards/flashcards.routes.js';
import plannerRoutes from '../modules/planner/planner.routes.js';
import videosRoutes from '../modules/videos/videos.routes.js';
import analyticsRoutes from '../modules/analytics/analytics.routes.js';
import adminRoutes from '../modules/admin/admin.routes.js';
import uploadRoutes from '../modules/upload/upload.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/subjects', subjectsRoutes);
router.use('/notes', notesRoutes);
router.use('/pyq', pyqRoutes);
router.use('/bookmarks', bookmarksRoutes);
router.use('/flashcards', flashcardsRoutes);
router.use('/planner', plannerRoutes);
router.use('/videos', videosRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/admin', adminRoutes);
router.use('/upload', uploadRoutes);

router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Smartway EdTech Platform API',
    version: '1.0.0',
  });
});

export default router;

