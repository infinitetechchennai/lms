import { Router } from 'express';
import { getAllSubjects, getChaptersBySubject, getChapterDetails } from './subjects.controller.js';

const router = Router();

router.get('/', getAllSubjects);
router.get('/:subjectCode/chapters', getChaptersBySubject);
router.get('/chapters/:idOrSlug', getChapterDetails);

export default router;

