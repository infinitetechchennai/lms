import { Router } from 'express';
import { getNotes, getNoteById } from './notes.controller.js';

const router = Router();

router.get('/', getNotes);
router.get('/:id', getNoteById);

export default router;

