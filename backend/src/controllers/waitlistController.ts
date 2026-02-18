import { Request, Response, NextFunction } from 'express';
import { WaitlistService } from '../services/waitlistService.js';
import { AuthRequest } from '../types/index.js';

export class WaitlistController {
  static async joinWaitlist(req: Request, res: Response): Promise<void> {
    const { email } = req.body;
    await WaitlistService.addToWaitlist({ email });
    res.status(200).json({ success: true, message: 'Successfully joined the waitlist' });
  }

  // ── Admin-only ──────────────────────────────────────────────────────────────

  static async getMainWaitlistAdmin(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const page  = parseInt(req.query.page  as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const result = await WaitlistService.getMainWaitlistAdmin(page, limit);
      res.status(200).json({ success: true, data: result });
    } catch (error) { next(error); }
  }

  static async getAllIdeaWaitlistsAdmin(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const page   = parseInt(req.query.page   as string) || 1;
      const limit  = parseInt(req.query.limit  as string) || 50;
      const ideaId = req.query.ideaId as string | undefined;
      const result = await WaitlistService.getAllIdeaWaitlistsAdmin(page, limit, ideaId);
      res.status(200).json({ success: true, data: result });
    } catch (error) { next(error); }
  }

  static async removeFromMainWaitlist(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await WaitlistService.removeFromMainWaitlist(req.params.id);
      res.status(204).send();
    } catch (error) { next(error); }
  }

  static async removeFromIdeaWaitlist(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await WaitlistService.removeFromIdeaWaitlist(req.params.id);
      res.status(204).send();
    } catch (error) { next(error); }
  }
}
