import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/index.js';
import { verifyToken } from '../utils/jwt.js';
import { AppError } from './errorHandler.js';

/**
 * Authentication middleware that requires a valid JWT token
 *
 * @param req - Express request object
 * @param _res - Express response object (unused)
 * @param next - Express next function
 * @throws {AppError} If no token is provided or token is invalid (401)
 *
 * @remarks
 * Extracts JWT token from Authorization header (format: "Bearer <token>")
 * Verifies the token and attaches userId to the request object
 * Use this middleware for routes that require authentication
 */
export const protect = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new AppError('Not authorized to access this route', 401);
    }

    // Verify token
    const decoded = verifyToken(token);
    req.userId = decoded.userId;

    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError('Not authorized to access this route', 401));
    }
  }
};

/**
 * Optional authentication middleware that attaches userId if valid token is present
 *
 * @param req - Express request object
 * @param _res - Express response object (unused)
 * @param next - Express next function
 *
 * @remarks
 * Extracts JWT token from Authorization header (format: "Bearer <token>")
 * If token is valid, attaches userId to the request object
 * If no token or invalid token, continues without setting userId
 * Use this middleware for routes that work for both authenticated and non-authenticated users
 */
export const optionalProtect = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // If no token, just continue without setting userId
    if (!token) {
      return next();
    }

    // Try to verify token, but don't fail if it's invalid
    try {
      const decoded = verifyToken(token);
      req.userId = decoded.userId;
    } catch {
      // Invalid token, continue without userId
    }

    next();
  } catch (error) {
    next(error);
  }
};
