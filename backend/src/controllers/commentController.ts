import { Request, Response, NextFunction } from 'express';
import { CommentService } from '../services/commentService.js';
import { AuthRequest } from '../types/index.js';

export class CommentController {
  // Create a comment
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
      const { content, parentCommentId } = req.body;

      const comment = await CommentService.createComment(userId, ideaId, {
        content,
        parentCommentId,
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

  // Get comments for an idea
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

  // Get a single comment
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

  // Update a comment
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

  // Delete a comment
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
}
