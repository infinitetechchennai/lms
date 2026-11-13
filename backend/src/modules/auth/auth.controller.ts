import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../../db.js';
import { generateToken } from '../../utils/jwt.js';
import { sendSuccess, sendError } from '../../utils/response.js';
import { AuthenticatedRequest } from '../../middleware/auth.js';

export async function register(req: Request, res: Response) {
  try {
    const { email, password, fullName, targetExam, targetClass } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return sendError(res, 'An account with this email already exists', 409);
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        role: 'STUDENT',
        isVerified: true,
        studentProfile: {
          create: {
            fullName,
            targetExam,
            targetClass,
            streakDays: 1,
            totalStudyMinutes: 0,
          },
        },
      },
      include: {
        studentProfile: true,
      },
    });

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      studentProfileId: user.studentProfile?.id,
    });

    return sendSuccess(
      res,
      {
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          profile: user.studentProfile,
        },
      },
      'Registration successful',
      201
    );
  } catch (err: any) {
    return sendError(res, 'Failed to register student', 500, err.message);
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        studentProfile: true,
        adminProfile: true,
      },
    });

    if (!user) {
      return sendError(res, 'Invalid email or password', 401);
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return sendError(res, 'Invalid email or password', 401);
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      studentProfileId: user.studentProfile?.id,
    });

    return sendSuccess(
      res,
      {
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          profile: user.role === 'ADMIN' ? user.adminProfile : user.studentProfile,
        },
      },
      'Login successful'
    );
  } catch (err: any) {
    return sendError(res, 'Failed to login', 500, err.message);
  }
}

export async function getCurrentUser(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return sendError(res, 'Unauthorized', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: {
        studentProfile: true,
        adminProfile: true,
      },
    });

    if (!user) {
      return sendError(res, 'User record not found', 404);
    }

    return sendSuccess(res, {
      id: user.id,
      email: user.email,
      role: user.role,
      profile: user.role === 'ADMIN' ? user.adminProfile : user.studentProfile,
    });
  } catch (err: any) {
    return sendError(res, 'Failed to retrieve profile', 500, err.message);
  }
}

export async function updateProfile(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user || !req.user.studentProfileId) {
      return sendError(res, 'Student profile not found', 404);
    }

    const { fullName, targetExam, targetClass, avatarUrl } = req.body;

    const updatedProfile = await prisma.studentProfile.update({
      where: { id: req.user.studentProfileId },
      data: {
        ...(fullName && { fullName }),
        ...(targetExam && { targetExam }),
        ...(targetClass && { targetClass }),
        ...(avatarUrl !== undefined && { avatarUrl }),
      },
    });

    return sendSuccess(res, updatedProfile, 'Profile updated successfully');
  } catch (err: any) {
    return sendError(res, 'Failed to update profile', 500, err.message);
  }
}

