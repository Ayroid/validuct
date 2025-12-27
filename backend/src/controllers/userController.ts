import { Response } from 'express';
import { AuthRequest } from '../types/index.js';
import { UserService } from '../services/userService.js';

export class UserController {
  static async getUserProfile(req: AuthRequest, res: Response) {
    try {
      const { username } = req.params;

      const result = await UserService.getUserByUsername(username);

      if (!result) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
        });
      }

      return res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch user profile',
      });
    }
  }

  static async updateProfile(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId!;
      const { username, bio, profilePicture } = req.body;

      const user = await UserService.updateUserProfile(userId, {
        username,
        bio,
        profilePicture,
      });

      return res.json({
        success: true,
        data: { user },
      });
    } catch (error: any) {
      if (error.message === 'Username already taken') {
        return res.status(400).json({
          success: false,
          error: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to update profile',
      });
    }
  }

  static async getUserIdeas(req: AuthRequest, res: Response) {
    try {
      const { username } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const sort = (req.query.sort as 'newest' | 'oldest' | 'popular') || 'newest';

      const result = await UserService.getUserIdeas(username, page, limit, sort);

      if (!result) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
        });
      }

      return res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch user ideas',
      });
    }
  }

  static async pinIdea(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId!;
      const { id } = req.params;

      const result = await UserService.pinIdea(userId, id);

      return res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      if (
        error.message === 'Idea not found' ||
        error.message === 'Maximum 5 ideas can be pinned' ||
        error.message === 'Idea already pinned'
      ) {
        return res.status(400).json({
          success: false,
          error: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to pin idea',
      });
    }
  }

  static async unpinIdea(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId!;
      const { id } = req.params;

      await UserService.unpinIdea(userId, id);

      return res.status(204).send();
    } catch (error: any) {
      if (error.message === 'Idea is not pinned') {
        return res.status(400).json({
          success: false,
          error: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to unpin idea',
      });
    }
  }

  static async getPinnedIdeas(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId!;

      const pinnedIdeas = await UserService.getPinnedIdeas(userId);

      return res.json({
        success: true,
        data: {
          pinned_ideas: pinnedIdeas,
        },
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch pinned ideas',
      });
    }
  }
}
