import { Response } from 'express';
import { prisma } from '../../db.js';
import { sendSuccess, sendError } from '../../utils/response.js';
import { AuthenticatedRequest } from '../../middleware/auth.js';

export async function getAdminPlatformStats(req: AuthenticatedRequest, res: Response) {
  try {
    const [
      totalStudents,
      totalNotes,
      totalQuestions,
      totalVideos,
      totalAttempts,
      recentUsers,
    ] = await Promise.all([
      prisma.studentProfile.count(),
      prisma.note.count(),
      prisma.question.count(),
      prisma.video.count(),
      prisma.questionAttempt.count(),
      prisma.user.findMany({
        where: { role: 'STUDENT' },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { studentProfile: true },
      }),
    ]);

    return sendSuccess(
      res,
      {
        totalStudents,
        totalNotes,
        totalQuestions,
        totalVideos,
        totalAttempts,
        activeTodayCount: totalStudents > 0 ? Math.ceil(totalStudents * 0.75) : 0,
        recentRegistrations: recentUsers,
      },
      'Platform statistics retrieved'
    );
  } catch (err: any) {
    return sendError(res, 'Failed to fetch admin stats', 500, err.message);
  }
}

export async function getStudentsList(req: AuthenticatedRequest, res: Response) {
  try {
    const { search, targetExam, targetClass, page = '1', limit = '20' } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {
      role: 'STUDENT',
    };

    if (search) {
      where.OR = [
        { email: { contains: search as string } },
        { studentProfile: { fullName: { contains: search as string } } },
      ];
    }

    if (targetExam || targetClass) {
      where.studentProfile = {};
      if (targetExam) where.studentProfile.targetExam = targetExam as string;
      if (targetClass) where.studentProfile.targetClass = targetClass as string;
    }

    const [total, students] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          studentProfile: {
            include: {
              _count: {
                select: {
                  questionAttempts: true,
                  bookmarks: true,
                  flashcards: true,
                },
              },
            },
          },
        },
      }),
    ]);

    return sendSuccess(res, students, 'Students list retrieved', 200, {
      page: pageNum,
      limit: limitNum,
      total,
    });
  } catch (err: any) {
    return sendError(res, 'Failed to fetch students', 500, err.message);
  }
}

export async function toggleStudentStatus(req: AuthenticatedRequest, res: Response) {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return sendError(res, 'Student not found', 404);
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { isVerified: !user.isVerified },
    });

    return sendSuccess(res, updated, 'Student verification/status toggled');
  } catch (err: any) {
    return sendError(res, 'Failed to update student status', 500, err.message);
  }
}

export async function createChapter(req: AuthenticatedRequest, res: Response) {
  try {
    const { subjectId, title, slug, description, targetClass, orderIndex } = req.body;

    if (!subjectId || !title || !slug || !description) {
      return sendError(res, 'Subject, Title, Slug, and Description are required', 400);
    }

    const chapter = await prisma.chapter.create({
      data: {
        subjectId,
        title,
        slug: slug.toLowerCase().replace(/\s+/g, '-'),
        description,
        targetClass: targetClass || 'CLASS_11',
        orderIndex: orderIndex ? parseInt(orderIndex, 10) : 1,
      },
    });

    return sendSuccess(res, chapter, 'Chapter created successfully', 201);
  } catch (err: any) {
    return sendError(res, 'Failed to create chapter', 500, err.message);
  }
}

export async function createNote(req: AuthenticatedRequest, res: Response) {
  try {
    const { chapterId, topicId, title, summary, contentMarkdown, allowDownload } = req.body;

    if (!chapterId || !title || !contentMarkdown) {
      return sendError(res, 'Chapter, Title, and Note Markdown content are required', 400);
    }

    const note = await prisma.note.create({
      data: {
        chapterId,
        topicId: topicId || null,
        title,
        summary: summary || title,
        contentMarkdown,
        allowDownload: allowDownload !== undefined ? allowDownload : true,
        isPublished: true,
      },
      include: {
        chapter: true,
      },
    });

    return sendSuccess(res, note, 'Note created and published successfully', 201);
  } catch (err: any) {
    return sendError(res, 'Failed to create note', 500, err.message);
  }
}

export async function createQuestion(req: AuthenticatedRequest, res: Response) {
  try {
    const {
      subjectId,
      chapterId,
      topicId,
      content,
      questionType = 'SINGLE_CHOICE',
      examType = 'NEET',
      examYear = 2023,
      difficulty = 'MEDIUM',
      marks = 4,
      negativeMarks = 1,
      options, // Array of { label, content, isCorrect }
      explanation, // String or { content, formula }
    } = req.body;

    if (!subjectId || !chapterId || !content || !options || options.length < 2) {
      return sendError(res, 'Question details and at least 2 options are required', 400);
    }

    const question = await prisma.question.create({
      data: {
        subjectId,
        chapterId,
        topicId: topicId || null,
        content,
        questionType,
        examType,
        examYear: parseInt(examYear, 10),
        difficulty,
        marks: parseInt(marks, 10),
        negativeMarks: parseInt(negativeMarks, 10),
        options: {
          create: options.map((opt: any) => ({
            label: opt.label,
            content: opt.content,
            isCorrect: Boolean(opt.isCorrect),
          })),
        },
        explanation: explanation
          ? {
              create: {
                content: typeof explanation === 'string' ? explanation : explanation.content,
                formula: typeof explanation === 'object' ? explanation.formula : null,
              },
            }
          : undefined,
      },
      include: {
        options: true,
        explanation: true,
      },
    });

    return sendSuccess(res, question, 'Question created successfully', 201);
  } catch (err: any) {
    return sendError(res, 'Failed to create question', 500, err.message);
  }
}

export async function bulkImportQuestions(req: AuthenticatedRequest, res: Response) {
  try {
    const { questions } = req.body; // Array of validated parsed CSV rows

    if (!Array.isArray(questions) || questions.length === 0) {
      return sendError(res, 'An array of questions is required for bulk import', 400);
    }

    const createdRecords = [];

    for (const q of questions) {
      const created = await prisma.question.create({
        data: {
          subjectId: q.subjectId,
          chapterId: q.chapterId,
          content: q.content,
          examType: q.examType || 'NEET',
          examYear: parseInt(q.examYear || '2023', 10),
          difficulty: q.difficulty || 'MEDIUM',
          marks: 4,
          negativeMarks: 1,
          options: {
            create: [
              { label: 'A', content: q.optionA, isCorrect: q.correctOption === 'A' },
              { label: 'B', content: q.optionB, isCorrect: q.correctOption === 'B' },
              { label: 'C', content: q.optionC, isCorrect: q.correctOption === 'C' },
              { label: 'D', content: q.optionD, isCorrect: q.correctOption === 'D' },
            ],
          },
          explanation: q.explanation
            ? {
                create: {
                  content: q.explanation,
                },
              }
            : undefined,
        },
      });
      createdRecords.push(created);
    }

    return sendSuccess(
      res,
      { importedCount: createdRecords.length },
      `Successfully imported ${createdRecords.length} questions`
    );
  } catch (err: any) {
    return sendError(res, 'Bulk import failed', 500, err.message);
  }
}

export async function createVideo(req: AuthenticatedRequest, res: Response) {
  try {
    const { subjectId, chapterId, title, description, durationSeconds, videoUrl, thumbnailUrl } =
      req.body;

    if (!subjectId || !title || !videoUrl) {
      return sendError(res, 'Subject, Title, and Video URL are required', 400);
    }

    const video = await prisma.video.create({
      data: {
        subjectId,
        chapterId: chapterId || null,
        title,
        description: description || title,
        durationSeconds: durationSeconds ? parseInt(durationSeconds, 10) : 35,
        videoUrl,
        thumbnailUrl: thumbnailUrl || null,
      },
    });

    return sendSuccess(res, video, 'Video published successfully', 201);
  } catch (err: any) {
    return sendError(res, 'Failed to publish video', 500, err.message);
  }
}

// ---------------- NOTES MANAGEMENT (EDIT, DELETE, LIST) ----------------

export async function getAdminNotesList(req: AuthenticatedRequest, res: Response) {
  try {
    const notes = await prisma.note.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        chapter: {
          include: {
            subject: true,
          },
        },
        files: true,
      },
    });
    return sendSuccess(res, notes, 'Admin notes retrieved');
  } catch (err: any) {
    return sendError(res, 'Failed to fetch notes list', 500, err.message);
  }
}

export async function updateNote(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const { title, summary, contentMarkdown, allowDownload, chapterId } = req.body;

    const existing = await prisma.note.findUnique({ where: { id } });
    if (!existing) return sendError(res, 'Note not found', 404);

    const updated = await prisma.note.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(summary !== undefined && { summary }),
        ...(contentMarkdown && { contentMarkdown }),
        ...(allowDownload !== undefined && { allowDownload: Boolean(allowDownload) }),
        ...(chapterId && { chapterId }),
      },
      include: { chapter: { include: { subject: true } } },
    });

    return sendSuccess(res, updated, 'Note updated successfully');
  } catch (err: any) {
    return sendError(res, 'Failed to update note', 500, err.message);
  }
}

export async function deleteNote(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    await prisma.note.delete({ where: { id } });
    return sendSuccess(res, null, 'Note deleted successfully');
  } catch (err: any) {
    return sendError(res, 'Failed to delete note', 500, err.message);
  }
}

// ---------------- VIDEOS MANAGEMENT (EDIT, DELETE, LIST) ----------------

export async function getAdminVideosList(req: AuthenticatedRequest, res: Response) {
  try {
    const videos = await prisma.video.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        subject: true,
        chapter: true,
      },
    });
    return sendSuccess(res, videos, 'Admin videos retrieved');
  } catch (err: any) {
    return sendError(res, 'Failed to fetch videos list', 500, err.message);
  }
}

export async function updateVideo(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const { title, description, durationSeconds, videoUrl, thumbnailUrl, subjectId, chapterId } =
      req.body;

    const existing = await prisma.video.findUnique({ where: { id } });
    if (!existing) return sendError(res, 'Video not found', 404);

    const updated = await prisma.video.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(durationSeconds && { durationSeconds: parseInt(durationSeconds, 10) }),
        ...(videoUrl && { videoUrl }),
        ...(thumbnailUrl !== undefined && { thumbnailUrl }),
        ...(subjectId && { subjectId }),
        ...(chapterId !== undefined && { chapterId }),
      },
      include: { subject: true, chapter: true },
    });

    return sendSuccess(res, updated, 'Video updated successfully');
  } catch (err: any) {
    return sendError(res, 'Failed to update video', 500, err.message);
  }
}

export async function deleteVideo(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    await prisma.video.delete({ where: { id } });
    return sendSuccess(res, null, 'Video deleted successfully');
  } catch (err: any) {
    return sendError(res, 'Failed to delete video', 500, err.message);
  }
}

// ---------------- QUESTIONS MANAGEMENT (EDIT, DELETE, LIST) ----------------

export async function getAdminQuestionsList(req: AuthenticatedRequest, res: Response) {
  try {
    const questions = await prisma.question.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        subject: true,
        chapter: true,
        options: true,
        explanation: true,
      },
    });
    return sendSuccess(res, questions, 'Admin questions retrieved');
  } catch (err: any) {
    return sendError(res, 'Failed to fetch questions list', 500, err.message);
  }
}

export async function updateQuestion(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const {
      content,
      examType,
      examYear,
      difficulty,
      marks,
      options, // Array of { id, label, content, isCorrect }
      explanation, // { content, formula }
    } = req.body;

    const existing = await prisma.question.findUnique({
      where: { id },
      include: { options: true, explanation: true },
    });
    if (!existing) return sendError(res, 'Question not found', 404);

    // Update basic question fields
    await prisma.question.update({
      where: { id },
      data: {
        ...(content && { content }),
        ...(examType && { examType }),
        ...(examYear && { examYear: parseInt(examYear, 10) }),
        ...(difficulty && { difficulty }),
        ...(marks && { marks: parseInt(marks, 10) }),
      },
    });

    // Update options if provided
    if (options && Array.isArray(options)) {
      for (const opt of options) {
        if (opt.id) {
          await prisma.questionOption.update({
            where: { id: opt.id },
            data: {
              content: opt.content,
              isCorrect: Boolean(opt.isCorrect),
            },
          });
        }
      }
    }

    // Update explanation if provided
    if (explanation) {
      if (existing.explanation) {
        await prisma.questionExplanation.update({
          where: { questionId: id },
          data: {
            content: typeof explanation === 'string' ? explanation : explanation.content,
            formula: typeof explanation === 'object' ? explanation.formula : null,
          },
        });
      } else {
        await prisma.questionExplanation.create({
          data: {
            questionId: id,
            content: typeof explanation === 'string' ? explanation : explanation.content,
            formula: typeof explanation === 'object' ? explanation.formula : null,
          },
        });
      }
    }

    const fullUpdated = await prisma.question.findUnique({
      where: { id },
      include: { subject: true, chapter: true, options: true, explanation: true },
    });

    return sendSuccess(res, fullUpdated, 'Question updated successfully');
  } catch (err: any) {
    return sendError(res, 'Failed to update question', 500, err.message);
  }
}

export async function deleteQuestion(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    await prisma.question.delete({ where: { id } });
    return sendSuccess(res, null, 'Question deleted successfully');
  } catch (err: any) {
    return sendError(res, 'Failed to delete question', 500, err.message);
  }
}

// ---------------- CHAPTERS MANAGEMENT (EDIT, DELETE, LIST) ----------------

export async function getAdminChaptersList(req: AuthenticatedRequest, res: Response) {
  try {
    const chapters = await prisma.chapter.findMany({
      orderBy: [{ subjectId: 'asc' }, { orderIndex: 'asc' }],
      include: {
        subject: true,
        topics: true,
        _count: {
          select: { notes: true, questions: true, videos: true },
        },
      },
    });
    return sendSuccess(res, chapters, 'Admin chapters retrieved');
  } catch (err: any) {
    return sendError(res, 'Failed to fetch chapters list', 500, err.message);
  }
}

export async function updateChapter(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const { title, description, targetClass, orderIndex, isPublished } = req.body;

    const existing = await prisma.chapter.findUnique({ where: { id } });
    if (!existing) return sendError(res, 'Chapter not found', 404);

    const updated = await prisma.chapter.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(targetClass && { targetClass }),
        ...(orderIndex !== undefined && { orderIndex: parseInt(orderIndex, 10) }),
        ...(isPublished !== undefined && { isPublished: Boolean(isPublished) }),
      },
      include: { subject: true },
    });

    return sendSuccess(res, updated, 'Chapter updated successfully');
  } catch (err: any) {
    return sendError(res, 'Failed to update chapter', 500, err.message);
  }
}

export async function deleteChapter(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    await prisma.chapter.delete({ where: { id } });
    return sendSuccess(res, null, 'Chapter deleted successfully');
  } catch (err: any) {
    return sendError(res, 'Failed to delete chapter', 500, err.message);
  }
}

