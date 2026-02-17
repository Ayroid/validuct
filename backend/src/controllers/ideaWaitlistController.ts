import { Response, NextFunction, Request } from 'express';
import { IdeaWaitlistService } from '../services/ideaWaitlistService.js';
import { AuthRequest } from '../types/index.js';

/**
 * Controller for handling idea waitlist requests
 */
export class IdeaWaitlistController {
  /**
   * Handle joining the waitlist for an idea
   *
   * @remarks
   * Route: POST /api/v1/ideas/:ideaId/waitlist
   * No authentication required (public endpoint)
   * Request body: { email }
   * Returns success status
   */
  static async joinWaitlist(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { ideaId } = req.params;
      const { email } = req.body;

      const result = await IdeaWaitlistService.joinWaitlist(ideaId, email);

      res.status(201).json({
        success: true,
        data: result,
        message: 'Successfully joined the waitlist',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handle retrieving waitlist statistics for an idea
   *
   * @remarks
   * Route: GET /api/v1/ideas/:ideaId/waitlist
   * No authentication required (but includes access token if owner)
   * Returns count and access token for owner
   */
  static async getWaitlistStats(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { ideaId } = req.params;
      const userId = req.userId; // May be undefined if not authenticated

      const result = await IdeaWaitlistService.getWaitlistStats(ideaId, userId);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handle retrieving paginated waitlist by access token (owner only)
   *
   * @remarks
   * Route: GET /api/v1/ideas/:ideaId/waitlist/:accessToken
   * Query params: page, limit
   * Requires authentication
   * Returns paginated waitlist data
   */
  static async getWaitlistByToken(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { ideaId, accessToken } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);

      const result = await IdeaWaitlistService.getWaitlistByToken(
        ideaId,
        accessToken,
        req.userId!,
        page,
        limit
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handle retrieving all waitlist emails for export (owner only)
   *
   * @remarks
   * Route: GET /api/v1/ideas/:ideaId/waitlist/:accessToken/export
   * Requires authentication
   * Returns all emails for copy/download
   */
  static async getAllWaitlistEmails(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { ideaId, accessToken } = req.params;

      const result = await IdeaWaitlistService.getAllWaitlistEmails(ideaId, accessToken, req.userId!);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getWaitlistEntries(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { ideaId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);

      const result = await IdeaWaitlistService.getWaitlistEntries(ideaId, req.userId!, page, limit);

      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async exportWaitlistEmails(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { ideaId } = req.params;

      const result = await IdeaWaitlistService.exportWaitlistEmails(ideaId, req.userId!);

      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}
