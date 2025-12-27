import { Request, Response, NextFunction } from 'express';
import { IdeaService } from '../services/ideaService.js';
import { AuthRequest } from '../types/index.js';
import { IdeaStatus } from '@prisma/client';

export class IdeaController {
  static async createIdea(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.userId) {
        throw new Error('User ID not found');
      }

      const { heading, description, status, launchedLink } = req.body;

      const idea = await IdeaService.createIdea(req.userId, {
        heading,
        description,
        status: status as IdeaStatus,
        launchedLink,
      });

      res.status(201).json({
        success: true,
        data: { idea },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getIdeaById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as AuthRequest).userId;

      const idea = await IdeaService.getIdeaById(id, userId);

      res.status(200).json({
        success: true,
        data: { idea },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getIdeas(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { timeline, page, limit } = req.query;
      const userId = (req as AuthRequest).userId;

      if (!timeline || !['hot', 'new', 'trending'].includes(timeline as string)) {
        res.status(400).json({
          success: false,
          error: 'Invalid or missing timeline parameter. Must be one of: hot, new, trending',
        });
        return;
      }

      const result = await IdeaService.getIdeas({
        timeline: timeline as 'hot' | 'new' | 'trending',
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        userId,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getUserIdeas(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { username } = req.params;
      const { page, limit, sort } = req.query;

      const result = await IdeaService.getUserIdeas({
        username,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        sort: sort as 'newest' | 'oldest' | 'popular',
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateIdea(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.userId) {
        throw new Error('User ID not found');
      }

      const { id } = req.params;
      const { heading, description, status, launchedLink } = req.body;

      const idea = await IdeaService.updateIdea(id, req.userId, {
        heading,
        description,
        status: status as IdeaStatus,
        launchedLink,
      });

      res.status(200).json({
        success: true,
        data: { idea },
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteIdea(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.userId) {
        throw new Error('User ID not found');
      }

      const { id } = req.params;

      await IdeaService.deleteIdea(id, req.userId);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
