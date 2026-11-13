import { Request, Response } from 'express';
import { prisma } from '../../db.js';
import { sendSuccess, sendError } from '../../utils/response.js';
import { AuthenticatedRequest } from '../../middleware/auth.js';

export async function getNotes(req: Request, res: Response) {
  try {
    const { subjectCode, targetClass, chapterId, search, page = '1', limit = '20' } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {
      isPublished: true,
    };

    if (chapterId) {
      where.chapterId = chapterId as string;
    }

    if (subjectCode || targetClass) {
      where.chapter = {};
      if (subjectCode) {
        where.chapter.subject = {
          code: (subjectCode as string).toUpperCase(),
        };
      }
      if (targetClass) {
        where.chapter.targetClass = targetClass as string;
      }
    }

    if (search) {
      where.OR = [
        { title: { contains: search as string } },
        { summary: { contains: search as string } },
      ];
    }

    const [total, notes] = await Promise.all([
      prisma.note.count({ where }),
      prisma.note.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          chapter: {
            include: {
              subject: true,
            },
          },
          topic: true,
          files: true,
        },
      }),
    ]);

    return sendSuccess(res, notes, 'Notes retrieved successfully', 200, {
      page: pageNum,
      limit: limitNum,
      total,
    });
  } catch (err: any) {
    return sendError(res, 'Failed to retrieve notes', 500, err.message);
  }
}

export async function getNoteById(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;

    const note = await prisma.note.findUnique({
      where: { id },
      include: {
        chapter: {
          include: {
            subject: true,
          },
        },
        topic: true,
        files: true,
      },
    });

    if (!note) {
      return sendError(res, 'Note not found', 404);
    }

    // Increment views asynchronously
    await prisma.note.update({
      where: { id },
      data: { viewsCount: { increment: 1 } },
    });

    // Log telemetry if student is logged in
    if (req.user?.studentProfileId) {
      await prisma.userActivity.create({
        data: {
          studentId: req.user.studentProfileId,
          actionType: 'VIEW_NOTE',
          title: `Viewed note: ${note.title}`,
          metadata: JSON.stringify({ noteId: note.id, chapterId: note.chapterId }),
        },
      });
    }

    return sendSuccess(res, note, 'Note details retrieved');
  } catch (err: any) {
    return sendError(res, 'Failed to fetch note details', 500, err.message);
  }
}

