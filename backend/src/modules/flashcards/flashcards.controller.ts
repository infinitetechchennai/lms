import { Response } from 'express';
import { prisma } from '../../db.js';
import { sendSuccess, sendError } from '../../utils/response.js';
import { AuthenticatedRequest } from '../../middleware/auth.js';

export async function getFlashcards(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user?.studentProfileId) {
      return sendError(res, 'Unauthorized', 401);
    }

    const { folderId, chapterId, search } = req.query;

    const where: any = {
      studentId: req.user.studentProfileId,
    };

    if (folderId) {
      where.folderId = folderId as string;
    }

    if (chapterId) {
      where.chapterId = chapterId as string;
    }

    if (search) {
      where.OR = [
        { frontContent: { contains: search as string } },
        { backContent: { contains: search as string } },
      ];
    }

    const flashcards = await prisma.flashcard.findMany({
      where,
      orderBy: { nextReviewAt: 'asc' },
      include: {
        folder: true,
        chapter: {
          include: {
            subject: true,
          },
        },
      },
    });

    const folders = await prisma.flashcardFolder.findMany({
      where: { studentId: req.user.studentProfileId },
      include: {
        _count: {
          select: { cards: true },
        },
      },
    });

    return sendSuccess(res, { folders, flashcards }, 'Flashcards retrieved successfully');
  } catch (err: any) {
    return sendError(res, 'Failed to fetch flashcards', 500, err.message);
  }
}

export async function createFlashcard(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user?.studentProfileId) {
      return sendError(res, 'Unauthorized', 401);
    }

    const { frontContent, backContent, hint, folderId, chapterId } = req.body;

    if (!frontContent || !backContent) {
      return sendError(res, 'Front content and Back answer are required', 400);
    }

    const flashcard = await prisma.flashcard.create({
      data: {
        studentId: req.user.studentProfileId,
        folderId: folderId || null,
        chapterId: chapterId || null,
        frontContent,
        backContent,
        hint: hint || null,
        masteryLevel: 0,
        nextReviewAt: new Date(),
      },
      include: {
        folder: true,
        chapter: true,
      },
    });

    return sendSuccess(res, flashcard, 'Flashcard created successfully', 201);
  } catch (err: any) {
    return sendError(res, 'Failed to create flashcard', 500, err.message);
  }
}

export async function updateFlashcard(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user?.studentProfileId) {
      return sendError(res, 'Unauthorized', 401);
    }

    const { id } = req.params;
    const { frontContent, backContent, hint, folderId, chapterId } = req.body;

    const existing = await prisma.flashcard.findFirst({
      where: { id, studentId: req.user.studentProfileId },
    });

    if (!existing) {
      return sendError(res, 'Flashcard not found', 404);
    }

    const updated = await prisma.flashcard.update({
      where: { id },
      data: {
        ...(frontContent && { frontContent }),
        ...(backContent && { backContent }),
        ...(hint !== undefined && { hint }),
        ...(folderId !== undefined && { folderId }),
        ...(chapterId !== undefined && { chapterId }),
      },
    });

    return sendSuccess(res, updated, 'Flashcard updated successfully');
  } catch (err: any) {
    return sendError(res, 'Failed to update flashcard', 500, err.message);
  }
}

export async function deleteFlashcard(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user?.studentProfileId) {
      return sendError(res, 'Unauthorized', 401);
    }

    const { id } = req.params;

    const existing = await prisma.flashcard.findFirst({
      where: { id, studentId: req.user.studentProfileId },
    });

    if (!existing) {
      return sendError(res, 'Flashcard not found', 404);
    }

    await prisma.flashcard.delete({
      where: { id },
    });

    return sendSuccess(res, null, 'Flashcard deleted');
  } catch (err: any) {
    return sendError(res, 'Failed to delete flashcard', 500, err.message);
  }
}

export async function reviewFlashcard(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user?.studentProfileId) {
      return sendError(res, 'Unauthorized', 401);
    }

    const { id } = req.params;
    const { remembered, responseTimeSeconds = 0 } = req.body;

    const flashcard = await prisma.flashcard.findFirst({
      where: { id, studentId: req.user.studentProfileId },
    });

    if (!flashcard) {
      return sendError(res, 'Flashcard not found', 404);
    }

    // Spaced repetition progression calculation (SuperMemo SM-2 inspired)
    let newMastery = remembered ? Math.min(flashcard.masteryLevel + 1, 5) : 0;
    
    // Interval in days based on mastery
    const intervalsInDays = [1, 2, 4, 7, 14, 30];
    const nextReviewDays = intervalsInDays[newMastery] || 1;
    const nextReviewAt = new Date(Date.now() + nextReviewDays * 24 * 60 * 60 * 1000);

    const [updatedCard, attempt] = await Promise.all([
      prisma.flashcard.update({
        where: { id },
        data: {
          masteryLevel: newMastery,
          nextReviewAt,
        },
      }),
      prisma.flashcardAttempt.create({
        data: {
          studentId: req.user.studentProfileId,
          flashcardId: id,
          remembered: Boolean(remembered),
          responseTimeSeconds,
        },
      }),
    ]);

    return sendSuccess(
      res,
      {
        card: updatedCard,
        attempt,
        nextReviewInDays: nextReviewDays,
      },
      remembered ? 'Great recall! Review scheduled.' : 'Card reset for review soon.'
    );
  } catch (err: any) {
    return sendError(res, 'Failed to record flashcard review', 500, err.message);
  }
}

export async function createFolder(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user?.studentProfileId) {
      return sendError(res, 'Unauthorized', 401);
    }

    const { name, color = '#4F46E5' } = req.body;

    if (!name) {
      return sendError(res, 'Folder name is required', 400);
    }

    const folder = await prisma.flashcardFolder.create({
      data: {
        studentId: req.user.studentProfileId,
        name,
        color,
      },
    });

    return sendSuccess(res, folder, 'Folder created successfully', 201);
  } catch (err: any) {
    return sendError(res, 'Failed to create folder', 500, err.message);
  }
}

