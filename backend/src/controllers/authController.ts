import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService.js';
import { AuthRequest } from '../types/index.js';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { username, email, password } = req.body;
      const result = await AuthService.register({ username, email, password });

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login({ email, password });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

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
