import { Response, NextFunction } from 'express';
import { SignalService } from '../services/signalService.js';
import { AuthRequest } from '../types/index.js';

/**
 * Controller for handling idea validation signal requests
 */
export class SignalController {
  /**
   * Handle toggling a validation signal on an idea
   *
   * @param req - Express request object with authenticated user ID
   * @param res - Express response object
   * @param next - Express next function for error handling
   *
   * @remarks
   * Route: POST /api/ideas/:id/signals
   * Requires authentication
   * Request body: { signalType }
   * Returns signal state
   */
  static async toggleSignal(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.userId) {
        throw new Error('User ID not found');
      }
      const userId = req.userId;
      const { id: ideaId } = req.params;
      const { signalType } = req.body;

      const result = await SignalService.toggleSignal(ideaId, userId, signalType);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handle retrieving all signals for an idea
   *
   * @param req - Express request object (optionally with authenticated user ID)
   * @param res - Express response object
   * @param next - Express next function for error handling
   *
   * @remarks
   * Route: GET /api/ideas/:id/signals
   * No authentication required (but includes user signals if authenticated)
   * Returns signal counts and user's signals
   */
  static async getIdeaSignals(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id: ideaId } = req.params;
      const userId = req.userId; // May be undefined if not authenticated

      const result = await SignalService.getIdeaSignals(ideaId, userId);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
