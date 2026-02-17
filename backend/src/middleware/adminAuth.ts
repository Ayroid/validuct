import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/index.js';
import { prisma } from '../config/database.js';
import { AppError } from './errorHandler.js';

/**
 * Admin authorization middleware
 * Must run after `protect` middleware (requires req.userId)
 * Returns 404 instead of 403 so non-admins can't detect the route exists
 */
export const requireAdmin = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.userId) {
      throw new AppError('Not found', 404);
    }

    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { isAdmin: true },
    });

    if (!user?.isAdmin) {
      throw new AppError('Not found', 404);
    }

    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError('Not found', 404));
    }
  }
};
