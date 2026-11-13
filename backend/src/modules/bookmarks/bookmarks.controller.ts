import { Response } from 'express';
import { prisma } from '../../db.js';
import { sendSuccess, sendError } from '../../utils/response.js';
import { AuthenticatedRequest } from '../../middleware/auth.js';

export async function getBookmarks(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user?.studentProfileId) {
      return sendError(res, 'Unauthorized', 401);
    }

    const { category, subjectCode, examType } = req.query;

    const where: any = {
      studentId: req.user.studentProfileId,
    };

    if (category && ['MISTAKE', 'REVISE_LATER', 'IMPORTANT'].includes(category as string)) {
      where.category = category as string;
    }

    if (subjectCode || examType) {
      where.question = {};
      if (subjectCode) {
        where.question.subject = {
          code: (subjectCode as string).toUpperCase(),
        };
      }
      if (examType) {
        where.question.examType = examType as string;
      }
    }

    const bookmarks = await prisma.bookmark.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        question: {
          include: {
            subject: true,
            chapter: true,
            options: true,
            explanation: true,
          },
        },
      },
    });

    // Provide count summary for all 3 categories
    const [mistakeCount, reviseLaterCount, importantCount] = await Promise.all([
      prisma.bookmark.count({
        where: { studentId: req.user.studentProfileId, category: 'MISTAKE' },
      }),
      prisma.bookmark.count({
        where: { studentId: req.user.studentProfileId, category: 'REVISE_LATER' },
      }),
      prisma.bookmark.count({
        where: { studentId: req.user.studentProfileId, category: 'IMPORTANT' },
      }),
    ]);

    return sendSuccess(
      res,
      {
        categories: {
          MISTAKE: mistakeCount,
          REVISE_LATER: reviseLaterCount,
          IMPORTANT: importantCount,
        },
        bookmarks,
      },
      'Bookmarks retrieved successfully'
    );
  } catch (err: any) {
    return sendError(res, 'Failed to fetch bookmarks', 500, err.message);
  }
}

export async function toggleBookmark(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user?.studentProfileId) {
      return sendError(res, 'Unauthorized', 401);
    }

    const { questionId, category, notes } = req.body;

    if (!questionId || !['MISTAKE', 'REVISE_LATER', 'IMPORTANT'].includes(category)) {
      return sendError(res, 'Valid questionId and category required', 400);
    }

    // Check if already exists
    const existing = await prisma.bookmark.findUnique({
      where: {
        studentId_questionId_category: {
          studentId: req.user.studentProfileId,
          questionId,
          category,
        },
      },
    });

    if (existing) {
      await prisma.bookmark.delete({
        where: { id: existing.id },
      });
      return sendSuccess(res, { bookmarked: false, category }, 'Bookmark removed');
    } else {
      const bookmark = await prisma.bookmark.create({
        data: {
          studentId: req.user.studentProfileId,
          questionId,
          category,
          notes: notes || null,
        },
      });
      return sendSuccess(res, { bookmarked: true, bookmark }, 'Question bookmarked successfully', 201);
    }
  } catch (err: any) {
    return sendError(res, 'Failed to toggle bookmark', 500, err.message);
  }
}

export async function removeBookmark(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user?.studentProfileId) {
      return sendError(res, 'Unauthorized', 401);
    }

    const { id } = req.params;

    const bookmark = await prisma.bookmark.findFirst({
      where: {
        id,
        studentId: req.user.studentProfileId,
      },
    });

    if (!bookmark) {
      return sendError(res, 'Bookmark not found', 404);
    }

    await prisma.bookmark.delete({
      where: { id: bookmark.id },
    });

    return sendSuccess(res, null, 'Bookmark removed');
  } catch (err: any) {
    return sendError(res, 'Failed to delete bookmark', 500, err.message);
  }
}

