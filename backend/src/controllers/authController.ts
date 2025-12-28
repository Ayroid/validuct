import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService.js';
import { AuthRequest } from '../types/index.js';

export class AuthController {
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

  static async oauth(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, username, profilePicture, provider } = req.body;
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
