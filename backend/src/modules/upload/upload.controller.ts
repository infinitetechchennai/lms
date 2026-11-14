import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../../utils/response.js';

export async function handleFileUpload(req: Request, res: Response) {
  try {
    if (!req.file) {
      return sendError(res, 'No file was uploaded', 400);
    }

    const host = req.get('host') || 'localhost:5000';
    const protocol = req.protocol || 'http';
    const relativeUrl = `/uploads/${req.file.filename}`;
    const fullUrl = `${protocol}://${host}${relativeUrl}`;

    return sendSuccess(
      res,
      {
        fileUrl: fullUrl,
        relativeUrl,
        fileName: req.file.originalname,
        fileSizeBytes: req.file.size,
        mimeType: req.file.mimetype,
      },
      'File uploaded successfully',
      201
    );
  } catch (err: any) {
    return sendError(res, 'File upload failed', 500, err.message);
  }
}

