import { Response, NextFunction } from 'express';
import { VoteService } from '../services/voteService.js';
import { AuthRequest } from '../types/index.js';
import { VoteType } from '@prisma/client';

/**
 * Controller for handling vote-related HTTP requests
 */
export class VoteController {
  /**
   * Handle voting on an idea (upvote or downvote)
   *
   * @param req - Express request object with authenticated user ID
   * @param res - Express response object
   * @param next - Express next function for error handling
   *
   * @remarks
   * Route: POST /api/ideas/:id/vote
   * Requires authentication
   * Request body: { vote_type: 'upvote' | 'downvote' }
   * Returns updated vote status and vote counts
   */
  static async voteOnIdea(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.userId) {
        throw new Error('User ID not found');
      }

      const { id } = req.params;
      const { vote_type } = req.body;

      // Convert vote_type string to VoteType enum
      const voteType = vote_type === 'upvote' ? VoteType.UPVOTE : VoteType.DOWNVOTE;

      const result = await VoteService.voteOnIdea(req.userId, id, voteType);

      res.status(200).json({
        success: true,
        data: {
          vote: {
            vote_type: result.voteType ? result.voteType.toLowerCase() : null,
          },
          upvotes_count: result.upvotesCount,
          downvotes_count: result.downvotesCount,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
