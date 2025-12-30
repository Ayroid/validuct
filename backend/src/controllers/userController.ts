import { Response } from 'express';
import { AuthRequest } from '../types/index.js';
import { UserService } from '../services/userService.js';

/**
 * Controller for handling user-related HTTP requests
 */
export class UserController {
  /**
   * Handle retrieving a user's profile by username
   *
   * @param req - Express request object
   * @param res - Express response object
   *
   * @remarks
   * Route: GET /api/users/:username
   * No authentication required
   * Returns user profile with ideas count and pinned ideas
   */
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

  /**
   * Handle updating the authenticated user's profile
   *
   * @param req - Express request object with authenticated user ID
   * @param res - Express response object
   *
   * @remarks
   * Route: PUT /api/users/profile
   * Requires authentication
   * Request body: { username?, bio?, profilePicture? }
   * Returns updated user profile
   */
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

  /**
   * Handle retrieving all ideas for a specific user
   *
   * @param req - Express request object
   * @param res - Express response object
   *
   * @remarks
   * Route: GET /api/users/:username/ideas?page=1&limit=20&sort=newest
   * No authentication required
   * Query parameters: page, limit, sort
   * Returns user's paginated ideas with metadata
   */
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

  /**
   * Handle pinning an idea to the authenticated user's profile
   *
   * @param req - Express request object with authenticated user ID
   * @param res - Express response object
   *
   * @remarks
   * Route: POST /api/users/pinned-ideas/:id
   * Requires authentication
   * Maximum 5 pinned ideas per user
   * Returns pinned status
   */
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

  /**
   * Handle unpinning an idea from the authenticated user's profile
   *
   * @param req - Express request object with authenticated user ID
   * @param res - Express response object
   *
   * @remarks
   * Route: DELETE /api/users/pinned-ideas/:id
   * Requires authentication
   * Returns 204 No Content on success
   */
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

  /**
   * Handle retrieving the authenticated user's pinned ideas
   *
   * @param req - Express request object with authenticated user ID
   * @param res - Express response object
   *
   * @remarks
   * Route: GET /api/users/pinned-ideas
   * Requires authentication
   * Returns array of pinned ideas ordered by pin order
   */
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
