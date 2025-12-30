import { Request, Response, NextFunction } from 'express';
import { IdeaService } from '../services/ideaService.js';
import { AuthRequest } from '../types/index.js';
import { IdeaStatus } from '@prisma/client';

/**
 * Controller for handling idea-related HTTP requests
 */
export class IdeaController {
  /**
   * Handle creating a new idea
   *
   * @param req - Express request object with authenticated user ID
   * @param res - Express response object
   * @param next - Express next function for error handling
   *
   * @remarks
   * Route: POST /api/ideas
   * Requires authentication
   * Request body: { heading, description, status?, launchedLink? }
   * Returns 201 with created idea
   */
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

  /**
   * Handle retrieving a single idea by ID
   *
   * @param req - Express request object
   * @param res - Express response object
   * @param next - Express next function for error handling
   *
   * @remarks
   * Route: GET /api/ideas/:id
   * Optional authentication (includes user's vote if authenticated)
   * Returns idea with user information and vote status
   */
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

  /**
   * Handle retrieving ideas with pagination and filtering
   *
   * @param req - Express request object
   * @param res - Express response object
   * @param next - Express next function for error handling
   *
   * @remarks
   * Route: GET /api/ideas?timeline=new|trending|top&page=1&limit=20
   * Optional authentication (includes user's votes if authenticated)
   * Query parameters: timeline (required), page, limit
   * Returns paginated ideas with metadata
   */
  static async getIdeas(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { timeline, page, limit } = req.query;
      const userId = (req as AuthRequest).userId;

      if (!timeline || !['new', 'trending', 'top'].includes(timeline as string)) {
        res.status(400).json({
          success: false,
          error: 'Invalid or missing timeline parameter. Must be one of: new, trending, top',
        });
        return;
      }

      const result = await IdeaService.getIdeas({
        timeline: timeline as 'new' | 'trending' | 'top',
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

  /**
   * Handle retrieving all ideas for a specific user
   *
   * @param req - Express request object
   * @param res - Express response object
   * @param next - Express next function for error handling
   *
   * @remarks
   * Route: GET /api/users/:username/ideas?page=1&limit=20&sort=newest
   * No authentication required
   * Query parameters: page, limit, sort
   * Returns user's paginated ideas with metadata
   */
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

  /**
   * Handle updating an existing idea
   *
   * @param req - Express request object with authenticated user ID
   * @param res - Express response object
   * @param next - Express next function for error handling
   *
   * @remarks
   * Route: PUT /api/ideas/:id
   * Requires authentication and ownership
   * Request body: { heading?, description?, status?, launchedLink? }
   * Returns updated idea
   */
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

  /**
   * Handle deleting an idea
   *
   * @param req - Express request object with authenticated user ID
   * @param res - Express response object
   * @param next - Express next function for error handling
   *
   * @remarks
   * Route: DELETE /api/ideas/:id
   * Requires authentication and ownership
   * Returns 204 No Content on success
   */
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
