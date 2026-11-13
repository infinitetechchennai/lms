import { Router } from 'express';
import {
  getFlashcards,
  createFlashcard,
  updateFlashcard,
  deleteFlashcard,
  reviewFlashcard,
  createFolder,
} from './flashcards.controller.js';
import { authenticateToken } from '../../middleware/auth.js';

const router = Router();

router.use(authenticateToken);
router.get('/', getFlashcards);
router.post('/', createFlashcard);
router.put('/:id', updateFlashcard);
router.delete('/:id', deleteFlashcard);
router.post('/:id/review', reviewFlashcard);
router.post('/folders', createFolder);

export default router;

