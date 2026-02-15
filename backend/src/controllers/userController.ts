import { Response } from 'express';
import { AuthRequest, ProfileSortMode, ActivityRange } from '../types/index.js';
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

      const result = await UserService.getUserByUsername(username, req.userId);

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

  /**
   * Handle retrieving validation summary for a user
   *
   * @param req - Express request object
   * @param res - Express response object
   *
   * @remarks
   * Route: GET /api/users/:username/validation-summary
   * No authentication required
   * Returns aggregated validation signals and next action recommendation
   */
  static async getValidationSummary(req: AuthRequest, res: Response) {
    try {
      const { username } = req.params;

      const result = await UserService.getValidationSummary(username);

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
        error: error.message || 'Failed to fetch validation summary',
      });
    }
  }

  /**
   * Handle retrieving user ideas with signal snapshots
   *
   * @param req - Express request object
   * @param res - Express response object
   *
   * @remarks
   * Route: GET /api/users/:username/ideas-with-signals
   * Query: ?page=1&limit=20&sort=needs_action|ready_to_build|newest|oldest|all
   * No authentication required
   * Returns ideas with embedded signal counts and validation state
   */
  static async getUserIdeasWithSignals(req: AuthRequest, res: Response) {
    try {
      const { username } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const sort = (req.query.sort as ProfileSortMode) || 'newest';

      const result = await UserService.getUserIdeasWithSignals(username, page, limit, sort);

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
        error: error.message || 'Failed to fetch user ideas with signals',
      });
    }
  }

  /**
   * Handle retrieving idea portfolio for a user
   *
   * @remarks
   * Route: GET /api/users/:username/idea-portfolio
   * Requires authentication (owner only)
   */
  static async getIdeaPortfolio(req: AuthRequest, res: Response) {
    try {
      const { username } = req.params;

      const result = await UserService.getIdeaPortfolio(username);

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
        error: error.message || 'Failed to fetch idea portfolio',
      });
    }
  }

  /**
   * Handle retrieving idea scorecard for a specific idea
   *
   * @remarks
   * Route: GET /api/users/:username/idea-scorecard/:ideaId
   * Requires authentication (owner only)
   */
  static async getIdeaScorecard(req: AuthRequest, res: Response) {
    try {
      const { username, ideaId } = req.params;

      const result = await UserService.getIdeaScorecard(username, ideaId);

      if (!result) {
        return res.status(404).json({
          success: false,
          error: 'Idea not found',
        });
      }

      return res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch idea scorecard',
      });
    }
  }

  /**
   * Handle retrieving analytics dashboard for a user
   *
   * @remarks
   * Route: GET /api/users/:username/analytics-dashboard
   * Requires authentication
   */
  static async getAnalyticsDashboard(req: AuthRequest, res: Response) {
    try {
      const { username } = req.params;
      const range = (req.query.range as ActivityRange) || '30d';

      const result = await UserService.getAnalyticsDashboard(username, range);

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
        error: error.message || 'Failed to fetch analytics dashboard',
      });
    }
  }

  /**
   * Handle retrieving analytics for a specific idea
   *
   * @remarks
   * Route: GET /api/users/:username/idea-analytics/:ideaId
   * Requires authentication
   */
  static async getIdeaAnalytics(req: AuthRequest, res: Response) {
    try {
      const { username, ideaId } = req.params;
      const range = (req.query.range as ActivityRange) || '30d';

      const result = await UserService.getIdeaAnalytics(username, ideaId, range);

      if (!result) {
        return res.status(404).json({
          success: false,
          error: 'Idea not found',
        });
      }

      return res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch idea analytics',
      });
    }
  }

}
