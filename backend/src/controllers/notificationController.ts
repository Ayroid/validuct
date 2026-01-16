import { Response, NextFunction } from 'express';
import { NotificationService } from '../services/notificationService.js';
import { AuthRequest } from '../types/index.js';

export class NotificationController {
  // Get user's notifications
  static async getNotifications(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.userId) {
        throw new Error('User ID not found');
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await NotificationService.getUserNotifications(req.userId, page, limit);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get unread count
  static async getUnreadCount(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.userId) {
        throw new Error('User ID not found');
      }

      const count = await NotificationService.getUnreadCount(req.userId);

      res.status(200).json({
        success: true,
        data: { unreadCount: count },
      });
    } catch (error) {
      next(error);
    }
  }

  // Mark single notification as read
  static async markAsRead(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.userId) {
        throw new Error('User ID not found');
      }

      const { id } = req.params;
      await NotificationService.markAsRead(id, req.userId);

      res.status(200).json({
        success: true,
        message: 'Notification marked as read',
      });
    } catch (error) {
      next(error);
    }
  }

  // Mark all as read
  static async markAllAsRead(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.userId) {
        throw new Error('User ID not found');
      }

      await NotificationService.markAllAsRead(req.userId);

      res.status(200).json({
        success: true,
        message: 'All notifications marked as read',
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete notification
  static async deleteNotification(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.userId) {
        throw new Error('User ID not found');
      }

      const { id } = req.params;
      await NotificationService.deleteNotification(id, req.userId);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  // Get preferences
  static async getPreferences(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.userId) {
        throw new Error('User ID not found');
      }

      const prefs = await NotificationService.getOrCreatePreferences(req.userId);

      res.status(200).json({
        success: true,
        data: prefs,
      });
    } catch (error) {
      next(error);
    }
  }

  // Update preferences
  static async updatePreferences(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.userId) {
        throw new Error('User ID not found');
      }

      const prefs = await NotificationService.updatePreferences(req.userId, req.body);

      res.status(200).json({
        success: true,
        data: prefs,
      });
    } catch (error) {
      next(error);
    }
  }
}
