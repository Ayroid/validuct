import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/index.js';
import { EmailQueueService } from '../services/emailQueueService.js';
import { EmailStatus } from '../../prisma/client/client.js';

export class EmailController {
  static async getAllEmailQueue(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const page   = parseInt(req.query.page  as string) || 1;
      const limit  = parseInt(req.query.limit as string) || 20;
      const status = req.query.status as string | undefined;

      const validStatuses = ['PENDING', 'SENT', 'FAILED'];
      const statusFilter = status && validStatuses.includes(status)
        ? status as EmailStatus
        : undefined;

      const result = await EmailQueueService.getAllEmailQueue(page, limit, statusFilter);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async getEmailQueueStats(_req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const stats = await EmailQueueService.getEmailQueueStats();
      res.status(200).json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  }

  static async retryEmail(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const entry = await EmailQueueService.retryEmailQueueEntry(req.params.id);
      res.status(200).json({ success: true, data: { entry } });
    } catch (error) {
      next(error);
    }
  }

  static async deleteEmailQueueEntry(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await EmailQueueService.deleteEmailQueueEntry(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
