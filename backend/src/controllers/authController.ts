import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService.js';
import { AuthRequest } from '../types/index.js';

/**
 * Controller for handling authentication-related HTTP requests
 */
export class AuthController {
  /**
   * Handle retrieving the current authenticated user's information
   *
   * @param req - Express request object with authenticated user ID
   * @param res - Express response object
   * @param next - Express next function for error handling
   *
   * @remarks
   * Route: GET /api/auth/me
   * Requires authentication
   * Returns current user's profile information
   */
  static async getCurrentUser(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.userId) {
        throw new Error('User ID not found');
      }

      const user = await AuthService.getCurrentUser(req.userId);

      res.status(200).json({
        success: true,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handle OAuth authentication (login or registration)
   *
   * @param req - Express request object
   * @param res - Express response object
   * @param next - Express next function for error handling
   *
   * @remarks
   * Route: POST /api/auth/oauth
   * No authentication required
   * Request body: { email, username, profilePicture?, provider }
   * Returns user information and JWT token
   * Creates new user if email doesn't exist, otherwise logs in existing user
   */
  static async oauth(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, username, profilePicture, provider } = req.body;

      console.log('AuthController.oauth called with:', {
        email,
        username,
        profilePicture,
        provider,
      });

      const result = await AuthService.oauth({ email, username, profilePicture, provider });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
