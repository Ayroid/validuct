import { z } from 'zod';

// Auth validation schemas
export const registerSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be at most 50 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// User validation schemas
export const updateUserSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(50)
    .regex(/^[a-zA-Z0-9_]+$/)
    .optional(),
  bio: z.string().max(500).optional(),
  profilePicture: z.string().url().optional(),
});

// Idea validation schemas
export const createIdeaSchema = z.object({
  heading: z.string().min(1).max(200, 'Heading must be at most 200 characters'),
  description: z.string().min(1, 'Description is required'),
  status: z.enum(['DRAFT', 'VALIDATED', 'WIP', 'LAUNCHED']).optional(),
  launchedLink: z.string().url().optional(),
});

export const updateIdeaSchema = z.object({
  heading: z.string().min(1).max(200).optional(),
  description: z.string().min(1).optional(),
  status: z.enum(['DRAFT', 'VALIDATED', 'WIP', 'LAUNCHED']).optional(),
  launchedLink: z.string().url().optional(),
});

// Vote validation schemas
export const voteSchema = z.object({
  voteType: z.enum(['UPVOTE', 'DOWNVOTE']),
});

// Comment validation schemas
export const createCommentSchema = z.object({
  content: z.string().min(1, 'Content is required'),
  parentCommentId: z.string().uuid().optional(),
});

export const updateCommentSchema = z.object({
  content: z.string().min(1, 'Content is required'),
});
