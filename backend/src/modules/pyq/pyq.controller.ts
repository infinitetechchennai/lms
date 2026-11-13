import { Request, Response } from 'express';
import { prisma } from '../../db.js';
import { sendSuccess, sendError } from '../../utils/response.js';
import { AuthenticatedRequest } from '../../middleware/auth.js';

export async function getQuestions(req: AuthenticatedRequest, res: Response) {
  try {
    const {
      examType,
      subjectCode,
      targetClass,
      chapterId,
      examYear,
      difficulty,
      questionType,
      page = '1',
      limit = '20',
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {
      isPublished: true,
    };

    if (examType) {
      where.examType = examType as string;
    }

    if (difficulty) {
      where.difficulty = difficulty as string;
    }

    if (questionType) {
      where.questionType = questionType as string;
    }

    if (examYear) {
      where.examYear = parseInt(examYear as string, 10);
    }

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

    const [total, questions] = await Promise.all([
      prisma.question.count({ where }),
      prisma.question.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: [{ examYear: 'desc' }, { createdAt: 'desc' }],
        include: {
          subject: true,
          chapter: true,
          topic: true,
          options: {
            select: {
              id: true,
              label: true,
              content: true,
              // Exclude isCorrect so student cannot cheat before submitting
            },
          },
          explanation: {
            select: {
              id: true,
              // Excluded content until question is attempted or requested
            },
          },
          bookmarks: req.user?.studentProfileId
            ? {
                where: { studentId: req.user.studentProfileId },
                select: { id: true, category: true },
              }
            : false,
          attempts: req.user?.studentProfileId
            ? {
                where: { studentId: req.user.studentProfileId },
                orderBy: { createdAt: 'desc' },
                take: 1,
                select: {
                  id: true,
                  selectedOptionIds: true,
                  isCorrect: true,
                  createdAt: true,
                },
              }
            : false,
        },
      }),
    ]);

    return sendSuccess(res, questions, 'Questions retrieved successfully', 200, {
      page: pageNum,
      limit: limitNum,
      total,
    });
  } catch (err: any) {
    return sendError(res, 'Failed to fetch questions', 500, err.message);
  }
}

export async function getQuestionById(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;

    const question = await prisma.question.findUnique({
      where: { id },
      include: {
        subject: true,
        chapter: true,
        topic: true,
        options: {
          select: {
            id: true,
            label: true,
            content: true,
          },
        },
        bookmarks: req.user?.studentProfileId
          ? {
              where: { studentId: req.user.studentProfileId },
            }
          : false,
      },
    });

    if (!question) {
      return sendError(res, 'Question not found', 404);
    }

    return sendSuccess(res, question, 'Question retrieved');
  } catch (err: any) {
    return sendError(res, 'Failed to fetch question', 500, err.message);
  }
}

export async function attemptQuestion(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const { selectedOptionId, selectedOptionIds, numericalAnswer, timeSpentSeconds = 0 } = req.body;

    if (!req.user?.studentProfileId) {
      return sendError(res, 'Only authenticated students can record attempts', 403);
    }

    const question = await prisma.question.findUnique({
      where: { id },
      include: {
        options: true,
        explanation: true,
      },
    });

    if (!question) {
      return sendError(res, 'Question not found', 404);
    }

    // Determine correctness
    let isCorrect = false;
    const submittedIds: string[] = selectedOptionIds || (selectedOptionId ? [selectedOptionId] : []);

    if (question.questionType === 'SINGLE_CHOICE' || question.questionType === 'MULTIPLE_CHOICE') {
      const correctOptionIds = question.options.filter((opt) => opt.isCorrect).map((opt) => opt.id);
      
      if (question.questionType === 'SINGLE_CHOICE') {
        isCorrect = submittedIds.length === 1 && correctOptionIds.includes(submittedIds[0]);
      } else {
        // Multiple choices: must match all correct options
        isCorrect =
          submittedIds.length === correctOptionIds.length &&
          submittedIds.every((id) => correctOptionIds.includes(id));
      }
    } else if (question.questionType === 'NUMERICAL') {
      // For numerical, we can check tolerance if specified
      isCorrect = true; // placeholder tolerance
    }

    // Record attempt
    const attempt = await prisma.questionAttempt.create({
      data: {
        studentId: req.user.studentProfileId,
        questionId: question.id,
        selectedOptionIds: JSON.stringify(submittedIds),
        numericalAnswer: numericalAnswer ? parseFloat(numericalAnswer) : null,
        isCorrect,
        timeSpentSeconds,
      },
    });

    // Auto-tag mistake bookmark if incorrect
    if (!isCorrect) {
      await prisma.bookmark.upsert({
        where: {
          studentId_questionId_category: {
            studentId: req.user.studentProfileId,
            questionId: question.id,
            category: 'MISTAKE',
          },
        },
        create: {
          studentId: req.user.studentProfileId,
          questionId: question.id,
          category: 'MISTAKE',
          notes: 'Auto-saved to Mistake Bookmarks after incorrect practice attempt.',
        },
        update: {},
      });
    }

    // Log Activity
    await prisma.userActivity.create({
      data: {
        studentId: req.user.studentProfileId,
        actionType: 'ATTEMPT_QUESTION',
        title: `Attempted ${question.examType} ${question.examYear} question (${isCorrect ? 'Correct' : 'Incorrect'})`,
        metadata: JSON.stringify({
          questionId: question.id,
          isCorrect,
          timeSpentSeconds,
        }),
      },
    });

    // Return comprehensive evaluation, solution, and explanation
    return sendSuccess(
      res,
      {
        attemptId: attempt.id,
        isCorrect,
        correctOptionIds: question.options.filter((o) => o.isCorrect).map((o) => o.id),
        marksAwarded: isCorrect ? question.marks : -question.negativeMarks,
        explanation: question.explanation,
      },
      isCorrect ? 'Correct answer! Excellent job.' : 'Incorrect answer. Review the explanation.'
    );
  } catch (err: any) {
    return sendError(res, 'Failed to record attempt', 500, err.message);
  }
}

export async function getAttemptHistory(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user?.studentProfileId) {
      return sendError(res, 'Unauthorized', 401);
    }

    const attempts = await prisma.questionAttempt.findMany({
      where: { studentId: req.user.studentProfileId },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        question: {
          include: {
            subject: true,
            chapter: true,
          },
        },
      },
    });

    const total = attempts.length;
    const correct = attempts.filter((a) => a.isCorrect).length;
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

    return sendSuccess(res, {
      summary: {
        totalAttempts: total,
        correctAttempts: correct,
        accuracyPercentage: accuracy,
      },
      history: attempts,
    });
  } catch (err: any) {
    return sendError(res, 'Failed to retrieve attempt history', 500, err.message);
  }
}

