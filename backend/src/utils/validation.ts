import { z } from 'zod';

// Auth validation schemas
export const oauthSchema = z.object({
  email: z.string().email('Invalid email address'),
  username: z.string().min(1, 'Username is required'),
  profilePicture: z.string().url().optional().nullable(),
  provider: z.enum(['google', 'github', 'facebook']),
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
  vote_type: z.enum(['upvote', 'downvote']),
});

// Comment validation schemas
export const createCommentSchema = z.object({
  content: z.string().min(1, 'Content is required'),
  parentCommentId: z.string().uuid().optional(),
});

export const updateCommentSchema = z.object({
  content: z.string().min(1, 'Content is required'),
});
