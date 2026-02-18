import { Response, NextFunction } from 'express';
import { AuthRequest, ProfileSortMode, ActivityRange } from '../types/index.js';
import { UserService } from '../services/userService.js';
import { ValidationService } from '../services/validationService.js';
import { AnalyticsService } from '../services/analyticsService.js';

/**
 * Controller for handling user-related HTTP requests
 */
export class UserController {
  /**
   * Handle retrieving all users (admin only)
   *
   * @param req - Express request object with authenticated user ID
   * @param res - Express response object
   * @param next - Express next function
   *
   * @remarks
   * Route: GET /api/users/all?page=1&limit=20
   * Requires authentication and admin role
   * Query parameters: page, limit
   * Returns paginated list of users with metadata
   */

  static async getAllUsers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const userType = req.query.userType as string;
      const sort = req.query.sort as string;

      const userTypes = ['REAL', 'DUMMY'];
      const filterUsers = userType && userTypes.includes(userType) ? userType as 'REAL' | 'DUMMY' : undefined;

      const validSorts = ['newest', 'oldest', 'most_ideas', 'least_ideas'];
      const sortParam = sort && validSorts.includes(sort) ? sort as 'newest' | 'oldest' | 'most_ideas' | 'least_ideas' : 'newest';

      const result = await UserService.getAllUsers(page, limit, filterUsers, sortParam);

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Handle retrieving a user's profile by username
   *
   * @param req - Express request object
   * @param res - Express response object
   * @param next - Express next function
   *
   * @remarks
   * Route: GET /api/users/:username
   * No authentication required
   * Returns user profile with ideas count and pinned ideas
   */
  static async getUserProfile(req: AuthRequest, res: Response, next: NextFunction) {
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
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Handle updating the authenticated user's profile
   *
   * @param req - Express request object with authenticated user ID
   * @param res - Express response object
   * @param next - Express next function
   *
   * @remarks
   * Route: PUT /api/users/profile
   * Requires authentication
   * Request body: { username?, bio?, profilePicture? }
   * Returns updated user profile
   */
  static async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
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
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Handle retrieving all ideas for a specific user
   *
   * @param req - Express request object
   * @param res - Express response object
   * @param next - Express next function
   *
   * @remarks
   * Route: GET /api/users/:username/ideas?page=1&limit=20&sort=newest
   * No authentication required
   * Query parameters: page, limit, sort
   * Returns user's paginated ideas with metadata
   */
  static async getUserIdeas(req: AuthRequest, res: Response, next: NextFunction) {
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
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Handle pinning an idea to the authenticated user's profile
   *
   * @param req - Express request object with authenticated user ID
   * @param res - Express response object
   * @param next - Express next function
   *
   * @remarks
   * Route: POST /api/users/pinned-ideas/:id
   * Requires authentication
   * Maximum 5 pinned ideas per user
   * Returns pinned status
   */
  static async pinIdea(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const { id } = req.params;

      const result = await UserService.pinIdea(userId, id);

      return res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Handle unpinning an idea from the authenticated user's profile
   *
   * @param req - Express request object with authenticated user ID
   * @param res - Express response object
   * @param next - Express next function
   *
   * @remarks
   * Route: DELETE /api/users/pinned-ideas/:id
   * Requires authentication
   * Returns 204 No Content on success
   */
  static async unpinIdea(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const { id } = req.params;

      await UserService.unpinIdea(userId, id);

      return res.status(204).send();
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Handle retrieving the authenticated user's pinned ideas
   *
   * @param req - Express request object with authenticated user ID
   * @param res - Express response object
   * @param next - Express next function
   *
   * @remarks
   * Route: GET /api/users/pinned-ideas
   * Requires authentication
   * Returns array of pinned ideas ordered by pin order
   */
  static async getPinnedIdeas(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;

      const pinnedIdeas = await UserService.getPinnedIdeas(userId);

      return res.json({
        success: true,
        data: {
          pinned_ideas: pinnedIdeas,
        },
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Handle retrieving validation summary for a user
   *
   * @param req - Express request object
   * @param res - Express response object
   * @param next - Express next function
   *
   * @remarks
   * Route: GET /api/users/:username/validation-summary
   * No authentication required
   * Returns aggregated validation signals and next action recommendation
   */
  static async getValidationSummary(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { username } = req.params;

      const result = await ValidationService.getValidationSummary(username);

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
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Handle retrieving user ideas with signal snapshots
   *
   * @param req - Express request object
   * @param res - Express response object
   * @param next - Express next function
   *
   * @remarks
   * Route: GET /api/users/:username/ideas-with-signals
   * Query: ?page=1&limit=20&sort=needs_action|ready_to_build|newest|oldest|all
   * No authentication required
   * Returns ideas with embedded signal counts and validation state
   */
  static async getUserIdeasWithSignals(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { username } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const sort = (req.query.sort as ProfileSortMode) || 'newest';

      const result = await ValidationService.getUserIdeasWithSignals(username, page, limit, sort);

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
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Handle retrieving idea portfolio for a user
   *
   * @remarks
   * Route: GET /api/users/:username/idea-portfolio
   * Requires authentication (owner only)
   */
  static async getIdeaPortfolio(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { username } = req.params;

      const result = await AnalyticsService.getIdeaPortfolio(username);

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
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Handle retrieving idea scorecard for a specific idea
   *
   * @remarks
   * Route: GET /api/users/:username/idea-scorecard/:ideaId
   * Requires authentication (owner only)
   */
  static async getIdeaScorecard(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { username, ideaId } = req.params;

      const result = await AnalyticsService.getIdeaScorecard(username, ideaId);

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
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Handle retrieving analytics dashboard for a user
   *
   * @remarks
   * Route: GET /api/users/:username/analytics-dashboard
   * Requires authentication
   */
  static async getAnalyticsDashboard(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { username } = req.params;
      const range = (req.query.range as ActivityRange) || '30d';

      const result = await AnalyticsService.getAnalyticsDashboard(username, range);

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
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Handle retrieving analytics for a specific idea
   *
   * @remarks
   * Route: GET /api/users/:username/idea-analytics/:ideaId
   * Requires authentication
   */
  static async getIdeaAnalytics(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { username, ideaId } = req.params;
      const range = (req.query.range as ActivityRange) || '30d';

      const result = await AnalyticsService.getIdeaAnalytics(username, ideaId, range);

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
    } catch (error) {
      return next(error);
    }
  }
}
