import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Valid email address required'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  fullName: z.string().min(2, 'Full name is required'),
  targetExam: z.enum(['NEET', 'JEE_MAIN', 'JEE_ADVANCED']).default('NEET'),
  targetClass: z.enum(['CLASS_11', 'CLASS_12', 'BOTH']).default('CLASS_11'),
});

export const loginSchema = z.object({
  email: z.string().email('Valid email address required'),
  password: z.string().min(1, 'Password is required'),
});

export const updateProfileSchema = z.object({
  fullName: z.string().min(2).optional(),
  targetExam: z.enum(['NEET', 'JEE_MAIN', 'JEE_ADVANCED']).optional(),
  targetClass: z.enum(['CLASS_11', 'CLASS_12', 'BOTH']).optional(),
  avatarUrl: z.string().url().optional().nullable(),
});

