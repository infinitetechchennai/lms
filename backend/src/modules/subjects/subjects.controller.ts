import { Request, Response } from 'express';
import { prisma } from '../../db.js';
import { sendSuccess, sendError } from '../../utils/response.js';

export async function getAllSubjects(req: Request, res: Response) {
  try {
    const subjects = await prisma.subject.findMany({
      orderBy: { orderIndex: 'asc' },
      include: {
        _count: {
          select: {
            chapters: true,
            questions: true,
            videos: true,
          },
        },
      },
    });

    return sendSuccess(res, subjects, 'Subjects retrieved successfully');
  } catch (err: any) {
    return sendError(res, 'Failed to fetch subjects', 500, err.message);
  }
}

export async function getChaptersBySubject(req: Request, res: Response) {
  try {
    const { subjectCode } = req.params;
    const { targetClass } = req.query;

    const subject = await prisma.subject.findUnique({
      where: { code: subjectCode.toUpperCase() },
    });

    if (!subject) {
      return sendError(res, 'Subject not found', 404);
    }

    const whereClause: any = {
      subjectId: subject.id,
      isPublished: true,
    };

    if (targetClass && (targetClass === 'CLASS_11' || targetClass === 'CLASS_12')) {
      whereClause.targetClass = targetClass;
    }

    const chapters = await prisma.chapter.findMany({
      where: whereClause,
      orderBy: { orderIndex: 'asc' },
      include: {
        topics: {
          orderBy: { orderIndex: 'asc' },
        },
        _count: {
          select: {
            notes: true,
            questions: true,
            flashcards: true,
          },
        },
      },
    });

    return sendSuccess(
      res,
      {
        subject,
        chapters,
      },
      'Chapters retrieved successfully'
    );
  } catch (err: any) {
    return sendError(res, 'Failed to fetch chapters', 500, err.message);
  }
}

export async function getChapterDetails(req: Request, res: Response) {
  try {
    const { idOrSlug } = req.params;

    const chapter = await prisma.chapter.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
      include: {
        subject: true,
        topics: {
          orderBy: { orderIndex: 'asc' },
        },
        notes: {
          where: { isPublished: true },
          include: { files: true },
        },
        _count: {
          select: {
            questions: true,
            flashcards: true,
            videos: true,
          },
        },
      },
    });

    if (!chapter) {
      return sendError(res, 'Chapter not found', 404);
    }

    return sendSuccess(res, chapter, 'Chapter details retrieved');
  } catch (err: any) {
    return sendError(res, 'Failed to fetch chapter details', 500, err.message);
  }
}

