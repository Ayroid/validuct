import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

/**
 * Custom error class for operational errors in the application
 *
 * @remarks
 * Used to create errors with specific HTTP status codes
 * The isOperational flag distinguishes expected errors from programming errors
 */
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  /**
   * Create a new AppError
   *
   * @param message - Error message to display
   * @param statusCode - HTTP status code (default: 500)
   */
  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global error handling middleware
 *
 * @param err - Error object (AppError, ZodError, or generic Error)
 * @param _req - Express request object (unused)
 * @param res - Express response object
 * @param _next - Express next function (unused)
 *
 * @remarks
 * Handles different types of errors:
 * - AppError: Custom application errors with specific status codes
 * - ZodError: Validation errors from Zod schema validation
 * - PrismaClientKnownRequestError: Database errors from Prisma
 * - Generic errors: Fallback to 500 Internal Server Error
 *
 * In development mode, includes error stack traces in response
 */
export const errorHandler = (
  err: Error | AppError | ZodError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = 500;
  let message = 'Internal Server Error';

  // Handle custom AppError
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  }

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    statusCode = 400;
    message = 'Validation Error';
    res.status(statusCode).json({
      success: false,
      error: message,
      details: err.errors,
    });
    return;
  }

  // Handle Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    statusCode = 400;
    message = 'Database Error';
  }

  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', err);
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

/**
 * Middleware for handling 404 Not Found errors
 *
 * @param req - Express request object
 * @param res - Express response object
 *
 * @remarks
 * Returns a 404 error with the requested URL
 * Use this middleware as the last route handler to catch all undefined routes
 */
export const notFound = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    error: `Route ${req.originalUrl} not found`,
  });
};
