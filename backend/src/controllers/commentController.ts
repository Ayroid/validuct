import { Request, Response, NextFunction } from 'express';
import { CommentService } from '../services/commentService.js';
import { AuthRequest } from '../types/index.js';

/**
 * Controller for handling comment-related HTTP requests
 */
export class CommentController {
  /**
   * Handle creating a new comment or reply
   *
   * @param req - Express request object with authenticated user ID
   * @param res - Express response object
   * @param next - Express next function for error handling
   *
   * @remarks
   * Route: POST /api/ideas/:id/comments
   * Requires authentication
   * Request body: { content, parentCommentId? }
   * Returns 201 with created comment
   */
  static async createComment(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.userId) {
        throw new Error('User ID not found');
      }
      const userId = req.userId;
      const { id: ideaId } = req.params;
      const { content, parentCommentId, category } = req.body;

      const comment = await CommentService.createComment(userId, ideaId, {
        content,
        parentCommentId,
        category: category ?? 'GENERAL',
      });

      res.status(201).json({
        success: true,
        data: {
          comment,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handle retrieving all comments for an idea
   *
   * @param req - Express request object
   * @param res - Express response object
   * @param next - Express next function for error handling
   *
   * @remarks
   * Route: GET /api/ideas/:id/comments?page=1&limit=50
   * No authentication required
   * Query parameters: page, limit
   * Returns nested comment tree with pagination metadata
   */
  static async getIdeaComments(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id: ideaId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;

      const result = await CommentService.getIdeaComments({
        ideaId,
        page,
        limit,
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
   * Handle retrieving a single comment by ID
   *
   * @param req - Express request object
   * @param res - Express response object
   * @param next - Express next function for error handling
   *
   * @remarks
   * Route: GET /api/comments/:id
   * No authentication required
   * Returns comment with user information and direct replies
   */
  static async getComment(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id: commentId } = req.params;

      const comment = await CommentService.getCommentById(commentId);

      res.status(200).json({
        success: true,
        data: {
          comment,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handle updating an existing comment
   *
   * @param req - Express request object with authenticated user ID
   * @param res - Express response object
   * @param next - Express next function for error handling
   *
   * @remarks
   * Route: PUT /api/comments/:id
   * Requires authentication and ownership
   * Request body: { content }
   * Returns updated comment
   */
  static async updateComment(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.userId) {
        throw new Error('User ID not found');
      }
      const userId = req.userId;
      const { id: commentId } = req.params;
      const { content } = req.body;

      const comment = await CommentService.updateComment(commentId, userId, {
        content,
      });

      res.status(200).json({
        success: true,
        data: {
          comment,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handle deleting a comment and all its nested replies
   *
   * @param req - Express request object with authenticated user ID
   * @param res - Express response object
   * @param next - Express next function for error handling
   *
   * @remarks
   * Route: DELETE /api/comments/:id
   * Requires authentication and ownership
   * Returns 204 No Content on success
   * Deletes comment and all nested replies
   */
  static async deleteComment(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.userId) {
        throw new Error('User ID not found');
      }
      const userId = req.userId;
      const { id: commentId } = req.params;

      await CommentService.deleteComment(commentId, userId);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handle toggling helpful status on a comment
   *
   * @param req - Express request object with authenticated user ID
   * @param res - Express response object
   * @param next - Express next function for error handling
   *
   * @remarks
   * Route: POST /api/comments/:id/helpful
   * Requires authentication
   * Returns helpful state and count
   */
  static async toggleHelpful(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.userId) {
        throw new Error('User ID not found');
      }
      const userId = req.userId;
      const { id: commentId } = req.params;

      const result = await CommentService.toggleHelpful(commentId, userId);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
