import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../utils/jwt.js';
import { sendError } from '../utils/response.js';
import { prisma } from '../db.js';

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload & {
    studentProfile?: {
      id: string;
      fullName: string;
      targetExam: string;
      targetClass: string;
    } | null;
  };
}

export async function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return sendError(res, 'Authentication token required', 401);
  }

  try {
    const payload = verifyToken(token);
    
    // Fetch profile info if student
    let studentProfile = null;
    if (payload.role === 'STUDENT') {
      studentProfile = await prisma.studentProfile.findUnique({
        where: { userId: payload.userId },
        select: { id: true, fullName: true, targetExam: true, targetClass: true },
      });
      if (studentProfile) {
        payload.studentProfileId = studentProfile.id;
      }
    }

    req.user = {
      ...payload,
      studentProfile,
    };

    next();
  } catch (err: any) {
    return sendError(res, 'Invalid or expired session token', 401, err.message);
  }
}

export function requireRole(allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, 'Unauthorized', 401);
    }
    if (!allowedRoles.includes(req.user.role)) {
      return sendError(res, 'Forbidden: Insufficient privileges', 403);
    }
    next();
  };
}

