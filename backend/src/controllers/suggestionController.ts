import { Response, NextFunction } from 'express';
import { SuggestionService } from '../services/suggestionService.js';
import { AuthRequest } from '../types/index.js';

export class SuggestionController {
  static async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.userId) {
        throw new Error('User ID not found');
      }

      const { type, suggestion } = req.body;
      const createdSuggestion = await SuggestionService.createSuggestion(req.userId, {
        type,
        suggestion,
      });

      res.status(201).json({
        success: true,
        data: { suggestion: createdSuggestion },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getApproved(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await SuggestionService.getApprovedSuggestions(page, limit);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getMine(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.userId) {
        throw new Error('User ID not found');
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await SuggestionService.getUserSuggestions(req.userId, page, limit);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const status = req.query.status as string | undefined;

      const validStatuses = ['PENDING', 'APPROVED', 'REJECTED'];
      const filterStatus = status && validStatuses.includes(status) ? (status as 'PENDING' | 'APPROVED' | 'REJECTED') : undefined;

      const result = await SuggestionService.getAllSuggestions(page, limit, filterStatus);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const suggestion = await SuggestionService.updateSuggestionStatus(id, status);

      res.status(200).json({
        success: true,
        data: { suggestion },
      });
    } catch (error) {
      next(error);
    }
  }
}
