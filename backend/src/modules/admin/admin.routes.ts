import { Router } from 'express';
import {
  getAdminPlatformStats,
  getStudentsList,
  toggleStudentStatus,
  createChapter,
  getAdminChaptersList,
  updateChapter,
  deleteChapter,
  createNote,
  getAdminNotesList,
  updateNote,
  deleteNote,
  createQuestion,
  getAdminQuestionsList,
  updateQuestion,
  deleteQuestion,
  bulkImportQuestions,
  createVideo,
  getAdminVideosList,
  updateVideo,
  deleteVideo,
  getAdminPlansList,
  createAdminPlan,
  updateAdminPlan,
  deleteAdminPlan,
} from './admin.controller.js';
import { authenticateToken, requireRole } from '../../middleware/auth.js';

const router = Router();

// Protect all admin endpoints with JWT & ADMIN role check
router.use(authenticateToken);
router.use(requireRole(['ADMIN']));

// Overview & Students
router.get('/stats', getAdminPlatformStats);
router.get('/students', getStudentsList);
router.patch('/students/:userId/toggle-status', toggleStudentStatus);

// Chapters CRUD
router.get('/chapters-list', getAdminChaptersList);
router.post('/chapters', createChapter);
router.put('/chapters/:id', updateChapter);
router.delete('/chapters/:id', deleteChapter);

// Notes CRUD
router.get('/notes-list', getAdminNotesList);
router.post('/notes', createNote);
router.put('/notes/:id', updateNote);
router.delete('/notes/:id', deleteNote);

// Questions CRUD & CSV Import
router.get('/questions-list', getAdminQuestionsList);
router.post('/questions', createQuestion);
router.put('/questions/:id', updateQuestion);
router.delete('/questions/:id', deleteQuestion);
router.post('/questions/bulk-import', bulkImportQuestions);

// Videos CRUD
router.get('/videos-list', getAdminVideosList);
router.post('/videos', createVideo);
router.put('/videos/:id', updateVideo);
router.delete('/videos/:id', deleteVideo);

// Study Plans CRUD
router.get('/plans-list', getAdminPlansList);
router.post('/plans', createAdminPlan);
router.put('/plans/:id', updateAdminPlan);
router.delete('/plans/:id', deleteAdminPlan);

export default router;
