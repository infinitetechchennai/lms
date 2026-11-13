import { Response } from 'express';
import { prisma } from '../../db.js';
import { sendSuccess, sendError } from '../../utils/response.js';
import { AuthenticatedRequest } from '../../middleware/auth.js';

export async function getPersonalTasks(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user?.studentProfileId) {
      return sendError(res, 'Unauthorized', 401);
    }

    const { status, date } = req.query;

    const where: any = {
      studentId: req.user.studentProfileId,
    };

    if (status === 'completed') {
      where.isCompleted = true;
    } else if (status === 'pending') {
      where.isCompleted = false;
    }

    if (date) {
      const targetDate = new Date(date as string);
      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));
      where.dueDate = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    // If student has 0 tasks, initialize starter tasks tailored to their chosen examination track
    const existingCount = await prisma.personalTask.count({
      where: { studentId: req.user.studentProfileId },
    });

    if (existingCount === 0) {
      const student = await prisma.studentProfile.findUnique({
        where: { id: req.user.studentProfileId },
      });
      const isJEE = student?.targetExam?.includes('JEE');

      const starterTasks = isJEE
        ? [
            {
              studentId: req.user.studentProfileId,
              title: 'Master Calculus King Property & Definite Integrals',
              subjectCode: 'MATHEMATICS',
              chapterName: 'Definite Integrals',
              dueDate: new Date(),
              estimatedMinutes: 45,
              priority: 'HIGH',
              isCompleted: false,
            },
            {
              studentId: req.user.studentProfileId,
              title: 'Solve 15 Kirchhoff Laws & Circuits Previous Year Questions',
              subjectCode: 'PHYSICS',
              chapterName: 'Current Electricity',
              dueDate: new Date(),
              estimatedMinutes: 60,
              priority: 'HIGH',
              isCompleted: false,
            },
            {
              studentId: req.user.studentProfileId,
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
              studentId: req.user.studentProfileId,
              title: 'Study Mendelian Genetics & Cross Ratio Summary Notes',
              subjectCode: 'BIOLOGY',
              chapterName: 'Principles of Inheritance & Variation',
              dueDate: new Date(),
              estimatedMinutes: 45,
              priority: 'HIGH',
              isCompleted: false,
            },
            {
              studentId: req.user.studentProfileId,
              title: 'Practice 20 High-Yield NEET Biology PYQs',
              subjectCode: 'BIOLOGY',
              chapterName: 'Principles of Inheritance & Variation',
              dueDate: new Date(),
              estimatedMinutes: 45,
              priority: 'HIGH',
              isCompleted: false,
            },
            {
              studentId: req.user.studentProfileId,
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
    }

    const tasks = await prisma.personalTask.findMany({
      where,
      orderBy: [{ dueDate: 'asc' }, { priority: 'desc' }],
    });

    // Calculate quick stats
    const allStudentTasks = await prisma.personalTask.findMany({
      where: { studentId: req.user.studentProfileId },
    });

    const totalTasks = allStudentTasks.length;
    const completedTasks = allStudentTasks.filter((t) => t.isCompleted).length;
    const pendingTasks = allStudentTasks.filter((t) => !t.isCompleted).length;

    return sendSuccess(
      res,
      {
        stats: {
          totalTasks,
          completedTasks,
          pendingTasks,
          completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        },
        tasks,
      },
      'Personal tasks retrieved successfully'
    );
  } catch (err: any) {
    return sendError(res, 'Failed to retrieve personal tasks', 500, err.message);
  }
}

export async function createPersonalTask(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user?.studentProfileId) {
      return sendError(res, 'Unauthorized', 401);
    }

    const { title, subjectCode, chapterName, dueDate, estimatedMinutes, priority } = req.body;

    if (!title || !dueDate) {
      return sendError(res, 'Title and due date are required', 400);
    }

    const task = await prisma.personalTask.create({
      data: {
        studentId: req.user.studentProfileId,
        title,
        subjectCode: subjectCode || null,
        chapterName: chapterName || null,
        dueDate: new Date(dueDate),
        estimatedMinutes: estimatedMinutes ? parseInt(estimatedMinutes, 10) : 45,
        priority: priority || 'MEDIUM',
        isCompleted: false,
      },
    });

    return sendSuccess(res, task, 'Task created successfully', 201);
  } catch (err: any) {
    return sendError(res, 'Failed to create task', 500, err.message);
  }
}

export async function toggleTaskCompletion(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user?.studentProfileId) {
      return sendError(res, 'Unauthorized', 401);
    }

    const { id } = req.params;

    const task = await prisma.personalTask.findFirst({
      where: { id, studentId: req.user.studentProfileId },
    });

    if (!task) {
      return sendError(res, 'Task not found', 404);
    }

    const updatedTask = await prisma.personalTask.update({
      where: { id },
      data: {
        isCompleted: !task.isCompleted,
        completedAt: !task.isCompleted ? new Date() : null,
      },
    });

    return sendSuccess(
      res,
      updatedTask,
      updatedTask.isCompleted ? 'Task marked complete' : 'Task marked pending'
    );
  } catch (err: any) {
    return sendError(res, 'Failed to update task status', 500, err.message);
  }
}

export async function deleteTask(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user?.studentProfileId) {
      return sendError(res, 'Unauthorized', 401);
    }

    const { id } = req.params;

    const task = await prisma.personalTask.findFirst({
      where: { id, studentId: req.user.studentProfileId },
    });

    if (!task) {
      return sendError(res, 'Task not found', 404);
    }

    await prisma.personalTask.delete({
      where: { id },
    });

    return sendSuccess(res, null, 'Task deleted successfully');
  } catch (err: any) {
    return sendError(res, 'Failed to delete task', 500, err.message);
  }
}

export async function getCuratedPlans(req: AuthenticatedRequest, res: Response) {
  try {
    const { targetExam } = req.query;

    const where: any = {
      isPublished: true,
    };

    if (targetExam) {
      where.targetExam = targetExam as string;
    }

    const plans = await prisma.studyPlan.findMany({
      where,
      include: {
        tasks: {
          orderBy: { dayNumber: 'asc' },
        },
      },
    });

    return sendSuccess(res, plans, 'Curated study plans retrieved');
  } catch (err: any) {
    return sendError(res, 'Failed to fetch curated plans', 500, err.message);
  }
}

