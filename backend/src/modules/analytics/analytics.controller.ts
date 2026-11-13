import { Response } from 'express';
import { prisma } from '../../db.js';
import { sendSuccess, sendError } from '../../utils/response.js';
import { AuthenticatedRequest } from '../../middleware/auth.js';

export async function getStudentAnalytics(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user?.studentProfileId) {
      return sendError(res, 'Unauthorized', 401);
    }

    const studentId = req.user.studentProfileId;

    const [
      studentProfile,
      totalAttempts,
      correctAttempts,
      subjectStats,
      recentActivities,
      totalBookmarks,
      flashcardCount,
      tasksStats,
    ] = await Promise.all([
      prisma.studentProfile.findUnique({ where: { id: studentId } }),
      prisma.questionAttempt.count({ where: { studentId } }),
      prisma.questionAttempt.count({ where: { studentId, isCorrect: true } }),
      prisma.subject.findMany({
        include: {
          questions: {
            include: {
              attempts: {
                where: { studentId },
              },
            },
          },
        },
      }),
      prisma.userActivity.findMany({
        where: { studentId },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      prisma.bookmark.count({ where: { studentId } }),
      prisma.flashcard.count({ where: { studentId } }),
      prisma.personalTask.findMany({ where: { studentId } }),
    ]);

    // Ensure newly registered students have starter tasks if none exist
    let currentTasks = tasksStats;
    if (currentTasks.length === 0) {
      const isJEE = studentProfile?.targetExam?.includes('JEE');
      const starterTasks = isJEE
        ? [
            {
              studentId,
              title: 'Master Calculus King Property & Definite Integrals',
              subjectCode: 'MATHEMATICS',
              chapterName: 'Definite Integrals',
              dueDate: new Date(),
              estimatedMinutes: 45,
              priority: 'HIGH',
              isCompleted: false,
            },
            {
              studentId,
              title: 'Solve 15 Kirchhoff Laws & Circuits Previous Year Questions',
              subjectCode: 'PHYSICS',
              chapterName: 'Current Electricity',
              dueDate: new Date(),
              estimatedMinutes: 60,
              priority: 'HIGH',
              isCompleted: false,
            },
            {
              studentId,
              title: 'Flashcard Drill: MOT Bond Order & Chemical Bonding',
              subjectCode: 'CHEMISTRY',
              chapterName: 'Chemical Bonding and Molecular Structure',
              dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
              estimatedMinutes: 30,
              priority: 'MEDIUM',
              isCompleted: false,
            },
          ]
        : [
            {
              studentId,
              title: 'Study Mendelian Genetics & Cross Ratio Summary Notes',
              subjectCode: 'BIOLOGY',
              chapterName: 'Principles of Inheritance & Variation',
              dueDate: new Date(),
              estimatedMinutes: 45,
              priority: 'HIGH',
              isCompleted: false,
            },
            {
              studentId,
              title: 'Practice 20 High-Yield NEET Biology PYQs',
              subjectCode: 'BIOLOGY',
              chapterName: 'Principles of Inheritance & Variation',
              dueDate: new Date(),
              estimatedMinutes: 45,
              priority: 'HIGH',
              isCompleted: false,
            },
            {
              studentId,
              title: 'Review Current Electricity Drift Velocity Formulas',
              subjectCode: 'PHYSICS',
              chapterName: 'Current Electricity',
              dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
              estimatedMinutes: 30,
              priority: 'MEDIUM',
              isCompleted: false,
            },
          ];

      for (const t of starterTasks) {
        await prisma.personalTask.create({ data: t });
      }
      currentTasks = await prisma.personalTask.findMany({ where: { studentId } });
    }

    const incorrectAttempts = totalAttempts - correctAttempts;
    const accuracy = totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0;

    // Process subject-wise accuracy
    const subjectBreakdown = subjectStats.map((sub) => {
      let attemptsCount = 0;
      let correctCount = 0;

      for (const q of sub.questions) {
        for (const att of q.attempts) {
          attemptsCount++;
          if (att.isCorrect) correctCount++;
        }
      }

      return {
        subjectCode: sub.code,
        name: sub.name,
        color: sub.color,
        totalQuestionsInSubject: sub.questions.length,
        attemptsCount,
        correctCount,
        accuracyPercentage: attemptsCount > 0 ? Math.round((correctCount / attemptsCount) * 100) : 0,
      };
    });

    // Mock weekly activity for chart (last 7 days)
    const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const weeklyActivity = daysOfWeek.map((day, idx) => ({
      day,
      questionsAttempted: [12, 19, 15, 25, 22, 30, 18][idx],
      studyMinutes: [45, 60, 50, 90, 75, 110, 65][idx],
    }));

    return sendSuccess(
      res,
      {
        profile: studentProfile,
        overview: {
          totalQuestionsAttempted: totalAttempts,
          correctAnswers: correctAttempts,
          incorrectAnswers: incorrectAttempts,
          accuracyPercentage: accuracy,
          totalBookmarks,
          totalFlashcards: flashcardCount,
          completedTasks: currentTasks.filter((t) => t.isCompleted).length,
          pendingTasks: currentTasks.filter((t) => !t.isCompleted).length,
          studyDurationMinutes: studentProfile?.totalStudyMinutes || 0,
          currentStreakDays: studentProfile?.streakDays || 1,
        },
        subjectBreakdown,
        weeklyActivity,
        recentActivities,
      },
      'Analytics loaded successfully'
    );
  } catch (err: any) {
    return sendError(res, 'Failed to generate analytics', 500, err.message);
  }
}

