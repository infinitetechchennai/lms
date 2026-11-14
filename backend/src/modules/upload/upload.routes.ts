import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { handleFileUpload } from './upload.controller.js';
import { authenticateToken } from '../../middleware/auth.js';

const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const sanitizedBase = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9-_]/g, '_')
      .slice(0, 50);
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    cb(null, `${sanitizedBase}-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 250 * 1024 * 1024, // 250MB for video lectures & textbooks
  },
});

const router = Router();

// Endpoint for uploading files (PDF documents, video files, images)
router.post('/', authenticateToken, upload.single('file'), handleFileUpload);

export default router;

